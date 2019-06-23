def alchemy_to_dict(obj):
    """
    Converts SQLalchemy object to dict
    :param obj: the SQLalchemy object to convert
    :return: dict of SQLalchemy object
    """
    dicObj = obj.__dict__
    dicObj.pop('_sa_instance_state')
    return dicObj
