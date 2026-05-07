import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCity,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
} from 'react-icons/fa';
import { authAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';



const Login = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, getDashboardRoute } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // If already logged in redirect to dashboard
  if (isLoggedIn()) {
    navigate(getDashboardRoute());
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Invalid email format');
      return false;
    }
    if (!formData.password.trim()) {
      toast.error('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);
  try {
    const res = await authAPI.login({
      email: formData.email,
      password: formData.password,
    });

    if (res.data.success) {
      const data = res.data.data;

      // Check if OTP is required
      if (data.otpRequired === false) {
        // Direct login — no OTP needed
        login(
          {
            userId: data.userId,
            name: data.name,
            email: data.email,
            role: data.role,
            city: data.city,
          },
          data.token
        );
        toast.success(
          '🎉 Welcome back! '
          + '(OTP skipped — verified today)'
        );

        // Redirect by role
        switch (data.role) {
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'AUTHORITY':
            navigate('/authority/dashboard');
            break;
          default:
            navigate('/citizen/dashboard');
        }
      } else {
        // OTP required — go to verify page
        toast.info(
          '📧 OTP sent to ' +
          formData.email
        );
        navigate('/verify-otp', {
          state: {
            email: formData.email,
            purpose: 'LOGIN',
          },
        });
      }
    } else {
      toast.error(res.data.message);
    }
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      'Login failed. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div style={styles.page}>

      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>

          {/* Brand */}
          <div style={styles.brand}>
            <FaCity style={styles.brandIcon} />
            <span style={styles.brandName}>
              CivicFix
            </span>
          </div>

          <h2 style={styles.leftTitle}>
            Welcome Back!
          </h2>
          <p style={styles.leftSubtitle}>
            Login to your account to report
            issues, track progress and help
            make your community better.
          </p>

          {/* Roles Info */}
          <div style={styles.rolesInfo}>
            {[
              {
                icon: '👤',
                role: 'Citizen',
                desc: 'Report and track issues',
              },
              {
                icon: '👨‍💼',
                role: 'Admin',
                desc: 'Manage users and assignments',
              },
              {
                icon: '👷',
                role: 'Authority',
                desc: 'Resolve assigned issues',
              },
            ].map((r, i) => (
              <div key={i} style={styles.roleItem}>
                <span style={styles.roleItemIcon}>
                  {r.icon}
                </span>
                <div>
                  <p style={styles.roleItemName}>
                    {r.role}
                  </p>
                  <p style={styles.roleItemDesc}>
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p style={styles.registerPrompt}>
            New to CivicFix?{' '}
            <Link
              to="/register"
              style={styles.registerLink}
            >
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>

          {/* Header */}
          <div style={styles.formHeader}>
            <div style={styles.formIconBox}>
              <FaSignInAlt
                style={styles.formIcon}
              />
            </div>
            <h3 style={styles.formTitle}>
              Sign In
            </h3>
            <p style={styles.formSubtitle}>
              Enter your credentials to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Email Address
              </label>
              <div style={styles.inputWrapper}>
                <FaEnvelope
                  style={styles.inputIcon}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Password
              </label>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword
                    ? <FaEyeSlash />
                    : <FaEye />
                  }
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                🔐 After login, an OTP will be
                sent to your registered email
                for security verification.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading
                ? '⏳ Please wait...'
                : '🔐 Login & Get OTP'
              }
            </button>

            {/* Register Link */}
            <p style={styles.registerText}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={styles.link}
              >
                Register here
              </Link>
            </p>

            {/* Back to Home */}
            <p style={styles.homeText}>
              <Link to="/" style={styles.homeLink}>
                ← Back to Home
              </Link>
            </p>

          </form>

          {/* Demo Credentials */}
          <div style={styles.demoBox}>
            <p style={styles.demoTitle}>
              🧪 Demo Credentials
            </p>
            <div style={styles.demoGrid}>
              <div style={styles.demoItem}>
                <p style={styles.demoRole}>
                  Admin
                </p>
                <p style={styles.demoEmail}>
  admin@gmail.com
</p>
<p style={styles.demoPass}>
  password
</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
  },
  leftPanel: {
    flex: '0 0 400px',
    background:
      'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 40px',
  },
  leftContent: {
    color: 'white',
    width: '100%',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '35px',
  },
  brandIcon: {
    fontSize: '30px',
    color: '#2c7be5',
  },
  brandName: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#2c7be5',
  },
  leftTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  leftSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    lineHeight: '1.7',
    marginBottom: '30px',
  },
  rolesInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '35px',
  },
  roleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: 'rgba(255,255,255,0.07)',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  roleItemIcon: {
    fontSize: '26px',
  },
  roleItemName: {
    color: 'white',
    fontWeight: '600',
    margin: '0 0 3px',
    fontSize: '14px',
  },
  roleItemDesc: {
    color: 'rgba(255,255,255,0.55)',
    margin: 0,
    fontSize: '12px',
  },
  registerPrompt: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
  },
  registerLink: {
    color: '#2c7be5',
    textDecoration: 'none',
    fontWeight: '600',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: '#f8f9fa',
  },
  formContainer: {
    width: '100%',
    maxWidth: '440px',
    background: 'white',
    borderRadius: '16px',
    padding: '35px',
    boxShadow:
      '0 4px 30px rgba(0,0,0,0.08)',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  formIconBox: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#f0f7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
  },
  formIcon: {
    fontSize: '24px',
    color: '#2c7be5',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1a1a2e',
    margin: '0 0 5px',
  },
  formSubtitle: {
    color: '#6c757d',
    fontSize: '14px',
    margin: 0,
  },
  inputGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '7px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '13px',
    color: '#adb5bd',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 38px',
    border: '1.5px solid #dee2e6',
    borderRadius: '9px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border 0.2s ease',
    background: '#fafafa',
  },
  eyeBtn: {
    position: 'absolute',
    right: '13px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#adb5bd',
    fontSize: '16px',
    padding: 0,
  },
  infoBox: {
    background: '#f0f7ff',
    border: '1px solid #bee3f8',
    borderRadius: '8px',
    padding: '12px 15px',
    marginBottom: '20px',
  },
  infoText: {
    color: '#2c7be5',
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.5',
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: '15px',
    transition: 'all 0.2s ease',
  },
  registerText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6c757d',
    margin: '0 0 10px',
  },
  link: {
    color: '#2c7be5',
    textDecoration: 'none',
    fontWeight: '600',
  },
  homeText: {
    textAlign: 'center',
    fontSize: '13px',
    margin: 0,
  },
  homeLink: {
    color: '#6c757d',
    textDecoration: 'none',
  },
  demoBox: {
    marginTop: '25px',
    background: '#fff8f0',
    border: '1px solid #ffd9b3',
    borderRadius: '10px',
    padding: '15px',
  },
  demoTitle: {
    fontWeight: '700',
    color: '#fd7e14',
    margin: '0 0 10px',
    fontSize: '13px',
  },
  demoGrid: {
    display: 'flex',
    gap: '10px',
  },
  demoItem: {
    flex: 1,
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    border: '1px solid #ffd9b3',
  },
  demoRole: {
    fontWeight: '700',
    color: '#333',
    margin: '0 0 4px',
    fontSize: '13px',
  },
  demoEmail: {
    color: '#6c757d',
    margin: '0 0 2px',
    fontSize: '11px',
  },
  demoPass: {
    color: '#2c7be5',
    fontWeight: '600',
    margin: 0,
    fontSize: '12px',
  },
};

export default Login;
