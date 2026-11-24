/**
 * Interview AI — CodeSandbox Component
 *
 * A lightweight in-browser code editor and execution sandbox.
 * Supports JS execution via new Function(); shows pass/fail per test case.
 * For Python / Java / C++: displays "Server execution required" message.
 *
 * Props:
 *   question    {string}   - Code question to display
 *   testCases   {Array}    - Array of { name, input, expected, fn } test descriptors
 *   language    {string}   - Default language ('javascript')
 *   onSubmit    {function} - Called with { code, language, passed, failed, timeMs }
 *   onSkip      {function} - Called when user skips the question
 */

import { useState, useRef, useCallback } from 'react';

// ------------------------------------
// PRE-BUILT TEST CASES FOR DSA QUESTIONS
// ------------------------------------

export const BUILTIN_TEST_CASES = {
  'binary-search': [
    {
      name: 'Target found in middle',
      run: (fn) => fn([1, 3, 5, 7, 9], 5) === 2,
      display: 'binarySearch([1,3,5,7,9], 5) → 2'
    },
    {
      name: 'Target at start',
      run: (fn) => fn([1, 3, 5, 7, 9], 1) === 0,
      display: 'binarySearch([1,3,5,7,9], 1) → 0'
    },
    {
      name: 'Target at end',
      run: (fn) => fn([1, 3, 5, 7, 9], 9) === 4,
      display: 'binarySearch([1,3,5,7,9], 9) → 4'
    },
    {
      name: 'Target not found',
      run: (fn) => fn([1, 3, 5, 7, 9], 4) === -1,
      display: 'binarySearch([1,3,5,7,9], 4) → -1'
    }
  ],
  'linked-list-reversal': [
    {
      name: 'Reverse [1,2,3]',
      run: (fn) => {
        const result = fn([1, 2, 3]);
        return JSON.stringify(result) === '[3,2,1]';
      },
      display: 'reverseList([1,2,3]) → [3,2,1]'
    },
    {
      name: 'Reverse single element',
      run: (fn) => {
        const result = fn([42]);
        return JSON.stringify(result) === '[42]';
      },
      display: 'reverseList([42]) → [42]'
    },
    {
      name: 'Reverse empty list',
      run: (fn) => {
        const result = fn([]);
        return JSON.stringify(result) === '[]';
      },
      display: 'reverseList([]) → []'
    }
  ],
  'palindrome-check': [
    {
      name: '"racecar" is palindrome',
      run: (fn) => fn('racecar') === true,
      display: 'isPalindrome("racecar") → true'
    },
    {
      name: '"hello" is not palindrome',
      run: (fn) => fn('hello') === false,
      display: 'isPalindrome("hello") → false'
    },
    {
      name: 'Single char is palindrome',
      run: (fn) => fn('a') === true,
      display: 'isPalindrome("a") → true'
    },
    {
      name: 'Empty string is palindrome',
      run: (fn) => fn('') === true,
      display: 'isPalindrome("") → true'
    }
  ],
  'two-sum': [
    {
      name: 'Basic two sum',
      run: (fn) => {
        const r = fn([2, 7, 11, 15], 9);
        return (r[0] === 0 && r[1] === 1) || (r[0] === 1 && r[1] === 0);
      },
      display: 'twoSum([2,7,11,15], 9) → [0,1]'
    },
    {
      name: 'Sum with repeated numbers',
      run: (fn) => {
        const r = fn([3, 3], 6);
        return (r[0] === 0 && r[1] === 1) || (r[0] === 1 && r[1] === 0);
      },
      display: 'twoSum([3,3], 6) → [0,1]'
    },
    {
      name: 'Sum at end of array',
      run: (fn) => {
        const r = fn([1, 4, 6, 8], 14);
        return (r[0] === 2 && r[1] === 3) || (r[0] === 3 && r[1] === 2);
      },
      display: 'twoSum([1,4,6,8], 14) → [2,3]'
    }
  ]
};

// Detect which built-in test suite matches the question
function detectTestSuite(question = '') {
  const q = question.toLowerCase();
  if (q.includes('binary search')) return BUILTIN_TEST_CASES['binary-search'];
  if (q.includes('reverse') && (q.includes('linked list') || q.includes('list'))) return BUILTIN_TEST_CASES['linked-list-reversal'];
  if (q.includes('palindrome')) return BUILTIN_TEST_CASES['palindrome-check'];
  if (q.includes('two sum') || q.includes('twosum')) return BUILTIN_TEST_CASES['two-sum'];
  return null;
}

const LANGUAGES = ['javascript', 'python', 'java', 'c++'];

const STARTER_CODE = {
  javascript: `// Write your solution here
function solution(...args) {
  // Your code
}
`,
  python: `# Write your solution here
def solution(*args):
    # Your code
    pass
`,
  java: `// Write your solution here
public class Solution {
    public static Object solve(Object... args) {
        // Your code
        return null;
    }
}
`,
  'c++': `// Write your solution here
#include <iostream>
using namespace std;

// Your code here
`
};

// ------------------------------------
// MAIN COMPONENT
// ------------------------------------

export default function CodeSandbox({
  question = 'Implement binary search in JavaScript',
  testCases: propTestCases = null,
  language: defaultLang = 'javascript',
  onSubmit,
  onSkip
}) {
  const [language, setLanguage] = useState(defaultLang);
  const [code, setCode] = useState(STARTER_CODE[defaultLang] || STARTER_CODE.javascript);
  const [output, setOutput] = useState({ stdout: '', stderr: '', results: [] });
  const [isRunning, setIsRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const textareaRef = useRef(null);

  // Determine effective test cases
  const effectiveTestCases = propTestCases || detectTestSuite(question) || BUILTIN_TEST_CASES['binary-search'];

  // Handle language switch
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang] || STARTER_CODE.javascript);
    setOutput({ stdout: '', stderr: '', results: [] });
  };

  // Execute JS code safely
  const runCode = useCallback(() => {
    if (language !== 'javascript') {
      setOutput({
        stdout: '',
        stderr: 'Server execution required for ' + language + '. Only JavaScript runs in-browser.',
        results: effectiveTestCases.map(tc => ({ name: tc.name, display: tc.display, passed: null, error: 'Server required' }))
      });
      return;
    }

    setIsRunning(true);
    setOutput({ stdout: '', stderr: '', results: [] });

    // Capture console.log output
    const logs = [];
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    console.log = (...args) => { logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')); };
    console.warn = (...args) => { logs.push('[warn] ' + args.join(' ')); };
    console.error = (...args) => { logs.push('[error] ' + args.join(' ')); };

    let userFn = null;
    let stderr = '';
    const startTime = performance.now();

    try {
      // Execute user code and extract first function defined
      // eslint-disable-next-line no-new-func
      const wrapper = new Function(`
        ${code}
        // Try to find the solution function by common names
        const names = ['solution', 'binarySearch', 'reverseList', 'isPalindrome', 'twoSum', 'solve'];
        for (const name of names) {
          if (typeof eval(name) === 'function') return eval(name);
        }
        // Try to find any function defined at top level
        return null;
      `);
      userFn = wrapper();
    } catch (err) {
      stderr = `Compilation error: ${err.message}`;
    }

    // Restore console
    console.log = origLog;
    console.warn = origWarn;
    console.error = origError;

    if (stderr) {
      setIsRunning(false);
      setOutput({ stdout: logs.join('\n'), stderr, results: [] });
      return;
    }

    // Run test cases
    const results = effectiveTestCases.map(tc => {
      if (!userFn) {
        return { name: tc.name, display: tc.display, passed: false, error: 'No solution function found.' };
      }
      try {
        const passed = tc.run(userFn);
        return { name: tc.name, display: tc.display, passed: Boolean(passed), error: null };
      } catch (err) {
        return { name: tc.name, display: tc.display, passed: false, error: err.message };
      }
    });

    const timeMs = Math.round(performance.now() - startTime);

    setIsRunning(false);
    setOutput({ stdout: logs.join('\n'), stderr: '', results, timeMs });
  }, [code, language, effectiveTestCases]);

  // Submit solution
  const handleSubmit = () => {
    const passed = output.results.filter(r => r.passed).length;
    const failed = output.results.filter(r => !r.passed).length;
    setSubmitted(true);
    if (onSubmit) {
      onSubmit({ code, language, passed, failed, timeMs: output.timeMs || 0 });
    }
  };

  const passCount = output.results.filter(r => r.passed).length;
  const failCount = output.results.filter(r => r.passed === false && r.error !== 'Server required').length;

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">

      {/* ---- Question Header ---- */}
      <div className="bg-slate-800 px-5 py-4 border-b border-slate-700">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Coding Challenge</span>
            <h3 className="mt-1 text-sm font-medium text-slate-100 leading-relaxed">{question}</h3>
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              className="shrink-0 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded border border-slate-600 hover:border-slate-400"
            >
              Skip →
            </button>
          )}
        </div>
      </div>

      {/* ---- Toolbar ---- */}
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-3 flex-wrap">
        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-900 rounded-md border border-slate-600 overflow-hidden">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1 text-xs font-mono transition-colors capitalize ${
                language === lang
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {lang === 'javascript' ? 'JS' : lang === 'c++' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Run button */}
        <button
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
        >
          {isRunning ? (
            <span className="animate-pulse">Running…</span>
          ) : (
            <>▶ Run</>
          )}
        </button>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitted || output.results.length === 0}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md transition-colors"
        >
          {submitted ? '✓ Submitted' : 'Submit'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ---- Code Editor ---- */}
        <div className="flex-1 flex flex-col min-w-0">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-slate-950 font-mono text-sm text-green-300 p-4 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed tab-size-2"
            style={{ minHeight: '200px' }}
            onKeyDown={(e) => {
              // Tab key inserts spaces instead of leaving focus
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                const newCode = code.substring(0, start) + '  ' + code.substring(end);
                setCode(newCode);
                setTimeout(() => {
                  textareaRef.current.selectionStart = start + 2;
                  textareaRef.current.selectionEnd = start + 2;
                }, 0);
              }
            }}
          />

          {/* ---- Output Panel ---- */}
          <div className="bg-slate-900 border-t border-slate-700 p-3" style={{ minHeight: '80px', maxHeight: '160px', overflowY: 'auto' }}>
            <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Output</div>
            {output.stdout && (
              <pre className="font-mono text-xs text-green-300 whitespace-pre-wrap mb-1">{output.stdout}</pre>
            )}
            {output.stderr && (
              <pre className="font-mono text-xs text-red-400 whitespace-pre-wrap">{output.stderr}</pre>
            )}
            {!output.stdout && !output.stderr && output.results.length === 0 && (
              <span className="text-slate-500 text-xs italic">Click ▶ Run to execute your code.</span>
            )}
            {language !== 'javascript' && (
              <div className="mt-1 text-xs text-amber-400">
                ⚠ Server-side execution required for {language}. Run locally or use a backend executor.
              </div>
            )}
          </div>
        </div>

        {/* ---- Test Cases Panel ---- */}
        <div className="w-56 bg-slate-900 border-l border-slate-700 flex flex-col">
          <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Test Cases</span>
            {output.results.length > 0 && (
              <span className="text-xs font-mono">
                <span className="text-emerald-400">{passCount}✓</span>
                {failCount > 0 && <span className="text-red-400 ml-1">{failCount}✗</span>}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {effectiveTestCases.map((tc, idx) => {
              const result = output.results[idx];
              const status = result
                ? result.error === 'Server required'
                  ? 'server'
                  : result.passed
                    ? 'pass'
                    : 'fail'
                : 'pending';

              return (
                <div
                  key={idx}
                  className={`rounded-md px-2 py-1.5 text-xs border transition-colors ${
                    status === 'pass'
                      ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300'
                      : status === 'fail'
                        ? 'bg-red-900/30 border-red-700/50 text-red-300'
                        : status === 'server'
                          ? 'bg-amber-900/20 border-amber-700/40 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span>
                      {status === 'pass' ? '✅' : status === 'fail' ? '❌' : status === 'server' ? '🔒' : '⬜'}
                    </span>
                    <span className="font-medium truncate">{tc.name}</span>
                  </div>
                  {tc.display && (
                    <div className="font-mono text-[10px] opacity-70 truncate">{tc.display}</div>
                  )}
                  {result?.error && result.error !== 'Server required' && (
                    <div className="mt-0.5 text-[10px] text-red-400 opacity-80 truncate" title={result.error}>
                      {result.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {output.timeMs != null && output.results.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-700 text-xs text-slate-500 font-mono">
              Executed in {output.timeMs}ms
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
