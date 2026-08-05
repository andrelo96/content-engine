'use client';
import { useState } from 'react';

export default function Home() {
  const [idea, setIdea] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleGenerate = async () => {
    if (!idea.trim() || status === 'loading') return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setErrorMessage('Too many requests — please wait a minute and try again');
        setStatus('error');
        return;
      }

      if (!response.ok) {
        setErrorMessage(data.error || 'Something went wrong — please try again');
        setStatus('error');
        return;
      }

      setStatus('success');
      setIdea('');
      setCharCount(0);

    } catch (err) {
      setErrorMessage('Network error — please check your connection and try again');
      setStatus('error');
    }
  };

  const handleIdeaChange = (e) => {
    setIdea(e.target.value);
    setCharCount(e.target.value.length);
    if (status === 'error') setStatus('idle');
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Content Engine
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Type an idea. Get a full week of content filed into Notion automatically.
        </p>

        <textarea
          className="w-full border border-gray-200 rounded-xl p-4 text-gray-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="e.g. Why small businesses need a website"
          value={idea}
          onChange={handleIdeaChange}
          disabled={status === 'loading'}
          maxLength={500}
        />

        <div className="flex justify-between items-center mt-1 mb-4">
          <span className="text-xs text-gray-400">
            {charCount > 400 ? `${500 - charCount} characters remaining` : ''}
          </span>
          <span className="text-xs text-gray-400">{charCount}/500</span>
        </div>

        <button
          onClick={handleGenerate}
          disabled={status === 'loading' || !idea.trim()}
          className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'loading' ? 'Generating — this takes about 10 seconds...' : 'Generate Content'}
        </button>

        {status === 'success' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            Content generated successfully. Check your Notion calendar — three new rows have been added.
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {errorMessage}
          </div>
        )}
      </div>
    </main>
  );
}