import hashlib
import uuid


def generate_salt():
    """
    Generate Salt for hash
    :return: Salt value
    """
    return uuid.uuid4().hex


def hash_password(password, salt):
    """
    Hashes the password
    :param password:
    :param salt:
    """
    return hashlib.sha512(salt.encode() + password.encode()).hexdigest()


def check_password(given_password, salt, stored_password):
    """
    Checks the password
    :param given_password: Pass
    :param salt:
    :param stored_password:
    :return: If stored password is equal to given password
    """
    return stored_password == hashlib.sha512(salt.encode() + given_password.encode()).hexdigest()
