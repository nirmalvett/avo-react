from server.models import db, Transaction
from datetime import datetime
# TODO Refactor This to work
if __name__ == "main":
    current_time = datetime.now()  # Current time to delete enrolled from
    expired_transactions = Transaction.query.filter((Transaction.expiration <= current_time) &
                                                    (Transaction.expired is False)).all()
    for trans in expired_transactions:
        # For each expired transaction remove enrolled
        trans.expired = True  # Set the current transaction to expired
        current_enrolled = None  # current enroll to delete
        try:
            # See if the enroll exists
            current_enrolled = enrolled.query.filter((trans.USER == enrolled.c.USER) &
                                                     (trans.CLASS == enrolled.c.CLASS)).first()
        except:
            print("No results Found")

        if enrolled is None:
            # if enrolled isn't found move onto the next
            pass
        else:
            # Commit to database
            db.session.delete(current_enrolled)
            db.session.commit()
    print("Enroll Update Finished")
