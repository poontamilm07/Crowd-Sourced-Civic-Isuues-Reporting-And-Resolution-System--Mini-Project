import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCity, FaClipboardList, FaUser,
  FaSignOutAlt, FaChartBar, FaStar,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authorityAPI } from '../../api/axios';

const AuthorityDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] =
    useState(true);

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
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res =
        await authorityAPI.getDashboardStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      toast.error(
        'Failed to load dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      ASSIGNED: {
        bg: '#0d6efd', label: 'Assigned'
      },
      WORK_ASSIGNED: {
        bg: '#fd7e14', label: 'Work Assigned'
      },
      IN_PROGRESS: {
        bg: '#ffc107', label: 'In Progress',
        color: '#333'
      },
      COMPLETED: {
        bg: '#198754', label: 'Completed'
      },
    };
    const c = config[status] ||
      { bg: '#6c757d', label: status };
    return (
      <span style={{
        background: c.bg,
        color: c.color || 'white',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
      }}>
        {c.label}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr)
      .toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <p>Loading dashboard...</p>
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
                ...(item.id === 'dashboard'
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

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h4 style={styles.welcomeText}>
              Welcome, {user?.name}! 👷
            </h4>
            <p style={styles.headerSubtext}>
              Here are your assigned issues
              and performance summary
            </p>
          </div>
          <Link
            to="/authority/assigned-issues"
            style={styles.viewIssuesBtn}
          >
            <FaClipboardList />
            &nbsp;View All Issues
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {[
            {
              label: 'Total Assigned',
              value: stats?.totalAssigned || 0,
              icon: '📋',
              color: '#2c7be5',
              bg: '#f0f7ff',
            },
            {
              label: 'Completed',
              value: stats?.totalCompleted || 0,
              icon: '✅',
              color: '#198754',
              bg: '#f0fff4',
            },
            {
              label: 'In Progress',
              value: stats?.inProgress || 0,
              icon: '⚙️',
              color: '#fd7e14',
              bg: '#fff8f0',
            },
            {
              label: 'Pending Start',
              value: stats?.assigned || 0,
              icon: '⏳',
              color: '#6c757d',
              bg: '#f8f9fa',
            },
            {
              label: 'Work Assigned',
              value: stats?.workAssigned || 0,
              icon: '🔧',
              color: '#6f42c1',
              bg: '#f5f0ff',
            },
            {
              label: 'Avg Rating',
              value: stats?.averageRating
                ? `${stats.averageRating}⭐`
                : 'N/A',
              icon: '⭐',
              color: '#ffc107',
              bg: '#fffdf0',
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

        {/* Status Workflow Guide */}
        <div style={styles.workflowCard}>
          <h6 style={styles.workflowTitle}>
            📋 Issue Resolution Workflow
          </h6>
          <div style={styles.workflowSteps}>
            {[
              {
                step: 'ASSIGNED',
                label: 'Issue Assigned',
                action: 'Set to Work Assigned',
                icon: '📌',
                color: '#0d6efd',
              },
              {
                step: 'WORK_ASSIGNED',
                label: 'Work Assigned',
                action: 'Set to In Progress',
                icon: '🔧',
                color: '#fd7e14',
              },
              {
                step: 'IN_PROGRESS',
                label: 'In Progress',
                action: 'Set to Completed',
                icon: '⚙️',
                color: '#ffc107',
              },
              {
                step: 'COMPLETED',
                label: 'Completed',
                action: 'Upload After Image',
                icon: '✅',
                color: '#198754',
              },
            ].map((step, i) => (
              <div
                key={i}
                style={styles.workflowStep}
              >
                <div style={{
                  ...styles.stepIcon,
                  background:
                    `${step.color}20`,
                  color: step.color,
                  border:
                    `2px solid ${step.color}`,
                }}>
                  {step.icon}
                </div>
                <div style={styles.stepInfo}>
                  <p style={{
                    ...styles.stepLabel,
                    color: step.color,
                  }}>
                    {step.label}
                  </p>
                  <p style={styles.stepAction}>
                    → {step.action}
                  </p>
                </div>
                {i < 3 && (
                  <div style={styles.stepArrow}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Issues */}
        <div style={styles.recentSection}>
          <div style={styles.sectionHeader}>
            <h6 style={styles.sectionTitle}>
              🕐 Recent Assigned Issues
            </h6>
            <Link
              to="/authority/assigned-issues"
              style={styles.viewAllLink}
            >
              View All →
            </Link>
          </div>

          {stats?.recentIssues?.length > 0 ? (
            <div style={styles.recentList}>
              {stats.recentIssues.map(
                (issue, i) => (
                  <div
                    key={i}
                    style={styles.recentItem}
                  >
                    {/* Issue Image */}
                    {issue.reportedImage && (
                      <div style={
                        styles.recentImgBox
                      }>
                        <img
                          src={`http://localhost:8080${issue.reportedImage}`}
                          alt="Issue"
                          style={styles.recentImg}
                          onError={(e) => {
                            e.target.style
                              .display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div style={
                      styles.recentInfo
                    }>
                      <div style={
                        styles.recentTop
                      }>
                        <span style={
                          styles.recentCode
                        }>
                          {issue.issueCode}
                        </span>
                        {getStatusBadge(
                          issue.status
                        )}
                        {issue.emergency && (
                          <span style={
                            styles.emergencyBadge
                          }>
                            🚨
                          </span>
                        )}
                      </div>
                      <h6 style={
                        styles.recentTitle
                      }>
                        {issue.title}
                      </h6>
                      <p style={
                        styles.recentMeta
                      }>
                        📍 {issue.city},
                        Ward {issue.wardNumber}
                        &nbsp;•&nbsp;
                        🏷️ {issue.issueType}
                        &nbsp;•&nbsp;
                        📅 {formatDate(
                          issue.reportedDate
                        )}
                      </p>
                    </div>

                    <Link
                      to="/authority/assigned-issues"
                      style={styles.manageBtn}
                    >
                      Manage
                    </Link>
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>
                📋
              </p>
              <p style={styles.emptyText}>
                No issues assigned yet.
              </p>
            </div>
          )}
        </div>

        {/* Performance Card */}
        <div style={styles.perfCard}>
          <div style={styles.perfLeft}>
            <FaStar style={styles.starIcon} />
            <div>
              <h5 style={styles.perfTitle}>
                Your Performance Rating
              </h5>
              <p style={styles.perfDesc}>
                Based on citizen feedback
                for completed issues
              </p>
            </div>
          </div>
          <div style={styles.perfRight}>
            <span style={styles.perfScore}>
              {stats?.averageRating || '0.0'}
            </span>
            <div style={styles.starsRow}>
              {[1,2,3,4,5].map((s) => (
                <FaStar
                  key={s}
                  style={{
                    color: s <= Math.round(
                      stats?.averageRating || 0
                    )
                      ? '#ffc107'
                      : 'rgba(255,255,255,0.3)',
                    fontSize: '18px',
                  }}
                />
              ))}
            </div>
            <span style={styles.perfLabel}>
              Average Rating
            </span>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  welcomeText: {
    margin: '0 0 5px',
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: '22px',
  },
  headerSubtext: {
    margin: 0,
    color: '#6c757d',
    fontSize: '14px',
  },
  viewIssuesBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    borderRadius: '12px',
    padding: '18px 20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.05)',
  },
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  statIcon: {
    fontSize: '24px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
  },
  statLabel: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px',
    fontWeight: '500',
  },
  workflowCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  workflowTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '20px',
    fontSize: '15px',
  },
  workflowSteps: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  workflowStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  stepIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  stepInfo: {
    maxWidth: '120px',
  },
  stepLabel: {
    margin: 0,
    fontWeight: '700',
    fontSize: '12px',
  },
  stepAction: {
    margin: 0,
    color: '#6c757d',
    fontSize: '11px',
  },
  stepArrow: {
    color: '#adb5bd',
    fontSize: '20px',
    fontWeight: '300',
  },
  recentSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    margin: 0,
    fontSize: '15px',
  },
  viewAllLink: {
    color: '#2c7be5',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #dee2e6',
    flexWrap: 'wrap',
  },
  recentImgBox: {
    width: '70px',
    height: '55px',
    borderRadius: '6px',
    overflow: 'hidden',
    flexShrink: 0,
    border: '1px solid #dee2e6',
  },
  recentImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  recentInfo: {
    flex: 1,
  },
  recentTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
    flexWrap: 'wrap',
  },
  recentCode: {
    color: '#2c7be5',
    fontWeight: '700',
    fontSize: '13px',
  },
  emergencyBadge: {
    fontSize: '14px',
  },
  recentTitle: {
    margin: '0 0 4px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  recentMeta: {
    margin: 0,
    fontSize: '12px',
    color: '#6c757d',
  },
  manageBtn: {
    padding: '7px 16px',
    background: '#2c7be5',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '600',
    flexShrink: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
  },
  emptyIcon: {
    fontSize: '40px',
    margin: '0 0 10px',
  },
  emptyText: {
    color: '#6c757d',
  },
  perfCard: {
    background:
      'linear-gradient(135deg, #1a1a2e, #0f3460)',
    borderRadius: '12px',
    padding: '20px 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  perfLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  starIcon: {
    fontSize: '36px',
    color: '#ffc107',
  },
  perfTitle: {
    margin: '0 0 5px',
    color: 'white',
    fontWeight: '700',
  },
  perfDesc: {
    margin: 0,
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
  },
  perfRight: {
    textAlign: 'center',
  },
  perfScore: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#ffc107',
    display: 'block',
  },
  starsRow: {
    display: 'flex',
    gap: '3px',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  perfLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
  },
};

export default AuthorityDashboard;

