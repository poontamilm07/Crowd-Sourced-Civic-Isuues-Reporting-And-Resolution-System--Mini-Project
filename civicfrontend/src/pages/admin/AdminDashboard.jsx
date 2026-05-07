import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  FaCity, FaUsers, FaChartBar,
  FaSignOutAlt, FaBell,
  FaClipboardList,
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/axios';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [overdueIssues, setOverdueIssues] =
    useState([]);

  const menuItems = [
    {
      id: 'dashboard',
      icon: <FaChartBar />,
      label: 'Dashboard',
      path: '/admin/dashboard',
    },
    {
      id: 'users',
      icon: <FaUsers />,
      label: 'Manage Users',
      path: '/admin/manage-users',
    },
    {
      id: 'issues',
      icon: <FaClipboardList />,
      label: 'Manage Issues',
      path: '/admin/manage-issues',
    },
    {
      id: 'analytics',
      icon: <FaChartBar />,
      label: 'Analytics',
      path: '/admin/analytics',
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    const statsRes =
      await adminAPI.getDashboardStats();
    if (statsRes.data.success) {
      setStats(statsRes.data.data);
    }
  } catch (err) {
    console.error('Stats error:', err);
  }

  try {
    const overdueRes =
      await adminAPI.getOverdueIssues();
    if (overdueRes.data.success) {
      setOverdueIssues(
        overdueRes.data.data.slice(0, 5)
      );
    }
  } catch (err) {
    console.error('Overdue error:', err);
  } finally {
    setLoading(false);
  }
};

  // Chart data for issue types
  const issueTypeChartData = {
    labels: Object.keys(
      stats?.issuesByType || {}
    ),
    datasets: [
      {
        data: Object.values(
          stats?.issuesByType || {}
        ),
        backgroundColor: [
          '#2c7be5', '#198754', '#fd7e14',
          '#dc3545', '#6f42c1', '#20c997',
          '#ffc107', '#0dcaf0', '#6c757d',
          '#e83e8c',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Chart data for issue status
  const statusChartData = {
    labels: [
      'Reported', 'Assigned',
      'Work Assigned', 'In Progress',
      'Completed',
    ],
    datasets: [
      {
        label: 'Number of Issues',
        data: [
          stats?.reportedIssues || 0,
          stats?.assignedIssues || 0,
          0,
          stats?.inProgressIssues || 0,
          stats?.completedIssues || 0,
        ],
        backgroundColor: [
          '#6c757d', '#0d6efd', '#fd7e14',
          '#ffc107', '#198754',
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { fontSize: 11 },
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <p>Loading admin dashboard...</p>
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
            👨‍💼
          </div>
          <div>
            <p style={styles.userName}>
              {user?.name}
            </p>
            <p style={styles.userRole}>
              🔑 Admin
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
              Admin Dashboard 👋
            </h4>
            <p style={styles.headerSubtext}>
              System overview and management
            </p>
          </div>
          {stats?.pendingApprovals > 0 && (
            <div style={styles.alertBadge}>
              <FaBell
                style={styles.alertIcon}
              />
              {stats.pendingApprovals} Pending
              Approvals
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {[
            {
              label: 'Total Citizens',
              value: stats?.totalCitizens || 0,
              icon: '👥',
              color: '#2c7be5',
              bg: '#f0f7ff',
              path: '/admin/manage-users',
            },
            {
              label: 'Total Authorities',
              value:
                stats?.totalAuthorities || 0,
              icon: '👷',
              color: '#198754',
              bg: '#f0fff4',
              path: '/admin/manage-users',
            },
            {
              label: 'Total Issues',
              value: stats?.totalIssues || 0,
              icon: '📋',
              color: '#fd7e14',
              bg: '#fff8f0',
              path: '/admin/manage-issues',
            },
            {
              label: 'Completed',
              value:
                stats?.completedIssues || 0,
              icon: '✅',
              color: '#20c997',
              bg: '#f0fdf9',
              path: '/admin/manage-issues',
            },
            {
              label: 'Pending Approvals',
              value:
                stats?.pendingApprovals || 0,
              icon: '⏳',
              color: '#ffc107',
              bg: '#fffdf0',
              path: '/admin/manage-users',
            },
            {
              label: 'Overdue Issues',
              value: overdueIssues.length,
              icon: '⚠️',
              color: '#dc3545',
              bg: '#fff5f5',
              path: '/admin/manage-issues',
            },
          ].map((stat, i) => (
            <Link
              key={i}
              to={stat.path}
              style={{
                ...styles.statCard,
                background: stat.bg,
                borderLeft:
                  `4px solid ${stat.color}`,
                textDecoration: 'none',
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
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div style={styles.chartsRow}>

          {/* Doughnut Chart */}
          <div style={styles.chartCard}>
            <h6 style={styles.chartTitle}>
              📊 Issues by Category
            </h6>
            {Object.keys(
              stats?.issuesByType || {}
            ).length > 0 ? (
              <Doughnut
                data={issueTypeChartData}
                options={chartOptions}
              />
            ) : (
              <p style={styles.noData}>
                No data available
              </p>
            )}
          </div>

          {/* Bar Chart */}
          <div style={styles.chartCard}>
            <h6 style={styles.chartTitle}>
              📈 Issues by Status
            </h6>
            <Bar
              data={statusChartData}
              options={barOptions}
            />
          </div>

        </div>

        {/* Overdue Issues Alert */}
        {overdueIssues.length > 0 && (
          <div style={styles.overdueSection}>
            <div style={styles.overdueHeader}>
              <h6 style={styles.overdueTitle}>
                ⚠️ Overdue Issues
                (Not assigned in 48 hours)
              </h6>
              <Link
                to="/admin/manage-issues"
                style={styles.viewAllLink}
              >
                View All →
              </Link>
            </div>
            <div style={styles.overdueList}>
              {overdueIssues.map((issue, i) => (
                <div
                  key={i}
                  style={styles.overdueItem}
                >
                  <div>
                    <span style={styles.overdueCode}>
                      {issue.issueCode}
                    </span>
                    <span style={styles.overdueTitle2}>
                      {issue.title}
                    </span>
                  </div>
                  <div style={styles.overdueRight}>
                    <span style={styles.overdueMeta}>
                      📍 {issue.city},
                      Ward {issue.wardNumber}
                    </span>
                    {issue.emergency && (
                      <span style={
                        styles.emergencyBadge
                      }>
                        🚨 Emergency
                      </span>
                    )}
                    <Link
                      to="/admin/manage-issues"
                      style={styles.assignBtn}
                    >
                      Assign Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <h6 style={styles.quickTitle}>
            Quick Actions
          </h6>
          <div style={styles.actionGrid}>
            {[
              {
                icon: '👥',
                label: 'Approve Users',
                desc: `${stats?.pendingApprovals || 0} pending`,
                path: '/admin/manage-users',
                color: '#2c7be5',
              },
              {
                icon: '📋',
                label: 'Assign Issues',
                desc: `${stats?.reportedIssues || 0} unassigned`,
                path: '/admin/manage-issues',
                color: '#fd7e14',
              },
              {
                icon: '📊',
                label: 'View Analytics',
                desc: 'Charts and reports',
                path: '/admin/analytics',
                color: '#6f42c1',
              },
              {
                icon: '👷',
                label: 'Manage Authorities',
                desc: `${stats?.totalAuthorities || 0} authorities`,
                path: '/admin/manage-users',
                color: '#198754',
              },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.path}
                style={styles.actionCard}
              >
                <div style={{
                  ...styles.actionIcon,
                  background:
                    `${action.color}15`,
                  color: action.color,
                }}>
                  {action.icon}
                </div>
                <div>
                  <p style={styles.actionLabel}>
                    {action.label}
                  </p>
                  <p style={styles.actionDesc}>
                    {action.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Authority Performance */}
        {stats?.authorityPerformance?.length > 0
          && (
          <div style={styles.perfSection}>
            <h6 style={styles.perfTitle}>
              🏆 Top Performing Authorities
            </h6>
            <div style={styles.perfList}>
              {stats.authorityPerformance
                .slice(0, 5)
                .map((auth, i) => (
                  <div
                    key={i}
                    style={styles.perfItem}
                  >
                    <div style={styles.perfRank}>
                      {i + 1}
                    </div>
                    <div style={styles.perfInfo}>
                      <p style={styles.perfName}>
                        {auth.authorityName}
                      </p>
                    </div>
                    <div style={styles.perfStats}>
                      <span style={styles.perfCount}>
                        {auth.completedIssues}
                      </span>
                      <span style={styles.perfLabel}>
                        resolved
                      </span>
                    </div>
                  </div>
                ))}
            </div>
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
  alertBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fff3cd',
    color: '#856404',
    padding: '10px 18px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '13px',
    border: '1px solid #ffc107',
  },
  alertIcon: {
    color: '#ffc107',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    borderRadius: '12px',
    padding: '18px 20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease',
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
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '25px',
  },
  chartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  chartTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '15px',
    fontSize: '15px',
  },
  noData: {
    textAlign: 'center',
    color: '#adb5bd',
    padding: '40px',
  },
  overdueSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
    border: '1px solid #ffc107',
  },
  overdueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  overdueTitle: {
    margin: 0,
    color: '#856404',
    fontWeight: '700',
    fontSize: '15px',
  },
  viewAllLink: {
    color: '#2c7be5',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
  },
  overdueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  overdueItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#fffdf0',
    borderRadius: '8px',
    border: '1px solid #ffeaa7',
    flexWrap: 'wrap',
    gap: '10px',
  },
  overdueCode: {
    color: '#2c7be5',
    fontWeight: '700',
    fontSize: '13px',
    marginRight: '10px',
  },
  overdueTitle2: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '500',
  },
  overdueRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  overdueMeta: {
    fontSize: '12px',
    color: '#6c757d',
  },
  emergencyBadge: {
    background: '#dc3545',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  assignBtn: {
    padding: '5px 14px',
    background: '#2c7be5',
    color: 'white',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '600',
  },
  quickActions: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  quickTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '15px',
    fontSize: '15px',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    background: '#f8f9fa',
    borderRadius: '10px',
    textDecoration: 'none',
    border: '1px solid #dee2e6',
    transition: 'all 0.2s ease',
  },
  actionIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  actionLabel: {
    margin: '0 0 3px',
    fontWeight: '600',
    color: '#333',
    fontSize: '13px',
  },
  actionDesc: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px',
  },
  perfSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  perfTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '15px',
    fontSize: '15px',
  },
  perfList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  perfItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  perfRank: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#2c7be5',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  perfInfo: {
    flex: 1,
  },
  perfName: {
    margin: 0,
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  perfStats: {
    textAlign: 'right',
  },
  perfCount: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#198754',
    display: 'block',
  },
  perfLabel: {
    fontSize: '11px',
    color: '#6c757d',
  },
};

export default AdminDashboard;
