import psycopg2
import jwt
from flask import Flask, request
import json
from datetime import date
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

con = psycopg2.connect(database="postgres", user="postgres", password="", host="34.83.221.162", port="5432")
print("Database opened successfully")

secret = ''

@app.route('/')
def welcome():
    return 'hi'

@app.route('/applications', methods = ['GET'])
def applications():
    cur = con.cursor()
    cur.execute("SELECT cname, link, job, status, app_date, last_resp, notes FROM applr.apps WHERE user_id = %s", (3,))
    rows = cur.fetchall()
    return {'data': rows}


@app.route('/applications', methods = ['POST'])
def add_applications():
    body = request.json
    if body is None:
        return { 'status': 'fail', 'message': 'Missing body' }

    cur = con.cursor()
    cur.execute("INSERT INTO applr.apps (user_id, cname, link, job, status, app_date) VALUES (%s, %s, %s, %s, %s, %s)", (3, body['cname'], body['link'], body['job'], 'Applied', date.today()))
    con.commit()
    return { 'status': 'success' }

@app.route('/login', methods = ['POST'])
def user_login():
    body = request.json
    if body is None:
        return { 'status': 'fail', 'message': 'Missing body' }

    username, password = body['username'], body['password']
    cur = con.cursor()
    cur.execute("SELECT id, username, password FROM applr.users WHERE username = %s", (username,))
    row = cur.fetchone()

    print('Row: ', row)
    if row is None or row[2] != password:
        return { 'status': 'fail', 'message': 'Incorrect username or password!' }
    token = jwt.encode({ "id": row[0] }, secret, algorithm="HS256")
    return { 'status': 'success', 'token': token }

@app.route('/save', methods = ['POST'])
def save(): 
    body = request.json
    if body is None:
        return { 'status': 'fail', 'message': 'Missing body' }

    for i in body:
        cur = con.cursor()
        cur.execute("INSERT INTO applr.fields (user_id, description, value, type) VALUES (%s, %s, %s, %s) ON CONFLICT (user_id, description) DO UPDATE SET value = %s", (3, i['name'], i['value'], 'input', i['value'],))
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
   cur = con.cursor()
   cur.execute("SELECT id FROM applr.users WHERE username = %s", (username,))
   row = cur.fetchone()
   token = jwt.encode({ "id": row[0] }, secret, algorithm="HS256")
   return { 'status': 'success', 'token': token }

@app.route('/populate', methods = ['POST'])
def populate():
    body = request.json
    if body is None:
      return { 'status': 'fail', 'message': 'Missing body' }
    for i in body:
        name = i['name']
        cur = con.cursor()
        cur.execute("SELECT value FROM applr.fields WHERE description = %s", (name, ))
        row = cur.fetchone()
        value = row[0]
        i['value'] = value
    return { 'status': 'success','body': body}


    
    