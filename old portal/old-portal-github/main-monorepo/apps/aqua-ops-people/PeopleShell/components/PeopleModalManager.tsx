/**
 * ModalManager — The Dynamic Modal Host
 *
 * This component is now purely a frame. It doesn't know WHAT it's rendering.
 * It reads the 'activeModal' from context and resolves the component
 * via the SmartRegistry (The Bridge).
 */

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useModalContext } from '@PeopleShell/bridge/PeopleModalContext';
import { SmartRegistry } from '@PeopleShell/components/PeopleSmartRegistry';

export function ModalManager() {
  const { activeModal, closeModal } = useModalContext();

  if (!activeModal) return null;

  // Resolve the component dynamically from the Bridge
  const ModalComponent = SmartRegistry[activeModal.name];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {ModalComponent ? (
            <ModalComponent {...activeModal.props} onClose={closeModal} />
          ) : (
            <div className="bg-red-900/20 border border-red-500 p-8 rounded-2xl text-center">
              <p className="text-red-500 font-bold">Bridge Error</p>
              <p className="text-xs text-red-400/70 mt-1">Component "{activeModal.name}" not found in registry.</p>
              <button onClick={closeModal} className="mt-4 text-xs underline opacity-50">Close</button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
