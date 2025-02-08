const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Department System DAO Integration", function () {
  let departmentRegistry;
  let governanceToken;
  let budgetDAO;
  let budgetController;
  let proposalManager;
  let activityTracker;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contracts
    const DepartmentRegistry = await ethers.getContractFactory(
      "DepartmentRegistry"
    );
    departmentRegistry = await DepartmentRegistry.deploy();

    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy();

    const BudgetDAO = await ethers.getContractFactory("BudgetDAO");
    budgetDAO = await BudgetDAO.deploy(
      governanceToken.address,
      ethers.ZeroAddress,
      departmentRegistry.address
    );

    const BudgetController = await ethers.getContractFactory(
      "BudgetController"
    );
    budgetController = await BudgetController.deploy(
      departmentRegistry.address,
      budgetDAO.address
    );

    // Set BudgetController in DAO
    await budgetDAO.setBudgetController(budgetController.address);

    // Set up permissions
    await departmentRegistry.addSuperAdmin(budgetController.address);
    await departmentRegistry.addSuperAdmin(budgetDAO.address);

    // Mint initial tokens
    await governanceToken.mint(owner.address, ethers.parseEther("1000000"));
  });

  describe("Basic Setup", function () {
    it("Should have correct initial configuration", async function () {
      expect(await governanceToken.balanceOf(owner.address)).to.equal(
        ethers.parseEther("1000000")
      );
      expect(await departmentRegistry.superAdmins(budgetDAO.address)).to.be
        .true;
      expect(await departmentRegistry.superAdmins(budgetController.address)).to
        .be.true;
    });

    it("Should allow budget proposals through DAO", async function () {
      // Transfer some tokens to addr1
      await governanceToken.transfer(addr1.address, ethers.parseEther("1000"));

      // Register a department
      await departmentRegistry.registerDepartment(
        addr2.address,
        "Test Department",
        ethers.parseEther("1000"),
        addr2.address,
        "logo.png"
      );

      // Create budget proposal
      await budgetDAO
        .connect(addr1)
        .proposeBudget(addr2.address, ethers.parseEther("2000"));

      // Get proposal details
      const proposal = await budgetDAO.getProposalDetails(1);
      expect(proposal.department).to.equal(addr2.address);
      expect(proposal.proposedBudget).to.equal(ethers.parseEther("2000"));
    });
  });
});
