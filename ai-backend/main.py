"""
SentinelAI 4.0 - AI/ML Backend Server
FastAPI server for AI agents with PyTorch, SHAP, and Federated Learning
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, List, Optional

import torch
import numpy as np
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from agents.trader_agent import TraderAgent
from agents.compliance_agent import ComplianceAgent
from agents.supervisor_agent import SupervisorAgent
from agents.advisor_agent import AdvisorAgent
from federated_learning.fl_coordinator import FederatedLearningCoordinator
from xai.explainer import XAIExplainer
from edge_ai.optimizer import EdgeAIOptimizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global agent instances
agents: Dict[str, object] = {}
fl_coordinator: Optional[FederatedLearningCoordinator] = None
xai_explainer: Optional[XAIExplainer] = None
edge_optimizer: Optional[EdgeAIOptimizer] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize AI agents and services on startup"""
    global agents, fl_coordinator, xai_explainer, edge_optimizer
    
    logger.info("🚀 Initializing SentinelAI 4.0 AI Backend...")
    
    # Initialize AI agents
    agents = {
        "trader": TraderAgent(),
        "compliance": ComplianceAgent(),
        "supervisor": SupervisorAgent(),
        "advisor": AdvisorAgent()
    }
    
    # Initialize federated learning coordinator
    fl_coordinator = FederatedLearningCoordinator()
    
    # Initialize XAI explainer
    xai_explainer = XAIExplainer()
    
    # Initialize edge AI optimizer
    edge_optimizer = EdgeAIOptimizer()
    
    logger.info("✅ All AI services initialized successfully")
    
    yield
    
    logger.info("🔄 Shutting down AI services...")

# FastAPI app with lifespan
app = FastAPI(
    title="SentinelAI 4.0 AI Backend",
    description="AI/ML backend for privacy-first DAO treasury management",
    version="4.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://sentinelai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AgentRequest(BaseModel):
    agent_type: str
    action: str
    parameters: Dict
    treasury_data: Optional[Dict] = None

class AgentResponse(BaseModel):
    agent_type: str
    action: str
    result: Dict
    confidence: float
    xai_explanation: str
    execution_time: float

class FederatedLearningRequest(BaseModel):
    model_type: str
    training_data: List[Dict]
    privacy_budget: float = 1.0

class RiskAssessmentRequest(BaseModel):
    portfolio_data: Dict
    market_conditions: Dict
    time_horizon: int = 24  # hours

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SentinelAI 4.0 AI Backend",
        "version": "4.0.0",
        "agents_loaded": len(agents),
        "torch_version": torch.__version__,
        "cuda_available": torch.cuda.is_available()
    }

@app.post("/agents/execute", response_model=AgentResponse)
async def execute_agent(request: AgentRequest):
    """Execute an AI agent action with XAI explanation"""
    try:
        if request.agent_type not in agents:
            raise HTTPException(status_code=400, detail=f"Unknown agent type: {request.agent_type}")
        
        agent = agents[request.agent_type]
        
        # Execute agent action
        start_time = asyncio.get_event_loop().time()
        result = await agent.execute_action(request.action, request.parameters, request.treasury_data)
        execution_time = asyncio.get_event_loop().time() - start_time
        
        # Generate XAI explanation
        xai_explanation = await xai_explainer.explain_decision(
            agent_type=request.agent_type,
            action=request.action,
            parameters=request.parameters,
            result=result
        )
        
        return AgentResponse(
            agent_type=request.agent_type,
            action=request.action,
            result=result,
            confidence=result.get("confidence", 0.0),
            xai_explanation=xai_explanation,
            execution_time=execution_time
        )
        
    except Exception as e:
        logger.error(f"Agent execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")

@app.get("/agents/{agent_type}/status")
async def get_agent_status(agent_type: str):
    """Get agent status and performance metrics"""
    if agent_type not in agents:
        raise HTTPException(status_code=404, detail=f"Agent {agent_type} not found")
    
    agent = agents[agent_type]
    return await agent.get_status()

@app.post("/federated-learning/train")
async def start_federated_training(request: FederatedLearningRequest):
    """Start federated learning training round"""
    try:
        if not fl_coordinator:
            raise HTTPException(status_code=500, detail="Federated learning coordinator not initialized")
        
        training_id = await fl_coordinator.start_training_round(
            model_type=request.model_type,
            training_data=request.training_data,
            privacy_budget=request.privacy_budget
        )
        
        return {
            "training_id": training_id,
            "status": "started",
            "participants": fl_coordinator.get_participant_count(),
            "privacy_budget": request.privacy_budget
        }
        
    except Exception as e:
        logger.error(f"Federated learning failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Federated learning failed: {str(e)}")

@app.get("/federated-learning/status/{training_id}")
async def get_fl_training_status(training_id: str):
    """Get federated learning training status"""
    if not fl_coordinator:
        raise HTTPException(status_code=500, detail="Federated learning coordinator not initialized")
    
    return await fl_coordinator.get_training_status(training_id)

@app.post("/risk-assessment/analyze")
async def analyze_risk(request: RiskAssessmentRequest):
    """Perform comprehensive risk assessment using edge AI"""
    try:
        if not edge_optimizer:
            raise HTTPException(status_code=500, detail="Edge AI optimizer not initialized")
        
        # Run risk assessment
        risk_analysis = await edge_optimizer.analyze_portfolio_risk(
            portfolio_data=request.portfolio_data,
            market_conditions=request.market_conditions,
            time_horizon=request.time_horizon
        )
        
        # Generate XAI explanation for risk assessment
        xai_explanation = await xai_explainer.explain_risk_assessment(
            portfolio_data=request.portfolio_data,
            risk_analysis=risk_analysis
        )
        
        return {
            "risk_analysis": risk_analysis,
            "xai_explanation": xai_explanation,
            "recommendations": await edge_optimizer.generate_risk_recommendations(risk_analysis),
            "confidence": risk_analysis.get("confidence", 0.0)
        }
        
    except Exception as e:
        logger.error(f"Risk assessment failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Risk assessment failed: {str(e)}")

@app.post("/crisis-simulation/run")
async def run_crisis_simulation(background_tasks: BackgroundTasks):
    """Run crisis simulation scenarios"""
    try:
        advisor_agent = agents.get("advisor")
        if not advisor_agent:
            raise HTTPException(status_code=500, detail="Advisor agent not available")
        
        # Start crisis simulation in background
        simulation_id = await advisor_agent.start_crisis_simulation()
        
        return {
            "simulation_id": simulation_id,
            "status": "running",
            "scenarios": ["flash_crash", "regulatory_change", "smart_contract_exploit", "market_manipulation"]
        }
        
    except Exception as e:
        logger.error(f"Crisis simulation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Crisis simulation failed: {str(e)}")

@app.get("/edge-ai/optimize")
async def optimize_for_edge():
    """Optimize models for edge deployment"""
    try:
        if not edge_optimizer:
            raise HTTPException(status_code=500, detail="Edge AI optimizer not initialized")
        
        optimization_results = await edge_optimizer.optimize_all_models()
        
        return {
            "optimization_results": optimization_results,
            "models_optimized": len(optimization_results),
            "average_speedup": np.mean([r["speedup"] for r in optimization_results.values()]),
            "total_size_reduction": sum([r["size_reduction"] for r in optimization_results.values()])
        }
        
    except Exception as e:
        logger.error(f"Edge optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Edge optimization failed: {str(e)}")

@app.get("/xai/explain/{agent_type}")
async def get_xai_explanation(agent_type: str, action_id: str):
    """Get detailed XAI explanation for a specific agent action"""
    try:
        if not xai_explainer:
            raise HTTPException(status_code=500, detail="XAI explainer not initialized")
        
        explanation = await xai_explainer.get_detailed_explanation(agent_type, action_id)
        
        return {
            "agent_type": agent_type,
            "action_id": action_id,
            "explanation": explanation,
            "feature_importance": explanation.get("feature_importance", {}),
            "decision_path": explanation.get("decision_path", []),
            "confidence_intervals": explanation.get("confidence_intervals", {})
        }
        
    except Exception as e:
        logger.error(f"XAI explanation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"XAI explanation failed: {str(e)}")

@app.get("/metrics/performance")
async def get_performance_metrics():
    """Get overall AI system performance metrics"""
    try:
        metrics = {}
        
        # Collect metrics from all agents
        for agent_type, agent in agents.items():
            agent_metrics = await agent.get_performance_metrics()
            metrics[agent_type] = agent_metrics
        
        # Add system-wide metrics
        metrics["system"] = {
            "total_requests": sum([m.get("total_requests", 0) for m in metrics.values()]),
            "average_response_time": np.mean([m.get("avg_response_time", 0) for m in metrics.values()]),
            "success_rate": np.mean([m.get("success_rate", 0) for m in metrics.values()]),
            "memory_usage": torch.cuda.memory_allocated() if torch.cuda.is_available() else 0,
            "gpu_utilization": torch.cuda.utilization() if torch.cuda.is_available() else 0
        }
        
        return metrics
        
    except Exception as e:
        logger.error(f"Performance metrics failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Performance metrics failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
