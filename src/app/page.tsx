// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

const featurePhrases = [
  "Map a cloud architecture from a prompt",
  "Visualize microservices in real time",
  "Design cloud systems with AI precision",
  "Auto-generate scalable backend blueprints",
  "Prompt → Deployable cloud infra",
  "Diagram your ideas into production-ready systems"
];

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('generating');
  const router = useRouter();
  
  // Rotating loading messages
  useEffect(() => {
    if (!isLoading) return;
    
    const messages = [
      'generating', 
      'building architecture', 
      'connecting services', 
      'optimizing design'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    console.log("Sending prompt to backend:", prompt);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.id) {
        throw new Error("Backend did not return an architecture ID.");
      }

      router.push(`/architecture/${data.id}`);
    } catch (error: any) {
      console.error("Error generating architecture:", error);
      alert(`Error: ${error.message || "Could not connect to the backend."}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with logo */}
      <header className="p-6">
        <div className="font-bold text-xl logo-text">CloudMap</div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="max-w-[1100px] w-full mx-auto flex flex-col items-center">
          {/* Div 1: Feature Button */}
          <div className="mb-8 w-full flex justify-center">
            <Button 
              variant="outline" 
              className="rounded-full bg-white border-b border-gray-200 shadow-sm text-sm font-light py-1 px-6 text-gray-800 transition-all hover:shadow-md"
            >
              <span className="mr-2 text-purple-500 font-medium">✨</span>
              Cloud architecture to CDK conversion available
            </Button>
          </div>

          {/* Div 2: Main Heading */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-4xl font-light text-gray-900 mb-4">
              What do you want to build today?
            </h1>
            
          </div>

          {/* Div 3: Input Field */}
          <div className="w-full max-w-[800px] mb-8 relative">
            <div className="input-container relative">
              <textarea
                placeholder="Describe the system you want to build on AWS..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-[320px] p-6 text-base border border-gray-200 rounded-xl focus:outline-none resize-none bg-light text-gray font-light"
                disabled={isLoading}
              />
              
              <div className="absolute bottom-4 right-4 z-10">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all bg-white shadow-sm ${
                    !prompt.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                  }`}
                  aria-label="Generate Architecture"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-black animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-black" />
                  )}
                </button>
              </div>
              
              <div className={`generate-tooltip font-light text-xs text-gray-800 ${isLoading ? 'tooltip-visible' : ''}`}>
                {loadingMessage}<span className="dot-animation"></span>
              </div>
            </div>
          </div>

          {/* Div 4: Feature Phrases - One at a time loop */}
          <div className="text-loop-container my-8 h-8 overflow-hidden text-center w-full">
            <div className="text-loop-wrapper">
              {featurePhrases.map((phrase, index) => (
                <div key={index} className="text-loop-item">
                  <p className="font-extralight text-gray-800 text-sm">{phrase}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-2">
        <div className="max-w-5xl mx-auto px-4">
          <div className="border-t border-gray-200 pt-3 mt-3">
            <p className="text-center text-gray-500 font-extralight text-sm">
              CloudMap since 2025, built by <a href="https://www.linkedin.com/in/zeradamkiflefantaye/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Zeradam Fantaye</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
