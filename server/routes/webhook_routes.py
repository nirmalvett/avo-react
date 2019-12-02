from flask import Blueprint, request, abort

WebHookRoutes = Blueprint('WebHookRoutes', __name__)


@WebHookRoutes.route("/webhook", methods=['POST'])
def post_webhook():
    body = request.get_json()
    if body['object'] == 'page':
        for entry in body['entry']:
            webhook_event = entry['messaging'][0]
            print(webhook_event)
        return 'EVENT_RECEIVED'
    else:
        abort(404)


@WebHookRoutes.route('/webhook', methods=['GET'])
def get_webhook():
    VERIFY_TOKEN = 'avo'

    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')

    if mode and token:
        if mode == 'subscribe' and token == VERIFY_TOKEN:
            print('WEBHOOK_VERIFIED')
            return challenge
        else:
            abort(403)
