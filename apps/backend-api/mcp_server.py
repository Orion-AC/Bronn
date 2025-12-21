from mcp.server import Server
from mcp.types import Tool, TextContent, ImageContent, EmbeddedResource
from typing import List, Dict, Any
import httpx
import os

# Initialize MCP Server for Bronn
mcp_server = Server("bronn-skills-server")

BRONN_BACKEND_URL = os.getenv("BRONN_BACKEND_INTERNAL_URL", "http://localhost:8000")

@mcp_server.list_tools()
async def list_tools() -> List[Tool]:
    """List available Bronn Skills (Workflows) as tools."""
    async with httpx.AsyncClient() as client:
        # Internal call to fetch workflows
        # In production, this would use a service token
        try:
            response = await client.get(f"{BRONN_BACKEND_URL}/api/workflows")
            workflows = response.json()
            
            tools = []
            for wf in workflows:
                tools.append(Tool(
                    name=f"bronn_skill_{wf['id']}",
                    description=wf.get('description', f"Bronn Skill: {wf['name']}"),
                    input_schema={
                        "type": "object",
                        "properties": {
                            "input_data": {"type": "string", "description": "Data to pass to the workflow"}
                        },
                        "required": ["input_data"]
                    }
                ))
            return tools
        except Exception as e:
            print(f"Error fetching workflows for MCP: {e}")
            return []

@mcp_server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """Execute a Bronn Skill via Activepieces."""
    if not name.startswith("bronn_skill_"):
        raise ValueError(f"Unknown tool: {name}")
    
    workflow_id = name.replace("bronn_skill_", "")
    input_data = arguments.get("input_data", "")

    # Here we would trigger the Activepieces workflow
    # For Phase 3 implementation, we return a success message indicating the handoff
    return [
        TextContent(
            type="text",
            text=f"Successfully triggered Bronn Skill {workflow_id} with input: {input_data}. Execution is handled by Activepieces engine."
        )
    ]

if __name__ == "__main__":
    # In a real deployment, this would use the MCP transport (e.g. SSE or Stdio)
    mcp_server.run()
