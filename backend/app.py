from flask_cors import CORS
from flask import Flask, request, jsonify
from utils.preprocess import calculate_nutrients, prepare_input
from utils.recommend import recommend_food
import pandas as pd
import joblib
from datetime import datetime
import mysql.connector

app = Flask(__name__)
CORS(app)

# ==============================
# MYSQL CONNECTION
# ==============================

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="mite",
    database="nutrition_tracker"
)

cursor = conn.cursor()

print("✅ Connected to MySQL")

# ==============================
# LOAD DATA
# ==============================

model_path = "model/nutrient_deficiency_models.pkl"
data_path = "data/updated_food_dataset.csv"

df = pd.read_csv(data_path)
df["food_name"] = df["food_name"].str.lower()

models = joblib.load(model_path)

print("✅ Model and dataset loaded successfully!")

# ==============================
# HOME
# ==============================

@app.route("/")
def home():
    return "Backend ready with ML + MySQL 🔥"

# ==============================
# REGISTER
# ==============================

@app.route("/register", methods=["POST"])
def register():
    data = request.json

    username = data["username"].strip().lower()
    password = str(data["password"]).strip()

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    if cursor.fetchone():
        return jsonify({"message": "User already exists"}), 400

    cursor.execute(
        "INSERT INTO users (username, password) VALUES (%s, %s)",
        (username, password)
    )
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

    if not cursor.fetchone():
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful", "username": username})

# ==============================
# PREDICT
# ==============================

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    if "username" not in data:
        return jsonify({"error": "Username missing"}), 400

    username = data["username"]
    age = int(data["age"])
    gender = int(data["gender"])
    bmi = float(data["bmi"]) if data.get("bmi") else 22

    conditions = data["conditions"]
    all_foods = data["foods"]

    # ==============================
    # NUTRIENTS CALCULATION
    # ==============================

    totals = calculate_nutrients(all_foods, df)

    if totals is None:
        return jsonify({"error": "No matching foods found"}), 400

    input_df = prepare_input(
        age, gender, bmi,
        totals["protein"],
        totals["iron"],
        totals["vitamin_c"],
        totals["vitamin_d"],
        totals["fiber"]
    )

    remove_map = {
        "Iron_Label": "DR1TIRON",
        "Protein_Label": "DR1TPROT",
        "VitC_Label": "DR1TVC",
        "VitD_Label": "DR1TVD",
        "Fiber_Label": "DR1TFIBE"
    }

    name_map = {
        "VitC_Label": "Vitamin C",
        "VitD_Label": "Vitamin D",
        "Iron_Label": "Iron",
        "Protein_Label": "Protein",
        "Fiber_Label": "Fiber"
    }

    results = {}

    for model_name in models:
        temp_df = input_df.copy()

        if remove_map[model_name] in temp_df.columns:
            temp_df = temp_df.drop(columns=[remove_map[model_name]])

        pred = models[model_name].predict(temp_df)[0]
        results[name_map[model_name]] = pred

    # ==============================
    # RECOMMENDATIONS
    # ==============================

    recommendations = {}

    for nutrient, status in results.items():
        if status != "Normal":
            foods = recommend_food(nutrient, df, age, conditions)
            recommendations[nutrient] = foods["food_name"].tolist()

    # ==============================
    # SAVE TO MYSQL (NEW STRUCTURE)
    # ==============================

    # 1️⃣ Save main record
    cursor.execute("""
    INSERT INTO user_history (username, date_time, age, bmi)
    VALUES (%s, %s, %s, %s)
    """, (
        username,
        datetime.now(),
        age,
        bmi
    ))

    conn.commit()

    history_id = cursor.lastrowid

    # 2️⃣ Save each nutrient
    for nutrient, status in results.items():
        recs = recommendations.get(nutrient, [])

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

# ==============================
# HISTORY API
# ==============================

@app.route("/history/<username>", methods=["GET"])
def get_user_history(username):

    cursor.execute("""
    SELECT h.id, h.date_time, h.bmi, n.nutrient, n.status, n.recommendations
    FROM user_history h
    JOIN nutrient_results n ON h.id = n.history_id
    WHERE h.username = %s
    ORDER BY h.date_time DESC
    """, (username,))

    rows = cursor.fetchall()

    history = {}

    for row in rows:
        h_id = row[0]

        if h_id not in history:
            history[h_id] = {
                "date": str(row[1]),
                "bmi": row[2],
                "results": []
            }

        history[h_id]["results"].append({
            "nutrient": row[3],
            "status": row[4],
            "recommendations": row[5]
        })

    return jsonify(list(history.values()))

# ==============================

if __name__ == "__main__":
    app.run(debug=True)