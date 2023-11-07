import dayjs from 'dayjs';

type UnitType = dayjs.UnitTypeLong | 'week';

const UnitSet: ReadonlyArray<UnitType> = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];

export const timeAgo = (date: dayjs.ConfigType) => {
  const now = dayjs();
  const unit = UnitSet.find((unit) => now.diff(date, unit) > 0);
  const difference = now.diff(date, unit);

  if (!unit || unit === 'second') return 'Few seconds ago';

  const pluralize = difference > 1 ? 's' : '';
  return `${difference} ${unit}${pluralize} ago`;
};
