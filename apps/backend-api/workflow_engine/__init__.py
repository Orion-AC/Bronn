"""
Workflow Engine Interface Layer (WEIL)

This package provides an abstraction layer between Bronn and Activepieces,
enabling future-proof upgrades and potential engine swaps.

Usage:
    from workflow_engine import get_workflow_engine
    
    engine = get_workflow_engine()
    workflows = await engine.list_workflows(project_id="...")
"""

from .interface import (
    WorkflowEngine,
    WorkflowInfo,
    WorkflowStatus,
    ExecutionInfo,
    ExecutionStatus,
)
from .activepieces_adapter import get_workflow_engine, ActivepiecesAdapter

__all__ = [
    "WorkflowEngine",
    "WorkflowInfo",
    "WorkflowStatus",
    "ExecutionInfo",
    "ExecutionStatus",
    "get_workflow_engine",
    "ActivepiecesAdapter",
]
