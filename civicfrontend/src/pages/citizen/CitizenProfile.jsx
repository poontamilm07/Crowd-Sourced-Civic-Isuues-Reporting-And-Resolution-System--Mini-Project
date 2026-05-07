import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCity, FaPlus, FaList, FaSearch,
  FaGlobe, FaUser, FaSignOutAlt,
  FaChartBar, FaTrophy,
  FaMapMarkerAlt, FaEnvelope, FaIdCard, FaCalendar
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { citizenAPI } from '../../api/axios';

const CitizenProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    {
      id: 'dashboard', icon: <FaChartBar />,
      label: 'Dashboard',
      path: '/citizen/dashboard',
    },
    {
      id: 'report', icon: <FaPlus />,
      label: 'Report Issue',
      path: '/citizen/report-issue',
    },
    {
      id: 'my-issues', icon: <FaList />,
      label: 'My Issues',
      path: '/citizen/my-issues',
    },
    {
      id: 'track', icon: <FaSearch />,
      label: 'Track Issue',
      path: '/citizen/track-issue',
    },
    {
      id: 'public', icon: <FaGlobe />,
      label: 'Public Issues',
      path: '/citizen/public-issues',
    },
    {
      id: 'profile', icon: <FaUser />,
      label: 'My Profile',
      path: '/citizen/profile',
    },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profileRes =
        await citizenAPI.getProfile();
      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }
    } catch (err) {
      console.error('Profile error:', err);
    }

    try {
      const statsRes =
        await citizenAPI.getDashboardStats();
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRewardBadge = (points) => {
    if (points >= 100)
      return {
        label: 'Gold', icon: '🥇',
        color: '#ffc107',
      };
    if (points >= 50)
      return {
        label: 'Silver', icon: '🥈',
        color: '#adb5bd',
      };
    if (points >= 20)
      return {
        label: 'Bronze', icon: '🥉',
        color: '#cd7f32',
      };
    return {
      label: 'Starter', icon: '🌱',
      color: '#198754',
    };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr)
      .toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <p>Loading profile...</p>
      </div>
    );
  }

  const badge = getRewardBadge(
    profile?.rewardPoints || 0
  );

  return (
    <div style={styles.layout}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <FaCity style={styles.brandIcon} />
          <span style={styles.brandName}>
            CivicFix
          </span>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {(profile?.name || user?.name)
              ?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={styles.userName}>
              {profile?.name || user?.name}
            </p>
            <p style={styles.userRole}>
              👤 Citizen
            </p>
          </div>
        </div>
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(item.id === 'profile'
                  ? styles.navItemActive
                  : {}),
              }}
            >
              <span style={styles.navIcon}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          style={styles.logoutBtn}
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <FaSignOutAlt /> &nbsp;Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>

        <div style={styles.header}>
          <h4 style={styles.pageTitle}>
            My Profile
          </h4>
          <p style={styles.pageSubtitle}>
            Your account information
          </p>
        </div>

        <div style={styles.profileGrid}>

          {/* Profile Card */}
          <div style={styles.profileCard}>

            {/* Avatar Section */}
            <div style={styles.avatarSection}>
              <div style={styles.bigAvatar}>
                {(profile?.name || user?.name)
                  ?.charAt(0).toUpperCase()}
              </div>
              <h5 style={styles.profileName}>
                {profile?.name || user?.name}
              </h5>
              <p style={styles.profileRole}>
                👤 Citizen
              </p>
              <div style={styles.rewardBadge}>
                <span style={styles.badgeIcon}>
                  {badge.icon}
                </span>
                <span style={{
                  ...styles.badgeLabel,
                  color: badge.color,
                }}>
                  {badge.label} Member
                </span>
              </div>
            </div>

            {/* Info List */}
            <div style={styles.infoList}>
              {[
                {
                  icon: <FaEnvelope />,
                  label: 'Email',
                  value: profile?.email,
                },
                {
                  icon: <FaMapMarkerAlt />,
                  label: 'City',
                  value: profile?.city,
                },
                {
                  icon: <FaMapMarkerAlt />,
                  label: 'Village / Area',
                  value: profile?.villageOrArea,
                },
                {
                  icon: <FaMapMarkerAlt />,
                  label: 'Ward Number',
                  value: profile?.wardNumber,
                },
                {
                  icon: <FaMapMarkerAlt />,
                  label: 'Pincode',
                  value: profile?.pincode,
                },
                {
  icon: <FaMapMarkerAlt />,
  label: 'Taluk',
  value: profile?.taluk,
},
{
  icon: <FaCalendar />,
  label: 'Date of Birth',
  value: profile?.dateOfBirth,
},
                {
                  icon: <FaMapMarkerAlt />,
                  label: 'Address',
                  value: profile?.address,
                },
              ].map((info, i) => (
                <div
                  key={i}
                  style={styles.infoItem}
                >
                  <span style={styles.infoIcon}>
                    {info.icon}
                  </span>
                  <div style={styles.infoContent}>
                    <p style={styles.infoLabel}>
                      {info.label}
                    </p>
                    <p style={styles.infoValue}>
                      {info.value || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ID Card */}
            {profile?.idCardPhoto && (
              <div style={styles.idCardSection}>
                <h6 style={styles.idCardTitle}>
                  <FaIdCard
                    style={styles.idIcon}
                  />
                  &nbsp; ID Card
                </h6>
                <img
                  src={`http://localhost:8080${profile.idCardPhoto}`}
                  alt="ID Card"
                  style={styles.idCardImg}
                  onError={(e) => {
                    e.target.style.display =
                      'none';
                  }}
                />
              </div>
            )}

          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              {[
                {
                  label: 'Total Issues',
                  value:
                    stats?.totalIssues || 0,
                  icon: '📋',
                  color: '#2c7be5',
                  bg: '#f0f7ff',
                },
                {
                  label: 'Completed',
                  value:
                    stats?.completedIssues || 0,
                  icon: '✅',
                  color: '#198754',
                  bg: '#f0fff4',
                },
                {
                  label: 'In Progress',
                  value:
                    stats?.inProgressIssues || 0,
                  icon: '⚙️',
                  color: '#fd7e14',
                  bg: '#fff8f0',
                },
                {
                  label: 'Pending',
                  value:
                    stats?.reportedIssues || 0,
                  icon: '⏳',
                  color: '#6c757d',
                  bg: '#f8f9fa',
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.statCard,
                    background: stat.bg,
                    borderLeft:
                      `4px solid ${stat.color}`,
                  }}
                >
                  <div style={styles.statTop}>
                    <span style={styles.statIcon}>
                      {stat.icon}
                    </span>
                    <span style={{
                      ...styles.statValue,
                      color: stat.color,
                    }}>
                      {stat.value}
                    </span>
                  </div>
                  <p style={styles.statLabel}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Reward Points Card */}
            <div style={styles.rewardCard}>
              <div style={styles.rewardHeader}>
                <FaTrophy
                  style={styles.trophyIcon}
                />
                <h5 style={styles.rewardTitle}>
                  Reward Points
                </h5>
              </div>
              <div style={styles.rewardPoints}>
                <span style={styles.pointsNum}>
                  {profile?.rewardPoints || 0}
                </span>
                <span style={styles.pointsLabel}>
                  Points Earned
                </span>
              </div>
              <div style={styles.rewardBreakdown}>
                {[
                  {
                    action: 'Report an issue',
                    points: '+10 pts',
                    icon: '📋',
                  },
                  {
                    action: 'Vote on issue',
                    points: '+2 pts',
                    icon: '👍',
                  },
                  {
                    action: 'Submit feedback',
                    points: '+5 pts',
                    icon: '⭐',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={styles.breakdownItem}
                  >
                    <span style={
                      styles.breakdownIcon
                    }>
                      {item.icon}
                    </span>
                    <span style={
                      styles.breakdownAction
                    }>
                      {item.action}
                    </span>
                    <span style={
                      styles.breakdownPoints
                    }>
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>

              {/* Badge Progress */}
              <div style={styles.badgeProgress}>
                <p style={
                  styles.badgeProgressTitle
                }>
                  Your Badge Level
                </p>
                <div style={styles.badgeLevels}>
                  {[
                    {
                      label: '🌱 Starter',
                      min: 0, max: 19,
                    },
                    {
                      label: '🥉 Bronze',
                      min: 20, max: 49,
                    },
                    {
                      label: '🥈 Silver',
                      min: 50, max: 99,
                    },
                    {
                      label: '🥇 Gold',
                      min: 100, max: 999,
                    },
                  ].map((level, i) => {
                    const pts =
                      profile?.rewardPoints || 0;
                    const isActive =
                      pts >= level.min &&
                      pts <= level.max;
                    const isPast =
                      pts > level.max;
                    return (
                      <div
                        key={i}
                        style={{
                          ...styles.badgeLevel,
                          ...(isActive
                            ? styles.badgeLevelActive
                            : {}),
                          ...(isPast
                            ? styles.badgeLevelPast
                            : {}),
                        }}
                      >
                        {level.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div style={styles.accountCard}>
              <h6 style={styles.accountTitle}>
                Account Information
              </h6>
              <div style={styles.accountItems}>
                <div style={styles.accountItem}>
                  <span style={
                    styles.accountLabel
                  }>
                    Account Status
                  </span>
                  <span style={
                    styles.approvedBadge
                  }>
                    ✅ {profile?.status ||
                      'Approved'}
                  </span>
                </div>
                <div style={styles.accountItem}>
                  <span style={
                    styles.accountLabel
                  }>
                    Role
                  </span>
                  <span style={
                    styles.accountValue
                  }>
                    Citizen
                  </span>
                </div>
                <div style={styles.accountItem}>
                  <span style={
                    styles.accountLabel
                  }>
                    Member Since
                  </span>
                  <span style={
                    styles.accountValue
                  }>
                    {formatDate(
                      profile?.createdAt
                    )}
                  </span>
                </div>
                <div style={styles.accountItem}>
                  <span style={
                    styles.accountLabel
                  }>
                    Total Issues Reported
                  </span>
                  <span style={{
                    ...styles.accountValue,
                    color: '#2c7be5',
                    fontWeight: '700',
                  }}>
                    {profile?.totalIssuesReported
                      || 0}
                  </span>
                </div>
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
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8f9fa',
  },
  loadingScreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: '#6c757d',
  },
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    background:
      'linear-gradient(180deg, #1a1a2e, #16213e, #0f3460)',
    color: 'white',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflowY: 'auto',
  },
  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px',
    borderBottom:
      '1px solid rgba(255,255,255,0.1)',
  },
  brandIcon: {
    fontSize: '24px',
    color: '#2c7be5',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#2c7be5',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px 20px',
    background: 'rgba(255,255,255,0.05)',
    margin: '10px',
    borderRadius: '10px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#2c7be5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
    flexShrink: 0,
    color: 'white',
  },
  userName: {
    margin: 0,
    fontWeight: '600',
    fontSize: '14px',
    color: 'white',
  },
  userRole: {
    margin: 0,
    fontSize: '11px',
    color: 'rgba(255,255,255,0.6)',
  },
  nav: {
    padding: '10px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 15px',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '3px',
  },
  navItemActive: {
    background: 'rgba(44,123,229,0.25)',
    color: 'white',
    borderLeft: '3px solid #2c7be5',
  },
  navIcon: {
    fontSize: '16px',
    width: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    margin: '10px',
    padding: '11px 15px',
    background: 'rgba(220,53,69,0.15)',
    border: '1px solid rgba(220,53,69,0.3)',
    color: '#ff6b6b',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  mainContent: {
    marginLeft: '250px',
    flex: 1,
    padding: '25px',
  },
  header: {
    marginBottom: '25px',
  },
  pageTitle: {
    margin: '0 0 5px',
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: '22px',
  },
  pageSubtitle: {
    margin: 0,
    color: '#6c757d',
    fontSize: '14px',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  profileCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow:
      '0 2px 15px rgba(0,0,0,0.07)',
  },
  avatarSection: {
    background:
      'linear-gradient(135deg, #1a1a2e, #0f3460)',
    padding: '30px 20px',
    textAlign: 'center',
  },
  bigAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#2c7be5',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '800',
    margin: '0 auto 15px',
    border: '3px solid rgba(255,255,255,0.3)',
  },
  profileName: {
    color: 'white',
    fontWeight: '700',
    margin: '0 0 5px',
    fontSize: '18px',
  },
  profileRole: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    margin: '0 0 12px',
  },
  rewardBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.1)',
    padding: '5px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  badgeIcon: {
    fontSize: '16px',
  },
  badgeLabel: {
    fontSize: '12px',
    fontWeight: '700',
  },
  infoList: {
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '10px 12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #f0f0f0',
  },
  infoIcon: {
    color: '#2c7be5',
    fontSize: '14px',
    marginTop: '3px',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    margin: '0 0 3px',
    fontSize: '11px',
    color: '#adb5bd',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    margin: 0,
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
    wordBreak: 'break-word',
  },
  idCardSection: {
    padding: '15px',
    borderTop: '1px solid #f0f0f0',
  },
  idCardTitle: {
    display: 'flex',
    alignItems: 'center',
    color: '#555',
    marginBottom: '10px',
    fontSize: '13px',
    fontWeight: '600',
  },
  idIcon: {
    color: '#2c7be5',
  },
  idCardImg: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  statCard: {
    borderRadius: '10px',
    padding: '15px',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.05)',
  },
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  statIcon: {
    fontSize: '22px',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: '800',
  },
  statLabel: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px',
    fontWeight: '500',
  },
  rewardCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 15px rgba(0,0,0,0.07)',
  },
  rewardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  trophyIcon: {
    fontSize: '24px',
    color: '#ffc107',
  },
  rewardTitle: {
    margin: 0,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  rewardPoints: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '20px',
    padding: '15px',
    background: '#fff8e1',
    borderRadius: '10px',
    border: '1px solid #ffe082',
  },
  pointsNum: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#ffc107',
  },
  pointsLabel: {
    color: '#856404',
    fontSize: '14px',
    fontWeight: '600',
  },
  rewardBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  breakdownIcon: {
    fontSize: '18px',
  },
  breakdownAction: {
    flex: 1,
    fontSize: '13px',
    color: '#555',
  },
  breakdownPoints: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#198754',
  },
  badgeProgress: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: '15px',
  },
  badgeProgressTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '10px',
  },
  badgeLevels: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  badgeLevel: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    background: '#f8f9fa',
    color: '#adb5bd',
    border: '1px solid #dee2e6',
  },
  badgeLevelActive: {
    background: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffc107',
    fontWeight: '700',
  },
  badgeLevelPast: {
    background: '#d1e7dd',
    color: '#0f5132',
    border: '1px solid #198754',
  },
  accountCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 15px rgba(0,0,0,0.07)',
  },
  accountTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '15px',
    fontSize: '15px',
  },
  accountItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  accountItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  accountLabel: {
    fontSize: '13px',
    color: '#6c757d',
  },
  accountValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  },
  approvedBadge: {
    background: '#d1e7dd',
    color: '#0f5132',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
};

export default CitizenProfile;
