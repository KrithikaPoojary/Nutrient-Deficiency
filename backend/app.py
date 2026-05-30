
from flask_cors import CORS
from flask import Flask, request, jsonify

from utils.preprocess import calculate_nutrients
from utils.prepare_input import prepare_input
from utils.recommend import recommend_food

import pandas as pd
import joblib

from datetime import datetime

import mysql.connector
import json

# =========================================
# FLASK
# =========================================

app = Flask(__name__)
CORS(app)

# =========================================
# MYSQL CONNECTION
# =========================================

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

# =========================================
# LOAD DATASET
# =========================================

model_path = "model/final_balanced_xgboost.pkl"
data_path = "data/cleaned_food_dataset_v3.csv"

df = pd.read_csv(data_path)

df.columns = (
    df.columns
    .str.strip()
    .str.lower()
)

df["food_name"] = (
    df["food_name"]
    .astype(str)
    .str.lower()
    .str.strip()
)

df = df.drop_duplicates(
    subset=["food_name"]
).reset_index(drop=True)

# =========================================
# LOAD XGBOOST MODELS
# =========================================

models = joblib.load(model_path)

print("✅ XGBoost Models Loaded")

# =========================================
# REGISTER
# =========================================

@app.route("/register", methods=["POST"])
def register():

    data = request.json

    username = data["username"].strip().lower()
    password = str(data["password"]).strip()

    age = int(data.get("age", 0))
    gender = int(data.get("gender", 1))

    conditions = data.get("conditions", "")

    cursor.execute(
        "SELECT * FROM users WHERE LOWER(username)=%s",
        (username,)
    )

    existing_user = cursor.fetchone()

    if existing_user:

        return jsonify({
            "message": "User already exists"
        }), 400

    cursor.execute("""

        INSERT INTO users
        (username, password, age, gender, conditions)

        VALUES (%s, %s, %s, %s, %s)

    """, (

        username,
        password,
        age,
        gender,
        conditions

    ))

    conn.commit()

    return jsonify({
        "message": "Registered successfully"
    })

# =========================================
# LOGIN
# =========================================

@app.route("/login", methods=["POST"])
def login():

    data = request.json

    username = data.get(
        "username",
        ""
    ).strip().lower()

    password = str(
        data.get("password", "")
    ).strip()

    cursor.execute("SELECT * FROM users")

    users = cursor.fetchall()

    for user in users:

        db_username = str(user[1]).strip().lower()
        db_password = str(user[2]).strip()

        if (
            username == db_username
            and
            password == db_password
        ):

            return jsonify({

                "id": user[0],
                "username": user[1],
                "age": user[3],
                "gender": user[4],
                "conditions": user[5]

            })

    return jsonify({
        "message": "Invalid username or password"
    }), 401

# =========================================
# FOOD SUGGESTION
# =========================================

@app.route("/suggest/<query>", methods=["GET"])
def suggest_food(query):

    query = query.lower().strip()

    if not query:
        return jsonify([])

    suggestions = df[

        df["food_name"].str.contains(
            query,
            case=False,
            na=False
        )

    ]["food_name"].dropna().unique().tolist()

    return jsonify(suggestions[:5])

# =========================================
# PREDICT
# =========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.json

        user_id = data.get("user_id")

        age = int(data.get("age", 0))
        gender = int(data.get("gender", 1))

        bmi = float(data.get("bmi", 22))

        conditions = data.get("conditions", [])
        foods = data.get("foods", [])

        # =========================================
        # SAVE FOOD LOG
        # =========================================

        if foods:

            cursor.execute("""

                INSERT INTO food_log
                (user_id, foods, date_time)

                VALUES (%s, %s, %s)

            """, (

                int(user_id),
                json.dumps(foods),
                datetime.now()

            ))

            conn.commit()

        # =========================================
        # CALCULATE NUTRIENTS
        # =========================================

        totals = calculate_nutrients(
            foods,
            df
        )

        print("TOTAL NUTRIENTS:", totals)

        # =========================================
        # CREATE INPUT DATAFRAME
        # =========================================

        input_df = prepare_input(

            age,
            gender,
            bmi,

            totals.get("protein", 0),
            totals.get("iron", 0),
            totals.get("vitamin_c", 0),
            totals.get("vitamin_d", 0),
            totals.get("fiber", 0),
            totals.get("vitamin_a", 0),
            totals.get("vitamin_b12", 0)

        )

        print(input_df)

        # =========================================
        # MODEL PREDICTIONS
        # =========================================

        name_map = {

            "VitC_Label": "Vitamin C",
            "VitD_Label": "Vitamin D",
            "Iron_Label": "Iron",
            "Protein_Label": "Protein",
            "Fiber_Label": "Fiber",
            "VitA_Label": "Vitamin A",
            "B12_Label": "Vitamin B12"

        }

        # =========================================
        # STATUS LABELS
        # =========================================

        status_map = {

            0: "Severe",
            1: "Normal",
            2: "Moderate"

        }

        results = {}

        for model_name in models:

            model = models[model_name]

            temp_input = input_df.copy()

            expected_features = (
                model.get_booster().feature_names
            )

            temp_input = temp_input[
                expected_features
            ]

            prediction = int(

                model.predict(
                    temp_input
                )[0]

            )

            status = status_map[prediction]

            results[
                name_map[model_name]
            ] = status

        print("PREDICTIONS:", results)

        # =========================================
        # RECOMMENDATIONS
        # =========================================

        recommendations = {}

        for nutrient, status in results.items():

            if status != "Normal":

                rec = recommend_food(

                    nutrient,
                    df,
                    age,
                    conditions,
                    status

                )

                recommendations[nutrient] = rec

        # =========================================
        # SAVE HISTORY
        # =========================================

        cursor.execute(

            "SELECT username FROM users WHERE id=%s",

            (int(user_id),)

        )

        username = cursor.fetchone()[0]

        cursor.execute("""

            INSERT INTO user_history
            (username, date_time, age, bmi)

            VALUES (%s, %s, %s, %s)

        """, (

            str(username),
            datetime.now(),
            int(age),
            float(bmi)

        ))

        conn.commit()

        history_id = cursor.lastrowid

        # =========================================
        # SAVE RESULTS
        # =========================================

        for nutrient, status in results.items():

            cursor.execute("""

                INSERT INTO nutrient_results
                (history_id, nutrient, status)

                VALUES (%s, %s, %s)

            """, (

                int(history_id),
                str(nutrient),
                str(status)

            ))

        conn.commit()

        # =========================================
        # RESPONSE
        # =========================================

        return jsonify({

            "results": results,
            "recommendations": recommendations,
            "nutrients": totals

        })

    except Exception as e:

        print("ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500

# =========================================
# TREND / HISTORY
# =========================================

@app.route("/trend/<username>")
def trend(username):

    cursor.execute("""

        SELECT
            h.date_time,
            n.nutrient,
            n.status

        FROM user_history h

        JOIN nutrient_results n
        ON h.id = n.history_id

        WHERE h.username = %s

        ORDER BY h.date_time

    """, (username,))

    rows = cursor.fetchall()

    trend_data = {}

    for row in rows:

        date = str(row[0])

        if date not in trend_data:
            trend_data[date] = {}

        trend_data[date][row[1]] = row[2]

    return jsonify(trend_data)

# =========================================
# HOME
# =========================================

@app.route("/")
def home():

    return "Nutrition Backend Running"

# =========================================
# RUN
# =========================================

if __name__ == "__main__":
    app.run(debug=True)

