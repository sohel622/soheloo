import React, { useState } from 'react';

/**
 * FlashgramShareModal Component
 * Modal triggered when an incoming link/text is received from an external application or intent.
 */
export function FlashgramShareModal({
  isOpen,
  sharedLink,
  sharedData,
  onClose,
  onOpenShabnamDm,
  onShareToFeed
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayText = sharedLink || (sharedData && (sharedData.text || sharedData.url)) || '';
  const displayTitle = (sharedData && sharedData.title) || 'External Link / Text';

  const handleCopy = () => {
    if (navigator.clipboard && displayText) {
      navigator.clipboard.writeText(displayText);
      setCopied(true);
      if (window.showAppToast) {
        window.showAppToast('Link copied to clipboard! 📋');
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareToFeed = () => {
    if (onShareToFeed) {
      onShareToFeed(displayText);
    } else if (window.showAppToast) {
      window.showAppToast('Shared to Flashgram Community Posts 📝');
    }
    onClose();
  };

  const handleChatWithShabnam = () => {
    if (onOpenShabnamDm) {
      onOpenShabnamDm(displayText);
    }
    onClose();
  };

  return (
    <div className="flashgram-share-overlay" onClick={onClose} style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding: '0',
      transition: 'opacity 0.25s ease'
    }}>
      <div 
        className="flashgram-share-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--header-bg, #181818)',
          color: 'var(--text-main, #ffffff)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '20px 20px 32px 20px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'flashgramSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Drag handle pill */}
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '999px',
          margin: '0 auto 16px auto'
        }} />

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF0055, #7928CA)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: '0 4px 12px rgba(255, 0, 85, 0.3)'
            }}>
              ⚡
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px' }}>
                Flashgram Share
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Incoming shared content
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-main, #ffffff)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Shared Link Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '12px 14px',
          marginBottom: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#38bdf8', fontWeight: '600' }}>
              {displayTitle}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Just now
            </span>
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-main, #ffffff)',
            wordBreak: 'break-all',
            lineHeight: '1.4',
            maxHeight: '75px',
            overflowY: 'auto'
          }}>
            {displayText}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Shabnam AI DM Button */}
          <button
            onClick={handleChatWithShabnam}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.35)',
              transition: 'transform 0.15s ease, filter 0.15s ease'
            }}
          >
            <span style={{ fontSize: '18px' }}>✨</span>
            <span>Send to Shabnam AI DM</span>
          </button>

          {/* Share to Community Post */}
          <button
            onClick={handleShareToFeed}
            style={{
              width: '100%',
              padding: '12px 18px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-main, #ffffff)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.15s ease'
            }}
          >
            <span>📝</span>
            <span>Create Community Post</span>
          </button>

          {/* Secondary Row: Copy & Dismiss */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={handleCopy}
              style={{
                padding: '11px',
                backgroundColor: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                color: copied ? '#4ade80' : 'var(--text-main, #ffffff)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '11px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlashgramShareModal;
