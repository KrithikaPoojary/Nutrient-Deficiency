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
df = df.drop_duplicates(subset=["food_name"]).reset_index(drop=True)

models = joblib.load(model_path)

print("✅ Model loaded")

# ==============================
# RDA
# ==============================

RDA = {
    "Protein": 50,
    "Iron": 18,
    "Vitamin C": 75,
    "Vitamin D": 15,
    "Fiber": 25
}

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

    cursor.execute("SELECT * FROM users WHERE LOWER(username)=%s", (username,))
    if cursor.fetchone():
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

    username = data.get("username", "").strip().lower()
    password = str(data.get("password", "")).strip()

    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()

    for user in users:
        db_username = str(user[1]).strip().lower()
        db_password = str(user[2]).strip()

        if username == db_username and password == db_password:
            return jsonify({
                "id": user[0],
                "username": user[1],
                "age": user[3],
                "gender": user[4],
                "conditions": user[5]
            })

    return jsonify({"message": "Invalid username or password"}), 401

# ==============================
# 🔥 SUGGEST (FIXED)
# ==============================

@app.route("/suggest/<query>", methods=["GET"])
def suggest_food(query):
    query = query.lower().strip()

    if not query:
        return jsonify([])

    suggestions = df[
        df["food_name"].str.contains(query, case=False, na=False)
    ]["food_name"].dropna().unique().tolist()

    return jsonify(suggestions[:5])

# ==============================
# PREDICT + SAVE HISTORY
# ==============================

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        user_id = data.get("user_id")
        age = int(data.get("age", 0))
        bmi = float(data.get("bmi", 22))
        conditions = data.get("conditions", [])
        foods = data.get("foods", [])

        if foods:
            cursor.execute("""
                INSERT INTO food_log (user_id, foods, date_time)
                VALUES (%s, %s, %s)
            """, (user_id, json.dumps(foods), datetime.now()))
            conn.commit()

        totals = calculate_nutrients(foods, df)

        results = {}
        for key in RDA:
            val = totals[key.lower().replace(" ", "_")]
            percent = (val / RDA[key]) * 100

            if percent < 50:
                results[key] = "Severe"
            elif percent < 75:
                results[key] = "Moderate"
            elif percent < 90:
                results[key] = "Mild"
            else:
                results[key] = "Normal"

        recommendations = {}

        for k, v in results.items():
            if v != "Normal":
                rec = recommend_food(k, df, age, conditions, v)
                recommendations[k] = rec

        # SAVE HISTORY
        cursor.execute("SELECT username FROM users WHERE id=%s", (user_id,))
        username = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO user_history (username, date_time, age, bmi)
            VALUES (%s, %s, %s, %s)
        """, (username, datetime.now(), age, bmi))

        conn.commit()
        history_id = cursor.lastrowid

        for k, v in results.items():
            cursor.execute("""
                INSERT INTO nutrient_results (history_id, nutrient, status)
                VALUES (%s, %s, %s)
            """, (history_id, k, v))

        conn.commit()

        return jsonify({
            "results": results,
            "recommendations": recommendations,
            "nutrients": totals,
            "rda": RDA
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Prediction failed"}), 500

# ==============================
# TREND
# ==============================

@app.route("/trend/<username>")
def trend(username):

    cursor.execute("""
        SELECT h.date_time, n.nutrient, n.status
        FROM user_history h
        JOIN nutrient_results n ON h.id = n.history_id
        WHERE h.username = %s
        ORDER BY h.date_time
    """, (username,))

    rows = cursor.fetchall()

    trend_data = {}

    for r in rows:
        date = str(r[0])
        if date not in trend_data:
            trend_data[date] = {}
        trend_data[date][r[1]] = r[2]

    return jsonify(trend_data)

# ==============================

if __name__ == "__main__":
    app.run(debug=True)