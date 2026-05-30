import pandas as pd

def prepare_input(
    age,
    gender,
    bmi,
    protein,
    iron,
    vitamin_c,
    vitamin_d,
    fiber,
    vitamin_a,
    vitamin_b12
):

    # =========================================
    # BASIC FEATURES
    # =========================================

    calories = protein * 4 + fiber * 2 + 200

    carbs = 250
    sugar = 40

    potassium = 3500
    moisture = 2000

    tocopherol = vitamin_a * 0.3

    calcium = 800
    magnesium = 300
    zinc = 10

    retinol = vitamin_a * 0.5
    alpha_carotene = vitamin_a * 0.2
    beta_carotene = vitamin_a * 0.3

    cryptoxanthin = 50
    lutein = 100
    lycopene = 50

    vitamin_b6 = 2
    niacin = 14
    folate = 400

    copper = 1
    selenium = 55

    saturated_fat = 20
    monounsaturated_fat = 15
    polyunsaturated_fat = 10

    # =========================================
    # AGE GROUP
    # =========================================

    if age <= 18:
        age_group = 0
    elif age <= 40:
        age_group = 1
    elif age <= 60:
        age_group = 2
    else:
        age_group = 3

    # =========================================
    # BMI CATEGORY
    # =========================================

    if bmi < 18.5:
        bmi_category = 0
    elif bmi < 25:
        bmi_category = 1
    elif bmi < 30:
        bmi_category = 2
    else:
        bmi_category = 3

    # =========================================
    # ENGINEERED FEATURES
    # =========================================

    sugar_fiber_ratio = sugar / (fiber + 1)

    protein_calorie_ratio = protein / (calories + 1)

    carb_protein_ratio = carbs / (protein + 1)

    fat_calorie_ratio = (
        saturated_fat +
        monounsaturated_fat +
        polyunsaturated_fat
    ) / (calories + 1)

    mineral_score = (
        calcium +
        magnesium +
        zinc
    )

    vitamin_score = (
        tocopherol +
        vitamin_b6 +
        folate
    )

    # =========================================
    # FINAL INPUT
    # =========================================

    input_df = pd.DataFrame([{

        "RIDAGEYR": age,
        "RIAGENDR": gender,
        "BMXBMI": bmi,

        "DR1TKCAL": calories,
        "DR1TCARB": carbs,
        "DR1TSUGR": sugar,
        "DR1TPOTA": potassium,
        "DR1TMOIS": moisture,

        "DR1TATOC": tocopherol,
        "DR1TCALC": calcium,
        "DR1TMAGN": magnesium,
        "DR1TZINC": zinc,

        "DR1TRET": retinol,
        "DR1TACAR": alpha_carotene,
        "DR1TBCAR": beta_carotene,
        "DR1TCRYP": cryptoxanthin,
        "DR1TLZ": lutein,
        "DR1TLYCO": lycopene,

        "DR1TVB6": vitamin_b6,
        "DR1TNIAC": niacin,
        "DR1TFOLA": folate,

        "DR1TCOPP": copper,
        "DR1TSELE": selenium,

        "DR1TSFAT": saturated_fat,
        "DR1TMFAT": monounsaturated_fat,
        "DR1TPFAT": polyunsaturated_fat,

        "DR1TFIBE": fiber,
        "DR1TPROT": protein,
        "DR1TVD": vitamin_d,

        "Age_group": age_group,
        "BMI_category": bmi_category,

        "Sugar_Fiber_Ratio": sugar_fiber_ratio,
        "Protein_Calorie_Ratio": protein_calorie_ratio,
        "Carb_Protein_Ratio": carb_protein_ratio,
        "Fat_Calorie_Ratio": fat_calorie_ratio,

        "Mineral_Score": mineral_score,
        "Vitamin_Score": vitamin_score

    }])

    return input_df