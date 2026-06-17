import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCity, FaPlus, FaList, FaSearch,
  FaGlobe, FaUser, FaSignOutAlt,
  FaTrophy, FaChartBar,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { citizenAPI } from '../../api/axios';
import Chatbot from '../../components/Chatbot';

const CitizenDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIssues: 0,
    reportedIssues: 0,
    assignedIssues: 0,
    inProgressIssues: 0,
    completedIssues: 0,
    rewardPoints: 0,
  });
  const [recentIssues, setRecentIssues] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] =
    useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    const statsRes =
      await citizenAPI.getDashboardStats();
    if (statsRes.data.success) {
      setStats(statsRes.data.data);
    }
  } catch (err) {
    console.error('Stats error:', err.message);
  }

  try {
    const issuesRes =
      await citizenAPI.getMyIssues();
    if (issuesRes.data.success) {
      setRecentIssues(
        issuesRes.data.data.slice(0, 5)
      );
    }
  } catch (err) {
    console.error('Issues error:', err.message);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const badges = {
      REPORTED: {
        bg: '#6c757d', label: 'Reported'
      },
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
    const badge = badges[status] ||
      { bg: '#6c757d', label: status };
    return (
      <span style={{
        background: badge.bg,
        color: badge.color || 'white',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
      }}>
        {badge.label}
      </span>
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: <FaChartBar />,
      label: 'Dashboard',
      path: '/citizen/dashboard',
    },
    {
      id: 'report',
      icon: <FaPlus />,
      label: 'Report Issue',
      path: '/citizen/report-issue',
    },
    {
      id: 'my-issues',
      icon: <FaList />,
      label: 'My Issues',
      path: '/citizen/my-issues',
    },
    {
      id: 'track',
      icon: <FaSearch />,
      label: 'Track Issue',
      path: '/citizen/track-issue',
    },
    {
      id: 'public',
      icon: <FaGlobe />,
      label: 'Public Issues',
      path: '/citizen/public-issues',
    },
    {
      id: 'profile',
      icon: <FaUser />,
      label: 'My Profile',
      path: '/citizen/profile',
    },
  ];

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
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

        {/* User Info */}
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={styles.userName}>
              {user?.name}
            </p>
            <p style={styles.userRole}>
              👤 Citizen
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(activeMenu === item.id
                  ? styles.navItemActive
                  : {}),
              }}
              onClick={() =>
                setActiveMenu(item.id)
              }
            >
              <span style={styles.navIcon}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Reward Points */}
        <div style={styles.rewardBox}>
          <FaTrophy style={styles.trophyIcon} />
          <div>
            <p style={styles.rewardPoints}>
              {stats.rewardPoints} pts
            </p>
            <p style={styles.rewardLabel}>
              Reward Points
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          style={styles.logoutBtn}
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          &nbsp; Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h4 style={styles.welcomeText}>
              Welcome back, {user?.name}! 👋
            </h4>
            <p style={styles.headerSubtext}>
              Here's what's happening with
              your issues today.
            </p>
          </div>
          <Link
            to="/citizen/report-issue"
            style={styles.reportBtn}
          >
            <FaPlus /> &nbsp;Report New Issue
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {[
            {
              label: 'Total Issues',
              value: stats.totalIssues,
              icon: '📋',
              color: '#2c7be5',
              bg: '#f0f7ff',
            },
            {
              label: 'Reported',
              value: stats.reportedIssues,
              icon: '🚩',
              color: '#6c757d',
              bg: '#f8f9fa',
            },
            {
              label: 'In Progress',
              value: stats.inProgressIssues,
              icon: '⚙️',
              color: '#fd7e14',
              bg: '#fff8f0',
            },
            {
              label: 'Completed',
              value: stats.completedIssues,
              icon: '✅',
              color: '#198754',
              bg: '#f0fff4',
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

        {/* Quick Actions */}
        <div style={styles.section}>
          <h5 style={styles.sectionTitle}>
            Quick Actions
          </h5>
          <div style={styles.quickActions}>
            {[
              {
                icon: '📸',
                label: 'Report Issue',
                desc: 'Report a new civic problem',
                path: '/citizen/report-issue',
                color: '#2c7be5',
              },
              {
                icon: '🔍',
                label: 'Track Issue',
                desc: 'Track by Issue ID',
                path: '/citizen/track-issue',
                color: '#198754',
              },
              {
                icon: '🗳️',
                label: 'Public Issues',
                desc: 'Vote on community issues',
                path: '/citizen/public-issues',
                color: '#fd7e14',
              },
              {
                icon: '👤',
                label: 'My Profile',
                desc: 'View your profile',
                path: '/citizen/profile',
                color: '#6f42c1',
              },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.path}
                style={styles.quickActionCard}
              >
                <div style={{
                  ...styles.quickActionIcon,
                  background:
                    `${action.color}15`,
                  color: action.color,
                }}>
                  {action.icon}
                </div>
                <div>
                  <p style={styles.quickActionLabel}>
                    {action.label}
                  </p>
                  <p style={styles.quickActionDesc}>
                    {action.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Issues */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h5 style={styles.sectionTitle}>
              Recent Issues
            </h5>
            <Link
              to="/citizen/my-issues"
              style={styles.viewAllLink}
            >
              View All →
            </Link>
          </div>

          {recentIssues.length > 0 ? (
            <div style={styles.issueTable}>
              {/* Table Header */}
              <div style={styles.tableHeader}>
                <span style={styles.th}>
                  Issue ID
                </span>
                <span style={styles.th}>
                  Title
                </span>
                <span style={styles.th}>
                  Ward
                </span>
                <span style={styles.th}>
                  Date
                </span>
                <span style={styles.th}>
                  Status
                </span>
              </div>

              {/* Table Rows */}
              {recentIssues.map((issue, i) => (
                <div
                  key={i}
                  style={styles.tableRow}
                  onClick={() =>
                    navigate(
                      `/citizen/my-issues`
                    )
                  }
                >
                  <span style={styles.issueCode}>
                    {issue.issueCode}
                  </span>
                  <span style={styles.td}>
                    {issue.title?.length > 30
                      ? issue.title
                          .substring(0, 30) + '...'
                      : issue.title
                    }
                  </span>
                  <span style={styles.td}>
                    Ward {issue.wardNumber}
                  </span>
                  <span style={styles.td}>
                    {issue.reportedDate}
                  </span>
                  <span style={styles.td}>
                    {getStatusBadge(issue.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📋</p>
              <p style={styles.emptyText}>
                No issues reported yet.
              </p>
              <Link
                to="/citizen/report-issue"
                style={styles.emptyBtn}
              >
                Report Your First Issue
              </Link>
            </div>
          )}
        </div>

        {/* Reward Points Card */}
        <div style={styles.rewardCard}>
          <div style={styles.rewardLeft}>
            <FaTrophy style={styles.rewardIcon} />
            <div>
              <h5 style={styles.rewardTitle}>
                Your Reward Points
              </h5>
              <p style={styles.rewardDesc}>
                Earn points by reporting issues,
                voting, and giving feedback!
              </p>
            </div>
          </div>
          <div style={styles.rewardRight}>
            <span style={styles.rewardScore}>
              {stats.rewardPoints}
            </span>
            <span style={styles.rewardPts}>
              Points
            </span>
          </div>
        </div>

      </div>

      <Chatbot />
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '15px',
    color: '#6c757d',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #dee2e6',
    borderTop: '4px solid #2c7be5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  sidebar: {
    width: '250px',
    minHeight: '100vh',
    background:
      'linear-gradient(180deg, #1a1a2e, #16213e, #0f3460)',
    color: 'white',
    padding: '0',
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
    transition: 'all 0.2s ease',
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
  rewardBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '10px',
    padding: '12px 15px',
    background: 'rgba(253,193,7,0.15)',
    borderRadius: '10px',
    border: '1px solid rgba(253,193,7,0.3)',
  },
  trophyIcon: {
    color: '#ffc107',
    fontSize: '24px',
  },
  rewardPoints: {
    margin: 0,
    color: '#ffc107',
    fontWeight: '700',
    fontSize: '16px',
  },
  rewardLabel: {
    margin: 0,
    color: 'rgba(255,255,255,0.6)',
    fontSize: '11px',
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
    transition: 'all 0.2s ease',
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
  reportBtn: {
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
      'repeat(auto-fit, minmax(200px, 1fr))',
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
    fontSize: '13px',
    fontWeight: '500',
  },
  section: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.05)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  sectionTitle: {
    margin: '0 0 15px',
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: '16px',
  },
  viewAllLink: {
    color: '#2c7be5',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  quickActionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '10px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    border: '1px solid #dee2e6',
  },
  quickActionIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  quickActionLabel: {
    margin: '0 0 3px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  quickActionDesc: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px',
  },
  issueTable: {
    border: '1px solid #dee2e6',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 2fr 1fr 1fr 1fr',
    gap: '10px',
    padding: '12px 15px',
    background: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
  },
  th: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 2fr 1fr 1fr 1fr',
    gap: '10px',
    padding: '12px 15px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    alignItems: 'center',
  },
  td: {
    fontSize: '13px',
    color: '#555',
  },
  issueCode: {
    fontSize: '13px',
    color: '#2c7be5',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '40px',
    margin: '0 0 10px',
  },
  emptyText: {
    color: '#6c757d',
    marginBottom: '15px',
  },
  emptyBtn: {
    padding: '10px 20px',
    background: '#2c7be5',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  rewardCard: {
    background:
      'linear-gradient(135deg, #1a1a2e, #0f3460)',
    borderRadius: '12px',
    padding: '20px 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  rewardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  rewardIcon: {
    fontSize: '36px',
    color: '#ffc107',
  },
  rewardTitle: {
    margin: '0 0 5px',
    color: 'white',
    fontWeight: '700',
  },
  rewardDesc: {
    margin: 0,
    color: 'rgba(255,255,255,0.65)',
    fontSize: '13px',
  },
  rewardRight: {
    textAlign: 'center',
  },
  rewardScore: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#ffc107',
    display: 'block',
  },
  rewardPts: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
  },
};

export default CitizenDashboard;
