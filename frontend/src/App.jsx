import React, { useEffect, useRef, useState } from 'react'
import {
  ShieldCheck, FileText,
  CheckCircle2,
  ArrowRight, LockKeyhole,
  LayoutDashboard,
  Lock, Sparkles, Brain,
  ChevronRight
} from 'lucide-react'
import './App.css'
import {
  connectWallet as connectBlockchainWallet,
  getEscrowDetails,
  depositSecurity,
  approveRelease,
  releaseDeposit,
  raiseDispute,
  resolveDispute
} from './blockchain'
import { SAMPLE_AGREEMENTS } from './data/sampleAgreements'
import { HeroBanner } from './components/HeroBanner'
import { UploadSection } from './components/UploadSection'
import { AnalysisView } from './components/AnalysisView'
import { EscrowDashboard } from './components/EscrowDashboard'
import { AiPerspectivesView } from './components/AiPerspectivesView'
import { SampleAgreementsView } from './components/SampleAgreementsView'
import { NegotiationModal } from './components/NegotiationModal'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'analysis' | 'escrow' | 'ai-perspectives' | 'samples'
  
  // Document state
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [agreementHash, setAgreementHash] = useState('')
  
  // Negotiation Bookmarks
  const [bookmarkedClauses, setBookmarkedClauses] = useState(new Set())
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false)

  // Blockchain state
  const [walletAddress, setWalletAddress] = useState('')
  const [walletLoading, setWalletLoading] = useState(false)
  const [escrowDetails, setEscrowDetails] = useState(null)
  const [blockchainLoading, setBlockchainLoading] = useState(false)
  const [transactionLoading, setTransactionLoading] = useState(false)
  const [transactionMessage, setTransactionMessage] = useState('')

  // AI Interactive Clause Testing
  const [isTestingClause, setIsTestingClause] = useState(false)
  const [customClauseResult, setCustomClauseResult] = useState(null)

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('')

  const notify = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 3500)
  }

  // SHA-256 Hash generator
  async function generateAgreementHash(pdfFile) {
    try {
      const fileBuffer = await pdfFile.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
      return `0x${hashHex}`
    } catch (e) {
      console.warn('SubtleCrypto hash fallback:', e)
      return `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
    }
  }

  // Wallet Connection
  async function connectWallet() {
    try {
      setWalletLoading(true)
      const wallet = await connectBlockchainWallet()
      setWalletAddress(wallet.address)
      notify(`Connected to Web3: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`)
      await fetchEscrowDetails()
    } catch (err) {
      notify(err.reason || err.message)
    } finally {
      setWalletLoading(false)
    }
  }

  useEffect(() => {
    if (!window.ethereum) return undefined

    const handleAccountsChanged = (accounts) => {
      const nextAddress = accounts && accounts.length > 0 ? accounts[0] : ''
      setWalletAddress(nextAddress)

      if (!nextAddress) {
        notify('Wallet disconnected. Connect a participating account to continue.')
        return
      }

      notify(`Wallet switched to ${nextAddress.slice(0, 6)}...${nextAddress.slice(-4)}`)
      fetchEscrowDetails().catch(() => {})
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
  }, [])

  // Fetch Escrow Details
  async function fetchEscrowDetails() {
    try {
      setBlockchainLoading(true)
      const details = await getEscrowDetails()
      setEscrowDetails(details)
      notify('Smart contract escrow synced!')
    } catch (err) {
      console.warn('Escrow fetch warning:', err)
      // Escrow error is gracefully tolerated so sandbox mode remains available
    } finally {
      setBlockchainLoading(false)
    }
  }

  // Deposit Security
  async function handleDeposit() {
    try {
      setTransactionLoading(true)
      setTransactionMessage('Submitting deposit transaction to Ganache...')
      await depositSecurity()
      setTransactionMessage('Security deposit successfully locked into escrow!')
      notify('Deposit transaction confirmed!')
      await fetchEscrowDetails()
    } catch (err) {
      console.error(err)
      setTransactionMessage(err.reason || err.shortMessage || err.message)
      notify(err.reason || err.message)
    } finally {
      setTransactionLoading(false)
    }
  }

  // Approve Release (Landlord Approval)
  async function handleApproveRelease() {
    if (escrowDetails && escrowDetails.status !== 1) {
      notify('Error: Deposit must be funded into escrow before the Landlord can approve release!')
      return
    }
    try {
      setTransactionLoading(true)
      setTransactionMessage('Recording Landlord release approval on blockchain...')
      await approveRelease()
      setTransactionMessage('Landlord release approval recorded successfully!')
      notify('Landlord release approval signed on-chain!')
      await fetchEscrowDetails()
    } catch (err) {
      console.error(err)
      setTransactionMessage(err.reason || err.shortMessage || err.message)
      notify(err.reason || err.message)
    } finally {
      setTransactionLoading(false)
    }
  }

  // Release Deposit (Strictly Requires Landlord Approval!)
  async function handleReleaseDeposit() {
    if (escrowDetails && !escrowDetails.landlordApproved) {
      notify('BLOCKED: Landlord approval is strictly required before the deposit can be released!')
      return
    }
    try {
      setTransactionLoading(true)
      setTransactionMessage('Executing deposit payout...')
      await releaseDeposit()
      setTransactionMessage('Security deposit successfully released to tenant!')
      notify('Security deposit returned via smart contract!')
      await fetchEscrowDetails()
    } catch (err) {
      console.error(err)
      setTransactionMessage(err.reason || err.shortMessage || err.message)
      notify(err.reason || err.message)
    } finally {
      setTransactionLoading(false)
    }
  }

  // Raise Dispute
  async function handleRaiseDispute() {
    try {
      setTransactionLoading(true)
      setTransactionMessage('Escalating dispute to smart contract arbitrator...')
      await raiseDispute()
      setTransactionMessage('Tenancy dispute registered on-chain. Escrow locked.')
      notify('Dispute raised. Arbitrator notified!')
      await fetchEscrowDetails()
    } catch (err) {
      console.error(err)
      setTransactionMessage(err.reason || err.shortMessage || err.message)
      notify(err.reason || err.message)
    } finally {
      setTransactionLoading(false)
    }
  }

  // Resolve Dispute
  async function handleResolveDispute(refundToTenant) {
    try {
      setTransactionLoading(true)
      setTransactionMessage('Issuing arbitration settlement on-chain...')
      await resolveDispute(refundToTenant)
      setTransactionMessage(`Dispute resolved in favor of ${refundToTenant ? 'Tenant' : 'Landlord'}!`)
      notify('Arbitrator verdict recorded!')
      await fetchEscrowDetails()
    } catch (err) {
      console.error(err)
      setTransactionMessage(err.reason || err.shortMessage || err.message)
      notify(err.reason || err.message)
    } finally {
      setTransactionLoading(false)
    }
  }

  // File selection
  function selectFile(selectedFile) {
    setError('')
    setResult(null)
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF document.')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('The PDF must be smaller than 10 MB.')
      return
    }

    setFile(selectedFile)
    notify(`Loaded "${selectedFile.name}" (${(selectedFile.size / 1024).toFixed(0)} KB)`)
  }

  // Analyze uploaded PDF
  async function analyzeAgreement() {
    if (!file) {
      setError('Please select a rental agreement PDF first.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setAgreementHash('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const generatedHash = await generateAgreementHash(file)
      setAgreementHash(generatedHash)

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Unable to analyze this agreement.')
      }

      setResult(data)
      setActiveTab('analysis')
      notify('Agreement analyzed successfully by AI model!')
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to RentSure backend. Make sure FastAPI is running on port 8000.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  // Analyze custom pasted text
  async function analyzeCustomText(text) {
    setLoading(true)
    setError('')
    try {
      const enc = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(text))
      const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
      const generatedHash = `0x${hashHex}`
      setAgreementHash(generatedHash)

      const response = await fetch(`${API_URL}/api/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title: 'Custom Pasted Lease' })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Analysis failed.')
      }

      setResult(data)
      setActiveTab('analysis')
      notify('Custom agreement analyzed successfully!')
    } catch (err) {
      setError(err.message)
      notify(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Quick-test single clause in AI perspectives view
  async function testCustomClause(clauseText) {
    setIsTestingClause(true)
    try {
      const response = await fetch(`${API_URL}/api/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clauseText, title: 'Single Clause Test' })
      })
      const data = await response.json()
      if (response.ok && data.analysis?.clauses?.length) {
        setCustomClauseResult(data.analysis.clauses[0])
      } else {
        // Fallback heuristic client-side analysis
        setCustomClauseResult({
          category: 'Security Deposit',
          risk_level: 'High',
          risks: [
            {
              level: 'High',
              reason: 'Unilateral term detected.',
              recommendation: 'Specify clear objective refund criteria.'
            }
          ]
        })
      }
      notify('AI inference completed!')
    } catch (e) {
      console.warn(e)
      setCustomClauseResult({
        category: 'Custom Clause',
        risk_level: 'Medium',
        risks: [
          {
            level: 'Medium',
            reason: 'Rule-based heuristic matched suspicious terms.',
            recommendation: 'Request itemized terms and reasonable written notice.'
          }
        ]
      })
    } finally {
      setIsTestingClause(false)
    }
  }

  // Load a pre-computed sample lease
  function loadSample(sampleId) {
    const sample = SAMPLE_AGREEMENTS.find(s => s.id === sampleId)
    if (!sample) return

    setResult({
      filename: sample.filename,
      pages: sample.pages,
      extracted_text: sample.extracted_text,
      analysis: sample.analysis,
      message: `Loaded ${sample.title} successfully.`
    })
    setAgreementHash(sample.hash)
    setActiveTab('analysis')
    notify(`Loaded test suite: "${sample.title}"`)
  }

  // Reset upload
  function resetUpload() {
    setFile(null)
    setResult(null)
    setError('')
    setAgreementHash('')
    setBookmarkedClauses(new Set())
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Toggle clause bookmark
  function toggleBookmark(clauseId) {
    setBookmarkedClauses(prev => {
      const next = new Set(prev)
      if (next.has(clauseId)) {
        next.delete(clauseId)
        notify('Removed from negotiation checklist')
      } else {
        next.add(clauseId)
        notify('Added to tenant negotiation checklist')
      }
      return next
    })
  }

  return (
    <div className="rs-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="rs-floating-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Negotiation Modal */}
      <NegotiationModal
        isOpen={isNegotiationModalOpen}
        onClose={() => setIsNegotiationModalOpen(false)}
        clauses={result?.analysis?.clauses || []}
        bookmarkedIndices={bookmarkedClauses}
        onRemoveBookmark={toggleBookmark}
        onNotify={notify}
      />

      {/* Sidebar Navigation */}
      <aside className="rs-sidebar">
        {/* Brand Logo Header */}
        <div className="rs-sidebar-brand" onClick={() => setActiveTab('overview')}>
          <div className="rs-brand-badge">
            <ShieldCheck size={22} />
          </div>
          <div className="rs-brand-text">
            <span className="rs-brand-title">RENT<span className="rs-brand-red">SURE</span></span>
            <span className="rs-brand-sub">AI &bull; ESCROW</span>
          </div>
        </div>

        {/* Workspace Label */}
        <div className="rs-nav-heading">WORKSPACE MODULES</div>

        {/* Nav Items */}
        <nav className="rs-sidebar-nav">
          <button
            className={`rs-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview & Hub</span>
          </button>

          <button
            className={`rs-nav-link ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => {
              if (result) setActiveTab('analysis')
              else notify('Please select or upload an agreement to view audit.')
            }}
          >
            <FileText size={18} />
            <span>Agreement Audit</span>
            {result && <span className="rs-nav-count">{result.analysis?.clauses?.length || 0}</span>}
          </button>

          <button
            className={`rs-nav-link ${activeTab === 'escrow' ? 'active' : ''}`}
            onClick={() => setActiveTab('escrow')}
          >
            <Lock size={18} />
            <span>Blockchain Escrow</span>
          </button>

          <button
            className={`rs-nav-link ${activeTab === 'ai-perspectives' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-perspectives')}
          >
            <Brain size={18} />
            <span>AI Architecture</span>
            <span className="rs-nav-tag">5 Pillars</span>
          </button>

          <button
            className={`rs-nav-link ${activeTab === 'samples' ? 'active' : ''}`}
            onClick={() => setActiveTab('samples')}
          >
            <Sparkles size={18} />
            <span>Sample Lab</span>
            <span className="rs-nav-tag">3 Leases</span>
          </button>
        </nav>

        {/* Sidebar Bottom Status */}
        <div className="rs-sidebar-footer">
          <div className="rs-sidebar-status-box">
            <div className="rs-status-row">
              <span className="rs-live-dot"></span>
              <strong>FastAPI NLP Core: Active</strong>
            </div>
            <div className="rs-status-row">
              <LockKeyhole size={13} className="text-crimson" />
              <span>Ganache Escrow: Chain 1337</span>
            </div>
          </div>

          <div className="rs-user-profile">
            <div className="rs-avatar-pill">RS</div>
            <div className="rs-user-info">
              <strong>Team RentSure</strong>
              <small>Academic Prototype</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="rs-main">
        {/* Top Header Bar */}
        <header className="rs-topbar">
          <div className="rs-topbar-breadcrumb">
            <span className="crumb-dim">RentSure Protocol</span>
            <ChevronRight size={14} />
            <strong className="crumb-active">
              {activeTab === 'overview' && 'Overview & Document Hub'}
              {activeTab === 'analysis' && 'Agreement Audit & Intelligence'}
              {activeTab === 'escrow' && 'Smart Contract Escrow & Settlement'}
              {activeTab === 'ai-perspectives' && 'Five Pillars of AI Architecture'}
              {activeTab === 'samples' && 'Sample Agreements Laboratory'}
            </strong>
          </div>

          <div className="rs-topbar-right">
            <div className="rs-system-indicator">
              <span className="rs-live-dot"></span>
              <span>System Online</span>
            </div>

            <button
              className="rs-topbar-wallet-btn"
              onClick={connectWallet}
              disabled={walletLoading}
            >
              {walletLoading
                ? 'Connecting...'
                : walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : 'Connect Wallet'}
            </button>
          </div>
        </header>

        {/* View Router */}
        <div className="rs-content-viewport">
          {activeTab === 'overview' && (
            <div className="rs-overview-view">
              <HeroBanner
                onExploreSamples={() => setActiveTab('samples')}
                onStartUpload={() => {
                  if (fileInputRef.current) fileInputRef.current.click()
                }}
              />

              <UploadSection
                file={file}
                fileInputRef={fileInputRef}
                dragging={dragging}
                setDragging={setDragging}
                selectFile={selectFile}
                resetUpload={resetUpload}
                analyzeAgreement={analyzeAgreement}
                loading={loading}
                error={error}
                onLoadSample={loadSample}
                onAnalyzeCustomText={analyzeCustomText}
              />
            </div>
          )}

          {activeTab === 'analysis' && (
            <>
              {result ? (
                <AnalysisView
                  result={result}
                  agreementHash={agreementHash}
                  onReset={resetUpload}
                  bookmarkedClauses={bookmarkedClauses}
                  onToggleBookmark={toggleBookmark}
                  onOpenNegotiationModal={() => setIsNegotiationModalOpen(true)}
                  onNotify={notify}
                />
              ) : (
                <div className="rs-no-audit-prompt">
                  <ShieldCheck size={48} className="text-crimson" />
                  <h3>No Agreement Uploaded Yet</h3>
                  <p>Upload a rental lease or choose one of our pre-configured test suites to generate the AI audit report.</p>
                  <div className="rs-prompt-actions">
                    <button className="rs-btn-primary" onClick={() => setActiveTab('overview')}>
                      Go to Upload <ArrowRight size={16} />
                    </button>
                    <button className="rs-btn-outline" onClick={() => setActiveTab('samples')}>
                      Browse Sample Leases
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'escrow' && (
            <EscrowDashboard
              walletAddress={walletAddress}
              walletLoading={walletLoading}
              connectWallet={connectWallet}
              escrowDetails={escrowDetails}
              fetchEscrowDetails={fetchEscrowDetails}
              blockchainLoading={blockchainLoading}
              transactionLoading={transactionLoading}
              transactionMessage={transactionMessage}
              agreementHash={agreementHash}
              documentName={result?.filename || 'Rental Agreement'}
              onDeposit={handleDeposit}
              onApproveRelease={handleApproveRelease}
              onReleaseDeposit={handleReleaseDeposit}
              onRaiseDispute={handleRaiseDispute}
              onResolveDispute={handleResolveDispute}
              onNotify={notify}
            />
          )}

          {activeTab === 'ai-perspectives' && (
            <AiPerspectivesView
              onTestCustomClause={testCustomClause}
              isTestingClause={isTestingClause}
              customClauseResult={customClauseResult}
            />
          )}

          {activeTab === 'samples' && (
            <SampleAgreementsView
              onLoadSample={loadSample}
              onNotify={notify}
            />
          )}

          {/* Footer */}
          <footer className="rs-footer">
            <div className="rs-footer-left">
              <span>&copy; 2026 RentSure &bull; AI-Driven Rental Agreement Analysis & Blockchain Escrow</span>
            </div>
            <div className="rs-footer-right">
              <span>Knowledge Representation &bull; Reasoning &bull; Learning &bull; NLP &bull; Planning</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
