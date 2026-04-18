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

    # Remove harmful foods
    for word in avoid_words:
        df_filtered = df_filtered[
            ~df_filtered["food_name"].str.contains(word, case=False, na=False)
        ]

    # Keep preferred categories
    if prefer_categories:
        df_filtered = df_filtered[
            df_filtered["category"].isin(prefer_categories)
        ]

    return df_filtered


# ==============================
# FINAL RECOMMENDATION
# ==============================

def recommend_food(deficiency, df, age, conditions):

    mapping = {
        "Iron": "iron",
        "Protein": "protein",
        "Vitamin C": "vitamin_c",
        "Vitamin D": "vitamin_d",
        "Fiber": "fiber"
    }

    column = mapping[deficiency]

    df_filtered = apply_disease_filter(df, conditions)

    # Age-based filtering
    if age <= 12:
        df_filtered = df_filtered[df_filtered["category"].isin(["fruit","vegetable"])]
    elif age >= 60:
        df_filtered = df_filtered[df_filtered["category"].isin(["vegetable","fruit","legume"])]

    # Sort highest nutrient
    df_filtered = df_filtered.sort_values(by=column, ascending=False)

    return df_filtered.head(5)