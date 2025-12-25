"""
Workflow Engine Interface Layer (WEIL)

This module defines the abstract interface for workflow engine operations.
Bronn backend should ONLY interact with Activepieces through this interface,
enabling future engine swaps without rewriting Bronn core code.

The adapter pattern isolates Activepieces implementation details from Bronn,
supporting the future-proof upgrade strategy.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum


class WorkflowStatus(Enum):
    """Status of a workflow."""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    DELETED = "deleted"


class ExecutionStatus(Enum):
    """Status of a workflow execution."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    TIMEOUT = "timeout"
    PAUSED = "paused"


@dataclass
class WorkflowInfo:
    """Information about a workflow."""
    id: str
    name: str
    status: WorkflowStatus
    project_id: str
    created_at: str
    updated_at: str
    folder_id: Optional[str] = None


@dataclass
class ExecutionInfo:
    """Information about a workflow execution."""
    id: str
    workflow_id: str
    status: ExecutionStatus
    started_at: str
    finished_at: Optional[str] = None
    duration_ms: Optional[int] = None
    error_message: Optional[str] = None


class WorkflowEngine(ABC):
    """
    Abstract interface for workflow engine operations.
    
    This is the contract that any workflow engine adapter must implement.
    Bronn backend interacts ONLY through this interface.
    """
    
    @abstractmethod
    async def create_workflow(
        self,
        name: str,
        project_id: str,
        trigger: Optional[Dict[str, Any]] = None,
        folder_id: Optional[str] = None,
    ) -> WorkflowInfo:
        """
        Create a new workflow.
        
        Args:
            name: Display name for the workflow
            project_id: ID of the project/workspace
            trigger: Optional trigger configuration
            folder_id: Optional folder to place the workflow in
            
        Returns:
            WorkflowInfo with the created workflow details
        """
        pass
    
    @abstractmethod
    async def get_workflow(self, workflow_id: str) -> Optional[WorkflowInfo]:
        """
        Get a workflow by ID.
        
        Args:
            workflow_id: The workflow's unique identifier
            
        Returns:
            WorkflowInfo if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def list_workflows(
        self,
        project_id: str,
        folder_id: Optional[str] = None,
        limit: int = 50,
        cursor: Optional[str] = None,
    ) -> List[WorkflowInfo]:
        """
        List workflows in a project.
        
        Args:
            project_id: ID of the project/workspace
            folder_id: Optional filter by folder
            limit: Maximum number of results
            cursor: Pagination cursor
            
        Returns:
            List of WorkflowInfo objects
        """
        pass
    
    @abstractmethod
    async def update_workflow_status(
        self,
        workflow_id: str,
        status: WorkflowStatus,
    ) -> WorkflowInfo:
        """
        Update a workflow's status (enable/disable).
        
        Args:
            workflow_id: The workflow's unique identifier
            status: New status to set
            
        Returns:
            Updated WorkflowInfo
        """
        pass
    
    @abstractmethod
    async def delete_workflow(self, workflow_id: str) -> bool:
        """
        Delete a workflow.
        
        Args:
            workflow_id: The workflow's unique identifier
            
        Returns:
            True if deleted successfully
        """
        pass
    
    @abstractmethod
    async def execute_workflow(
        self,
        workflow_id: str,
        input_data: Optional[Dict[str, Any]] = None,
    ) -> ExecutionInfo:
        """
        Trigger execution of a workflow.
        
        Args:
            workflow_id: The workflow to execute
            input_data: Optional input data for the trigger
            
        Returns:
            ExecutionInfo with the execution details
        """
        pass
    
    @abstractmethod
    async def get_execution_status(self, execution_id: str) -> Optional[ExecutionInfo]:
        """
        Get the status of a workflow execution.
        
        Args:
            execution_id: The execution's unique identifier
            
        Returns:
            ExecutionInfo if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def list_executions(
        self,
        workflow_id: str,
        limit: int = 50,
        cursor: Optional[str] = None,
    ) -> List[ExecutionInfo]:
        """
        List executions for a workflow.
        
        Args:
            workflow_id: The workflow to get executions for
            limit: Maximum number of results
            cursor: Pagination cursor
            
        Returns:
            List of ExecutionInfo objects
        """
        pass
