import psycopg2
import jwt
from flask import Flask, request
import json
from datetime import date
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

con = psycopg2.connect(database="postgres", user="postgres", password="rlppa", host="34.83.221.162", port="5432")
print("Database opened successfully", flush=True)

JWT_SECRET = ''
JWT_ALGORITHM = 'HS256'

def authenticate(jwt_token):
    if jwt_token:
        jwt_token = jwt_token.split(' ')[-1]
        try:
            jwt.decode(jwt_token, JWT_SECRET, algorithms=JWT_ALGORITHM)
        except (jwt.DecodeError, jwt.ExpiredSignatureError):
            return 'invalid'
    else:
        return 'missing'

@app.route('/')
def welcome():
    return 'hi'

@app.route('/applications', methods = ['GET'])
def applications():
    jwt_token = request.headers.get('authorization', None)
    auth = authenticate(jwt_token)
    if auth == 'invalid':
        return { 'status': 'fail', 'message': 'Token is invalid' }
    elif auth == 'missing':
        return { 'status': 'fail', 'message': 'No token' }
    cur = con.cursor()
    cur.execute("SELECT cname, job, status, app_date, last_resp, notes, link, aid FROM applr.apps WHERE user_id = %s", (3,))
    rows = cur.fetchall()
    return {'data': rows}


@app.route('/applications', methods = ['POST'])
def add_applications():
    jwt_token = request.headers.get('authorization', None)
    auth = authenticate(jwt_token)
    if auth == 'invalid':
        return { 'status': 'fail', 'message': 'Token is invalid' }
    elif auth == 'missing':
        return { 'status': 'fail', 'message': 'No token' }
    body = request.json
    if body is None:
        return { 'status': 'fail', 'message': 'Missing body' }

    cur = con.cursor()
    cur.execute("INSERT INTO applr.apps (user_id, cname, link, job, status, app_date) VALUES (%s, %s, %s, %s, %s, %s)",
        (3, body['cname'], body['link'], body['job'], 'Applied', date.today()))
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
    token = jwt.encode({ "id": row[0] }, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return { 'status': 'success', 'token': token }

@app.route('/save', methods = ['POST'])
def save(): 
    jwt_token = request.headers.get('authorization', None)
    if jwt_token:
        jwt_token = jwt_token.split(' ')[-1]
        try:
            payload = jwt.decode(jwt_token, JWT_SECRET, algorithms=JWT_ALGORITHM)
        except (jwt.DecodeError, jwt.ExpiredSignatureError):
            return { 'status': 'fail', 'message': 'Token is invalid' }
    else:
        return { 'status': 'fail', 'message': 'No token' }
    user_id = payload['id']
    body = request.json
    if body is None:
        return { 'status': 'fail', 'message': 'Missing body' }

    for i in body:
        cur = con.cursor()
        nice_val = i['niceValue'] if 'niceValue' in i else ''
        extra_val = i['extraValue'] if 'extraValue' in i else ''
        cur.execute("INSERT INTO applr.fields (user_id, description, value, nice_value, extra_value, type) VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT (user_id, description) DO UPDATE SET value = %s, nice_value = %s, extra_value = %s",
            (user_id, i['name'], i['value'], nice_val, extra_val, 'input', i['value'], nice_val, extra_val))
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
   token = jwt.encode({ "id": row[0] }, JWT_SECRET, algorithm=JWT_ALGORITHM)
   return { 'status': 'success', 'token': token }

@app.route('/populate', methods = ['POST'])
def populate():
    jwt_token = request.headers.get('authorization', None)
    auth = authenticate(jwt_token)
    if auth == 'invalid':
        return { 'status': 'fail', 'message': 'Token is invalid' }
    elif auth == 'missing':
        return { 'status': 'fail', 'message': 'No token' }
    body = request.json
    if body is None:
      return { 'status': 'fail', 'message': 'Missing body' }
    for i in body:
        name = i['name']
        cur = con.cursor()
        cur.execute("SELECT value, extra_value, nice_value FROM applr.fields WHERE description = %s", (name, ))
        row = cur.fetchone()
        if row is not None:
            i['value'] = row[0]
            i['extraValue'] = row[1]
            i['niceValue'] = row[2]
    return { 'status': 'success','body': body}
