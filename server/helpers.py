from datetime import datetime


def timestamp(x):
    if x is None:
        return None
    elif isinstance(x, datetime):
        return x.timestamp() * 1000
    else:
        raise ValueError(f'invalid value passed to timestamp: {x}')


def from_timestamp(x):
    if x is None:
        return None
    elif isinstance(x, int):
        return datetime.fromtimestamp(x // 1000)
    else:
        raise ValueError(f'invalid value passed to from_timestamp: {x}')
