import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCity, FaClipboardList, FaUser,
  FaSignOutAlt, FaChartBar, FaStar,
  FaTrophy, FaEnvelope, FaPhone,
  FaBuilding, FaMapMarkerAlt,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authorityAPI } from '../../api/axios';

const AuthorityProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [performance, setPerformance] =
    useState(null);
  const [feedbacks, setFeedbacks] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState('profile');

  const menuItems = [
    {
      id: 'dashboard',
      icon: <FaChartBar />,
      label: 'Dashboard',
      path: '/authority/dashboard',
    },
    {
      id: 'issues',
      icon: <FaClipboardList />,
      label: 'Assigned Issues',
      path: '/authority/assigned-issues',
    },
    {
      id: 'profile',
      icon: <FaUser />,
      label: 'My Profile',
      path: '/authority/profile',
    },
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [profileRes, perfRes,
        feedbackRes] = await Promise.all([
        authorityAPI.getProfile(),
        authorityAPI.getPerformance(),
        authorityAPI.getMyFeedbacks(),
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }
      if (perfRes.data.success) {
        setPerformance(perfRes.data.data);
      }
      if (feedbackRes.data.success) {
        setFeedbacks(feedbackRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
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

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((s) => (
      <FaStar
        key={s}
        style={{
          color: s <= Math.round(rating || 0)
            ? '#ffc107'
            : '#dee2e6',
          fontSize: '14px',
        }}
      />
    ));
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <p>Loading profile...</p>
      </div>
    );
  }

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
            👷
          </div>
          <div>
            <p style={styles.userName}>
              {user?.name}
            </p>
            <p style={styles.userRole}>
              🔧 Authority
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
            Your account details and
            performance analytics
          </p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { id: 'profile', label: '👤 Profile' },
            {
              id: 'performance',
              label: '📊 Performance',
            },
            {
              id: 'feedbacks',
              label: `⭐ Feedbacks (${
                feedbacks.length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id
                  ? styles.tabActive
                  : {}),
              }}
              onClick={() =>
                setActiveTab(tab.id)
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={styles.profileGrid}>

            {/* Profile Card */}
            <div style={styles.profileCard}>
              <div style={styles.avatarSection}>
                <div style={styles.bigAvatar}>
                  👷
                </div>
                <h5 style={styles.profileName}>
                  {profile?.name}
                </h5>
                <p style={styles.profileRole}>
                  🔧 Authority Officer
                </p>
                <div style={styles.deptBadge}>
                  🏢 {profile?.department}
                </div>
              </div>

              <div style={styles.infoList}>
                {[
                  {
                    icon: <FaEnvelope />,
                    label: 'Email',
                    value: profile?.email,
                  },
                  {
                    icon: <FaPhone />,
                    label: 'Contact',
                    value:
                      profile?.contactNumber
                      || 'N/A',
                  },
                  {
                    icon: <FaBuilding />,
                    label: 'Department',
                    value: profile?.department,
                  },
                  {
                    icon: <FaMapMarkerAlt />,
                    label: 'City',
                    value: profile?.city,
                  },
                  {
                    icon: <FaMapMarkerAlt />,
                    label: 'Ward',
                    value: profile?.wardNumber,
                  },
                ].map((info, i) => (
                  <div
                    key={i}
                    style={styles.infoItem}
                  >
                    <span style={styles.infoIcon}>
                      {info.icon}
                    </span>
                    <div>
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
            </div>

            {/* Stats Column */}
            <div style={styles.statsColumn}>

              {/* Issue Stats */}
              <div style={styles.statsCard}>
                <h6 style={styles.statsTitle}>
                  📋 Issue Statistics
                </h6>
                <div style={styles.statsGrid}>
                  {[
                    {
                      label: 'Total Assigned',
                      value:
                        profile?.totalAssigned
                        || 0,
                      color: '#2c7be5',
                    },
                    {
                      label: 'Completed',
                      value:
                        profile?.totalCompleted
                        || 0,
                      color: '#198754',
                    },
                    {
                      label: 'In Progress',
                      value:
                        profile?.inProgress || 0,
                      color: '#fd7e14',
                    },
                    {
                      label: 'Total Feedbacks',
                      value:
                        profile?.totalFeedbacks
                        || 0,
                      color: '#ffc107',
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={styles.statItem}
                    >
                      <span style={{
                        ...styles.statNum,
                        color: stat.color,
                      }}>
                        {stat.value}
                      </span>
                      <span style={styles.statLabel}>
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Card */}
              <div style={styles.ratingCard}>
                <div style={styles.ratingHeader}>
                  <FaTrophy
                    style={styles.trophyIcon}
                  />
                  <h6 style={styles.ratingTitle}>
                    Performance Rating
                  </h6>
                </div>
                <div style={styles.ratingDisplay}>
                  <span style={styles.ratingBig}>
                    {profile?.averageRating
                      ?.toFixed(1) || '0.0'}
                  </span>
                  <div style={styles.starsRow}>
                    {renderStars(
                      profile?.averageRating
                    )}
                  </div>
                  <p style={styles.ratingSubtext}>
                    Based on{' '}
                    {profile?.totalFeedbacks || 0}
                    {' '}citizen reviews
                  </p>
                </div>

                {/* Rating Distribution */}
                {profile?.ratingDistribution && (
                  <div style={styles.ratingDist}>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count =
                        profile
                          .ratingDistribution[star]
                        || 0;
                      const total =
                        profile?.totalFeedbacks
                        || 1;
                      const pct = Math.round(
                        (count / total) * 100
                      );
                      return (
                        <div
                          key={star}
                          style={styles.distRow}
                        >
                          <span style={styles.distStar}>
                            {star}★
                          </span>
                          <div style={styles.distBar}>
                            <div style={{
                              ...styles.distFill,
                              width: `${pct}%`,
                            }} />
                          </div>
                          <span style={styles.distCount}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div style={styles.accountCard}>
                <h6 style={styles.accountTitle}>
                  Account Information
                </h6>
                <div style={styles.accountItems}>
                  <div style={styles.accountItem}>
                    <span style={styles.accountLabel}>
                      Status
                    </span>
                    <span style={styles.approvedBadge}>
                      ✅ Approved
                    </span>
                  </div>
                  <div style={styles.accountItem}>
                    <span style={styles.accountLabel}>
                      Role
                    </span>
                    <span style={styles.accountValue}>
                      Authority Officer
                    </span>
                  </div>
                  <div style={styles.accountItem}>
                    <span style={styles.accountLabel}>
                      Resolution Rate
                    </span>
                    <span style={{
                      ...styles.accountValue,
                      color: '#198754',
                      fontWeight: '700',
                    }}>
                      {performance
                        ?.resolutionRate
                        ?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div style={styles.perfTab}>
            <div style={styles.perfCards}>
              {[
                {
                  label: 'Total Assigned',
                  value:
                    performance?.totalAssigned
                    || 0,
                  icon: '📋',
                  color: '#2c7be5',
                  bg: '#f0f7ff',
                },
                {
                  label: 'Completed',
                  value:
                    performance?.totalCompleted
                    || 0,
                  icon: '✅',
                  color: '#198754',
                  bg: '#f0fff4',
                },
                {
                  label: 'Avg Rating',
                  value:
                    performance?.averageRating
                      ?.toFixed(1) || '0.0',
                  icon: '⭐',
                  color: '#ffc107',
                  bg: '#fffdf0',
                },
                {
                  label: 'Resolution Rate',
                  value: `${
                    performance?.resolutionRate
                      ?.toFixed(1) || '0.0'
                  }%`,
                  icon: '📈',
                  color: '#6f42c1',
                  bg: '#f5f0ff',
                },
                {
                  label: 'Total Feedbacks',
                  value:
                    performance?.totalFeedbacks
                    || 0,
                  icon: '💬',
                  color: '#fd7e14',
                  bg: '#fff8f0',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.perfCard,
                    background: card.bg,
                    borderLeft:
                      `4px solid ${card.color}`,
                  }}
                >
                  <div style={styles.perfCardTop}>
                    <span style={styles.perfIcon}>
                      {card.icon}
                    </span>
                    <span style={{
                      ...styles.perfValue,
                      color: card.color,
                    }}>
                      {card.value}
                    </span>
                  </div>
                  <p style={styles.perfLabel}>
                    {card.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Rating Distribution */}
            <div style={styles.distCard}>
              <h6 style={styles.distTitle}>
                ⭐ Rating Distribution
              </h6>
              {performance?.ratingDistribution
                ? (
                <div style={styles.distList}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count =
                      performance
                        .ratingDistribution[star]
                      || 0;
                    const total =
                      performance?.totalFeedbacks
                      || 1;
                    const pct = Math.round(
                      (count / total) * 100
                    );
                    return (
                      <div
                        key={star}
                        style={styles.distRow}
                      >
                        <span style={styles.distStar}>
                          {star}★
                        </span>
                        <div style={styles.distBarWide}>
                          <div style={{
                            ...styles.distFillWide,
                            width: `${pct}%`,
                          }} />
                        </div>
                        <span style={styles.distPct}>
                          {pct}% ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={styles.noData}>
                  No rating data yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Feedbacks Tab */}
        {activeTab === 'feedbacks' && (
          <div style={styles.feedbacksTab}>
            {feedbacks.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyIcon}>
                  ⭐
                </p>
                <p style={styles.emptyText}>
                  No feedbacks received yet.
                </p>
              </div>
            ) : (
              <div style={styles.feedbackList}>
                {feedbacks.map(
                  (feedback, i) => (
                    <div
                      key={i}
                      style={styles.feedbackItem}
                    >
                      <div style={styles.fbHeader}>
                        <div style={styles.fbLeft}>
                          <div style={
                            styles.fbAvatar
                          }>
                            {feedback.citizenName
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p style={styles.fbName}>
                              {feedback.citizenName}
                            </p>
                            <p style={styles.fbIssue}>
                              {feedback.issueCode}
                              {' '}— {feedback
                                .issueTitle}
                            </p>
                          </div>
                        </div>
                        <div style={styles.fbRight}>
                          <div style={styles.fbStars}>
                            {renderStars(
                              feedback.starRating
                            )}
                            <span style={
                              styles.fbRating
                            }>
                              {feedback.starRating}
                              /5
                            </span>
                          </div>
                          <p style={styles.fbDate}>
                            {formatDate(
                              feedback.submittedAt
                            )}
                          </p>
                        </div>
                      </div>

                      {feedback.comment && (
                        <div style={styles.fbComment}>
                          <p style={styles.fbCommentText}>
                            "{feedback.comment}"
                          </p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

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
    fontSize: '20px',
    flexShrink: 0,
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
    marginBottom: '20px',
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
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '9px 20px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    fontWeight: '500',
    color: '#6c757d',
  },
  tabActive: {
    background: '#2c7be5',
    color: 'white',
    border: '1px solid #2c7be5',
    fontWeight: '600',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
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
    fontSize: '50px',
    marginBottom: '12px',
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
  deptBadge: {
    display: 'inline-block',
    background: 'rgba(44,123,229,0.2)',
    color: '#2c7be5',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(44,123,229,0.3)',
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
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  infoIcon: {
    color: '#2c7be5',
    fontSize: '14px',
    marginTop: '2px',
    flexShrink: 0,
  },
  infoLabel: {
    margin: '0 0 2px',
    fontSize: '11px',
    color: '#adb5bd',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    margin: 0,
    fontSize: '13px',
    color: '#333',
    fontWeight: '500',
  },
  statsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  statsCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  statsTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '15px',
    fontSize: '15px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  statItem: {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center',
  },
  statNum: {
    fontSize: '28px',
    fontWeight: '800',
    display: 'block',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6c757d',
    margin: 0,
  },
  ratingCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  ratingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  trophyIcon: {
    fontSize: '22px',
    color: '#ffc107',
  },
  ratingTitle: {
    margin: 0,
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '15px',
  },
  ratingDisplay: {
    textAlign: 'center',
    padding: '15px',
    background: '#fffdf0',
    borderRadius: '10px',
    marginBottom: '15px',
  },
  ratingBig: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#ffc107',
    display: 'block',
  },
  starsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '3px',
    margin: '5px 0',
  },
  ratingSubtext: {
    color: '#6c757d',
    fontSize: '12px',
    margin: 0,
  },
  ratingDist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  distRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  distStar: {
    fontSize: '12px',
    color: '#ffc107',
    fontWeight: '600',
    width: '25px',
  },
  distBar: {
    flex: 1,
    height: '7px',
    background: '#f0f0f0',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  distFill: {
    height: '100%',
    background: '#ffc107',
    borderRadius: '10px',
  },
  distCount: {
    fontSize: '11px',
    color: '#6c757d',
    width: '20px',
    textAlign: 'right',
  },
  accountCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
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
    padding: '10px',
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
  perfTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  perfCards: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '15px',
  },
  perfCard: {
    borderRadius: '12px',
    padding: '16px',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.05)',
  },
  perfCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  perfIcon: {
    fontSize: '22px',
  },
  perfValue: {
    fontSize: '24px',
    fontWeight: '800',
  },
  perfLabel: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px',
  },
  distCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  distTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '15px',
    fontSize: '15px',
  },
  distList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  distBarWide: {
    flex: 1,
    height: '10px',
    background: '#f0f0f0',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  distFillWide: {
    height: '100%',
    background:
      'linear-gradient(90deg, #ffc107, #fd7e14)',
    borderRadius: '10px',
  },
  distPct: {
    fontSize: '12px',
    color: '#6c757d',
    width: '70px',
    textAlign: 'right',
  },
  noData: {
    textAlign: 'center',
    color: '#adb5bd',
    padding: '20px',
  },
  feedbacksTab: {},
  feedbackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  feedbackItem: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.06)',
  },
  fbHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  fbLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  fbAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#2c7be5',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
    flexShrink: 0,
  },
  fbName: {
    margin: '0 0 3px',
    fontWeight: '700',
    color: '#333',
    fontSize: '14px',
  },
  fbIssue: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px',
  },
  fbRight: {
    textAlign: 'right',
  },
  fbStars: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    justifyContent: 'flex-end',
    marginBottom: '3px',
  },
  fbRating: {
    marginLeft: '5px',
    fontWeight: '700',
    color: '#ffc107',
    fontSize: '13px',
  },
  fbDate: {
    margin: 0,
    color: '#adb5bd',
    fontSize: '11px',
  },
  fbComment: {
    padding: '10px 15px 15px',
    background: '#f8f9fa',
    margin: '0 15px 15px',
    borderRadius: '8px',
    borderLeft: '3px solid #ffc107',
  },
  fbCommentText: {
    color: '#555',
    fontSize: '13px',
    fontStyle: 'italic',
    margin: 0,
    lineHeight: '1.6',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '50px',
    margin: '0 0 15px',
  },
  emptyText: {
    color: '#6c757d',
    fontSize: '16px',
  },
};

export default AuthorityProfile;