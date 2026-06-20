import { Home, Layers, Globe, Code2, Activity, Terminal, Search, Database } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: <Home size={18} />, section: 'General' },
    { id: 'httpx-parser', name: 'HTTPX Log Parser', icon: <Activity size={18} />, section: 'General' },
    { id: 'subdomain', name: 'Subdomain Discovery', icon: <Layers size={18} />, section: 'Recon & Crawl' },
    { id: 'crawling', name: 'URLs crawling', icon: <Globe size={18} />, section: 'Recon & Crawl' },
    { id: 'js-analyzer', name: 'JS Static Analyzer', icon: <Code2 size={18} />, section: 'Code Analysis' },
    { id: 'port-dns', name: 'Port & DNS Recon', icon: <Terminal size={18} />, section: 'Infrastructure' },
    { id: 'dorks', name: 'Dork Generators', icon: <Search size={18} />, section: 'Vulnerability Hunt' },
    { id: 'payloads', name: 'Payload Database', icon: <Database size={18} />, section: 'Vulnerability Hunt' },
  ];

  // Group items by section
  const sections = ['General', 'Recon & Crawl', 'Code Analysis', 'Infrastructure', 'Vulnerability Hunt'];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">
          RECON<span>v1.0</span>
        </h1>
      </div>
      
      <div className="sidebar-menu">
        {sections.map((section) => {
          const sectionItems = menuItems.filter((item) => item.section === section);
          return (
            <div key={section} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="menu-section-title">{section}</div>
              {sectionItems.map((item) => (
                <button
                  key={item.id}
                  className={`menu-item ${currentTab === item.id ? 'active' : ''}`}
                  onClick={() => setCurrentTab(item.id)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <span>HandBook System</span>
        <span>Localhost</span>
      </div>
    </aside>
  );
}
