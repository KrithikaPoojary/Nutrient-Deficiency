import pandas as pd

# ==============================
# FOOD → NUTRIENTS (FINAL 🔥)
# ==============================
def calculate_nutrients(user_foods, df):

    total_protein = 0
    total_iron = 0
    total_vitamin_c = 0
    total_vitamin_d = 0
    total_fiber = 0

    found_any = False
    total_qty = 0   # 🔥 better than count

    for item in user_foods:
        try:
            food_name = str(item.get("name", "")).lower().strip()
            qty = float(item.get("qty", 1))
        except:
            continue  # skip bad input

        if not food_name:
            continue

        # ==============================
        # 🔥 CLEAN INPUT
        # ==============================
        food_name = food_name.replace("_", " ").strip()

        # ==============================
        # 🔥 MATCHING LOGIC
        # ==============================

        # 1️⃣ Exact match
        row = df[df["food_name"] == food_name]

        # 2️⃣ Partial match
        if row.empty:
            row = df[df["food_name"].str.contains(food_name, case=False, na=False)]

        # 3️⃣ Skip if not found
        if row.empty:
            print("❌ Food not found:", food_name)
            continue

        found_any = True
        total_qty += qty

        row = row.iloc[0]

        # ==============================
        # 🔥 ADD TOTALS
        # ==============================

        total_protein += float(row.get("protein", 0)) * qty
        total_iron += float(row.get("iron", 0)) * qty
        total_vitamin_c += float(row.get("vitamin_c", 0)) * qty
        total_vitamin_d += float(row.get("vitamin_d", 0)) * qty
        total_fiber += float(row.get("fiber", 0)) * qty

    # ==============================
    # ❗ NO FOOD MATCHED
    # ==============================
    if not found_any or total_qty == 0:
        print("⚠️ No valid foods → using fallback values")

        return {
            "protein": 2,
            "iron": 2,
            "vitamin_c": 5,
            "vitamin_d": 1,
            "fiber": 2
        }

    # ==============================
    # 🔥 NORMALIZATION (IMPORTANT)
    # ==============================

    return {
        "protein": total_protein / total_qty,
        "iron": total_iron / total_qty,
        "vitamin_c": total_vitamin_c / total_qty,
        "vitamin_d": total_vitamin_d / total_qty,
        "fiber": total_fiber / total_qty
    }


# ==============================
# PREPARE INPUT FOR MODEL
# ==============================
def prepare_input(age, gender, bmi, protein, iron, vitc, vitd, fiber):

    bmi_safe = bmi if bmi > 0 else 0.1

    # ==============================
    # AGE GROUP
    # ==============================
    if age < 18:
        age_group = 0
    elif age < 35:
        age_group = 1
    elif age < 60:
        age_group = 2
    else:
        age_group = 3

    # ==============================
    # BMI CATEGORY
    # ==============================
    if bmi < 18.5:
        bmi_category = 0
    elif bmi < 25:
        bmi_category = 1
    elif bmi < 30:
        bmi_category = 2
    else:
        bmi_category = 3

    # ==============================
    # 🔥 FEATURE ENGINEERING
    # ==============================

    data = {
        "RIDAGEYR": age,
        "RIAGENDR": gender,
        "BMXBMI": bmi,

        "DR1TPROT": protein,
        "DR1TIRON": iron,
        "DR1TVC": vitc,
        "DR1TVD": vitd,
        "DR1TFIBE": fiber,

        # Ratios
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