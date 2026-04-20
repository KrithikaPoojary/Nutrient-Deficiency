import pandas as pd

# ==============================
# FOOD → NUTRIENTS (UPDATED 🔥)
# ==============================
def calculate_nutrients(user_foods, df):

    total_protein = 0
    total_iron = 0
    total_vitamin_c = 0
    total_vitamin_d = 0
    total_fiber = 0

    found_any = False   # 🔥 NEW FLAG

    for item in user_foods:
        food_name = item["name"].lower().strip()
        qty = item["qty"]

        row = df[df["food_name"] == food_name]

        if not row.empty:
            found_any = True   # ✅ FOOD FOUND

            total_protein += row["protein"].values[0] * qty
            total_iron += row["iron"].values[0] * qty
            total_vitamin_c += row["vitamin_c"].values[0] * qty
            total_vitamin_d += row["vitamin_d"].values[0] * qty
            total_fiber += row["fiber"].values[0] * qty
        else:
            print("❌ Food not found:", food_name)

    # ❗ ONLY fail if NO food matched
    if not found_any:
        return None

    return {
        "protein": total_protein,
        "iron": total_iron,
        "vitamin_c": total_vitamin_c,
        "vitamin_d": total_vitamin_d,
        "fiber": total_fiber
    }
# ==============================
# PREPARE INPUT FOR MODEL
# ==============================
def prepare_input(age, gender, bmi, protein, iron, vitc, vitd, fiber):

    bmi_safe = bmi if bmi != 0 else 0.1

    # Age group
    if age < 18:
        age_group = 0
    elif age < 35:
        age_group = 1
    elif age < 60:
        age_group = 2
    else:
        age_group = 3

    # BMI category
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