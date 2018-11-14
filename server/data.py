from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy() # Database INIT


def query_to_list(query, include_field_names=True):
    """
    Turns a SQLAlchemy query into a list of data values.
    :param query: query to output
    :param include_field_names: Includes the names of the tables columns
    :return: list of query objects in list form
    """
    column_names = []
    for i, obj in enumerate(query.all()):
        if i == 0:
            column_names = [c.name for c in obj.__table__.columns]
            if include_field_names:
                yield column_names
        yield obj_to_list(obj, column_names)


def obj_to_list(sa_obj, field_order):
    """
    Takes a SQLAlchemy object - returns a list of all its data
    :param sa_obj: object to convert to list
    :param field_order: order in list
    :return: list object containing sql object in list form
    """
    return [getattr(sa_obj, field_name, None) for field_name in field_order]
