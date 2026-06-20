import { useState, useEffect } from 'react';
import { Copy, Check, Terminal, ExternalLink, Globe, Cpu } from 'lucide-react';

interface DorkGeneratorProps {
  target: string;
}

export default function DorkGenerator({ target }: DorkGeneratorProps) {
  const [domain, setDomain] = useState(target || 'target.com');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  useEffect(() => {
    if (target) {
      setDomain(target);
    }
  }, [target]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const googleDorks = [
    {
      name: 'Sensitive File Extensions (From Handbook)',
      query: `site:*.${domain} (ext:doc OR ext:docx OR ext:odt OR ext:pdf OR ext:rtf OR ext:ppt OR ext:pptx OR ext:csv OR ext:xls OR ext:xlsx OR ext:txt OR ext:xml OR ext:json OR ext:zip OR ext:rar OR ext:md OR ext:log OR ext:bak OR ext:conf OR ext:sql)`,
      description: 'Find exposed documents, configurations, logs, databases, and archives on target subdomains.',
    },
    {
      name: 'Directory Listings (Index of)',
      query: `site:*.${domain} intitle:"index of" OR intitle:"index.of" OR "parent directory"`,
      description: 'Scan for server directories with directory listing enabled, leaking sensitive source files.',
    },
    {
      name: 'Exposed Configuration & Environment Files',
      query: `site:*.${domain} inurl:.env OR inurl:wp-config.php OR inurl:composer.json OR inurl:package.json OR inurl:docker-compose.yml`,
      description: 'Search for server config files containing passwords, APIs, or database credentials.',
    },
    {
      name: 'Redirect Parameters (Open Redirect Targets)',
      query: `site:*.${domain} inurl:url= OR inurl:redirect= OR inurl:redirectUrl= OR inurl:dest= OR inurl:destination= OR inurl:next= OR inurl:continue=`,
      description: 'Find URL parameters matching typical redirection parameters, potential Open Redirect vulnerabilities.',
    },
    {
      name: 'WordPress Sensitive Paths',
      query: `site:*.${domain} inurl:wp-content OR inurl:wp-includes OR inurl:wp-config OR inurl:wp-admin`,
      description: 'Find WordPress assets, backups, plugin upload directories, or login pages.',
    },
    {
      name: 'Exposed Database & Backup Files',
      query: `site:*.${domain} (ext:sql OR ext:db OR ext:sqlite OR ext:bak OR ext:backup OR ext:old)`,
      description: 'Locate raw database dumps or temporary backup files left on target servers.',
    },
    {
      name: 'Login & Panel Access Points',
      query: `site:*.${domain} inurl:login OR inurl:signin OR inurl:admin OR inurl:portal OR inurl:dashboard OR intitle:"login"`,
      description: 'Discover authentication portals, control dashboards, or employee login endpoints.',
    },
  ];

  const shodanDorks = [
    {
      name: 'SSL Certificate Wildcard Match',
      query: `ssl:"*.${domain}"`,
      description: 'Identify all internet-facing servers with SSL certificates issued to target subdomain wildcards.',
    },
    {
      name: 'SSL Common Name (CN)',
      query: `ssl.cn:"*.${domain}"`,
      description: 'Search specifically for servers using the target domain name in their certificate Common Name (CN).',
    },
    {
      name: 'HTTP Header matches',
      query: `http.html:"${domain}" OR http.title:"${domain}"`,
      description: 'Look for servers containing the domain name in their HTML body text or HTML title tags.',
    },
    {
      name: 'Host Organization scope',
      query: `org:"${domain.split('.')[0]}"`,
      description: 'Query servers belonging to ASNs and network ranges registered under the target organization name.',
    },
  ];

  return (
    <div className="animate-slide-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Google & Shodan Dork Generator</h1>
          <p className="page-subtitle">Formulate search operators and Shodan queries to hunt for asset leaks and open panels</p>
        </div>
      </div>

      <div className="builder-layout">
        <div className="glass builder-settings-panel">
          <div className="builder-title">
            <Globe size={18} style={{ color: 'var(--color-purple)' }} />
            <span>Dork Scope</span>
          </div>

          <div className="setting-group">
            <label className="setting-label">Domain Name</label>
            <input
              type="text"
              className="setting-input"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="target.com"
            />
            <span className="help-text">Input domain name without subdomains (e.g. infomaniak.com)</span>
          </div>
        </div>

        <div className="builder-outputs-panel">
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={16} style={{ color: 'var(--color-cyan)' }} />
            <span>Google Search Dorks</span>
          </div>

          {googleDorks.map((dork, index) => {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(dork.query)}`;
            return (
              <div className="terminal-card" key={`g-${index}`}>
                <div className="terminal-header">
                  <div className="terminal-title">
                    <Terminal size={14} />
                    <span>{dork.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={`copy-btn ${copiedIndex === `g-${index}` ? 'copied' : ''}`}
                      onClick={() => handleCopy(dork.query, `g-${index}`)}
                    >
                      {copiedIndex === `g-${index}` ? <Check size={14} /> : <Copy size={14} />}
                      {copiedIndex === `g-${index}` ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dork-external-link"
                      style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--color-cyan)', border: '1px solid rgba(6, 182, 212, 0.2)' }}
                    >
                      <ExternalLink size={12} /> Google Search
                    </a>
                  </div>
                </div>
                <div className="terminal-body">
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {dork.description}
                  </div>
                  <span className="terminal-code" style={{ color: '#06b6d4' }}>{dork.query}</span>
                </div>
              </div>
            );
          })}

          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} style={{ color: 'var(--color-purple)' }} />
            <span>Shodan Recon Dorks</span>
          </div>

          {shodanDorks.map((dork, index) => {
            const shodanUrl = `https://www.shodan.io/search?query=${encodeURIComponent(dork.query)}`;
            return (
              <div className="terminal-card" key={`s-${index}`}>
                <div className="terminal-header" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                  <div className="terminal-title" style={{ color: 'var(--color-purple)' }}>
                    <Terminal size={14} />
                    <span>{dork.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={`copy-btn ${copiedIndex === `s-${index}` ? 'copied' : ''}`}
                      onClick={() => handleCopy(dork.query, `s-${index}`)}
                    >
                      {copiedIndex === `s-${index}` ? <Check size={14} /> : <Copy size={14} />}
                      {copiedIndex === `s-${index}` ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={shodanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dork-external-link"
                      style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--color-purple)', border: '1px solid rgba(168, 85, 247, 0.2)' }}
                    >
                      <ExternalLink size={12} /> Shodan Search
                    </a>
                  </div>
                </div>
                <div className="terminal-body">
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {dork.description}
                  </div>
                  <span className="terminal-code" style={{ color: '#c084fc' }}>{dork.query}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
