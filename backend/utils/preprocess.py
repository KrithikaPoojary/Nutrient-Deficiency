import pandas as pd

# ==============================
# 🔥 FOOD NORMALIZATION
# ==============================
def normalize_food_name(food_name):
    mapping = {
        "juice": "orange juice",
        "chocolate": "milk chocolate",
        "burger": "veg burger",
        "pizza": "cheese pizza",
        "maggi": "instant noodles",
        "tea": "milk tea",
        "egg": "boiled egg",
        "rice": "white rice"
    }
    return mapping.get(food_name, food_name)


# ==============================
# 🔍 SMART MATCH FUNCTION
# ==============================
def find_best_match(food_name, df):

    # 1️⃣ Exact match
    exact = df[df["food_name"] == food_name]
    if not exact.empty:
        return exact.iloc[0]

    # 2️⃣ Startswith match (better than contains)
    starts = df[df["food_name"].str.startswith(food_name)]
    if not starts.empty:
        return starts.iloc[0]

    # 3️⃣ Contains match
    contains = df[df["food_name"].str.contains(food_name, case=False, na=False)]
    if not contains.empty:
        return contains.iloc[0]

    # 4️⃣ Word match
    for word in food_name.split():
        match = df[df["food_name"].str.contains(word, case=False, na=False)]
        if not match.empty:
            return match.iloc[0]

    return None


# ==============================
# 🍽️ FOOD → NUTRIENTS
# ==============================
def calculate_nutrients(user_foods, df):

    totals = {
        "protein": 0,
        "iron": 0,
        "vitamin_c": 0,
        "vitamin_d": 0,
        "fiber": 0
    }

    found_any = False

    for item in user_foods:
        try:
            food_name = str(item.get("name", "")).lower().strip()
            qty = float(item.get("qty", 1))
        except:
            continue

        if not food_name:
            continue

        # 🔥 CLEAN + NORMALIZE
        food_name = food_name.replace("_", " ").strip()
        food_name = normalize_food_name(food_name)

        # 🔍 FIND BEST MATCH
        row = find_best_match(food_name, df)

        if row is None:
            print("❌ Food not found:", food_name)
            continue

        found_any = True

        # ==============================
        # 🔥 TOTAL SUM (NO AVERAGING)
        # ==============================
        totals["protein"] += float(row.get("protein", 0)) * qty
        totals["iron"] += float(row.get("iron", 0)) * qty
        totals["vitamin_c"] += float(row.get("vitamin_c", 0)) * qty
        totals["vitamin_d"] += float(row.get("vitamin_d", 0)) * qty
        totals["fiber"] += float(row.get("fiber", 0)) * qty

    # ==============================
    # ⚠️ SAFE FALLBACK
    # ==============================
    if not found_any:
        print("⚠️ No valid foods → using safe low values")

        return {
            "protein": 5,
            "iron": 2,
            "vitamin_c": 10,
            "vitamin_d": 1,
            "fiber": 3
        }

    return totals


# ==============================
# 🧠 PREPARE INPUT
# ==============================
def prepare_input(age, gender, bmi, protein, iron, vitc, vitd, fiber):

    bmi_safe = bmi if bmi > 0 else 0.1

    # AGE GROUP
    if age < 18:
        age_group = 0
    elif age < 35:
        age_group = 1
    elif age < 60:
        age_group = 2
    else:
        age_group = 3

    # BMI CATEGORY
    if bmi < 18.5:
        bmi_category = 0
    elif bmi < 25:
        bmi_category = 1
    elif bmi < 30:
        bmi_category = 2
    else:
        bmi_category = 3

    data = {
        "RIDAGEYR": age,
        "RIAGENDR": gender,
        "BMXBMI": bmi,

        "DR1TPROT": protein,
        "DR1TIRON": iron,
        "DR1TVC": vitc,
        "DR1TVD": vitd,
        "DR1TFIBE": fiber,

        "Protein_BMI_ratio": protein / bmi_safe,
        "Iron_BMI_ratio": iron / bmi_safe,
        "VitC_BMI_ratio": vitc / bmi_safe,
        "Fiber_BMI_ratio": fiber / bmi_safe,

        "VitD_BMI_ratio": vitd / bmi_safe,
        "VitD_age_ratio": vitd / (age + 1),
        "VitD_protein_interaction": vitd * protein,

        "Age_group": age_group,
        "BMI_category": bmi_category
    }

    return pd.DataFrame([data])