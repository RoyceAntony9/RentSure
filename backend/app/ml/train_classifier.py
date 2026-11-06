"""
RentSure initial clause-category classifier.
Run from project root:
    source backend/venv/bin/activate
    python backend/app/ml/train_classifier.py

Dataset: backend/data/rentsure_initial_synthetic_training_dataset.csv
Outputs: backend/app/ml/clause_classifier.joblib and training_metrics.txt

Metrics are only a development check: the dataset is small, synthetic,
and not expert-reviewed. They do not demonstrate real-world legal accuracy.
"""
from pathlib import Path
import sys
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

ML_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ML_DIR.parents[1]
DATASET_PATH = BACKEND_DIR / "data" / "rentsure_initial_synthetic_training_dataset.csv"
MODEL_PATH = ML_DIR / "clause_classifier.joblib"
METRICS_PATH = ML_DIR / "training_metrics.txt"

def main():
    if not DATASET_PATH.exists():
        print(f"Dataset not found: {DATASET_PATH}")
        print("Copy the CSV into backend/data/ and run again.")
        sys.exit(1)

    df = pd.read_csv(DATASET_PATH)
    required = {"clause_text", "category"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")

    df = df.dropna(subset=["clause_text", "category"]).copy()
    df["clause_text"] = df["clause_text"].astype(str).str.strip()
    df["category"] = df["category"].astype(str).str.strip()
    df = df[df["clause_text"].str.len() > 0]

    counts = df["category"].value_counts()
    if len(counts) < 2 or counts.min() < 2:
        raise ValueError("Each category needs at least two examples.")

    X_train, X_test, y_train, y_test = train_test_split(
        df["clause_text"], df["category"],
        test_size=0.25, random_state=42, stratify=df["category"]
    )

    model = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True, ngram_range=(1, 2), stop_words="english",
            max_features=5000, sublinear_tf=True
        )),
        ("classifier", LogisticRegression(
            max_iter=2000, class_weight="balanced", random_state=42
        ))
    ])

    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    report = classification_report(y_test, predictions, zero_division=0)
    labels = sorted(df["category"].unique())
    matrix = confusion_matrix(y_test, predictions, labels=labels)

    joblib.dump(model, MODEL_PATH)
    metrics = (
        "RENTSURE INITIAL CLAUSE CLASSIFIER - DEVELOPMENT METRICS\n"
        "========================================================\n"
        f"Dataset rows: {len(df)} | Train: {len(X_train)} | Test: {len(X_test)}\n"
        f"Categories: {len(labels)} | Dataset: synthetic, not expert-reviewed\n"
        f"Accuracy on this small held-out split: {accuracy:.4f}\n\n"
        f"Classification report:\n{report}\n"
        f"Confusion matrix (rows=true, columns=predicted):\n"
        f"Labels: {labels}\n{matrix}\n\n"
        "CAUTION: These are preliminary development metrics only. The dataset "
        "is small and synthetic; repeated writing patterns may inflate results. "
        "They do not establish real-world or legal accuracy.\n"
    )
    METRICS_PATH.write_text(metrics, encoding="utf-8")

    print("Training completed.")
    print(f"Model saved: {MODEL_PATH}")
    print(f"Metrics saved: {METRICS_PATH}")
    print(f"Accuracy on this small test split: {accuracy:.2%}")
    print("\nClassification report:\n")
    print(report)
    print("\nSynthetic-data metrics are preliminary only.")

if __name__ == "__main__":
    main()
