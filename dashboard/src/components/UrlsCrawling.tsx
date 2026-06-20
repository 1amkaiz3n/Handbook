import { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Settings } from 'lucide-react';

interface UrlsCrawlingProps {
  target: string;
}

export default function UrlsCrawling({ target }: UrlsCrawlingProps) {
  const [mode, setMode] = useState<'single' | 'file'>('file');
  const [inputHost, setInputHost] = useState(target || 'target.com');
  const [hostsFile, setHostsFile] = useState('hosts.txt');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (target) {
      setInputHost(target);
    }
  }, [target]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const tools = [
    {
      name: 'Katana Crawling (Active)',
      description: 'Active crawler from ProjectDiscovery. Captures JS endpoints, XHR requests, and crawls depths.',
      command: mode === 'single'
        ? `katana -u https://${inputHost} -d 5 -js-crawl -xhr -kf all | anew urls.txt`
        : `katana -list ${hostsFile} -d 5 -js-crawl -xhr -kf all | anew urls.txt`,
    },
    {
      name: 'Waybackurls (Historical)',
      description: 'Fetch known URLs from Wayback Machine for targets.',
      command: mode === 'single'
        ? `echo "${inputHost}" | waybackurls | anew urls.txt`
        : `cat ${hostsFile} | waybackurls | anew urls.txt`,
    },
    {
      name: 'GAU - Get All URLs (Historical)',
      description: 'Fetch URLs from AlienVault, Wayback, CommonCrawl, and URLScan.',
      command: mode === 'single'
        ? `gau --providers wayback,commoncrawl,otx,urlscan https://${inputHost} | sort -u | anew urls.txt`
        : `gau --providers wayback,commoncrawl,otx,urlscan --subs < ${hostsFile} | sort -u | anew urls.txt`,
    },
    {
      name: 'Hakrawler (Hybrid)',
      description: 'Fast active crawler to gather endpoints, forms, and JS resources.',
      command: mode === 'single'
        ? `echo "${inputHost}" | hakrawler -d 3 | anew urls.txt`
        : `cat ${hostsFile} | hakrawler -d 3 | anew urls.txt`,
    },
  ];

  const processingSteps = [
    {
      name: '1. Remove Static Files (Beautifier)',
      description: 'Remove media, styling, fonts, and documents that are not relevant to endpoint audits.',
      command: `grep -Evi '\\.(png|jpg|jpeg|gif|svg|webp|ico|css|woff|woff2|ttf|eot|otf|mp4|webm|mp3|wav|pdf)$' urls.txt > urls_clean.txt`,
    },
    {
      name: '2. Extract Parameters',
      description: 'Isolate queries containing parameters for vulnerability discovery (like SQLi, XSS, LFI).',
      command: `cat urls_clean.txt | grep "=" > params.txt`,
    },
    {
      name: '3. Filter Live URLs',
      description: 'Validate active URL endpoints and display status codes using httpx.',
      command: `httpx -l urls_clean.txt -sc | tee live_urls.txt`,
    },
  ];

  return (
    <div className="animate-slide-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">URLs Crawling & Collection</h1>
          <p className="page-subtitle">Gather, deduplicate, clean, and enrich parameters for API mapping</p>
        </div>
      </div>

      <div className="builder-layout">
        <div className="glass builder-settings-panel">
          <div className="builder-title">
            <Settings size={18} style={{ color: 'var(--color-purple)' }} />
            <span>Crawler Settings</span>
          </div>

          <div className="setting-group">
            <span className="setting-label">Target Mode</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn-filter ${mode === 'single' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setMode('single')}
              >
                Single Target
              </button>
              <button
                className={`btn-filter ${mode === 'file' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setMode('file')}
              >
                Hosts List File
              </button>
            </div>
          </div>

          {mode === 'single' ? (
            <div className="setting-group">
              <label className="setting-label">Target Host</label>
              <input
                type="text"
                className="setting-input"
                value={inputHost}
                onChange={(e) => setInputHost(e.target.value)}
                placeholder="target.com"
              />
            </div>
          ) : (
            <div className="setting-group">
              <label className="setting-label">Hosts File (httpx output)</label>
              <input
                type="text"
                className="setting-input"
                value={hostsFile}
                onChange={(e) => setHostsFile(e.target.value)}
                placeholder="hosts.txt"
              />
              <span className="help-text">Typically `hosts.txt` (filtered live subdomain targets)</span>
            </div>
          )}
        </div>

        <div className="builder-outputs-panel">
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            URL Mining Commands
          </div>

          {tools.map((tool, index) => (
            <div className="terminal-card" key={index}>
              <div className="terminal-header">
                <div className="terminal-title">
                  <Terminal size={14} />
                  <span>{tool.name}</span>
                </div>
                <button
                  className={`copy-btn ${copiedIndex === index ? 'copied' : ''}`}
                  onClick={() => handleCopy(tool.command, index)}
                >
                  {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIndex === index ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="terminal-body">
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
                  {tool.description}
                </div>
                <span className="terminal-code">{tool.command}</span>
              </div>
            </div>
          ))}

          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '16px' }}>
            Post-Processing & Filtering
          </div>

          {processingSteps.map((step, index) => (
            <div className="terminal-card" key={`step-${index}`}>
              <div className="terminal-header" style={{ background: 'rgba(6, 182, 212, 0.03)' }}>
                <div className="terminal-title" style={{ color: 'var(--color-cyan)' }}>
                  <Terminal size={14} />
                  <span>{step.name}</span>
                </div>
                <button
                  className={`copy-btn ${copiedIndex === 10 + index ? 'copied' : ''}`}
                  onClick={() => handleCopy(step.command, 10 + index)}
                >
                  {copiedIndex === 10 + index ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIndex === 10 + index ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="terminal-body">
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
                  {step.description}
                </div>
                <span className="terminal-code" style={{ color: '#2dd4bf' }}>{step.command}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
