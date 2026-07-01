import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe console logger interceptor to prevent "Converting circular structure to JSON"
const safeConsoleArgs = (args: any[]): any[] => {
  return args.map(arg => {
    if (arg instanceof HTMLElement || (arg && typeof arg === 'object' && 'nodeType' in arg)) {
      return `[HTMLElement <${(arg as HTMLElement).tagName?.toLowerCase() || 'div'}>]`;
    }
    if (arg instanceof Error) {
      return arg.message || String(arg);
    }
    try {
      const cache = new Set();
      JSON.stringify(arg, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return '[Circular]';
          }
          cache.add(value);
        }
        return value;
      });
      return arg;
    } catch {
      return '[Circular Object]';
    }
  });
};

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => originalLog(...safeConsoleArgs(args));
console.error = (...args) => originalError(...safeConsoleArgs(args));
console.warn = (...args) => originalWarn(...safeConsoleArgs(args));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

