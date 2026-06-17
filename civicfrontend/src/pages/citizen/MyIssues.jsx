import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCity, FaPlus, FaList, FaSearch,
  FaGlobe, FaUser, FaSignOutAlt,
  FaChartBar, FaTimes, FaStar,
  FaMapMarkerAlt, FaCalendar,
  FaUserTie, FaPhone, FaHardHat,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { citizenAPI } from '../../api/axios';
import ProgressBar from
  '../../components/ProgressBar';

const MyIssues = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] =
    useState(null);
  const [filterStatus, setFilterStatus] =
    useState('ALL');
  const [showFeedback, setShowFeedback] =
    useState(false);
  const [feedback, setFeedback] = useState({
    starRating: 5,
    comment: '',
  });
  const [feedbackLoading, setFeedbackLoading] =
    useState(false);

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

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
  try {
    const res =
      await citizenAPI.getMyIssues();
    if (res.data.success) {
      setIssues(res.data.data);
    }
  } catch (err) {
    console.error(
      'My issues error:', err.message
    );
  } finally {
    setLoading(false);
  }
};

  const handleFeedbackSubmit = async () => {
    if (!feedback.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setFeedbackLoading(true);
    try {
      const res = await citizenAPI
        .submitFeedback({
          issueId: selectedIssue.id,
          starRating: feedback.starRating,
          comment: feedback.comment,
        });
      if (res.data.success) {
        toast.success(res.data.message);
        setShowFeedback(false);
        setSelectedIssue(null);
        fetchMyIssues();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const filteredIssues = filterStatus === 'ALL'
    ? issues
    : issues.filter(
        (i) => i.status === filterStatus
      );

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

  const getStatusLabel = (status) => {
    const labels = {
      REPORTED: 'Reported',
      ASSIGNED: 'Assigned',
      WORK_ASSIGNED: 'Work Assigned',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
    };
    return labels[status] || status;
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
                ...(item.id === 'my-issues'
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
            <h4 style={styles.pageTitle}>
              My Reported Issues
            </h4>
            <p style={styles.pageSubtitle}>
              Track all your reported issues
            </p>
          </div>
          <Link
            to="/citizen/report-issue"
            style={styles.reportBtn}
          >
            <FaPlus /> &nbsp;New Issue
          </Link>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {[
            'ALL', 'REPORTED', 'ASSIGNED',
            'WORK_ASSIGNED', 'IN_PROGRESS',
            'COMPLETED',
          ].map((status) => (
            <button
              key={status}
              style={{
                ...styles.filterBtn,
                ...(filterStatus === status
                  ? styles.filterBtnActive
                  : {}),
              }}
              onClick={() =>
                setFilterStatus(status)
              }
            >
              {status === 'ALL'
                ? `All (${issues.length})`
                : `${getStatusLabel(status)} (${
                    issues.filter(
                      (i) => i.status === status
                    ).length
                  })`
              }
            </button>
          ))}
        </div>

        {/* Issues List */}
        {loading ? (
          <div style={styles.loading}>
            Loading issues...
          </div>
        ) : filteredIssues.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📋</p>
            <p style={styles.emptyText}>
              No issues found.
            </p>
            <Link
              to="/citizen/report-issue"
              style={styles.emptyBtn}
            >
              Report an Issue
            </Link>
          </div>
        ) : (
          <div style={styles.issuesList}>
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                style={styles.issueCard}
              >
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderLeft}>
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
                    <span style={{
                      ...styles.statusBadge,
                      background: getStatusColor(
                        issue.status
                      ),
                      color: issue.status ===
                        'IN_PROGRESS'
                        ? '#333' : 'white',
                    }}>
                      {getStatusLabel(issue.status)}
                    </span>
                  </div>
                  <button
                    style={styles.viewBtn}
                    onClick={() =>
                      setSelectedIssue(issue)
                    }
                  >
                    View Details
                  </button>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>

                  {/* Image */}
                  {issue.reportedImage && (
                    <div style={styles.issueImageBox}>
                      <img
                        src={`http://localhost:8080${issue.reportedImage}`}
                        alt="Issue"
                        style={styles.issueImage}
                        onError={(e) => {
                          e.target.style
                            .display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div style={styles.issueDetails}>
                    <h6 style={styles.issueTitle}>
                      {issue.title}
                    </h6>

                    <div style={styles.issueMeta}>
                      <span style={styles.metaItem}>
                        <FaMapMarkerAlt
                          style={styles.metaIcon}
                        />
                        {issue.city},
                        Ward {issue.wardNumber}
                      </span>
                      <span style={styles.metaItem}>
                        <FaCalendar
                          style={styles.metaIcon}
                        />
                        {formatDate(
                          issue.reportedDate
                        )}
                      </span>
                      <span style={styles.metaItem}>
                        🏷️ {issue.issueType}
                      </span>
                      <span style={{
                        ...styles.urgencyBadge,
                        color:
                          issue.urgencyLevel ===
                            'HIGH' ? '#dc3545'
                          : issue.urgencyLevel ===
                            'MEDIUM' ? '#fd7e14'
                          : '#198754',
                      }}>
                        ⚡ {issue.urgencyLevel}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <ProgressBar
                      status={issue.status}
                      timeline={issue.timeline}
                    />

                    {/* Authority Info */}
                    {issue.authority && (
                      <div style={styles.authorityInfo}>
                        <p style={styles.authorityTitle}>
                          👷 Assigned Authority
                        </p>
                        <div style={styles.authorityDetails}>
                          <span style={styles.authorityItem}>
                            <FaUserTie
                              style={styles.authIcon}
                            />
                            {issue.authority.name}
                          </span>
                          <span style={styles.authorityItem}>
                            🏢 {issue.authority
                              .department}
                          </span>
                          {issue.authority
                            .contactNumber && (
                            <span style={
                              styles.authorityItem
                            }>
                              <FaPhone
                                style={styles.authIcon}
                              />
                              {issue.authority
                                .contactNumber}
                            </span>
                          )}
                          {issue.workerCount > 0 && (
                            <span style={
                              styles.authorityItem
                            }>
                              <FaHardHat
                                style={styles.authIcon}
                              />
                              {issue.workerCount} workers
                            </span>
                          )}
                        </div>
                        {issue
                          .expectedCompletionDate && (
                          <p style={
                            styles.expectedDate
                          }>
                            📅 Expected:
                            {' '}
                            {formatDate(
                              issue
                                .expectedCompletionDate
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Before After Images */}
                    {(issue.reportedImage ||
                      issue.afterImage) && (
                      <div style={styles.beforeAfter}>
                        {issue.reportedImage && (
                          <div style={
                            styles.imgBox
                          }>
                            <p style={styles.beforeLabel}>
                              📸 Before
                            </p>
                            <img
                              src={`http://localhost:8080${issue.reportedImage}`}
                              alt="Before"
                              style={styles.beforeAfterImg}
                              onError={(e) => {
                                e.target.style
                                  .display = 'none';
                              }}
                            />
                          </div>
                        )}
                        {issue.afterImage && (
                          <div style={styles.imgBox}>
                            <p style={styles.afterLabel}>
                              ✅ After
                            </p>
                            <img
                              src={`http://localhost:8080${issue.afterImage}`}
                              alt="After"
                              style={styles.beforeAfterImg}
                              onError={(e) => {
                                e.target.style
                                  .display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback Button */}
                    {issue.status === 'COMPLETED'
                      && !issue.hasFeedback && (
                      <button
                        style={styles.feedbackBtn}
                        onClick={() => {
                          setSelectedIssue(issue);
                          setShowFeedback(true);
                        }}
                      >
                        ⭐ Rate This Work
                      </button>
                    )}

                    {issue.hasFeedback && (
                      <div style={styles.feedbackDone}>
                        ✅ Feedback Submitted
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && selectedIssue && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>
                Rate the Work
              </h5>
              <button
                style={styles.closeBtn}
                onClick={() => {
                  setShowFeedback(false);
                  setSelectedIssue(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={styles.modalIssueTitle}>
                {selectedIssue.title}
              </p>

              {/* Star Rating */}
              <div style={styles.starRating}>
                <p style={styles.ratingLabel}>
                  Your Rating:
                </p>
                <div style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      style={styles.starBtn}
                      onClick={() =>
                        setFeedback({
                          ...feedback,
                          starRating: star,
                        })
                      }
                    >
                      <FaStar style={{
                        color:
                          star <= feedback.starRating
                            ? '#ffc107'
                            : '#dee2e6',
                        fontSize: '28px',
                      }} />
                    </button>
                  ))}
                </div>
                <p style={styles.ratingText}>
                  {feedback.starRating === 1
                    ? '😞 Poor'
                    : feedback.starRating === 2
                    ? '😐 Fair'
                    : feedback.starRating === 3
                    ? '🙂 Good'
                    : feedback.starRating === 4
                    ? '😊 Very Good'
                    : '🤩 Excellent'
                  }
                </p>
              </div>

              {/* Comment */}
              <div style={styles.commentBox}>
                <label style={styles.commentLabel}>
                  Your Comment *
                </label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) =>
                    setFeedback({
                      ...feedback,
                      comment: e.target.value,
                    })
                  }
                  placeholder="Share your experience about the work done..."
                  style={styles.commentInput}
                  rows={4}
                />
              </div>

              {/* Submit */}
              <button
                style={styles.submitFeedbackBtn}
                onClick={handleFeedbackSubmit}
                disabled={feedbackLoading}
              >
                {feedbackLoading
                  ? '⏳ Submitting...'
                  : '✅ Submit Feedback'
                }
              </button>
            </div>
          </div>
        </div>
      )}

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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
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
  reportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#2c7be5',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '7px 14px',
    border: '1px solid #dee2e6',
    borderRadius: '20px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
    fontWeight: '500',
    color: '#6c757d',
    transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    background: '#2c7be5',
    color: 'white',
    border: '1px solid #2c7be5',
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '50px',
    margin: '0 0 15px',
  },
  emptyText: {
    color: '#6c757d',
    marginBottom: '20px',
    fontSize: '16px',
  },
  emptyBtn: {
    padding: '10px 25px',
    background: '#2c7be5',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  issuesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  issueCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
    flexWrap: 'wrap',
    gap: '10px',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  issueCode: {
    color: '#2c7be5',
    fontWeight: '700',
    fontSize: '14px',
  },
  emergencyBadge: {
    background: '#dc3545',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  viewBtn: {
    padding: '6px 14px',
    background: '#f0f7ff',
    border: '1px solid #2c7be5',
    color: '#2c7be5',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
    fontWeight: '600',
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    gap: '15px',
  },
  issueImageBox: {
    width: '120px',
    height: '100px',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0,
    border: '1px solid #dee2e6',
  },
  issueImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  issueDetails: {
    flex: 1,
  },
  issueTitle: {
    margin: '0 0 8px',
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '15px',
  },
  issueMeta: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#6c757d',
  },
  metaIcon: {
    color: '#2c7be5',
    fontSize: '11px',
  },
  urgencyBadge: {
    fontSize: '12px',
    fontWeight: '600',
  },
  authorityInfo: {
    background: '#f0f7ff',
    border: '1px solid #bee3f8',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '12px',
  },
  authorityTitle: {
    margin: '0 0 8px',
    fontWeight: '700',
    color: '#2c7be5',
    fontSize: '13px',
  },
  authorityDetails: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  authorityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#555',
  },
  authIcon: {
    color: '#2c7be5',
    fontSize: '11px',
  },
  expectedDate: {
    margin: '8px 0 0',
    fontSize: '12px',
    color: '#6c757d',
  },
  beforeAfter: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '12px',
  },
  imgBox: {
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #dee2e6',
  },
  beforeLabel: {
    background: '#fff3cd',
    color: '#856404',
    padding: '5px 10px',
    margin: 0,
    fontSize: '12px',
    fontWeight: '600',
  },
  afterLabel: {
    background: '#d1e7dd',
    color: '#0f5132',
    padding: '5px 10px',
    margin: 0,
    fontSize: '12px',
    fontWeight: '600',
  },
  beforeAfterImg: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    display: 'block',
  },
  feedbackBtn: {
    marginTop: '12px',
    padding: '8px 18px',
    background: '#fff3cd',
    border: '1px solid #ffc107',
    color: '#856404',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '13px',
    fontWeight: '600',
  },
  feedbackDone: {
    marginTop: '12px',
    padding: '8px 15px',
    background: '#d1e7dd',
    color: '#0f5132',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'inline-block',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '480px',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    borderBottom: '1px solid #dee2e6',
  },
  modalTitle: {
    margin: 0,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#6c757d',
    padding: '5px',
  },
  modalBody: {
    padding: '20px',
  },
  modalIssueTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  starRating: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  ratingLabel: {
    color: '#6c757d',
    fontSize: '13px',
    marginBottom: '10px',
  },
  stars: {
    display: 'flex',
    gap: '5px',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  starBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '3px',
  },
  ratingText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffc107',
    margin: 0,
  },
  commentBox: {
    marginBottom: '15px',
  },
  commentLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '7px',
  },
  commentInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  submitFeedbackBtn: {
    width: '100%',
    padding: '12px',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '700',
  },
};

export default MyIssues;
