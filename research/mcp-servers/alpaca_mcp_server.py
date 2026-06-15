#!/usr/bin/env python3
"""
Alpaca MCP Server - Real integration with Alpaca Trading API
"""

import asyncio
import json
import sys
import os
from typing import Any, Dict, List, Optional
import logging
from pathlib import Path
from datetime import datetime
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import (
    MarketOrderRequest, 
    LimitOrderRequest,
    GetOrdersRequest
)
from alpaca.trading.enums import OrderSide, TimeInForce, OrderType, QueryOrderStatus
from alpaca.data.live import StockDataStream
from alpaca.data.requests import StockLatestQuoteRequest
from alpaca.data import StockHistoricalDataClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

class AlpacaMCPServer:
    def __init__(self):
        self.api_key = os.getenv('ALPACA_API_KEY')
        self.secret_key = os.getenv('ALPACA_SECRET_KEY')
        self.paper_trade = os.getenv('ALPACA_PAPER_TRADE', 'True').lower() == 'true'
        
        if not self.api_key or not self.secret_key:
            logger.error("Missing Alpaca API credentials")
            sys.exit(1)
        
        # Initialize Alpaca clients
        self.trading_client = TradingClient(
            self.api_key, 
            self.secret_key, 
            paper=self.paper_trade
        )
        self.data_client = StockHistoricalDataClient(
            self.api_key,
            self.secret_key
        )
        
        logger.info(f"Alpaca MCP Server initialized (paper_trade={self.paper_trade})")

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
                                        'symbol': {'type': 'string', 'description': 'Stock symbol (e.g., TSLA)'},
                                        'side': {'type': 'string', 'enum': ['buy', 'sell']},
                                        'quantity': {'type': 'number', 'description': 'Number of shares'},
                                        'order_type': {'type': 'string', 'enum': ['market', 'limit']},
                                        'limit_price': {'type': 'number', 'description': 'Limit price (for limit orders)'}
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
                                        'status': {'type': 'string', 'enum': ['open', 'closed', 'all']},
                                        'limit': {'type': 'number'}
                                    },
                                    'required': []
                                }
                            },
                            {
                                'name': 'cancel_order',
                                'description': 'Cancel an open order',
                                'inputSchema': {
                                    'type': 'object',
                                    'properties': {
                                        'order_id': {'type': 'string', 'description': 'Order ID to cancel'}
                                    },
                                    'required': ['order_id']
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
        
        try:
            if tool_name == 'get_account_info':
                account = self.trading_client.get_account()
                return {
                    'account_id': str(account.id),
                    'cash': float(account.cash),
                    'portfolio_value': float(account.portfolio_value),
                    'buying_power': float(account.buying_power),
                    'equity': float(account.equity),
                    'status': str(account.status),
                    'pattern_day_trader': account.pattern_day_trader,
                    'trading_blocked': account.trading_blocked,
                    'account_blocked': account.account_blocked,
                    'currency': str(account.currency)
                }
            
            elif tool_name == 'get_positions':
                positions = self.trading_client.get_all_positions()
                return [
                    {
                        'symbol': str(pos.symbol),
                        'qty': float(pos.qty),
                        'side': str(pos.side),
                        'market_value': float(pos.market_value) if pos.market_value else 0,
                        'cost_basis': float(pos.cost_basis) if pos.cost_basis else 0,
                        'unrealized_pl': float(pos.unrealized_pl) if pos.unrealized_pl else 0,
                        'unrealized_plpc': float(pos.unrealized_plpc) if pos.unrealized_plpc else 0,
                        'current_price': float(pos.current_price) if pos.current_price else 0,
                        'avg_entry_price': float(pos.avg_entry_price) if pos.avg_entry_price else 0
                    }
                    for pos in positions
                ]
            
            elif tool_name == 'place_stock_order':
                symbol = arguments.get('symbol')
                side = arguments.get('side')
                quantity = arguments.get('quantity')
                order_type = arguments.get('order_type', 'market')
                limit_price = arguments.get('limit_price')
                
                # Create order request based on type
                if order_type == 'market':
                    order_request = MarketOrderRequest(
                        symbol=symbol,
                        qty=quantity,
                        side=OrderSide.BUY if side == 'buy' else OrderSide.SELL,
                        time_in_force=TimeInForce.DAY
                    )
                else:
                    if not limit_price:
                        raise ValueError("Limit price required for limit orders")
                    order_request = LimitOrderRequest(
                        symbol=symbol,
                        qty=quantity,
                        side=OrderSide.BUY if side == 'buy' else OrderSide.SELL,
                        time_in_force=TimeInForce.DAY,
                        limit_price=limit_price
                    )
                
                # Submit order
                order = self.trading_client.submit_order(order_request)
                
                return {
                    'id': str(order.id),
                    'client_order_id': str(order.client_order_id),
                    'symbol': str(order.symbol),
                    'side': str(order.side),
                    'qty': float(order.qty) if order.qty else 0,
                    'order_type': str(order.order_type),
                    'status': str(order.status),
                    'time_in_force': str(order.time_in_force),
                    'limit_price': float(order.limit_price) if hasattr(order, 'limit_price') and order.limit_price else None,
                    'submitted_at': str(order.submitted_at),
                    'filled_qty': float(order.filled_qty) if order.filled_qty else 0,
                    'filled_avg_price': float(order.filled_avg_price) if order.filled_avg_price else None
                }
            
            elif tool_name == 'get_stock_quote':
                symbol = arguments.get('symbol')
                request = StockLatestQuoteRequest(symbol_or_symbols=symbol)
                quotes = self.data_client.get_stock_latest_quote(request)
                quote = quotes[symbol]
                
                return {
                    'symbol': symbol,
                    'bid': float(quote.bid_price) if quote.bid_price else 0,
                    'ask': float(quote.ask_price) if quote.ask_price else 0,
                    'bid_size': int(quote.bid_size) if quote.bid_size else 0,
                    'ask_size': int(quote.ask_size) if quote.ask_size else 0,
                    'timestamp': str(quote.timestamp)
                }
            
            elif tool_name == 'get_orders':
                status = arguments.get('status', 'all')
                limit = arguments.get('limit', 50)
                
                request_params = GetOrdersRequest(
                    status=QueryOrderStatus.ALL if status == 'all' else 
                           QueryOrderStatus.OPEN if status == 'open' else 
                           QueryOrderStatus.CLOSED,
                    limit=limit
                )
                
                orders = self.trading_client.get_orders(request_params)
                
                return [
                    {
                        'id': str(order.id),
                        'symbol': str(order.symbol),
                        'side': str(order.side),
                        'qty': float(order.qty) if order.qty else 0,
                        'type': str(order.order_type),
                        'status': str(order.status),
                        'filled_qty': float(order.filled_qty) if order.filled_qty else 0,
                        'filled_avg_price': float(order.filled_avg_price) if order.filled_avg_price else None,
                        'submitted_at': str(order.submitted_at),
                        'filled_at': str(order.filled_at) if order.filled_at else None
                    }
                    for order in orders
                ]
            
            elif tool_name == 'cancel_order':
                order_id = arguments.get('order_id')
                self.trading_client.cancel_order_by_id(order_id)
                return {
                    'success': True,
                    'message': f'Order {order_id} cancelled successfully'
                }
            
            elif tool_name == 'get_market_clock':
                clock = self.trading_client.get_clock()
                return {
                    'is_open': clock.is_open,
                    'next_open': str(clock.next_open),
                    'next_close': str(clock.next_close),
                    'timestamp': str(clock.timestamp)
                }
            
            else:
                raise ValueError(f"Unknown tool: {tool_name}")
                
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}")
            return {
                'error': str(e),
                'tool': tool_name,
                'arguments': arguments
            }

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