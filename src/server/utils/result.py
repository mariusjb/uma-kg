
def get_unique_dicts(list_of_dicts):
    unique_ids = set()  # Create a set to store unique ids
    unique_dicts = []  # Create a list to store unique dictionaries

    for d in list_of_dicts:
        if d['id'] not in unique_ids:
            # If the 'id' is not in the set, add the dictionary to the result list
            unique_dicts.append(d)
            unique_ids.add(d['id'])  # Add the 'id' to the set

    return unique_dicts