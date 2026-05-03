import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface FulfillmentSocialProps {
  socialPosts: any[];
}

export const FulfillmentSocial: React.FC<FulfillmentSocialProps> = ({ socialPosts }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-500" /> Content Queue
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-[var(--radius-button)] text-sm font-semibold hover:bg-purple-600 transition-all">
          <Plus className="w-4 h-4" /> Schedule Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {socialPosts.map(post => (
          <div key={post.id} className="relative glass-card outline outline-1 outline-[var(--client-widget-border)] rounded-[var(--radius-card)] overflow-hidden flex flex-col group">
            {post.status === 'Pending Approval' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
            )}
            {post.status === 'Scheduled' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
            )}
            <div className="p-4 bg-[var(--client-widget-surface-1-glass)] border-b border-[var(--client-widget-border)] flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{post.clientName}</p>
                <p className="text-[10px] text-[var(--client-widget-text-muted)] uppercase tracking-wider">{post.platform}</p>
              </div>
              <span className="text-xs font-bold text-[var(--client-widget-text-muted)] bg-[var(--client-widget-bg-color-1)] px-2 py-1 rounded-md border border-[var(--client-widget-border)]">
                {new Date(post.scheduledDate).toLocaleDateString()}
              </span>
            </div>
            <div className="p-6 flex-1 text-sm text-[var(--client-widget-text)] leading-relaxed italic opacity-80">
              "{post.content}"
            </div>
            <div className="p-4 bg-[var(--client-widget-bg-color-1)]/50 border-t border-[var(--client-widget-border)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[var(--client-widget-primary-color-1)]/20 text-[var(--client-widget-primary-color-1)] flex items-center justify-center text-[10px] font-bold">
                  {post.author[0]}
                </div>
                <span className="text-xs text-[var(--client-widget-text-muted)]">{post.author.split(' ')[0]}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                post.status === 'Published' ? 'text-green-500' :
                post.status === 'Pending Approval' ? 'text-orange-500' : 'text-blue-500'
              }`}>
                {post.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
