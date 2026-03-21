// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing on Sepolia testnet.
 *      Has 6 decimals like real USDC.
 */
contract MockUSDC is ERC20 {
    uint8 private constant _DECIMALS = 6;

    constructor() ERC20("Mock USDC", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /// @dev Anyone can mint for testing purposes
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
