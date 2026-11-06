import React, { useState } from 'react'
import {
  Brain, Database, Network, GitBranch,
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck,
  Play
} from 'lucide-react'

export function AiPerspectivesView({ onTestCustomClause, isTestingClause, customClauseResult }) {
  const [clauseInput, setClauseInput] = useState(
    "The security deposit is non-refundable and will be retained by the landlord for any reason."
  )

  const quickPresets = [
    {
      label: "Non-Refundable Deposit",
      text: "The security deposit is non-refundable and will be retained by the landlord for any reason."
    },
    {
      label: "Unannounced Entry",
      text: "The landlord may enter the premises at any time without prior notice for arbitrary inspection."
    },
    {
      label: "Unlimited Liability",
      text: "The tenant shall assume unlimited liability without any monetary limit for all damages whether or not caused by tenant."
    },
    {
      label: "Balanced Fair Clause",
      text: "The tenant shall pay a refundable security deposit of INR 50,000 returned within 15 days of handover."
    }
  ]

  const handleTest = () => {
    if (!clauseInput.trim()) return
    onTestCustomClause(clauseInput)
  }

  return (
    <div className="rs-ai-container">
      {/* Title & Introduction */}
      <div className="rs-ai-hero">
        <div className="rs-eyebrow">PROJECT DOCUMENTATION WITH AI PERSPECTIVE</div>
        <h2 className="rs-ai-title">RentSure Cognitive & Algorithmic Architecture</h2>
        <p className="rs-ai-desc">
          RentSure integrates five classic pillars of Artificial Intelligence to automate the legal inspection of residential tenancy agreements and secure contractual obligations via blockchain escrow.
        </p>

        <div className="rs-ai-pillar-badges">
          <span className="rs-pillar-chip">1. Knowledge Representation</span>
          <span className="rs-pillar-chip">2. Reasoning</span>
          <span className="rs-pillar-chip">3. Learning</span>
          <span className="rs-pillar-chip">4. NLP</span>
          <span className="rs-pillar-chip">5. Planning</span>
        </div>
      </div>

      {/* 5 Pillars Cards Grid */}
      <div className="rs-pillars-grid">
        {/* Pillar 1 */}
        <div className="rs-pillar-card">
          <div className="rs-pillar-header">
            <div className="rs-pillar-icon p-crimson">
              <Database size={22} />
            </div>
            <div className="rs-pillar-badge">PILLAR 01</div>
          </div>
          <h3>Knowledge Representation</h3>
          <p className="rs-pillar-sub">Contract Ontology & Domain Schemas</p>
          <p className="rs-pillar-body">
            Encodes rental tenancy domains into structured taxonomies: Rent & Payment, Security Deposit, Termination, Maintenance, Utilities, Property Access, Liabilities, and Restrictions. Defines the canonical legal properties a valid agreement must possess.
          </p>
          <div className="rs-pillar-tech">
            <span>Ontology Mapping</span>
            <span>Taxonomic Schema</span>
            <span>Standard Leases</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="rs-pillar-card">
          <div className="rs-pillar-header">
            <div className="rs-pillar-icon p-crimson">
              <GitBranch size={22} />
            </div>
            <div className="rs-pillar-badge">PILLAR 02</div>
          </div>
          <h3>Reasoning Engine</h3>
          <p className="rs-pillar-sub">Heuristic Rule-Based Risk Deduction</p>
          <p className="rs-pillar-body">
            Executes deterministic legal pattern matching rules to identify predatory clauses (e.g., unilateral termination, forfeiture of deposits, unlimited tenant liability) and detects missing topics that create vulnerability for tenants.
          </p>
          <div className="rs-pillar-tech">
            <span>Inference Rules</span>
            <span>Missing Term Detection</span>
            <span>Defensive Logic</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="rs-pillar-card">
          <div className="rs-pillar-header">
            <div className="rs-pillar-icon p-crimson">
              <Brain size={22} />
            </div>
            <div className="rs-pillar-badge">PILLAR 03</div>
          </div>
          <h3>Machine Learning</h3>
          <p className="rs-pillar-sub">TF-IDF & Logistic Regression</p>
          <p className="rs-pillar-body">
            Employs a trained Scikit-Learn classifier vectorizing legal text into n-gram feature spaces. Predicts clause functional intent with probabilistic scoring and falls back gracefully to keyword taxonomy when confidence is below 35%.
          </p>
          <div className="rs-pillar-tech">
            <span>TF-IDF Vectorizer</span>
            <span>Multinomial Classifier</span>
            <span>Confidence Threshold</span>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="rs-pillar-card">
          <div className="rs-pillar-header">
            <div className="rs-pillar-icon p-crimson">
              <Network size={22} />
            </div>
            <div className="rs-pillar-badge">PILLAR 04</div>
          </div>
          <h3>Natural Language Processing</h3>
          <p className="rs-pillar-sub">PyMuPDF & Sentence Boundary Detection</p>
          <p className="rs-pillar-body">
            Extracts raw text streams from arbitrary PDF contracts, strips artifact noise, and splits clauses using regular expression boundary lookaheads that handle diverse numbering schemes (1., CLAUSE 1, APPENDIX).
          </p>
          <div className="rs-pillar-tech">
            <span>PyMuPDF Byte Parsing</span>
            <span>Boundary Segmentation</span>
            <span>Token Normalization</span>
          </div>
        </div>

        {/* Pillar 5 */}
        <div className="rs-pillar-card span-full">
          <div className="rs-pillar-header">
            <div className="rs-pillar-icon p-crimson">
              <ShieldCheck size={22} />
            </div>
            <div className="rs-pillar-badge">PILLAR 05</div>
          </div>
          <h3>Planning & Blockchain Verification</h3>
          <p className="rs-pillar-sub">Cryptographic PDF Fingerprinting & Multi-Signature Escrow</p>
          <p className="rs-pillar-body">
            Transitions the agreement from static paper to a stateful smart contract. Hashes the exact byte stream with SHA-256 for tamper-proof immutability, locking the security deposit in an Ethereum smart contract that requires dual approval or independent arbitration to release funds.
          </p>
          <div className="rs-pillar-tech">
            <span>SHA-256 Digest</span>
            <span>Solidity Smart Contract</span>
            <span>Escrow State Machine</span>
            <span>Ganache Local Node</span>
          </div>
        </div>
      </div>

      {/* Interactive AI Clause Classifier Sandbox */}
      <div className="rs-sandbox-interactive-card">
        <div className="rs-sandbox-header">
          <div>
            <div className="rs-eyebrow">INTERACTIVE LAB</div>
            <h3>Test the RentSure AI Engine with Any Rental Clause</h3>
            <p>
              Type or select a rental clause below to watch the NLP segmentation, ML classifier, and heuristic reasoning engine evaluate it in real time.
            </p>
          </div>
          <Sparkles className="text-crimson" size={26} />
        </div>

        {/* Preset Chips */}
        <div className="rs-preset-chips-row">
          <span>Try a preset:</span>
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              className="rs-preset-chip"
              onClick={() => setClauseInput(preset.text)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Text Input Area */}
        <div className="rs-clause-input-box">
          <textarea
            className="rs-clause-textarea"
            rows={3}
            value={clauseInput}
            onChange={(e) => setClauseInput(e.target.value)}
            placeholder="Type or paste any rental clause here to evaluate..."
          />
          <button
            className="rs-btn-primary"
            disabled={!clauseInput.trim() || isTestingClause}
            onClick={handleTest}
          >
            {isTestingClause ? (
              <>
                <span className="rs-spin-loader"></span>
                Evaluating...
              </>
            ) : (
              <>
                <Play size={16} /> Run AI Inference
              </>
            )}
          </button>
        </div>

        {/* Results Display */}
        {customClauseResult && (
          <div className="rs-clause-eval-result">
            <div className="rs-eval-header">
              <span className="rs-eval-title">INFERENCE RESULT</span>
              <span className={`rs-risk-tag ${(customClauseResult.risk_level || 'low').toLowerCase()}`}>
                {customClauseResult.risk_level || 'Low'} Risk
              </span>
            </div>

            <div className="rs-eval-details-grid">
              <div className="rs-eval-field">
                <span className="field-label">ML Predicted Category:</span>
                <strong>{customClauseResult.category || 'General Terms'}</strong>
              </div>
              <div className="rs-eval-field">
                <span className="field-label">Risk Severity:</span>
                <strong className={`text-${(customClauseResult.risk_level || 'low').toLowerCase()}`}>
                  {customClauseResult.risk_level}
                </strong>
              </div>
            </div>

            {customClauseResult.risks && customClauseResult.risks.length > 0 ? (
              <div className="rs-eval-reasons">
                {customClauseResult.risks.map((r, i) => (
                  <div key={i} className="rs-eval-reason-box">
                    <div className="rs-eval-reason-top">
                      <AlertTriangle size={15} />
                      <strong>Flagged Legal Rule: {r.reason}</strong>
                    </div>
                    <div className="rs-eval-reason-rec">
                      <CheckCircle2 size={14} />
                      <span>{r.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rs-eval-clean">
                <CheckCircle2 size={18} className="text-emerald" />
                <span>No predatory language or unilateral rights detected in this clause. Standard terms.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
