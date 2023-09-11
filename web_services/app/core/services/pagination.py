# Standard Library
import base64
from abc import abstractmethod
from typing import Any, Callable, Generic, Self, TypeVar, cast, overload
from uuid import UUID

# Third Party
from pydantic import Base64Str
from sqlalchemy import BinaryExpression, ColumnElement, String, and_
from sqlalchemy import cast as sa_cast
from sqlalchemy import inspect as sa_inspect
from sqlalchemy import literal, or_
from sqlalchemy.orm import Query, Session
from sqlalchemy.orm.query import RowReturningQuery
from sqlalchemy.sql.expression import asc, desc

# First Party
from app.core.logging.logger import get_app_logger
from app.core.models.base import Base
from app.core.schemas.base import BaseModel
from app.core.utils import iso_format_date

__all__ = ("PageBuilder",)

ModelT = TypeVar("ModelT", bound=Base)
FilterT = TypeVar("FilterT", bound=BaseModel)
RowT = TypeVar("RowT", bound=tuple[Any, ...])
SkimThroughQueryT = TypeVar("SkimThroughQueryT", bound=Query[Any])


logger = get_app_logger(__name__)


class Page(Generic[ModelT]):
    def __init__(
        self,
        title: str = "Untitled",
        *,
        main_query: Query[ModelT],
        object_count_query: RowReturningQuery[tuple[UUID]],
        has_more_query_factory: Callable[[str, str], RowReturningQuery[tuple[int, bool, bool]]],
    ):
        """A representation of a page of specific objects of a model, `ModelT`"""
        self.title = title
        self.read_size: int

        self._main_query = main_query
        self._object_count_query = object_count_query
        self._has_more_query_factory = has_more_query_factory
        self._cursor_isset = False
        self._has_more_have_been_queried = False
        self._top_cursor: str | None
        self._bottom_cursor: str | None
        self._total_size: int
        self._has_prev: bool
        self._has_next: bool

    def _register_cursors_from_read_pages(self, read_pages: list[ModelT]):
        # Sort objects by their cursor key (`created_at`) which ensures
        # ordering is as default irrespective of the `ORDER BY` statement
        # used in the original query to fetch the results.
        # Otherwise, subsequent queries paginated by a not None (or null)
        # `page_cursor` will be haphazard relative to the order in which
        # rows are stored in the databse, causing records from one page
        # to be duplicated in or jump into other pages as the pages are traversed
        read_pages_sorted_by_cursor_key = sorted(read_pages, key=lambda v: v.created_at)

        # If results length is zero, all cursors are None
        if len(read_pages_sorted_by_cursor_key) == 0:
            self._top_cursor = None
            self._bottom_cursor = None
            # register cursors as set, which must happen before call to `Pages.cursors`
            self._cursor_isset = True
            return

        # The following are only set after the initial condition above
        # to prevent IndexError when trying to access an empty list

        # A Page can be seen as an object containing edges from its top vertex down to its
        # bottom vertex. These edges can also be termed as the page objects. We only
        # need to collect cursors from both vertexes to serve as reference points.
        top_vertex = read_pages_sorted_by_cursor_key[0]
        bottom_vertex = read_pages_sorted_by_cursor_key[-1]

        # If results length is one, all cursors are not None but the same
        if len(read_pages_sorted_by_cursor_key) == 1:
            # the encoded cursor of a point referencing both the top and bottom vertex of the page
            vertex_ref_enc = iso_format_date(top_vertex.created_at).encode()
            self._top_cursor = base64.urlsafe_b64encode(vertex_ref_enc).decode()
            self._bottom_cursor = self._top_cursor

        else:
            # the encoded cursor of a point referencing the top vertex of the page
            top_vertex_ref_enc = iso_format_date(top_vertex.created_at).encode()
            # the encoded cursor of a point referencing the bottom vertex of the page
            bottom_vertex_ref_enc = iso_format_date(bottom_vertex.created_at).encode()

            self._top_cursor = base64.urlsafe_b64encode(top_vertex_ref_enc).decode()
            self._bottom_cursor = base64.urlsafe_b64encode(bottom_vertex_ref_enc).decode()

        # register cursors as set, which must happen before call to `Pages.cursors`
        self._cursor_isset = True

    def _check_cursor_isset(self):
        if not self._cursor_isset:
            raise AttributeError("cursors have not been set yet, you should read the page first")

    def cursors(self) -> tuple[str | None, str | None]:
        """Retrieve the cursors to the top and bottom vertexes of the edges
        read from a page.

        Note: this method should only be called after the page has been read,
        `page.read(size)`, and not before

        :returns: a tuple consisting of the top and bottom cursor
            `(top_cursor, bottom_cursor)`
        """

        self._check_cursor_isset()
        return (self._top_cursor, self._bottom_cursor)

    def has_more(self):
        """Check if there are more edges before and after the top and bottom vertexes
        of the edges read from a page.

        Note: this method should only be called after the page has been read,
        `page.read(size)`, and not before.

        Alternatively, to check if a page has previous, `page.has_previous()`, and to
        check it has next, `page.has_next()`

        :returns: a tuple consisting of the "has previous" and "has next" status
            `(has_prev, has_next)`
        """

        self._check_cursor_isset()

        # check if the "has more" query has already been executed
        if self._has_more_have_been_queried:
            return (self._has_prev, self._has_next)

        # if self._top_cursor is None then self._bottom_cursor will also be None
        # Which means the result set of read pages was empty.
        if self._top_cursor is None:
            return (False, False)

        # fmt: off
        assert (self._bottom_cursor is not None), \
              "_top_cursor is supposed to be mutually inclusive with _bottom_cursor"
        # fmt: on

        has_more_query = self._has_more_query_factory(self._top_cursor, self._bottom_cursor)

        row = has_more_query.one()
        result = row.tuple()
        as_dict = row._asdict()  # type: ignore

        logger.debug(f"Has more query returned: {result}")
        logger.debug(f"Does this {self.title} page have a previous page? {as_dict.get('has_prev')}")
        logger.debug(f"Does this {self.title} page have a next page? {as_dict.get('has_next')}")

        _, self._has_prev, self._has_next = result

        self._has_more_have_been_queried = True

        return (self._has_prev, self._has_next)

    def has_previous(self):
        """Check if a page has previous"""
        return self.has_more()[0]

    def has_next(self):
        """Check if a page has next"""
        return self.has_more()[1]

    def read(self, size: int):
        """Read a certain amount, `size`, of edges from a page

        :param size: The size of objects or edges desired on a page
        """
        # counts total rows the main query is capable of producing
        total_size = self._object_count_query.count()

        self.total_size = total_size
        self.read_size = size

        logger.debug(f"Reading {size} of {total_size} edges from a {self.title} page")

        read_pages = self._main_query.limit(size).all()

        self._register_cursors_from_read_pages(read_pages)

        return read_pages


class Paginator(Generic[ModelT, FilterT]):
    def __init__(self, model: type[ModelT]):
        """`Paginator` is a mediator between `PageBuilder` and `Page`,
        and it does majority of the heavy lifting, from filtering,
        to sorting, to querying meta information about the
        page-generating query, including if the query has more
        objects or edges to it, at both vertexes than was read at the
        given moment, the total number of obejects the query is capable
        of returning, if left unlimited (without `LIMIT`).

        `Paginator` bridges the gap between the `PageBuilder` and the `Page`

        `Paginator` DOES NOT and SHOULD NOT execute any query. It mostly
        generates the query in a multi-step process determined by
        parameters supplied to it by the PageBuilder.

        The queries generated are composed in the `Page` object created
        and are only executed when the page is being read.
        """

        self.model = model
        self.session: Session

        self._session_isset = False
        self._query: Query[ModelT]
        self._object_count_query: RowReturningQuery[tuple[UUID]]

    # intercept method calls to ensure `set_session` has been called
    # before any other method call, if not raise an AttributeError
    def __getattribute__(self, __name: str) -> Any:
        if __name == "set_session":
            return super().__getattribute__(__name)

        if not super().__getattribute__("_session_isset"):
            raise AttributeError("session has not been set, did you forget to call set_session?")

        return super().__getattribute__(__name)

    def set_session(self, session: Session) -> Self:
        """Sets the session to use for querying.

        Ensure this method is called before doing pretty much
        anything
        """

        self.session = session
        self._session_isset = True
        self._query = session.query(self.model)
        self._object_count_query = session.query(self.model.id)
        return self

    def get_edge_after_query(self, cursor: Base64Str):
        """Generates a query that navigates to records occuring after a specific
        record marked by `cursor`. This query should be used as a subquery to a
        parent query

        :param cursor: A urlsafe base64 encoded string of the value \
            of a chosen field in the model to query which can gurantee \
            the order of objects of that model (in this case `Model.created_at`)
        """

        cursor_value = base64.urlsafe_b64decode(cursor).decode()
        query = self.session.query(self.model.id).filter(self.model.created_at > cursor_value)

        return query

    def get_edge_before_query(self, cursor: Base64Str):
        """Generates a query that navigates to records occuring before a specific
        record marked by `cursor`. This query should be used as a subquery to a
        parent query.

        :param cursor: A urlsafe base64 encoded string of the value \
            of a chosen field in the model to query which can gurantee \
            the order of objects of that model (in this case `Model.created_at`)
        """

        cursor_value = base64.urlsafe_b64decode(cursor).decode()
        query = self.session.query(self.model.id).filter(self.model.created_at < cursor_value)

        return query

    @overload
    def skim_through(self, *, filter: FilterT) -> None:
        """Skim through records using a couple of filter criteria set in `filter`

        Method has side effects as it does mutate it's object state (internally),
        rather than just returning a new, modified, query.

        Implicitly sets `self._query` which impacts the eventaul query generated
        """
        ...

    @overload
    def skim_through(self, *, filter: FilterT, query: Query[ModelT]) -> Query[ModelT]:
        """Skim through records using a couple of filter criteria set in `filter`

        Method has no side effects as it doesn't mutate it's object state
        (internal or external), and just returns a new, modified, query from
        the query it was given directly.
        """
        ...

    @overload
    def skim_through(
        self,
        *,
        filter: FilterT,
        query: RowReturningQuery[RowT],
    ) -> RowReturningQuery[RowT]:
        """Skim through records using a couple of filter criteria set in `filter`

        Method has no side effects as it doesn't mutate it's object state
        (internal or external), and just returns a new, modified, query from
        the query it was given directly.

        This is different as it receives a query that queries specific rows on
        its model rather than the entire model.
        """
        ...

    def skim_through(
        self,
        *,
        filter: FilterT,
        query: SkimThroughQueryT | None = None,
    ) -> SkimThroughQueryT | None:
        """Implementation"""

        query_is_none = query is None
        q = self._query if query_is_none else query

        conditions: list[ColumnElement[bool]] = []

        for attr in filter.__fields_set__:
            values: Any | list[Any] = filter.model_dump(exclude_defaults=True).get(attr, [])

            if attr in sa_inspect(self.model).columns.keys():
                column = sa_cast(self.model.__dict__[attr], String)
                mapper: Callable[[str], BinaryExpression[bool]] = lambda v: column.ilike(f"%{v}%")
                condition = (
                    map(mapper, values)
                    if type(values) is list[Any]
                    else map(mapper, [cast(str, values)])
                )
                conditions.append(or_(*condition))
            else:
                logger.debug(f"Attr not found in database model, attr='{attr}', model={self.model}")

        q = q.filter(and_(*conditions))

        # if no query was given, mutate objects internal query and return None to make sure
        # the api consumer knows the difference.
        if query_is_none:
            self._query = q
            return None

        return cast(SkimThroughQueryT, q)

    @overload
    def sort(self, sorts: list[str]) -> None:
        """Sort records using a couple of sort criteria set in `sorts`

        Method has side effects as it does mutate it's object state (internally),
        rather than just returning a new, modified, query.

        Implicitly sets `self._query` which impacts the eventaul query generated
        """
        ...

    @overload
    def sort(self, sorts: list[str], query: Query[ModelT]) -> Query[ModelT]:
        """Sort records using a couple of sort criteria set in `sorts`

        Method has no side effects as it doesn't mutate it's object state
        (internal or external), and just returns a new, modified, query from
        the query it was given directly.
        """
        ...

    def sort(self, sorts: list[str], query: Query[ModelT] | None = None):
        """Implementation"""

        query_is_none = query is None
        q = self._query if query_is_none else query

        for sort in sorts:
            try:
                sort_col, sort_order = sort.split(":")

                if sort_col in sa_inspect(self.model).columns.keys():
                    column = self.model.__dict__[sort_col]
                    xpression = desc(column) if sort_order.lower() == "desc" else asc(column)
                    q = q.order_by(xpression)
            except ValueError:
                if sort in sa_inspect(self.model).columns.keys():
                    q = q.order_by(asc(self.model.__dict__[sort]))
                else:
                    logger.debug(f"Sort parameter param='{sort}' doesn't exist")

        # if no query was given, mutate objects internal query and return None to make sure
        # the api consumer knows the difference.
        if query_is_none:
            self._query = q
            return None

        return q

    def get_has_more_edges_query(
        self,
        *,
        top_cursor: Base64Str,
        bottom_cursor: Base64Str,
        filter: FilterT | None = None,
    ) -> RowReturningQuery[tuple[int, bool, bool]]:
        """
        Generates a query that finds out if the originally paginated query has more
        records (or edges or page objects) at the top, the bottom, or more intuitively,
        before and/or after.

        An SQL query of the following form is used to achieve this in a single execution::

            SELECT
                1 AS "id",
                (
                    SELECT EXISTS (
                        SELECT 1
                        FROM "user" "user"
                        WHERE ("user"."created_at" < %(top_cursor)s)
                        -- Plus addtional filters
                    )
                ) AS "has_prev",
                (
                    SELECT EXISTS (
                        SELECT 1
                        FROM "user" "user"
                        WHERE ("user"."created_at" > %(bottom_cursor)s)
                        -- Plus addtional filters
                    )
                ) AS "has_next";

        This produces jsut a single query which can inspect for both if the entity has more
        edges from the top-to-up and/or from the bottom-to-down in just one execution.

        The query should produce a `tuple[int, bool, bool]` when executed and each field is
        correctly positioned in the tuple as it occurs in the query.

        For example::

            id, has_prev, has_next = tuple[int, bool, bool]
        """

        top_cursor_value = base64.urlsafe_b64decode(top_cursor).decode()
        bottom_cursor_value = base64.urlsafe_b64decode(bottom_cursor).decode()

        has_prev_subquery = self.session.query(self.model).filter(
            self.model.created_at < top_cursor_value
        )

        has_next_subquery = self.session.query(self.model).filter(
            self.model.created_at > bottom_cursor_value
        )

        if filter is not None:
            has_prev_subquery = self.skim_through(filter=filter, query=has_prev_subquery)
            has_next_subquery = self.skim_through(filter=filter, query=has_next_subquery)

        outer_has_prev_subquery = self.session.query(has_prev_subquery.exists())
        outer_has_next_subquery = self.session.query(has_next_subquery.exists())

        query = self.session.query(
            literal(1).label("id"),
            outer_has_prev_subquery.label("has_prev"),
            outer_has_next_subquery.label("has_next"),
        )

        return query

    def get_first_after(
        self,
        *,
        cursor: Base64Str,
        filter: FilterT | None = None,
        sorts: list[str] = [],
    ):
        """Get the first `n` number of records occuring after a specific record
        marked by its cursor, `cursor`, using the same filters, `filter` as
        was when querying for the initial records.

        Note: filters shouldn't change across pages as this could create an
        entirely different sequence of records.

        This methods is called when you expect to page forward through the
        queried entity. For paging backwards through the queried entity
        `Paginator.get_last_before` is more suitable.

        :param cursor: A base 64 encoded string representing the bottom \
            vertex of the previous page

        :param filter: A set of filters to apply to the query

        :param sorts: A set of sort criteria to order the results by
        """

        page_after_query = self.get_edge_after_query(cursor)

        self._query = self._query.filter(self.model.id.in_(page_after_query))

        if filter is not None:
            self.skim_through(filter=filter)
            self._object_count_query = self.skim_through(
                filter=filter,
                query=self._object_count_query,
            )

        if sorts and len(sorts) > 0:
            self._query = self.sort(sorts, self._query)

        return Page[ModelT](
            self.model.__name__,
            main_query=self._query,
            object_count_query=self._object_count_query,
            has_more_query_factory=lambda x, v: self.get_has_more_edges_query(
                top_cursor=x, bottom_cursor=v, filter=filter
            ),
        )

    def get_last_before(
        self,
        *,
        cursor: Base64Str,
        filter: FilterT | None = None,
        sorts: list[str] = [],
    ):
        """Get the last `n` number of records occuring before a specific record
        marked by its cursor, `cursor`, using the same filters, `filter` as
        was when querying for the initial record.

        Note: filters shouldn't change across pages as this could create an
        entirely different sequence of records.

        This methods is called when you expect to page backwards through the
        queried entity. For paging forward through the queried entity
        `Paginator.get_first_after` is more suitable.

        :param cursor: A base 64 encoded string representing the top \
            vertex of the previous page

        :param filter: A set of filters to apply to the query

        :param sorts: A set of sort criteria to order the results by
        """

        page_before_query = self.get_edge_before_query(cursor)

        self._query = self._query.filter(self.model.id.in_(page_before_query))

        if filter is not None:
            self.skim_through(filter=filter)
            self._object_count_query = self.skim_through(
                filter=filter,
                query=self._object_count_query,
            )

        if sorts and len(sorts) > 0:
            self.sort(sorts)

        return Page[ModelT](
            self.model.__name__,
            main_query=self._query,
            object_count_query=self._object_count_query,
            has_more_query_factory=lambda x, v: self.get_has_more_edges_query(
                top_cursor=x, bottom_cursor=v, filter=filter
            ),
        )

    def get_initial(
        self,
        *,
        filter: FilterT | None = None,
        sorts: list[str] = [],
    ):
        """Get, initially, `n` number of records just as is, using filters,
        `filter`.

        This methods is called to open into the first few records as needed.

        :param filter: A set of filters to apply to the query

        :param sorts: A set of sort criteria to order the results by
        """

        if filter is not None:
            self.skim_through(filter=filter)
            self._object_count_query = self.skim_through(
                filter=filter,
                query=self._object_count_query,
            )

        if sorts and len(sorts) > 0:
            self.sort(sorts)

        return Page[ModelT](
            self.model.__name__,
            main_query=self._query,
            object_count_query=self._object_count_query,
            has_more_query_factory=lambda x, v: self.get_has_more_edges_query(
                top_cursor=x,
                bottom_cursor=v,
                filter=filter,
            ),
        )


class PageBuilderAbstract(Generic[ModelT, FilterT]):
    @abstractmethod
    def setup(cls, session: Session, model: type[ModelT]) -> Self:
        ...

    @abstractmethod
    def reset(self) -> Self:
        ...

    @abstractmethod
    def go_to_edge_before(self, cursor: Base64Str) -> Self:
        ...

    @abstractmethod
    def go_to_edge_after(self, cursor: Base64Str) -> Self:
        ...

    @abstractmethod
    def skim_through(self, filter: FilterT) -> Self:
        ...

    @abstractmethod
    def sort(self, sorts: list[str]) -> Self:
        ...

    @abstractmethod
    def build(self) -> Page[ModelT]:
        ...


class PageBuilder(PageBuilderAbstract[ModelT, FilterT]):
    def __init__(self):
        """A builder class for building a page of edges (or page objects) of various models"""

        self._paginator: Paginator[ModelT, FilterT]
        self._bottom_cursor: Base64Str
        self._top_cursor: Base64Str
        self._filter: FilterT
        self._sorts: list[str]

    def setup(self, session: Session, model: type[ModelT]):
        """Setup the page builder and get it ready for taking instructions
        or steps on how to build the page.

        :param session: The database session to use to query for page objects
        :param model: The model to execute the query on
        """

        self._paginator = Paginator[ModelT, FilterT](model)
        self._paginator.set_session(session)
        return self

    def reset(self) -> Self:
        """Reset the builder state"""

        del self._bottom_cursor
        del self._filter
        del self._paginator
        del self._sorts
        del self._top_cursor

        return self

    def go_to_edge_after(self, cursor: Base64Str | None) -> Self:
        """Take the builder to a edge after a specific edge marked
        by a cursor

        :param cursor: The cursor that marks the edge to go to after which \
            are the desired edges we need to build our page. \
            If None, this instruction is ignored.
        """

        if cursor is not None:
            self._bottom_cursor = cursor
        return self

    def go_to_edge_before(self, cursor: Base64Str | None) -> Self:
        """Take the builder to a edge before a specific edge marked
        by a cursor.

        :param cursor: The cursor that marks the edge to go to, before which \
            are the desired edges we need to build our page. \
            If None, this instruction is ignored.
        """

        if cursor is not None:
            self._top_cursor = cursor
        return self

    def skim_through(self, filter: FilterT) -> Self:
        """Skim through pages (conviniently, filter pages) using a set of filter
        criteria, and find the page objects that fits our filter condition, then use
        these objects to build a desired page

        :param filter: The set of filters to use to find desired page objects
        """
        self._filter = filter
        return self

    def sort(self, sorts: list[str]) -> Self:
        """Sort the edges in the desired way specified by a list of sort criteria.
        The edges will appear ordered by the given criteria on the eventual page built

        :param sorts: A list of sort criteria to use to order edges on the page
        """

        self._sorts = sorts
        return self

    def build(self) -> Page[ModelT]:
        """This builds the page and returns it, containing the desired edges.
        The returned page should be read and the size of the page can be limited by specifying
        the page_size when reading.
        """

        if hasattr(self, "_bottom_cursor") and getattr(self, "_bottom_cursor") is not None:
            return self._paginator.get_first_after(
                cursor=self._bottom_cursor,
                filter=self._filter,
                sorts=self._sorts,
            )
        elif hasattr(self, "_top_cursor") and getattr(self, "_top_cursor") is not None:
            return self._paginator.get_last_before(
                cursor=self._top_cursor,
                filter=self._filter,
                sorts=self._sorts,
            )
        return self._paginator.get_initial(filter=self._filter, sorts=self._sorts)
