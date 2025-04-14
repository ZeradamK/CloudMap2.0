import { NextRequest, NextResponse } from 'next/server';
import { generateArchitectureSuggestion } from '@/ai/flows/generate-architecture-suggestion';
import { architectureStore } from '../store';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { architectureId } = body;

    if (!architectureId) {
      return NextResponse.json(
        { message: 'Invalid request: architectureId is required' },
        { status: 400 }
      );
    }

    // Check if the architecture exists
    const architecture = architectureStore[architectureId];
    if (!architecture) {
      return NextResponse.json(
        { message: `Architecture with ID ${architectureId} not found` },
        { status: 404 }
      );
    }

    // Convert architecture to string representation for the AI prompt
    const architectureNodesStr = JSON.stringify(architecture.nodes, null, 2);
    const architectureEdgesStr = JSON.stringify(architecture.edges, null, 2);
    const originalPrompt = architecture.metadata?.prompt || "Unknown requirements";

    // Generate CDK code using AI
    const prompt = `
I have a cloud architecture design with the following details:

Original Requirements:
${originalPrompt}

Architecture Description:
${architecture.metadata?.rationale || "No rationale provided"}

Architecture Nodes (AWS Services):
${architectureNodesStr}

Architecture Edges (Service Connections):
${architectureEdgesStr}

Please generate complete, deployable AWS CDK code in TypeScript for this architecture. Include:
1. All necessary imports
2. Main stack definition
3. All resources as per the architecture
4. Proper connections between services
5. IAM roles and permissions
6. Security best practices
7. Comments explaining key parts of the code

Format the code for direct use in an AWS CDK project.
`;

    const result = await generateArchitectureSuggestion({
      problemStatement: prompt
    });

    // Extract CDK code from the AI response
    // In this case, we'll use the architectureSuggestion field for the CDK code
    // You might need to update the AI flow to include a dedicated cdkCode field
    let cdkCode = result.cdkCode || result.architectureSuggestion;
    
    // Update the architecture in the store with the CDK code
    architectureStore[architectureId] = {
      ...architecture,
      metadata: {
        ...architecture.metadata,
        cdkCode,
        cdkGeneratedAt: new Date().toISOString(),
      }
    };

    console.log(`Generated CDK code for architecture ID: ${architectureId}`);

    // Return the CDK code
    return NextResponse.json({
      id: architectureId,
      cdkCode
    });
  } catch (error: any) {
    console.error('Error in generate-cdk API:', error);
    return NextResponse.json(
      { message: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 