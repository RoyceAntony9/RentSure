import React from 'react'
import {
  X, BookmarkCheck, Copy,
  CheckCircle2, Shield
} from 'lucide-react'

export function NegotiationModal({
  isOpen,
  onClose,
  clauses,
  bookmarkedIndices,
  onRemoveBookmark,
  onNotify
}) {
  if (!isOpen) return null

  const bookmarkedList = clauses.filter(c =>
    bookmarkedIndices.has(c.clause_number ?? clauses.indexOf(c))
  )

  const copyNegotiationLetter = () => {
    let letter = `Dear Landlord,\n\nI have reviewed the draft rental agreement and would like to propose a few constructive revisions to ensure the terms remain mutually balanced and clear for both parties:\n\n`

    bookmarkedList.forEach((c, idx) => {
      letter += `${idx + 1}. Regarding Clause "${c.text}":\n`
      if (c.risks?.length) {
        c.risks.forEach(r => {
          letter += `   - Concern: ${r.reason}\n`
          letter += `   - Proposed Revision: ${r.recommendation}\n`
        })
      } else {
        letter += `   - Request: Please clarify conditions and provide written notice terms.\n`
      }
      letter += `\n`
    })

    letter += `Thank you for your understanding, and I look forward to finalizing the lease.\n\nBest regards,\nProspective Tenant`

    navigator.clipboard.writeText(letter)
    onNotify?.('Tenant negotiation letter copied to clipboard!')
  }

  return (
    <div className="rs-modal-overlay" onClick={onClose}>
      <div className="rs-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="rs-modal-header">
          <div className="rs-modal-title-group">
            <BookmarkCheck size={20} className="text-crimson" />
            <div>
              <h3>Tenant Negotiation Checklist</h3>
              <p>You have flagged {bookmarkedList.length} clauses to discuss with your landlord.</p>
            </div>
          </div>
          <button className="rs-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="rs-modal-body">
          {bookmarkedList.length === 0 ? (
            <div className="rs-modal-empty">
              <Shield size={36} className="text-crimson" />
              <h4>No clauses flagged yet</h4>
              <p>Click the bookmark icon on any clause in the audit report to add it to your negotiation checklist.</p>
            </div>
          ) : (
            <div className="rs-modal-list">
              {bookmarkedList.map((clause, idx) => {
                const id = clause.clause_number ?? idx
                return (
                  <div key={id} className="rs-modal-clause-item">
                    <div className="rs-modal-item-top">
                      <span className="rs-modal-item-cat">{clause.category}</span>
                      <span className={`rs-risk-tag ${(clause.risk_level || 'low').toLowerCase()}`}>
                        {clause.risk_level} Risk
                      </span>
                      <button
                        className="rs-modal-remove-btn"
                        onClick={() => onRemoveBookmark(id)}
                        title="Remove from list"
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>

                    <p className="rs-modal-item-text">"{clause.text}"</p>

                    {clause.risks?.length > 0 && (
                      <div className="rs-modal-item-rec">
                        <CheckCircle2 size={15} />
                        <div>
                          <strong>Proposed Counter-Proposal:</strong>
                          <p>{clause.risks[0].recommendation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {bookmarkedList.length > 0 && (
          <div className="rs-modal-footer">
            <button className="rs-btn-outline" onClick={onClose}>
              Back to Audit
            </button>
            <button className="rs-btn-primary" onClick={copyNegotiationLetter}>
              <Copy size={16} /> Copy Negotiation Message to Landlord
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
