import React from 'react';
import { motion } from 'motion/react';
import { LifeBuoy, BookOpen, Calendar, FileText, MessageSquare, Star } from 'lucide-react';

interface SupportViewProps {
  handleViewChange: (view: any) => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ handleViewChange }) => {
  return (
    <motion.div
      key="support"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full w-full p-10 flex flex-col items-center justify-center max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <LifeBuoy className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-4xl font-semibold mb-4">How can we help?</h2>
        <p className="text-slate-400">Select an option below to get in touch with our team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        <button 
          onClick={() => handleViewChange('resources')}
          className="p-8 glass-card rounded-3xl hover:bg-white/5 transition-all text-left group"
        >
          <BookOpen className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-medium mb-2">Resources</h3>
          <p className="text-sm text-slate-500">Access training materials, brand assets, and documentation.</p>
        </button>

        <button 
          onClick={() => alert('Booking system coming soon!')}
          className="p-8 glass-card rounded-3xl hover:bg-white/5 transition-all text-left group"
        >
          <Calendar className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-medium mb-2">Book a support call</h3>
          <p className="text-sm text-slate-500">Schedule a 1-on-1 session with our technical experts.</p>
        </button>
        
        <button 
          onClick={() => alert('Support form coming soon!')}
          className="p-8 glass-card rounded-3xl hover:bg-white/5 transition-all text-left group"
        >
          <FileText className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-medium mb-2">Send a support form</h3>
          <p className="text-sm text-slate-500">Submit a detailed ticket and we'll get back to you via email.</p>
        </button>

        <button 
          onClick={() => handleViewChange('feature-request')}
          className="p-8 glass-card rounded-3xl hover:bg-white/5 transition-all text-left group"
        >
          <MessageSquare className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-medium mb-2">Send some feedback</h3>
          <p className="text-sm text-slate-500">Tell us what you think about the portal and our services.</p>
        </button>

        <button 
          onClick={() => alert('Review system coming soon!')}
          className="p-8 glass-card rounded-3xl hover:bg-white/5 transition-all text-left group"
        >
          <Star className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-medium mb-2">Leave a review</h3>
          <p className="text-sm text-slate-500">Share your experience with others on our public platforms.</p>
        </button>
      </div>
    </motion.div>
  );
}
