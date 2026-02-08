from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import numpy as np
import joblib

app = Flask(__name__)
CORS(app)

# ---------- DB ----------
def connect_db():
    return sqlite3.connect("nutrient.db")

def create_tables():
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        gender TEXT,
        lifestyle TEXT
    )
    """)

    cur.execute("""
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

# ---------- FOOD MAP ----------
food_nutrients = {
    "rice": {"iron": 1, "vitamin_b12": 0, "vitamin_d": 0},
    "milk": {"iron": 0, "vitamin_b12": 1, "vitamin_d": 1},
    "egg": {"iron": 1, "vitamin_b12": 2, "vitamin_d": 1},
    "spinach": {"iron": 3, "vitamin_b12": 0, "vitamin_d": 0},
    "banana": {"iron": 1, "vitamin_b12": 0, "vitamin_d": 0}
}

RDI = {"iron": 18, "vitamin_b12": 2, "vitamin_d": 15}

# ---------- ROUTES ----------
@app.route("/")
def home():
    return "Backend running"

@app.route("/register", methods=["POST"])
def register():
    d = request.json
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO users (name, age, gender, lifestyle) VALUES (?, ?, ?, ?)",
        (d["name"], d["age"], d["gender"], d["lifestyle"])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Registered"})

@app.route("/food-log", methods=["POST"])
def food_log():
    d = request.json
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO food_intake (user_id, food_name, quantity, date) VALUES (?, ?, ?, ?)",
        (d["user_id"], d["food_name"].lower(), d["quantity"], d["date"])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Food logged"})

# ---------- HELPERS ----------
def get_food_logs(user_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT food_name, quantity FROM food_intake WHERE user_id=?", (user_id,))
    rows = cur.fetchall()
    conn.close()
    return [{"food": r[0], "qty": r[1]} for r in rows]

def calculate_nutrients(logs):
    total = {"iron": 0, "vitamin_b12": 0, "vitamin_d": 0}
    for i in logs:
        if i["food"] in food_nutrients:
            for n in total:
                total[n] += food_nutrients[i["food"]][n] * i["qty"]
    return total

def detect_deficiency(n):
    return {k: ("Deficient" if n[k] < RDI[k] else "Normal") for k in n}

def load_model():
    return joblib.load("severity_model.pkl")

def predict_severity(nutrients):
    model = load_model()
    X = np.array([[nutrients["iron"], nutrients["vitamin_b12"], nutrients["vitamin_d"]]])
    pred = model.predict(X)[0]
    return str(pred)   # 🔥 FIXED

def get_lifestyle(user_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT lifestyle FROM users WHERE id=?", (user_id,))
    row = cur.fetchone()
    conn.close()
    return row[0] if row else None

def recommendations(severity, lifestyle):
    rec = []
    if severity == "Severe":
        rec.append("Consult doctor immediately")
    elif severity == "Moderate":
        rec.append("Follow diet plan & supplements")
    else:
        rec.append("Maintain current diet")

    if lifestyle == "indoor":
        rec.append("Increase sunlight exposure")
    return rec

# ---------- FINAL API ----------
@app.route("/analysis/<int:user_id>")
def analysis(user_id):
    logs = get_food_logs(user_id)
    nutrients = calculate_nutrients(logs)
    deficiency = detect_deficiency(nutrients)
    severity = predict_severity(nutrients)
    lifestyle = get_lifestyle(user_id)

    if lifestyle is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "nutrient_intake": nutrients,
        "deficiency_status": deficiency,
        "predicted_severity": severity,
        "personalized_recommendations": recommendations(severity, lifestyle)
    })

# ---------- RUN ----------
if __name__ == "__main__":
    create_tables()
    app.run(debug=True)
