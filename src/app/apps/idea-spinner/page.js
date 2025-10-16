'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function IdeaSpinner() {
  const [prompt, setPrompt] = useState(
    "Generate a creative and innovative feature idea for a personal portfolio website of a Product & Technical Program Manager. The idea should be interactive, engaging, and showcase technical skills while being useful for visitors. Keep it concise and actionable."
  );
  const [idea, setIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateIdea = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate idea');
      }

      const data = await response.json();
      setIdea(data.idea);
    } catch (error) {
      setError('Failed to generate idea. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">💡 Idea Spinner</h1>
          <p className="text-gray-600 text-lg">
            Generate creative ideas for your website using AI
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Prompt Section */}
          <div className="mb-6">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter your prompt here..."
            />
          </div>

          {/* Generate Button */}
          <div className="text-center mb-8">
            <button
              onClick={generateIdea}
              disabled={isLoading}
              className={`px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all transform ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 active:scale-95'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                '🎲 Spin for New Idea'
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Generated Idea */}
          {idea && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                💡 Generated Idea
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {idea}
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>💡 Tip:</strong> Try modifying the prompt to generate different types of ideas. 
            Be specific about what you want - features, content, design elements, or interactive components!
          </p>
        </div>
      </div>
    </div>
  );
}
