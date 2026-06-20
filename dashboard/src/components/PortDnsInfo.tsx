import { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Settings } from 'lucide-react';

interface PortDnsInfoProps {
  target: string;
}

export default function PortDnsInfo({ target }: PortDnsInfoProps) {
  const [domainName, setDomainName] = useState(target || 'target.com');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'port' | 'dns' | 'info'>('port');

  useEffect(() => {
    if (target) {
      setDomainName(target);
    }
  }, [target]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const portCommands = [
    {
      name: 'HTTPX Port Probe',
      description: 'Probe specific active web service ports using httpx (from handbook)',
      command: `httpx -l resolved.txt -ports 80,81,443,3000,5000,7001,7002,8000,8080,8443,9000 -silent`,
    },
    {
      name: 'Naabu Port Scan',
      description: 'Fast port scanning tool written in Go by ProjectDiscovery',
      command: `naabu -host ${domainName} -rate 1000 -top-ports 100 -silent`,
    },
    {
      name: 'Nmap DNS Brute Script',
      description: 'Nmap NSE script to perform DNS brute forcing on subdomains',
      command: `nmap -p 53 --script=dns-brute --script-args="dns-brute.domain=${domainName}" ${domainName}`,
    },
    {
      name: 'Nmap Banner Grabbing',
      description: 'Quick service identification and banner grab',
      command: `nmap -sV --version-intensity 5 -p 80,443,8080,8443 ${domainName}`,
    },
  ];

  const dnsCommands = [
    {
      name: 'dig MX Record Lookup',
      description: 'Flexible CLI tool for querying DNS name servers',
      command: `dig MX +noall +answer ${domainName}`,
    },
    {
      name: 'nslookup MX Query',
      description: 'Query internet name servers interactively',
      command: `nslookup -type=MX ${domainName} 8.8.8.8`,
    },
    {
      name: 'host All-records Lookup',
      description: 'Simple utility for performing DNS lookups',
      command: `host -a ${domainName}`,
    },
    {
      name: 'dnsenum Comprehensive Enum',
      description: 'DNS enumerator for lookups, zone transfers, and Google scraping',
      command: `dnsenum --enum ${domainName}`,
    },
    {
      name: 'dnsrecon DNS Bruteforce',
      description: 'DNS enumeration script that supports SRV, wildcard and cache check',
      command: `dnsrecon -f -d ${domainName}`,
    },
    {
      name: 'Knockpy Subdomain Scan',
      description: 'Bruteforce DNS records using python and wordlist',
      command: `knockpy ${domainName} --no-local`,
    },
  ];

  const infoCommands = [
    {
      name: 'whois CLI',
      description: 'Query WHOIS databases to retrieve domain owner information',
      command: `whois ${domainName}`,
    },
    {
      name: 'curl WHOIS Web scraper',
      description: 'Fetch details directly from WHOIS web services (from handbook)',
      command: `curl -s "https://www.whois.com/whois/${domainName}" | grep -E "Registrant|Organization|Expires|Name Server"`,
    },
    {
      name: 'nslookup A Record Lookup',
      description: 'Quickly resolve domain to IP address',
      command: `nslookup ${domainName}`,
    },
  ];

  const getActiveCommands = () => {
    if (activeTab === 'port') return portCommands;
    if (activeTab === 'dns') return dnsCommands;
    return infoCommands;
  };

  return (
    <div className="animate-slide-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Infrastructure & DNS Recon</h1>
          <p className="page-subtitle">Generate active port scanners, DNS enumerators, and WHOIS information queries</p>
        </div>
      </div>

      <div className="builder-layout">
        <div className="glass builder-settings-panel">
          <div className="builder-title">
            <Settings size={18} style={{ color: 'var(--color-purple)' }} />
            <span>Target Configuration</span>
          </div>

          <div className="setting-group">
            <label className="setting-label">Target Domain</label>
            <input
              type="text"
              className="setting-input"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="target.com"
            />
          </div>

          <div className="setting-group" style={{ marginTop: '12px' }}>
            <span className="setting-label">Submenu Select</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className={`btn-filter ${activeTab === 'port' ? 'active' : ''}`}
                onClick={() => setActiveTab('port')}
              >
                Port Analysis
              </button>
              <button
                className={`btn-filter ${activeTab === 'dns' ? 'active' : ''}`}
                onClick={() => setActiveTab('dns')}
              >
                DNS Lookup & Enum
              </button>
              <button
                className={`btn-filter ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                IP / Domain Info
              </button>
            </div>
          </div>
        </div>

        <div className="builder-outputs-panel">
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            {activeTab === 'port' && 'Port Scanning Commands'}
            {activeTab === 'dns' && 'DNS Recon Commands'}
            {activeTab === 'info' && 'WHOIS & Target Info Commands'}
          </div>

          {getActiveCommands().map((tool, index) => (
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
        </div>
      </div>
    </div>
  );
}
