import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Info, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPortalModal({ isOpen, onClose, role }) {
  const { t } = useTranslation('about');

  // Map app roles to the 4 audience sections defined in our translation JSON
  const getRoleKey = () => {
    if (role === 'citizen') return 'citizen';
    if (role === 'hei' || role === 'hei_admin') return 'hei';
    if (role === 'industry_csr' || role === 'industry_admin') return 'industry';
    if (role === 'government_admin' || role === 'admin' || role === 'govt_admin' || role === 'platform_admin') return 'government';
    return 'citizen'; // fallback
  };

  const roleKey = getRoleKey();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Slide-over panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-sm h-full bg-surface border-l border-surface-raised shadow-2xl flex flex-col z-10"
          >
            <div className="p-6 flex items-center justify-between border-b border-surface-raised">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-secondary/10 text-accent-secondary flex items-center justify-center">
                  <Info size={20} />
                </div>
                <h2 className="text-xl font-display font-bold text-primary-custom">
                  {t(`portalModals.${roleKey}.title`)}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-muted-custom hover:text-primary-custom transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
              <p className="text-muted-custom leading-relaxed text-base">
                {t(`portalModals.${roleKey}.content`)}
              </p>

              <div className="mt-4 p-4 rounded-xl bg-surface-raised/50 border border-surface-raised flex flex-col gap-3">
                <span className="text-sm font-semibold text-primary-custom font-display">Want to learn more?</span>
                <p className="text-sm text-muted-custom">
                  Read about our full architecture, AI implementation, and cross-platform capabilities.
                </p>
                <Link 
                  to="/about"
                  onClick={onClose}
                  className="mt-2 inline-flex items-center gap-2 text-accent-primary hover:text-accent-secondary transition-colors text-sm font-semibold"
                >
                  View Full Platform Details <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
