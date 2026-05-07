import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaCity,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeart,
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const issueTypes = [
    'Road Potholes',
    'Garbage Overflow',
    'Broken Street Lights',
    'Water Leakage',
    'Drainage Blockage',
    'Open Manholes',
    'Illegal Dumping',
    'Flooded Roads',
    'Fallen Trees',
    'Other Issues',
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.row}>

          {/* Brand Column */}
          <div style={styles.column}>
            <div style={styles.brand}>
              <FaCity style={styles.brandIcon} />
              <span style={styles.brandName}>
                CivicFix
              </span>
            </div>
            <p style={styles.brandDesc}>
              A crowd-sourced platform empowering
              citizens to report and track civic
              issues for faster resolution by
              municipal authorities.
            </p>
            <div style={styles.socialLinks}>
              <a href="#!" style={styles.socialIcon}
                aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#!" style={styles.socialIcon}
                aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#!" style={styles.socialIcon}
                aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#!" style={styles.socialIcon}
                aria-label="Youtube">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div style={styles.column}>
            <h6 style={styles.colTitle}>
              Quick Links
            </h6>
            <ul style={styles.linkList}>
              <li>
                <Link to="/" style={styles.footerLink}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/register"
                  style={styles.footerLink}>
                  Register
                </Link>
              </li>
              <li>
                <Link to="/login"
                  style={styles.footerLink}>
                  Login
                </Link>
              </li>
              <li>
                <a href="#about"
                  style={styles.footerLink}>
                  About Us
                </a>
              </li>
              <li>
                <a href="#services"
                  style={styles.footerLink}>
                  Services
                </a>
              </li>
              <li>
                <a href="#contact"
                  style={styles.footerLink}>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Issue Types Column */}
          <div style={styles.column}>
            <h6 style={styles.colTitle}>
              Issue Types
            </h6>
            <ul style={styles.linkList}>
              {issueTypes.map((issue) => (
                <li key={issue}>
                  <span style={styles.issueItem}>
                    {issue}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div style={styles.column}>
            <h6 style={styles.colTitle}>
              Contact Us
            </h6>
            <ul style={styles.contactList}>
              <li style={styles.contactItem}>
                <FaMapMarkerAlt
                  style={styles.contactIcon}
                />
                <span>
                  Municipal Corporation Office,
                  Chennai - 600001,
                  Tamil Nadu, India
                </span>
              </li>
              <li style={styles.contactItem}>
                <FaPhone style={styles.contactIcon} />
                <span>+91 98765 43210</span>
              </li>
              <li style={styles.contactItem}>
                <FaEnvelope
                  style={styles.contactIcon}
                />
                <span>support@civicfix.gov.in</span>
              </li>
            </ul>
            <div style={styles.workHours}>
              <h6 style={styles.colTitle}>
                Working Hours
              </h6>
              <p style={styles.hoursText}>
                Mon - Fri: 9:00 AM - 6:00 PM
              </p>
              <p style={styles.hoursText}>
                Sat: 9:00 AM - 2:00 PM
              </p>
              <p style={styles.hoursText}>
                Sun: Closed
              </p>
            </div>
          </div>

        </div>

        <hr style={styles.divider} />

        <div style={styles.bottomBar}>
          <p style={styles.copyright}>
            {'© ' + currentYear + ' CivicFix. All rights reserved. Made with '}
            <FaHeart style={styles.heartIcon} />
            {' for better communities.'}
          </p>
          <div style={styles.bottomLinks}>
            <a href="#!" style={styles.bottomLink}>
              Privacy Policy
            </a>
            <a href="#!" style={styles.bottomLink}>
              Terms of Service
            </a>
            <a href="#!" style={styles.bottomLink}>
              Disclaimer
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#0f172a',
    color: 'rgba(255,255,255,0.75)',
    paddingTop: '60px',
    paddingBottom: '0',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '40px',
    paddingBottom: '40px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '5px',
  },
  brandIcon: {
    fontSize: '28px',
    color: '#2c7be5',
  },
  brandName: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2c7be5',
  },
  brandDesc: {
    fontSize: '13px',
    lineHeight: '1.7',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  socialLinks: {
    display: 'flex',
    gap: '12px',
    marginTop: '5px',
  },
  socialIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '16px',
    textDecoration: 'none',
  },
  colTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
    marginBottom: '5px',
    paddingBottom: '8px',
    borderBottom: '2px solid #2c7be5',
    display: 'inline-block',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    fontSize: '13px',
  },
  issueItem: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '13px',
  },
  contactList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  contactItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.65)',
  },
  contactIcon: {
    color: '#2c7be5',
    marginTop: '3px',
    flexShrink: 0,
  },
  workHours: {
    marginTop: '10px',
  },
  hoursText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.65)',
    margin: '3px 0',
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.1)',
    margin: '0',
  },
  bottomBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
    flexWrap: 'wrap',
    gap: '10px',
  },
  copyright: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  heartIcon: {
    color: '#dc3545',
  },
  bottomLinks: {
    display: 'flex',
    gap: '20px',
  },
  bottomLink: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'none',
  },
};

export default Footer;