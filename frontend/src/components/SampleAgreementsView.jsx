import React, { useState } from 'react'
import { Download, Play, Check } from 'lucide-react'
import { SAMPLE_AGREEMENTS } from '../data/sampleAgreements'

export function SampleAgreementsView({ onLoadSample, onNotify }) {
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadedId, setDownloadedId] = useState(null)

  const handleDownload = async (e, sample) => {
    e.preventDefault()
    setDownloadingId(sample.id)
    onNotify?.(`Downloading ${sample.filename}...`)

    try {
      const filePath = sample.path || `/samples/${sample.filename}`
      let response = await fetch(filePath)
      
      if (!response.ok) {
        // Fallback to backend API endpoint
        response = await fetch(`http://127.0.0.1:8000/api/samples/${sample.filename}`)
      }

      if (!response.ok) {
        throw new Error(`Failed to load ${sample.filename} (HTTP ${response.status})`)
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = sample.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)

      setDownloadedId(sample.id)
      onNotify?.(`Saved ${sample.filename} to Downloads!`)
      setTimeout(() => setDownloadedId(null), 3000)
    } catch (err) {
      console.warn('Blob download fallback:', err)
      // Fallback: direct anchor trigger
      const fallbackUrl = `/samples/${sample.filename}`
      const link = document.createElement('a')
      link.href = fallbackUrl
      link.download = sample.filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      onNotify?.(`Triggered download for ${sample.filename}`)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="rs-samples-container">
      <div className="rs-samples-hero">
        <div className="rs-eyebrow">AUDIT TEST SUITE</div>
        <h2 className="rs-samples-title">Sample Rental Agreements Lab</h2>
        <p className="rs-samples-desc">
          Test RentSure's AI analysis engine instantly using these pre-compiled agreements. Each contract is designed to stress-test specific clauses, predatory patterns, or missing legal protections.
        </p>
      </div>

      <div className="rs-samples-grid">
        {SAMPLE_AGREEMENTS.map((sample) => (
          <div key={sample.id} className={`rs-sample-card badge-${sample.badgeColor}`}>
            <div className="rs-sample-card-header">
              <span className={`rs-risk-tag ${sample.badgeColor}`}>
                {sample.badge}
              </span>
              <span className="rs-sample-pages">
                {sample.pages} page &bull; {(sample.fileSize / 1024).toFixed(1)} KB
              </span>
            </div>

            <h3 className="rs-sample-card-title">{sample.title}</h3>
            <p className="rs-sample-card-desc">{sample.description}</p>

            <div className="rs-sample-meta-box">
              <div className="rs-sample-meta-row">
                <span>Overall Risk Score:</span>
                <strong>{sample.analysis.risk_score} / 100</strong>
              </div>
              <div className="rs-sample-meta-row">
                <span>Clauses Parsed:</span>
                <strong>{sample.analysis.total_clauses} clauses</strong>
              </div>
              <div className="rs-sample-meta-row">
                <span>Missing Protections:</span>
                <strong>{sample.analysis.missing_clauses?.length || 0} flagged</strong>
              </div>
              <div className="rs-sample-meta-row hash-row">
                <span>SHA-256:</span>
                <code>{sample.hash.slice(0, 16)}...</code>
              </div>
            </div>

            <div className="rs-sample-actions">
              <button
                className="rs-btn-primary"
                onClick={() => onLoadSample(sample.id)}
              >
                <Play size={15} /> 1-Click Audit Test
              </button>
              <button
                type="button"
                className="rs-btn-outline"
                disabled={downloadingId === sample.id}
                onClick={(e) => handleDownload(e, sample)}
              >
                {downloadedId === sample.id ? (
                  <>
                    <Check size={15} className="text-emerald" /> Downloaded
                  </>
                ) : downloadingId === sample.id ? (
                  <>
                    <span className="rs-spin-loader"></span> Saving...
                  </>
                ) : (
                  <>
                    <Download size={15} /> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
