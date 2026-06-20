import React, { useState } from 'react';
import { Upload, Play, Copy, Check, Terminal, FileText, ShieldAlert, Sparkles, Download } from 'lucide-react';

interface AnalysisResult {
  category: string;
  items: string[];
  color: string;
  description: string;
}

export default function JSAnalyzer() {
  const [jsCode, setJsCode] = useState('');
  const [results, setResults] = useState<Record<string, AnalysisResult>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsCode(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const runAnalysis = () => {
    if (!jsCode.trim()) return;

    const code = jsCode;
    
    // 1. Endpoints
    const endpointsSet = new Set<string>();
    const endpointRegex = /(?:"|'|`)(\/(?:api|v[0-9]|graphql|occ|rest|ajax|internal|admin|test|debug|user|auth|login)[a-zA-Z0-9_.-]*(?:\/[a-zA-Z0-9_.-]*)*)(?:"|'|`)/g;
    let match;
    while ((match = endpointRegex.exec(code)) !== null) {
      if (match[1] && match[1].length > 2) {
        endpointsSet.add(match[1]);
      }
    }
    // Fallback simple path matcher
    const pathRegex = /(?:"|'|`)(\/[a-zA-Z0-9_.-]{3,}\/[a-zA-Z0-9_./-]*)(?:"|'|`)/g;
    while ((match = pathRegex.exec(code)) !== null) {
      if (match[1] && !match[1].endsWith('.js') && !match[1].endsWith('.css') && !match[1].endsWith('.png')) {
        endpointsSet.add(match[1]);
      }
    }

    // 2. URLs
    const urlsSet = new Set<string>();
    const urlRegex = /(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}[a-zA-Z0-9_.-]*(?:\/[a-zA-Z0-9_.-]*)*)/g;
    while ((match = urlRegex.exec(code)) !== null) {
      urlsSet.add(match[1]);
    }

    // 3. Sinks
    const sinksSet = new Set<string>();
    const sinkPatterns = [
      /eval\s*\(/g,
      /Function\s*\(/g,
      /innerHTML/g,
      /outerHTML/g,
      /document\.write\s*\(/g,
      /insertAdjacentHTML/g,
      /setTimeout\s*\(\s*['"`]/g,
      /setInterval\s*\(\s*['"`]/g,
      /postMessage\s*\(/g
    ];
    // Find matching lines
    const lines = code.split('\n');
    lines.forEach((line, idx) => {
      sinkPatterns.forEach((pattern) => {
        if (pattern.test(line)) {
          sinksSet.add(`Line ${idx + 1}: ${line.trim().substring(0, 100)}`);
        }
      });
    });

    // 4. Sources
    const sourcesSet = new Set<string>();
    const sourcePatterns = [
      /location\.search/g,
      /location\.hash/g,
      /document\.referrer/g,
      /window\.name/g,
      /URLSearchParams/g,
      /localStorage\.getItem/g,
      /sessionStorage\.getItem/g
    ];
    lines.forEach((line, idx) => {
      sourcePatterns.forEach((pattern) => {
        if (pattern.test(line)) {
          sourcesSet.add(`Line ${idx + 1}: ${line.trim().substring(0, 100)}`);
        }
      });
    });

    // 5. Secrets & APIs Key Leaks
    const secretsSet = new Set<string>();
    const secretKeywords = /(api_key|apikey|app_key|appkey|secret|client_secret|jwt|bearer|private_key|aws_access|session_token)/i;
    lines.forEach((line, idx) => {
      if (secretKeywords.test(line) && (line.includes('=') || line.includes(':'))) {
        secretsSet.add(`Line ${idx + 1}: ${line.trim().substring(0, 120)}`);
      }
    });

    // 6. Emails
    const emailsSet = new Set<string>();
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g;
    while ((match = emailRegex.exec(code)) !== null) {
      emailsSet.add(match[1]);
    }

    setResults({
      endpoints: {
        category: 'endpoints',
        items: Array.from(endpointsSet),
        color: 'endpoints',
        description: 'Relative API paths, routes, and GraphQL endpoints detected in JavaScript.',
      },
      urls: {
        category: 'urls',
        items: Array.from(urlsSet),
        color: 'requests',
        description: 'Absolute URLs and external HTTP references discovered.',
      },
      sinks: {
        category: 'sinks',
        items: Array.from(sinksSet),
        color: 'sinks',
        description: 'Execution sinks that can lead to DOM XSS (eval, innerHTML, write).',
      },
      sources: {
        category: 'sources',
        items: Array.from(sourcesSet),
        color: 'sources',
        description: 'DOM sources providing controllable inputs (location.search, referrer).',
      },
      secrets: {
        category: 'secrets',
        items: Array.from(secretsSet),
        color: 'secrets',
        description: 'Potential config keys, env variables, or hardcoded secrets.',
      },
      emails: {
        category: 'emails',
        items: Array.from(emailsSet),
        color: 'requests',
        description: 'Email addresses found within the source code.',
      },
    });
  };

  const downloadResults = () => {
    let output = '=== JAVASCRIPT RECON ANALYSIS REPORT ===\n\n';
    Object.entries(results).forEach(([key, val]) => {
      output += `\n[+] ${key.toUpperCase()} (${val.items.length} items):\n`;
      val.items.forEach((item) => {
        output += `  - ${item}\n`;
      });
    });

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'js_static_analysis_report.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Commands from user's handbook
  const handbookCommands = [
    {
      name: 'Katana JS Crawling',
      description: 'Active JS file extraction from remote target',
      command: `katana -u https://target.com -d 5 -jc | grep '\\.js$' | tee -a js_files.txt`,
    },
    {
      name: 'JS Secrets & API Endpoints Grep',
      description: 'Extract API routes and endpoints from beautified JS files',
      command: `grep -R -Eo '(https?://[^"\\x27 ]+|/api/[^"\\x27 ]+|graphql|/occ/|/v[0-9]/)' js/ | sort -u`,
    },
    {
      name: 'DOM XSS Source Finder',
      description: 'Scan downloaded JavaScript files for common XSS Sources (location.search, URLSearchParams)',
      command: `rg "location\\.search|URLSearchParams|document\\.referrer|window\\.name" js-download/`,
    },
    {
      name: 'DOM XSS Sink Finder',
      description: 'Scan JS files for HTML rendering sinks (innerHTML, eval, postMessage)',
      command: `rg "eval\\(|Function\\(|innerHTML|postMessage|location\\.search|URLSearchParams" js-download/`,
    },
    {
      name: 'Source-to-Sink Chain search',
      description: 'Find paths that contain both a source and a sink using ripgrep pipeline',
      command: `rg "location\\.search|URLSearchParams" js-download/ | xargs rg "innerHTML|eval\\(|Function\\("`,
    },
  ];

  return (
    <div className="animate-slide-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">JavaScript Static Analyzer</h1>
          <p className="page-subtitle">Extract API endpoints, URLs, credentials, and DOM XSS sources/sinks</p>
        </div>
        {Object.keys(results).length > 0 && (
          <button className="btn-secondary" onClick={downloadResults}>
            <Download size={16} /> Download Report
          </button>
        )}
      </div>

      <div className="analyzer-grid">
        <div className="glass section-card analyzer-input-panel">
          <div className="sidebar-logo" style={{ fontSize: '15px', marginBottom: '8px' }}>
            <Sparkles size={16} /> <span>INPUT SOURCE</span>
          </div>
          <textarea
            className="analyzer-textarea"
            placeholder="Paste raw JavaScript code here to perform offline static analysis..."
            value={jsCode}
            onChange={(e) => setJsCode(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={runAnalysis}>
              <Play size={16} /> Analyze Javascript
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('js-upload')?.click()}>
              <Upload size={16} /> Upload File
            </button>
            <input
              type="file"
              id="js-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".js"
            />
          </div>
        </div>

        <div className="glass section-card analyzer-results-panel">
          <div className="sidebar-logo" style={{ fontSize: '15px', marginBottom: '8px' }}>
            <ShieldAlert size={16} /> <span>FINDINGS SUMMARY</span>
          </div>

          {Object.keys(results).length === 0 ? (
            <div className="empty-state" style={{ height: '100%', justifyContent: 'center' }}>
              <FileText size={40} style={{ color: 'var(--text-muted)' }} />
              <p>Paste or upload a JS file and click Analyze to begin extracting data.</p>
            </div>
          ) : (
            Object.values(results).map((result, idx) => (
              <div className="result-card" key={idx}>
                <div className="result-card-header">
                  <span className={`result-badge ${result.color}`}>{result.category}</span>
                  <span className="result-count">{result.items.length} items found</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {result.description}
                </div>
                <div className="result-list">
                  {result.items.slice(0, 50).map((item, itemIdx) => (
                    <div className="result-item" key={itemIdx}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '85%' }} title={item}>
                        {item}
                      </span>
                      <button
                        className="copy-btn"
                        style={{ padding: '3px 6px', fontSize: '10px' }}
                        onClick={() => handleCopy(item, `${result.category}-${itemIdx}`)}
                      >
                        {copiedIndex === `${result.category}-${itemIdx}` ? <Check size={10} /> : <Copy size={10} />}
                      </button>
                    </div>
                  ))}
                  {result.items.length === 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                      No items detected
                    </div>
                  )}
                  {result.items.length > 50 && (
                    <div style={{ fontSize: '11px', color: 'var(--color-purple)', textAlign: 'center', fontWeight: 'bold' }}>
                      ... and {result.items.length - 50} more items (download report for all)
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '32px', marginBottom: '16px' }}>
        Handbook Command Cheat-sheet for JS Recon
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {handbookCommands.map((tool, index) => (
          <div className="terminal-card" key={`cli-${index}`}>
            <div className="terminal-header">
              <div className="terminal-title">
                <Terminal size={14} />
                <span>{tool.name}</span>
              </div>
              <button
                className={`copy-btn ${copiedText === tool.command ? 'copied' : ''}`}
                onClick={() => {
                  navigator.clipboard.writeText(tool.command);
                  setCopiedText(tool.command);
                  setTimeout(() => setCopiedText(null), 2000);
                }}
              >
                {copiedText === tool.command ? <Check size={14} /> : <Copy size={14} />}
                {copiedText === tool.command ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="terminal-body">
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {tool.description}
              </div>
              <span className="terminal-code">{tool.command}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
