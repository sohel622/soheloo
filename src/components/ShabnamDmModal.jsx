import React, { useState, useEffect, useRef } from 'react';

/**
 * ShabnamDmModal Component
 * Shabnam AI Direct Message screen with pre-filled message support.
 */
export function ShabnamDmModal({
  isOpen,
  initialMessage = '',
  onClose
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'shabnam',
      text: "Assalamu Alaikum! I'm Shabnam AI, your intelligent companion. Share any link, question, or thought with me, and I'll explore or summarize it for you! ✨",
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialMessage) {
        setInputText(initialMessage);
      }
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
    }
  }, [isOpen, initialMessage]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = () => {
    const textToSend = inputText.trim();
    if (!textToSend) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI response simulation
    setTimeout(() => {
      let aiReply = "I received your shared link! I'm analyzing the content and will extract the key highlights for you. ✨";
      if (textToSend.includes('youtube.com') || textToSend.includes('youtu.be')) {
        aiReply = "Thanks for sharing this video link! I've noted this YouTube video. Would you like me to summarize its key points, generate a discussion topic, or add it to your Watch Later queue? 🎥";
      } else if (textToSend.startsWith('http://') || textToSend.startsWith('https://')) {
        aiReply = "I've fetched this external link! It looks fascinating. Let me know if you want a concise breakdown, key takeaways, or related TweetGram recommendations! 🌟";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'shabnam',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0'
    }} onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          maxHeight: '680px',
          backgroundColor: 'var(--header-bg, #111111)',
          color: 'var(--text-main, #ffffff)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.12), transparent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #A855F7, #EC4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              position: 'relative'
            }}>
              🧕
              <div style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '10px',
                height: '10px',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                border: '2px solid #111111'
              }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Shabnam AI</h4>
                <span style={{
                  fontSize: '10px',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: '600'
                }}>DM</span>
              </div>
              <span style={{ fontSize: '11px', color: '#22c55e' }}>● Online • Intelligent Companion</span>
            </div>
          </div>

          <button
            onClick={onClose}
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

        {/* Messages Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                padding: '12px 16px',
                borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: m.sender === 'user' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '14px',
                lineHeight: '1.45',
                wordBreak: 'break-word',
                boxShadow: m.sender === 'user' ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
              }}>
                {m.text}
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px', padding: '0 4px' }}>
                {m.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              padding: '10px 14px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>Shabnam is typing</span>
              <span className="typing-dots">...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message or discuss link..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '10px 16px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{
              backgroundColor: inputText.trim() ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: inputText.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'background-color 0.2s ease'
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShabnamDmModal;
