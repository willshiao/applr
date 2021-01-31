import redis
import psycopg2
import jwt
from flask import Flask, request
import json
from datetime import date
from flask_cors import CORS
import nltk
from wutils.general import load_pickle
from nltk.corpus import stopwords
from nltk import word_tokenize
import numpy as np
import string

nltk.download('stopwords')
nltk.download('punkt')

JWT_SECRET = ''
JWT_ALGORITHM = 'HS256'
JACCARD_THRESHOLD = 0.07
DECISION_THRESH = 0.05
USE_REDIS = True

print('Loading models...')
vectorizer = load_pickle('./vectorizer.pkl')
lr_model = load_pickle('./lr_model.pkl')

if USE_REDIS:
    r = redis.Redis(host='10.35.129.3', port=6379, decode_responses=True)
con = psycopg2.connect(database="postgres", user="postgres", password="rlppa", host="10.35.128.3", port="5432")
print("Database opened successfully", flush=True)

table = str.maketrans('/', ' ', '\'[\\]^_`{|}~"#$%&()*+,-:;<=>@?.!' + string.digits)
def clean_chars(text):
    text = text.replace('\t', ' ')
    text = text.translate(table)
    return text.strip()

sw_set = set(stopwords.words('english'))
def clean_text(text):
    text = clean_chars(text)
    words = (x.lower() for x in word_tokenize(text))
    words = [word for word in words if word not in sw_set]
    return words

def jaccard(a, b):
    a_s = set(a)
    b_s = set(b)
    if len(a_s) == 0 and len(b_s) == 0:
        return 1
    return len(a_s & b_s) / len(a_s | b_s)

def lr_evaluate_match(match0, match1):
    try:
        feat_vec = np.abs(vectorizer.transform([match0]) - vectorizer.transform([match1]))
        prob = lr_model.predict_proba(feat_vec)[0, 0]
        if (prob > DECISION_THRESH):
            return True
        return False
    except Exception as e:
        print('Error when evaluating match: ', e)
        return False

def fuzzy_match(user_id, entry):
    cur = con.cursor()
    cur.execute("SELECT description, value, extra_value, nice_value FROM applr.fields WHERE user_id = %s", (user_id,))
    rows = cur.fetchall()
    target = clean_text(entry['name'])

    max_idx = 0
    max_val = 0
    for i in range(len(rows)):
        row = rows[i]
        pieces = clean_text(row[0])
        jacc = jaccard(target, pieces)
        if jacc > max_val:
            max_idx = i
            max_val = jacc
    if max_val < JACCARD_THRESHOLD:
        return None
    print(f'Found match between {rows[max_idx][0]} and {entry["name"]}: ', max_val)
    if (lr_evaluate_match(rows[max_idx][0], entry["name"])):
        print('Match confirmed')
        return rows[max_idx][1:]
    print('Match rejected')
    return None

def authenticate(jwt_token):
    if jwt_token:
        jwt_token = jwt_token.split(' ')[-1]
        try:
            payload = jwt.decode(jwt_token, JWT_SECRET, algorithms=JWT_ALGORITHM)
            return payload
        except (jwt.DecodeError, jwt.ExpiredSignatureError):
            return 'invalid'
    else:
        return 'missing'

def create_app():
    app = Flask(__name__)
    CORS(app)

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
        user_id = auth['id']
        cur = con.cursor()
        cur.execute("SELECT cname, job, status, app_date, last_resp, notes, link, aid FROM applr.apps WHERE user_id = %s", (user_id,))
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
        user_id = auth['id']
        body = request.json
        if body is None:
            return { 'status': 'fail', 'message': 'Missing body' }
        cur = con.cursor()
        cur.execute("INSERT INTO applr.apps (user_id, cname, link, job, status, app_date, last_resp) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (user_id, body['cname'], body['link'], body['job'], 'Applied', date.today(), date.today()))
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
        auth = authenticate(jwt_token)
        if auth == 'invalid':
            return { 'status': 'fail', 'message': 'Token is invalid' }
        elif auth == 'missing':
            return { 'status': 'fail', 'message': 'No token' }
        user_id = auth['id']
        body = request.json
        if body is None:
            return { 'status': 'fail', 'message': 'Missing body' }

        for i in body:
            cur = con.cursor()
            nice_val = i['niceValue'] if 'niceValue' in i else ''
            extra_val = i['extraValue'] if 'extraValue' in i else ''
            if USE_REDIS:
                hname = f'{user_id}:{i["name"]}'
                r.hset(hname, 'value', '' if i['value'] is None else i['value'])
                r.hset(hname, 'niceValue', '' if nice_val is None else nice_val)
                r.hset(hname, 'extraValue', '' if extra_val is None else extra_val)
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
        user_id = auth['id']

        body = request.json
        if body is None:
            return { 'status': 'fail', 'message': 'Missing body' }
        for i in body:
            name = i['name']
            if USE_REDIS:
                hash_name = f'{user_id}:{name}'
                if r.exists(hash_name):
                    i['value'] = r.hget(hash_name, 'value')
                    i['extraValue'] = r.hget(hash_name, 'extraValue')
                    i['niceValue'] = r.hget(hash_name, 'niceValue')
                    continue
            cur = con.cursor()
            cur.execute("SELECT value, extra_value, nice_value FROM applr.fields WHERE description = %s AND user_id = %s", (name, user_id))
            row = cur.fetchone()
            if row is None:
                row = fuzzy_match(user_id, i)
            if row is not None:
                i['value'] = row[0]
                i['extraValue'] = row[1]
                i['niceValue'] = row[2]
        return { 'status': 'success','body': body}
    
    return app
