import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Dummy training data (example – replace with real if you have)
data = {
    "iron": [2, 10, 20, 5, 15, 1],
    "vitamin_b12": [1, 3, 5, 0, 4, 1],
    "vitamin_d": [5, 10, 20, 3, 12, 2],
    "severity": ["Severe", "Moderate", "Normal", "Severe", "Moderate", "Severe"]
}

df = pd.DataFrame(data)

X = df[["iron", "vitamin_b12", "vitamin_d"]]
y = df["severity"]

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

joblib.dump(model, "severity_model.pkl")
print("Model trained & saved")
