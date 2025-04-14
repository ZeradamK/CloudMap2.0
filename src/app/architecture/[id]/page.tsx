// src/app/architecture/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ArchitectureDiagram from '@/components/architecture-diagram';
import { Node, Edge } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import { useToast } from "@/hooks/use-toast"; // For error feedback
// import { Skeleton } from "@/components/ui/skeleton"; // For loading state

interface ArchitectureData {
    nodes: Node[];
    edges: Edge[];
    metadata?: {
        prompt?: string;
        rationale?: string;
        cdkCode?: string;
        [key: string]: any;
    };
}

// Custom syntax highlighter theme based on light theme
const customSyntaxTheme = {
  ...oneLight,
  'pre[class*="language-"]': {
    ...oneLight['pre[class*="language-"]'],
    background: '#f5f7ff',
    fontSize: '14px',
    lineHeight: '1.5',
    padding: '1em',
    margin: '0',
    overflow: 'auto',
    borderRadius: '0',
  },
  'code[class*="language-"]': {
    ...oneLight['code[class*="language-"]'],
    fontFamily: 'Monaco, Consolas, "Andale Mono", "Ubuntu Mono", monospace',
  },
};

export default function ArchitecturePage() {
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [architectureData, setArchitectureData] = useState<ArchitectureData | null>(null);
  const [activeTab, setActiveTab] = useState('diagram');
  // const { toast } = useToast();

  useEffect(() => {
    if (!id) {
        setError("No architecture ID provided.");
        setIsLoading(false);
        return;
    };

    const fetchArchitecture = async () => {
      setIsLoading(true);
      setError(null);
      setArchitectureData(null); // Clear previous data
      console.log(`Fetching architecture for ID: ${id}`);

      try {
        // --- Actual Backend API Call ---
        const response = await fetch(`/api/architecture/${id}`); // Target Next.js API route

        if (!response.ok) {
           const errorData = await response.json().catch(() => ({}));
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: ArchitectureData = await response.json();

        // Basic validation of received data
        if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
            throw new Error("Invalid data format received from backend.");
        }

        setArchitectureData(data);

      } catch (fetchError: any) {
        console.error("Error fetching architecture:", fetchError);
        setError(fetchError.message || 'An unknown error occurred while fetching the diagram.');
        // toast({
        //   title: "Loading Failed",
        //   description: fetchError.message || "Could not load the architecture diagram.",
        //   variant: "destructive",
        // });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchitecture();
  }, [id]); // Re-run effect if the ID changes

  const handleGenerateCdk = async () => {
    try {
      const response = await fetch('/api/generate-cdk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ architectureId: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate CDK');
      }

      const data = await response.json();
      
      // Refresh architecture data to get updated CDK code
      const refreshResponse = await fetch(`/api/architecture/${id}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setArchitectureData(refreshedData);
        
        // Switch to CDK tab
        setActiveTab('cdk');
      }
      
      alert('CDK code generated successfully!');
    } catch (error: any) {
      console.error('Error generating CDK:', error);
      alert(`Error generating CDK: ${error.message}`);
    }
  };

  const handleExportArchitecture = () => {
    if (id) {
      window.open(`/api/export-architecture/${id}`, '_blank');
    }
  };

  const handleDownloadCdk = () => {
    if (id) {
      window.open(`/api/download-cdk/${id}`, '_blank');
    }
  };

  const renderContent = () => {
    if (isLoading) {
        return ( // Example using simple text, replace with Skeleton if preferred
             <div className="p-4 w-full h-full flex items-center justify-center">
                 Loading architecture diagram...
            {/* <div className="w-full h-full p-4 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-[calc(100%-5rem)] w-full" />
            </div> */}
             </div>
        );
    }

    if (error) {
        return ( // Example using simple text, replace with Alert if preferred
            <div className="p-4 text-center text-red-600">Error: {error}</div>
            // <Alert variant="destructive" className="m-4">
            //     <AlertCircle className="h-4 w-4" />
            //     <AlertTitle>Loading Failed</AlertTitle>
            //     <AlertDescription>{error}</AlertDescription>
            // </Alert>
        );
    }

    if (!architectureData) { // Should ideally be covered by loading/error states now
       return <div className="p-4 text-center">No architecture data found.</div>;
    }

    return (
        <div className="w-full h-full p-4 flex flex-col">
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-black">AWS Cloud Architecture</h1>
                    <p className="text-sm text-gray-500">Based on: {architectureData.metadata?.prompt?.substring(0, 100)}...</p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={handleExportArchitecture} variant="outline" size="sm">
                        Export JSON
                    </Button>
                    {!architectureData.metadata?.cdkCode ? (
                        <Button onClick={handleGenerateCdk} variant="default" size="sm">
                            Generate CDK
                        </Button>
                    ) : (
                        <Button onClick={handleDownloadCdk} variant="default" size="sm">
                            Download CDK
                        </Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
                <TabsList>
                    <TabsTrigger value="diagram">Architecture Diagram</TabsTrigger>
                    <TabsTrigger value="rationale">Rationale & Documentation</TabsTrigger>
                    {architectureData.metadata?.cdkCode && (
                        <TabsTrigger value="cdk">CDK Code</TabsTrigger>
                    )}
                </TabsList>
                
                <TabsContent value="diagram" className="flex-grow overflow-hidden border rounded-md">
                    <div className="h-full">
                        <ArchitectureDiagram
                            // Ensure nodes/edges are always arrays, even if empty
                            initialNodes={architectureData.nodes ?? []}
                            initialEdges={architectureData.edges ?? []}
                        />
                    </div>
                </TabsContent>
                
                <TabsContent value="rationale" className="flex-grow border rounded-md">
                    <div className="h-full overflow-y-auto p-4">
                        <div className="prose max-w-none">
                            <h2>Architecture Rationale</h2>
                            <div dangerouslySetInnerHTML={{ 
                                __html: architectureData.metadata?.rationale 
                                    ? markdownToHtml(architectureData.metadata.rationale)
                                    : '<p>No rationale provided</p>'
                            }} />
                        </div>
                    </div>
                </TabsContent>
                
                {architectureData.metadata?.cdkCode && (
                    <TabsContent value="cdk" className="flex-grow border rounded-md">
                        <div className="h-[calc(100vh-250px)] overflow-y-auto">
                            <SyntaxHighlighter
                                language="typescript"
                                style={customSyntaxTheme}
                                showLineNumbers={true}
                                wrapLines={true}
                                lineProps={lineNumber => ({
                                    style: { 
                                        display: 'block',
                                        backgroundColor: lineNumber % 2 === 0 ? '#f8fafd' : 'transparent',
                                    },
                                    // Add hover effect through className (defined in global CSS)
                                    className: 'syntax-line'
                                })}
                            >
                                {architectureData.metadata.cdkCode}
                            </SyntaxHighlighter>
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
   };


  return (
    <div className="flex h-screen bg-white">
        {/* TODO: Adjustment Sidebar */} 
        <main className="flex-1 overflow-hidden"> {/* Main area takes remaining space */} 
            {renderContent()}
        </main>
    </div>
  );
}

// Simple function to convert markdown to HTML
function markdownToHtml(markdown: string): string {
    return markdown
        // Convert headers
        .replace(/## (.*)/g, '<h2>$1</h2>')
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/#### (.*)/g, '<h4>$1</h4>')
        // Convert lists
        .replace(/\n- (.*)/g, '\n<li>$1</li>')
        .replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>')
        // Convert paragraphs
        .replace(/([^\n]+)\n\n/g, '<p>$1</p>')
        // Convert code blocks
        .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
        // Convert inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Convert emphasis
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Convert line breaks
        .replace(/\n/g, '<br>');
}
