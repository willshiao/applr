import psycopg2
from flask import Flask, request
import json

app = Flask(__name__)

con = psycopg2.connect(database="postgres", user="postgres", password="rlppa", host="34.83.221.162", port="5432")
print("Database opened successfully")

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
    return { 'status': 'success', 'token': 'todo' }

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
    return { 'status': 'success'}
