import { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Settings, Shield } from 'lucide-react';

interface SubdomainEnumProps {
  target: string;
}

export default function SubdomainEnum({ target }: SubdomainEnumProps) {
  const [mode, setMode] = useState<'single' | 'file'>('single');
  const [fileName, setFileName] = useState('wildcards.txt');
  const [domainName, setDomainName] = useState(target || 'target.com');
  const [threads, setThreads] = useState(200);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const tools = [
    {
      name: 'Subfinder',
      description: 'Passive subdomain discovery tool from ProjectDiscovery',
      command: mode === 'single'
        ? `subfinder -d ${domainName} -silent | anew domains.txt`
        : `subfinder -silent -dL ${fileName} | anew domains.txt`,
    },
    {
      name: 'Assetfinder',
      description: 'Discover subdomains from various public sources (by @tomnomnom)',
      command: mode === 'single'
        ? `assetfinder --subs-only ${domainName} | anew domains.txt`
        : `while read domain; do\n  assetfinder --subs-only "$domain"\ndone < ${fileName} | anew domains.txt`,
    },
    {
      name: 'Chaos client',
      description: 'Fetch subdomains from ProjectDiscovery Chaos API',
      command: mode === 'single'
        ? `chaos -d ${domainName} -silent | anew domains.txt`
        : `chaos -dL ${fileName} -silent | anew domains.txt`,
    },
    {
      name: 'github-subdomains',
      description: 'Extract subdomains from GitHub repository sources',
      command: mode === 'single'
        ? `github-subdomains -d ${domainName} -raw | anew domains.txt`
        : `while read domain; do\n  github-subdomains -d "$domain" -raw -o /dev/stdout\ndone < ${fileName} | anew domains.txt`,
    },
    {
      name: 'crt.sh (Certificate Transparency)',
      description: 'Query certificate logs from crt.sh using curl & jq',
      command: mode === 'single'
        ? `curl -s "https://crt.sh/?q=%25.${domainName}&output=json" | jq -r '.[].name_value' 2>/dev/null | sed 's/\\*\\.//g' | tr ',' '\\n' | grep -v '^\\*' | sort -u | anew domains.txt`
        : `while read d; do\n  curl -s "https://crt.sh/?q=%25.\$d&output=json" | jq -r '.[].name_value' 2>/dev/null\ndone < ${fileName} | sed 's/\\*\\.//g' | tr ',' '\\n' | grep -v '^\\*' | sort -u | anew domains.txt`,
    },
    {
      name: 'BBOT (Bionic Boundless Organism)',
      description: 'OSINT framework for subdomain enumeration',
      command: mode === 'single'
        ? `bbot -t ${domainName} -p subdomain-enum -s -o bbot-output`
        : `bbot -t ${fileName} -p subdomain-enum -s -o bbot-output`,
    },
    {
      name: 'DNS Resolving (dnsx)',
      description: 'Validate subdomains using active DNS resolvers',
      command: `dnsx -l domains.txt -silent -a -cname -resp -o resolved.txt`,
    },
    {
      name: 'HTTP Probing (httpx)',
      description: 'Probe resolved domains for active web ports and grab full fingerprints',
      command: `httpx -l resolved.txt -silent -threads ${threads} \\\n  -follow-redirects \\\n  -status-code \\\n  -title \\\n  -tech-detect \\\n  -content-length \\\n  -web-server \\\n  -server \\\n  -ip \\\n  -cname \\\n  -location \\\n  -o live_hosts_info.txt`,
    },
  ];

  const onelinerCommand = mode === 'single'
    ? `subfinder -d ${domainName} -silent | anew domains.txt && \\
assetfinder --subs-only ${domainName} | anew domains.txt && \\
chaos -d ${domainName} -silent | anew domains.txt && \\
github-subdomains -d ${domainName} -raw | anew domains.txt && \\
curl -s "https://crt.sh/?q=%25.${domainName}&output=json" | jq -r '.[].name_value' 2>/dev/null | sed 's/\\*\\.//g' | tr ',' '\\n' | grep -v '^\\*' | anew domains.txt && \\
sort -u domains.txt -o domains.txt && \\
dnsx -l domains.txt -silent -a -cname -resp | awk '{print $1}' | sort -u > resolved.txt && \\
httpx -l resolved.txt -silent -threads ${threads} -follow-redirects -status-code -title -tech-detect -content-length -web-server -ip -cname -location | tee live_hosts_info.txt && \\
cat live_hosts_info.txt | awk '{print $1}' | sort -u | anew hosts.txt`
    : `subfinder -silent -dL ${fileName} | anew domains.txt && \\
while read domain; do assetfinder --subs-only "$domain"; done < ${fileName} | anew domains.txt && \\
chaos -dL ${fileName} -silent | anew domains.txt && \\
while read domain; do github-subdomains -d "$domain" -raw -o /dev/stdout; done < ${fileName} | anew domains.txt && \\
while read domain; do curl -s "https://crt.sh/?q=%.\$domain&output=json" | jq -r '.[].name_value' 2>/dev/null || true; done < ${fileName} | sed 's/\\*\\.//g' | tr ',' '\\n' | grep -v '^\\*' | anew domains.txt && \\
sort -u domains.txt -o domains.txt && \\
dnsx -l domains.txt -silent -a -cname -resp | awk '{print $1}' | sort -u > resolved.txt && \\
httpx -l resolved.txt -silent -threads ${threads} -follow-redirects -status-code -title -tech-detect -content-length -web-server -ip -cname -location | tee live_hosts_info.txt && \\
cat live_hosts_info.txt | awk '{print $1}' | sort -u | anew hosts.txt`;

  return (
    <div className="animate-slide-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subdomain Enumeration</h1>
          <p className="page-subtitle">Configure passive and active reconnaissance pipelines from your handbook</p>
        </div>
      </div>

      <div className="builder-layout">
        <div className="glass builder-settings-panel">
          <div className="builder-title">
            <Settings size={18} style={{ color: 'var(--color-purple)' }} />
            <span>Enum Settings</span>
          </div>

          <div className="setting-group">
            <span className="setting-label">Target Mode</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn-filter ${mode === 'single' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setMode('single')}
              >
                Single Domain
              </button>
              <button
                className={`btn-filter ${mode === 'file' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setMode('file')}
              >
                List File
              </button>
            </div>
          </div>

          {mode === 'single' ? (
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
          ) : (
            <div className="setting-group">
              <label className="setting-label">Wildcards File</label>
              <input
                type="text"
                className="setting-input"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="wildcards.txt"
              />
              <span className="help-text">Contains wildcard scope list</span>
            </div>
          )}

          <div className="setting-group">
            <label className="setting-label">HTTPX Threads</label>
            <input
              type="number"
              className="setting-input"
              value={threads}
              onChange={(e) => setThreads(parseInt(e.target.value) || 200)}
              min="10"
              max="500"
            />
            <span className="help-text">Recommended: 100-300</span>
          </div>

          <div className="glass" style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.02)', borderColor: 'rgba(6, 182, 212, 0.1)' }}>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--color-cyan)', fontSize: '13px', fontWeight: 700, marginBottom: '8px', alignItems: 'center' }}>
              <Shield size={14} />
              <span>Handbook Rules</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Outputs are designed to generate `domains.txt` (raw), `resolved.txt` (active hosts), and `live_hosts_info.txt` (full metadata).
            </p>
          </div>
        </div>

        <div className="builder-outputs-panel">
          {/* Oneliner block */}
          <div className="terminal-card" style={{ borderColor: 'var(--color-purple)' }}>
            <div className="terminal-header" style={{ background: 'rgba(168, 85, 247, 0.05)' }}>
              <div className="terminal-title" style={{ color: 'var(--color-purple)' }}>
                <Terminal size={14} />
                <span>HANDBOOK ONELINER PIPELINE</span>
              </div>
              <button
                className={`copy-btn ${copiedIndex === 99 ? 'copied' : ''}`}
                onClick={() => handleCopy(onelinerCommand, 99)}
              >
                {copiedIndex === 99 ? <Check size={14} /> : <Copy size={14} />}
                {copiedIndex === 99 ? 'Copied' : 'Copy Oneliner'}
              </button>
            </div>
            <div className="terminal-body" style={{ background: '#07080b' }}>
              <span className="terminal-code" style={{ color: '#d8b4fe' }}>
                {onelinerCommand}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '8px' }}>
            Individual Phase Commands
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
        </div>
      </div>
    </div>
  );
}
