import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("FeedbackEscrow", function () {
  const USDC_DECIMALS = 6;
  const toUSDC = (amount: number) => ethers.parseUnits(amount.toString(), USDC_DECIMALS);

  async function deployFixture() {
    const [owner, company, user1, user2, user3, treasury, backend] =
      await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();

    // Deploy FeedbackEscrow
    const FeedbackEscrow = await ethers.getContractFactory("FeedbackEscrow");
    const escrow = await FeedbackEscrow.deploy(
      await usdc.getAddress(),
      backend.address,
      treasury.address
    );

    // Mint USDC to company for testing
    await usdc.mint(company.address, toUSDC(10000));

    return { usdc, escrow, owner, company, user1, user2, user3, treasury, backend };
  }

  describe("Campaign Creation", function () {
    it("Should create a campaign and lock USDC", async function () {
      const { usdc, escrow, company } = await loadFixture(deployFixture);

      const deposit = toUSDC(900); // 3 tiers × 3 aspects × 100
      const endDate = (await time.latest()) + 30 * 24 * 60 * 60; // 30 days

      // Approve USDC
      await usdc.connect(company).approve(await escrow.getAddress(), deposit);

      // Create campaign
      await expect(
        escrow.connect(company).createCampaign("camp_001", endDate, 3, deposit)
      )
        .to.emit(escrow, "CampaignCreated")
        .withArgs("camp_001", company.address, deposit, endDate, 3);

      // Verify escrow balance
      const escrowBalance = await usdc.balanceOf(await escrow.getAddress());
      expect(escrowBalance).to.equal(deposit);

      // Verify campaign data
      const campaign = await escrow.getCampaign("camp_001");
      expect(campaign.creator).to.equal(company.address);
      expect(campaign.totalDeposit).to.equal(deposit);
      expect(campaign.status).to.equal(0); // ACTIVE
    });

    it("Should reject duplicate campaign IDs", async function () {
      const { usdc, escrow, company } = await loadFixture(deployFixture);

      const deposit = toUSDC(300);
      const endDate = (await time.latest()) + 30 * 24 * 60 * 60;

      await usdc.connect(company).approve(await escrow.getAddress(), deposit * 2n);
      await escrow.connect(company).createCampaign("camp_dup", endDate, 1, deposit);

      await expect(
        escrow.connect(company).createCampaign("camp_dup", endDate, 1, deposit)
      ).to.be.revertedWith("Campaign already exists");
    });

    it("Should reject invalid aspect count", async function () {
      const { usdc, escrow, company } = await loadFixture(deployFixture);

      const deposit = toUSDC(300);
      const endDate = (await time.latest()) + 30 * 24 * 60 * 60;
      await usdc.connect(company).approve(await escrow.getAddress(), deposit);

      await expect(
        escrow.connect(company).createCampaign("camp_bad", endDate, 0, deposit)
      ).to.be.revertedWith("Aspects: 1-10");

      await expect(
        escrow.connect(company).createCampaign("camp_bad", endDate, 11, deposit)
      ).to.be.revertedWith("Aspects: 1-10");
    });
  });

  describe("Payment Distribution", function () {
    it("Should distribute payments when math is correct", async function () {
      const { usdc, escrow, company, user1, user2, user3, backend } =
        await loadFixture(deployFixture);

      const deposit = toUSDC(900);
      const endDate = (await time.latest()) + 30 * 24 * 60 * 60;

      await usdc.connect(company).approve(await escrow.getAddress(), deposit);
      await escrow.connect(company).createCampaign("camp_pay", endDate, 3, deposit);

      // Distribute: 3 winners + refund
      const winners = [user1.address, user2.address, user3.address];
      const amounts = [toUSDC(300), toUSDC(200), toUSDC(100)];
      const scores = [92, 85, 78];
      const aspects = ["design", "functionality", "usability"];
      const refund = toUSDC(300); // 300 + 200 + 100 + 300 = 900

      await expect(
        escrow
          .connect(backend)
          .distributePayments("camp_pay", winners, amounts, scores, aspects, refund)
      ).to.emit(escrow, "CampaignFinalized");

      // Verify balances
      expect(await usdc.balanceOf(user1.address)).to.equal(toUSDC(300));
      expect(await usdc.balanceOf(user2.address)).to.equal(toUSDC(200));
      expect(await usdc.balanceOf(user3.address)).to.equal(toUSDC(100));
      expect(await usdc.balanceOf(company.address)).to.equal(
        toUSDC(10000) - deposit + refund
      );

      // Verify campaign is finalized
      const campaign = await escrow.getCampaign("camp_pay");
      expect(campaign.status).to.equal(1); // FINALIZED
    });

    it("Should REVERT if math doesn't match (even 1 cent off)", async function () {
      const { usdc, escrow, company, user1, backend } =
        await loadFixture(deployFixture);

      const deposit = toUSDC(900);
      const endDate = (await time.latest()) + 30 * 24 * 60 * 60;

      await usdc.connect(company).approve(await escrow.getAddress(), deposit);
      await escrow.connect(company).createCampaign("camp_bad_math", endDate, 3, deposit);

      // Total = 500 + 399.999999 = 899.999999 (1 micro-dollar short!)
      const winners = [user1.address];
      const amounts = [toUSDC(500)];
      const scores = [90];
      const aspects = ["design"];
      const refund = toUSDC(400) - 1n; // Off by 1 unit

      await expect(
        escrow
          .connect(backend)
          .distributePayments(
            "camp_bad_math",
            winners,
            amounts,
            scores,
            aspects,
            refund
          )
      ).to.be.revertedWith("CRITICAL: sum(payments) + refund != totalDeposit");
    });

    it("Should reject non-backend callers", async function () {
      const { usdc, escrow, company, user1 } = await loadFixture(deployFixture);

      const deposit = toUSDC(300);
      const endDate = (await time.latest()) + 30 * 24 * 60 * 60;

      await usdc.connect(company).approve(await escrow.getAddress(), deposit);
      await escrow.connect(company).createCampaign("camp_perm", endDate, 1, deposit);

      await expect(
        escrow
          .connect(company) // Not the backend!
          .distributePayments(
            "camp_perm",
            [user1.address],
            [deposit],
            [90],
            ["design"],
            0
          )
      ).to.be.revertedWith("Only authorized backend");
    });

    it("Should handle full refund (zero winners)", async function () {
      const { usdc, escrow, company, backend } = await loadFixture(deployFixture);

      const deposit = toUSDC(600);
      const endDate = (await time.latest()) + 30 * 24 * 60 * 60;

      await usdc.connect(company).approve(await escrow.getAddress(), deposit);
      await escrow.connect(company).createCampaign("camp_empty", endDate, 2, deposit);

      // Full refund — nobody qualified
      await escrow
        .connect(backend)
        .distributePayments("camp_empty", [], [], [], [], deposit);

      expect(await usdc.balanceOf(company.address)).to.equal(toUSDC(10000)); // Got everything back
    });
  });

  describe("Emergency Mode", function () {
    it("Should allow emergency withdraw after 48h", async function () {
      const { usdc, escrow, company, treasury } = await loadFixture(deployFixture);

      const deposit = toUSDC(1000);
      const endDate = (await time.latest()) + 7 * 24 * 60 * 60;

      await usdc.connect(company).approve(await escrow.getAddress(), deposit);
      await escrow.connect(company).createCampaign("camp_emer", endDate, 2, deposit);

      // Fast-forward past endDate + 48h
      await time.increase(7 * 24 * 60 * 60 + 48 * 60 * 60 + 1);

      const companyBalanceBefore = await usdc.balanceOf(company.address);

      await expect(
        escrow.connect(company).emergencyWithdraw("camp_emer")
      ).to.emit(escrow, "EmergencyWithdraw");

      // Company gets 80% = 800
      expect(await usdc.balanceOf(company.address)).to.equal(
        companyBalanceBefore + toUSDC(800)
      );
      // Treasury gets 20% = 200
      expect(await usdc.balanceOf(treasury.address)).to.equal(toUSDC(200));

      // Campaign is in EMERGENCY state
      const campaign = await escrow.getCampaign("camp_emer");
      expect(campaign.status).to.equal(2); // EMERGENCY
    });

    it("Should reject emergency withdraw before 48h", async function () {
      const { usdc, escrow, company } = await loadFixture(deployFixture);

      const deposit = toUSDC(500);
      const endDate = (await time.latest()) + 7 * 24 * 60 * 60;

      await usdc.connect(company).approve(await escrow.getAddress(), deposit);
      await escrow.connect(company).createCampaign("camp_early", endDate, 1, deposit);

      // Only move to endDate + 24h (not enough!)
      await time.increase(7 * 24 * 60 * 60 + 24 * 60 * 60);

      await expect(
        escrow.connect(company).emergencyWithdraw("camp_early")
      ).to.be.revertedWith("Emergency not yet available (48h after end)");
    });

    it("Should reject emergency withdraw by non-creator", async function () {
      const { usdc, escrow, company, user1 } = await loadFixture(deployFixture);

      const deposit = toUSDC(500);
      const endDate = (await time.latest()) + 7 * 24 * 60 * 60;

      await usdc.connect(company).approve(await escrow.getAddress(), deposit);
      await escrow.connect(company).createCampaign("camp_perm2", endDate, 1, deposit);

      await time.increase(7 * 24 * 60 * 60 + 48 * 60 * 60 + 1);

      await expect(
        escrow.connect(user1).emergencyWithdraw("camp_perm2")
      ).to.be.revertedWith("Only campaign creator");
    });
  });
});
