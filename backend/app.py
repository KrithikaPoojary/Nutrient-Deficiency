from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# ---------------- DATABASE FUNCTIONS ----------------

def connect_db():
    return sqlite3.connect("nutrient.db")

def create_tables():
    conn = connect_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        gender TEXT,
        lifestyle TEXT
    )
    """)

    # Food intake table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS food_intake (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        food_name TEXT,
        quantity INTEGER,
        date TEXT
    )
    """)

    conn.commit()
    conn.close()

# ---------------- BASIC TEST ROUTE ----------------

@app.route("/")
def home():
    return "Backend is running successfully!"

# ---------------- USER REGISTRATION API ----------------

@app.route("/register", methods=["POST"])
def register():
    data = request.json

    name = data.get("name")
    age = data.get("age")
    gender = data.get("gender")
    lifestyle = data.get("lifestyle")

    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO users (name, age, gender, lifestyle) VALUES (?, ?, ?, ?)",
        (name, age, gender, lifestyle)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "User registered successfully"})

# ---------------- FOOD INTAKE API ----------------

@app.route("/food-log", methods=["POST"])
def food_log():
    data = request.json

    user_id = data.get("user_id")
    food_name = data.get("food_name")
    quantity = data.get("quantity")
    date = data.get("date")

    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO food_intake (user_id, food_name, quantity, date) VALUES (?, ?, ?, ?)",
        (user_id, food_name, quantity, date)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Food intake logged successfully"})

# ---------------- MAIN ----------------

if __name__ == "__main__":
    create_tables()
    app.run(debug=True)
