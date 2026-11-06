import React, { useState } from 'react'
import {
  UploadCloud, FileText, FileCheck2, ArrowRight,
  AlertTriangle, CheckCircle2, X, Sparkles, Edit3,
  ShieldCheck, Lock, Binary
} from 'lucide-react'

export function UploadSection({
  file,
  fileInputRef,
  dragging,
  setDragging,
  selectFile,
  resetUpload,
  analyzeAgreement,
  loading,
  error,
  onLoadSample,
  onAnalyzeCustomText
}) {
  const [mode, setMode] = useState('pdf') // 'pdf' | 'text'
  const [pastedText, setPastedText] = useState('')

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return
    onAnalyzeCustomText(pastedText)
  }

  return (
    <div className="rs-upload-card">
      <div className="rs-section-header">
        <div>
          <div className="rs-eyebrow">DOCUMENT INGESTION & HASHING</div>
          <h2 className="rs-section-title">Analyze a Rental Agreement</h2>
          <p className="rs-section-desc">
            Upload your PDF contract for AI NLP extraction, risk classification, and SHA-256 blockchain hashing.
          </p>
        </div>
        <div className="rs-mode-toggle">
          <button
            className={`rs-mode-btn ${mode === 'pdf' ? 'active' : ''}`}
            onClick={() => setMode('pdf')}
          >
            <FileText size={15} /> Upload PDF
          </button>
          <button
            className={`rs-mode-btn ${mode === 'text' ? 'active' : ''}`}
            onClick={() => setMode('text')}
          >
            <Edit3 size={15} /> Paste Agreement
          </button>
        </div>
      </div>

      {mode === 'pdf' ? (
        <>
          <div
            className={`rs-dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              if (e.dataTransfer.files?.[0]) {
                selectFile(e.dataTransfer.files[0])
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              hidden
              onChange={(e) => selectFile(e.target.files[0])}
            />

            <div className="rs-dropzone-icon">
              <UploadCloud size={38} />
            </div>

            <h3 className="rs-dropzone-title">
              {file ? 'Selected Document Ready' : 'Drag & drop your rental contract PDF here'}
            </h3>
            <p className="rs-dropzone-sub">
              Supports standard residential and commercial tenancy agreements up to 10 MB.
            </p>

            <div className="rs-dropzone-actions">
              <button
                type="button"
                className="rs-btn-outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files <ArrowRight size={15} />
              </button>
            </div>

            <div className="rs-dropzone-specs">
              <span><FileCheck2 size={14} /> PDF format</span>
              <span>&bull;</span>
              <span><Binary size={14} /> SHA-256 integrity hash</span>
              <span>&bull;</span>
              <span><Lock size={14} /> Local client privacy</span>
            </div>
          </div>

          {file && (
            <div className="rs-file-card">
              <div className="rs-file-icon">
                <FileText size={24} />
              </div>
              <div className="rs-file-meta">
                <span className="rs-file-name">{file.name}</span>
                <span className="rs-file-size">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for NLP parser
                </span>
              </div>
              <span className="rs-file-ready-badge">
                <CheckCircle2 size={15} /> Ready
              </span>
              <button
                className="rs-file-remove"
                onClick={resetUpload}
                title="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {error && (
            <div className="rs-alert-box error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="rs-upload-submit-row">
            <button
              className="rs-btn-primary rs-btn-lg"
              disabled={!file || loading}
              onClick={analyzeAgreement}
            >
              {loading ? (
                <>
                  <span className="rs-spin-loader"></span>
                  Processing agreement with AI pipeline...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Analyze Agreement with RentSure AI
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="rs-paste-zone">
          <label className="rs-paste-label">
            Paste Rental Agreement or Specific Clauses Below:
          </label>
          <textarea
            className="rs-paste-textarea"
            rows={7}
            placeholder="Paste your rental agreement text here (e.g., '1. RENT: The tenant shall pay INR 25,000 monthly. 2. DEPOSIT: The entire deposit is non-refundable...')."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          />
          <div className="rs-paste-actions">
            <button
              className="rs-btn-primary"
              disabled={!pastedText.trim() || loading}
              onClick={handlePasteSubmit}
            >
              {loading ? (
                <>
                  <span className="rs-spin-loader"></span>
                  Analyzing clauses...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Analyze Pasted Agreement
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Instant 1-Click Sample Test Buttons */}
      <div className="rs-sample-shortcuts">
        <div className="rs-sample-shortcuts-header">
          <Sparkles size={15} className="rs-red-bullet" />
          <span>Need a quick test? Load pre-configured sample agreements instantly:</span>
        </div>
        <div className="rs-sample-shortcuts-grid">
          <button
            type="button"
            className="rs-sample-chip chip-low"
            onClick={() => onLoadSample('fair-standard')}
          >
            <span className="chip-indicator"></span>
            <strong>Fair Standard Lease</strong>
            <small>Low Risk &bull; 9 Clauses</small>
          </button>

          <button
            type="button"
            className="rs-sample-chip chip-high"
            onClick={() => onLoadSample('predatory-lease')}
          >
            <span className="chip-indicator"></span>
            <strong>Predatory Landlord Lease</strong>
            <small>High Risk &bull; Trap Clauses</small>
          </button>

          <button
            type="button"
            className="rs-sample-chip chip-medium"
            onClick={() => onLoadSample('ambiguous-lease')}
          >
            <span className="chip-indicator"></span>
            <strong>Ambiguous Student Lease</strong>
            <small>Missing Protections &bull; Vague</small>
          </button>
        </div>
      </div>
    </div>
  )
}
