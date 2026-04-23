from flask_cors import CORS
from flask import Flask, request, jsonify
from utils.preprocess import calculate_nutrients
from utils.recommend import recommend_food
import pandas as pd
import joblib
from datetime import datetime
import mysql.connector
import json

app = Flask(__name__)
CORS(app)

# ==============================
# MYSQL CONNECTION
# ==============================

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="mite",
        database="nutrition_tracker"
    )

conn = get_connection()
cursor = conn.cursor()

print("✅ Connected to MySQL")

# ==============================
# LOAD DATA
# ==============================

model_path = "model/nutrient_deficiency_models.pkl"
data_path = "data/cleaned_food_dataset.csv"

df = pd.read_csv(data_path)
df.columns = df.columns.str.strip().str.lower()
df["food_name"] = df["food_name"].astype(str).str.lower().str.strip()

models = joblib.load(model_path)

print("✅ Model and dataset loaded successfully!")

# ==============================
# DAILY REQUIREMENTS
# ==============================

RDA = {
    "Protein": 50,
    "Iron": 18,
    "Vitamin C": 75,
    "Vitamin D": 15,
    "Fiber": 25
}

# ==============================
# HOME
# ==============================

@app.route("/")
def home():
    return "Backend ready 🔥"

# ==============================
# REGISTER
# ==============================

@app.route("/register", methods=["POST"])
def register():
    data = request.json

    username = data["username"].strip().lower()
    password = str(data["password"]).strip()
    age = int(data.get("age", 0))
    gender = int(data.get("gender", 1))
    conditions = data.get("conditions", "")

    cursor.execute("SELECT COUNT(*) FROM users WHERE username=%s", (username,))
    if cursor.fetchone()[0] > 0:
        return jsonify({"message": "User already exists"}), 400

    cursor.execute("""
        INSERT INTO users (username, password, age, gender, conditions)
        VALUES (%s, %s, %s, %s, %s)
    """, (username, password, age, gender, conditions))

    conn.commit()
    return jsonify({"message": "Registered successfully"})

# ==============================
# LOGIN
# ==============================

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    username = data["username"].strip().lower()
    password = str(data["password"]).strip()

    cursor.execute(
        "SELECT * FROM users WHERE username=%s AND password=%s",
        (username, password)
    )

    user = cursor.fetchone()

    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({
        "id": user[0],
        "username": user[1],
        "age": user[3],
        "gender": user[4],
        "conditions": user[5]
    })

# ==============================
# 🔥 FOOD SUGGESTION API (FIXED POSITION)
# ==============================

@app.route("/suggest/<query>", methods=["GET"])
def suggest_food(query):
    query = query.lower()

    suggestions = df[
        df["food_name"].str.contains(query, case=False, na=False)
    ]["food_name"].unique().tolist()

    return jsonify(suggestions[:5])

# ==============================
# PREDICT
# ==============================

@app.route("/predict", methods=["POST"])
def predict():
    global conn, cursor

    try:
        if not conn.is_connected():
            conn = get_connection()
            cursor = conn.cursor()

        data = request.json

        user_id = data.get("user_id")
        age = int(data.get("age", 0))
        gender = int(data.get("gender", 1))
        bmi = float(data.get("bmi", 22))
        conditions = data.get("conditions", [])
        today_foods = data.get("foods", [])

        if not user_id:
            return jsonify({"error": "User ID missing"}), 400

        # SAVE FOOD
        if today_foods:
            cursor.execute("""
                INSERT INTO food_log (user_id, foods, date_time)
                VALUES (%s, %s, %s)
            """, (user_id, json.dumps(today_foods), datetime.now()))
            conn.commit()

        # FETCH HISTORY
        cursor.execute("SELECT foods FROM food_log WHERE user_id=%s", (user_id,))
        rows = cursor.fetchall()

        all_foods = []
        for row in rows:
            try:
                parsed = json.loads(row[0])
                if isinstance(parsed, list):
                    all_foods.extend(parsed)
            except:
                continue

        if not all_foods:
            all_foods = today_foods

        # NUTRIENTS
        totals = calculate_nutrients(all_foods, df)

        # ==============================
        # DEFICIENCY LOGIC
        # ==============================

        results = {}

        value_map = {
            "Protein": totals["protein"],
            "Iron": totals["iron"],
            "Vitamin C": totals["vitamin_c"],
            "Vitamin D": totals["vitamin_d"],
            "Fiber": totals["fiber"]
        }

        for nutrient, value in value_map.items():
            required = RDA[nutrient]
            ratio = value / required if required > 0 else 0

            if ratio < 0.4:
                status = "Severe"
            elif ratio < 0.7:
                status = "Moderate"
            elif ratio < 1.0:
                status = "Mild"
            else:
                status = "Normal"

            results[nutrient] = status

        # ==============================
        # RECOMMENDATIONS
        # ==============================

        recommendations = {}

        for nutrient, status in results.items():
            if status != "Normal":
                rec_data = recommend_food(nutrient, df, age, conditions, status)

                recommendations[nutrient] = {
                    "foods": rec_data.get("top_foods", []),
                    "plan": rec_data.get("plan", {})
                }

        # SAVE HISTORY
        cursor.execute("SELECT username FROM users WHERE id=%s", (user_id,))
        username = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO user_history (username, date_time, age, bmi)
            VALUES (%s, %s, %s, %s)
        """, (username, datetime.now(), age, bmi))

        conn.commit()
        history_id = cursor.lastrowid

        for nutrient, status in results.items():
            recs = recommendations.get(nutrient, {}).get("foods", [])

            cursor.execute("""
                INSERT INTO nutrient_results (history_id, nutrient, status, recommendations)
                VALUES (%s, %s, %s, %s)
            """, (
                history_id,
                nutrient,
                status,
                ", ".join(recs)
            ))

        conn.commit()

        return jsonify({
            "results": results,
            "recommendations": recommendations
        })

    except Exception as e:
        print("❌ ERROR:", str(e))
        return jsonify({"error": "Prediction failed"}), 500

# ==============================
# TREND API
# ==============================

@app.route("/trend/<username>", methods=["GET"])
def trend(username):

    cursor.execute("""
        SELECT h.date_time, n.nutrient, n.status
        FROM user_history h
        JOIN nutrient_results n ON h.id = n.history_id
        WHERE h.username = %s
        ORDER BY h.date_time
    """, (username,))

    rows = cursor.fetchall()

    trend = {}

    for row in rows:
        date = str(row[0])
        nutrient = row[1]
        status = row[2]

        if date not in trend:
            trend[date] = {}

        trend[date][nutrient] = status

    return jsonify(trend)

# ==============================

if __name__ == "__main__":
    app.run(debug=True)