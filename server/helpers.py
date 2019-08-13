from datetime import datetime


def timestamp(x):
    if x is None:
        return None
    elif isinstance(x, datetime):
        try:
            return x.timestamp() * 1000
        except OSError:  # Occurs when the date is really far in the future
            return 1609477200000  # January 1, 2021, at midnight
    else:
        raise ValueError(f'invalid value passed to timestamp: {x}')


def from_timestamp(x):
    if x is None:
        return None
    elif isinstance(x, int):
        return datetime.fromtimestamp(x // 1000)
    else:
        raise ValueError(f'invalid value passed to from_timestamp: {x}')
