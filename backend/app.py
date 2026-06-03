# =========================================
# IMPORTS
# =========================================

from flask_cors import CORS
from flask import Flask, request, jsonify

from utils.preprocess import calculate_nutrients
from utils.prepare_input import prepare_input
from utils.recommend import recommend_food
from utils.shap_explainer import explain_prediction

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

        host="127.0.0.1",
        user="root",
        password="mite",
        database="nutrition_tracker",
        ssl_disabled=True,
        auth_plugin='mysql_native_password'

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
# IMAGE PREDICTION
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
            data.get("bmi", 0)
        )

        foods = json.loads(
            data.get("foods", "[]")
        )

        conditions = json.loads(
            data.get("conditions", "[]")
        )

        symptoms = json.loads(
            data.get("symptoms", "[]")
        )

        eye_image = request.files.get("eye")
        nail_image = request.files.get("nail")
        tongue_image = request.files.get("tongue")

        # =====================================
        # INPUT VALIDATION
        # =====================================

        has_foods = len(foods) > 0

        has_symptoms = len(symptoms) > 0

        has_images = (

            eye_image is not None or
            nail_image is not None or
            tongue_image is not None

        )

        if not has_foods and not has_symptoms and not has_images:

            return jsonify({

                "error":
                "Please enter food intake, symptoms, or upload at least one medical image."

            }), 400

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
        # PREPARE INPUT
        # =====================================

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

        # =====================================
        # LABEL MAP
        # =====================================

        name_map = {

            "VitC_Label": "Vitamin C",
            "VitD_Label": "Vitamin D",
            "Iron_Label": "Iron",
            "Protein_Label": "Protein",
            "Fiber_Label": "Fiber",
            "VitA_Label": "Vitamin A",
            "B12_Label": "Vitamin B12"

        }

        status_map = {

            0: "Severe",
            1: "Normal",
            2: "Moderate"

        }

        # =====================================
        # PREDICTIONS
        # =====================================

        results = {}

        shap_explanations = {}

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

            nutrient_name = name_map[
                model_name
            ]

            results[
                nutrient_name
            ] = status

            try:

                top_features = explain_prediction(

                    model,
                    temp_input

                )

                shap_explanations[
                    nutrient_name
                ] = top_features

            except Exception as e:

                print(
                    "SHAP ERROR:",
                    e
                )

                shap_explanations[
                    nutrient_name
                ] = []

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

        image_analysis = {

            "eye_analysis":
            eye_score,

            "nail_analysis":
            nail_score,

            "tongue_analysis":
            tongue_score

        }

        # =====================================
        # SYMPTOM ANALYSIS
        # =====================================

        symptom_scores = {

            "hair_fall":
            ["Iron", "Protein"],

            "fatigue":
            ["Iron", "Vitamin B12"],

            "weak_nails":
            ["Iron"],

            "dry_skin":
            ["Vitamin A"],

            "mouth_ulcers":
            ["Vitamin B12"],

            "muscle_pain":
            ["Vitamin D"],

            "dizziness":
            ["Iron"],

            "poor_immunity":
            ["Vitamin C"]

        }

        symptom_analysis = []

        symptom_risk = 0

        for symptom in symptoms:

            if symptom in symptom_scores:

                affected = symptom_scores[
                    symptom
                ]

                symptom_analysis.append({

                    "symptom":
                    symptom,

                    "possible_deficiencies":
                    affected

                })

                symptom_risk += 5

        # =====================================
        # FETCH PREVIOUS HISTORY
        # =====================================

        cursor.execute("""

            SELECT
                risk_score,
                risk_level

            FROM user_history

            WHERE username=%s

            ORDER BY date_time DESC

            LIMIT 1

        """, (str(user_id),))

        previous_record = cursor.fetchone()

        previous_risk_score = 0

        previous_risk_level = "None"

        if previous_record:

            previous_risk_score = (
                previous_record[0]
            )

            previous_risk_level = (
                previous_record[1]
            )

        # =====================================
        # WEIGHTED MULTIMODAL LATE FUSION
        # =====================================

        severity_score = 0

        for status in results.values():

            if status == "Severe":

                severity_score += 25

            elif status == "Moderate":

                severity_score += 15

        image_risk = 0

        if eye_score >= 80:
            image_risk += 15

        elif eye_score >= 50:
            image_risk += 8

        if nail_score >= 80:
            image_risk += 15

        elif nail_score >= 50:
            image_risk += 8

        if tongue_score >= 80:
            image_risk += 15

        elif tongue_score >= 50:
            image_risk += 8

        food_weight = 0.5

        image_weight = 0.3

        symptom_weight = 0.2

        food_score = severity_score

        medical_image_score = image_risk

        questionnaire_score = symptom_risk

        current_session_score = (

            (food_score * food_weight)

            +

            (medical_image_score * image_weight)

            +

            (questionnaire_score * symptom_weight)

        )

        current_session_score = round(
            current_session_score,
            2
        )

        history_weight = 0

        if previous_risk_score >= 70:

            history_weight = 10

        elif previous_risk_score >= 45:

            history_weight = 5

        final_risk_score = (

            current_session_score

            +

            history_weight

        )

        final_risk_score = min(
            round(final_risk_score, 2),
            100
        )

        # =====================================
        # RISK LEVEL
        # =====================================

        if final_risk_score >= 70:

            risk_level = "High"

        elif final_risk_score >= 40:

            risk_level = "Moderate"

        else:

            risk_level = "Low"

        # =====================================
        # TREND ANALYSIS
        # =====================================

        trend_message = (
            "No previous records"
        )

        if previous_risk_score > 0:

            difference = round(

                final_risk_score
                -
                previous_risk_score,

                2
            )

            if difference > 0:

                trend_message = (

                    f"Risk Increased by "
                    f"{difference}%"

                )

            elif difference < 0:

                trend_message = (

                    f"Health Improved by "
                    f"{abs(difference)}%"

                )

            else:

                trend_message = (
                    "No significant change"
                )

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
        # SAVE USER HISTORY
        # =====================================

        cursor.execute("""

            INSERT INTO user_history (

                username,
                date_time,
                age,
                bmi,
                risk_score,
                risk_level,
                eye_score,
                nail_score,
                tongue_score

            )

            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)

        """, (

            str(user_id),

            datetime.now(),

            age,

            bmi,

            final_risk_score,

            risk_level,

            eye_score,

            nail_score,

            tongue_score

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

            "symptom_analysis":
            symptom_analysis,

            "symptoms":
            symptoms,

            "risk_score":
            final_risk_score,

            "risk_level":
            risk_level,

            "previous_risk_score":
            previous_risk_score,

            "previous_risk_level":
            previous_risk_level,

            "trend_message":
            trend_message,

            "shap_explanations": {

                k: v for k, v in
                shap_explanations.items()

                if v
            }

        })

    except Exception as e:

        print("PREDICT ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500

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
