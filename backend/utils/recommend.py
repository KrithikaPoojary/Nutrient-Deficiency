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
# NUTRIENT → CATEGORY RULES 🔥
# ==============================

nutrient_food_rules = {
    "Protein": ["protein", "legume", "dairy"],
    "Iron": ["legume", "vegetable", "protein"],
    "Vitamin C": ["fruit", "vegetable"],
    "Vitamin D": ["dairy", "protein"],  # 🔥 important fix
    "Fiber": ["fruit", "vegetable", "grain"]
}

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
# MAIN RECOMMEND FUNCTION
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

    if column is None or column not in df.columns:
        print("⚠️ Invalid column:", column)
        return {"top_foods": [], "plan": {}}

    # ==============================
    # APPLY FILTERS
    # ==============================

    df_filtered = apply_disease_filter(df, conditions)

    if df_filtered.empty:
        print("⚠️ Disease filter removed all → fallback")
        df_filtered = df.copy()

    # ==============================
    # 🔥 NUTRIENT FILTER (IMPORTANT)
    # ==============================

    allowed_categories = nutrient_food_rules.get(deficiency, [])

    if allowed_categories:
        df_filtered = df_filtered[
            df_filtered["category"].isin(allowed_categories)
        ]

    if df_filtered.empty:
        print("⚠️ Nutrient filter removed all → fallback")
        df_filtered = df.copy()

    # ==============================
    # AGE FILTER
    # ==============================

    if age <= 12:
        df_filtered = df_filtered[
            df_filtered["category"].isin(["fruit", "vegetable"])
        ]
    elif age >= 60:
        df_filtered = df_filtered[
            df_filtered["category"].isin(["vegetable", "fruit", "legume"])
        ]

    if df_filtered.empty:
        print("⚠️ Age filter removed all → fallback")
        df_filtered = df.copy()

    # ==============================
    # 🔥 REMOVE WEAK FOODS
    # ==============================

    df_filtered = df_filtered[df_filtered[column] > 0.5]

    if df_filtered.empty:
        df_filtered = df.copy()

    # ==============================
    # SORT
    # ==============================

    df_filtered = df_filtered.sort_values(by=column, ascending=False)

    # ==============================
    # REMOVE DUPLICATES
    # ==============================

    df_filtered = df_filtered.drop_duplicates(subset=["food_name"])

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

    # ==============================
    # 🔥 SMART VARIETY (CONTROLLED)
    # ==============================

    top_df = df_filtered.head(20)

    if len(top_df) > top_n:
        top_df = top_df.sample(n=top_n, random_state=42)

    # ==============================
    # FINAL LIST
    # ==============================

    foods_list = top_df["food_name"].dropna().tolist()

    # ==============================
    # DAY-WISE PLAN
    # ==============================

    plan = {}

    for i in range(min(3, len(foods_list))):
        plan[f"Day {i+1}"] = foods_list[: i+1]

    return {
        "top_foods": foods_list,
        "plan": plan
    }