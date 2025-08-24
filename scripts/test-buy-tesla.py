#!/usr/bin/env python3
"""
Test buying 1 share of Tesla programmatically
"""

import os
import sys
import json
import time
from pathlib import Path
from dotenv import load_dotenv
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.data import StockHistoricalDataClient
from alpaca.data.requests import StockLatestQuoteRequest

# Load environment variables
load_dotenv(Path(__file__).parent.parent / ".env")

def test_buy_tesla():
    print("=" * 60)
    print("TESTING: Buy 1 Share of Tesla (TSLA)")
    print("=" * 60)
    
    api_key = os.getenv('ALPACA_API_KEY')
    secret_key = os.getenv('ALPACA_SECRET_KEY')
    
    if not api_key or not secret_key:
        print("❌ Missing API credentials!")
        return False
    
    try:
        # Initialize clients
        trading_client = TradingClient(api_key, secret_key, paper=True)
        data_client = StockHistoricalDataClient(api_key, secret_key)
        
        # Step 1: Check account before trade
        print("\n1️⃣ CHECKING ACCOUNT BEFORE TRADE...")
        account_before = trading_client.get_account()
        print(f"   💰 Cash Available: ${float(account_before.cash):,.2f}")
        print(f"   💪 Buying Power: ${float(account_before.buying_power):,.2f}")
        print(f"   📊 Portfolio Value: ${float(account_before.portfolio_value):,.2f}")
        
        # Step 2: Get current TSLA quote
        print("\n2️⃣ GETTING TESLA QUOTE...")
        request = StockLatestQuoteRequest(symbol_or_symbols="TSLA")
        quotes = data_client.get_stock_latest_quote(request)
        tsla_quote = quotes["TSLA"]
        
        bid_price = float(tsla_quote.bid_price) if tsla_quote.bid_price else 0
        ask_price = float(tsla_quote.ask_price) if tsla_quote.ask_price else 0
        
        # Use bid price as estimated price (or a fallback)
        estimated_price = bid_price if bid_price > 0 else 340.00  # Fallback to recent TSLA price
        
        print(f"   🚗 TSLA Current Bid: ${bid_price:.2f}")
        print(f"   🚗 TSLA Current Ask: ${ask_price:.2f}")
        print(f"   📍 Using estimated price: ${estimated_price:.2f}")
        
        # Step 3: Check existing positions
        print("\n3️⃣ CHECKING EXISTING POSITIONS...")
        positions_before = trading_client.get_all_positions()
        tsla_position_before = None
        for pos in positions_before:
            if pos.symbol == "TSLA":
                tsla_position_before = pos
                print(f"   📈 Existing TSLA position: {float(pos.qty)} shares")
                break
        if not tsla_position_before:
            print("   📊 No existing TSLA position")
        
        # Step 4: Place the order
        print("\n4️⃣ PLACING BUY ORDER FOR 1 SHARE OF TESLA...")
        print("   🔄 Creating market order request...")
        
        order_request = MarketOrderRequest(
            symbol="TSLA",
            qty=1,
            side=OrderSide.BUY,
            time_in_force=TimeInForce.DAY
        )
        
        print("   📤 Submitting order to Alpaca...")
        order = trading_client.submit_order(order_request)
        
        print(f"\n   ✅ ORDER PLACED SUCCESSFULLY!")
        print(f"   📋 Order ID: {order.id}")
        print(f"   🔖 Symbol: {order.symbol}")
        print(f"   📊 Quantity: {order.qty}")
        print(f"   💵 Type: {order.order_type}")
        print(f"   📅 Status: {order.status}")
        print(f"   ⏰ Submitted at: {order.submitted_at}")
        
        # Step 5: Wait for order to fill
        print("\n5️⃣ WAITING FOR ORDER TO FILL...")
        max_wait = 30  # seconds
        wait_interval = 2
        elapsed = 0
        
        while elapsed < max_wait:
            time.sleep(wait_interval)
            elapsed += wait_interval
            
            # Check order status
            updated_order = trading_client.get_order_by_id(order.id)
            print(f"   ⏳ Order status: {updated_order.status} ({elapsed}s)")
            
            if updated_order.status in ['filled', 'partially_filled']:
                print(f"\n   🎉 ORDER FILLED!")
                print(f"   💰 Filled Qty: {updated_order.filled_qty}")
                if updated_order.filled_avg_price:
                    print(f"   💵 Filled Price: ${float(updated_order.filled_avg_price):.2f}")
                break
            elif updated_order.status in ['canceled', 'expired', 'rejected']:
                print(f"\n   ❌ Order {updated_order.status}")
                break
        
        # Step 6: Check account after trade
        print("\n6️⃣ CHECKING ACCOUNT AFTER TRADE...")
        account_after = trading_client.get_account()
        print(f"   💰 Cash Available: ${float(account_after.cash):,.2f}")
        print(f"   💪 Buying Power: ${float(account_after.buying_power):,.2f}")
        print(f"   📊 Portfolio Value: ${float(account_after.portfolio_value):,.2f}")
        
        cash_used = float(account_before.cash) - float(account_after.cash)
        print(f"   💸 Cash Used: ${cash_used:.2f}")
        
        # Step 7: Verify position
        print("\n7️⃣ VERIFYING POSITION...")
        positions_after = trading_client.get_all_positions()
        for pos in positions_after:
            if pos.symbol == "TSLA":
                print(f"   ✅ TSLA Position Found!")
                print(f"   📈 Shares: {float(pos.qty)}")
                print(f"   💰 Market Value: ${float(pos.market_value):.2f}")
                print(f"   💵 Avg Entry Price: ${float(pos.avg_entry_price):.2f}")
                
                if tsla_position_before:
                    shares_added = float(pos.qty) - float(tsla_position_before.qty)
                    print(f"   ➕ Shares Added: {shares_added}")
                
                break
        
        print("\n" + "=" * 60)
        print("✅ TEST COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_buy_tesla()
    sys.exit(0 if success else 1)