import shap
import numpy as np

# =========================================
# SHAP EXPLAINER
# =========================================

def explain_prediction(

    model,
    input_df

):

    try:

        print("\n====================")
        print("SHAP DEBUG START")
        print("====================")

        print("MODEL TYPE:")
        print(type(model))

        print("INPUT DF:")
        print(input_df.head())

        # =====================================
        # BOOSTER DEBUG
        # =====================================

        print("BOOSTER ATTRIBUTES:")
        print(
            model.get_booster().attributes()
        )

        print("BOOSTER FEATURE COUNT:")
        print(
            len(
                model.get_booster().feature_names
            )
        )

        # =====================================
        # CREATE EXPLAINER
        # =====================================

        print("CREATING EXPLAINER...")

        explainer = shap.TreeExplainer(
            model.get_booster()
        )

        print("EXPLAINER CREATED")

        # =====================================
        # SHAP VALUES
        # =====================================

        shap_values = explainer.shap_values(
            input_df
        )

        print("SHAP VALUES GENERATED")

        # =====================================
        # MULTICLASS FIX
        # =====================================

        if isinstance(
            shap_values,
            list
        ):

            predicted_class = int(
                model.predict(
                    input_df
                )[0]
            )

            print(
                "PREDICTED CLASS:",
                predicted_class
            )

            shap_values = shap_values[
                predicted_class
            ]

        print(
            "SHAP ARRAY SHAPE:",
            np.array(
                shap_values
            ).shape
        )

        # =====================================
        # TOP FEATURES
        # =====================================

        raw_values = shap_values[0]

        abs_values = np.abs(
            raw_values
        )

        feature_names = list(
            input_df.columns
        )

        feature_values = (
            input_df.iloc[0]
            .values
        )

        top_idx = np.argsort(
            abs_values
        )[::-1][:5]

        explanations = []

        for idx in top_idx:

            explanations.append({

                "feature":
                feature_names[idx],

                "value":
                round(
                    float(
                        feature_values[idx]
                    ),
                    2
                ),

                "impact":
                round(
                    float(
                        raw_values[idx]
                    ),
                    4
                )

            })

        print(
            "TOP FEATURES:"
        )

        print(
            explanations
        )

        print(
            "SHAP DEBUG END"
        )

        return explanations

    except Exception as e:

        print(
            "\nSHAP ERROR:",
            e
        )

        print(
            "MODEL TYPE:",
            type(model)
        )

        return []