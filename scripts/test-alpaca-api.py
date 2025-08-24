#!/usr/bin/env python3
"""
Test Alpaca API connectivity
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from alpaca.trading.client import TradingClient
from alpaca.data import StockHistoricalDataClient
from alpaca.data.requests import StockLatestQuoteRequest

# Load environment variables
load_dotenv(Path(__file__).parent.parent / ".env")

def test_alpaca_connection():
    print("Testing Alpaca API connectivity...")
    
    api_key = os.getenv('ALPACA_API_KEY')
    secret_key = os.getenv('ALPACA_SECRET_KEY')
    
    if not api_key or not secret_key:
        print("❌ Missing API credentials!")
        return False
    
    print(f"✓ API Key found: {api_key[:10]}...")
    print(f"✓ Secret Key found: {secret_key[:10]}...")
    
    try:
        # Test Trading API
        print("\nTesting Trading API...")
        trading_client = TradingClient(api_key, secret_key, paper=True)
        
        # Get account info
        account = trading_client.get_account()
        print(f"✓ Account ID: {account.id}")
        print(f"✓ Cash: ${float(account.cash):,.2f}")
        print(f"✓ Buying Power: ${float(account.buying_power):,.2f}")
        print(f"✓ Portfolio Value: ${float(account.portfolio_value):,.2f}")
        print(f"✓ Status: {account.status}")
        
        # Get positions
        positions = trading_client.get_all_positions()
        print(f"✓ Positions: {len(positions)} open positions")
        
        # Test Data API
        print("\nTesting Data API...")
        data_client = StockHistoricalDataClient(api_key, secret_key)
        
        # Get Tesla quote
        request = StockLatestQuoteRequest(symbol_or_symbols="TSLA")
        quotes = data_client.get_stock_latest_quote(request)
        tsla_quote = quotes["TSLA"]
        print(f"✓ TSLA Quote - Bid: ${float(tsla_quote.bid_price):.2f}, Ask: ${float(tsla_quote.ask_price):.2f}")
        
        # Get market clock
        clock = trading_client.get_clock()
        print(f"\n✓ Market is {'OPEN' if clock.is_open else 'CLOSED'}")
        print(f"✓ Next open: {clock.next_open}")
        print(f"✓ Next close: {clock.next_close}")
        
        print("\n✅ All Alpaca API tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_alpaca_connection()
    sys.exit(0 if success else 1)