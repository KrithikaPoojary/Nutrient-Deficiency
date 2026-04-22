import pandas as pd

# ==============================
# DISEASE RULES
# ==============================

disease_profiles = {
    "heart": {
        "avoid": ["fried", "butter", "fat"],
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


def get_disease_rules(condition):
    return disease_profiles.get(condition, {
        "avoid": ["fried", "junk", "sugar"],
        "prefer": ["vegetable", "fruit"]
    })


# ==============================
# APPLY DISEASE FILTER
# ==============================

def apply_disease_filter(df, conditions):

    df_filtered = df.copy()

    avoid_words = set()
    prefer_categories = set()

    for cond in conditions:
        rules = get_disease_rules(cond.lower())
        avoid_words.update(rules["avoid"])
        prefer_categories.update(rules["prefer"])

    # ❌ Remove harmful foods
    for word in avoid_words:
        df_filtered = df_filtered[
            ~df_filtered["food_name"].str.contains(word, case=False, na=False)
        ]

    # ✅ Keep preferred categories
    if prefer_categories:
        df_filtered = df_filtered[
            df_filtered["category"].isin(prefer_categories)
        ]

    return df_filtered


# ==============================
# MAIN RECOMMENDATION FUNCTION
# ==============================

def recommend_food(deficiency, df, age, conditions, severity="Moderate"):

    mapping = {
        "Iron": "iron",
        "Protein": "protein",
        "Vitamin C": "vitamin_c",
        "Vitamin D": "vitamin_d",
        "Fiber": "fiber"
    }

    column = mapping.get(deficiency)

    # ❌ Safety check
    if column is None or column not in df.columns:
        print("⚠️ Invalid column:", column)
        return {
            "top_foods": [],
            "plan": {}
        }

    # ==============================
    # APPLY FILTERS
    # ==============================

    df_filtered = apply_disease_filter(df, conditions)

    # 🔥 If filter removes everything → fallback
    if df_filtered.empty:
        print("⚠️ Filter removed all foods → fallback")
        df_filtered = df.copy()

    # Age-based filtering
    if age <= 12:
        df_filtered = df_filtered[
            df_filtered["category"].isin(["fruit", "vegetable"])
        ]
    elif age >= 60:
        df_filtered = df_filtered[
            df_filtered["category"].isin(["vegetable", "fruit", "legume"])
        ]

    # 🔥 Again fallback if empty
    if df_filtered.empty:
        print("⚠️ Age filter removed all → fallback")
        df_filtered = df.copy()

    # ==============================
    # SORT
    # ==============================

    df_filtered = df_filtered.sort_values(by=column, ascending=False)

    # ==============================
    # SEVERITY LOGIC
    # ==============================

    if severity == "Severe":
        top_n = 10
    elif severity == "Moderate":
        top_n = 7
    elif severity == "Mild":
        top_n = 5
    else:
        top_n = 3

    df_filtered = df_filtered.head(top_n)

    # ==============================
    # SAFE FOOD LIST
    # ==============================

    if "food_name" not in df_filtered.columns:
        print("❌ food_name column missing")
        return {
            "top_foods": [],
            "plan": {}
        }

    foods_list = df_filtered["food_name"].dropna().tolist()

    # ==============================
    # LONG-TERM PLAN (DAY-WISE)
    # ==============================

    plan = {}

    for i in range(min(3, len(foods_list))):
        plan[f"Day {i+1}"] = foods_list[: i+1]

    return {
        "top_foods": foods_list,
        "plan": plan
    }