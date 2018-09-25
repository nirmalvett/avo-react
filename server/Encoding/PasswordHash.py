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
    """
    return hashlib.sha512(salt.encode() + password.encode()).hexdigest()


def check_password(givenPassword, salt, storedPassword):
    """
    Checks the password
    :param givenPassword: Pass
    :param salt:
    :param storedPassword:
    :return: If stored password is equal to given password
    """
    return storedPassword == hashlib.sha512(salt.encode() + givenPassword.encode()).hexdigest()
