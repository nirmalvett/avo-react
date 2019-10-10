from logging import getLogger, ERROR
from multiprocessing import Process, Queue
from requests import get
from requests.exceptions import ConnectionError
from server_test import test
from server_test.ascii_colors import *


def run_app():
    from server import app, db

    log = getLogger('werkzeug')
    log.setLevel(ERROR)

    app.debug = False
    db.create_all(app=app)
    app.run()


def run_test(q: Queue):
    print(ascii_blue + 'waiting for server to start...' + ascii_gray)

    try:  # try to load index.html, give up after 3 seconds
        get('http://localhost:5000/', timeout=3)
    except ConnectionError:
        q.put('Server failed to start')
        return

    print(ascii_blue + 'Established connection to local server, starting tests\n' + ascii_reset)

    q.put(test())
    return


def timeout(q: Queue):
    from time import sleep
    sleep(10)
    print(ascii_red + 'Tests took too long\n' + ascii_reset)
    q.put(False)


if __name__ == '__main__':
    queue = Queue()
    _app = Process(target=run_app)
    _test = Process(target=run_test, args=[queue])
    _timer = Process(target=timeout, args=[queue])

    _app.start()
    _test.start()
    _timer.start()

    tests_passed = queue.get()
    if tests_passed:
        print(ascii_green + 'tests passed' + ascii_reset)
    else:
        print(ascii_red + 'tests failed' + ascii_reset)
    _app.terminate()
    _test.terminate()
    _timer.terminate()
    exit(0 if tests_passed else 1)
