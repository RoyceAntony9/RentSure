import React, { useState, useMemo } from 'react'
import {
  ShieldAlert, AlertTriangle, CheckCircle2,
  Copy, Check, Bookmark, BookmarkCheck, Search,
  Filter, FileText, Download,
  Layers, HelpCircle
} from 'lucide-react'

export function AnalysisView({
  result,
  agreementHash,
  onReset,
  bookmarkedClauses,
  onToggleBookmark,
  onOpenNegotiationModal,
  onNotify
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRisk, setSelectedRisk] = useState('ALL') // 'ALL' | 'High' | 'Medium' | 'Low'
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [viewTab, setViewTab] = useState('clauses') // 'clauses' | 'raw'
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedClauseIndex, setCopiedClauseIndex] = useState(null)

  const analysis = result?.analysis
  const clauses = useMemo(() => analysis?.clauses || [], [analysis])
  const missingClauses = analysis?.missing_clauses || []

  // Metrics
  const highRiskCount = clauses.filter(c => c.risk_level === 'High').length
  const mediumRiskCount = clauses.filter(c => c.risk_level === 'Medium').length
  const lowRiskCount = clauses.filter(c => c.risk_level === 'Low').length
  const riskScore = analysis?.risk_score ?? 0
  const overallRisk = analysis?.overall_risk || 'Low'

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(clauses.map(c => c.category).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [clauses])

  // Filter clauses
  const filteredClauses = useMemo(() => {
    return clauses.filter(clause => {
      if (selectedRisk !== 'ALL' && clause.risk_level !== selectedRisk) {
        return false
      }
      if (selectedCategory !== 'ALL' && clause.category !== selectedCategory) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const textMatch = (clause.text || '').toLowerCase().includes(q)
        const catMatch = (clause.category || '').toLowerCase().includes(q)
        const reasonMatch = (clause.risks || []).some(r =>
          (r.reason || '').toLowerCase().includes(q) ||
          (r.recommendation || '').toLowerCase().includes(q)
        )
        if (!textMatch && !catMatch && !reasonMatch) return false
      }
      return true
    })
  }, [clauses, selectedRisk, selectedCategory, searchQuery])

  const copyHashToClipboard = () => {
    if (!agreementHash) return
    navigator.clipboard.writeText(agreementHash)
    setCopiedHash(true)
    onNotify?.('Agreement SHA-256 hash copied to clipboard!')
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const copyClauseText = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedClauseIndex(index)
    onNotify?.('Clause copied to clipboard!')
    setTimeout(() => setCopiedClauseIndex(null), 2000)
  }

  const exportReport = () => {
    const dateStr = new Date().toLocaleDateString()
    let markdown = `# RentSure Rental Agreement Audit Report\n`
    markdown += `Generated on: ${dateStr}\n`
    markdown += `Document: ${result?.filename || 'Rental Agreement'}\n`
    markdown += `SHA-256 Hash: ${agreementHash || 'N/A'}\n\n`
    markdown += `## Executive Summary\n`
    markdown += `- Overall Risk Score: ${riskScore}/100 (${overallRisk} Risk)\n`
    markdown += `- Total Clauses Audited: ${clauses.length}\n`
    markdown += `- High Risk Clauses: ${highRiskCount}\n`
    markdown += `- Medium Risk Clauses: ${mediumRiskCount}\n`
    markdown += `- Low Risk Clauses: ${lowRiskCount}\n`
    markdown += `- Missing Essential Safeguards: ${missingClauses.length}\n\n`

    markdown += `## Flagged & Critical Clauses\n\n`
    clauses.filter(c => c.risk_level === 'High' || c.risk_level === 'Medium').forEach((c, i) => {
      markdown += `### ${i + 1}. [${c.category}] - ${c.risk_level} Risk\n`
      markdown += `> "${c.text}"\n\n`
      if (c.risks?.length) {
        c.risks.forEach(r => {
          markdown += `- **Issue**: ${r.reason}\n`
          markdown += `- **Recommendation**: ${r.recommendation}\n\n`
        })
      }
    })

    if (missingClauses.length > 0) {
      markdown += `## Potentially Missing Clauses\n\n`
      missingClauses.forEach((mc, i) => {
        markdown += `${i + 1}. **${mc.name}**: ${mc.reason}\n`
      })
      markdown += `\n`
    }

    markdown += `## Legal Disclaimer\n`
    markdown += `${analysis?.disclaimer || 'Automated analysis only.'}\n`

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `RentSure_Audit_${(result?.filename || 'agreement').replace(/\.[^/.]+$/, '')}.md`
    link.click()
    URL.revokeObjectURL(url)
    onNotify?.('Audit report downloaded as Markdown!')
  }

  return (
    <div className="rs-analysis-container">
      {/* Top Banner Navigation & Summary Bar */}
      <div className="rs-analysis-topbar">
        <div className="rs-analysis-title-group">
          <div className="rs-eyebrow">AUDIT RESULTS & INTELLIGENCE</div>
          <h2 className="rs-analysis-heading">{result?.filename || 'Rental Agreement'}</h2>
          <div className="rs-analysis-doc-meta">
            <span>{result?.pages || 1} {result?.pages === 1 ? 'page' : 'pages'}</span>
            <span>&bull;</span>
            <span>{clauses.length} clauses parsed</span>
            <span>&bull;</span>
            <span className="rs-hash-badge" onClick={copyHashToClipboard} title="Click to copy SHA-256 hash">
              Hash: {agreementHash ? `${agreementHash.slice(0, 10)}...${agreementHash.slice(-8)}` : 'Generating...'}
              {copiedHash ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
            </span>
          </div>
        </div>

        <div className="rs-analysis-actions">
          {bookmarkedClauses.size > 0 && (
            <button className="rs-btn-crimson" onClick={onOpenNegotiationModal}>
              <BookmarkCheck size={16} />
              Negotiation List ({bookmarkedClauses.size})
            </button>
          )}
          <button className="rs-btn-outline" onClick={exportReport}>
            <Download size={16} /> Export Report
          </button>
          <button className="rs-btn-secondary" onClick={onReset}>
            Upload New File
          </button>
        </div>
      </div>

      {/* Risk Executive Dashboard Card */}
      <div className="rs-risk-dashboard-card">
        {/* Risk Radial Gauge Section */}
        <div className="rs-gauge-box">
          <div className="rs-gauge-circle">
            <svg viewBox="0 0 100 100" className="rs-radial-svg">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="rs-gauge-bg"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className={`rs-gauge-bar ${overallRisk.toLowerCase()}`}
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * riskScore) / 100}
              />
            </svg>
            <div className="rs-gauge-content">
              <span className="rs-gauge-val">{riskScore}</span>
              <span className="rs-gauge-max">/100</span>
            </div>
          </div>
          <div className="rs-gauge-meta">
            <span className={`rs-risk-tag ${overallRisk.toLowerCase()}`}>
              {overallRisk.toUpperCase()} RISK
            </span>
            <span className="rs-gauge-caption">Overall Contract Risk Profile</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="rs-metrics-grid">
          <div className="rs-metric-tile high">
            <div className="rs-metric-top">
              <span className="rs-metric-dot"></span>
              <span>High Risk</span>
            </div>
            <strong className="rs-metric-number">{highRiskCount}</strong>
            <span className="rs-metric-label">Needs Urgent Revision</span>
          </div>

          <div className="rs-metric-tile medium">
            <div className="rs-metric-top">
              <span className="rs-metric-dot"></span>
              <span>Medium Risk</span>
            </div>
            <strong className="rs-metric-number">{mediumRiskCount}</strong>
            <span className="rs-metric-label">Clarification Recommended</span>
          </div>

          <div className="rs-metric-tile low">
            <div className="rs-metric-top">
              <span className="rs-metric-dot"></span>
              <span>Low Risk</span>
            </div>
            <strong className="rs-metric-number">{lowRiskCount}</strong>
            <span className="rs-metric-label">Standard & Balanced</span>
          </div>

          <div className="rs-metric-tile missing">
            <div className="rs-metric-top">
              <AlertTriangle size={14} />
              <span>Missing Terms</span>
            </div>
            <strong className="rs-metric-number">{missingClauses.length}</strong>
            <span className="rs-metric-label">Safeguards Omitted</span>
          </div>
        </div>
      </div>

      {/* Switch between Clauses View & Raw Text View */}
      <div className="rs-view-tabs-strip">
        <div className="rs-view-tab-buttons">
          <button
            className={`rs-tab-pill ${viewTab === 'clauses' ? 'active' : ''}`}
            onClick={() => setViewTab('clauses')}
          >
            <Layers size={16} /> Extracted Clause Audit ({clauses.length})
          </button>
          <button
            className={`rs-tab-pill ${viewTab === 'raw' ? 'active' : ''}`}
            onClick={() => setViewTab('raw')}
          >
            <FileText size={16} /> Full Extracted Text
          </button>
        </div>

        {viewTab === 'clauses' && (
          <div className="rs-filter-controls">
            {/* Search Input */}
            <div className="rs-search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search clauses or issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="rs-clear-search" onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>

            {/* Risk Filter Buttons */}
            <div className="rs-risk-filter-pills">
              <button
                className={`rs-filter-chip ${selectedRisk === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedRisk('ALL')}
              >
                All ({clauses.length})
              </button>
              <button
                className={`rs-filter-chip chip-high ${selectedRisk === 'High' ? 'active' : ''}`}
                onClick={() => setSelectedRisk('High')}
              >
                High ({highRiskCount})
              </button>
              <button
                className={`rs-filter-chip chip-medium ${selectedRisk === 'Medium' ? 'active' : ''}`}
                onClick={() => setSelectedRisk('Medium')}
              >
                Medium ({mediumRiskCount})
              </button>
              <button
                className={`rs-filter-chip chip-low ${selectedRisk === 'Low' ? 'active' : ''}`}
                onClick={() => setSelectedRisk('Low')}
              >
                Low ({lowRiskCount})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Pills (if in clauses mode) */}
      {viewTab === 'clauses' && categories.length > 2 && (
        <div className="rs-category-pills-row">
          <span className="rs-cat-label"><Filter size={13} /> Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`rs-category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Content Body */}
      {viewTab === 'clauses' ? (
        <div className="rs-clauses-wrapper">
          {filteredClauses.length === 0 ? (
            <div className="rs-empty-filter-state">
              <HelpCircle size={32} />
              <h4>No clauses match your filter</h4>
              <p>Try clearing your search query or choosing another risk filter.</p>
              <button
                className="rs-btn-outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedRisk('ALL')
                  setSelectedCategory('ALL')
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="rs-clauses-list">
              {filteredClauses.map((clause, idx) => {
                const isBookmarked = bookmarkedClauses.has(clause.clause_number ?? idx)
                return (
                  <article
                    key={clause.clause_number || idx}
                    className={`rs-clause-card risk-${(clause.risk_level || 'low').toLowerCase()} ${isBookmarked ? 'bookmarked' : ''}`}
                  >
                    <div className="rs-clause-header">
                      <div className="rs-clause-meta">
                        <span className="rs-clause-number">§ {clause.clause_number || idx + 1}</span>
                        <span className="rs-clause-cat">{clause.category}</span>
                      </div>

                      <div className="rs-clause-badges">
                        <span className={`rs-risk-tag ${(clause.risk_level || 'low').toLowerCase()}`}>
                          {clause.risk_level} Risk
                        </span>
                        <button
                          className={`rs-bookmark-btn ${isBookmarked ? 'active' : ''}`}
                          onClick={() => onToggleBookmark(clause.clause_number ?? idx)}
                          title={isBookmarked ? 'Remove from negotiation list' : 'Flag for landlord negotiation'}
                        >
                          {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                        <button
                          className="rs-copy-btn"
                          onClick={() => copyClauseText(clause.text, idx)}
                          title="Copy clause text"
                        >
                          {copiedClauseIndex === idx ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="rs-clause-body">
                      <p className="rs-clause-text">"{clause.text}"</p>
                    </div>

                    {/* AI Risk Insights */}
                    {clause.risks && clause.risks.length > 0 && (
                      <div className="rs-clause-insights">
                        {clause.risks.map((risk, rIdx) => (
                          <div key={rIdx} className="rs-risk-item">
                            <div className="rs-risk-item-title">
                              <AlertTriangle size={15} />
                              <strong>Why this is flagged ({risk.level} Risk):</strong>
                            </div>
                            <p className="rs-risk-reason">{risk.reason}</p>
                            <div className="rs-risk-rec">
                              <CheckCircle2 size={15} />
                              <span><strong>RentSure Recommendation:</strong> {risk.recommendation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}

          {/* Missing Clauses Section */}
          <div className="rs-missing-clauses-card">
            <div className="rs-missing-header">
              <div>
                <div className="rs-eyebrow">DEFENSIVE CLAUSE CHECK</div>
                <h3 className="rs-missing-title">Potentially Missing Safeguards</h3>
                <p className="rs-missing-subtitle">
                  Rental agreements must protect both parties equally. The RentSure knowledge engine checks for essential clauses that are standard in fair leases.
                </p>
              </div>
              <span className="rs-missing-badge">
                {missingClauses.length} Topics Flagged
              </span>
            </div>

            {missingClauses.length > 0 ? (
              <div className="rs-missing-grid">
                {missingClauses.map((mc, mIdx) => (
                  <div key={mIdx} className="rs-missing-item">
                    <div className="rs-missing-item-top">
                      <AlertTriangle size={16} className="text-crimson" />
                      <strong>{mc.name}</strong>
                    </div>
                    <p className="rs-missing-reason">{mc.reason}</p>
                    <div className="rs-missing-suggest">
                      <span>RentSure Advice: Request landlord to include written terms for this topic before signing.</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rs-missing-clean">
                <CheckCircle2 size={24} className="text-emerald" />
                <div>
                  <strong>All essential clauses detected</strong>
                  <p>No missing standard rental terms were flagged for this document.</p>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="rs-disclaimer-box">
            <ShieldAlert size={18} />
            <p>{analysis?.disclaimer}</p>
          </div>
        </div>
      ) : (
        /* Full Extracted Text View */
        <div className="rs-raw-text-view">
          <div className="rs-raw-text-header">
            <h3>Raw Document Text (PyMuPDF Extraction)</h3>
            <button
              className="rs-btn-outline"
              onClick={() => {
                navigator.clipboard.writeText(result?.extracted_text || '')
                onNotify?.('Raw document text copied!')
              }}
            >
              <Copy size={14} /> Copy Full Text
            </button>
          </div>
          <pre className="rs-raw-pre">{result?.extracted_text || 'No text extracted.'}</pre>
        </div>
      )}
    </div>
  )
}
