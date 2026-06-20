import { useState } from 'react';
import Sidebar from './components/Sidebar';
import HttpxParser from './components/HttpxParser';
import SubdomainEnum from './components/SubdomainEnum';
import UrlsCrawling from './components/UrlsCrawling';
import JSAnalyzer from './components/JSAnalyzer';
import PortDnsInfo from './components/PortDnsInfo';
import DorkGenerator from './components/DorkGenerator';
import PayloadGen from './components/PayloadGen';
import { Target, Shield, HelpCircle, Activity, ChevronRight, Layers, Globe, Code2 } from 'lucide-react';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [globalTarget, setGlobalTarget] = useState('infomaniak.com');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <div className="animate-slide-in">
            <div className="page-header">
              <div>
                <h1 className="page-title">Quick Recon Dashboard</h1>
                <p className="page-subtitle">Welcome to your custom localized Bug Bounty Reconnaissance dashboard</p>
              </div>
            </div>

            {/* Dashboard summary cards */}
            <div className="dashboard-grid">
              <div className="glass glass-interactive dashboard-card">
                <div className="card-top">
                  <div className="card-icon-wrapper purple">
                    <Layers size={22} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-purple)', fontWeight: 700, textTransform: 'uppercase' }}>Scope Hunt</span>
                </div>
                <div>
                  <h3 className="card-title">Subdomain Enumeration</h3>
                  <p className="card-desc">Generate passive and active discovery pipelines using Subfinder, Assetfinder, and DNS Resolving.</p>
                </div>
                <button className="card-action-btn" onClick={() => setCurrentTab('subdomain')}>
                  Configure pipelines <ChevronRight size={14} />
                </button>
              </div>

              <div className="glass glass-interactive dashboard-card">
                <div className="card-top">
                  <div className="card-icon-wrapper cyan">
                    <Activity size={22} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>Log Parsing</span>
                </div>
                <div>
                  <h3 className="card-title">HTTPX Parser</h3>
                  <p className="card-desc">Import and parse live_hosts_info.txt log files. Sort by HTTP status codes and search technology stack.</p>
                </div>
                <button className="card-action-btn" onClick={() => setCurrentTab('httpx-parser')}>
                  Analyze logs <ChevronRight size={14} />
                </button>
              </div>

              <div className="glass glass-interactive dashboard-card">
                <div className="card-top">
                  <div className="card-icon-wrapper emerald">
                    <Code2 size={22} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>Source Scan</span>
                </div>
                <div>
                  <h3 className="card-title">JS Static Analyzer</h3>
                  <p className="card-desc">Perform offline in-browser audits of JavaScript source code to extract routes, APIs, and secrets.</p>
                </div>
                <button className="card-action-btn" onClick={() => setCurrentTab('js-analyzer')}>
                  Scan javascript <ChevronRight size={14} />
                </button>
              </div>

              <div className="glass glass-interactive dashboard-card">
                <div className="card-top">
                  <div className="card-icon-wrapper amber">
                    <Globe size={22} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-amber)', fontWeight: 700, textTransform: 'uppercase' }}>Index search</span>
                </div>
                <div>
                  <h3 className="card-title">Google & Shodan Dorks</h3>
                  <p className="card-desc">Generate advanced search dorks to scan indexes for exposed directories and database backups.</p>
                </div>
                <button className="card-action-btn" onClick={() => setCurrentTab('dorks')}>
                  Generate queries <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Quick guide section */}
            <div className="glass section-card" style={{ padding: '30px' }}>
              <div className="section-card-title">
                <Shield size={18} style={{ color: 'var(--color-purple)' }} />
                <span>Quick Recon Methodology Flow</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <p>
                  This dashboard operates entirely offline. It uses scripts and commands mapped directly from your <strong>Bug Bounty Handbook</strong>. Follow this standard sequence when targeting scopes:
                </p>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <div className="glass" style={{ flex: 1, minWidth: '220px', padding: '16px', borderLeft: '4px solid var(--color-purple)' }}>
                    <div style={{ fontWeight: 800, color: '#fff', marginBottom: '8px' }}>1. Scope Mapping</div>
                    Input your target scope in the top sync-bar. Go to <strong>Subdomain Discovery</strong> and run the passive/active oneliner pipeline.
                  </div>
                  <div className="glass" style={{ flex: 1, minWidth: '220px', padding: '16px', borderLeft: '4px solid var(--color-cyan)' }}>
                    <div style={{ fontWeight: 800, color: '#fff', marginBottom: '8px' }}>2. Live Probing</div>
                    Open the <strong>HTTPX Log Parser</strong> and drop in the output file `live_hosts_info.txt` to find web consoles, status codes, and tech info.
                  </div>
                  <div className="glass" style={{ flex: 1, minWidth: '220px', padding: '16px', borderLeft: '4px solid var(--color-emerald)' }}>
                    <div style={{ fontWeight: 800, color: '#fff', marginBottom: '8px' }}>3. Code Audit</div>
                    Collect URLs with Katana and GAU, filter JS URLs, then download and paste JS sources into <strong>JS Static Analyzer</strong> for routes and key leaks.
                  </div>
                  <div className="glass" style={{ flex: 1, minWidth: '220px', padding: '16px', borderLeft: '4px solid var(--color-amber)' }}>
                    <div style={{ fontWeight: 800, color: '#fff', marginBottom: '8px' }}>4. Attack Phase</div>
                    Extract URL query parameters with parameters script, query Google Search for database leaks, and test SQLi/LFI payloads.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'httpx-parser':
        return <HttpxParser />;
      case 'subdomain':
        return <SubdomainEnum target={globalTarget} />;
      case 'crawling':
        return <UrlsCrawling target={globalTarget} />;
      case 'js-analyzer':
        return <JSAnalyzer />;
      case 'port-dns':
        return <PortDnsInfo target={globalTarget} />;
      case 'dorks':
        return <DorkGenerator target={globalTarget} />;
      case 'payloads':
        return <PayloadGen />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="main-content">
        <header className="top-bar">
          <div className="target-sync-container">
            <span className="target-sync-label">
              <Target size={16} />
              <span>SYNC SCOPE:</span>
            </span>
            <input
              type="text"
              className="target-sync-input"
              value={globalTarget}
              onChange={(e) => setGlobalTarget(e.target.value)}
              placeholder="target.com"
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} style={{ color: 'var(--color-emerald)' }} />
              <span style={{ color: '#fff', fontWeight: 600 }}>Local Framework</span>
            </div>
            <a
              href="https://github.com/projectdiscovery"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'inherit' }}
            >
              <HelpCircle size={14} />
              <span>ProjectDiscovery Docs</span>
            </a>
          </div>
        </header>
        
        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
