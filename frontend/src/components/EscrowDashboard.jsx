import React, { useState, useEffect, useRef } from 'react'
import {
  Lock, Unlock, CheckCircle2,
  AlertOctagon, RefreshCw, KeyRound,
  UserCheck, History,
  Copy, Check, FileCheck, Scale,
  RotateCcw, Info, CheckCheck,
  AlertTriangle, User, Home, ShieldAlert, Gavel
} from 'lucide-react'

export function EscrowDashboard({
  walletAddress,
  walletLoading,
  connectWallet,
  escrowDetails,
  fetchEscrowDetails,
  blockchainLoading,
  transactionLoading,
  transactionMessage,
  agreementHash,
  documentName = 'Rental Agreement',
  onDeposit,
  onApproveRelease,
  onReleaseDeposit,
  onRaiseDispute,
  onResolveDispute,
  onNotify
}) {
  // Mode toggle: Web3 Live (Ganache) vs Interactive Simulation
  const [sandboxMode, setSandboxMode] = useState(false)
  // Sandbox-only manual role selection (in live mode, role is derived from wallet)
  const [sandboxRole, setSandboxRole] = useState('tenant') // 'tenant' | 'landlord' | 'resolver'

  // Default Ganache accounts
  const ganacheAccounts = {
    landlord: escrowDetails?.landlord || '0x6a7803eb43501f613169e2ce628f72ece2246fa5',
    tenant: escrowDetails?.tenant || '0x795ccf3f450aa2703b2d7d5af872a9a54388ca77',
    resolver: escrowDetails?.resolver || '0x6394caef76103723a4a6d0c4a4aac0c49aa7eae6',
    depositAmount: escrowDetails?.depositAmount || '0.01'
  }

  // Helper to create a fresh escrow state for a given agreement hash
  // Default starts at status=0 (Created/Awaiting Deposit) so the full flow
  // must be walked through: Tenant deposits → Landlord approves → Tenant releases
  const createFreshEscrowState = (hash, docTitle, initialStatus = 0) => {
    const statusNames = { 0: 'Created', 1: 'Funded', 2: 'Disputed', 3: 'Released', 4: 'Resolved' }
    return {
      agreementHash: hash || '0x4f8e910bd6b8c92a2a096c10bc62a98f13b63bbca628b056976fa4c58cf32ae1',
      documentName: docTitle,
      status: initialStatus, // 0: Created, 1: Funded, 2: Disputed, 3: Released, 4: Resolved
      statusName: statusNames[initialStatus] || 'Created',
      depositAmount: ganacheAccounts.depositAmount,
      balance: initialStatus >= 1 && initialStatus <= 2 ? ganacheAccounts.depositAmount : '0.00',
      landlordApproved: false,
      tenantApproved: false,
      resolutionRecipient: null,
      landlord: ganacheAccounts.landlord,
      tenant: ganacheAccounts.tenant,
      resolver: ganacheAccounts.resolver
    }
  }

  // Escrow storage per agreement hash — starts at status=0 (Awaiting Deposit)
  const [escrowStore, setEscrowStore] = useState(() => ({
    [agreementHash || 'initial']: createFreshEscrowState(agreementHash, documentName, 0)
  }))

  const [simulatedLogs, setSimulatedLogs] = useState([
    {
      action: 'AgreementRegistered',
      actor: 'RentSure Protocol',
      detail: `Escrow contract initialized for "${documentName}". Awaiting Tenant deposit to activate.`,
      time: 'Just now',
      hash: agreementHash ? `${agreementHash.slice(0, 10)}...` : '0x31f8...B0B8'
    }
  ])

  const [copiedKey, setCopiedKey] = useState('')

  // Watch for contract change: when agreementHash or documentName changes, automatically reset or restore escrow
  const prevHashRef = useRef(agreementHash)
  useEffect(() => {
    if (agreementHash && agreementHash !== prevHashRef.current) {
      prevHashRef.current = agreementHash
      setEscrowStore(prev => {
        if (!prev[agreementHash]) {
          return {
            ...prev,
            [agreementHash]: createFreshEscrowState(agreementHash, documentName, 0)
          }
        }
        return prev
      })

      setSimulatedLogs(prev => [
        {
          action: 'ContractChanged',
          actor: 'System',
          detail: `Switched contract to "${documentName}". Escrow re-initialized with new SHA-256 hash.`,
          time: 'Just now',
          hash: `${agreementHash.slice(0, 10)}...`
        },
        ...prev
      ])

      onNotify?.(`Escrow automatically reset for new contract: "${documentName}"`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreementHash, documentName])

  // Get current active escrow state
  const currentKey = agreementHash || 'initial'
  const localEscrow = escrowStore[currentKey] || createFreshEscrowState(agreementHash, documentName, 1)

  // In live Web3 mode, prefer live details whenever the wallet is connected and the contract is reachable.
  // Do not fall back to the mock sandbox state just because the document hash differs from the on-chain hash.
  const activeEscrow = sandboxMode
    ? localEscrow
    : (escrowDetails || localEscrow)

  // ─── ROLE DERIVATION ───────────────────────────────────────────────────────
  // Live mode: derive role from connected wallet address
  // Sandbox mode: use the manual sandboxRole selector
  const deriveRoleFromWallet = (addr) => {
    if (!addr) return null
    const lc = addr.toLowerCase()
    if (lc === activeEscrow.tenant?.toLowerCase()) return 'tenant'
    if (lc === activeEscrow.landlord?.toLowerCase()) return 'landlord'
    if (lc === activeEscrow.resolver?.toLowerCase()) return 'resolver'
    return 'unknown'
  }

  const liveRole = !sandboxMode && walletAddress ? deriveRoleFromWallet(walletAddress) : null
  // The effective role used for all permission checks and UI rendering
  // Prefer the connected wallet role if present; otherwise keep the sandbox role
  const activeRole = !sandboxMode && liveRole ? liveRole : (sandboxMode ? sandboxRole : 'unknown')

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    onNotify?.('Address copied to clipboard!')
    setTimeout(() => setCopiedKey(''), 2000)
  }

  // Update local escrow state helper
  const updateLocalEscrow = (updater) => {
    setEscrowStore(prev => {
      const current = prev[currentKey] || createFreshEscrowState(agreementHash, documentName, 1)
      const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      return {
        ...prev,
        [currentKey]: updated
      }
    })
  }

  // Explicit Manual Reset for Current Agreement — resets to status=0 (Awaiting Deposit)
  const handleResetCurrentEscrow = (targetStatus = 0) => {
    const fresh = createFreshEscrowState(agreementHash, documentName, targetStatus)
    updateLocalEscrow(fresh)
    setSimulatedLogs([
      {
        action: 'EscrowReset',
        actor: 'User',
        detail: `Escrow for "${documentName}" reset to ${targetStatus === 0 ? 'Created (Awaiting Tenant Deposit)' : targetStatus === 1 ? 'Funded (Active Tenancy)' : 'fresh state'}.`,
        time: 'Just now',
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...'
      }
    ])
    onNotify?.(`Escrow reset for "${documentName}". Tenant can now deposit to begin.`)
  }

  // --------------------------------------------------------------------------
  // ACTION HANDLERS WITH RIGOROUS PERMISSIONS
  // --------------------------------------------------------------------------

  // Action 1: Tenant Deposits Security
  const handleDepositAction = async () => {
    if (activeEscrow.status !== 0) {
      onNotify?.('Deposit has already been funded into escrow!')
      return
    }
    if (!sandboxMode && walletAddress && walletAddress.toLowerCase() !== activeEscrow.tenant?.toLowerCase()) {
      onNotify?.('Only the Tenant wallet is authorized to deposit security!')
      return
    }
    if (!sandboxMode && onDeposit) {
      await onDeposit()
      return
    }
    updateLocalEscrow({ status: 1, statusName: 'Funded', balance: activeEscrow.depositAmount })
    setSimulatedLogs(prev => [
      {
        action: 'DepositFunded',
        actor: 'Tenant',
        detail: `Tenant deposited ${activeEscrow.depositAmount} ETH into smart contract escrow`,
        time: 'Just now',
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...'
      },
      ...prev
    ])
    onNotify?.('Security deposit successfully locked into escrow!')
  }

  // Action 2: Landlord Approves Release (Move-Out Inspection)
  const handleLandlordApproveAction = async () => {
    if (activeEscrow.status !== 1) {
      onNotify?.('Error: The deposit must be funded into escrow before the Landlord can approve release!')
      return
    }
    if (activeEscrow.landlordApproved) {
      onNotify?.('Landlord has already approved the deposit release.')
      return
    }
    if (!sandboxMode && walletAddress && walletAddress.toLowerCase() !== activeEscrow.landlord?.toLowerCase()) {
      onNotify?.(`Only the Landlord (${activeEscrow.landlord?.slice(0, 6)}...) can sign release approval!`)
      return
    }
    if (!sandboxMode && onApproveRelease) {
      await onApproveRelease()
      return
    }
    updateLocalEscrow({ landlordApproved: true })
    setSimulatedLogs(prev => [
      {
        action: 'LandlordApproved',
        actor: 'Landlord',
        detail: 'Landlord conducted move-out inspection and approved 100% deposit refund to Tenant',
        time: 'Just now',
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...'
      },
      ...prev
    ])
    onNotify?.('Landlord approval signed! The deposit can now be released to the Tenant.')
  }

  // Action 3: Release Deposit to Tenant (Tenant triggers, requires landlord approval)
  const handleReleaseAction = async () => {
    if (!activeEscrow.landlordApproved) {
      onNotify?.('BLOCKED: Landlord approval is strictly required before the deposit can be released!')
      return
    }
    if (activeEscrow.status !== 1) {
      onNotify?.('Escrow must be in Funded state to execute release.')
      return
    }
    if (!sandboxMode && onReleaseDeposit) {
      await onReleaseDeposit()
      return
    }
    updateLocalEscrow({ status: 3, statusName: 'Released', balance: '0.00' })
    setSimulatedLogs(prev => [
      {
        action: 'DepositReleased',
        actor: 'Smart Contract',
        detail: `Landlord approved. Smart contract released ${activeEscrow.depositAmount} ETH back to Tenant wallet (${activeEscrow.tenant?.slice(0, 8)}...)`,
        time: 'Just now',
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...'
      },
      ...prev
    ])
    onNotify?.(`Deposit of ${activeEscrow.depositAmount} ETH successfully released to Tenant!`)
  }

  // Action 4: Raise Tenancy Dispute (Tenant OR Landlord)
  const handleDisputeAction = async () => {
    if (activeEscrow.status !== 1) {
      onNotify?.('Disputes can only be raised during active funded tenancy.')
      return
    }
    if (!sandboxMode && onRaiseDispute) {
      await onRaiseDispute()
      return
    }
    updateLocalEscrow({ status: 2, statusName: 'Disputed' })
    setSimulatedLogs(prev => [
      {
        action: 'TenancyDisputeRaised',
        actor: activeRole.toUpperCase(),
        detail: 'Dispute registered on-chain. Escrow paused. Escalated to Dispute Resolver.',
        time: 'Just now',
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...'
      },
      ...prev
    ])
    onNotify?.('Dispute raised! Smart contract paused pending arbitrator decision.')
  }

  // Action 5: Dispute Resolver Issues Verdict
  const handleResolveAction = async (toTenant) => {
    if (activeEscrow.status !== 2) {
      onNotify?.('Arbitration can only be resolved when an active dispute exists.')
      return
    }
    if (!sandboxMode && walletAddress && walletAddress.toLowerCase() !== activeEscrow.resolver?.toLowerCase()) {
      onNotify?.('Only the Dispute Resolver wallet can issue a verdict!')
      return
    }
    if (!sandboxMode && onResolveDispute) {
      await onResolveDispute(toTenant)
      return
    }
    updateLocalEscrow({
      status: 4,
      statusName: 'Resolved',
      balance: '0.00',
      resolutionRecipient: toTenant ? 'tenant' : 'landlord'
    })
    setSimulatedLogs(prev => [
      {
        action: 'DisputeResolved',
        actor: 'Dispute Resolver',
        detail: `Binding verdict issued: ${toTenant ? '100% refunded to Tenant' : 'Damages awarded to Landlord'}. Funds automatically paid out.`,
        time: 'Just now',
        hash: '0x' + Math.random().toString(16).slice(2, 10) + '...'
      },
      ...prev
    ])
    onNotify?.(`Dispute resolved in favor of ${toTenant ? 'Tenant' : 'Landlord'}! Payout complete.`)
  }

  // Lifecycle step calculation
  const getStepIndex = (status) => {
    if (status === 0) return 1
    if (status === 1) return 2
    if (status === 2) return 3
    if (status === 3 || status === 4) return 4
    return 1
  }

  const currentStep = getStepIndex(activeEscrow.status)
  const isTerminalState = activeEscrow.status === 3 || activeEscrow.status === 4

  // ─── ROLE-SPECIFIC CONFIGS ─────────────────────────────────────────────────
  const roleConfig = {
    tenant: {
      label: 'Tenant',
      icon: <User size={16} />,
      color: 'role-tenant',
      desc: 'You can: deposit security • request deposit release (after landlord approval) • raise a dispute',
      address: activeEscrow.tenant
    },
    landlord: {
      label: 'Landlord',
      icon: <Home size={16} />,
      color: 'role-landlord',
      desc: 'You can: approve the deposit release (after move-out inspection) • raise a dispute',
      address: activeEscrow.landlord
    },
    resolver: {
      label: 'Dispute Resolver',
      icon: <Gavel size={16} />,
      color: 'role-resolver',
      desc: 'You can: issue a binding verdict on active disputes — ruling in favor of Tenant or Landlord',
      address: activeEscrow.resolver
    },
    unknown: {
      label: 'Unregistered Wallet',
      icon: <ShieldAlert size={16} />,
      color: 'role-unknown',
      desc: 'Your connected wallet is not a participant in this escrow. No actions are available.',
      address: walletAddress
    }
  }

  const currentRoleConfig = roleConfig[activeRole] || roleConfig.unknown

  return (
    <div className="rs-escrow-container">
      {/* Top Contract Header Bar */}
      <div className="rs-escrow-topbar">
        <div>
          <div className="rs-eyebrow">IMMUTABLE SMART ESCROW &bull; ACTIVE CONTRACT</div>
          <h2 className="rs-escrow-heading">{documentName}</h2>
          <div className="rs-escrow-meta-strip">
            <span className="rs-contract-hash-pill">
              SHA-256: <code>{activeEscrow.agreementHash?.slice(0, 12)}...{activeEscrow.agreementHash?.slice(-8)}</code>
            </span>
            <span className="rs-contract-status-pill">
              Status: <strong>{activeEscrow.statusName}</strong>
            </span>
          </div>
        </div>

        <div className="rs-escrow-top-actions">
          <button
            className="rs-btn-outline rs-btn-sm"
            onClick={() => handleResetCurrentEscrow(0)}
            title="Reset this contract to fresh state — Tenant must deposit first"
          >
            <RotateCcw size={13} /> Reset Escrow Cycle
          </button>

          <div className="rs-escrow-mode-pill">
            <button
              className={`rs-mode-switch ${!sandboxMode ? 'active' : ''}`}
              onClick={() => setSandboxMode(false)}
            >
              Live Web3 (Ganache)
            </button>
            <button
              className={`rs-mode-switch ${sandboxMode ? 'active' : ''}`}
              onClick={() => setSandboxMode(true)}
            >
              Interactive Sandbox
            </button>
          </div>
        </div>
      </div>

      {/* ── ACTIVE ACTOR IDENTITY BAR ─────────────────────────────────────── */}
      <div className={`rs-actor-identity-bar ${currentRoleConfig.color}`}>
        <div className="rs-actor-id-left">
          <div className="rs-actor-avatar">
            {currentRoleConfig.icon}
          </div>
          <div className="rs-actor-info">
            <div className="rs-actor-eyebrow">
              {sandboxMode ? 'SANDBOX MODE — ACTING AS' : 'CONNECTED WALLET IDENTIFIED AS'}
            </div>
            <div className="rs-actor-name">{currentRoleConfig.label}</div>
            <div className="rs-actor-desc">{currentRoleConfig.desc}</div>
          </div>
        </div>

        <div className="rs-actor-id-right">
          {/* Sandbox: manual role pill switcher */}
          {sandboxMode && (
            <div className="rs-role-switcher-inline">
              <span className="rs-role-switcher-label">Switch role to test:</span>
              <div className="rs-role-pills-group">
                <button
                  className={`rs-role-pill pill-tenant ${sandboxRole === 'tenant' ? 'active' : ''}`}
                  onClick={() => setSandboxRole('tenant')}
                >
                  <User size={12} /> Tenant
                </button>
                <button
                  className={`rs-role-pill pill-landlord ${sandboxRole === 'landlord' ? 'active' : ''}`}
                  onClick={() => setSandboxRole('landlord')}
                >
                  <Home size={12} /> Landlord
                </button>
                <button
                  className={`rs-role-pill pill-resolver ${sandboxRole === 'resolver' ? 'active' : ''}`}
                  onClick={() => setSandboxRole('resolver')}
                >
                  <Gavel size={12} /> Resolver
                </button>
              </div>
            </div>
          )}

          {/* Live mode: wallet connect */}
          {!sandboxMode && (
            <div className="rs-web3-inline-actions">
              {!walletAddress ? (
                <button
                  className="rs-btn-primary rs-btn-sm"
                  onClick={connectWallet}
                  disabled={walletLoading}
                >
                  {walletLoading ? 'Connecting...' : 'Connect Rabby / MetaMask'}
                </button>
              ) : (
                <span className="rs-wallet-connected-pill">
                  ⬡ {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              )}
              <button
                className="rs-btn-outline rs-btn-sm"
                onClick={fetchEscrowDetails}
                disabled={blockchainLoading}
              >
                <RefreshCw size={13} className={blockchainLoading ? 'rs-spin-loader' : ''} />
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live mode: unknown wallet warning */}
      {!sandboxMode && walletAddress && liveRole === 'unknown' && (
        <div className="rs-unknown-wallet-banner">
          <ShieldAlert size={18} />
          <div>
            <strong>Wallet Not Registered in This Escrow</strong>
            <p>Your connected address <code>{walletAddress}</code> is not the Tenant, Landlord, or Dispute Resolver for this contract. No actions are available.</p>
          </div>
        </div>
      )}

      {/* Lifecycle Progress Stepper */}
      <div className="rs-lifecycle-card">
        <div className="rs-lifecycle-header">
          <div className="rs-eyebrow">CONTRACT LIFECYCLE &bull; STATE MACHINE</div>
          <h4>Smart Contract Progression</h4>
        </div>

        <div className="rs-stepper">
          <div className={`rs-step-node ${currentStep >= 1 ? 'completed' : ''}`}>
            <div className="rs-step-circle">1</div>
            <div className="rs-step-label">Agreement Bound</div>
            <div className="rs-step-desc">SHA-256 Hashed</div>
          </div>
          <div className={`rs-step-line ${currentStep >= 2 ? 'active' : ''}`}></div>

          <div className={`rs-step-node ${currentStep >= 2 ? (activeEscrow.status === 1 ? 'active' : 'completed') : ''}`}>
            <div className="rs-step-circle">2</div>
            <div className="rs-step-label">Deposit Funded</div>
            <div className="rs-step-desc">{activeEscrow.depositAmount} ETH in Custody</div>
          </div>
          <div className={`rs-step-line ${currentStep >= 3 ? 'active' : ''}`}></div>

          <div className={`rs-step-node ${activeEscrow.status === 2 ? 'disputed' : (currentStep >= 3 ? 'active' : '')}`}>
            <div className="rs-step-circle">
              {activeEscrow.status === 2 ? '!' : '3'}
            </div>
            <div className="rs-step-label">
              {activeEscrow.status === 2 ? 'Disputed' : 'Landlord Approval'}
            </div>
            <div className="rs-step-desc">
              {activeEscrow.status === 2 ? 'Arbitration Underway' : activeEscrow.landlordApproved ? 'Landlord Approved ✓' : 'Awaiting Landlord'}
            </div>
          </div>
          <div className={`rs-step-line ${currentStep >= 4 ? 'active' : ''}`}></div>

          <div className={`rs-step-node ${currentStep >= 4 ? 'completed' : ''}`}>
            <div className="rs-step-circle">4</div>
            <div className="rs-step-label">Release / Payout</div>
            <div className="rs-step-desc">
              {activeEscrow.status === 3
                ? 'Returned to Tenant'
                : activeEscrow.status === 4
                ? 'Arbitration Settled'
                : 'Finalized'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="rs-escrow-stats-row">
        <div className="rs-escrow-stat-card">
          <span className="rs-stat-title">Current Status</span>
          <div className="rs-stat-highlight">
            <span className={`rs-status-pill status-${activeEscrow.statusName?.toLowerCase()}`}>
              {activeEscrow.statusName}
            </span>
          </div>
          <span className="rs-stat-footer">State code: #{activeEscrow.status}</span>
        </div>

        <div className="rs-escrow-stat-card">
          <span className="rs-stat-title">Security Deposit</span>
          <div className="rs-stat-highlight">
            <strong>{activeEscrow.depositAmount}</strong>
            <small>ETH</small>
          </div>
          <span className="rs-stat-footer">Deposit amount for this contract</span>
        </div>

        <div className="rs-escrow-stat-card">
          <span className="rs-stat-title">Escrow Balance</span>
          <div className="rs-stat-highlight">
            <strong>{activeEscrow.balance}</strong>
            <small>ETH</small>
          </div>
          <span className="rs-stat-footer">
            {Number(activeEscrow.balance) === 0 ? '0.00 ETH (Disbursed to recipient)' : 'Held in smart contract custody'}
          </span>
        </div>

        <div className="rs-escrow-stat-card">
          <span className="rs-stat-title">Landlord Sign-Off</span>
          <div className="rs-approval-matrix">
            <div className="rs-approval-row">
              <span>Move-Out Approval:</span>
              <strong className={activeEscrow.landlordApproved ? 'text-emerald' : 'text-amber'}>
                {activeEscrow.landlordApproved ? 'Approved ✓' : activeEscrow.status === 4 ? 'Bypassed (Disputed)' : 'Pending'}
              </strong>
            </div>
            <span className="rs-stat-footer">
              {activeEscrow.landlordApproved
                ? 'Landlord confirmed full deposit release'
                : 'Deposit cannot be released without Landlord approval'}
            </span>
          </div>
        </div>
      </div>

      {/* Smart Contract Participants Card */}
      <div className="rs-participants-card">
        <div className="rs-card-header">
          <KeyRound size={17} className="text-crimson" />
          <h4>Authorized Smart Contract Participants (Ganache Accounts)</h4>
        </div>
        <div className="rs-participants-grid">
          <div className={`rs-participant-box ${activeRole === 'tenant' ? 'active-participant' : ''}`}>
            <div className="rs-participant-role">
              <User size={13} /> TENANT (Deposit Owner)
              {activeRole === 'tenant' && <span className="rs-you-badge">YOU</span>}
            </div>
            <div className="rs-participant-addr">
              <code>{activeEscrow.tenant}</code>
              <button onClick={() => handleCopy(activeEscrow.tenant, 'tenant')}>
                {copiedKey === 'tenant' ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          <div className={`rs-participant-box ${activeRole === 'landlord' ? 'active-participant' : ''}`}>
            <div className="rs-participant-role">
              <Home size={13} /> LANDLORD (Must Approve Release)
              {activeRole === 'landlord' && <span className="rs-you-badge">YOU</span>}
            </div>
            <div className="rs-participant-addr">
              <code>{activeEscrow.landlord}</code>
              <button onClick={() => handleCopy(activeEscrow.landlord, 'landlord')}>
                {copiedKey === 'landlord' ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          <div className={`rs-participant-box ${activeRole === 'resolver' ? 'active-participant' : ''}`}>
            <div className="rs-participant-role">
              <Scale size={13} /> DISPUTE RESOLVER (Arbitrator)
              {activeRole === 'resolver' && <span className="rs-you-badge">YOU</span>}
            </div>
            <div className="rs-participant-addr">
              <code>{activeEscrow.resolver}</code>
              <button onClick={() => handleCopy(activeEscrow.resolver, 'resolver')}>
                {copiedKey === 'resolver' ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROLE-SPECIFIC ACTION CENTER ─────────────────────────────────────── */}
      <div className="rs-action-center-card">
        <div className="rs-action-center-header">
          <div>
            <div className="rs-eyebrow">ESCROW OPERATIONS &bull; ROLE-ENFORCED CONTROLS</div>
            <h3 className="rs-action-title">
              {activeRole === 'tenant' && 'Tenant Actions'}
              {activeRole === 'landlord' && 'Landlord Actions'}
              {activeRole === 'resolver' && 'Arbitrator Actions'}
              {activeRole === 'unknown' && 'No Actions Available'}
            </h3>
            <p className="rs-action-desc">{currentRoleConfig.desc}</p>
          </div>
          <button
            className="rs-btn-outline rs-btn-sm"
            onClick={() => handleResetCurrentEscrow(0)}
            title="Reset escrow to test again from the beginning"
          >
            <RotateCcw size={13} /> Reset Escrow
          </button>
        </div>

        {/* Terminal state banners */}
        {activeEscrow.status === 4 && (
          <div className="rs-terminal-settlement-banner banner-resolved">
            <div className="rs-settlement-icon-col">
              <Scale size={28} className="text-crimson" />
            </div>
            <div className="rs-settlement-body">
              <div className="rs-settlement-badge-pill">ESCROW STATE: RESOLVED VIA ARBITRATION</div>
              <h4>Dispute Formally Concluded &amp; Funds Disbursed</h4>
              <p>
                The independent Dispute Resolver issued a binding verdict. The smart contract automatically executed the payout, transferring <strong>{activeEscrow.depositAmount} ETH</strong> to the <strong>{activeEscrow.resolutionRecipient === 'tenant' ? 'Tenant' : 'Landlord'}</strong>.
              </p>
              <div className="rs-settlement-info-box">
                <Info size={16} />
                <div>
                  <strong>Why are release buttons disabled?</strong>
                  <p>Arbitration verdicts are self-executing. All funds have already been paid out on-chain (contract balance: 0.00 ETH).</p>
                </div>
              </div>
              <div className="rs-settlement-footer-action">
                <span>Test the full flow again from the beginning?</span>
                <button className="rs-btn-primary rs-btn-sm" onClick={() => handleResetCurrentEscrow(0)}>
                  <RotateCcw size={13} /> Reset — Start Fresh
                </button>
              </div>
            </div>
          </div>
        )}

        {activeEscrow.status === 3 && (
          <div className="rs-terminal-settlement-banner banner-released">
            <div className="rs-settlement-icon-col">
              <CheckCheck size={28} className="text-emerald" />
            </div>
            <div className="rs-settlement-body">
              <div className="rs-settlement-badge-pill pill-emerald">ESCROW STATE: RELEASED TO TENANT</div>
              <h4>Move-Out Complete: Deposit Returned to Tenant</h4>
              <p>The Landlord approved the release. The smart contract transferred <strong>{activeEscrow.depositAmount} ETH</strong> back to the Tenant's wallet.</p>
              <div className="rs-settlement-footer-action">
                <button className="rs-btn-outline rs-btn-sm" onClick={() => handleResetCurrentEscrow(0)}>
                  <RotateCcw size={13} /> Reset &amp; Test Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ROLE-SEGREGATED ACTION GRIDS ─────────────────────────────────── */}

        {/* TENANT ACTIONS */}
        {activeRole === 'tenant' && !isTerminalState && (
          <div className="rs-action-buttons-grid">

            {/* Step 1: Deposit Security — only active when status=0 */}
            <div className={`rs-action-tile ${activeEscrow.status >= 1 ? 'tile-completed' : 'tile-next-action'}`}>
              <div className="rs-action-tile-top">
                <div className="rs-tile-title-group">
                  <span className="rs-role-owner-tag tag-tenant">TENANT — STEP 1</span>
                  <h4>Deposit Security</h4>
                </div>
                <span className={`rs-tile-badge ${activeEscrow.status >= 1 ? 'badge-done' : 'badge-action-required'}`}>
                  {activeEscrow.status >= 1 ? 'Funded ✓' : '← Do This First'}
                </span>
              </div>
              <p>
                Transfer the required rental security deposit into smart contract escrow custody.
                This activates the tenancy and allows the Landlord to approve release at move-out.
              </p>
              <button
                className="rs-btn-primary"
                disabled={transactionLoading || activeEscrow.status !== 0}
                onClick={handleDepositAction}
              >
                {activeEscrow.status >= 1 ? (
                  <><Check size={15} /> Deposit Locked — {activeEscrow.depositAmount} ETH in Escrow</>
                ) : (
                  <><Lock size={15} /> Lock Deposit ({activeEscrow.depositAmount} ETH)</>
                )}
              </button>
              <span className="rs-action-hint">
                {activeEscrow.status >= 1
                  ? '✓ Deposit is safely locked. Now ask the Landlord to approve the release.'
                  : '← Start here: click to lock your security deposit into escrow'}
              </span>
            </div>

            {/* Step 2: Release Deposit — requires status=1 AND landlordApproved */}
            <div className={`rs-action-tile ${
              activeEscrow.status === 3 ? 'tile-completed'
              : activeEscrow.status === 0 ? 'tile-disabled'
              : !activeEscrow.landlordApproved ? 'tile-locked'
              : ''
            }`}>
              <div className="rs-action-tile-top">
                <div className="rs-tile-title-group">
                  <span className="rs-role-owner-tag tag-tenant">TENANT — STEP 3</span>
                  <h4>Execute Deposit Release</h4>
                </div>
                <span className={`rs-tile-badge ${
                  activeEscrow.status === 3 ? 'badge-done'
                  : activeEscrow.status === 0 ? 'badge-pending'
                  : activeEscrow.landlordApproved ? 'badge-ready'
                  : 'badge-locked'
                }`}>
                  {activeEscrow.status === 3 ? 'Released ✓'
                   : activeEscrow.status === 0 ? 'Deposit First'
                   : activeEscrow.landlordApproved ? 'Ready to Execute!'
                   : 'Waiting for Landlord'}
                </span>
              </div>
              <p>
                Once the Landlord has completed their move-out inspection and approved the release (Step 2), you can execute the on-chain payout.
                <strong> Landlord approval is mandatory — you cannot skip this.</strong>
              </p>
              {activeEscrow.status === 0 && (
                <div className="rs-prereq-notice">
                  <AlertTriangle size={14} />
                  <span>Complete Step 1 (deposit) first before this becomes available.</span>
                </div>
              )}
              {activeEscrow.status === 1 && !activeEscrow.landlordApproved && (
                <div className="rs-prereq-notice">
                  <AlertTriangle size={14} />
                  <span>Switch to the <strong>Landlord</strong> account in Rabby and complete Step 2 to unlock this.</span>
                </div>
              )}
              <button
                className="rs-btn-emerald"
                disabled={transactionLoading || activeEscrow.status !== 1 || !activeEscrow.landlordApproved}
                onClick={handleReleaseAction}
              >
                {activeEscrow.status === 3 ? (
                  <><CheckCheck size={15} /> Deposit Released ✓</>
                ) : activeEscrow.landlordApproved ? (
                  <><Unlock size={15} /> Release Deposit ({activeEscrow.depositAmount} ETH)</>
                ) : (
                  <><Lock size={15} /> Locked — Requires Landlord Approval</>
                )}
              </button>
              <span className={`rs-action-hint ${!activeEscrow.landlordApproved && activeEscrow.status === 1 ? 'hint-warning' : ''}`}>
                {activeEscrow.status === 0
                  ? 'Available after deposit is funded.'
                  : !activeEscrow.landlordApproved && activeEscrow.status === 1
                  ? '⚠️ Landlord must approve first. Switch to Landlord account in Rabby → complete Step 2.'
                  : activeEscrow.landlordApproved && activeEscrow.status === 1
                  ? '✓ Landlord approved! Click to return funds to your wallet.'
                  : activeEscrow.status === 3
                  ? 'Funds were successfully transferred to your wallet.'
                  : 'Awaiting prior steps.'}
              </span>
            </div>

            {/* Step 3 (optional): Raise Dispute */}
            <div className={`rs-action-tile ${activeEscrow.status === 2 ? 'tile-active-dispute' : ''}`}>
              <div className="rs-action-tile-top">
                <div className="rs-tile-title-group">
                  <span className="rs-role-owner-tag tag-dispute">TENANT OR LANDLORD</span>
                  <h4>Raise Dispute (Optional)</h4>
                </div>
                <span className={`rs-tile-badge ${activeEscrow.status === 2 ? 'badge-disputed' : 'badge-pending'}`}>
                  {activeEscrow.status === 2 ? 'Dispute Active' : 'Available if Needed'}
                </span>
              </div>
              <p>If the landlord makes unfair deductions or refuses to release, pause escrow for arbitration by the Dispute Resolver.</p>
              <button
                className="rs-btn-crimson-outline"
                disabled={transactionLoading || activeEscrow.status !== 1}
                onClick={handleDisputeAction}
              >
                <AlertOctagon size={15} />
                {activeEscrow.status === 2 ? 'Dispute Under Review' : 'Raise Dispute'}
              </button>
              <span className="rs-action-hint">
                {activeEscrow.status === 2
                  ? 'Escrow paused. The Dispute Resolver is reviewing the case.'
                  : activeEscrow.status === 0
                  ? 'Available only after deposit is funded.'
                  : 'Only use if you disagree with the landlord\'s move-out assessment.'}
              </span>
            </div>
          </div>
        )}

        {/* LANDLORD ACTIONS */}
        {activeRole === 'landlord' && !isTerminalState && (
          <div className="rs-action-buttons-grid">

            {/* Approve Release */}
            <div className={`rs-action-tile ${activeEscrow.landlordApproved ? 'tile-completed' : activeEscrow.status === 0 ? 'tile-disabled' : ''}`}>
              <div className="rs-action-tile-top">
                <div className="rs-tile-title-group">
                  <span className="rs-role-owner-tag tag-landlord">LANDLORD ACTION</span>
                  <h4>1. Approve Deposit Release</h4>
                </div>
                <span className={`rs-tile-badge ${activeEscrow.landlordApproved ? 'badge-done' : activeEscrow.status === 0 ? 'badge-pending' : 'badge-amber'}`}>
                  {activeEscrow.landlordApproved
                    ? 'Approved ✓'
                    : activeEscrow.status === 0
                    ? 'Waiting for Deposit'
                    : activeEscrow.status === 2
                    ? 'Disputed — Frozen'
                    : 'Action Required'}
                </span>
              </div>
              <p>
                After conducting the move-out inspection, sign off to authorize the full security deposit refund to the Tenant.
              </p>
              {activeEscrow.status === 0 && (
                <div className="rs-prereq-notice">
                  <AlertTriangle size={14} />
                  <span>The Tenant must deposit funds first before you can approve release.</span>
                </div>
              )}
              <button
                className={`rs-btn-outline ${activeEscrow.landlordApproved ? 'btn-approved' : ''}`}
                disabled={
                  transactionLoading ||
                  activeEscrow.status !== 1 ||
                  activeEscrow.landlordApproved
                }
                onClick={handleLandlordApproveAction}
              >
                {activeEscrow.landlordApproved ? (
                  <><Check size={15} className="text-emerald" /> Approval Signed ✓</>
                ) : activeEscrow.status === 0 ? (
                  <><Lock size={15} /> Deposit Not Yet Funded</>
                ) : activeEscrow.status === 2 ? (
                  <><AlertOctagon size={15} /> Frozen — Active Dispute</>
                ) : (
                  <><UserCheck size={15} /> Approve Deposit Release</>
                )}
              </button>
              <span className="rs-action-hint">
                {activeEscrow.status === 0
                  ? '⚠️ You can only approve after the tenant has deposited.'
                  : activeEscrow.landlordApproved
                  ? '✓ Your approval has been recorded. Tenant can now execute the release.'
                  : activeEscrow.status === 2
                  ? 'Approvals are frozen while a dispute is active.'
                  : 'Sign here after move-out inspection to permit the deposit refund.'}
              </span>
            </div>

            {/* Raise Dispute */}
            <div className={`rs-action-tile ${activeEscrow.status === 2 ? 'tile-active-dispute' : ''}`}>
              <div className="rs-action-tile-top">
                <div className="rs-tile-title-group">
                  <span className="rs-role-owner-tag tag-dispute">TENANT OR LANDLORD</span>
                  <h4>2. Raise Dispute</h4>
                </div>
                <span className={`rs-tile-badge ${activeEscrow.status === 2 ? 'badge-disputed' : 'badge-pending'}`}>
                  {activeEscrow.status === 2 ? 'Dispute Active' : 'Available if Needed'}
                </span>
              </div>
              <p>If the tenant has caused property damage and refuses to settle, escalate to the Dispute Resolver.</p>
              <button
                className="rs-btn-crimson-outline"
                disabled={transactionLoading || activeEscrow.status !== 1}
                onClick={handleDisputeAction}
              >
                <AlertOctagon size={15} />
                {activeEscrow.status === 2 ? 'Dispute Under Review' : 'Raise Dispute'}
              </button>
              <span className="rs-action-hint">
                {activeEscrow.status === 2
                  ? 'Escrow paused. The Dispute Resolver arbitrator is reviewing the case.'
                  : 'Only available during active funded tenancy.'}
              </span>
            </div>
          </div>
        )}

        {/* DISPUTE RESOLVER ACTIONS */}
        {activeRole === 'resolver' && !isTerminalState && (
          <div className="rs-action-buttons-grid">
            <div className={`rs-action-tile resolver-tile ${activeEscrow.status !== 2 ? 'tile-disabled' : 'tile-active-dispute'}`}>
              <div className="rs-action-tile-top">
                <div className="rs-tile-title-group">
                  <span className="rs-role-owner-tag tag-resolver">ARBITRATOR ONLY</span>
                  <h4>Issue Binding Verdict</h4>
                </div>
                <span className={`rs-tile-badge ${activeEscrow.status === 2 ? 'badge-amber' : 'badge-pending'}`}>
                  {activeEscrow.status === 2 ? 'Awaiting Your Verdict' : 'No Active Dispute'}
                </span>
              </div>
              <p>
                Review all submitted evidence and issue a binding on-chain verdict. The smart contract will immediately execute the payout to the winning party.
              </p>

              {activeEscrow.status !== 2 && (
                <div className="rs-prereq-notice">
                  <AlertTriangle size={14} />
                  <span>No active dispute. Wait for the Tenant or Landlord to raise a dispute before you can arbitrate.</span>
                </div>
              )}

              <div className="rs-btn-dual-row">
                <button
                  className="rs-btn-emerald"
                  disabled={transactionLoading || activeEscrow.status !== 2}
                  onClick={() => handleResolveAction(true)}
                >
                  <CheckCheck size={15} /> Verdict: Refund Tenant (100%)
                </button>
                <button
                  className="rs-btn-crimson-outline"
                  disabled={transactionLoading || activeEscrow.status !== 2}
                  onClick={() => handleResolveAction(false)}
                >
                  <Gavel size={15} /> Verdict: Award Landlord
                </button>
              </div>
              <span className="rs-action-hint">
                {activeEscrow.status === 2
                  ? 'Your verdict is final and irreversible. The smart contract executes payout instantly.'
                  : 'Only enabled when an active dispute is raised.'}
              </span>
            </div>
          </div>
        )}

        {/* UNKNOWN WALLET PLACEHOLDER */}
        {activeRole === 'unknown' && !sandboxMode && (
          <div className="rs-unknown-action-placeholder">
            <ShieldAlert size={40} />
            <h4>Wallet Not a Contract Participant</h4>
            <p>Your connected wallet is not registered as the Tenant, Landlord, or Dispute Resolver for this escrow. No actions are available.</p>
            <p>Switch your Rabby account to one of the participant addresses shown above.</p>
          </div>
        )}

        {/* Terminal state: no actions */}
        {isTerminalState && activeRole !== 'unknown' && (
          <div className="rs-no-actions-notice">
            <FileCheck size={22} className="text-emerald" />
            <span>This escrow contract has been fully settled. Use the Reset button above to test again.</span>
          </div>
        )}

        {transactionMessage && (
          <div className="rs-transaction-feedback">
            <CheckCircle2 size={16} />
            <span>{transactionMessage}</span>
          </div>
        )}
      </div>

      {/* Transaction & Audit Ledger */}
      <div className="rs-ledger-card">
        <div className="rs-ledger-header">
          <History size={17} className="text-crimson" />
          <h4>Escrow Transaction &amp; Audit Ledger</h4>
        </div>
        <div className="rs-ledger-list">
          {simulatedLogs.map((log, index) => (
            <div key={index} className="rs-ledger-item">
              <div className="rs-ledger-left">
                <span className="rs-ledger-dot"></span>
                <div>
                  <strong>{log.action}</strong>
                  <p>{log.detail}</p>
                </div>
              </div>
              <div className="rs-ledger-right">
                <span className="rs-ledger-actor">{log.actor}</span>
                <span className="rs-ledger-time">{log.time}</span>
                <code>{log.hash}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
