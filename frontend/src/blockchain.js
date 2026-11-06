import { ethers } from 'ethers'
import contractData from './contracts/RentSureEscrow.json'

const CONTRACT_ADDRESS = contractData.address
const CONTRACT_ABI = contractData.abi

const GANACHE_CHAIN_ID = 1337

// Connect to MetaMask and verify Ganache

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('No EVM wallet detected. Please install Rabby Wallet.')
  }

  // Request wallet connection
  await window.ethereum.request({
    method: 'eth_requestAccounts',
  })

  const provider = new ethers.BrowserProvider(window.ethereum)

  // Verify Ganache network
  const network = await provider.getNetwork()

  if (Number(network.chainId) !== GANACHE_CHAIN_ID) {
    throw new Error('Please switch Rabby to Ganache Local (Chain ID 1337).')
  }

  const signer = await provider.getSigner()
  const address = await signer.getAddress()

  return { provider, signer, address }
}


// Get the deployed smart contract
export async function getContract() {
  const { provider, signer, address } = await connectWallet()

  console.log('Connected wallet:', address)
  console.log('Contract address:', CONTRACT_ADDRESS)

  // Check whether a smart contract exists at this address
  const code = await provider.getCode(CONTRACT_ADDRESS)

  if (code === '0x') {
    throw new Error(
      'No smart contract found at this address on Ganache. Check your deployment address or network.'
    )
  }

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  )

  return { provider, signer, contract, address }
}

// Read information from the smart contract
export async function getEscrowDetails() {
  const { contract, address } = await getContract()

  const [
    landlord,
    tenant,
    resolver,
    agreementHash,
    depositAmount,
    balance,
    status,
    landlordApproved,
    tenantApproved
  ] = await Promise.all([
    contract.landlord(),
    contract.tenant(),
    contract.disputeResolver(),
    contract.agreementHash(),
    contract.depositAmount(),
    contract.getEscrowBalance(),
    contract.status(),
    contract.landlordApproved(),
    contract.tenantApproved()
  ])

  const statusNames = [
    'Created',
    'Funded',
    'Disputed',
    'Released',
    'Resolved'
  ]

  return {
    connectedAddress: address,
    landlord,
    tenant,
    resolver,
    agreementHash,
    depositAmount: ethers.formatEther(depositAmount),
    balance: ethers.formatEther(balance),
    status: Number(status),
    statusName: statusNames[Number(status)] || 'Unknown',
    landlordApproved,
    tenantApproved
  }
}

// Tenant locks the security deposit
export async function depositSecurity() {
  const { contract } = await getContract()

  const details = await getEscrowDetails()
  if (details.status !== 0) {
    throw new Error('This escrow is already funded. Reset the contract or redeploy a fresh Ganache escrow before depositing again.')
  }

  const amount = await contract.depositAmount()

  const transaction = await contract.depositSecurity({
    value: amount
  })

  return await transaction.wait()
}

// Landlord or tenant approves release
export async function approveRelease() {
  const { contract } = await getContract()

  const details = await getEscrowDetails()
  if (details.status !== 1) {
    throw new Error('Deposit must be funded into escrow before the Landlord can approve release.')
  }
  if (details.landlordApproved) {
    throw new Error('Landlord approval has already been recorded on-chain.')
  }

  const transaction = await contract.approveRelease()

  return await transaction.wait()
}

// Release deposit after both parties approve
export async function releaseDeposit() {
  const { contract } = await getContract()

  const details = await getEscrowDetails()
  if (details.status !== 1) {
    throw new Error('Escrow must be funded before the deposit can be released.')
  }
  if (!details.landlordApproved) {
    throw new Error('Landlord approval is required before the tenant can release the deposit.')
  }

  const transaction = await contract.releaseDeposit()

  return await transaction.wait()
}

// Raise a dispute
export async function raiseDispute() {
  const { contract } = await getContract()

  const transaction = await contract.raiseDispute()

  return await transaction.wait()
}

// Dispute resolver resolves the dispute
export async function resolveDispute(refundToTenant) {
  const { contract } = await getContract()

  const transaction = await contract.resolveDispute(refundToTenant)

  return await transaction.wait()
}