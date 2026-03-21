"""
Blockchain Service — Smart Contract Communication

Sends verified payment data to the FeedbackEscrow contract.
Uses web3.py to interact with the deployed contract on Sepolia/Avalanche.
"""

import json
import os
from web3 import Web3
from config import settings

# ABI for FeedbackEscrow (only the functions we need)
ESCROW_ABI = json.loads("""[
  {
    "inputs": [
      {"internalType": "string", "name": "campaignId", "type": "string"},
      {"internalType": "address[]", "name": "winners", "type": "address[]"},
      {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"},
      {"internalType": "uint256[]", "name": "scores", "type": "uint256[]"},
      {"internalType": "string[]", "name": "aspects", "type": "string[]"},
      {"internalType": "uint256", "name": "refundToCreator", "type": "uint256"}
    ],
    "name": "distributePayments",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "campaignId", "type": "string"}],
    "name": "getCampaign",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "creator", "type": "address"},
          {"internalType": "uint256", "name": "totalDeposit", "type": "uint256"},
          {"internalType": "uint256", "name": "endDate", "type": "uint256"},
          {"internalType": "uint256", "name": "numAspects", "type": "uint256"},
          {"internalType": "uint8", "name": "status", "type": "uint8"}
        ],
        "internalType": "struct FeedbackEscrow.Campaign",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]""")

USDC_DECIMALS = 6


def get_web3():
    """Get Web3 instance connected to the configured RPC."""
    w3 = Web3(Web3.HTTPProvider(settings.sepolia_rpc_url))
    return w3


def to_usdc_units(amount: float) -> int:
    """Convert float amount to USDC smallest units (6 decimals)."""
    return int(amount * (10 ** USDC_DECIMALS))


async def distribute_payments(payload: dict) -> str:
    """
    Send the payment distribution transaction to the FeedbackEscrow contract.
    Returns the transaction hash.
    """
    w3 = get_web3()

    if not w3.is_connected():
        raise ConnectionError("Cannot connect to blockchain RPC")

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(settings.escrow_contract_address),
        abi=ESCROW_ABI,
    )

    # Prepare arrays
    winners = [Web3.to_checksum_address(w["wallet"]) for w in payload["winners"]]
    amounts = [to_usdc_units(w["amount"]) for w in payload["winners"]]
    scores = [w["score"] for w in payload["winners"]]
    aspects = [w["aspect"] for w in payload["winners"]]
    refund = to_usdc_units(payload["refund_to_company"])

    # Build transaction
    account = w3.eth.account.from_key(settings.backend_private_key)
    nonce = w3.eth.get_transaction_count(account.address)

    tx = contract.functions.distributePayments(
        payload["campaign_id"],
        winners,
        amounts,
        scores,
        aspects,
        refund,
    ).build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gas": 500000,
        "gasPrice": w3.eth.gas_price,
    })

    # Sign and send
    signed_tx = w3.eth.account.sign_transaction(tx, settings.backend_private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    # Wait for receipt
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt.status != 1:
        raise Exception(f"Transaction failed: {tx_hash.hex()}")

    return tx_hash.hex()
