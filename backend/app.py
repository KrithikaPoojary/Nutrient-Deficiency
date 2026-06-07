# =========================================
# IMPORTS
# =========================================

from flask_cors import CORS
from flask import Flask, request, jsonify, send_from_directory

from utils.preprocess import calculate_nutrients
from utils.prepare_input import prepare_input
from utils.recommend import recommend_food
from utils.shap_explainer import explain_prediction
from utils.gradcam import generate_gradcam

import pandas as pd
import joblib
import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import tensorflow as tf
from PIL import Image

import numpy as np

from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

import mysql.connector
import json
import shap
import sys
import xgboost

print("=" * 50)
print("PYTHON :", sys.version)
print("SHAP   :", shap.__version__)
print("XGBOOST:", xgboost.__version__)
print("=" * 50)
sys.stdout.flush()

# =========================================
# FLASK
# =========================================

app = Flask(__name__)
CORS(app)

# =========================================
# ABSOLUTE PATH FOR STATIC FOLDER
# =========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
os.makedirs(STATIC_DIR, exist_ok=True)

# =========================================
# SERVE STATIC FILES
# =========================================

@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory(STATIC_DIR, filename)

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
        auth_plugin="mysql_native_password",
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
df.columns = df.columns.str.strip().str.lower()
df["food_name"] = df["food_name"].astype(str).str.lower().str.strip()
df = df.drop_duplicates(subset=["food_name"]).reset_index(drop=True)

# =========================================
# LOAD XGBOOST MODELS
# =========================================

models = joblib.load(model_path)
print("✅ XGBoost Models Loaded")

# =========================================
# LOAD CNN IMAGE MODELS
# =========================================

eye_model   = tf.saved_model.load("model/eye_saved_model")
nail_model  = tf.saved_model.load("model/nail_deficiency_model")
tongue_model = tf.saved_model.load("model/tongue_deficiency_model")
print("✅ CNN Models Loaded")

# =========================================
# THREAD POOL  (reused across requests)
# =========================================

executor = ThreadPoolExecutor(max_workers=4)

# =========================================
# HELPERS
# =========================================

def gradcam_save_path(filename):
    """Returns (absolute_path_on_disk, url_for_frontend)"""
    abs_path = os.path.join(STATIC_DIR, filename)
    url = f"http://localhost:5000/static/{filename}"
    return abs_path, url


def read_image_bytes(image_file):
    """Read uploaded file bytes once so we can reuse across threads."""
    image_file.seek(0)
    return image_file.read()


def predict_image_from_bytes(model, image_bytes):
    """Run CNN prediction from raw bytes."""
    try:
        from io import BytesIO
        image = Image.open(BytesIO(image_bytes)).convert("RGB").resize((224, 224))
        arr = np.expand_dims(np.array(image) / 255.0, axis=0).astype(np.float32)
        infer = model.signatures["serving_default"]
        prediction = list(infer(tf.constant(arr)).values())[0].numpy()
        return round(float(prediction[0][0]) * 100, 2)
    except Exception as e:
        print("IMAGE ERROR:", e)
        return 0


def preprocess_for_gradcam_bytes(image_bytes):
    """Preprocess image bytes → (1,224,224,3) float32 array."""
    from io import BytesIO
    image = Image.open(BytesIO(image_bytes)).convert("RGB").resize((224, 224))
    arr = np.expand_dims(np.array(image) / 255.0, axis=0).astype(np.float32)
    return arr


# =========================================
# REGISTER
# =========================================

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        username  = data["username"].strip().lower()
        password  = str(data["password"]).strip()
        age       = int(data.get("age", 0))
        gender    = int(data.get("gender", 1))
        conditions = data.get("conditions", "")

        cursor.execute("SELECT * FROM users WHERE LOWER(username)=%s", (username,))
        if cursor.fetchone():
            return jsonify({"message": "User already exists"}), 400

        cursor.execute(
            "INSERT INTO users (username, password, age, gender, conditions) VALUES (%s,%s,%s,%s,%s)",
            (username, password, age, gender, conditions),
        )
        conn.commit()
        return jsonify({"message": "Registered successfully"})
    except Exception as e:
        print("REGISTER ERROR:", e)
        return jsonify({"message": "Registration failed"}), 500


# =========================================
# LOGIN
# =========================================

@app.route("/login", methods=["POST"])
def login():
    try:
        data     = request.json
        username = str(data.get("username", "")).strip().lower()
        password = str(data.get("password", "")).strip()

        cursor.execute(
            "SELECT id, username, password, age, gender, conditions FROM users WHERE LOWER(username)=%s",
            (username,),
        )
        user = cursor.fetchone()
        if not user or str(user[2]).strip() != password:
            return jsonify({"message": "Invalid username or password"}), 401

        return jsonify({"id": user[0], "username": user[1], "age": user[3], "gender": user[4], "conditions": user[5]})
    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"message": "Login failed"}), 500


# =========================================
# FOOD SUGGESTION
# =========================================

@app.route("/suggest/<query>", methods=["GET"])
def suggest_food(query):
    try:
        query = query.lower().strip()
        if not query:
            return jsonify([])
        suggestions = (
            df[df["food_name"].str.contains(query, case=False, na=False)]["food_name"]
            .dropna().unique().tolist()
        )
        return jsonify(suggestions[:5])
    except Exception as e:
        print("SUGGEST ERROR:", e)
        return jsonify([])


# =========================================
# PREDICT  (fast — no SHAP, no GradCAM)
# =========================================

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.form

        user_id            = int(data.get("user_id"))
        age                = int(data.get("age", 0))
        gender             = int(data.get("gender", 1))
        bmi                = float(data.get("bmi", 0))
        height             = float(data.get("height") or 0)
        weight             = float(data.get("weight") or 0)
        activity           = data.get("activity", "")
        sleep_hours        = data.get("sleep_hours", "")
        water_intake       = data.get("water_intake", "")
        diet_type          = data.get("diet_type", "")
        sunlight_exposure  = data.get("sunlight_exposure", "")
        fruit_intake       = data.get("fruit_intake", "")
        vegetable_intake   = data.get("vegetable_intake", "")
        meals_per_day      = data.get("meals_per_day", "")
        foods              = json.loads(data.get("foods", "[]"))
        conditions         = json.loads(data.get("conditions", "[]"))
        symptoms           = json.loads(data.get("symptoms", "[]"))

        eye_image    = request.files.get("eye")
        nail_image   = request.files.get("nail")
        tongue_image = request.files.get("tongue")

        # ── Validation ────────────────────────────────────────────────────────
        if not foods and not symptoms and not eye_image and not nail_image and not tongue_image:
            return jsonify({"error": "Please enter food intake, symptoms, or upload at least one medical image."}), 400

        questionnaire = {
            "height": height, "weight": weight, "bmi": bmi,
            "activity": activity, "sleep_hours": sleep_hours,
            "water_intake": water_intake, "diet_type": diet_type,
            "sunlight_exposure": sunlight_exposure, "fruit_intake": fruit_intake,
            "vegetable_intake": vegetable_intake, "meals_per_day": meals_per_day,
            "conditions": conditions, "symptoms": symptoms,
        }

        # ── Save food log ─────────────────────────────────────────────────────
        if foods:
            cursor.execute(
                "INSERT INTO food_log (user_id, foods, date_time) VALUES (%s,%s,%s)",
                (user_id, json.dumps(foods), datetime.now()),
            )
            conn.commit()

        # ── Nutrients + XGBoost (fast, ~0.2s) ────────────────────────────────
        totals   = calculate_nutrients(foods, df)
        input_df = prepare_input(
            age, gender, bmi,
            totals.get("protein", 0), totals.get("iron", 0),
            totals.get("vitamin_c", 0), totals.get("vitamin_d", 0),
            totals.get("fiber", 0), totals.get("vitamin_a", 0),
            totals.get("vitamin_b12", 0),
        )

        name_map   = {
            "VitC_Label": "Vitamin C", "VitD_Label": "Vitamin D",
            "Iron_Label": "Iron",      "Protein_Label": "Protein",
            "Fiber_Label": "Fiber",    "VitA_Label": "Vitamin A",
            "B12_Label": "Vitamin B12",
        }
        status_map = {0: "Severe", 1: "Normal", 2: "Moderate"}

        results        = {}
        xgb_inputs     = {}   # saved for /report SHAP reuse

        for model_name, model in models.items():
            temp_input = input_df.copy()[model.get_booster().feature_names]
            prediction = int(model.predict(temp_input)[0])
            results[name_map[model_name]] = status_map.get(prediction, "Normal")
            xgb_inputs[model_name] = temp_input.to_dict(orient="records")[0]

        # ── CNN image predictions — run in parallel ───────────────────────────
        eye_bytes    = read_image_bytes(eye_image)    if eye_image    else None
        nail_bytes   = read_image_bytes(nail_image)   if nail_image   else None
        tongue_bytes = read_image_bytes(tongue_image) if tongue_image else None

        def run_eye():
            return predict_image_from_bytes(eye_model, eye_bytes)   if eye_bytes   else 0
        def run_nail():
            return predict_image_from_bytes(nail_model, nail_bytes)  if nail_bytes  else 0
        def run_tongue():
            return predict_image_from_bytes(tongue_model, tongue_bytes) if tongue_bytes else 0

        f_eye    = executor.submit(run_eye)
        f_nail   = executor.submit(run_nail)
        f_tongue = executor.submit(run_tongue)

        eye_score    = f_eye.result()
        nail_score   = f_nail.result()
        tongue_score = f_tongue.result()

        # ── Multimodal fusion ─────────────────────────────────────────────────
        if eye_score >= 80 and results.get("Iron") == "Moderate":
            results["Iron"] = "Severe"
        if nail_score >= 80:
            if results.get("Iron")    == "Moderate": results["Iron"]    = "Severe"
            if results.get("Protein") == "Moderate": results["Protein"] = "Severe"
        if tongue_score >= 80:
            for n in ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"]:
                if results.get(n) == "Moderate":
                    results[n] = "Severe"

        # ── Symptom analysis ──────────────────────────────────────────────────
        symptom_map = {
            "hair_fall":    ["Iron", "Protein"],
            "fatigue":      ["Iron", "Vitamin B12"],
            "weak_nails":   ["Iron"],
            "dry_skin":     ["Vitamin A"],
            "mouth_ulcers": ["Vitamin B12"],
            "muscle_pain":  ["Vitamin D"],
            "dizziness":    ["Iron"],
            "poor_immunity":["Vitamin C"],
        }
        symptom_analysis = []
        symptom_risk     = 0
        for s in symptoms:
            if s in symptom_map:
                symptom_analysis.append({"symptom": s, "possible_deficiencies": symptom_map[s]})
                symptom_risk += 5

        # ── Previous history ──────────────────────────────────────────────────
        cursor.execute(
            "SELECT risk_score, risk_level FROM user_history WHERE user_id=%s ORDER BY date_time DESC LIMIT 1",
            (str(user_id),),
        )
        prev = cursor.fetchone()
        previous_risk_score = prev[0] if prev else 0
        previous_risk_level = prev[1] if prev else "None"

        # ── Risk score ────────────────────────────────────────────────────────
        severity_score = sum(25 if s == "Severe" else 15 for s in results.values() if s != "Normal")
        image_risk  = sum([
            15 if eye_score    >= 80 else (8 if eye_score    >= 50 else 0),
            15 if nail_score   >= 80 else (8 if nail_score   >= 50 else 0),
            15 if tongue_score >= 80 else (8 if tongue_score >= 50 else 0),
        ])
        current_score    = round(severity_score * 0.5 + image_risk * 0.3 + symptom_risk * 0.2, 2)
        history_weight   = 10 if previous_risk_score >= 70 else (5 if previous_risk_score >= 45 else 0)
        final_risk_score = min(round(current_score + history_weight, 2), 100)
        risk_level       = "High" if final_risk_score >= 70 else ("Moderate" if final_risk_score >= 40 else "Low")

        # ── Trend ─────────────────────────────────────────────────────────────
        trend_message = "No previous records"
        if previous_risk_score > 0:
            diff = round(final_risk_score - previous_risk_score, 2)
            if diff > 0:   trend_message = f"Risk Increased by {diff}%"
            elif diff < 0: trend_message = f"Health Improved by {abs(diff)}%"
            else:          trend_message = "No significant change"

        # ── Recommendations (moved to here — fast lookup only) ────────────────
        recommendations = {
            nutrient: recommend_food(nutrient, df, age, conditions, status)
            for nutrient, status in results.items()
            if status != "Normal"
        }

        # ── Save history ──────────────────────────────────────────────────────
        cursor.execute(
            """INSERT INTO user_history
               (user_id, date_time, age, bmi, risk_score, risk_level,
                eye_score, nail_score, tongue_score)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (str(user_id), datetime.now(), age, bmi,
             final_risk_score, risk_level, eye_score, nail_score, tongue_score),
        )
        conn.commit()

        # ── Return fast response (no SHAP, no GradCAM) ───────────────────────
        return jsonify({
            "results":              results,
            "recommendations":      recommendations,
            "questionnaire":        questionnaire,
            "nutrients":            totals,
            "image_analysis":       {"eye_analysis": eye_score, "nail_analysis": nail_score, "tongue_analysis": tongue_score},
            "symptom_analysis":     symptom_analysis,
            "symptoms":             symptoms,
            "risk_score":           final_risk_score,
            "risk_level":           risk_level,
            "previous_risk_score":  previous_risk_score,
            "previous_risk_level":  previous_risk_level,
            "trend_message":        trend_message,
            # Placeholders — filled by /report after user clicks "View Report"
            "shap_explanations":    {},
            "gradcam":              {"eye": None, "nail": None, "tongue": None},
            # Pass back image flags so /report knows what was uploaded
            "has_images":           {
                "eye":    eye_bytes    is not None,
                "nail":   nail_bytes   is not None,
                "tongue": tongue_bytes is not None,
            },
        })

    except Exception as e:
        print("PREDICT ERROR:", e)
        return jsonify({"error": str(e)}), 500


# =========================================
# REPORT  (slow — SHAP + GradCAM on demand)
# =========================================

@app.route("/report", methods=["POST"])
def report():
    """
    Called only when the user clicks "View Full Report".
    Accepts the same images + model inputs as /predict,
    returns SHAP explanations and GradCAM URLs.
    """
    try:
        data = request.form

        age    = int(data.get("age", 0))
        gender = int(data.get("gender", 1))
        bmi    = float(data.get("bmi", 0))
        foods  = json.loads(data.get("foods", "[]"))
        conditions = json.loads(data.get("conditions", "[]"))

        eye_image    = request.files.get("eye")
        nail_image   = request.files.get("nail")
        tongue_image = request.files.get("tongue")

        # ── Rebuild XGBoost input ─────────────────────────────────────────────
        totals   = calculate_nutrients(foods, df)
        input_df = prepare_input(
            age, gender, bmi,
            totals.get("protein", 0), totals.get("iron", 0),
            totals.get("vitamin_c", 0), totals.get("vitamin_d", 0),
            totals.get("fiber", 0), totals.get("vitamin_a", 0),
            totals.get("vitamin_b12", 0),
        )

        name_map = {
            "VitC_Label": "Vitamin C", "VitD_Label": "Vitamin D",
            "Iron_Label": "Iron",      "Protein_Label": "Protein",
            "Fiber_Label": "Fiber",    "VitA_Label": "Vitamin A",
            "B12_Label": "Vitamin B12",
        }

        # ── SHAP (parallel across 7 models) ───────────────────────────────────
        def run_shap(args):
            model_name, model = args
            try:
                temp = input_df.copy()[model.get_booster().feature_names]
                return name_map[model_name], explain_prediction(model, temp)
            except Exception as e:
                print(f"SHAP ERROR [{model_name}]:", e)
                return name_map[model_name], []

        shap_futures = {
            executor.submit(run_shap, (name, mdl)): name
            for name, mdl in models.items()
        }
        shap_explanations = {}
        for future in shap_futures:
            nutrient_name, top_features = future.result()
            if top_features:
                shap_explanations[nutrient_name] = top_features

        # ── GradCAM (parallel across uploaded images) ─────────────────────────
        eye_bytes    = read_image_bytes(eye_image)    if eye_image    else None
        nail_bytes   = read_image_bytes(nail_image)   if nail_image   else None
        tongue_bytes = read_image_bytes(tongue_image) if tongue_image else None

        def run_gradcam(model, img_bytes, filename):
            try:
                arr = preprocess_for_gradcam_bytes(img_bytes)
                abs_path, url = gradcam_save_path(filename)
                result = generate_gradcam(model, arr, abs_path)
                return url if result else None
            except Exception as e:
                print(f"GRADCAM ERROR [{filename}]:", e)
                return None

        gc_futures = {}
        if eye_bytes:
            gc_futures["eye"]    = executor.submit(run_gradcam, eye_model,    eye_bytes,    "eye_gradcam.jpg")
        if nail_bytes:
            gc_futures["nail"]   = executor.submit(run_gradcam, nail_model,   nail_bytes,   "nail_gradcam.jpg")
        if tongue_bytes:
            gc_futures["tongue"] = executor.submit(run_gradcam, tongue_model, tongue_bytes, "tongue_gradcam.jpg")

        gradcam_urls = {
            "eye":    gc_futures["eye"].result()    if "eye"    in gc_futures else None,
            "nail":   gc_futures["nail"].result()   if "nail"   in gc_futures else None,
            "tongue": gc_futures["tongue"].result() if "tongue" in gc_futures else None,
        }

        print("SHAP  :", list(shap_explanations.keys()))
        print("GRADCAM:", gradcam_urls)

        return jsonify({
            "shap_explanations": shap_explanations,
            "gradcam":           gradcam_urls,
        })

    except Exception as e:
        print("REPORT ERROR:", e)
        return jsonify({"error": str(e)}), 500


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