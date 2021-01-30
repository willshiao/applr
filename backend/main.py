import psycopg2
import jwt
from flask import Flask, request
import json

app = Flask(__name__)

con = psycopg2.connect(database="postgres", user="postgres", password="", host="34.83.221.162", port="5432")
print("Database opened successfully")

secret = ''

@app.route('/')
def welcome():
    return 'hi'

@app.route('/applications')
def applications():
    return 'ey these are the apps you\'ve applied to'

@app.route('/login', methods = ['POST'])
def user_login():
    body = request.json
    if body is None:
        return { 'status': 'fail', 'message': 'Missing body' }

    username, password = body['username'], body['password']
    cur = con.cursor()
    cur.execute("SELECT username, password FROM applr.users WHERE username = %s", (username,))
    row = cur.fetchone()

    print('Row: ', row)
    if row is None or row[1] != password:
        return { 'status': 'fail', 'message': 'Incorrect username or password!' }
    token = jwt.encode({ "user": username }, secret, algorithm="HS256")
    return { 'status': 'success', 'token': token }

@app.route('/save', methods = ['POST'])
def save(): 
    body = request.json
    if body is None:
        return { 'status': 'fail', 'message': 'Missing body' }

    for i in body:
        cur = con.cursor()
        cur.execute("INSERT INTO applr.fields (user_id, description, value, type) VALUES (%s, %s, %s, %s) ON CONFLICT (user_id, description) DO UPDATE SET value = %s", (3, i['name'], i['value'], 'input', i['name'],))
        con.commit()

    return { 'status': 'success' }

@app.route('/register', methods = ['POST'])
def user_registration():
   body = request.json
   if body is None:
      return { 'status': 'fail', 'message': 'Missing body' }
   username, password = body['username'], body['password']
   cur = con.cursor()
   cur.execute("SELECT username FROM applr.users WHERE username = %s", (username,))
   row = cur.fetchone()
   if row:
      return { 'status': 'fail', 'message': 'Username already exists' } 

   cur = con.cursor()
   cur.execute("INSERT INTO applr.users (username, password) VALUES (%s, %s)", (username, password))
   con.commit()
   token = jwt.encode({ "user": username }, secret, algorithm="HS256")
   return { 'status': 'success', 'token': token }
