# Third Party
from celery import Celery

# Local Folder
from ..settings import settings

celery = Celery(__name__)

celery.conf.broker_url = settings.CELERY_BROKER_URL
celery.conf.result_backend = settings.CELERY_RESULT_BACKEND
celery.conf.result_backend_transport_options = {"result_chord_ordered": True}
