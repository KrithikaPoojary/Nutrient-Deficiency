# =========================================
# IMPORTS
# =========================================

import shap
import numpy as np

# =========================================
# SHAP EXPLAIN FUNCTION
# =========================================

def explain_prediction(

    model,
    input_df

):

    try:

        # =====================================
        # SHAP EXPLAINER
        # =====================================

        explainer = shap.TreeExplainer(
            model
        )

        shap_values = explainer.shap_values(
            input_df
        )

        # =====================================
        # MULTICLASS HANDLING
        # =====================================

        if isinstance(shap_values, list):

            shap_array = np.abs(
                shap_values[0][0]
            )

        else:

            shap_array = np.abs(
                shap_values[0]
            )

        # =====================================
        # FEATURE IMPORTANCE
        # =====================================

        feature_names = (
            input_df.columns.tolist()
        )

        importance = list(

            zip(
                feature_names,
                shap_array
            )

        )

        importance = sorted(

            importance,

            key=lambda x: x[1],

            reverse=True

        )

        # =====================================
        # TOP FEATURES
        # =====================================

        top_features = []

        for feature, score in importance[:5]:

            readable = (
                feature
                .replace("_", " ")
            )

            top_features.append({

                "feature":
                readable,

                "importance":
                round(float(score), 3)

            })

        return top_features

    except Exception as e:

        print("SHAP ERROR:", e)

        return []
