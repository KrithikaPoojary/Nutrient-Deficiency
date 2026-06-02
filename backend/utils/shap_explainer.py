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

        # =====================================
        # CREATE EXPLAINER
        # =====================================

        explainer = shap.TreeExplainer(
            model
        )

        shap_values = explainer.shap_values(
            input_df
        )

        # =====================================
        # MULTICLASS FIX
        # =====================================

        if isinstance(
            shap_values,
            list
        ):

            shap_values = shap_values[0]

        # =====================================
        # ABS VALUES
        # =====================================

        values = np.abs(
            shap_values[0]
        )

        feature_names = list(
            input_df.columns
        )

        feature_values = (
            input_df.iloc[0]
            .values
        )

        # =====================================
        # TOP FEATURES
        # =====================================

        top_idx = np.argsort(
            values
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
                )

            })

        return explanations

    except Exception as e:

        print(
            "SHAP ERROR:",
            e
        )

        return []