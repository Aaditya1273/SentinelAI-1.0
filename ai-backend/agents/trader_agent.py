"""
Trader Agent - AI-powered portfolio allocation and trading decisions
Uses PyTorch for deep learning models and real-time market analysis
"""

import asyncio
import logging
import time
from typing import Dict, List, Optional, Tuple
import uuid

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import yfinance as yf
import ccxt

logger = logging.getLogger(__name__)

class PortfolioNet(nn.Module):
    """Neural network for portfolio optimization"""
    
    def __init__(self, input_size: int, hidden_size: int = 128, num_assets: int = 10):
        super(PortfolioNet, self).__init__()
        self.input_size = input_size
        self.num_assets = num_assets
        
        self.feature_extractor = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        self.allocation_head = nn.Sequential(
            nn.Linear(hidden_size // 2, num_assets),
            nn.Softmax(dim=1)  # Ensure allocations sum to 1
        )
        
        self.risk_head = nn.Sequential(
            nn.Linear(hidden_size // 2, 1),
            nn.Sigmoid()  # Risk score between 0 and 1
        )
        
    def forward(self, x):
        features = self.feature_extractor(x)
        allocations = self.allocation_head(features)
        risk_score = self.risk_head(features)
        return allocations, risk_score

class TraderAgent:
    """AI Trader Agent for autonomous portfolio management"""
    
    def __init__(self):
        self.agent_id = str(uuid.uuid4())
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.performance_metrics = {
            "total_trades": 0,
            "successful_trades": 0,
            "total_pnl": 0.0,
            "sharpe_ratio": 0.0,
            "max_drawdown": 0.0,
            "avg_response_time": 0.0,
            "success_rate": 0.0,
            "total_requests": 0
        }
        self.market_data_cache = {}
        self.last_predictions = {}
        
        # Initialize model
        self._initialize_model()
        
    def _initialize_model(self):
        """Initialize the portfolio optimization neural network"""
        try:
            # Model parameters
            input_size = 50  # Market indicators, technical analysis, sentiment
            hidden_size = 128
            num_assets = 10  # Number of assets in portfolio
            
            self.model = PortfolioNet(input_size, hidden_size, num_assets)
            self.optimizer = optim.Adam(self.model.parameters(), lr=0.001)
            self.criterion = nn.MSELoss()
            
            # Load pre-trained weights if available
            try:
                checkpoint = torch.load("models/trader_agent.pth", map_location='cpu')
                self.model.load_state_dict(checkpoint['model_state_dict'])
                self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
                self.is_trained = True
                logger.info("✅ Loaded pre-trained trader model")
            except FileNotFoundError:
                logger.info("🔄 No pre-trained model found, starting fresh")
                
        except Exception as e:
            logger.error(f"Failed to initialize trader model: {str(e)}")
            
    async def execute_action(self, action: str, parameters: Dict, treasury_data: Optional[Dict] = None) -> Dict:
        """Execute trader agent action"""
        start_time = time.time()
        self.performance_metrics["total_requests"] += 1
        
        try:
            if action == "optimize_portfolio":
                result = await self._optimize_portfolio(parameters, treasury_data)
            elif action == "rebalance":
                result = await self._rebalance_portfolio(parameters, treasury_data)
            elif action == "risk_analysis":
                result = await self._analyze_risk(parameters, treasury_data)
            elif action == "yield_prediction":
                result = await self._predict_yield(parameters, treasury_data)
            elif action == "execute_trade":
                result = await self._execute_trade(parameters, treasury_data)
            else:
                raise ValueError(f"Unknown action: {action}")
                
            # Update performance metrics
            execution_time = time.time() - start_time
            self.performance_metrics["avg_response_time"] = (
                (self.performance_metrics["avg_response_time"] * (self.performance_metrics["total_requests"] - 1) + execution_time) /
                self.performance_metrics["total_requests"]
            )
            
            if result.get("success", False):
                self.performance_metrics["successful_trades"] += 1
                
            self.performance_metrics["success_rate"] = (
                self.performance_metrics["successful_trades"] / self.performance_metrics["total_requests"]
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Trader agent action failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "confidence": 0.0,
                "action": action
            }
    
    async def _optimize_portfolio(self, parameters: Dict, treasury_data: Dict) -> Dict:
        """Optimize portfolio allocation using AI model"""
        try:
            # Get market data
            market_features = await self._get_market_features(parameters.get("assets", []))
            
            # Prepare input tensor
            input_tensor = torch.FloatTensor(market_features).unsqueeze(0)
            
            # Get model predictions
            with torch.no_grad():
                allocations, risk_score = self.model(input_tensor)
                
            allocations = allocations.squeeze().numpy()
            risk_score = risk_score.item()
            
            # Calculate expected returns and volatility
            expected_returns = await self._calculate_expected_returns(parameters.get("assets", []))
            portfolio_return = np.sum(allocations * expected_returns)
            
            # Generate recommendations
            recommendations = self._generate_allocation_recommendations(
                allocations, expected_returns, risk_score
            )
            
            return {
                "success": True,
                "action": "optimize_portfolio",
                "allocations": {
                    asset: float(allocation) 
                    for asset, allocation in zip(parameters.get("assets", []), allocations)
                },
                "expected_return": float(portfolio_return),
                "risk_score": float(risk_score),
                "confidence": float(1.0 - risk_score),  # Higher confidence with lower risk
                "recommendations": recommendations,
                "rebalance_required": self._check_rebalance_needed(allocations, treasury_data)
            }
            
        except Exception as e:
            logger.error(f"Portfolio optimization failed: {str(e)}")
            return {"success": False, "error": str(e), "confidence": 0.0}
    
    async def _rebalance_portfolio(self, parameters: Dict, treasury_data: Dict) -> Dict:
        """Execute portfolio rebalancing"""
        try:
            target_allocations = parameters.get("target_allocations", {})
            current_allocations = treasury_data.get("current_allocations", {})
            total_value = treasury_data.get("total_value_usd", 0)
            
            # Calculate rebalancing trades
            trades = []
            total_trade_value = 0
            
            for asset, target_pct in target_allocations.items():
                current_pct = current_allocations.get(asset, 0)
                difference = target_pct - current_pct
                trade_value = difference * total_value
                
                if abs(trade_value) > parameters.get("min_trade_size", 1000):
                    trades.append({
                        "asset": asset,
                        "action": "buy" if trade_value > 0 else "sell",
                        "amount": abs(trade_value),
                        "current_allocation": current_pct,
                        "target_allocation": target_pct
                    })
                    total_trade_value += abs(trade_value)
            
            # Calculate gas costs and slippage
            estimated_gas = len(trades) * 0.01 * total_value  # 1% gas estimate
            estimated_slippage = total_trade_value * 0.005  # 0.5% slippage
            
            return {
                "success": True,
                "action": "rebalance",
                "trades": trades,
                "total_trades": len(trades),
                "total_trade_value": total_trade_value,
                "estimated_gas": estimated_gas,
                "estimated_slippage": estimated_slippage,
                "confidence": 0.85,
                "execution_plan": self._create_execution_plan(trades)
            }
            
        except Exception as e:
            logger.error(f"Portfolio rebalancing failed: {str(e)}")
            return {"success": False, "error": str(e), "confidence": 0.0}
    
    async def _analyze_risk(self, parameters: Dict, treasury_data: Dict) -> Dict:
        """Analyze portfolio risk using AI models"""
        try:
            assets = parameters.get("assets", [])
            time_horizon = parameters.get("time_horizon", 30)  # days
            
            # Get historical data for risk analysis
            risk_metrics = {}
            
            for asset in assets:
                # Calculate VaR, CVaR, and other risk metrics
                historical_returns = await self._get_historical_returns(asset, time_horizon * 2)
                
                if len(historical_returns) > 0:
                    var_95 = np.percentile(historical_returns, 5)
                    cvar_95 = historical_returns[historical_returns <= var_95].mean()
                    volatility = np.std(historical_returns)
                    
                    risk_metrics[asset] = {
                        "var_95": float(var_95),
                        "cvar_95": float(cvar_95),
                        "volatility": float(volatility),
                        "sharpe_ratio": float(np.mean(historical_returns) / volatility) if volatility > 0 else 0
                    }
            
            # Portfolio-level risk
            portfolio_var = self._calculate_portfolio_var(risk_metrics, treasury_data.get("current_allocations", {}))
            
            # Risk recommendations
            risk_level = "low" if portfolio_var > -0.05 else "medium" if portfolio_var > -0.10 else "high"
            
            return {
                "success": True,
                "action": "risk_analysis",
                "asset_risks": risk_metrics,
                "portfolio_var_95": float(portfolio_var),
                "risk_level": risk_level,
                "confidence": 0.90,
                "recommendations": self._generate_risk_recommendations(risk_level, risk_metrics)
            }
            
        except Exception as e:
            logger.error(f"Risk analysis failed: {str(e)}")
            return {"success": False, "error": str(e), "confidence": 0.0}
    
    async def _predict_yield(self, parameters: Dict, treasury_data: Dict) -> Dict:
        """Predict yield for different investment strategies"""
        try:
            strategies = parameters.get("strategies", ["conservative", "moderate", "aggressive"])
            time_horizon = parameters.get("time_horizon", 365)  # days
            
            predictions = {}
            
            for strategy in strategies:
                # Get strategy-specific allocations
                strategy_allocations = self._get_strategy_allocations(strategy)
                
                # Predict returns using historical data and AI model
                expected_returns = await self._calculate_expected_returns(list(strategy_allocations.keys()))
                
                # Calculate weighted portfolio return
                portfolio_return = sum(
                    allocation * expected_returns.get(asset, 0)
                    for asset, allocation in strategy_allocations.items()
                )
                
                # Annualized yield prediction
                annual_yield = portfolio_return * (365 / time_horizon)
                
                predictions[strategy] = {
                    "expected_annual_yield": float(annual_yield),
                    "allocations": strategy_allocations,
                    "confidence": 0.75,
                    "risk_adjusted_return": float(annual_yield * 0.8)  # Simplified risk adjustment
                }
            
            # Best strategy recommendation
            best_strategy = max(predictions.keys(), key=lambda s: predictions[s]["risk_adjusted_return"])
            
            return {
                "success": True,
                "action": "yield_prediction",
                "predictions": predictions,
                "recommended_strategy": best_strategy,
                "confidence": 0.80,
                "time_horizon_days": time_horizon
            }
            
        except Exception as e:
            logger.error(f"Yield prediction failed: {str(e)}")
            return {"success": False, "error": str(e), "confidence": 0.0}
    
    async def _execute_trade(self, parameters: Dict, treasury_data: Dict) -> Dict:
        """Execute a specific trade (simulation for hackathon)"""
        try:
            asset = parameters.get("asset")
            action = parameters.get("action")  # "buy" or "sell"
            amount = parameters.get("amount")
            
            # Simulate trade execution
            execution_price = await self._get_current_price(asset)
            slippage = amount * 0.001  # 0.1% slippage simulation
            gas_cost = 50  # $50 gas cost simulation
            
            executed_amount = amount - slippage
            total_cost = amount + gas_cost
            
            # Update performance metrics
            self.performance_metrics["total_trades"] += 1
            
            # Simulate success/failure (95% success rate)
            success = np.random.random() > 0.05
            
            if success:
                return {
                    "success": True,
                    "action": "execute_trade",
                    "asset": asset,
                    "trade_action": action,
                    "requested_amount": amount,
                    "executed_amount": executed_amount,
                    "execution_price": execution_price,
                    "slippage": slippage,
                    "gas_cost": gas_cost,
                    "total_cost": total_cost,
                    "confidence": 0.95,
                    "transaction_id": str(uuid.uuid4())
                }
            else:
                return {
                    "success": False,
                    "error": "Trade execution failed - insufficient liquidity",
                    "confidence": 0.0
                }
                
        except Exception as e:
            logger.error(f"Trade execution failed: {str(e)}")
            return {"success": False, "error": str(e), "confidence": 0.0}
    
    async def get_status(self) -> Dict:
        """Get trader agent status"""
        return {
            "agent_id": self.agent_id,
            "agent_type": "trader",
            "status": "active",
            "is_trained": self.is_trained,
            "model_loaded": self.model is not None,
            "performance_metrics": self.performance_metrics,
            "last_action": getattr(self, 'last_action', None),
            "capabilities": [
                "portfolio_optimization",
                "rebalancing",
                "risk_analysis",
                "yield_prediction",
                "trade_execution"
            ]
        }
    
    async def get_performance_metrics(self) -> Dict:
        """Get detailed performance metrics"""
        return self.performance_metrics
    
    # Helper methods
    async def _get_market_features(self, assets: List[str]) -> np.ndarray:
        """Get market features for AI model input"""
        # Simulate market features (in production, would fetch real data)
        features = np.random.randn(50)  # 50 features
        return features
    
    async def _calculate_expected_returns(self, assets: List[str]) -> Dict[str, float]:
        """Calculate expected returns for assets"""
        # Simulate expected returns (in production, would use real data)
        returns = {}
        for asset in assets:
            returns[asset] = np.random.normal(0.08, 0.15)  # 8% mean, 15% std
        return returns
    
    async def _get_historical_returns(self, asset: str, days: int) -> np.ndarray:
        """Get historical returns for risk analysis"""
        # Simulate historical returns
        return np.random.normal(0.0008, 0.02, days)  # Daily returns
    
    def _generate_allocation_recommendations(self, allocations: np.ndarray, expected_returns: Dict, risk_score: float) -> List[str]:
        """Generate human-readable allocation recommendations"""
        recommendations = []
        
        if risk_score > 0.7:
            recommendations.append("High risk detected - consider reducing exposure to volatile assets")
        
        max_allocation_idx = np.argmax(allocations)
        if allocations[max_allocation_idx] > 0.4:
            recommendations.append("Consider diversifying - largest allocation exceeds 40%")
        
        if len([a for a in allocations if a > 0.05]) < 3:
            recommendations.append("Portfolio may be under-diversified - consider adding more assets")
        
        return recommendations
    
    def _check_rebalance_needed(self, target_allocations: np.ndarray, treasury_data: Dict) -> bool:
        """Check if rebalancing is needed"""
        current_allocations = list(treasury_data.get("current_allocations", {}).values())
        if len(current_allocations) != len(target_allocations):
            return True
        
        # Check if any allocation differs by more than 5%
        for current, target in zip(current_allocations, target_allocations):
            if abs(current - target) > 0.05:
                return True
        
        return False
    
    def _calculate_portfolio_var(self, risk_metrics: Dict, allocations: Dict) -> float:
        """Calculate portfolio Value at Risk"""
        portfolio_var = 0
        for asset, allocation in allocations.items():
            if asset in risk_metrics:
                portfolio_var += allocation * risk_metrics[asset]["var_95"]
        return portfolio_var
    
    def _generate_risk_recommendations(self, risk_level: str, risk_metrics: Dict) -> List[str]:
        """Generate risk management recommendations"""
        recommendations = []
        
        if risk_level == "high":
            recommendations.append("Consider reducing position sizes or adding hedging instruments")
            recommendations.append("Implement stop-loss orders for high-risk positions")
        elif risk_level == "medium":
            recommendations.append("Monitor positions closely and consider partial profit-taking")
        else:
            recommendations.append("Current risk level is acceptable for the strategy")
        
        return recommendations
    
    def _get_strategy_allocations(self, strategy: str) -> Dict[str, float]:
        """Get predefined strategy allocations"""
        strategies = {
            "conservative": {"ETH": 0.3, "USDC": 0.5, "AAVE": 0.2},
            "moderate": {"ETH": 0.4, "USDC": 0.3, "AAVE": 0.2, "UNI": 0.1},
            "aggressive": {"ETH": 0.5, "AAVE": 0.3, "UNI": 0.2}
        }
        return strategies.get(strategy, strategies["moderate"])
    
    async def _get_current_price(self, asset: str) -> float:
        """Get current asset price (simulated)"""
        # Simulate current prices
        prices = {
            "ETH": 2500.0,
            "USDC": 1.0,
            "AAVE": 120.0,
            "UNI": 8.5
        }
        return prices.get(asset, 100.0)
    
    def _create_execution_plan(self, trades: List[Dict]) -> Dict:
        """Create trade execution plan"""
        return {
            "execution_order": [trade["asset"] for trade in trades],
            "estimated_time": len(trades) * 2,  # 2 minutes per trade
            "batch_size": min(3, len(trades)),  # Execute in batches of 3
            "priority": "normal"
        }
