// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RentSureEscrow {
    enum Status {
        Created,
        Funded,
        Disputed,
        Released,
        Resolved
    }

    address public immutable landlord;
    address public immutable tenant;
    address public immutable disputeResolver;
    bytes32 public immutable agreementHash;
    uint256 public immutable depositAmount;

    Status public status;
    bool public landlordApproved;
    bool public tenantApproved;

    event AgreementRegistered(address indexed landlord, address indexed tenant, bytes32 agreementHash, uint256 depositAmount);
    event DepositLocked(address indexed tenant, uint256 amount);
    event ReleaseApproved(address indexed party);
    event DepositReleased(address indexed recipient, uint256 amount);
    event DisputeRaised(address indexed party);
    event DisputeResolved(address indexed recipient, uint256 amount);

    constructor(
        address _tenant,
        address _disputeResolver,
        bytes32 _agreementHash,
        uint256 _depositAmount
    ) {
        landlord = msg.sender;
        tenant = _tenant;
        disputeResolver = _disputeResolver;
        agreementHash = _agreementHash;
        depositAmount = _depositAmount;
        status = Status.Created;

        emit AgreementRegistered(landlord, tenant, agreementHash, depositAmount);
    }

    function depositSecurity() external payable {
        require(msg.sender == tenant, "Only tenant can deposit");
        require(status == Status.Created, "Escrow already funded");
        require(msg.value == depositAmount, "Incorrect deposit amount");

        status = Status.Funded;
        emit DepositLocked(tenant, msg.value);
    }

    function approveRelease() external {
        require(msg.sender == landlord, "Only landlord can approve");
        require(status == Status.Funded, "Deposit must be funded first");
        require(!landlordApproved, "Already approved");

        landlordApproved = true;
        emit ReleaseApproved(msg.sender);
    }

    function releaseDeposit() external {
        require(msg.sender == tenant, "Only tenant can trigger release");
        require(status == Status.Funded, "Escrow must be funded");
        require(landlordApproved, "Landlord approval required");

        uint256 amount = address(this).balance;
        status = Status.Released;
        landlordApproved = false;
        tenantApproved = true;

        (bool sent, ) = payable(tenant).call{value: amount}("");
        require(sent, "Release transfer failed");

        emit DepositReleased(tenant, amount);
    }

    function raiseDispute() external {
        require(msg.sender == tenant || msg.sender == landlord, "Only tenant or landlord can raise dispute");
        require(status == Status.Funded, "Only funded escrow can be disputed");

        status = Status.Disputed;
        emit DisputeRaised(msg.sender);
    }

    function resolveDispute(bool refundToTenant) external {
        require(msg.sender == disputeResolver, "Only dispute resolver can resolve");
        require(status == Status.Disputed, "No active dispute");

        uint256 amount = address(this).balance;
        status = Status.Resolved;

        address recipient = refundToTenant ? tenant : landlord;
        (bool sent, ) = payable(recipient).call{value: amount}("");
        require(sent, "Resolution transfer failed");

        emit DisputeResolved(recipient, amount);
    }

    function getEscrowBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
