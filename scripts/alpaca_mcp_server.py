#!/usr/bin/env python3
"""
Alpaca MCP Server - Official integration with Alpaca Trading API
This is a simplified version for integration with the Water Futures AI platform.
For the full official server, use: https://github.com/alpacahq/alpaca-mcp-server
"""

import asyncio
import json
import sys
import os
from typing import Any, Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AlpacaMCPServer:
    def __init__(self):
        self.api_key = os.getenv('ALPACA_API_KEY')
        self.secret_key = os.getenv('ALPACA_SECRET_KEY')
        self.paper_trade = os.getenv('ALPACA_PAPER_TRADE', 'True').lower() == 'true'
        self.base_url = 'https://paper-api.alpaca.markets' if self.paper_trade else 'https://api.alpaca.markets'
        
        if not self.api_key or not self.secret_key:
            logger.error("Missing Alpaca API credentials")
            sys.exit(1)

    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming MCP requests"""
        method = request.get('method')
        params = request.get('params', {})
        request_id = request.get('id')

        try:
            if method == 'initialize':
                return {
                    'jsonrpc': '2.0',
                    'id': request_id,
                    'result': {
                        'protocolVersion': '2024-11-05',
                        'capabilities': {
                            'tools': {}
                        },
                        'serverInfo': {
                            'name': 'alpaca-mcp-server',
                            'version': '1.0.0'
                        }
                    }
                }
            
            elif method == 'tools/list':
                return {
                    'jsonrpc': '2.0',
                    'id': request_id,
                    'result': {
                        'tools': [
                            {
                                'name': 'get_account_info',
                                'description': 'Get account information including balance and buying power',
                                'inputSchema': {
                                    'type': 'object',
                                    'properties': {},
                                    'required': []
                                }
                            },
                            {
                                'name': 'get_positions',
                                'description': 'Get all current positions',
                                'inputSchema': {
                                    'type': 'object',
                                    'properties': {},
                                    'required': []
                                }
                            },
                            {
                                'name': 'place_stock_order',
                                'description': 'Place a stock order',
                                'inputSchema': {
                                    'type': 'object',
                                    'properties': {
                                        'symbol': {'type': 'string'},
                                        'side': {'type': 'string', 'enum': ['buy', 'sell']},
                                        'quantity': {'type': 'number'},
                                        'order_type': {'type': 'string', 'enum': ['market', 'limit']},
                                        'limit_price': {'type': 'number'}
                                    },
                                    'required': ['symbol', 'side', 'quantity', 'order_type']
                                }
                            },
                            {
                                'name': 'get_stock_quote',
                                'description': 'Get real-time stock quote',
                                'inputSchema': {
                                    'type': 'object',
                                    'properties': {
                                        'symbol': {'type': 'string'}
                                    },
                                    'required': ['symbol']
                                }
                            },
                            {
                                'name': 'get_orders',
                                'description': 'Get order history',
                                'inputSchema': {
                                    'type': 'object',
                                    'properties': {
                                        'status': {'type': 'string'},
                                        'limit': {'type': 'number'}
                                    },
                                    'required': []
                                }
                            },
                            {
                                'name': 'get_market_clock',
                                'description': 'Get market open/close status',
                                'inputSchema': {
                                    'type': 'object',
                                    'properties': {},
                                    'required': []
                                }
                            }
                        ]
                    }
                }
            
            elif method == 'tools/call':
                tool_name = params.get('name')
                arguments = params.get('arguments', {})
                
                result = await self.execute_tool(tool_name, arguments)
                
                return {
                    'jsonrpc': '2.0',
                    'id': request_id,
                    'result': {
                        'content': [
                            {
                                'type': 'text',
                                'text': json.dumps(result, indent=2)
                            }
                        ]
                    }
                }
            
            else:
                return {
                    'jsonrpc': '2.0',
                    'id': request_id,
                    'error': {
                        'code': -32601,
                        'message': f'Method not found: {method}'
                    }
                }
                
        except Exception as e:
            logger.error(f"Error handling request: {e}")
            return {
                'jsonrpc': '2.0',
                'id': request_id,
                'error': {
                    'code': -32603,
                    'message': f'Internal error: {str(e)}'
                }
            }

    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """Execute the specified tool with given arguments"""
        
        # For now, return mock data - in production this would call actual Alpaca API
        if tool_name == 'get_account_info':
            return {
                'account_id': 'mock-account-id',
                'cash': 100000.0,
                'portfolio_value': 100000.0,
                'buying_power': 200000.0,
                'equity': 100000.0,
                'status': 'ACTIVE',
                'pattern_day_trader': False
            }
        
        elif tool_name == 'get_positions':
            return []  # No positions for demo
        
        elif tool_name == 'place_stock_order':
            return {
                'id': 'mock-order-id',
                'symbol': arguments.get('symbol'),
                'side': arguments.get('side'),
                'quantity': arguments.get('quantity'),
                'order_type': arguments.get('order_type'),
                'status': 'accepted',
                'submitted_at': '2024-01-01T12:00:00Z'
            }
        
        elif tool_name == 'get_stock_quote':
            symbol = arguments.get('symbol', 'UNKNOWN')
            return {
                'symbol': symbol,
                'bid': 150.25,
                'ask': 150.30,
                'last': 150.28,
                'timestamp': '2024-01-01T12:00:00Z'
            }
        
        elif tool_name == 'get_orders':
            return []  # No orders for demo
        
        elif tool_name == 'get_market_clock':
            return {
                'is_open': True,
                'next_open': '2024-01-02T09:30:00-05:00',
                'next_close': '2024-01-01T16:00:00-05:00'
            }
        
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    async def run(self):
        """Main server loop"""
        logger.info("Starting Alpaca MCP Server...")
        
        while True:
            try:
                line = await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)
                if not line:
                    break
                
                line = line.strip()
                if not line:
                    continue
                
                request = json.loads(line)
                response = await self.handle_request(request)
                
                print(json.dumps(response), flush=True)
                
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON: {e}")
            except Exception as e:
                logger.error(f"Server error: {e}")
                break

if __name__ == '__main__':
    server = AlpacaMCPServer()
    asyncio.run(server.run())
