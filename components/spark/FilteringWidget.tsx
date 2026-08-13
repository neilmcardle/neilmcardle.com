'use client';

import React, { useState } from 'react';

interface FilterStep {
  step: number,
  label: string,
  code: string,
  state?: Record<string, any>,
  highlight?: boolean,
}

const names = ['alice', 'bob', 'charlie', 'diana', 'evelyn'];

export function FilteringWidget() {
  const [query, setQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(-1);

  const getSteps = (): FilterStep[] => {
    if (!query) return [];

    const results = names.filter(name =>
      name.toLowerCase().includes(query.toLowerCase())
    );

    return [
      {
        step: 1,
        label: 'Initialize query state',
        code: `const [query, setQuery] = useState('')`,
        state: { query },
        highlight: true,
      },
      {
        step: 2,
        label: 'Get input value',
        code: `value={query}`,
        state: { query },
        highlight: true,
      },
      {
        step: 3,
        label: 'User types',
        code: `onChange={(e) => setQuery(e.target.value)}`,
        state: { query, input: query },
        highlight: true,
      },
      {
        step: 4,
        label: 'Re-render triggered',
        code: `setQuery triggers re-render`,
        state: { query },
        highlight: true,
      },
      {
        step: 5,
        label: 'Call filter method',
        code: `names.filter(...)`,
        state: { query, names },
        highlight: true,
      },
      {
        step: 6,
        label: 'Check each name',
        code: `name.toLowerCase().includes(query.toLowerCase())`,
        state: { query, names, filtered: results },
        highlight: true,
      },
      {
        step: 7,
        label: 'Build filtered array',
        code: `const filtered = ${JSON.stringify(results)}`,
        state: { query, filtered: results },
        highlight: true,
      },
      {
        step: 8,
        label: 'Return filtered array',
        code: `return filtered`,
        state: { query, filtered: results },
        highlight: true,
      },
      {
        step: 9,
        label: 'Render results',
        code: `{filtered.map(name => <li>{name}</li>)}`,
        state: { query, filtered: results },
        highlight: true,
      },
      {
        step: 10,
        label: 'Display to user',
        code: `Show ${results.length} result${results.length !== 1 ? 's' : ''}`,
        state: { query, results: results.length },
        highlight: true,
      },
    ];
  };

  const steps = getSteps();
  const results = names.filter(name =>
    name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="my-8 space-y-6 p-6 bg-gray-50 rounded-lg">
      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search names
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentStep(-1);
          }}
          placeholder="Type a name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* List */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Names</p>
        <div className="space-y-1">
          {names.map(name => (
            <div
              key={name}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                results.includes(name)
                  ? 'bg-blue-100 text-blue-900 font-medium'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Cycle steps</p>
          <div className="space-y-2">
            {steps.map((s) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step - 1)}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                  currentStep === s.step - 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500'
                }`}
              >
                <span className="font-semibold">Step {s.step}:</span> {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current step detail */}
      {currentStep >= 0 && steps[currentStep] && (
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
          <p className="text-xs font-semibold text-blue-900 mb-2">
            Step {steps[currentStep].step}, {steps[currentStep].label}
          </p>
          <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto mb-3">
            {steps[currentStep].code}
          </pre>
          {steps[currentStep].state && (
            <div className="text-xs text-blue-800 bg-white p-2 rounded border border-blue-200">
              <p className="font-semibold mb-1">State:</p>
              <code>{JSON.stringify(steps[currentStep].state, null, 2)}</code>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {query && (
        <div className="text-sm text-gray-600 p-3 bg-white rounded border border-gray-200">
          Typed: <span className="font-mono font-semibold">"{query}"</span>
          {results.length > 0 ? (
            <span>, Found: <span className="font-mono font-semibold">{results.join(', ')}</span></span>
          ) : (
            <span>, No matches</span>
          )}
        </div>
      )}
    </div>
  );
}
