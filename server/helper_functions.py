def alchemy_to_dict(obj):
    """
    Converts SQLalchemy object to dict
    :param obj: the SQLalchemy object to convert
    :return: dict of SQLalchemy object
    """
    if type(obj) is list:
        # If a list is passed convert it to a list of dict
        dict_obj = []  # dict to be returned
        for i in obj:
            # For each SQL alchemy result in the list convert to dict then add to list
            current_dict = dict(i.__dict__); current_dict.pop('_sa_instance_state', None)
            dict_obj.append(current_dict)
    else:
        # If not a list convert object to dict
        dict_obj = obj.__dict__
        dict_obj.pop('_sa_instance_state')
    return dict_obj
