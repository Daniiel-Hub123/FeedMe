// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FeedbackEscrow
 * @notice Immutable escrow contract for the Feedback Evaluator protocol.
 *         - Companies deposit USDC to create campaigns.
 *         - The authorized backend submits results and triggers payments.
 *         - Emergency withdrawal available 48h after campaign end with 80/20 penalty.
 */
contract FeedbackEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────── Types ────────────────────

    enum CampaignStatus {
        ACTIVE,
        FINALIZED,
        EMERGENCY
    }

    struct Campaign {
        address creator;
        uint256 totalDeposit;
        uint256 endDate;
        uint256 numAspects;
        CampaignStatus status;
    }

    // ──────────────────── State ────────────────────

    IERC20 public immutable usdc;
    address public authorizedBackend;
    address public treasury;
    address public owner;

    mapping(string => Campaign) public campaigns;

    uint256 public constant EMERGENCY_DELAY = 48 hours;
    uint256 public constant EMERGENCY_PENALTY_BPS = 2000; // 20%

    // ──────────────────── Events ────────────────────

    event CampaignCreated(
        string indexed campaignId,
        address indexed creator,
        uint256 totalDeposit,
        uint256 endDate,
        uint256 numAspects
    );

    event PaymentDistributed(
        string indexed campaignId,
        address indexed wallet,
        uint256 amount,
        uint256 score,
        string aspect
    );

    event CampaignFinalized(
        string indexed campaignId,
        uint256 totalPaidToWinners,
        uint256 refundToCreator
    );

    event EmergencyWithdraw(
        string indexed campaignId,
        address indexed creator,
        uint256 creatorAmount,
        uint256 treasuryAmount
    );

    // ──────────────────── Modifiers ────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAuthorizedBackend() {
        require(msg.sender == authorizedBackend, "Only authorized backend");
        _;
    }

    modifier onlyCampaignCreator(string calldata campaignId) {
        require(campaigns[campaignId].creator == msg.sender, "Only campaign creator");
        _;
    }

    // ──────────────────── Constructor ────────────────────

    constructor(address _usdc, address _authorizedBackend, address _treasury) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_authorizedBackend != address(0), "Invalid backend address");
        require(_treasury != address(0), "Invalid treasury address");

        usdc = IERC20(_usdc);
        authorizedBackend = _authorizedBackend;
        treasury = _treasury;
        owner = msg.sender;
    }

    // ──────────────────── Campaign Creation ────────────────────

    /**
     * @notice Create a campaign and lock USDC in escrow.
     * @param campaignId Unique campaign identifier
     * @param endDate Unix timestamp when the campaign ends
     * @param numAspects Number of aspects (1-10)
     * @param totalAmount Total USDC to lock (must match tier1+tier2+tier3 * numAspects)
     */
    function createCampaign(
        string calldata campaignId,
        uint256 endDate,
        uint256 numAspects,
        uint256 totalAmount
    ) external nonReentrant {
        require(bytes(campaignId).length > 0, "Empty campaign ID");
        require(campaigns[campaignId].creator == address(0), "Campaign already exists");
        require(endDate > block.timestamp, "End date must be in future");
        require(numAspects >= 1 && numAspects <= 10, "Aspects: 1-10");
        require(totalAmount > 0, "Amount must be > 0");

        // Transfer USDC from creator to this contract (escrow)
        usdc.safeTransferFrom(msg.sender, address(this), totalAmount);

        campaigns[campaignId] = Campaign({
            creator: msg.sender,
            totalDeposit: totalAmount,
            endDate: endDate,
            numAspects: numAspects,
            status: CampaignStatus.ACTIVE
        });

        emit CampaignCreated(campaignId, msg.sender, totalAmount, endDate, numAspects);
    }

    // ──────────────────── Payment Distribution ────────────────────

    /**
     * @notice Distribute payments to winners and refund remaining to creator.
     * @dev Only callable by the authorized backend.
     *      CRITICAL: sum(amounts) + refund MUST == totalDeposit. Reverts otherwise.
     */
    function distributePayments(
        string calldata campaignId,
        address[] calldata winners,
        uint256[] calldata amounts,
        uint256[] calldata scores,
        string[] calldata aspects,
        uint256 refundToCreator
    ) external onlyAuthorizedBackend nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.creator != address(0), "Campaign does not exist");
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        require(winners.length == amounts.length, "Length mismatch: winners/amounts");
        require(winners.length == scores.length, "Length mismatch: winners/scores");
        require(winners.length == aspects.length, "Length mismatch: winners/aspects");

        // ── Critical math validation ──
        uint256 totalPaidOut = refundToCreator;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalPaidOut += amounts[i];
        }
        require(
            totalPaidOut == campaign.totalDeposit,
            "CRITICAL: sum(payments) + refund != totalDeposit"
        );

        // ── Execute payments ──
        for (uint256 i = 0; i < winners.length; i++) {
            if (amounts[i] > 0) {
                usdc.safeTransfer(winners[i], amounts[i]);
                emit PaymentDistributed(
                    campaignId,
                    winners[i],
                    amounts[i],
                    scores[i],
                    aspects[i]
                );
            }
        }

        // ── Refund to creator ──
        if (refundToCreator > 0) {
            usdc.safeTransfer(campaign.creator, refundToCreator);
        }

        campaign.status = CampaignStatus.FINALIZED;

        emit CampaignFinalized(campaignId, totalPaidOut - refundToCreator, refundToCreator);
    }

    // ──────────────────── Emergency Mode ────────────────────

    /**
     * @notice Emergency withdraw if backend fails to distribute within 48h after campaign end.
     *         Penalty: 80% to creator, 20% to protocol treasury.
     */
    function emergencyWithdraw(
        string calldata campaignId
    ) external onlyCampaignCreator(campaignId) nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign not active");
        require(
            block.timestamp > campaign.endDate + EMERGENCY_DELAY,
            "Emergency not yet available (48h after end)"
        );

        uint256 total = campaign.totalDeposit;
        uint256 penaltyAmount = (total * EMERGENCY_PENALTY_BPS) / 10000;
        uint256 creatorAmount = total - penaltyAmount;

        campaign.status = CampaignStatus.EMERGENCY;

        // Transfer 80% to creator
        usdc.safeTransfer(campaign.creator, creatorAmount);

        // Transfer 20% penalty to treasury
        usdc.safeTransfer(treasury, penaltyAmount);

        emit EmergencyWithdraw(campaignId, campaign.creator, creatorAmount, penaltyAmount);
    }

    // ──────────────────── Admin ────────────────────

    function setAuthorizedBackend(address _newBackend) external onlyOwner {
        require(_newBackend != address(0), "Invalid address");
        authorizedBackend = _newBackend;
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        treasury = _newTreasury;
    }

    // ──────────────────── View ────────────────────

    function getCampaign(
        string calldata campaignId
    ) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }
}
