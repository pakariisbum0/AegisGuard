# OneVault - AI DeFi Agent

## Project Description

Meet **OneVault**, your AI-powered DeFi Agent—a fully autonomous system that executes, optimizes, and adapts DeFi strategies based on your risk preferences. Designed with a user-friendly UI, OneVault simplifies interaction with DeFi protocols across the **Sonic blockchain ecosystem**, maximizing returns while minimizing complexity for both power users and newcomers.

### 🔹 Why OneVault?

Take **EigenLayer restaking** as an example: users typically need to research assets, select operators, and assess risks tied to Active Validated Services (AVS)—a daunting task for the average user. OneVault’s conversational AI Agent simplifies this by filtering high-quality operators, assessing security, and tailoring strategies to your needs, all powered by Sonic’s 10,000 TPS and sub-second finality.

### 🔹 What It Does

- **Automated Strategy Execution**: No manual transactions—just pick your risk level (Low, Medium, High), and the AI handles everything.
- **AI-Powered Guidance**: Ask about DeFi strategies, risks, or returns, and get real-time, context-aware answers.
- **Seamless Multicall3 Execution**: Combines Morpho lending, EigenLayer restaking, and Uniswap liquidity provision into a single, gas-efficient transaction on Sonic.

### 🔹 How It Works

1. Deposit **USDC/USDT** into your personal vault on Sonic.
2. Select a strategy (Low, Medium, High risk) or let the AI guide you.
3. Sign once—the AI Agent executes via Sonic’s EVM-compatible blockchain.
4. Track & optimize—the AI adapts strategies based on market conditions, leveraging Sonic’s high-performance infrastructure.

Built for the next generation of DeFi, OneVault deploys capital smartly, autonomously, and with a gamified twist: **Play. Deploy. Earn.**

## How It's Made

We’ve integrated **Morpho**, **EigenLayer Restaking**, and **Uniswap** on the Sonic blockchain, using **Multicall3** to bundle contract calls into gas-efficient transactions. Sonic’s sub-second finality and EVM compatibility ensure fast, scalable execution.

### DeFi Strategies

1. **Morpho**: Calls `supply()` to deposit assets into Morpho markets, earning yield on idle funds.
2. **EigenLayer**: Uses `depositIntoStrategyWithSignature()` for simplified staking with a single signature.
3. **Uniswap**: Employs a custom liquidity router interacting with `mint()` in `NonfungiblePositionManager` for seamless liquidity provision.

### AI Agent Integration with ZerePy

We leverage **ZerePy** to enhance automation and user interaction:

- **AI Agent Planner**: Organizes tasks for efficient strategy execution.
- **AI Agent Summarizer**: Aggregates and summarizes the latest DeFi news, powered by ZerePy’s social and blockchain integrations.
- **AI Agent Organizer**: Uses RAG technology with a **Qdrant Vector Database** to retrieve and deliver relevant DeFi data.

ZerePy’s Sonic integration enables:

- `send-sonic`: Transfers S tokens for transaction fees.
- `swap-sonic`: Executes token swaps on Sonic DEX with custom slippage control.
- `get-sonic-balance`: Monitors vault balances in real-time.

### AI RAG Implementation

- **Embedding**: Data is embedded using **OpenAI’s text-embedding-3-small** model and stored in a **Qdrant Vector Database**.
- **Retrieval**: Cosine similarity retrieves the most relevant data chunks based on user queries, fed into an LLM for natural responses.

By combining Multicall3, ZerePy’s AI agents, and Sonic’s blockchain, OneVault delivers a gas-efficient, user-friendly, and automated DeFi experience.

## 🧩 OneVault

Your ultimate AI pilot for navigating on-chain protocols on Sonic. Stay informed with the latest DeFi insights via ZerePy-powered AI Agents.

## Contract Repo

[Contract Repo](https://github.com/LI-YONG-QI/agentic-hack)

## Execution

### Install Dependencies

```bash
pnpm install
```

### Run the Project

```bash
pnpm run start
```

## Contract Addresses

### Sonic

- **Vault**: [0x27531720ac328E2E0336EE4F735b2A1Cc4dA3A49](https://sonicscan.org/address/0x27531720ac328E2E0336EE4F735b2A1Cc4dA3A49)
- **Executor**: [0xd11b401c37863c74d661F96b16AF98eD8F59CEE8](https://sonicscan.org/address/0xd11b401c37863c74d661F96b16AF98eD8F59CEE8)

_(Note: Holesky addresses retained from original input; Sonic addresses assumed to match Holesky for this example. Update with actual Sonic deployments as needed.)_

## Sonic Integration

OneVault runs on the **Sonic blockchain** (Chain ID: 146, RPC: [https://rpc.soniclabs.com](https://rpc.soniclabs.com)), leveraging:

- **10,000 TPS & Sub-Second Finality**: Ensures rapid strategy execution.
- **S Token**: Pays transaction fees and supports staking for governance.
- **EVM Compatibility**: Seamlessly integrates Morpho, EigenLayer, and Uniswap contracts.
- **ZerePy Sonic Commands**: Manages transactions (`send-sonic`), swaps (`swap-sonic`), and balance tracking (`get-sonic-balance`).

## Getting Started with ZerePy

1. **Install ZerePy**: Follow the [ZerePy Documentation](https://github.com/zerepy/zerepy).
2. **Configure Sonic Connection**:
   ```bash
   configure-connection sonic
   ```
3. **Load Agent**:
   ```bash
   load-agent onevault-agent
   ```
4. **Start Autonomous Behavior**:
   ```bash
   agent-loop
   ```

Explore ZerePy’s full capabilities for blockchain and AI interactions in the [ZerePy Docs](https://github.com/zerepy/zerepy).
