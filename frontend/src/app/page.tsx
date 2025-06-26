'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Helper function to get the API URL based on environment
const getApiUrl = () => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // If we're on localhost, use the local API
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000/api/chat';
    }
    // In production, use relative URL (same domain)
    return '/api/chat';
  }
  // Server-side fallback
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api/chat'
    : '/api/chat';
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-resize textarea as user types
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Adjust textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const apiUrl = getApiUrl();
    console.log('Using API URL:', apiUrl); // Debug log

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developer_message: "You are a helpful AI assistant.",
          user_message: userMessage,
          api_key: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let assistantMessage = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        assistantMessage += text;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage?.role === 'assistant') {
            lastMessage.content = assistantMessage;
            return newMessages;
          } else {
            return [...newMessages, { role: 'assistant', content: assistantMessage }];
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Trigger form submission manually
      const form = e.currentTarget.closest('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  return (
    <main className="container mx-auto max-w-4xl p-4 h-screen flex flex-col">
      <header className="text-center py-6 mb-4">
        <h1 className="text-3xl font-bold text-emerald-800">
          Beyond ChatGPT - AI Engineering Bootcamp
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-800 shadow-md'
                }`}
            >
              {message.role === 'user' ? (
                message.content
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom styling for code blocks
                      code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        return !isInline ? (
                          <pre className="bg-gray-100 rounded p-3 overflow-x-auto my-3">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                            {children}
                          </code>
                        );
                      },
                      // Custom styling for links
                      a: ({ children, href }) => (
                        <a href={href} className="text-emerald-600 hover:text-emerald-800 underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      // Custom styling for lists
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 my-3">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1 my-3">
                          {children}
                        </ol>
                      ),
                      // Custom styling for headings
                      h1: ({ children }) => <h1 className="text-xl font-bold my-4 text-gray-900">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold my-3 text-gray-900">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-bold my-2 text-gray-900">{children}</h3>,
                      // Custom styling for paragraphs
                      p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
                      // Custom styling for blockquotes
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-emerald-500 pl-4 italic my-3 text-gray-700">
                          {children}
                        </blockquote>
                      ),
                      // Custom styling for tables
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-3">
                          <table className="min-w-full border border-gray-300">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-left">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-gray-300 px-3 py-2">
                          {children}
                        </td>
                      ),
                      // Custom styling for strong/bold text
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      // Custom styling for emphasis/italic text
                      em: ({ children }) => <em className="italic">{children}</em>,
                    } as Components}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-white text-gray-800 shadow-md">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                <span className="text-gray-600">Processing your request...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none min-h-[44px] max-h-[120px] overflow-y-auto"
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="h-6 w-6" />
        </button>
      </form>
    </main>
  );
}
