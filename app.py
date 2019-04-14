from server import app, db

if __name__ == '__main__':
    app.debug = False
    db.create_all(app=app)
    app.run(host='0.0.0.0')
