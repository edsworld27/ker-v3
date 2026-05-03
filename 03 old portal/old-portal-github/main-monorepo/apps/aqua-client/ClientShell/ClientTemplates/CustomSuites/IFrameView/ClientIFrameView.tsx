import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Monitor, RefreshCw, ExternalLink } from 'lucide-react';

const IFrameView = () => {
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="w-full h-full min-h-screen p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] flex flex-col glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--client-widget-primary-color-1)]/20 rounded-lg">
              <Monitor className="w-5 h-5 text-[var(--client-widget-primary-color-1)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">CMS Payload Interface</h2>
              <p className="text-xs text-slate-400">Manage your website content directly from the portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-xs font-medium text-slate-300 hover:text-white"
              title="Refresh CMS"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <a 
              href="/admin" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors text-xs font-medium text-slate-300 hover:text-white"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open full screen
            </a>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden bg-transparent rounded-b-2xl">
          <iframe
            key={iframeKey}
            src="/admin"
            className="absolute inset-0 w-full h-full border-none"
            title="CMS Payload"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default IFrameView;

