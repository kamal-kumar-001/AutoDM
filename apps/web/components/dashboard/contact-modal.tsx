'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, Loader2 } from 'lucide-react';
import { toast } from '@autodm/ui';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('All fields are required.');
      return;
    }

    setSending(true);
    // Simulate support ticket creation or dispatching mail
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Your support request has been sent! We will reply within 24 hours.');
    setSubject('');
    setMessage('');
    setSending(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 m-auto max-w-md h-fit glass-card border border-white/10 bg-[#0c0d14]/90 rounded-3xl p-6 md:p-8 z-50 shadow-2xl space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Contact Support</h3>
                  <p className="text-xs text-gray-500">Need assistance? Drop us a message.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="subject" className="text-xs font-bold text-white">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Account linking error"
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-600"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-bold text-white">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or feedback in detail..."
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-600 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/95 disabled:opacity-50 text-black text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {sending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send Message
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
