# Reeve Indexing Example

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.4-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

A comprehensive example application demonstrating how to index, verify, and visualize [Reeve](https://reeve.technology) on-chain financial data from the Cardano blockchain. This project showcases blockchain data integration with modern web technologies.

## 🎯 Project Overview

Reeve is a transparency and accountability platform developed by the Cardano Foundation that publishes financial data of organizations directly onto the Cardano blockchain. This repository provides a complete solution for:

- **Indexing** Reeve transactions from Cardano mainnet
- **Parsing and storing** financial reports and organizational data
- **Exposing REST APIs** for data access
- **Visualizing data** through a modern React frontend

### 🔗 Related Links

- [Reeve Platform](https://reeve.technology) - Official Reeve website
- [Reeve Backend Repository](https://github.com/cardano-foundation/cf-reeve-platform) - Official Cardano Foundation Reeve implementation
- [Yaci Store](https://github.com/bloxbean/yaci-store) - Modular Cardano indexer used in this project
- [Example Reeve Transaction](https://explorer.cardano.org/transaction/99a20f54f25bf9168719cb2ce00e25ab01c4a458e0500cf3a699a7c8ce3c0cdf) - Live transaction on Cardano Explorer

## 🚀 Quick Start

### Prerequisites

- **Java 21** or higher
- **Node.js 18+** and npm
- **Docker & Docker Compose** (recommended)
- **Git**

### Option 1: Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd reeve-indexing-example
   ```

2. **Start the application:**
   On Mainnet:
   ```bash
   docker compose up
   ```
   On Yaci Devkit:
   ```bash
   docker compose -f docker-compose-devkit.yml up -d
   ```

3. **Access the applications:**
   - Backend API: http://localhost:9000
   - OpenAPI Documentation: http://localhost:9000/swagger-ui.html
   - Database: localhost:5432 (postgres/postgres)
   - Frontend: http://localhost:3000

### Option 2: Local Development

1. **Start PostgreSQL database:**
   ```bash
   docker run --name postgres-reeve -e POSTGRES_DB=reeve-verifier -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine
   ```

2. **Run the backend:**
   ```bash
   ./gradlew clean bootRun
   ```

3. **Run the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🛠️ Configuration

Key configuration options in `application.yml`:

```yaml
reeve:
  label: 1447  # Reeve metadata label

store:
  cardano:
    host: backbone.mainnet.cardanofoundation.org
    port: 3001
    sync-start-slot: 159983856  # Starting sync point
```

**Built with ❤️ for the Cardano ecosystem**