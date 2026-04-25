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
# FOOD → NUTRIENTS (FINAL FIXED 🔥)
# ==============================
def calculate_nutrients(user_foods, df):

    total_protein = 0
    total_iron = 0
    total_vitamin_c = 0
    total_vitamin_d = 0
    total_fiber = 0

    found_any = False

    for item in user_foods:
        try:
            food_name = str(item.get("name", "")).lower().strip()
            qty = float(item.get("qty", 1))
        except:
            continue

        if not food_name:
            continue

        # ==============================
        # 🔥 CLEAN + NORMALIZE
        # ==============================
        food_name = food_name.replace("_", " ").strip()
        food_name = normalize_food_name(food_name)

        # ==============================
        # 🔥 MATCHING
        # ==============================

        # 1️⃣ Exact
        row = df[df["food_name"] == food_name]

        # 2️⃣ Partial
        if row.empty:
            row = df[df["food_name"].str.contains(food_name, case=False, na=False)]

        # 3️⃣ Word match
        if row.empty:
            for word in food_name.split():
                row = df[df["food_name"].str.contains(word, case=False, na=False)]
                if not row.empty:
                    break

        # 4️⃣ Skip
        if row.empty:
            print("❌ Food not found:", food_name)
            continue

        found_any = True
        row = row.iloc[0]

        # ==============================
        # 🔥 TOTAL SUM (IMPORTANT FIX)
        # ==============================
        total_protein += float(row.get("protein", 0)) * qty
        total_iron += float(row.get("iron", 0)) * qty
        total_vitamin_c += float(row.get("vitamin_c", 0)) * qty
        total_vitamin_d += float(row.get("vitamin_d", 0)) * qty
        total_fiber += float(row.get("fiber", 0)) * qty

    # ==============================
    # ❗ FALLBACK
    # ==============================
    if not found_any:
        print("⚠️ No valid foods → fallback")

        return {
            "protein": 10,
            "iron": 5,
            "vitamin_c": 20,
            "vitamin_d": 2,
            "fiber": 5
        }

    # ==============================
    # ✅ RETURN TOTALS (NO DIVISION)
    # ==============================
    return {
        "protein": total_protein,
        "iron": total_iron,
        "vitamin_c": total_vitamin_c,
        "vitamin_d": total_vitamin_d,
        "fiber": total_fiber
    }


# ==============================
# PREPARE INPUT (NO CHANGE)
# ==============================
def prepare_input(age, gender, bmi, protein, iron, vitc, vitd, fiber):

    bmi_safe = bmi if bmi > 0 else 0.1

    if age < 18:
        age_group = 0
    elif age < 35:
        age_group = 1
    elif age < 60:
        age_group = 2
    else:
        age_group = 3

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