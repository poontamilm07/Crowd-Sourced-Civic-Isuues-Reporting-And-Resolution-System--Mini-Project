import React, { useState, useEffect } from 'react';
import { Link, useNavigate,
  useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCity, FaPlus, FaList, FaSearch,
  FaGlobe, FaUser, FaSignOutAlt,
  FaChartBar, FaMapMarkerAlt,
  FaCalendar, FaUserTie, FaHardHat,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { publicAPI } from '../../api/axios';
import ProgressBar from
  '../../components/ProgressBar';

const TrackIssue = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [issueCode, setIssueCode] =
    useState('');
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] =
    useState(false);

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

  // Auto track if code in URL params
  useEffect(() => {
    const params = new URLSearchParams(
      location.search
    );
    const code = params.get('code');
    if (code) {
      setIssueCode(code);
      handleTrack(code);
    }
  }, []);

  const handleTrack = async (code) => {
    const searchCode = code || issueCode;
    if (!searchCode.trim()) {
      toast.error('Please enter an Issue ID');
      return;
    }

    setLoading(true);
    setSearched(true);
    setIssue(null);

    try {
      const res = await publicAPI.trackIssue(
        searchCode.trim().toUpperCase()
      );
      if (res.data.success) {
        setIssue(res.data.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message
        || 'Issue not found.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      REPORTED: '#6c757d',
      ASSIGNED: '#0d6efd',
      WORK_ASSIGNED: '#fd7e14',
      IN_PROGRESS: '#ffc107',
      COMPLETED: '#198754',
    };
    return colors[status] || '#6c757d';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr)
      .toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
  };

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
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(item.id === 'track'
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
            Track Issue
          </h4>
          <p style={styles.pageSubtitle}>
            Enter your Issue ID to track
            real-time status
          </p>
        </div>

        {/* Search Box */}
        <div style={styles.searchCard}>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              value={issueCode}
              onChange={(e) =>
                setIssueCode(
                  e.target.value.toUpperCase()
                )
              }
              placeholder="Enter Issue ID (e.g. ISS1023)"
              style={styles.searchInput}
              onKeyPress={(e) =>
                e.key === 'Enter' && handleTrack()
              }
            />
            <button
              style={styles.searchBtn}
              onClick={() => handleTrack()}
              disabled={loading}
            >
              {loading
                ? '⏳ Searching...'
                : '🔍 Track Issue'
              }
            </button>
          </div>
          <p style={styles.searchHint}>
            💡 You can find your Issue ID in
            "My Issues" section or in the
            confirmation email.
          </p>
        </div>

        {/* Results */}
        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p>Searching for issue...</p>
          </div>
        )}

        {searched && !loading && !issue && (
          <div style={styles.notFound}>
            <p style={styles.notFoundIcon}>
              🔍
            </p>
            <h5 style={styles.notFoundTitle}>
              Issue Not Found
            </h5>
            <p style={styles.notFoundText}>
              No issue found with ID:
              <strong> {issueCode}</strong>
            </p>
            <p style={styles.notFoundHint}>
              Please check the Issue ID and
              try again.
            </p>
          </div>
        )}

        {issue && (
          <div style={styles.resultCard}>

            {/* Issue Header */}
            <div style={styles.issueHeader}>
              <div style={styles.issueHeaderLeft}>
                <span style={styles.issueCode}>
                  {issue.issueCode}
                </span>
                {issue.emergency && (
                  <span style={
                    styles.emergencyBadge
                  }>
                    🚨 Emergency
                  </span>
                )}
              </div>
              <span style={{
                ...styles.statusBadge,
                background: getStatusColor(
                  issue.status
                ),
                color: issue.status ===
                  'IN_PROGRESS'
                  ? '#333' : 'white',
              }}>
                {issue.status?.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Issue Info */}
            <div style={styles.issueInfo}>

              {/* Before Image */}
              {issue.reportedImage && (
                <div style={styles.imageSection}>
                  <h6 style={styles.imageSectionTitle}>
                    📸 Reported Image (Before)
                  </h6>
                  <img
                    src={`http://localhost:8080${issue.reportedImage}`}
                    alt="Before"
                    style={styles.reportedImg}
                    onError={(e) => {
                      e.target.style.display =
                        'none';
                    }}
                  />
                </div>
              )}

              <div style={styles.infoGrid}>
                <h5 style={styles.issueTitle}>
                  {issue.title}
                </h5>
                <p style={styles.issueDesc}>
                  {issue.description}
                </p>

                <div style={styles.metaGrid}>
                  {[
                    {
                      icon: '🏷️',
                      label: 'Type',
                      value: issue.issueType,
                    },
                    {
                      icon: '⚡',
                      label: 'Urgency',
                      value: issue.urgencyLevel,
                    },
                    {
                      icon: '🏙️',
                      label: 'City',
                      value: issue.city,
                    },
                    {
                      icon: '🗺️',
                      label: 'Ward',
                      value: `Ward ${issue.wardNumber}`,
                    },
                    {
                      icon: '📍',
                      label: 'Address',
                      value: issue.address,
                    },
                    {
                      icon: '📌',
                      label: 'Landmark',
                      value: issue.landmark
                        || 'N/A',
                    },
                    {
                      icon: '📅',
                      label: 'Reported',
                      value: formatDate(
                        issue.reportedDate
                      ),
                    },
                    {
                      icon: '📅',
                      label: 'Expected',
                      value: issue
                        .expectedCompletionDate
                        ? formatDate(
                          issue
                            .expectedCompletionDate
                        )
                        : 'Not set',
                    },
                  ].map((meta, i) => (
                    <div
                      key={i}
                      style={styles.metaItem}
                    >
                      <span style={styles.metaLabel}>
                        {meta.icon} {meta.label}
                      </span>
                      <span style={styles.metaValue}>
                        {meta.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressSection}>
              <h6 style={styles.sectionTitle}>
                📊 Issue Progress
              </h6>
              <ProgressBar
                status={issue.status}
                timeline={issue.timeline}
              />
            </div>

            {/* Timeline */}
            <div style={styles.timelineSection}>
              <h6 style={styles.sectionTitle}>
                🕐 Issue Timeline
              </h6>
              <div style={styles.timeline}>
                {[
                  {
                    label: 'Issue Reported',
                    time: issue.timeline
                      ?.reportedAt,
                    icon: '🚩',
                    color: '#6c757d',
                  },
                  {
                    label: 'Assigned to Authority',
                    time: issue.timeline
                      ?.assignedAt,
                    icon: '👷',
                    color: '#0d6efd',
                  },
                  {
                    label: 'Work Assigned',
                    time: issue.timeline
                      ?.workAssignedAt,
                    icon: '⚙️',
                    color: '#fd7e14',
                  },
                  {
                    label: 'Work Started',
                    time: issue.timeline
                      ?.workStartedAt,
                    icon: '🔧',
                    color: '#ffc107',
                  },
                  {
                    label: 'Issue Completed',
                    time: issue.timeline
                      ?.completedAt,
                    icon: '✅',
                    color: '#198754',
                  },
                ].map((event, i) => (
                  <div
                    key={i}
                    style={styles.timelineItem}
                  >
                    <div style={{
                      ...styles.timelineIcon,
                      background: event.time
                        ? event.color
                        : '#dee2e6',
                    }}>
                      {event.icon}
                    </div>
                    <div style={
                      styles.timelineContent
                    }>
                      <p style={styles.timelineLabel}>
                        {event.label}
                      </p>
                      <p style={styles.timelineTime}>
                        {event.time
                          ? formatDate(event.time)
                          : 'Pending'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authority Info */}
            {issue.authority && (
              <div style={styles.authoritySection}>
                <h6 style={styles.sectionTitle}>
                  👷 Assigned Authority
                </h6>
                <div style={styles.authorityCard}>
                  <div style={styles.authAvatar}>
                    {issue.authority.name
                      ?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={styles.authName}>
                      {issue.authority.name}
                    </p>
                    <p style={styles.authDept}>
                      🏢 {issue.authority
                        .department}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Before After Images */}
            {issue.afterImage && (
              <div style={styles.beforeAfterSection}>
                <h6 style={styles.sectionTitle}>
                  📸 Before & After Evidence
                </h6>
                <div style={styles.beforeAfterGrid}>
                  {issue.reportedImage && (
                    <div style={styles.imgBox}>
                      <div style={styles.beforeLabel}>
                        Before
                      </div>
                      <img
                        src={`http://localhost:8080${issue.reportedImage}`}
                        alt="Before"
                        style={styles.compareImg}
                        onError={(e) => {
                          e.target.style
                            .display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div style={styles.imgBox}>
                    <div style={styles.afterLabel}>
                      After
                    </div>
                    <img
                      src={`http://localhost:8080${issue.afterImage}`}
                      alt="After"
                      style={styles.compareImg}
                      onError={(e) => {
                        e.target.style
                          .display = 'none';
                      }}
                    />
                  </div>
                </div>
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
  searchCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  searchBox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  searchIcon: {
    color: '#adb5bd',
    fontSize: '18px',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    padding: '12px 15px',
    border: '1.5px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'inherit',
    letterSpacing: '1px',
    fontWeight: '600',
  },
  searchBtn: {
    padding: '12px 25px',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  searchHint: {
    color: '#6c757d',
    fontSize: '13px',
    margin: 0,
  },
  loadingBox: {
    textAlign: 'center',
    padding: '50px',
    background: 'white',
    borderRadius: '12px',
    color: '#6c757d',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #dee2e6',
    borderTop: '4px solid #2c7be5',
    borderRadius: '50%',
    margin: '0 auto 15px',
  },
  notFound: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '12px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  notFoundIcon: {
    fontSize: '50px',
    margin: '0 0 15px',
  },
  notFoundTitle: {
    color: '#dc3545',
    fontWeight: '700',
    marginBottom: '10px',
  },
  notFoundText: {
    color: '#555',
    marginBottom: '5px',
  },
  notFoundHint: {
    color: '#6c757d',
    fontSize: '14px',
  },
  resultCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow:
      '0 2px 15px rgba(0,0,0,0.08)',
  },
  issueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    flexWrap: 'wrap',
    gap: '10px',
  },
  issueHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  issueCode: {
    color: '#2c7be5',
    fontWeight: '800',
    fontSize: '16px',
  },
  emergencyBadge: {
    background: '#dc3545',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
  },
  issueInfo: {
    padding: '20px',
    display: 'flex',
    gap: '20px',
  },
  imageSection: {
    flex: '0 0 200px',
  },
  imageSectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '8px',
  },
  reportedImg: {
    width: '200px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },
  infoGrid: {
    flex: 1,
  },
  issueTitle: {
    color: '#1a1a2e',
    fontWeight: '700',
    marginBottom: '8px',
    fontSize: '18px',
  },
  issueDesc: {
    color: '#6c757d',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metaLabel: {
    fontSize: '11px',
    color: '#adb5bd',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '500',
  },
  progressSection: {
    padding: '20px',
    borderTop: '1px solid #f0f0f0',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '15px',
    fontSize: '15px',
  },
  timelineSection: {
    padding: '20px',
    borderTop: '1px solid #f0f0f0',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    paddingLeft: '20px',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  timelineIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  timelineContent: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '10px 14px',
    flex: 1,
  },
  timelineLabel: {
    margin: '0 0 3px',
    fontWeight: '600',
    color: '#333',
    fontSize: '13px',
  },
  timelineTime: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px',
  },
  authoritySection: {
    padding: '20px',
    borderTop: '1px solid #f0f0f0',
  },
  authorityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: '#f0f7ff',
    borderRadius: '10px',
    padding: '15px',
    border: '1px solid #bee3f8',
  },
  authAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#2c7be5',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    flexShrink: 0,
  },
  authName: {
    margin: '0 0 4px',
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '15px',
  },
  authDept: {
    margin: 0,
    color: '#6c757d',
    fontSize: '13px',
  },
  beforeAfterSection: {
    padding: '20px',
    borderTop: '1px solid #f0f0f0',
  },
  beforeAfterGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  imgBox: {
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #dee2e6',
  },
  beforeLabel: {
    background: '#fff3cd',
    color: '#856404',
    padding: '8px 12px',
    fontWeight: '700',
    fontSize: '13px',
  },
  afterLabel: {
    background: '#d1e7dd',
    color: '#0f5132',
    padding: '8px 12px',
    fontWeight: '700',
    fontSize: '13px',
  },
  compareImg: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    display: 'block',
  },
};

export default TrackIssue;
