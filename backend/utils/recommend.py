import pandas as pd
import random

# ==========================================
# DISEASE RULES
# ==========================================

disease_profiles = {

    "heart": {
        "avoid": ["fried", "butter", "fat", "oil"],
        "prefer": ["vegetable", "fruit", "legume"]
    },

    "diabetes": {
        "avoid": ["sugar", "sweet", "dessert"],
        "prefer": ["protein", "vegetable"]
    },

    "bp": {
        "avoid": ["salt", "pickle"],
        "prefer": ["fruit", "vegetable"]
    }

}

# ==========================================
# REGION PREFERENCES
# ==========================================

region_preferences = {

    "south": [
        "idli",
        "dosa",
        "sambar",
        "rasam",
        "upma"
    ],

    "north": [
        "roti",
        "paneer",
        "dal",
        "paratha"
    ]

}

# ==========================================
# NUTRIENT CATEGORY RULES
# ==========================================

nutrient_food_rules = {

    "Protein": ["protein", "legume", "dairy"],

    "Iron": ["legume", "vegetable", "protein"],

    "Vitamin C": ["fruit", "vegetable"],

    "Vitamin D": ["dairy", "protein", "egg"],

    "Fiber": ["fruit", "vegetable", "grain"],

    "Vitamin A": [
        "vegetable",
        "fruit",
        "dairy"
    ],

    "Vitamin B12": [
        "protein",
        "dairy",
        "egg"
    ]

}

# ==========================================
# GET DISEASE RULES
# ==========================================

def get_disease_rules(condition):

    return disease_profiles.get(

        condition.lower(),

        {
            "avoid": ["fried", "junk"],
            "prefer": ["vegetable", "fruit"]
        }

    )

# ==========================================
# REMOVE UNHEALTHY FOODS
# ==========================================

def remove_unhealthy_foods(df):

    bad_words = [

        "fried",
        "fry",
        "oil",
        "cream",
        "junk"

    ]

    return df[
        ~df["food_name"].str.contains(
            "|".join(bad_words),
            case=False,
            na=False
        )
    ]

# ==========================================
# MAIN RECOMMEND FUNCTION
# ==========================================

def recommend_food(

    deficiency,
    df,
    age,
    conditions=[],
    severity="Moderate",

    preference="veg",
    allergies=[],
    region="south",
    previous_foods=[],
    bmi=22

):

    # ==========================================
    # COLUMN MAPPING
    # ==========================================

    mapping = {

        "Iron": "iron",
        "Protein": "protein",
        "Vitamin C": "vitamin_c",
        "Vitamin D": "vitamin_d",
        "Fiber": "fiber",
        "Vitamin A": "vitamin_a",
        "Vitamin B12": "vitamin_b12"

    }

    column = mapping.get(deficiency)

    # ==========================================
    # INVALID COLUMN CHECK
    # ==========================================

    if column is None or column not in df.columns:

        print("⚠️ Invalid column:", column)

        return {

            "foods": [],
            "plan": {}

        }

    # ==========================================
    # COPY DATAFRAME
    # ==========================================

    df_filtered = df.copy()

    # ==========================================
    # REMOVE ALLERGIES
    # ==========================================

    for allergy in allergies:

        df_filtered = df_filtered[
            ~df_filtered["food_name"].str.contains(
                allergy,
                case=False,
                na=False
            )
        ]

    # ==========================================
    # VEG FILTER
    # ==========================================

    if preference == "veg":

        nonveg_words = [

            "chicken",
            "fish",
            "egg",
            "mutton",
            "prawn",
            "crab"

        ]

        df_filtered = df_filtered[
            ~df_filtered["food_name"].str.contains(
                "|".join(nonveg_words),
                case=False,
                na=False
            )
        ]

    # ==========================================
    # DISEASE FILTER
    # ==========================================

    avoid_words = []
    prefer_categories = []

    for cond in conditions:

        rules = get_disease_rules(cond)

        avoid_words.extend(rules["avoid"])
        prefer_categories.extend(rules["prefer"])

    for word in avoid_words:

        df_filtered = df_filtered[
            ~df_filtered["food_name"].str.contains(
                word,
                case=False,
                na=False
            )
        ]

    if prefer_categories:

        df_filtered = df_filtered[
            df_filtered["category"].isin(
                prefer_categories
            )
        ]

    # ==========================================
    # NUTRIENT CATEGORY FILTER
    # ==========================================

    allowed_categories = nutrient_food_rules.get(
        deficiency,
        []
    )

    if allowed_categories:

        df_filtered = df_filtered[
            df_filtered["category"].isin(
                allowed_categories
            )
        ]

    # ==========================================
    # AGE FILTER
    # ==========================================

    if age <= 12:

        df_filtered = df_filtered[
            df_filtered["category"].isin(
                ["fruit", "vegetable"]
            )
        ]

    elif age >= 60:

        df_filtered = df_filtered[
            df_filtered["category"].isin(
                ["vegetable", "fruit", "legume"]
            )
        ]

    # ==========================================
    # BMI FILTER
    # ==========================================

    if bmi >= 30:

        high_calorie = [

            "pizza",
            "burger",
            "fried"

        ]

        for word in high_calorie:

            df_filtered = df_filtered[
                ~df_filtered["food_name"].str.contains(
                    word,
                    case=False,
                    na=False
                )
            ]

    # ==========================================
    # REMOVE PREVIOUS FOODS
    # ==========================================

    if previous_foods:

        for food in previous_foods:

            df_filtered = df_filtered[
                ~df_filtered["food_name"].str.contains(
                    food,
                    case=False,
                    na=False
                )
            ]

    # ==========================================
    # REMOVE LOW NUTRIENT FOODS
    # ==========================================

    if deficiency == "Vitamin A":

        df_filtered = df_filtered[
            df_filtered[column] > 0.1
        ]

    elif deficiency == "Vitamin B12":

        df_filtered = df_filtered[
            df_filtered[column] > 0.05
        ]

    else:

        df_filtered = df_filtered[
            df_filtered[column] > 0.5
        ]

    # ==========================================
    # REMOVE UNHEALTHY
    # ==========================================

    df_filtered = remove_unhealthy_foods(
        df_filtered
    )

    # ==========================================
    # FALLBACK IF EMPTY
    # ==========================================

    if df_filtered.empty:

        print("⚠️ Empty after filters -> fallback")

        df_filtered = df.copy()

        if deficiency == "Vitamin A":

            df_filtered = df_filtered[
                df_filtered[column] > 0.1
            ]

        elif deficiency == "Vitamin B12":

            df_filtered = df_filtered[
                df_filtered[column] > 0.05
            ]

        else:

            df_filtered = df_filtered[
                df_filtered[column] > 0.5
            ]

        df_filtered = remove_unhealthy_foods(
            df_filtered
        )

    # ==========================================
    # SORT
    # ==========================================

    df_filtered = df_filtered.sort_values(
        by=column,
        ascending=False
    )

    df_filtered = df_filtered.drop_duplicates(
        subset=["food_name"]
    )

    # ==========================================
    # REGION PRIORITY
    # ==========================================

    regional_foods = region_preferences.get(
        region.lower(),
        []
    )

    if regional_foods:

        regional_df = df_filtered[
            df_filtered["food_name"].str.contains(
                "|".join(regional_foods),
                case=False,
                na=False
            )
        ]

        other_df = df_filtered[
            ~df_filtered.index.isin(regional_df.index)
        ]

        df_filtered = pd.concat([
            regional_df,
            other_df
        ])

    # ==========================================
    # SEVERITY LOGIC
    # ==========================================

    if severity == "Severe":

        top_n = 10

    elif severity == "Moderate":

        top_n = 7

    else:

        top_n = 5

    # ==========================================
    # SELECT FOODS
    # ==========================================

    top_df = df_filtered.head(30)

    if len(top_df) > top_n:

        top_df = top_df.sample(
            n=top_n,
            random_state=42
        )

    foods_list = top_df[
        "food_name"
    ].dropna().tolist()

    foods_list = list(set(foods_list))

    # ==========================================
    # FINAL FALLBACK
    # ==========================================

    if len(foods_list) == 0:

        fallback_df = df.sort_values(
            by=column,
            ascending=False
        )

        foods_list = fallback_df[
            "food_name"
        ].head(10).tolist()

    # ==========================================
    # CREATE 3-DAY PLAN
    # ==========================================

    meals = [

        "Breakfast",
        "Lunch",
        "Dinner"

    ]

    plan = {}

    for day in range(1, 4):

        daily_plan = {}

        random.shuffle(foods_list)

        for meal in meals:

            if len(foods_list) > 0:

                daily_plan[meal] = random.sample(

                    foods_list,

                    min(2, len(foods_list))

                )

            else:

                daily_plan[meal] = []

        plan[f"Day {day}"] = daily_plan

    # ==========================================
    # RETURN
    # ==========================================

    return {

        "foods": foods_list,
        "plan": plan

    }

