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
    cur.execute("SELECT id, username, password FROM applr.users WHERE username = %s", (username,))
    row = cur.fetchone()

    print('Row: ', row)
    if row is None or row[2] != password:
        return { 'status': 'fail', 'message': 'Incorrect username or password!' }
    token = jwt.encode({ "id": row[0] }, secret, algorithm="HS256")
    return { 'status': 'success', 'token': token }

@app.route('/save', methods = ['POST'])
def save(): 
    with open('message.json', 'r') as f:
        data = f.read()
        json_data = json.loads(data)

        for i in json_data: 
            print(i['name'])
            cur = con.cursor()
            cur.execute("INSERT INTO applr.fields (user_id, description, value, type) VALUES (%s, %s, %s, %s) ON CONFLICT (user_id, description) DO UPDATE SET value = %s", (3, i['name'], 'Caaarroolllyyynn', 'input', i['name'],))
            con.commit()
    return { 'status': 'success', 'token': token}

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
    name = body['name']
    cur = con.cursor()
    cur.execute("SELECT value FROM applr.fields WHERE description = %s", (name, ))
    row = cur.fetchone()
    value = row[0]
    body['value'] = value
    return { 'status': 'success'}


    
    