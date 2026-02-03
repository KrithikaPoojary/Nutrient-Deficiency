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

# ---------------- FOOD → NUTRIENT MAPPING ----------------
# Simple relative values (can be improved later)

food_nutrients = {
    "rice": {"iron": 1, "vitamin_b12": 0, "vitamin_d": 0},
    "milk": {"iron": 0, "vitamin_b12": 1, "vitamin_d": 1},
    "egg": {"iron": 1, "vitamin_b12": 2, "vitamin_d": 1},
    "spinach": {"iron": 3, "vitamin_b12": 0, "vitamin_d": 0},
    "banana": {"iron": 1, "vitamin_b12": 0, "vitamin_d": 0}
}

# ---------------- BASIC ROUTE ----------------

@app.route("/")
def home():
    return "Backend is running successfully!"

# ---------------- USER REGISTRATION ----------------

@app.route("/register", methods=["POST"])
def register():
    data = request.json

    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO users (name, age, gender, lifestyle) VALUES (?, ?, ?, ?)",
        (
            data.get("name"),
            data.get("age"),
            data.get("gender"),
            data.get("lifestyle")
        )
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "User registered successfully"})

# ---------------- FOOD LOGGING ----------------

@app.route("/food-log", methods=["POST"])
def food_log():
    data = request.json

    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO food_intake (user_id, food_name, quantity, date) VALUES (?, ?, ?, ?)",
        (
            data.get("user_id"),
            data.get("food_name").lower(),
            data.get("quantity"),
            data.get("date")
        )
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Food intake logged successfully"})

# ---------------- FETCH FOOD LOGS ----------------

def get_food_logs(user_id):
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT food_name, quantity FROM food_intake WHERE user_id = ?",
        (user_id,)
    )

    rows = cursor.fetchall()
    conn.close()

    food_logs = []
    for row in rows:
        food_logs.append({
            "food_name": row[0],
            "quantity": row[1]
        })

    return food_logs

# ---------------- NUTRIENT CALCULATION ----------------

def calculate_nutrients(food_logs):
    totals = {"iron": 0, "vitamin_b12": 0, "vitamin_d": 0}

    for item in food_logs:
        food = item["food_name"]
        quantity = item["quantity"]

        if food in food_nutrients:
            for nutrient in totals:
                totals[nutrient] += food_nutrients[food][nutrient] * quantity

    return totals

# ---------------- NUTRIENT SUMMARY API ----------------

@app.route("/nutrient-summary/<int:user_id>", methods=["GET"])
def nutrient_summary(user_id):
    food_logs = get_food_logs(user_id)
    totals = calculate_nutrients(food_logs)

    return jsonify(totals)

# ---------------- MAIN ----------------

if __name__ == "__main__":
    create_tables()
    app.run(debug=True)
