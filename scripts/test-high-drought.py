#!/usr/bin/env python3
"""
Test high drought subsidy scenario
"""

import requests
import json

# First, let's simulate setting drought to high
# In real app, this happens when user changes dropdown

print("Testing HIGH DROUGHT Subsidy Scenario")
print("=" * 50)

# Check subsidy availability
print("\n1. Checking subsidy with HIGH drought...")
response = requests.post(
    "http://localhost:3000/api/chat-simple",
    json={"message": "check drought subsidy"},
    headers={"Content-Type": "application/json"}
)

if response.status_code == 200:
    data = response.json()
    print("Response:", data['response'])
else:
    print(f"Error: {response.status_code}")

print("\n" + "=" * 50)
print("NOTE: To test high drought ($0.75):")
print("1. Open http://localhost:3000")
print("2. Go to Government Subsidy tab")
print("3. Change dropdown to 'High (75¢ subsidy)'")
print("4. Ask agent: 'check subsidy'")
print("5. Agent will show $0.75 available")
print("6. Say 'claim subsidy' to receive $0.75")