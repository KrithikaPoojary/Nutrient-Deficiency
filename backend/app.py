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

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        gender TEXT,
        lifestyle TEXT
    )
    """)

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

food_nutrients = {
    "rice": {"iron": 1, "vitamin_b12": 0, "vitamin_d": 0},
    "milk": {"iron": 0, "vitamin_b12": 1, "vitamin_d": 1},
    "egg": {"iron": 1, "vitamin_b12": 2, "vitamin_d": 1},
    "spinach": {"iron": 3, "vitamin_b12": 0, "vitamin_d": 0},
    "banana": {"iron": 1, "vitamin_b12": 0, "vitamin_d": 0}
}

# ---------------- RECOMMENDED DAILY INTAKE ----------------

RDI = {
    "iron": 18,
    "vitamin_b12": 2,
    "vitamin_d": 15
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
        (data["name"], data["age"], data["gender"], data["lifestyle"])
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
        (data["user_id"], data["food_name"].lower(), data["quantity"], data["date"])
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

    return [{"food_name": row[0], "quantity": row[1]} for row in rows]

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

# ---------------- DEFICIENCY DETECTION ----------------

def detect_deficiency(nutrients):
    return {
        nutrient: "Deficient" if value < RDI[nutrient] else "Normal"
        for nutrient, value in nutrients.items()
    }

# ---------------- SEVERITY LEVEL DETECTION ----------------

def detect_severity(nutrients):
    severity = {}

    for nutrient, value in nutrients.items():
        req = RDI[nutrient]
        if value >= req:
            severity[nutrient] = "Normal"
        elif value >= 0.7 * req:
            severity[nutrient] = "Mild"
        elif value >= 0.4 * req:
            severity[nutrient] = "Moderate"
        else:
            severity[nutrient] = "Severe"

    return severity

# ---------------- USER DETAILS ----------------

def get_user_details(user_id):
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT age, gender, lifestyle FROM users WHERE id = ?",
        (user_id,)
    )

    row = cursor.fetchone()
    conn.close()

    return {"age": row[0], "gender": row[1], "lifestyle": row[2]} if row else None

# ---------------- PERSONALIZED RECOMMENDATIONS ----------------

def generate_recommendations(severity, lifestyle):
    rec = {}

    for nutrient, level in severity.items():
        if level == "Normal":
            rec[nutrient] = "Maintain current diet."

        elif nutrient == "iron":
            rec[nutrient] = (
                "Increase leafy vegetables and pulses."
                if level != "Severe"
                else "Consult doctor and take iron supplements."
            )

        elif nutrient == "vitamin_b12":
            rec[nutrient] = (
                "Consume milk and eggs."
                if level != "Severe"
                else "Medical consultation recommended."
            )

        elif nutrient == "vitamin_d":
            rec[nutrient] = (
                "Increase sunlight exposure."
                if lifestyle == "indoor"
                else "Maintain sunlight and balanced diet."
            )

    return rec

# ---------------- FINAL API ----------------

@app.route("/analysis/<int:user_id>", methods=["GET"])
def full_analysis(user_id):
    food_logs = get_food_logs(user_id)
    nutrients = calculate_nutrients(food_logs)
    deficiency = detect_deficiency(nutrients)
    severity = detect_severity(nutrients)
    user = get_user_details(user_id)

    if user is None:
        return jsonify({"error": "User not found. Please register the user first."})

    recommendations = generate_recommendations(severity, user["lifestyle"])


    return jsonify({
        "nutrient_intake": nutrients,
        "deficiency_status": deficiency,
        "severity_level": severity,
        "personalized_recommendations": recommendations
    })

# ---------------- MONITORING (HISTORY) ----------------

@app.route("/history/<int:user_id>", methods=["GET"])
def history(user_id):
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT food_name, quantity, date FROM food_intake WHERE user_id = ?",
        (user_id,)
    )

    rows = cursor.fetchall()
    conn.close()

    return jsonify([
        {"food": row[0], "quantity": row[1], "date": row[2]}
        for row in rows
    ])

# ---------------- MAIN ----------------

if __name__ == "__main__":
    create_tables()
    app.run(debug=True)
