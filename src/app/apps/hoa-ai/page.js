'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '../../../components/Header';
import ReactMarkdown from 'react-markdown';

export default function HoaAi() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I&apos;m your HOA AI Assistant. I can answer questions based on your community&apos;s official HOA bylaws. I search through the actual bylaws document to provide accurate, cited answers. What would you like to know about your HOA policies and procedures?'
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentInput.trim() || isLoading) {
      return;
    }

    const userMessage = currentInput.trim();
    setCurrentInput('');
    setError('');
    
    // Add user message to conversation
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Use the new RAG endpoint
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: userMessage 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status}`);
      }

      const data = await response.json();
      
      // Format AI response with sources if available
      let assistantContent = data.response;
      
      // Add source citations if available
      if (data.sources && data.sources.length > 0) {
        const citations = data.sources
          .map(source => `Section ${source.sectionNumber}${source.sectionTitle ? ` - ${source.sectionTitle}` : ''}`)
          .join(', ');
        
        assistantContent += `\n\n**Sources:** ${citations}`;
      }
      
      // Add metadata about retrieval
      if (data.retrievedChunks > 0) {
        assistantContent += `\n\n*Based on ${data.retrievedChunks} relevant section${data.retrievedChunks === 1 ? '' : 's'} from the HOA bylaws.*`;
      }
      
      // Add AI response to conversation
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: assistantContent 
      }]);

    } catch (error) {
      setError('Failed to get response. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your HOA AI Assistant. I can help answer questions about homeowner association bylaws, policies, and procedures. What would you like to know?'
      }
    ]);
    setError('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-4xl mx-auto p-8 pt-16">
        <Header />

        {/* Main App Section */}
        <section className="bg-surface p-10 rounded-2xl shadow-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-text mb-4">
              🏠 HOA AI Assistant
            </h1>
            <p className="text-muted text-lg">
              Get answers about homeowner association bylaws and policies
            </p>
          </div>

          {/* Chat Container */}
          <div className="mb-6">
            {/* Messages Display */}
            <div className="bg-bg rounded-lg border border-border p-6 mb-4 h-96 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-accent text-white ml-4'
                          : 'bg-surface border border-border mr-4'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none prose-headings:text-text prose-strong:text-text prose-code:text-accent prose-code:bg-bg prose-code:px-1 prose-code:rounded text-text">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-surface border border-border mr-4 p-4 rounded-lg max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-muted text-sm">HOA AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about HOA bylaws, policies, or procedures..."
                  className="flex-1 p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                  rows={3}
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isLoading || !currentInput.trim()}
                    className="bg-accent text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    type="button"
                    onClick={clearConversation}
                    disabled={isLoading}
                    className="bg-border text-text px-6 py-2 rounded-lg hover:bg-surface disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>🏠 How it Works:</strong> This AI assistant searches through your actual HOA bylaws document to provide accurate, cited answers. It only uses information from the official bylaws and will tell you if something isn&apos;t covered. Responses include section numbers for easy verification. Ask specific questions for the best results!
          </p>
        </div>

        {/* Sample Questions */}
        <div className="mt-6 bg-surface rounded-lg border border-border p-6">
          <h3 className="font-semibold text-text mb-3">Sample Questions:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => setCurrentInput('What are the architectural approval requirements?')}
              className="text-left p-2 rounded hover:bg-bg border border-border text-muted hover:text-text"
              disabled={isLoading}
            >
              • What are the architectural approval requirements?
            </button>
            <button
              onClick={() => setCurrentInput('How are HOA fees calculated and collected?')}
              className="text-left p-2 rounded hover:bg-bg border border-border text-muted hover:text-text"
              disabled={isLoading}
            >
              • How are HOA fees calculated and collected?
            </button>
            <button
              onClick={() => setCurrentInput('What are the rules about parking and vehicles?')}
              className="text-left p-2 rounded hover:bg-bg border border-border text-muted hover:text-text"
              disabled={isLoading}
            >
              • What are the rules about parking and vehicles?
            </button>
            <button
              onClick={() => setCurrentInput('How do I file a complaint or violation report?')}
              className="text-left p-2 rounded hover:bg-bg border border-border text-muted hover:text-text"
              disabled={isLoading}
            >
              • How do I file a complaint or violation report?
            </button>
          </div>
        </div>

        {/* Version Footer */}
        <footer className="mt-8 text-center">
          <p className="text-muted text-xs">HOA AI Assistant v1.0</p>
        </footer>
      </div>
    </main>
  );
}