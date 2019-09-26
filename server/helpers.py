from datetime import datetime
from server.models import TagUser, Tag


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


def get_tree(parent_TAG, tags):
    ret_tags = []
    parent_tags = list(filter(lambda tag: tag.TAG == parent_TAG, tags))
    ret_tags.extend(parent_tags)
    for tag in parent_tags:
        children = list(filter(lambda t: t.parent == tag.TAG, tags))
        if len(children) > 0:
            for child in children:
                child_tree = get_tree(child.TAG, tags)
                if len(child_tree) > 0:
                    ret_tags.extend(child_tree)
    return ret_tags


def get_next_2(parent_TAG, tags, ret_tags=[]):
    parent_tags = list(filter(lambda tag: tag.TAG == parent_TAG, tags))
    for tag in parent_tags:
        if len(ret_tags) > 1:
            return ret_tags
        mastery = TagUser.query.filter(tag.TAG == TagUser.TAG).order_by(TagUser.time_created.desc()).first()
        if mastery.mastery < 1:
            ret_tags.append(tag.TAG)
        if len(ret_tags) > 1:
            return ret_tags
        children = list(filter(lambda t: t.parent == tag.TAG, tags))
        if len(children) > 0:
            for child in children:
                mastery = TagUser.query.filter(child.TAG == TagUser.TAG).order_by(TagUser.time_created.desc()).first()
                if mastery.mastery < 1:
                    ret_tags.append(child.TAG)
                if len(ret_tags) > 1:
                        return ret_tags
                get_next_2(child.TAG, tags, ret_tags)
                if len(ret_tags) > 1:
                        return ret_tags
    return ret_tags
