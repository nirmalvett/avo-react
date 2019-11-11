from flask import Blueprint, request, abort
import sys
from git import Repo
from os import devnull
from subprocess import check_call, CalledProcessError
from requests import post

import config
from server.decorators import admin_only

ServerRoutes = Blueprint('ServerRoutes', __name__)


@ServerRoutes.route('/clearCache')
@admin_only
def restart():
    post(
        url=f'https://api.cloudflare.com/client/v4/zones/{config.cloudflare_zone}/purge_cache',
        headers={
            'X-Auth-Email': config.auth_email,
            'X-Auth-Key': config.auth_key,
            'Content-Type': 'application/json',
        },
        json={"purge_everything": True}
    )
    return ''


@ServerRoutes.route('/update', methods=['POST'])
def update():
    if request.headers['X-Gitlab-Token'] != config.SHUTDOWN_TOKEN:
        return abort(403)

    repo = Repo('.')
    branch1 = 'HEAD'
    branch2 = f'origin/{repo.active_branch.name}'

    with open(devnull, 'wb') as dn:
        check_call(['git', 'fetch', '-p'], stdout=dn, stderr=dn)  # git fetch -p

        requirements = git_diff(branch1, branch2, 'requirements.txt', dn)
        package = git_diff(branch1, branch2, 'static/package-lock.json', dn)
        server = git_diff(branch1, branch2, 'server', dn)
        static = git_diff(branch1, branch2, 'static/js', dn)

        check_call(['git', 'reset', branch2, '--hard'], stdout=dn, stderr=dn)  # git reset origin/BRANCH --hard
        if requirements:
            print('installing python requirements...')
            check_call('pip install -r requirements.txt'.split(' '))
            print('done')
        if package:
            print('installing npm requirements...')
            check_call('bash npm_install.bash'.split(' '))
            print('done')
        if package or static:
            print('building...')
            check_call('bash npm_build.bash'.split(' '))
            print('done')
        post(
            url=f'https://api.cloudflare.com/client/v4/zones/{config.cloudflare_zone}/purge_cache',
            headers={
                'X-Auth-Email': config.auth_email,
                'X-Auth-Key': config.auth_key,
                'Content-Type': 'application/json',
            },
            json={"purge_everything": True}
        )
        if requirements or server:
            sys.exit(4)
        else:
            return ''


def git_diff(branch1, branch2, path, dn):
    try:
        check_call(['git', 'diff', branch1, branch2, '--exit-code', '--', path], stdout=dn, stderr=dn)
        return False
    except CalledProcessError:
        return True
