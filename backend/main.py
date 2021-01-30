from flask import Flask
app = Flask(__name__)

@app.route('/')
def welcome():
   return 'hi'

@app.route('/applications')
def applications():
   return 'ey these are the apps you\'ve applied to'
