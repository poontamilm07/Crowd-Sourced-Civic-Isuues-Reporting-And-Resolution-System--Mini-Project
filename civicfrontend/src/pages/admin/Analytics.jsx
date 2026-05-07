import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  FaCity, FaUsers, FaChartBar,
  FaClipboardList, FaSignOutAlt,
  FaStar,
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from 'chart.js';
import {
  Doughnut, Bar,
} from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/axios';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement
);

const Analytics = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] =
    useState(null);
  const [performance, setPerformance] =
    useState([]);
  const [dashStats, setDashStats] =
    useState(null);
  const [loading, setLoading] =
    useState(true);

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
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
  try {
    const analyticsRes =
      await adminAPI.getIssueAnalytics();
    if (analyticsRes.data.success) {
      setAnalytics(analyticsRes.data.data);
    }
  } catch (err) {
    console.error('Analytics error:', err);
  }

  try {
    const perfRes =
      await adminAPI.getAuthorityPerformance();
    if (perfRes.data.success) {
      setPerformance(perfRes.data.data);
    }
  } catch (err) {
    console.error('Performance error:', err);
  }

  try {
    const dashRes =
      await adminAPI.getDashboardStats();
    if (dashRes.data.success) {
      setDashStats(dashRes.data.data);
    }
  } catch (err) {
    console.error('Dash stats error:', err);
  } finally {
    setLoading(false);
  }
};

  // Issue Type Chart
  const issueTypeChart = {
    labels: Object.keys(
      analytics?.issuesByType || {}
    ),
    datasets: [{
      data: Object.values(
        analytics?.issuesByType || {}
      ),
      backgroundColor: [
        '#2c7be5', '#198754', '#fd7e14',
        '#dc3545', '#6f42c1', '#20c997',
        '#ffc107', '#0dcaf0', '#6c757d',
        '#e83e8c',
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  // Issue Status Chart
  const issueStatusChart = {
    labels: [
      'Reported', 'Assigned',
      'In Progress', 'Completed',
    ],
    datasets: [{
      label: 'Issues',
      data: [
        dashStats?.reportedIssues || 0,
        dashStats?.assignedIssues || 0,
        dashStats?.inProgressIssues || 0,
        dashStats?.completedIssues || 0,
      ],
      backgroundColor: [
        '#6c757d', '#0d6efd',
        '#ffc107', '#198754',
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // Authority Performance Chart
  const authorityPerfChart = {
    labels: performance
      .slice(0, 8)
      .map((p) =>
        p.authorityName?.split(' ')[0]
      ),
    datasets: [
      {
        label: 'Avg Rating',
        data: performance
          .slice(0, 8)
          .map((p) => p.averageRating || 0),
        backgroundColor: '#2c7be5',
        borderRadius: 6,
      },
      {
        label: 'Total Resolved',
        data: performance
          .slice(0, 8)
          .map((p) =>
            p.totalFeedbacks || 0
          ),
        backgroundColor: '#198754',
        borderRadius: 6,
      },
    ],
  };

  const doughnutOptions = {
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

  const multiBarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <p>Loading analytics...</p>
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
                ...(item.id === 'analytics'
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
            Analytics & Reports
          </h4>
          <p style={styles.pageSubtitle}>
            System performance and
            issue statistics
          </p>
        </div>

        {/* Summary Stats */}
        <div style={styles.summaryGrid}>
          {[
            {
              label: 'Total Issues',
              value:
                analytics?.totalIssues || 0,
              icon: '📋',
              color: '#2c7be5',
              bg: '#f0f7ff',
            },
            {
              label: 'Resolved Issues',
              value:
                analytics?.completedIssues
                || 0,
              icon: '✅',
              color: '#198754',
              bg: '#f0fff4',
            },
            {
              label: 'Resolution Rate',
              value: `${
                analytics?.resolutionRate || 0
              }%`,
              icon: '📈',
              color: '#6f42c1',
              bg: '#f5f0ff',
            },
            {
              label: 'Overdue Issues',
              value:
                analytics?.overdueIssues || 0,
              icon: '⚠️',
              color: '#dc3545',
              bg: '#fff5f5',
            },
            {
              label: 'Avg Rating',
              value: dashStats
                ?.overallAverageRating
                ? `${dashStats
                    .overallAverageRating}⭐`
                : 'N/A',
              icon: '⭐',
              color: '#ffc107',
              bg: '#fffdf0',
            },
            {
              label: 'Total Citizens',
              value:
                dashStats?.totalCitizens || 0,
              icon: '👥',
              color: '#fd7e14',
              bg: '#fff8f0',
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                ...styles.summaryCard,
                background: stat.bg,
                borderLeft:
                  `4px solid ${stat.color}`,
              }}
            >
              <div style={styles.summaryTop}>
                <span style={styles.summaryIcon}>
                  {stat.icon}
                </span>
                <span style={{
                  ...styles.summaryValue,
                  color: stat.color,
                }}>
                  {stat.value}
                </span>
              </div>
              <p style={styles.summaryLabel}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <h6 style={styles.chartTitle}>
              🏷️ Issues by Category
            </h6>
            {Object.keys(
              analytics?.issuesByType || {}
            ).length > 0 ? (
              <div style={styles.doughnutBox}>
                <Doughnut
                  data={issueTypeChart}
                  options={doughnutOptions}
                />
              </div>
            ) : (
              <p style={styles.noData}>
                No category data available
              </p>
            )}
          </div>

          <div style={styles.chartCard}>
            <h6 style={styles.chartTitle}>
              📊 Issues by Status
            </h6>
            <Bar
              data={issueStatusChart}
              options={barOptions}
            />
          </div>
        </div>

        {/* Authority Performance Chart */}
        {performance.length > 0 && (
          <div style={styles.wideChartCard}>
            <h6 style={styles.chartTitle}>
              👷 Authority Performance
            </h6>
            <Bar
              data={authorityPerfChart}
              options={multiBarOptions}
            />
          </div>
        )}

        {/* Authority Performance Table */}
        {performance.length > 0 && (
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h6 style={styles.tableTitle}>
                🏆 Authority Leaderboard
              </h6>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>
                      Rank
                    </th>
                    <th style={styles.th}>
                      Authority
                    </th>
                    <th style={styles.th}>
                      Avg Rating
                    </th>
                    <th style={styles.th}>
                      Total Feedbacks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map(
                    (auth, i) => (
                      <tr
                        key={i}
                        style={{
                          ...styles.tr,
                          background:
                            i === 0
                              ? '#fffdf0'
                            : i === 1
                              ? '#f8f9fa'
                            : 'white',
                        }}
                      >
                        <td style={styles.td}>
                          <div style={styles.rank}>
                            {i === 0
                              ? '🥇'
                            : i === 1
                              ? '🥈'
                            : i === 2
                              ? '🥉'
                            : `#${i + 1}`
                            }
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.authInfo}>
                            <div style={
                              styles.authAvatar
                            }>
                              {auth.authorityName
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>
                            <span style={
                              styles.authName
                            }>
                              {auth.authorityName}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={
                            styles.ratingBox
                          }>
                            {[1,2,3,4,5]
                              .map((s) => (
                              <FaStar
                                key={s}
                                style={{
                                  color:
                                    s <= Math
                                      .round(
                                        auth
                                          .averageRating
                                        || 0
                                      )
                                      ? '#ffc107'
                                      : '#dee2e6',
                                  fontSize:
                                    '12px',
                                }}
                              />
                            ))}
                            <span style={
                              styles.ratingNum
                            }>
                              {auth
                                .averageRating
                                ?.toFixed(1)
                              || '0.0'}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={
                            styles.feedbackCount
                          }>
                            {auth.totalFeedbacks
                              || 0}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Issue Type Distribution Table */}
        {Object.keys(
          analytics?.issuesByType || {}
        ).length > 0 && (
          <div style={styles.tableCard}>
            <h6 style={styles.tableTitle}>
              📋 Issue Category Distribution
            </h6>
            <div style={styles.distGrid}>
              {Object.entries(
                analytics.issuesByType
              ).map(([type, count], i) => {
                const total =
                  analytics.totalIssues || 1;
                const pct = Math.round(
                  (count / total) * 100
                );
                return (
                  <div
                    key={i}
                    style={styles.distItem}
                  >
                    <div style={styles.distTop}>
                      <span style={
                        styles.distType
                      }>
                        {type}
                      </span>
                      <span style={
                        styles.distCount
                      }>
                        {count}
                      </span>
                    </div>
                    <div style={styles.distBar}>
                      <div style={{
                        ...styles.distFill,
                        width: `${pct}%`,
                      }} />
                    </div>
                    <span style={styles.distPct}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  summaryCard: {
    borderRadius: '12px',
    padding: '16px',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.05)',
  },
  summaryTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  summaryIcon: {
    fontSize: '22px',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '800',
  },
  summaryLabel: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  chartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  wideChartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
    marginBottom: '20px',
  },
  chartTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '15px',
    fontSize: '15px',
  },
  doughnutBox: {
    maxWidth: '300px',
    margin: '0 auto',
  },
  noData: {
    textAlign: 'center',
    color: '#adb5bd',
    padding: '40px',
  },
  tableCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
    marginBottom: '20px',
  },
  tableHeader: {
    marginBottom: '15px',
  },
  tableTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '15px',
    margin: '0 0 15px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    background: '#f8f9fa',
  },
  th: {
    padding: '12px 15px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '700',
    color: '#6c757d',
    textTransform: 'uppercase',
    borderBottom: '2px solid #dee2e6',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.15s ease',
  },
  td: {
    padding: '12px 15px',
    fontSize: '13px',
    color: '#555',
    verticalAlign: 'middle',
  },
  rank: {
    fontSize: '18px',
    fontWeight: '700',
  },
  authInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  authAvatar: {
    width: '32px',
    height: '32px',
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
  authName: {
    fontWeight: '600',
    color: '#333',
  },
  ratingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  ratingNum: {
    marginLeft: '6px',
    fontWeight: '700',
    color: '#ffc107',
    fontSize: '13px',
  },
  feedbackCount: {
    fontWeight: '700',
    color: '#2c7be5',
    fontSize: '14px',
  },
  distGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  distItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  distTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: '240px',
  },
  distType: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '500',
  },
  distCount: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#2c7be5',
    minWidth: '30px',
    textAlign: 'right',
  },
  distBar: {
    flex: 1,
    height: '8px',
    background: '#f0f0f0',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  distFill: {
    height: '100%',
    background:
      'linear-gradient(90deg, #2c7be5, #1a68d1)',
    borderRadius: '10px',
    transition: 'width 0.5s ease',
  },
  distPct: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6c757d',
    minWidth: '35px',
    textAlign: 'right',
  },
};

export default Analytics;
