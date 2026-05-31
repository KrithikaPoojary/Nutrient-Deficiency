from flask_cors import CORS
from flask import Flask, request, jsonify

from utils.preprocess import calculate_nutrients
from utils.prepare_input import prepare_input
from utils.recommend import recommend_food

import pandas as pd
import joblib
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import tensorflow as tf
from PIL import Image

import numpy as np

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
# LOAD CNN IMAGE MODELS
# =========================================

eye_model = tf.saved_model.load(
    "model/eye_saved_model"
)

nail_model = tf.saved_model.load(
    "model/nail_deficiency_model"
)

tongue_model = tf.saved_model.load(
    "model/tongue_deficiency_model"
)

print("✅ CNN Models Loaded")

# =========================================
# IMAGE PREDICTION FUNCTION
# =========================================

def predict_image(model, image_file):

    try:

        image = Image.open(image_file)

        image = image.convert("RGB")

        image = image.resize((224, 224))

        image = np.array(image)

        image = image / 255.0

        image = np.expand_dims(
            image,
            axis=0
        ).astype(np.float32)

        infer = model.signatures[
            "serving_default"
        ]

        prediction = infer(
            tf.constant(image)
        )

        prediction = list(
            prediction.values()
        )[0].numpy()

        score = float(
            prediction[0][0]
        )

        return round(score * 100, 2)

    except Exception as e:

        print("IMAGE ERROR:", e)

        return 0

# =========================================
# REGISTER
# =========================================

@app.route("/register", methods=["POST"])
def register():

    try:

        data = request.json

        username = (
            data["username"]
            .strip()
            .lower()
        )

        password = str(
            data["password"]
        ).strip()

        age = int(
            data.get("age", 0)
        )

        gender = int(
            data.get("gender", 1)
        )

        conditions = data.get(
            "conditions",
            ""
        )

        cursor.execute(

            "SELECT * FROM users WHERE LOWER(username)=%s",

            (username,)

        )

        existing_user = cursor.fetchone()

        if existing_user:

            return jsonify({
                "message":
                "User already exists"
            }), 400

        cursor.execute("""

            INSERT INTO users
            (
                username,
                password,
                age,
                gender,
                conditions
            )

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
            "message":
            "Registered successfully"
        })

    except Exception as e:

        print("REGISTER ERROR:", e)

        return jsonify({
            "message":
            "Registration failed"
        }), 500

# =========================================
# LOGIN
# =========================================

@app.route("/login", methods=["POST"])
def login():

    try:

        data = request.json

        username = str(
            data.get(
                "username",
                ""
            )
        ).strip().lower()

        password = str(
            data.get(
                "password",
                ""
            )
        ).strip()

        cursor.execute("""

            SELECT
                id,
                username,
                password,
                age,
                gender,
                conditions

            FROM users

            WHERE LOWER(username)=%s

        """, (username,))

        user = cursor.fetchone()

        if not user:

            return jsonify({
                "message":
                "Invalid username or password"
            }), 401

        db_password = str(
            user[2]
        ).strip()

        if password != db_password:

            return jsonify({
                "message":
                "Invalid username or password"
            }), 401

        return jsonify({

            "id": user[0],

            "username": user[1],

            "age": user[3],

            "gender": user[4],

            "conditions": user[5]

        })

    except Exception as e:

        print("LOGIN ERROR:", e)

        return jsonify({
            "message":
            "Login failed"
        }), 500

# =========================================
# FOOD SUGGESTION
# =========================================

@app.route("/suggest/<query>", methods=["GET"])
def suggest_food(query):

    try:

        query = query.lower().strip()

        if not query:
            return jsonify([])

        suggestions = df[

            df["food_name"].str.contains(
                query,
                case=False,
                na=False
            )

        ]["food_name"] \
        .dropna() \
        .unique() \
        .tolist()

        return jsonify(
            suggestions[:5]
        )

    except Exception as e:

        print("SUGGEST ERROR:", e)

        return jsonify([])

# =========================================
# PREDICT
# =========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.form

        user_id = int(
            data.get("user_id")
        )

        age = int(
            data.get("age", 0)
        )

        gender = int(
            data.get("gender", 1)
        )

        bmi = float(
            data.get("bmi", 22)
        )

        foods = json.loads(
            data.get("foods", "[]")
        )

        conditions = json.loads(
            data.get("conditions", "[]")
        )

        # =====================================
        # IMAGE FILES
        # =====================================

        eye_image = request.files.get(
            "eye"
        )

        nail_image = request.files.get(
            "nail"
        )

        tongue_image = request.files.get(
            "tongue"
        )

        # =====================================
        # SAVE FOOD LOG
        # =====================================

        if foods:

            cursor.execute("""

                INSERT INTO food_log
                (
                    user_id,
                    foods,
                    date_time
                )

                VALUES (%s, %s, %s)

            """, (

                user_id,
                json.dumps(foods),
                datetime.now()

            ))

            conn.commit()

        # =====================================
        # CALCULATE NUTRIENTS
        # =====================================

        totals = calculate_nutrients(
            foods,
            df
        )

        print(
            "TOTAL NUTRIENTS:",
            totals
        )

        # =====================================
        # CREATE INPUT
        # =====================================

        input_df = prepare_input(

            age,
            gender,
            bmi,

            totals.get(
                "protein",
                0
            ),

            totals.get(
                "iron",
                0
            ),

            totals.get(
                "vitamin_c",
                0
            ),

            totals.get(
                "vitamin_d",
                0
            ),

            totals.get(
                "fiber",
                0
            ),

            totals.get(
                "vitamin_a",
                0
            ),

            totals.get(
                "vitamin_b12",
                0
            )

        )

        # =====================================
        # LABELS
        # =====================================

        name_map = {

            "VitC_Label":
            "Vitamin C",

            "VitD_Label":
            "Vitamin D",

            "Iron_Label":
            "Iron",

            "Protein_Label":
            "Protein",

            "Fiber_Label":
            "Fiber",

            "VitA_Label":
            "Vitamin A",

            "B12_Label":
            "Vitamin B12"

        }

        status_map = {

            0: "Severe",
            1: "Normal",
            2: "Moderate"

        }

        # =====================================
        # XGBOOST PREDICTIONS
        # =====================================

        results = {}

        for model_name in models:

            model = models[model_name]

            temp_input = input_df.copy()

            expected_features = (
                model.get_booster()
                .feature_names
            )

            temp_input = temp_input[
                expected_features
            ]

            prediction = int(

                model.predict(
                    temp_input
                )[0]

            )

            status = status_map.get(
                prediction,
                "Normal"
            )

            results[
                name_map[model_name]
            ] = status

        print(
            "PREDICTIONS:",
            results
        )

        # =====================================
        # IMAGE ANALYSIS
        # =====================================

        eye_score = 0
        nail_score = 0
        tongue_score = 0

        if eye_image:

            eye_score = predict_image(
                eye_model,
                eye_image
            )

        if nail_image:

            nail_score = predict_image(
                nail_model,
                nail_image
            )

        if tongue_image:

            tongue_score = predict_image(
                tongue_model,
                tongue_image
            )

        # =====================================
        # SMART IMAGE ANALYSIS
        # =====================================

        # EYE

        if eye_score >= 80:

            eye_result = (
                f"High Anemia Risk → "
                f"{eye_score}%"
            )

        elif eye_score >= 50:

            eye_result = (
                f"Moderate Anemia Risk → "
                f"{eye_score}%"
            )

        else:

            eye_result = (
                f"Normal Eye Condition → "
                f"{eye_score}%"
            )

        # NAIL

        if nail_score >= 80:

            nail_result = (
                "Koilonychia Signs Detected"
            )

        elif nail_score >= 50:

            nail_result = (
                "Possible Nail Deficiency"
            )

        else:

            nail_result = (
                "Normal Nail Condition"
            )

        # TONGUE

        if tongue_score >= 80:

            tongue_result = (
                "Vitamin Deficiency Indicators Found"
            )

        elif tongue_score >= 50:

            tongue_result = (
                "Possible Tongue Abnormality"
            )

        else:

            tongue_result = (
                "Normal Tongue Condition"
            )

        image_analysis = {

            "eye_analysis":
            eye_result,

            "nail_analysis":
            nail_result,

            "tongue_analysis":
            tongue_result

        }

        # =====================================
        # MULTIMODAL RISK SCORE
        # =====================================

        severity_score = 0

        for status in results.values():

            if status == "Severe":
                severity_score += 3

            elif status == "Moderate":
                severity_score += 2

            else:
                severity_score += 1

        image_avg = (
            eye_score +
            nail_score +
            tongue_score
        ) / 3

        final_risk_score = (
            severity_score * 10
        ) + (
            image_avg * 0.5
        )

        final_risk_score = round(
            final_risk_score,
            2
        )

        if final_risk_score >= 70:

            risk_level = "Severe Risk"

        elif final_risk_score >= 45:

            risk_level = "Moderate Risk"

        else:

            risk_level = "Low Risk"

        # =====================================
        # RECOMMENDATIONS
        # =====================================

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

                recommendations[
                    nutrient
                ] = rec

        # =====================================
        # USERNAME
        # =====================================

        cursor.execute(

            "SELECT username FROM users WHERE id=%s",

            (user_id,)

        )

        username_row = cursor.fetchone()

        username = username_row[0]

        # =====================================
        # SAVE HISTORY
        # =====================================

        cursor.execute("""

            INSERT INTO user_history
            (
                username,
                date_time,
                age,
                bmi,
                risk_score,
                risk_level
            )

            VALUES (%s, %s, %s, %s, %s, %s)

        """, (

            str(username),
            datetime.now(),
            age,
            bmi,
            final_risk_score,
            risk_level

        ))

        conn.commit()

        history_id = cursor.lastrowid

        # =====================================
        # SAVE RESULTS
        # =====================================

        for nutrient, status in results.items():

            cursor.execute("""

                INSERT INTO nutrient_results
                (
                    history_id,
                    nutrient,
                    status
                )

                VALUES (%s, %s, %s)

            """, (

                history_id,
                nutrient,
                status

            ))

        conn.commit()

        # =====================================
        # RESPONSE
        # =====================================

        return jsonify({

            "results":
            results,

            "recommendations":
            recommendations,

            "nutrients":
            totals,

            "image_analysis":
            image_analysis,

            "risk_score":
            final_risk_score,

            "risk_level":
            risk_level

        })

    except Exception as e:

        print("PREDICT ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500

# =========================================
# TREND
# =========================================

@app.route("/trend/<username>")
def trend(username):

    try:

        cursor.execute("""

            SELECT
                h.date_time,
                h.risk_score,
                h.risk_level,
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

                trend_data[date] = {

                    "risk_score": row[1],
                    "risk_level": row[2]

                }

            trend_data[date][row[3]] = row[4]

        return jsonify(trend_data)

    except Exception as e:

        print("TREND ERROR:", e)

        return jsonify({})

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