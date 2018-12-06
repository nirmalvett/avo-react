from server.models import *
from datetime import datetime

if __name__ == "main":
    current_time = datetime.now()
    expired_transactions = Transaction.query.filter((Transaction.expiration <= current_time) &
                                                    (Transaction.expired is False)).all()
    for trans in expired_transactions:
        trans.expired = True
        current_enrolled = None
        try:
            current_enrolled = enrolled.query.filter((trans.USER == enrolled.c.USER) &
                                                     (trans.CLASS == enrolled.c.CLASS)).first()
        except:
            print("No results Found")

        if enrolled is None:
            pass
        else:
            db.session.delete(current_enrolled)
            db.session.commit()
