import pandas as pd

# =========================================
# FOOD NORMALIZATION
# =========================================

def normalize_food_name(food_name):

    mapping = {

        "juice": "orange juice",
        "chocolate": "milk chocolate",
        "burger": "veg burger",
        "pizza": "cheese pizza",
        "maggi": "instant noodles",
        "tea": "milk tea",
        "egg": "boiled egg",
        "rice": "white rice",
        "apple": "apple",
        "banana": "banana",
        "milk": "milk"

    }

    return mapping.get(
        food_name,
        food_name
    )

# =========================================
# SMART FOOD MATCH
# =========================================

def find_best_match(food_name, df):

    # EXACT MATCH
    exact = df[
        df["food_name"]
        .str.lower() == food_name
    ]

    if not exact.empty:

        return exact.iloc[0]

    # STARTSWITH MATCH
    starts = df[

        df["food_name"]
        .str.lower()
        .str.startswith(food_name)

    ]

    if not starts.empty:

        return starts.iloc[0]

    # CONTAINS MATCH
    contains = df[

        df["food_name"]
        .str.contains(
            food_name,
            case=False,
            na=False
        )

    ]

    if not contains.empty:

        return contains.iloc[0]

    # WORD MATCH
    for word in food_name.split():

        match = df[

            df["food_name"]
            .str.contains(
                word,
                case=False,
                na=False
            )

        ]

        if not match.empty:

            return match.iloc[0]

    return None

# =========================================
# UNIT TO GRAM CONVERSION
# =========================================

def get_unit_multiplier(food_name, qty, unit):

    food_name = str(
        food_name
    ).lower().strip()

    unit = str(
        unit
    ).lower().strip()

    qty = float(qty)

    # =====================================
    # COMMON MEASUREMENTS
    # =====================================

    measurements = {

        # =================================
        # RICE
        # =================================

        "white rice": {

            "bowl": 150,
            "cup": 130,
            "plate": 250

        },

        # =================================
        # EGG
        # =================================

        "boiled egg": {

            "piece": 50,
            "pieces": 50

        },

        # =================================
        # PIZZA
        # =================================

        "cheese pizza": {

            "slice": 120,
            "slices": 120

        },

        # =================================
        # MILK
        # =================================

        "milk": {

            "glass": 250,
            "ml": 1,
            "cup": 240

        },

        # =================================
        # APPLE
        # =================================

        "apple": {

            "piece": 180,
            "pieces": 180

        },

        # =================================
        # BANANA
        # =================================

        "banana": {

            "piece": 120,
            "pieces": 120

        },

        # =================================
        # BURGER
        # =================================

        "veg burger": {

            "piece": 180,
            "pieces": 180

        },

        # =================================
        # INSTANT NOODLES
        # =================================

        "instant noodles": {

            "packet": 70,
            "packets": 70,
            "bowl": 180

        }

    }

    # =====================================
    # GET FOOD UNIT
    # =====================================

    if food_name in measurements:

        food_units = measurements[
            food_name
        ]

        if unit in food_units:

            return (

                qty *
                food_units[unit]

            ) / 100

    # =====================================
    # DEFAULT FALLBACK
    # =====================================

    default_units = {

        "piece": 1,
        "pieces": 1,

        "slice": 1.5,
        "slices": 1.5,

        "bowl": 2,
        "bowls": 2,

        "cup": 1.8,
        "cups": 1.8,

        "glass": 2,
        "glasses": 2,

        "plate": 2.5,
        "plates": 2.5,

        "packet": 2,
        "packets": 2,

        "ml": 0.01,

        "gram": 0.01,

        "serving": 1

    }

    multiplier = default_units.get(
        unit,
        1
    )

    return qty * multiplier

# =========================================
# FOOD -> NUTRIENTS
# =========================================

def calculate_nutrients(
    user_foods,
    df
):

    totals = {

        "protein": 0,
        "iron": 0,
        "vitamin_c": 0,
        "vitamin_d": 0,
        "fiber": 0,

        "vitamin_a": 0,
        "vitamin_b12": 0

    }

    found_any = False

    for item in user_foods:

        try:

            food_name = str(

                item.get(
                    "name",
                    ""
                )

            ).lower().strip()

            qty = float(

                item.get(
                    "qty",
                    1
                )

            )

            unit = str(

                item.get(
                    "unit",
                    "serving"
                )

            ).lower().strip()

        except:

            continue

        if not food_name:

            continue

        # =====================================
        # CLEAN FOOD
        # =====================================

        food_name = (

            food_name
            .replace("_", " ")
            .strip()

        )

        # =====================================
        # NORMALIZE
        # =====================================

        food_name = normalize_food_name(
            food_name
        )

        # =====================================
        # FIND MATCH
        # =====================================

        row = find_best_match(
            food_name,
            df
        )

        if row is None:

            print(
                "Food not found:",
                food_name
            )

            continue

        found_any = True

        # =====================================
        # CONVERT QUANTITY
        # =====================================

        final_qty = get_unit_multiplier(

            food_name,
            qty,
            unit

        )

        # =====================================
        # TOTALS
        # =====================================

        totals["protein"] += (

            float(
                row.get(
                    "protein",
                    0
                )
            ) * final_qty

        )

        totals["iron"] += (

            float(
                row.get(
                    "iron",
                    0
                )
            ) * final_qty

        )

        totals["vitamin_c"] += (

            float(
                row.get(
                    "vitamin_c",
                    0
                )
            ) * final_qty

        )

        totals["vitamin_d"] += (

            float(
                row.get(
                    "vitamin_d",
                    0
                )
            ) * final_qty

        )

        totals["fiber"] += (

            float(
                row.get(
                    "fiber",
                    0
                )
            ) * final_qty

        )

        totals["vitamin_a"] += (

            float(
                row.get(
                    "vitamin_a",
                    0
                )
            ) * final_qty

        )

        totals["vitamin_b12"] += (

            float(
                row.get(
                    "vitamin_b12",
                    0
                )
            ) * final_qty

        )

    # =========================================
    # SAFE FALLBACK
    # =========================================

    if not found_any:

        print(
            "No valid foods found"
        )

        return {

            "protein": 5,
            "iron": 2,
            "vitamin_c": 10,
            "vitamin_d": 1,
            "fiber": 3,

            "vitamin_a": 50,
            "vitamin_b12": 0.5

        }

    return totals

# =========================================
# PREPARE MODEL INPUT
# =========================================

def prepare_input(

    age,
    gender,
    bmi,

    protein,
    iron,
    vitc,
    vitd,
    fiber,

    vita,
    b12

):

    bmi_safe = bmi if bmi > 0 else 0.1

    # =====================================
    # AGE GROUP
    # =====================================

    if age < 18:

        age_group = 0

    elif age < 35:

        age_group = 1

    elif age < 60:

        age_group = 2

    else:

        age_group = 3

    # =====================================
    # BMI CATEGORY
    # =====================================

    if bmi < 18.5:

        bmi_category = 0

    elif bmi < 25:

        bmi_category = 1

    elif bmi < 30:

        bmi_category = 2

    else:

        bmi_category = 3

    # =====================================
    # DATAFRAME
    # =====================================

    data = {

        "RIDAGEYR": age,
        "RIAGENDR": gender,
        "BMXBMI": bmi,

        "DR1TPROT": protein,
        "DR1TIRON": iron,
        "DR1TVC": vitc,
        "DR1TVD": vitd,
        "DR1TFIBE": fiber,

        "DR1TVARA": vita,
        "DR1TVB12": b12,

        # =================================
        # RATIOS
        # =================================

        "Protein_BMI_ratio":
            protein / bmi_safe,

        "Iron_BMI_ratio":
            iron / bmi_safe,

        "VitC_BMI_ratio":
            vitc / bmi_safe,

        "Fiber_BMI_ratio":
            fiber / bmi_safe,

        "VitD_BMI_ratio":
            vitd / bmi_safe,

        "VitA_BMI_ratio":
            vita / bmi_safe,

        "B12_BMI_ratio":
            b12 / bmi_safe,

        # =================================
        # INTERACTIONS
        # =================================

        "VitD_age_ratio":
            vitd / (age + 1),

        "VitD_protein_interaction":
            vitd * protein,

        "VitA_Protein_interaction":
            vita * protein,

        "B12_Protein_interaction":
            b12 * protein,

        # =================================
        # CATEGORIES
        # =================================

        "Age_group":
            age_group,

        "BMI_category":
            bmi_category

    }

    return pd.DataFrame([data])