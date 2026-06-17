import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight, FaSearch,
  FaRoad, FaTrash, FaLightbulb,
  FaTint, FaWater, FaTree,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { publicAPI } from '../api/axios';

const Landing = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    totalCitizens: 0,
    totalAuthorities: 0,
    resolutionRate: 0,
  });
  const [publicIssues, setPublicIssues] =
    useState([]);
  const [trackCode, setTrackCode] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    fetchStats();
    fetchPublicIssues();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await publicAPI.getPublicStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchPublicIssues = async () => {
    try {
      const res =
        await publicAPI.getPublicIssues('', '');
      if (res.data.success) {
        setPublicIssues(
          res.data.data.slice(0, 6)
        );
      }
    } catch (err) {
      console.error('Failed to fetch issues');
    }
  };

  const handleTrack = () => {
    if (trackCode.trim()) {
      navigate(
        `/citizen/track-issue?code=${trackCode}`
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REPORTED': return '#6c757d';
      case 'ASSIGNED': return '#0d6efd';
      case 'IN_PROGRESS': return '#ffc107';
      case 'COMPLETED': return '#198754';
      default: return '#6c757d';
    }
  };

  const issueTypes = [
    { icon: <FaRoad />, label: 'Road Potholes',
      color: '#e74c3c' },
    { icon: <FaTrash />, label: 'Garbage Overflow',
      color: '#2ecc71' },
    { icon: <FaLightbulb />,
      label: 'Street Lights', color: '#f39c12' },
    { icon: <FaTint />, label: 'Water Leakage',
      color: '#3498db' },
    { icon: <FaWater />,
      label: 'Drainage Blockage',
      color: '#9b59b6' },
    { icon: <FaTree />, label: 'Fallen Trees',
      color: '#27ae60' },
  ];

  return (
    <div style={{ background: '#f8f9fa' }}>
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section
        id="home"
        style={styles.hero}
      >
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            🏙️ Smart City Platform
          </div>
          <h1 style={styles.heroTitle}>
            Report Civic Issues,
            <span style={styles.heroHighlight}>
              {' '}Transform Your City
            </span>
          </h1>
          <p style={styles.heroSubtitle}>
            Empowering citizens to report local
            problems directly to municipal
            authorities. Track progress in
            real-time until resolution.
          </p>

          {/* CTA Buttons */}
          <div style={styles.heroBtns}>
            <Link
              to="/register"
              style={styles.primaryBtn}
            >
              Get Started Free
              <FaArrowRight style={{
                marginLeft: '8px'
              }} />
            </Link>
            <Link
              to="/login"
              style={styles.secondaryBtn}
            >
              Login to Dashboard
            </Link>
          </div>

          {/* Quick Track */}
          <div style={styles.trackBox}>
            <p style={styles.trackLabel}>
              🔍 Quick Issue Tracker
            </p>
            <div style={styles.trackInput}>
              <input
                type="text"
                placeholder="Enter Issue ID (e.g. ISS1023)"
                value={trackCode}
                onChange={(e) =>
                  setTrackCode(e.target.value)
                }
                style={styles.trackField}
                onKeyPress={(e) =>
                  e.key === 'Enter' && handleTrack()
                }
              />
              <button
                onClick={handleTrack}
                style={styles.trackBtn}
              >
                Track
              </button>
            </div>
          </div>
        </div>

        {/* Hero Image Side */}
        <div style={styles.heroImage}>
          <div style={styles.heroCard}>
            <div style={styles.heroCardHeader}>
              🗺️ Live Issue Map
            </div>
            {[
              { label: 'Road Pothole',
                area: 'Ward 12', votes: 45,
                status: 'IN_PROGRESS' },
              { label: 'Garbage Overflow',
                area: 'Ward 7', votes: 38,
                status: 'ASSIGNED' },
              { label: 'Street Light',
                area: 'Ward 3', votes: 22,
                status: 'COMPLETED' },
            ].map((item, i) => (
              <div key={i} style={styles.heroIssue}>
                <div style={styles.heroIssueLeft}>
                  <span style={styles.heroIssueTitle}>
                    {item.label}
                  </span>
                  <span style={styles.heroIssueArea}>
                    {item.area} • {item.votes} votes
                  </span>
                </div>
                <span style={{
                  ...styles.heroStatus,
                  background: getStatusColor(
                    item.status
                  ),
                }}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section style={styles.statsSection}>
        <div style={styles.container}>
          <div style={styles.statsGrid}>
            {[
              { value: stats.totalIssues,
                label: 'Issues Reported',
                icon: '📋', color: '#2c7be5' },
              { value: stats.resolvedIssues,
                label: 'Issues Resolved',
                icon: '✅', color: '#198754' },
              { value: stats.totalCitizens,
                label: 'Active Citizens',
                icon: '👥', color: '#fd7e14' },
              { value: `${stats.resolutionRate}%`,
                label: 'Resolution Rate',
                icon: '📈', color: '#6f42c1' },
            ].map((stat, i) => (
              <div key={i} style={styles.statCard}>
                <div style={{
                  ...styles.statIcon,
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
                <h3 style={{
                  ...styles.statValue,
                  color: stat.color,
                }}>
                  {stat.value}
                </h3>
                <p style={styles.statLabel}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              About CivicFix
            </h2>
            <p style={styles.sectionSubtitle}>
              A transparent platform connecting
              citizens with municipal authorities
            </p>
          </div>
          <div style={styles.aboutGrid}>
            <div style={styles.aboutText}>
              <h4 style={{ color: '#2c7be5',
                marginBottom: '15px' }}>
                What is CivicFix?
              </h4>
              <p style={styles.aboutPara}>
                CivicFix is a crowd-sourced civic
                issues reporting and resolution
                system that empowers citizens to
                take an active role in improving
                their local communities.
              </p>
              <p style={styles.aboutPara}>
                Citizens can report problems like
                road potholes, garbage overflow,
                broken street lights, water leakage,
                drainage blockage, and more —
                directly to the municipal
                authorities responsible for fixing
                them.
              </p>
              <p style={styles.aboutPara}>
                With real-time tracking, email
                notifications, and transparent
                status updates, citizens always
                know what is happening with their
                reported issues.
              </p>
            </div>
            <div style={styles.rolesGrid}>
              {[
                { role: 'Citizen',
                  icon: '👤',
                  desc: 'Report issues, track progress, vote on problems, and give feedback after resolution.',
                  color: '#2c7be5' },
                { role: 'Admin',
                  icon: '👨‍💼',
                  desc: 'Approve accounts, assign issues to authorities, and monitor overall performance.',
                  color: '#198754' },
                { role: 'Authority',
                  icon: '👷',
                  desc: 'Receive assigned issues, update work status, and upload completion photos.',
                  color: '#fd7e14' },
              ].map((r, i) => (
                <div key={i} style={{
                  ...styles.roleCard,
                  borderTop:
                    `4px solid ${r.color}`,
                }}>
                  <div style={styles.roleIcon}>
                    {r.icon}
                  </div>
                  <h6 style={{
                    color: r.color,
                    fontWeight: '700',
                    marginBottom: '8px',
                  }}>
                    {r.role}
                  </h6>
                  <p style={styles.roleDesc}>
                    {r.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <section
        id="services"
        style={{
          ...styles.section,
          background: '#f0f7ff',
        }}
      >
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Our Services
            </h2>
            <p style={styles.sectionSubtitle}>
              Everything you need to report and
              resolve civic issues
            </p>
          </div>
          <div style={styles.servicesGrid}>
            {[
              { icon: '📸',
                title: 'Photo Evidence',
                desc: 'Upload before and after photos for visual proof of issue and resolution.' },
              { icon: '📍',
                title: 'Location Tracking',
                desc: 'Pin exact location of issues with ward number, pincode and landmark.' },
              { icon: '🔔',
                title: 'Email Notifications',
                desc: 'Get notified at every stage from assignment to completion.' },
              { icon: '📊',
                title: 'Real-time Analytics',
                desc: 'View issue statistics, resolution rates and authority performance.' },
              { icon: '🚨',
                title: 'Emergency Alerts',
                desc: 'Flag critical issues like open manholes for immediate action.' },
              { icon: '⭐',
                title: 'Rating System',
                desc: 'Rate the quality of work done by authorities after completion.' },
              { icon: '🗳️',
                title: 'Voting System',
                desc: 'Vote on issues to increase their priority for faster resolution.' },
              { icon: '🏆',
                title: 'Reward Points',
                desc: 'Earn points for reporting, voting and giving feedback.' },
            ].map((service, i) => (
              <div key={i} style={styles.serviceCard}>
                <div style={styles.serviceIcon}>
                  {service.icon}
                </div>
                <h6 style={styles.serviceTitle}>
                  {service.title}
                </h6>
                <p style={styles.serviceDesc}>
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ISSUE TYPES ── */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Types of Issues You Can Report
            </h2>
          </div>
          <div style={styles.issueTypesGrid}>
            {issueTypes.map((type, i) => (
              <div key={i} style={{
                ...styles.issueTypeCard,
                borderLeft:
                  `4px solid ${type.color}`,
              }}>
                <div style={{
                  ...styles.issueTypeIcon,
                  color: type.color,
                  background:
                    `${type.color}15`,
                }}>
                  {type.icon}
                </div>
                <span style={styles.issueTypeLabel}>
                  {type.label}
                </span>
              </div>
            ))}
            <div style={{
              ...styles.issueTypeCard,
              borderLeft: '4px solid #6c757d',
            }}>
              <div style={{
                ...styles.issueTypeIcon,
                color: '#6c757d',
                background: '#6c757d15',
              }}>
                ➕
              </div>
              <span style={styles.issueTypeLabel}>
                Other Issues
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PUBLIC ISSUES ── */}
      <section
        id="public-issues"
        style={{
          ...styles.section,
          background: '#f0f7ff',
        }}
      >
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Recent Public Issues
            </h2>
            <p style={styles.sectionSubtitle}>
              Issues reported by citizens in
              your community
            </p>
          </div>

          {/* Search */}
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by city..."
              value={searchCity}
              onChange={(e) =>
                setSearchCity(e.target.value)
              }
              style={styles.searchInput}
            />
            <button
              style={styles.searchBtn}
              onClick={() =>
                fetchPublicIssues(searchCity)
              }
            >
              Search
            </button>
          </div>

          {/* Issues Grid */}
          {publicIssues.length > 0 ? (
            <div style={styles.issuesGrid}>
              {publicIssues.map((issue, i) => (
                <div
                  key={i}
                  style={styles.issueCard}
                >
                  {/* Image */}
                  {issue.reportedImage && (
                    <div style={
                      styles.issueCardImage
                    }>
                      <img
                        src={`http://localhost:8080${issue.reportedImage}`}
                        alt={issue.title}
                        style={styles.issueImg}
                        onError={(e) => {
                          e.target.style.display
                            = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div style={
                    styles.issueCardBody
                  }>
                    {/* Emergency Badge */}
                    {issue.emergency && (
                      <span style={
                        styles.emergencyBadge
                      }>
                        🚨 Emergency
                      </span>
                    )}

                    <h6 style={styles.issueTitle}>
                      {issue.title}
                    </h6>
                    <p style={styles.issueMeta}>
                      📍 {issue.city},
                      Ward {issue.wardNumber}
                    </p>
                    <p style={styles.issueMeta}>
                      🏷️ {issue.issueType}
                    </p>

                    <div style={styles.issueFooter}>
                      <span style={{
                        ...styles.statusPill,
                        background: getStatusColor(
                          issue.status
                        ),
                      }}>
                        {issue.status?.replace(
                          '_', ' '
                        )}
                      </span>
                      <span style={
                        styles.voteCount
                      }>
                        👍 {issue.voteCount} votes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.noIssues}>
              <p>No public issues found.</p>
              <Link
                to="/register"
                style={styles.primaryBtn}
              >
                Be the First to Report!
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              How It Works
            </h2>
          </div>
          <div style={styles.stepsGrid}>
            {[
              { step: '1', icon: '📝',
                title: 'Register',
                desc: 'Create your account with ID verification. Admin approves within 24 hours.' },
              { step: '2', icon: '📸',
                title: 'Report Issue',
                desc: 'Upload photo, describe the problem, and pin the location.' },
              { step: '3', icon: '✅',
                title: 'Admin Assigns',
                desc: 'Admin reviews and assigns issue to the right department.' },
              { step: '4', icon: '👷',
                title: 'Work Begins',
                desc: 'Authority updates status as work progresses.' },
              { step: '5', icon: '🎉',
                title: 'Issue Resolved',
                desc: 'Get notified when done. Rate the work quality!' },
            ].map((step, i) => (
              <div key={i} style={styles.stepCard}>
                <div style={styles.stepNumber}>
                  {step.step}
                </div>
                <div style={styles.stepIcon}>
                  {step.icon}
                </div>
                <h6 style={styles.stepTitle}>
                  {step.title}
                </h6>
                <p style={styles.stepDesc}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section
        id="contact"
        style={{
          ...styles.section,
          background: '#f0f7ff',
        }}
      >
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Contact Us
            </h2>
            <p style={styles.sectionSubtitle}>
              Have questions? We are here to help
            </p>
          </div>
          <div style={styles.contactGrid}>
            <div style={styles.contactInfo}>
              {[
                { icon: '📍',
                  title: 'Address',
                  info: 'Municipal Corporation Office, Chennai - 600001' },
                { icon: '📞',
                  title: 'Phone',
                  info: '+91 98765 43210' },
                { icon: '📧',
                  title: 'Email',
                  info: 'support@civicfix.gov.in' },
                { icon: '🕐',
                  title: 'Working Hours',
                  info: 'Mon-Fri: 9AM-6PM, Sat: 9AM-2PM' },
              ].map((c, i) => (
                <div key={i} style={styles.contactCard}>
                  <span style={styles.contactIcon}>
                    {c.icon}
                  </span>
                  <div>
                    <h6 style={styles.contactTitle}>
                      {c.title}
                    </h6>
                    <p style={styles.contactInfo2}>
                      {c.info}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div style={styles.contactForm}>
              <h5 style={{ marginBottom: '20px',
                color: '#333' }}>
                Send us a Message
              </h5>
              {['Full Name', 'Email Address',
                'Subject'].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  style={styles.formInput}
                />
              ))}
              <textarea
                placeholder="Your Message..."
                rows={4}
                style={styles.formTextarea}
              />
              <button style={styles.submitBtn}>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const styles = {
  hero: {
    background:
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    padding: '100px 60px 60px',
    gap: '60px',
    flexWrap: 'wrap',
  },
  heroContent: {
    flex: 1,
    minWidth: '300px',
    maxWidth: '600px',
  },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(44,123,229,0.2)',
    color: '#2c7be5',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
    border: '1px solid rgba(44,123,229,0.3)',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    color: 'white',
    lineHeight: '1.2',
    marginBottom: '20px',
  },
  heroHighlight: {
    color: '#2c7be5',
  },
  heroSubtitle: {
    fontSize: '17px',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: '1.7',
    marginBottom: '35px',
  },
  heroBtns: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    marginBottom: '35px',
  },
  primaryBtn: {
    padding: '13px 28px',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '13px 28px',
    background: 'transparent',
    color: 'white',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    border: '2px solid rgba(255,255,255,0.4)',
  },
  trackBox: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  trackLabel: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '12px',
    fontSize: '14px',
  },
  trackInput: {
    display: 'flex',
    gap: '10px',
  },
  trackField: {
    flex: 1,
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
  },
  trackBtn: {
    padding: '10px 20px',
    background: '#2c7be5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  heroImage: {
    flex: 1,
    minWidth: '280px',
    maxWidth: '420px',
  },
  heroCard: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
  },
  heroCardHeader: {
    color: 'white',
    fontWeight: '700',
    fontSize: '16px',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom:
      '1px solid rgba(255,255,255,0.15)',
  },
  heroIssue: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  heroIssueLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  heroIssueTitle: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
  },
  heroIssueArea: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
  },
  heroStatus: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '10px',
    color: 'white',
    fontWeight: '600',
  },
statsSection: {
  background:
    'linear-gradient(180deg, #0f3460 0%, #f8f9fa 100%)',
  padding: '70px 20px',
},
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '30px',
  },
statCard: {
  textAlign: 'center',
  padding: '35px 25px',
  borderRadius: '16px',
  background: 'white',
  boxShadow:
    '0 8px 30px rgba(0,0,0,0.12)',
  transition: 'transform 0.2s ease',
},
statValue: {
  fontSize: '44px',
  fontWeight: '800',
  margin: '8px 0 5px',
  display: 'block',
},
statLabel: {
  color: '#6c757d',
  fontSize: '15px',
  margin: 0,
  fontWeight: '500',
},
statIcon: {
  fontSize: '42px',
  marginBottom: '5px',
  display: 'block',
},
  section: {
    padding: '80px 20px',
    background: 'white',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: '12px',
  },
  sectionSubtitle: {
    fontSize: '16px',
    color: '#6c757d',
  },
  aboutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '50px',
    alignItems: 'start',
  },
  aboutText: {},
  aboutPara: {
    color: '#555',
    lineHeight: '1.8',
    marginBottom: '15px',
  },
  rolesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  roleCard: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
  },
  roleIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  roleDesc: {
    color: '#6c757d',
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.6',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '25px',
  },
  serviceCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    textAlign: 'center',
    boxShadow:
      '0 2px 15px rgba(0,0,0,0.07)',
    transition: 'transform 0.2s ease',
  },
  serviceIcon: {
    fontSize: '36px',
    marginBottom: '15px',
  },
  serviceTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '10px',
  },
  serviceDesc: {
    color: '#6c757d',
    fontSize: '13px',
    lineHeight: '1.6',
    margin: 0,
  },
  issueTypesGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
  },
  issueTypeCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  issueTypeIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
  issueTypeLabel: {
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  searchBox: {
    display: 'flex',
    gap: '10px',
    maxWidth: '500px',
    margin: '0 auto 40px',
    alignItems: 'center',
    background: 'white',
    borderRadius: '10px',
    padding: '10px 15px',
    boxShadow:
      '0 2px 15px rgba(0,0,0,0.08)',
  },
  searchIcon: {
    color: '#6c757d',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  searchBtn: {
    padding: '8px 20px',
    background: '#2c7be5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  issuesGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  issueCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow:
      '0 2px 15px rgba(0,0,0,0.08)',
  },
  issueCardImage: {
    height: '160px',
    overflow: 'hidden',
    background: '#f0f0f0',
  },
  issueImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  issueCardBody: {
    padding: '15px',
  },
  emergencyBadge: {
    background: '#dc3545',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'inline-block',
  },
  issueTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '6px',
    fontSize: '15px',
  },
  issueMeta: {
    color: '#6c757d',
    fontSize: '12px',
    margin: '3px 0',
  },
  issueFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
  },
  statusPill: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    color: 'white',
    fontWeight: '600',
  },
  voteCount: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '600',
  },
  noIssues: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '25px',
  },
  stepCard: {
    textAlign: 'center',
    padding: '25px 15px',
  },
  stepNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#2c7be5',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '18px',
    margin: '0 auto 12px',
  },
  stepIcon: {
    fontSize: '30px',
    marginBottom: '12px',
  },
  stepTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '8px',
  },
  stepDesc: {
    color: '#6c757d',
    fontSize: '13px',
    lineHeight: '1.6',
    margin: 0,
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '50px',
    alignItems: 'start',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  contactCard: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start',
    background: 'white',
    padding: '18px',
    borderRadius: '10px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  contactIcon: {
    fontSize: '24px',
  },
  contactTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 4px',
    fontSize: '14px',
  },
  contactInfo2: {
    color: '#6c757d',
    margin: 0,
    fontSize: '13px',
  },
  contactForm: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow:
      '0 2px 15px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formInput: {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  formTextarea: {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '12px',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    fontFamily: 'inherit',
  },
};

export default Landing;
