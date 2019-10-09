import config
import paypalrestsdk


def create_payment(section_name: str, price: float):
    price_with_tax = round(price * 1.13, 2)
    payment = paypalrestsdk.Payment(
        {
            'intent': 'sale',
            'payer': {
                'payment_method': 'paypal'
            },
            'redirect_urls': {
                # todo have to enable auto return in the paypal account
                'return_url': f'http://' + config.HOSTNAME + '/',
                # todo when cancelled remove tid from mapping table
                'cancel_url': f'http://' + config.HOSTNAME + '/'
            },
            'transactions': [
                {
                    'amount': {
                        'total': "{:4.2f}".format(price_with_tax),
                        'currency': 'CAD'
                    },
                    'description': f"32 Week Subscription to {section_name} Through AVO",
                    'item_list': {
                        'items': [
                            {
                                'name': 'Avo ' + section_name,
                                'price': "{:4.2f}".format(price_with_tax),
                                'currency': 'CAD',
                                'quantity': 1
                            }
                        ]
                    }
                }
            ]
        }
    )
    return payment, payment.create()


def check_if_created(tid: str) -> bool:
    try:
        return paypalrestsdk.Payment.find(tid).state == 'created'
    except paypalrestsdk.ResourceNotFound:
        return False


def execute_payment(tid: str, payer_id: str):
    payment = paypalrestsdk.Payment.find(tid)
    if payment.execute({'payer_id': payer_id}):
        return None
    else:
        return payment.error
