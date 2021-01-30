import psycopg2

con = psycopg2.connect(database="postgres", user="postgres", password="", host="34.83.221.162", port="5432")
print("Database opened successfully")

# cur = con.cursor()
# cur.execute("INSERT INTO applr.users (username, password) VALUES (%s, %s)", ('ck', 'ck260'))
# con.commit()

# cur = con.cursor()
# cur.execute("INSERT INTO applr.fields (user_id, description, value, type) VALUES (%s, %s, %s, %s)", (3, 'First Name', 'Caaarroolllyyynn', 'input'))
# con.commit()

cur = con.cursor()
cur.execute("SELECT username, user_id, description, value, type FROM applr.fields INNER JOIN applr.users ON (fields.user_id = users.id)")
rows = cur.fetchall()

for row in rows:
    print(row)
