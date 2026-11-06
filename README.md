# RentSure — AI-Driven Rental Agreement Analysis & Blockchain Escrow

> **Project Documentation with AI Perspective**  
> *Knowledge Representation • Reasoning • Learning • NLP • Planning*

RentSure is an end-to-end intelligent platform designed to demystify complex residential tenancy contracts, identify predatory clauses and omitted safeguards, and secure security deposits via an Ethereum multi-signature smart contract escrow.

---

## 🎨 Architectural Design Language & Branding
RentSure features an editorial, high-contrast architectural identity inspired by modern glass-and-concrete apartment structures:
- **Primary Color**: RentSure Crimson (`#D3151D`), complemented by obsidian dark surfaces (`#0E1217`) and crisp stark white cards.
- **Typography**: Architectural condensed headers (`Oswald`, `Cabinet Grotesk`) paired with `Plus Jakarta Sans` for clarity and `JetBrains Mono` for cryptographic hashes and Web3 addresses.
- **Pill Accents & Badges**: Symmetrical framing tags (`START` and `PROJECT` half-circles) and pill badges for risk classification and system status.

---

## 🧠 The 5 Pillars of Artificial Intelligence in RentSure

1. **Knowledge Representation**: Encodes rental contract domains into structured taxonomies (Rent & Payment, Security Deposit, Termination, Maintenance, Utilities, Property Access, Liabilities, Restrictions) representing the canonical legal obligations of standard leases.
2. **Reasoning Engine**: Deterministic rule deduction that detects predatory patterns (e.g., unilateral forfeiture, unannounced inspections, unlimited tenant liabilities) and flags omitted mandatory safeguards.
3. **Machine Learning**: A trained Scikit-Learn TF-IDF vectorizer + Logistic Regression classifier (`clause_classifier.joblib`) predicting clause intent with probabilistic scoring and graceful heuristic fallback.
4. **Natural Language Processing (NLP)**: Ingests PDF streams via PyMuPDF (`pymupdf`), strips document noise, and splits text into structured legal clauses using regular expression boundary segmentation.
5. **Planning & Blockchain Verification**: Computes SHA-256 cryptographic PDF hashes and links them to a Solidity smart contract escrow (`RentSureEscrow.sol`) enforcing stateful deposit custody, mutual release approvals, and third-party arbitration.

---

## 🚀 Key Features

### 1. Document Ingestion & Hashing
- Drag-and-drop PDF upload (up to 10 MB) or direct text pasting.
- Instant SHA-256 cryptographic digest calculated directly in the browser via Web Crypto API.
- 1-click test buttons for pre-compiled sample agreements.

### 2. Comprehensive Agreement Audit
- **Radial Risk Score Gauge (0–100)** with High / Medium / Low risk breakdown.
- **Real-Time Search & Category Filters**: Filter clauses by keywords or categories (Security Deposit, Termination, Maintenance, etc.).
- **Flag for Negotiation**: Bookmark questionable clauses to compile a customized *Tenant Negotiation Checklist*.
- **Defensive Safeguard Detection**: Highlights missing clauses that leave tenants vulnerable.
- **Export Audit Report**: 1-click download of a formatted Markdown report or raw text.

### 3. Blockchain Smart Contract Escrow
- **Dual Operating Modes**:
  - **Live Web3**: Connects to Ganache local node (Chain ID: 1337) with Rabby or MetaMask.
  - **Interactive Sandbox Simulation**: Allows testing the full smart contract state machine (Deposit -> Landlord Sign -> Tenant Sign -> Release / Dispute) without wallet or gas setup.
- **Role Switcher**: Test actions as Tenant, Landlord, or Dispute Resolver.
- **Audit & Transaction Ledger**: Real-time event log with block hashes and timestamps.

### 4. Interactive AI Intelligence Sandbox
- Test any custom clause in real time to view ML predicted category, risk severity, and AI recommendations.

### 5. Sample Agreements Laboratory
- **Standard Balanced Tenancy Agreement** (Fair Lease, Score: 0/100, Low Risk)
- **Predatory Landlord Lease** (Biased Contract, Score: 62/100, High Risk)
- **Ambiguous Student Flat Lease** (Short Form, 6 Missing Protections)
- Downloadable sample PDFs for testing.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Lucide React, Ethers.js v6, Recharts, Custom Architectural CSS.
- **Backend**: FastAPI, PyMuPDF, Scikit-Learn, Joblib, Pydantic.
- **Blockchain**: Solidity (`RentSureEscrow`), Ganache Local RPC (Chain ID 1337).

---

## 🏃 Quick Start Guide

### 1. Start the Backend API
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License
Academic Prototype &bull; Developed by Team RentSure.
