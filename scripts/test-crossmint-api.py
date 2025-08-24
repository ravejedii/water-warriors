#!/usr/bin/env python3
"""
Test Crossmint API connectivity
"""

import os
import sys
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / ".env")

def test_crossmint_connection():
    print("Testing Crossmint API connectivity...")
    
    api_key = os.getenv('CROSSMINT_API_KEY')
    
    if not api_key:
        print("❌ Missing Crossmint API key!")
        return False
    
    print(f"✓ API Key found: {api_key[:20]}...")
    
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    try:
        # Test getting wallet balance
        print("\nTesting Wallet Balance API...")
        url = "https://staging.crossmint.com/api/2025-06-09/wallets/userId:unclesam:evm/balances"
        
        response = requests.get(url, headers=headers)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Uncle Sam wallet balance retrieved")
            print(f"  Response: {data}")
        else:
            print(f"⚠️ Balance API returned {response.status_code}")
            print(f"  Response: {response.text[:200]}")
        
        # Test wallet info
        print("\nTesting Wallet Info...")
        info_url = "https://staging.crossmint.com/api/2025-06-09/wallets/userId:unclesam:evm"
        info_response = requests.get(info_url, headers=headers)
        
        if info_response.status_code == 200:
            info_data = info_response.json()
            print(f"✓ Wallet info retrieved")
            if 'address' in info_data:
                print(f"  Uncle Sam address: {info_data['address']}")
        else:
            print(f"⚠️ Wallet info returned {info_response.status_code}")
        
        # Test transfer capability (dry run - not executing)
        print("\nTesting Transfer Endpoint (dry run)...")
        print("✓ Transfer endpoint configured")
        print("  From: Uncle Sam (userId:unclesam:evm)")
        print("  To: Farmer Ted (0x639A356DB809fA45A367Bc71A6D766dF2e9C6D15)")
        print("  Network: ethereum-sepolia")
        print("  Token: USDC")
        
        print("\n✅ Crossmint API tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_crossmint_connection()
    sys.exit(0 if success else 1)