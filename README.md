# 💧 Water Warriors - AI-Powered Water Futures Trading Platform

**🏆 Built for Hackathon - Combining Satellite Imagery, Blockchain, and AI for Water Market Innovation**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/lucas-projects-6ad63bd4/v0-no-content)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude%203.5-purple?style=for-the-badge)](https://anthropic.com)

## 🎯 Project Overview

Water Warriors is an innovative AI-powered platform that democratizes water futures trading by combining real-time market data, satellite-based drought analysis, and blockchain-powered subsidies. Built specifically for farmers and agricultural stakeholders, our platform makes complex water rights trading accessible through natural language AI interactions.

### 🌟 Key Features

- **🤖 AI Trading Agent**: Natural language trading powered by Claude 3.5 Sonnet
- **📊 Real-Time Trading**: Live integration with Alpaca Markets API
- **🛰️ Satellite Drought Analysis**: GRIDMET data processing via Google Earth Engine
- **💰 Blockchain Subsidies**: Ethereum Sepolia USDC transfers via Crossmint
- **🌧️ Drought-Based Pricing**: Dynamic subsidy system ($0.25-$0.75 based on severity)
- **📈 Predictive Analytics**: ML models trained on NQH2O water index data

## 🛰️ Satellite Imagery & Drought Analysis

### 📓 Google Colab Notebook

**[NQH2O_Prediction_GridMET (2).ipynb](./NQH2O_Prediction_GridMET%20(2).ipynb)**

This Jupyter notebook contains our advanced drought analysis pipeline that:

1. **Fetches Real-Time Drought Data** from GRIDMET via Google Earth Engine
2. **Processes 5 California Water Basins**:
   - Central Basin
   - Chino Basin
   - Main San Gabriel Basin
   - Mojave Basin
   - California Surface Water (Statewide)
3. **Extracts 85+ Drought Indicators**:
   - SPI (Standardized Precipitation Index)
   - SPEI (Standardized Precipitation-Evapotranspiration Index)
   - PDSI (Palmer Drought Severity Index)
   - EDDI (Evaporative Demand Drought Index)
4. **Trains ML Models** for NQH2O price prediction with:
   - Ridge, Lasso, ElasticNet
   - Random Forest, Gradient Boosting
   - Ensemble methods achieving R² > 0.95 on validation

### 🔬 Technical Highlights

- **497 weekly observations** from 2018-2025
- **320 engineered features** including drought lags and composites
- **Real drought patterns** from 2020-2022 California drought
- **Feature importance analysis** showing drought indicators drive 44% of price variance

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **AI Integration**: Anthropic Claude 3.5 Sonnet, Vercel AI SDK
- **Trading**: Alpaca Markets API (paper trading)
- **Blockchain**: Crossmint API, Ethereum Sepolia, USDC
- **Data Science**: Python, Google Earth Engine, scikit-learn
- **MCP Servers**: Custom Python servers for Alpaca & Crossmint

### System Architecture

```
┌─────────────────────────────────────────┐
│          Water Warriors UI              │
│    (Next.js + React + TypeScript)       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│        AI Chat Interface                │
│    (Claude 3.5 Sonnet via API)         │
└────────────┬────────────────────────────┘
             │
        ┌────┴────┬─────────┬────────┐
        ▼         ▼         ▼        ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Alpaca   │ │Crossmint │ │ GRIDMET  │ │  NQH2O   │
│ Trading  │ │Blockchain│ │ Drought  │ │  Index   │
│   API    │ │   API    │ │   Data   │ │   Data   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- API Keys for:
  - Anthropic Claude
  - Alpaca Markets
  - Crossmint

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/water-warriors
cd water-warriors

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env

# Start MCP servers (in separate terminals)
python scripts/alpaca_mcp_server.py
python scripts/crossmint_mcp_server.py

# Run the development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 💼 Trading Features

### Natural Language Trading
Simply tell the AI what you want to do:
- "Buy 5 shares of Tesla"
- "Check my current positions"
- "What's my account balance?"
- "Show me recent orders"

### Drought-Based Subsidies
The platform automatically adjusts subsidies based on drought severity:
- **High Drought**: $0.75 subsidy
- **Medium Drought**: $0.50 subsidy  
- **Low Drought**: $0.25 subsidy

Users can claim subsidies through the AI: "Check subsidy" or "Claim subsidy"

## 📊 Data Science Pipeline

Our ML pipeline processes:
1. **Historical NQH2O water index prices** (2018-2025)
2. **GRIDMET satellite drought data** across 5 basins
3. **85 drought indicators** with temporal lags
4. **Feature engineering** creating 320+ features
5. **Model ensemble** combining 5 algorithms

Results:
- **Test RMSE**: $86.82
- **Validation R²**: 0.95
- **Drought features**: 44% of model importance

## 🔐 Security & Compliance

- Paper trading mode for safe testing
- Secure API key management
- Blockchain transactions on test network (Sepolia)
- No real money movements during development

## 🎯 Use Cases

1. **Farmers**: Hedge against water price volatility
2. **Agricultural Funds**: Manage water risk exposure
3. **Government Agencies**: Monitor and subsidize during droughts
4. **Researchers**: Access integrated water market data

## 🏆 Hackathon Innovation

This project demonstrates:
- **Cross-domain Integration**: Satellite + Blockchain + AI + Trading
- **Real-world Impact**: Addressing California water crisis
- **Technical Excellence**: Production-ready architecture
- **User Experience**: Natural language interface for complex trading

## 📈 Future Roadmap

- [ ] Real-time satellite imagery processing
- [ ] Smart contract automation for subsidies
- [ ] Mobile application
- [ ] Multi-region water market support
- [ ] Advanced risk analytics dashboard
- [ ] Integration with weather forecasting APIs

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GRIDMET** for drought data
- **Alpaca Markets** for trading infrastructure
- **Crossmint** for blockchain integration
- **Anthropic** for Claude AI
- **Google Earth Engine** for satellite data processing

## 📞 Contact

For questions about this hackathon project:
- GitHub: [Water Warriors Repository](https://github.com/yourusername/water-warriors)
- Demo: [Live Demo](https://vercel.com/lucas-projects-6ad63bd4/v0-no-content)

---

**Built with ❤️ for the Hackathon by Team Water Warriors**

*Turning drought data into actionable trading insights through AI*