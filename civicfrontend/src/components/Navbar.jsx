import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaCity,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from 'react-icons/fa';

const Navbar = () => {
  const { user, isLoggedIn, logout,
    getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>

        {/* Brand */}
        <Link to="/" style={styles.brand}>
          <FaCity style={styles.brandIcon} />
          <span>CivicFix</span>
        </Link>

        {/* Desktop Menu */}
        <ul style={styles.navLinks}>
          <li>
            <button
              style={styles.navBtn}
              onClick={() => scrollToSection('home')}
            >
              Home
            </button>
          </li>
          <li>
            <button
              style={styles.navBtn}
              onClick={() => scrollToSection('about')}
            >
              About
            </button>
          </li>
          <li>
            <button
              style={styles.navBtn}
              onClick={() =>
                scrollToSection('services')
              }
            >
              Services
            </button>
          </li>
          <li>
            <button
              style={styles.navBtn}
              onClick={() =>
                scrollToSection('public-issues')
              }
            >
              Public Issues
            </button>
          </li>
          <li>
            <button
              style={styles.navBtn}
              onClick={() =>
                scrollToSection('contact')
              }
            >
              Contact
            </button>
          </li>
        </ul>

        {/* Auth Buttons */}
        <div style={styles.authButtons}>
          {isLoggedIn() ? (
            <>
              <button
                style={styles.dashboardBtn}
                onClick={() =>
                  navigate(getDashboardRoute())
                }
              >
                <FaUser size={14} />
                &nbsp;Dashboard
              </button>
              <button
                style={styles.logoutBtn}
                onClick={handleLogout}
              >
                <FaSignOutAlt size={14} />
                &nbsp;Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={styles.loginBtn}
              >
                <FaSignInAlt size={14} />
                &nbsp;Login
              </Link>
              <Link
                to="/register"
                style={styles.registerBtn}
              >
                <FaUserPlus size={14} />
                &nbsp;Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          style={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen
            ? <FaTimes size={20} />
            : <FaBars size={20} />
          }
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <button
            style={styles.mobileNavBtn}
            onClick={() => scrollToSection('home')}
          >
            Home
          </button>
          <button
            style={styles.mobileNavBtn}
            onClick={() => scrollToSection('about')}
          >
            About
          </button>
          <button
            style={styles.mobileNavBtn}
            onClick={() =>
              scrollToSection('services')
            }
          >
            Services
          </button>
          <button
            style={styles.mobileNavBtn}
            onClick={() =>
              scrollToSection('public-issues')
            }
          >
            Public Issues
          </button>
          <button
            style={styles.mobileNavBtn}
            onClick={() =>
              scrollToSection('contact')
            }
          >
            Contact
          </button>
          <hr style={{ borderColor:
            'rgba(255,255,255,0.2)' }}
          />
          {isLoggedIn() ? (
            <>
              <button
                style={styles.mobileNavBtn}
                onClick={() => {
                  navigate(getDashboardRoute());
                  setMenuOpen(false);
                }}
              >
                Dashboard
              </button>
              <button
                style={styles.mobileNavBtn}
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={styles.mobileNavBtn}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={styles.mobileNavBtn}
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = {
  nav: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    backdropFilter: 'blur(10px)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '65px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#2c7be5',
    fontWeight: '700',
    fontSize: '22px',
    textDecoration: 'none',
  },
  brandIcon: {
    fontSize: '26px',
    color: '#2c7be5',
  },
  navLinks: {
    display: 'flex',
    listStyle: 'none',
    gap: '5px',
    margin: 0,
    padding: 0,
  },
  navBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  authButtons: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  loginBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1px solid #2c7be5',
    color: '#2c7be5',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  registerBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    background: '#2c7be5',
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  dashboardBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    background: '#2c7be5',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'inherit',
  },
  logoutBtn: {
    padding: '8px 18px',
    borderRadius: '8px',
    background: 'transparent',
    color: '#dc3545',
    border: '1px solid #dc3545',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'inherit',
  },
  menuToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '5px',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 20px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    gap: '5px',
  },
  mobileNavBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    padding: '10px 0',
    fontSize: '15px',
    textAlign: 'left',
    fontFamily: 'inherit',
    textDecoration: 'none',
    display: 'block',
  },
};

export default Navbar;
