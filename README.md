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
   ```bash
   docker compose up
   ```

3. **Access the applications:**
   - Backend API: http://localhost:9000
   - OpenAPI Documentation: http://localhost:9000/swagger-ui.html
   - Database: localhost:5432 (postgres/postgres)
   - Frontend: http://localhost:5173

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

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [**API Documentation**](docs/api.md) - REST API endpoints and usage
- [**Architecture Guide**](docs/architecture.md) - Detailed system architecture
- [**Configuration Guide**](docs/configuration.md) - Application configuration options
- [**Development Guide**](docs/development.md) - Development setup and guidelines
- [**Deployment Guide**](docs/deployment.md) - Production deployment instructions

## 🔧 Technology Stack

### Backend
- **Spring Boot 3.5.4** - Application framework
- **Spring Data JPA** - Database abstraction
- **Yaci Store** - Cardano blockchain indexer
- **PostgreSQL** - Primary database
- **OpenAPI 3** - API documentation
- **Lombok** - Code generation

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

### Infrastructure
- **Docker** - Containerization
- **Gradle** - Build automation
- **Flyway** - Database migrations

## 📊 Features

### Data Indexing
- Real-time indexing of Reeve transactions (metadata label `1447`)
- Automatic parsing of financial reports and organizational data
- Configurable sync starting point
- Parallel processing support

### REST API
- **Organizations**: List and search organizations
- **Reports**: Financial reports with filtering by type, period, and organization
- **Transactions**: Detailed transaction data with pagination
- **OpenAPI Documentation**: Interactive API explorer

### Frontend Features
- Modern, responsive design
- Organization browsing and filtering
- Financial report visualization
- Transaction details and history
- Real-time data updates

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

See [Configuration Guide](docs/configuration.md) for complete options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

- **Issues**: Report bugs or request features via [GitHub Issues](../../issues)
- **Documentation**: Check the `docs/` directory for detailed guides
- **Community**: Join discussions in the repository discussions

---

**Built with ❤️ for the Cardano ecosystem**