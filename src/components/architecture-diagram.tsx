"use client";

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  BackgroundVariant,
  NodeMouseHandler,
  NodeProps,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css'; // Import React Flow styles

// Custom node component for AWS services
const AWSServiceNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={`p-2 ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        background: data?.style?.background || '#42a5f5',
        color: data?.style?.color || 'white',
        border: data?.style?.border || '1px solid #1976d2',
        borderRadius: '8px',
        width: data?.style?.width || 180,
        minHeight: '80px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="font-semibold text-center mb-1">{data.label}</div>
      <div className="text-xs text-center mb-2">{data.service}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

interface ArchitectureDiagramProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

export default function ArchitectureDiagram({ initialNodes = [], initialEdges = [] }: ArchitectureDiagramProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Register the custom AWS service node
  const nodeTypes = useMemo(() => ({
    awsService: AWSServiceNode
  }), []);

  // Convert standard nodes to custom AWS service nodes if needed
  const processedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      // If the node doesn't have a type, set it to the custom AWS service node
      type: node.type || 'awsService',
      // Ensure the node has a position
      position: node.position || { x: 0, y: 0 }
    }));
  }, [nodes]);

  // Handle node click to show details
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="flex h-full">
      {/* Main React Flow diagram (75% width) */}
      <div className="h-full w-3/4">
        <ReactFlow
          nodes={processedNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>

      {/* Right sidebar for node details (25% width) */}
      <div className="w-1/4 border-l border-gray-200 p-4 overflow-y-auto">
        {selectedNode ? (
          <div>
            <h3 className="text-lg font-semibold mb-2">{selectedNode.data.label}</h3>
            <div className="mb-4 bg-blue-100 px-3 py-1 rounded text-blue-800 text-sm inline-block">
              {selectedNode.data.service}
            </div>
            
            <div className="mt-2 border-t pt-2">
              <h4 className="font-medium text-sm text-gray-700 mb-1">Description</h4>
              <p className="text-sm mb-3">{selectedNode.data.description || "No description provided"}</p>
              
              <h4 className="font-medium text-sm text-gray-700 mb-1">Estimated Cost</h4>
              <p className="text-sm mb-3">{selectedNode.data.estCost || "Not specified"}</p>
              
              <h4 className="font-medium text-sm text-gray-700 mb-1">Fault Tolerance</h4>
              <p className="text-sm mb-3">{selectedNode.data.faultTolerance || "Not specified"}</p>
              
              {selectedNode.data.latency && (
                <>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Latency</h4>
                  <p className="text-sm mb-3">{selectedNode.data.latency}</p>
                </>
              )}
              
              {selectedNode.data.scalability && (
                <>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Scalability</h4>
                  <p className="text-sm mb-3">{selectedNode.data.scalability}</p>
                </>
              )}
              
              {selectedNode.data.security && (
                <>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Security</h4>
                  <p className="text-sm mb-3">{selectedNode.data.security}</p>
                </>
              )}
              
              {selectedNode.data.iamRoles && selectedNode.data.iamRoles.length > 0 && (
                <>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Required IAM Roles</h4>
                  <ul className="list-disc pl-5 text-sm mb-3">
                    {selectedNode.data.iamRoles.map((role: string, index: number) => (
                      <li key={index}>{role}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-10">
            <p>Select a service to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
