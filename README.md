# FeedMe 🍽️

> **FinanceIA Hackathon 2026 Project**

FeedMe is a decentralized feedback evaluation system integrated with blockchain rewards. It leverages AI agents to evaluate campaign feedback and automatically rewards users with cryptocurrency via smart contracts.

## 🚀 Features
- **AI-Powered Evaluation**: Automated feedback analysis and scoring using Python-based AI agents.
- **Web3 Rewards**: Smart contract integration to distribute rewards to users on Avalanche Fuji and Sepolia testnets.
- **Modern Web Interface**: Built with Next.js for a seamless user experience.
- **Robust Backend**: FastAPI application powered by PostgreSQL and Prisma ORM.

## 🏗️ Architecture & Tech Stack

The repository is structured into three main components:

### 1. Frontend (`/nextjs`)
- **Framework**: Next.js (App Router), React
- **Styling**: Tailwind CSS
- **Web3 Integration**: Client-side blockchain interactions
- **Setup**: `npm install` and `npm run dev`

### 2. Backend (`/backend`)
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with Prisma ORM
- **AI Agents**: Custom Python evaluators for feedback analysis
- **Task Scheduling**: Automated campaign simulations and evaluations
- **Setup**: `pip install -r requirements.txt` and run `uvicorn main:app --reload`

### 3. Blockchain (`/blockchain`)
- **Environment**: Hardhat
- **Contracts**: Solidity smart contracts for reward distribution
- **Networks**: Avalanche Fuji Testnet, Sepolia Testnet
- **Setup**: `npm install` and `npx hardhat test`

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL database
- A Web3 Wallet (e.g., MetaMask) configured for Avalanche Fuji Testnet

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Daniiel-Hub123/FeedMe.git
   cd FeedMe
   ```

2. **Backend Setup:**
   - Navigate to `/backend`.
   - Copy `.env.example` to `.env` and configure your database URL.
   - Install dependencies and run prisma migrations.
   - Start the FastAPI server.

3. **Blockchain Setup:**
   - Navigate to `/blockchain`.
   - Copy `.env.example` to `.env` and add your RPC URLs and Private Keys.
   - Deploy contracts to the desired testnet.

4. **Frontend Setup:**
   - Navigate to `/nextjs`.
   - Install dependencies using `npm install`.
   - Run the development server with `npm run dev`.
   - Open [http://localhost:3000](http://localhost:3000)

## 📜 License
This project was created for the Aleph Hackathon 2026.
