import React from 'react';
import { 
  FileText, 
  Palette, 
  Layers, 
  UploadCloud, 
  Download,
  Settings
} from 'lucide-react';

export default function SidebarNav({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'captions', label: 'Captions', icon: FileText },
    { id: 'styles', label: 'Styles', icon: Palette },
    { id: 'upload', label: 'Media', icon: UploadCloud },
    { id: 'export', label: 'Export', icon: Download },
  ];

  return (
    <aside className="w-16 border-r border-dark-700/60 bg-dark-900 flex flex-col items-center py-4 space-y-3 z-20 shrink-0 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-[10px] font-medium transition-all group relative ${
              isActive
                ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40 shadow-glow'
                : 'text-slate-400 hover:text-slate-100 hover:bg-dark-800'
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {isActive && (
              <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-500 rounded-r-full shadow-glow" />
            )}
          </button>
        );
      })}
    </aside>
  );
}
