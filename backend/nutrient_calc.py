from nutrient_data import food_nutrients

def calculate_nutrients(food_logs):
    totals = {"iron": 0, "vitamin_b12": 0, "vitamin_d": 0}

    for item in food_logs:
        food = item["food_name"].lower()
        quantity = item["quantity"]

        if food in food_nutrients:
            for nutrient in totals:
                totals[nutrient] += food_nutrients[food][nutrient] * quantity

    return totals
