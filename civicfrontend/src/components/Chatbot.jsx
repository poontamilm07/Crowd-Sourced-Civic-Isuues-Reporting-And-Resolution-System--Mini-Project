import React, { useState, useRef,
  useEffect } from 'react';
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
} from 'react-icons/fa';

// ─────────────────────────────────────────
// Chatbot responses
// ─────────────────────────────────────────
const getBotResponse = (message) => {
  const msg = message.toLowerCase().trim();

  if (msg.includes('report') ||
      msg.includes('issue')) {
    return '📋 To report an issue:\n1. Login to your account\n2. Go to Dashboard\n3. Click "Report Issue"\n4. Fill in the details and upload a photo\n5. Submit — you will get an Issue ID!';
  }

  if (msg.includes('track') ||
      msg.includes('status')) {
    return '🔍 To track your issue:\n1. Go to "My Issues" in dashboard\n2. Click on your issue\n3. You can see the real-time progress bar\n4. Or use "Track Issue" and enter your Issue ID';
  }

  if (msg.includes('register') ||
      msg.includes('sign up')) {
    return '📝 To register:\n1. Click "Register" on the home page\n2. Fill in your name, email, password\n3. Upload your ID card photo\n4. Enter your location details\n5. Verify OTP sent to your email\n6. Wait for Admin approval';
  }

  if (msg.includes('login') ||
      msg.includes('sign in')) {
    return '🔐 To login:\n1. Click "Login" button\n2. Enter your email and password\n3. An OTP will be sent to your email\n4. Enter the OTP to access your dashboard';
  }

  if (msg.includes('otp') ||
      msg.includes('verification')) {
    return '📧 OTP Info:\n• OTP is sent to your registered email\n• It is valid for 5 minutes only\n• Click "Resend OTP" if you did not receive it\n• Check your spam folder too!';
  }

  if (msg.includes('vote')) {
    return '👍 Voting System:\n• You can vote on public issues\n• More votes = higher priority\n• You can only vote once per issue\n• You earn 2 reward points per vote!';
  }

  if (msg.includes('feedback') ||
      msg.includes('rating') ||
      msg.includes('review')) {
    return '⭐ Feedback System:\n• After your issue is marked Completed\n• Go to "My Issues" in dashboard\n• Click on the completed issue\n• Give star rating (1-5) and comment\n• You earn 5 reward points for feedback!';
  }

  if (msg.includes('emergency')) {
    return '🚨 Emergency Issues:\n• When reporting, check the "Emergency" checkbox\n• Use for: Open manholes, Electric pole danger, Chemical leaks, Flooding\n• Emergency issues are auto-prioritized\n• Authorities are notified immediately!';
  }

  if (msg.includes('reward') ||
      msg.includes('point')) {
    return '🏆 Reward Points:\n• Report an issue: +10 points\n• Vote on an issue: +2 points\n• Submit feedback: +5 points\n• Points shown in your profile!';
  }

  if (msg.includes('admin')) {
    return '👨‍💼 Admin Role:\n• Admin approves/rejects accounts\n• Assigns issues to authorities\n• Views all analytics and reports\n• Only ONE admin is allowed in the system';
  }

  if (msg.includes('authority') ||
      msg.includes('officer')) {
    return '👷 Authority Role:\n• Sees only issues assigned to them\n• Updates work status\n• Uploads "After" completion photos\n• Citizens can rate their work';
  }

  if (msg.includes('image') ||
      msg.includes('photo') ||
      msg.includes('picture')) {
    return '📸 Image Upload:\n• Upload a photo when reporting an issue\n• After completion, authority uploads "After" photo\n• You can compare Before & After images\n• Supported: JPG, PNG, WEBP (max 10MB)';
  }

  if (msg.includes('password') ||
      msg.includes('forgot')) {
    return '🔒 Password Info:\n• Passwords are securely encrypted\n• Minimum 6 characters required\n• Contact admin if you forget your password\n• Email: support@civicfix.gov.in';
  }

  if (msg.includes('hello') ||
      msg.includes('hi') ||
      msg.includes('hey')) {
    return '👋 Hello! I am CivicBot, your assistant for the CivicFix platform!\n\nI can help you with:\n• How to report issues\n• How to track issues\n• Registration and login\n• Voting and feedback\n• Emergency issues\n\nWhat would you like to know?';
  }

  if (msg.includes('help') ||
      msg.includes('what can')) {
    return '🤖 I can help you with:\n• Report Issues\n• Track Issues\n• Register / Login\n• OTP Verification\n• Voting System\n• Feedback & Rating\n• Emergency Issues\n• Reward Points\n\nJust type your question!';
  }

  if (msg.includes('thank')) {
    return '😊 You are welcome! Happy to help. Feel free to ask anything else about CivicFix!';
  }

  return '🤔 I am not sure about that. Try asking about:\n• "How to report an issue"\n• "How to track my issue"\n• "How to register"\n• "What is emergency issue"\n• "How does voting work"\n• Type "help" for more options';
};

// ─────────────────────────────────────────
// Chatbot Component
// ─────────────────────────────────────────
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '👋 Hi! I am CivicBot!\nHow can I help you today?\n\nType "help" to see what I can do!',
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(input.trim()),
        sender: 'bot',
      };
      setMessages((prev) => [
        ...prev,
        botResponse,
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Window */}
      {isOpen && (
        <div style={styles.chatWindow}>

          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.botAvatar}>
                <FaRobot />
              </div>
              <div>
                <div style={styles.botName}>
                  CivicBot
                </div>
                <div style={styles.botStatus}>
                  🟢 Online
                </div>
              </div>
            </div>
            <button
              style={styles.closeBtn}
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.messageWrapper,
                  justifyContent:
                    msg.sender === 'user'
                      ? 'flex-end'
                      : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.message,
                    ...(msg.sender === 'user'
                      ? styles.userMessage
                      : styles.botMessage),
                  }}
                >
                  {msg.text.split('\n').map(
                    (line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.text
                          .split('\n').length - 1
                          && <br />}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={styles.messageWrapper}>
                <div style={styles.botMessage}>
                  <span style={styles.typing}>
                    ● ● ●
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div style={styles.quickReplies}>
            {[
              'Report Issue',
              'Track Issue',
              'How to Register',
              'Emergency',
            ].map((reply) => (
              <button
                key={reply}
                style={styles.quickBtn}
                onClick={() => {
                  setInput(reply);
                  setTimeout(sendMessage, 100);
                }}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={styles.inputArea}>
            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              style={styles.input}
            />
            <button
              style={styles.sendBtn}
              onClick={sendMessage}
            >
              <FaPaperPlane />
            </button>
          </div>

        </div>
      )}

      {/* Toggle Button */}
      <button
        style={styles.toggleBtn}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with CivicBot"
      >
        {isOpen
          ? <FaTimes size={22} />
          : <FaRobot size={22} />
        }
      </button>
    </>
  );
};

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = {
  toggleBtn: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow:
      '0 4px 20px rgba(44,123,229,0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  chatWindow: {
    position: 'fixed',
    bottom: '100px',
    right: '30px',
    width: '340px',
    height: '480px',
    background: 'white',
    borderRadius: '16px',
    boxShadow:
      '0 10px 50px rgba(0,0,0,0.2)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  botAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: 'white',
  },
  botName: {
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
  },
  botStatus: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.8)',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#f8f9fa',
  },
  messageWrapper: {
    display: 'flex',
  },
  message: {
    maxWidth: '80%',
    padding: '10px 13px',
    borderRadius: '12px',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  botMessage: {
    background: 'white',
    color: '#333',
    borderBottomLeftRadius: '4px',
    boxShadow: '0 1px 5px rgba(0,0,0,0.08)',
  },
  userMessage: {
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  typing: {
    color: '#adb5bd',
    letterSpacing: '3px',
    animation: 'pulse 1s infinite',
  },
  quickReplies: {
    padding: '8px 12px',
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    borderTop: '1px solid #f0f0f0',
    background: 'white',
  },
  quickBtn: {
    background: '#f0f7ff',
    border: '1px solid #2c7be5',
    color: '#2c7be5',
    borderRadius: '15px',
    padding: '4px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  inputArea: {
    padding: '12px',
    display: 'flex',
    gap: '8px',
    borderTop: '1px solid #dee2e6',
    background: 'white',
  },
  input: {
    flex: 1,
    border: '1px solid #dee2e6',
    borderRadius: '20px',
    padding: '8px 15px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#2c7be5',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
};

export default Chatbot;
