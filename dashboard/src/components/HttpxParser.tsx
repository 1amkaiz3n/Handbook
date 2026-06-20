import React, { useState } from 'react';
import { Upload, Search, Download, Trash2, SlidersHorizontal, AlertCircle } from 'lucide-react';

interface HttpxRecord {
  url: string;
  status: string;
  length: string;
  title: string;
  ip: string;
  cname: string;
  redirect: string;
  techs: string[];
  raw: string;
}

export default function HttpxParser() {
  const [inputText, setInputText] = useState('');
  const [records, setRecords] = useState<HttpxRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<keyof HttpxRecord>('url');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const parseData = (text: string) => {
    const lines = text.split('\n');
    const parsed: HttpxRecord[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const urlMatch = trimmed.match(/^(https?:\/\/[^\s]+)/);
      if (!urlMatch) return;
      const url = urlMatch[1];

      const brackets: string[] = [];
      let match;
      const regex = /\[(.*?)\]/g;
      const lineRest = trimmed.substring(url.length);
      while ((match = regex.exec(lineRest)) !== null) {
        brackets.push(match[1].trim());
      }

      let status = '';
      let length = '';
      let title = '';
      let ip = '';
      let cname = '';
      let redirect = '';
      let techs: string[] = [];

      brackets.forEach((val) => {
        if (!val) return;

        // If it's a list of 3-digit status codes, e.g. 301,301,302,200
        if (/^\d{3}(,\d{3})*$/.test(val)) {
          status = val;
        } else if (/^\d+$/.test(val) && !status) {
          status = val; // fallback
        } else if (/^\d+$/.test(val)) {
          length = val;
        } else if (/^(https?:\/\/)/.test(val)) {
          redirect = val;
        } else if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(val)) {
          ip = val;
        } else if (val.includes(',') || /^(Bootstrap|Google|React|Apache|Nginx|Cloudflare|HSTS|HTTP|Amazon|Gatsby|Jquery|Matter|Inertia|Webpack|Modernizr|WOW)/i.test(val)) {
          const splitTechs = val.split(',').map((t) => t.trim()).filter(Boolean);
          if (splitTechs.length > 0) {
            techs = [...techs, ...splitTechs];
          }
        } else if (val.includes('.') && !val.includes(' ') && !val.includes(',')) {
          cname = val;
        } else {
          title = val;
        }
      });

      // Strict index fallback if heuristics missed items
      if (!status && brackets[0]) status = brackets[0];
      if (!length && brackets[2] && /^\d+$/.test(brackets[2])) length = brackets[2];
      if (!title && brackets[3] && !/^\d+$/.test(brackets[3]) && !brackets[3].includes('.')) title = brackets[3];
      if (!ip && brackets[5] && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(brackets[5])) ip = brackets[5];

      parsed.push({
        url,
        status: status || 'unknown',
        length: length || '0',
        title: title || '-',
        ip: ip || '-',
        cname: cname || '-',
        redirect: redirect || '-',
        techs: techs.length ? Array.from(new Set(techs)) : [],
        raw: trimmed,
      });
    });

    setRecords(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      parseData(text);
    };
    reader.readAsText(file);
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setInputText(text);
      parseData(text);
    }).catch(() => {
      alert('Failed to read clipboard. Please paste manually into the text area.');
    });
  };

  const clearData = () => {
    setInputText('');
    setRecords([]);
  };

  const handleSort = (field: keyof HttpxRecord) => {
    const order = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(order);

    const sorted = [...records].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === 'techs') {
        valA = (a.techs || []).join(',');
        valB = (b.techs || []).join(',');
      }

      if (field === 'length') {
        const numA = parseInt(valA as string) || 0;
        const numB = parseInt(valB as string) || 0;
        return order === 'asc' ? numA - numB : numB - numA;
      }

      return order === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    setRecords(sorted);
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = ['URL', 'Status', 'Length', 'Title', 'IP', 'CNAME', 'Redirect', 'Tech Stack'];
    const csvRows = [
      headers.join(','),
      ...records.map((r) => [
        `"${r.url}"`,
        `"${r.status}"`,
        `"${r.length}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.ip}"`,
        `"${r.cname}"`,
        `"${r.redirect}"`,
        `"${r.techs.join(', ')}"`,
      ].join(',')),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'httpx_parsed_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering
  const filteredRecords = records.filter((r) => {
    // Search keyword
    const matchSearch =
      r.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.techs.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    if (statusFilter === 'ALL') return matchSearch;
    if (statusFilter === '2xx') return matchSearch && r.status.startsWith('2');
    if (statusFilter === '3xx') return matchSearch && r.status.startsWith('3');
    if (statusFilter === '4xx') return matchSearch && r.status.startsWith('4');
    if (statusFilter === '5xx') return matchSearch && r.status.startsWith('5');

    return matchSearch;
  });

  const getStatusClass = (status: string) => {
    const mainStatus = status.split(',').pop() || '';
    if (mainStatus.startsWith('2')) return 'badge-status s-2xx';
    if (mainStatus.startsWith('3')) return 'badge-status s-3xx';
    if (mainStatus.startsWith('4')) return 'badge-status s-4xx';
    if (mainStatus.startsWith('5')) return 'badge-status s-5xx';
    return 'badge-status';
  };

  return (
    <div className="animate-slide-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">HTTPX Log Parser & Viewer</h1>
          <p className="page-subtitle">Upload or paste live_hosts_info.txt outputs to inspect and filter assets</p>
        </div>
        {records.length > 0 && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={exportCSV}>
              <Download size={16} /> Export CSV
            </button>
            <button className="btn-secondary" onClick={clearData} style={{ borderColor: 'var(--color-rose)', color: 'var(--color-rose)' }}>
              <Trash2 size={16} /> Clear
            </button>
          </div>
        )}
      </div>

      {records.length === 0 ? (
        <div className="glass section-card" style={{ padding: '60px 40px' }}>
          <div className="parser-upload-zone" onClick={() => document.getElementById('file-upload')?.click()}>
            <Upload size={48} className="upload-icon" />
            <h3 className="parser-upload-title">Drag & drop or Click to Upload live_hosts_info.txt</h3>
            <p className="parser-upload-subtitle">
              Supports standard HTTPX raw outputs containing status codes, titles, IPs, web servers, and technologies.
            </p>
            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".txt,.log,.csv"
            />
          </div>

          <div style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-muted)', fontSize: '14px' }}>— OR —</div>

          <div className="analyzer-input-panel">
            <textarea
              className="analyzer-textarea"
              style={{ height: '200px' }}
              placeholder="Paste raw httpx output here...&#10;Example:&#10;https://zdenek-muzik.kchat.infomaniak.com [200] [] [1948] [kChat] [] [84.16.68.39] [haproxy-kchat.infomaniak.ch] [Amazon Web Services,HSTS]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => parseData(inputText)}>
                Analyze Text
              </button>
              <button className="btn-secondary" onClick={handlePaste}>
                Paste Clipboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass section-card">
          <div className="parser-actions">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by URL, Title, IP, CNAME, or Tech stack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
                <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status:</span>
              </div>
              {['ALL', '2xx', '3xx', '4xx', '5xx'].map((filter) => (
                <button
                  key={filter}
                  className={`btn-filter ${statusFilter === filter ? 'active' : ''}`}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('url')}>Target URL</th>
                  <th onClick={() => handleSort('status')} style={{ width: '100px' }}>Status</th>
                  <th onClick={() => handleSort('length')} style={{ width: '100px' }}>Length</th>
                  <th onClick={() => handleSort('title')}>Title</th>
                  <th onClick={() => handleSort('ip')}>IP Address</th>
                  <th onClick={() => handleSort('cname')}>CNAME / Host</th>
                  <th>Technologies</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <tr key={index}>
                      <td>
                        <a href={record.url} target="_blank" rel="noopener noreferrer" className="table-url-link">
                          {record.url}
                        </a>
                      </td>
                      <td>
                        <span className={getStatusClass(record.status)}>{record.status}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {parseInt(record.length).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 500 }} title={record.title}>
                        {record.title}
                      </td>
                      <td className="table-ip">{record.ip}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }} title={record.cname}>
                        {record.cname !== '-' ? record.cname : record.redirect !== '-' ? record.redirect : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '300px' }}>
                          {record.techs.map((tech, idx) => (
                            <span key={idx} className="badge-tech">
                              {tech}
                            </span>
                          ))}
                          {record.techs.length === 0 && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <AlertCircle size={24} style={{ color: 'var(--text-muted)' }} />
                        <p>No matching live hosts found. Try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div>
              Showing {filteredRecords.length} of {records.length} hosts
            </div>
            <div>
              Format detected: HTTPX Multi-column Resolved Output
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
