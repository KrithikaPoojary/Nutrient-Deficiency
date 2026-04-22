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
    valid_food_count = 0   # 🔥 for averaging

    for item in user_foods:
        try:
            food_name = item["name"].lower().strip()
            qty = float(item["qty"])
        except:
            continue  # skip bad input safely

        # ==============================
        # 🔥 SAFE MATCHING
        # ==============================

        # 1️⃣ Exact match
        row = df[df["food_name"] == food_name]

        # 2️⃣ Partial match
        if row.empty:
            row = df[df["food_name"].str.contains(food_name, case=False, na=False)]

        # 3️⃣ If still not found → skip safely
        if row.empty:
            print("❌ Food not found:", food_name)
            continue

        found_any = True
        valid_food_count += 1

        row = row.iloc[0]

        total_protein += row["protein"] * qty
        total_iron += row["iron"] * qty
        total_vitamin_c += row["vitamin_c"] * qty
        total_vitamin_d += row["vitamin_d"] * qty
        total_fiber += row["fiber"] * qty

    # ==============================
    # ❗ NO FOOD MATCHED
    # ==============================
    if not found_any:
        print("⚠️ No foods matched → using default values")

        return {
            "protein": 1,
            "iron": 1,
            "vitamin_c": 1,
            "vitamin_d": 1,
            "fiber": 1
        }

    # ==============================
    # 🔥 AVERAGE (VERY IMPORTANT)
    # ==============================
    divisor = valid_food_count if valid_food_count > 0 else 1

    return {
        "protein": total_protein / divisor,
        "iron": total_iron / divisor,
        "vitamin_c": total_vitamin_c / divisor,
        "vitamin_d": total_vitamin_d / divisor,
        "fiber": total_fiber / divisor
    }


# ==============================
# PREPARE INPUT FOR MODEL
# ==============================
def prepare_input(age, gender, bmi, protein, iron, vitc, vitd, fiber):

    bmi_safe = bmi if bmi != 0 else 0.1

    # 🔥 Age group
    if age < 18:
        age_group = 0
    elif age < 35:
        age_group = 1
    elif age < 60:
        age_group = 2
    else:
        age_group = 3

    # 🔥 BMI category
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

        # 🔥 Ratios (important for ML)
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