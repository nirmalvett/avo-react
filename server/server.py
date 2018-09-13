from flask import Flask, render_template, send_file

app = Flask(__name__, static_folder='../static/dist', template_folder='../static')


@app.route('/')
def index():
    return render_template('/index.html')


@app.route('/student/<section>')
@app.route('/teacher/<section>')
def index2(section):
    return render_template('/index.html')


@app.route('/<path:path>/dist/<filename>')
def index3(path, filename):
    return send_file('../static/dist/' + filename)


if __name__ == '__main__':
    app.run()
