import React, { useState, useEffect,
  useRef } from 'react';
import { useNavigate, useLocation,
  Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/axios';

const OtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const email =
    location.state?.email || '';
  const purpose =
    location.state?.purpose || 'LOGIN';

  const [otp, setOtp] = useState(
    ['', '', '', '', '', '']
  );
  const [loading, setLoading] =
    useState(false);
  const [resendLoading, setResendLoading] =
    useState(false);
  const [timeLeft, setTimeLeft] =
    useState(300); // 5 minutes
  const [canResend, setCanResend] =
    useState(false);

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString()
      .padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' &&
        !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error(
        'Please enter all 6 digits'
      );
      return;
    }

    setLoading(true);
    try {
      let res;

      if (purpose === 'REGISTRATION') {
        res = await authAPI
          .verifyRegistrationOtp({
            email,
            otpCode,
            purpose: 'REGISTRATION',
          });

        if (res.data.success) {
          toast.success(
            '✅ Email verified! '
            + 'Awaiting admin approval.'
          );
          navigate('/login');
        } else {
          toast.error(res.data.message);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      } else {
        // LOGIN OTP
        res = await authAPI
          .verifyLoginOtp({
            email,
            otpCode,
            purpose: 'LOGIN',
          });

        if (res.data.success) {
          const userData = res.data.data;
          login(
            {
              userId: userData.userId,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              city: userData.city,
            },
            userData.token
          );
          toast.success(
            '🎉 Login successful!'
          );

          // Redirect based on role
          switch (userData.role) {
            case 'ADMIN':
              navigate('/admin/dashboard');
              break;
            case 'AUTHORITY':
              navigate(
                '/authority/dashboard'
              );
              break;
            default:
              navigate('/citizen/dashboard');
          }
        } else {
          toast.error(res.data.message);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Verification failed.'
      );
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await authAPI.resendOtp({
        email,
        purpose,
      });
      if (res.data.success) {
        toast.success(
          'New OTP sent to ' + email
        );
        setOtp(['', '', '', '', '', '']);
        setTimeLeft(300);
        setCanResend(false);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Icon */}
        <div style={styles.iconBox}>
          <span style={styles.icon}>🔐</span>
        </div>

        {/* Title */}
        <h3 style={styles.title}>
          {purpose === 'REGISTRATION'
            ? 'Verify Your Email'
            : 'Enter OTP'
          }
        </h3>
        <p style={styles.subtitle}>
          OTP sent to
        </p>
        <p style={styles.email}>
          {email}
        </p>

        {/* OTP Input Fields */}
        <div
          style={styles.otpRow}
          onPaste={handlePaste}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) =>
                inputRefs.current[i] = el
              }
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) =>
                handleOtpChange(
                  i, e.target.value
                )
              }
              onKeyDown={(e) =>
                handleKeyDown(i, e)
              }
              style={{
                ...styles.otpInput,
                borderColor: digit
                  ? '#2c7be5'
                  : '#dee2e6',
                background: digit
                  ? '#f0f7ff'
                  : 'white',
              }}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Timer */}
        <div style={styles.timerRow}>
          {!canResend ? (
            <p style={styles.timer}>
              ⏱️ OTP expires in{' '}
              <strong style={{
                color: timeLeft < 60
                  ? '#dc3545' : '#2c7be5',
              }}>
                {formatTime(timeLeft)}
              </strong>
            </p>
          ) : (
            <p style={styles.timerExpired}>
              ⚠️ OTP has expired
            </p>
          )}
        </div>

        {/* Verify Button */}
        <button
          style={styles.verifyBtn}
          onClick={handleVerify}
          disabled={
            loading ||
            otp.join('').length !== 6
          }
        >
          {loading
            ? '⏳ Verifying...'
            : '✅ Verify OTP'
          }
        </button>

        {/* Resend */}
        <div style={styles.resendRow}>
          <span style={styles.resendText}>
            Didn&apos;t receive OTP?
          </span>
          <button
            style={{
              ...styles.resendBtn,
              opacity: canResend ? 1 : 0.5,
              cursor: canResend
                ? 'pointer' : 'default',
            }}
            onClick={handleResend}
            disabled={
              !canResend || resendLoading
            }
          >
            {resendLoading
              ? 'Sending...'
              : 'Resend OTP'
            }
          </button>
        </div>

        {/* Info Box */}
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            🔒 OTP is valid for
            <strong> 5 minutes</strong>
          </p>
          <p style={styles.infoText}>
            ✨ Next login within 24 hours
            will skip OTP
          </p>
        </div>

        {/* Back to Login */}
        <Link
          to="/login"
          style={styles.backLink}
        >
          ← Back to Login
        </Link>

      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background:
      'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px 35px',
    width: '100%',
    maxWidth: '420px',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center',
  },
  iconBox: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: '#f0f7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    border: '2px solid #bee3f8',
  },
  icon: {
    fontSize: '32px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#6c757d',
    fontSize: '14px',
    margin: '0 0 4px',
  },
  email: {
    color: '#2c7be5',
    fontWeight: '700',
    fontSize: '15px',
    margin: '0 0 25px',
  },
  otpRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  otpInput: {
    width: '48px',
    height: '56px',
    borderRadius: '10px',
    border: '2px solid #dee2e6',
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '800',
    outline: 'none',
    transition: 'all 0.2s ease',
    color: '#1a1a2e',
    fontFamily: 'inherit',
  },
  timerRow: {
    marginBottom: '20px',
  },
  timer: {
    color: '#6c757d',
    fontSize: '14px',
    margin: 0,
  },
  timerExpired: {
    color: '#dc3545',
    fontSize: '14px',
    fontWeight: '600',
    margin: 0,
  },
  verifyBtn: {
    width: '100%',
    padding: '14px',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: '15px',
    transition: 'opacity 0.2s ease',
  },
  resendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  resendText: {
    color: '#6c757d',
    fontSize: '14px',
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: '#2c7be5',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'inherit',
    textDecoration: 'underline',
  },
  infoBox: {
    background: '#f0f7ff',
    border: '1px solid #bee3f8',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '20px',
  },
  infoText: {
    color: '#555',
    fontSize: '13px',
    margin: '3px 0',
  },
  backLink: {
    color: '#6c757d',
    fontSize: '14px',
    textDecoration: 'none',
    display: 'block',
  },
};

export default OtpVerify;