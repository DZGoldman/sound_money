from flask import Flask, request
from flask import Flask, render_template
from flask_cors import CORS
import os
app = Flask(__name__, static_folder="./build/static", template_folder="./build")
CORS(app)



@app.route('/', methods=['Get'])
def index():
  return render_template( 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 33507))
    app.run(host='0.0.0.0', port=port, debug = os.environ.get('DEV'))