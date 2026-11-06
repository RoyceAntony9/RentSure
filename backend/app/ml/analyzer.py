
import re
from pathlib import Path

import joblib


# 1. LOAD THE TRAINED ML CLASSIFIER

MODEL_PATH = Path(__file__).resolve().parent / "clause_classifier.joblib"

try:
    CLAUSE_MODEL = joblib.load(MODEL_PATH)
    print("RentSure ML clause classifier loaded successfully.")
except Exception as error:
    CLAUSE_MODEL = None
    print(f"ML model unavailable. Using keyword fallback. Error: {error}")


# 2. CLAUSE CATEGORIES AND KEYWORDS (FALLBACK)

CLAUSE_KEYWORDS = {
    "Rent and Payment": [
        "rent", "monthly payment", "payment due",
        "rental amount", "late fee"
    ],
    "Security Deposit": [
        "security deposit", "refundable deposit",
        "deposit", "forfeit"
    ],
    "Termination": [
        "termination", "terminate", "vacate",
        "notice period", "eviction"
    ],
    "Maintenance and Repairs": [
        "maintenance", "repairs", "plumbing",
        "electrical", "damage"
    ],
    "Utilities and Bills": [
        "electricity", "water bill", "utility",
        "internet", "gas charges"
    ],
    "Property Access": [
        "enter the premises", "access to premises",
        "inspection", "landlord may enter"
    ],
    "Liability and Penalties": [
        "liability", "penalty", "damages",
        "compensation", "losses"
    ],
    "Restrictions": [
        "sublet", "subletting", "alterations",
        "commercial activities"
    ]
}


# 3. POTENTIAL RISK DETECTION RULES

RISK_RULES = [
    {
        "pattern": r"non-refundable|non refundable",
        "level": "High",
        "reason": "The deposit is described as non-refundable, even without specifying valid deductions.",
        "recommendation": "Clearly define refundable deposit conditions and itemised deductions."
    },
    {
        "pattern": r"without prior notice|without notice|at any time.*without.*notice",
        "level": "High",
        "reason": "The clause may allow action without reasonable advance notice.",
        "recommendation": "Specify reasonable notice periods and exceptions for emergencies."
    },
    {
        "pattern": r"sole discretion|at the landlord'?s discretion",
        "level": "High",
        "reason": "One party appears to have broad unilateral decision-making power.",
        "recommendation": "Define objective conditions and require written communication for changes."
    },
    {
        "pattern": r"unlimited liability|without any monetary limit|whether or not caused",
        "level": "High",
        "reason": "The clause may impose liability without a clear limit or fault requirement.",
        "recommendation": "Define responsibility, causation and reasonable limits on liability."
    },
    {
        "pattern": r"entire security deposit.*forfeit|deposit.*forfeit.*under all circumstances",
        "level": "High",
        "reason": "The clause appears to permit complete deposit forfeiture in all circumstances.",
        "recommendation": "Specify permitted deductions and a fair deposit refund process."
    },
    {
        "pattern": r"immediately.*vacate|immediate termination|terminate.*immediately",
        "level": "High",
        "reason": "The clause may permit immediate termination without a remedy period.",
        "recommendation": "Define valid termination grounds and an appropriate notice or remedy period."
    },
    {
        "pattern": r"increase.*rent.*any amount|rent.*at any time",
        "level": "Medium",
        "reason": "The rent revision terms may be unclear or allow unilateral increases.",
        "recommendation": "Specify when rent can change, the amount or method, and advance notice."
    },
    {
        "pattern": r"any and all damages|all losses.*expenses",
        "level": "Medium",
        "reason": "The wording may create an excessively broad responsibility for damages.",
        "recommendation": "Clarify which losses are recoverable and how responsibility is established."
    }
]


# 4. MISSING CLAUSE DETECTION RULES

MISSING_CLAUSE_RULES = [
    {
        "name": "Security Deposit Refund Conditions",
        "patterns": [
            r"security deposit",
            r"refundable deposit",
            r"deposit.*refund",
            r"refund.*deposit"
        ],
        "reason": "The agreement may not clearly explain when and how the security deposit will be returned."
    },
    {
        "name": "Termination and Notice Period",
        "patterns": [
            r"termination",
            r"terminate",
            r"notice period",
            r"vacate.*notice"
        ],
        "reason": "The agreement may lack clear conditions and notice requirements for ending the tenancy."
    },
    {
        "name": "Maintenance and Repair Responsibilities",
        "patterns": [
            r"maintenance",
            r"repairs",
            r"plumbing",
            r"electrical repairs"
        ],
        "reason": "Responsibilities for property maintenance and repairs may not be clearly defined."
    },
    {
        "name": "Utilities and Bill Payments",
        "patterns": [
            r"electricity",
            r"water bill",
            r"utility bills",
            r"gas charges",
            r"internet charges"
        ],
        "reason": "The agreement may not specify who is responsible for utility payments."
    },
    {
        "name": "Property Inspection and Access",
        "patterns": [
            r"inspection",
            r"enter the premises",
            r"access to premises",
            r"landlord may enter"
        ],
        "reason": "The agreement may not establish reasonable conditions for property access and inspection."
    },
    {
        "name": "Rent Revision Conditions",
        "patterns": [
            r"rent increase",
            r"rent revision",
            r"revision of rent",
            r"increase.*rent",
            r"enhancement of rent"
        ],
        "reason": "The agreement may not explain whether or how rent can be revised during the tenancy."
    },
    {
        "name": "Dispute Resolution",
        "patterns": [
            r"dispute resolution",
            r"resolve disputes",
            r"arbitration",
            r"mediation",
            r"jurisdiction"
        ],
        "reason": "The agreement may not clearly describe how disagreements between the parties will be handled."
    },
    {
        "name": "Agreement Duration and Tenancy Period",
        "patterns": [
            r"tenancy period",
            r"lease period",
            r"term of the agreement",
            r"commencement date",
            r"expiry date",
            r"ending date"
        ],
        "reason": "The agreement may not clearly establish the duration of the tenancy."
    }
]


# 5. SPLIT DOCUMENT INTO CLAUSES

def split_into_clauses(text):
    """
    Splits agreement text using numbered clause headings.
    Falls back to paragraph-based splitting if necessary.
    """

    text = text.replace("\r\n", "\n").replace("\r", "\n")

    parts = re.split(
        r"(?m)(?=^\s*(?:\d{1,2}[.)]|CLAUSE\s+\d+|APPENDIX\s+[A-Z]))",
        text,
        flags=re.IGNORECASE
    )

    clauses = [
        part.strip()
        for part in parts
        if len(part.strip()) > 35
    ]

    if len(clauses) <= 1:
        clauses = [
            part.strip()
            for part in re.split(r"\n\s*\n", text)
            if len(part.strip()) > 35
        ]

    return clauses


# 6. KEYWORD CLASSIFICATION FALLBACK

def keyword_classify_clause(clause):
    text = clause.lower()

    for category, keywords in CLAUSE_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return category

    return "General Terms"


# 7. ML-BASED CLAUSE CLASSIFICATION

def classify_clause(clause):
    """
    Uses the trained TF-IDF + Logistic Regression model.
    Falls back to keyword classification if unavailable
    or prediction confidence is low.
    """

    if CLAUSE_MODEL is not None:
        try:
            probabilities = CLAUSE_MODEL.predict_proba([clause])[0]
            best_index = probabilities.argmax()
            confidence = probabilities[best_index]

            if confidence >= 0.35:
                return CLAUSE_MODEL.classes_[best_index]

        except Exception as error:
            print(f"ML classification error: {error}")

    return keyword_classify_clause(clause)


# 8. DETECT POTENTIAL RISKS

def detect_risks(clause):
    detected = []

    for rule in RISK_RULES:
        if re.search(rule["pattern"], clause, re.IGNORECASE):
            detected.append({
                "level": rule["level"],
                "reason": rule["reason"],
                "recommendation": rule["recommendation"]
            })

    return detected


# 9. DETECT POTENTIALLY MISSING CLAUSES

def detect_missing_clauses(text):
    """
    Checks the complete agreement for important topics.
    A missing result means the configured wording patterns
    were not found. It does not prove legal omission.
    """

    missing = []

    for rule in MISSING_CLAUSE_RULES:

        found = any(
            re.search(pattern, text, re.IGNORECASE)
            for pattern in rule["patterns"]
        )

        if not found:
            missing.append({
                "name": rule["name"],
                "reason": rule["reason"],
                "status": "Potentially Missing"
            })

    return missing


# 10. ANALYZE THE COMPLETE AGREEMENT

def analyze_agreement(text):
    clauses = split_into_clauses(text)

    results = []
    risk_points = 0

    for index, clause in enumerate(clauses, start=1):

        category = classify_clause(clause)
        risks = detect_risks(clause)

        if any(risk["level"] == "High" for risk in risks):
            risk_level = "High"
            risk_points += 3

        elif any(risk["level"] == "Medium" for risk in risks):
            risk_level = "Medium"
            risk_points += 2

        else:
            risk_level = "Low"

        results.append({
            "clause_number": index,
            "category": category,
            "text": clause,
            "risk_level": risk_level,
            "risks": risks
        })

    # Indicative risk score from 0 to 100

    if results:
        risk_score = round(
            (risk_points / (len(results) * 3)) * 100
        )
    else:
        risk_score = 0

    if risk_score >= 60:
        overall_risk = "High"
    elif risk_score >= 25:
        overall_risk = "Medium"
    else:
        overall_risk = "Low"

    # Identify potentially missing topics

    missing_clauses = detect_missing_clauses(text)

    return {
        "overall_risk": overall_risk,
        "risk_score": risk_score,
        "total_clauses": len(results),
        "clauses": results,
        "missing_clauses": missing_clauses,
        "disclaimer": (
            "This automated analysis highlights potentially concerning "
            "wording and topics that may be missing. It is not legal advice "
            "and does not determine whether a clause is legally enforceable."
        )
    }
