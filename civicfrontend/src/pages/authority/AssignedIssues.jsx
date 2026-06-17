import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCity, FaClipboardList, FaUser,
  FaSignOutAlt, FaChartBar, FaUpload,
  FaTimes, FaMapMarkerAlt, FaCalendar,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authorityAPI } from '../../api/axios';
import ProgressBar from
  '../../components/ProgressBar';

const AssignedIssues = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] =
    useState('ALL');
  const [selectedIssue, setSelectedIssue] =
    useState(null);
  const [statusLoading, setStatusLoading] =
    useState(null);
  const [afterImage, setAfterImage] =
    useState(null);
  const [afterPreview, setAfterPreview] =
    useState(null);
  const [uploadLoading, setUploadLoading] =
    useState(false);
  const [showUpload, setShowUpload] =
    useState(false);

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
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res =
        await authorityAPI.getAssignedIssues();
      if (res.data.success) {
        setIssues(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    issueId, newStatus
  ) => {
    setStatusLoading(issueId);
    try {
      const res = await authorityAPI
        .updateIssueStatus(issueId, newStatus);
      if (res.data.success) {
        toast.success(
          `Status updated to ${newStatus
            .replace(/_/g, ' ')}`
        );
        fetchIssues();
        if (selectedIssue?.id === issueId) {
          setSelectedIssue({
            ...selectedIssue,
            status: newStatus,
          });
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message
        || 'Failed to update status'
      );
    } finally {
      setStatusLoading(null);
    }
  };

  const handleAfterImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      'image/jpeg', 'image/jpg',
      'image/png', 'image/webp',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(
        'Please upload a valid image file'
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    setAfterImage(file);
    setAfterPreview(URL.createObjectURL(file));
  };

  const handleUploadAfterImage = async () => {
    if (!afterImage) {
      toast.error('Please select an image');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('afterImage', afterImage);

      const res = await authorityAPI
        .uploadAfterImage(
          selectedIssue.id, formData
        );

      if (res.data.success) {
        toast.success(
          'After image uploaded successfully!'
        );
        setShowUpload(false);
        setAfterImage(null);
        setAfterPreview(null);
        fetchIssues();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadLoading(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      ASSIGNED: 'WORK_ASSIGNED',
      WORK_ASSIGNED: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
    };
    return flow[currentStatus] || null;
  };

  const getNextStatusLabel = (
    currentStatus
  ) => {
    const labels = {
      ASSIGNED: 'Mark as Work Assigned',
      WORK_ASSIGNED: 'Mark as In Progress',
      IN_PROGRESS: 'Mark as Completed',
    };
    return labels[currentStatus] || null;
  };

  const getStatusColor = (status) => {
    const colors = {
      ASSIGNED: '#0d6efd',
      WORK_ASSIGNED: '#fd7e14',
      IN_PROGRESS: '#ffc107',
      COMPLETED: '#198754',
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = {
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

  const filteredIssues =
    filterStatus === 'ALL'
      ? issues
      : issues.filter(
          (i) => i.status === filterStatus
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
                ...(item.id === 'issues'
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
            Assigned Issues
          </h4>
          <p style={styles.pageSubtitle}>
            Manage and update your
            assigned issues
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {[
            'ALL', 'ASSIGNED',
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
                  <div style={styles.headerLeft}>
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
                      {getStatusLabel(
                        issue.status
                      )}
                    </span>
                  </div>

                  <div style={styles.headerRight}>
                    {/* View Details */}
                    <button
                      style={styles.viewBtn}
                      onClick={() =>
                        setSelectedIssue(
                          selectedIssue?.id ===
                          issue.id
                            ? null
                            : issue
                        )
                      }
                    >
                      {selectedIssue?.id ===
                        issue.id
                        ? 'Hide Details'
                        : 'View Details'
                      }
                    </button>

                    {/* Upload After Image */}
                    {(issue.status ===
                      'IN_PROGRESS' ||
                      issue.status ===
                      'COMPLETED') &&
                      !issue.afterImage && (
                      <button
                        style={styles.uploadBtn}
                        onClick={() => {
                          setSelectedIssue(issue);
                          setShowUpload(true);
                        }}
                      >
                        <FaUpload /> After Image
                      </button>
                    )}

                    {/* Status Update Button */}
                    {getNextStatus(
                      issue.status
                    ) && (
                      <button
                        style={styles.updateBtn}
                        onClick={() =>
                          handleStatusUpdate(
                            issue.id,
                            getNextStatus(
                              issue.status
                            )
                          )
                        }
                        disabled={
                          statusLoading ===
                          issue.id
                        }
                      >
                        {statusLoading ===
                          issue.id
                          ? '⏳'
                          : getNextStatusLabel(
                              issue.status
                            )
                        }
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>

                  {/* Before Image */}
                  {issue.reportedImage && (
                    <div style={
                      styles.issueImgBox
                    }>
                      <p style={styles.imgLabel}>
                        📸 Before
                      </p>
                      <img
                        src={`http://localhost:8080${issue.reportedImage}`}
                        alt="Before"
                        style={styles.issueImg}
                        onError={(e) => {
                          e.target
                            .parentElement
                            .style.display =
                            'none';
                        }}
                      />
                    </div>
                  )}

                  <div style={styles.issueInfo}>
                    <h6 style={styles.issueTitle}>
                      {issue.title}
                    </h6>
                    <p style={styles.issueDesc}>
                      {issue.description
                        ?.length > 120
                        ? issue.description
                          .substring(0, 120)
                          + '...'
                        : issue.description
                      }
                    </p>

                    <div style={styles.metaRow}>
                      <span style={styles.metaItem}>
                        <FaMapMarkerAlt
                          style={styles.metaIcon}
                        />
                        {issue.city},
                        Ward {issue.wardNumber}
                      </span>
                      <span style={styles.metaItem}>
                        🏷️ {issue.issueType}
                      </span>
                      <span style={styles.metaItem}>
                        <FaCalendar
                          style={styles.metaIcon}
                        />
                        {formatDate(
                          issue.reportedDate
                        )}
                      </span>
                      <span style={{
                        ...styles.metaItem,
                        color:
                          issue.urgencyLevel ===
                            'HIGH' ? '#dc3545'
                          : issue.urgencyLevel
                            === 'MEDIUM'
                          ? '#fd7e14'
                          : '#198754',
                        fontWeight: '600',
                      }}>
                        ⚡ {issue.urgencyLevel}
                      </span>
                    </div>

                    {/* Citizen Info */}
                    {issue.citizen && (
                      <div style={styles.citizenBox}>
                        <span style={styles.citizenLabel}>
                          Reported by:
                        </span>
                        <span style={styles.citizenName}>
                          {issue.citizen.name}
                        </span>
                        <span style={styles.citizenCity}>
                          — {issue.citizen.city}
                        </span>
                      </div>
                    )}

                    {/* Expected Date */}
                    {issue
                      .expectedCompletionDate && (
                      <div style={styles.expectedBox}>
                        📅 Expected completion:
                        <strong>
                          {' '}
                          {formatDate(
                            issue
                              .expectedCompletionDate
                          )}
                        </strong>
                      </div>
                    )}

                    {/* Workers */}
                    {issue.workerCount > 0 && (
                      <div style={styles.workersBox}>
                        👷 Workers assigned:
                        <strong>
                          {' '}{issue.workerCount}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* After Image */}
                  {issue.afterImage && (
                    <div style={
                      styles.issueImgBox
                    }>
                      <p style={{
                        ...styles.imgLabel,
                        background: '#d1e7dd',
                        color: '#0f5132',
                      }}>
                        ✅ After
                      </p>
                      <img
                        src={`http://localhost:8080${issue.afterImage}`}
                        alt="After"
                        style={styles.issueImg}
                        onError={(e) => {
                          e.target
                            .parentElement
                            .style.display =
                            'none';
                        }}
                      />
                    </div>
                  )}

                </div>

                {/* Progress Bar */}
                {selectedIssue?.id ===
                  issue.id && (
                  <div style={styles.progressBox}>
                    <ProgressBar
                      status={issue.status}
                      timeline={issue.timeline}
                    />

                    {/* Feedback if completed */}
                    {issue.feedback && (
                      <div style={styles.feedbackBox}>
                        <h6 style={styles.feedbackTitle}>
                          ⭐ Citizen Feedback
                        </h6>
                        <div style={styles.starsRow}>
                          {[1,2,3,4,5].map((s) => (
                            <span
                              key={s}
                              style={{
                                color: s <=
                                  issue.feedback
                                    .starRating
                                  ? '#ffc107'
                                  : '#dee2e6',
                                fontSize: '20px',
                              }}
                            >
                              ★
                            </span>
                          ))}
                          <span style={styles.ratingNum}>
                            {issue.feedback
                              .starRating}/5
                          </span>
                        </div>
                        {issue.feedback
                          .comment && (
                          <p style={
                            styles.feedbackComment
                          }>
                            "{issue.feedback
                              .comment}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload After Image Modal */}
      {showUpload && selectedIssue && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>
                Upload After Image
              </h5>
              <button
                style={styles.closeBtn}
                onClick={() => {
                  setShowUpload(false);
                  setAfterImage(null);
                  setAfterPreview(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={styles.modalSubtitle}>
                Upload photo of the completed work
                as proof of resolution for
                <strong>
                  {' '}{selectedIssue.issueCode}
                </strong>
              </p>

              {/* Before Image Reference */}
              {selectedIssue.reportedImage && (
                <div style={styles.beforeRef}>
                  <p style={styles.beforeRefLabel}>
                    📸 Before (Reference):
                  </p>
                  <img
                    src={`http://localhost:8080${selectedIssue.reportedImage}`}
                    alt="Before"
                    style={styles.beforeRefImg}
                    onError={(e) => {
                      e.target.style.display =
                        'none';
                    }}
                  />
                </div>
              )}

              {/* Upload Area */}
              <div
                style={styles.uploadArea}
                onClick={() =>
                  document.getElementById(
                    'afterImg'
                  ).click()
                }
              >
                {afterPreview ? (
                  <img
                    src={afterPreview}
                    alt="After"
                    style={styles.previewImg}
                  />
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <FaUpload
                      style={styles.uploadIcon}
                    />
                    <p style={styles.uploadText}>
                      Click to upload after image
                    </p>
                    <p style={styles.uploadHint}>
                      JPG, PNG, WEBP (Max 10MB)
                    </p>
                  </div>
                )}
                <input
                  id="afterImg"
                  type="file"
                  accept="image/*"
                  onChange={handleAfterImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <button
                style={styles.uploadConfirmBtn}
                onClick={handleUploadAfterImage}
                disabled={uploadLoading}
              >
                {uploadLoading
                  ? '⏳ Uploading...'
                  : '✅ Upload After Image'
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
  },
  filterBtnActive: {
    background: '#2c7be5',
    color: 'white',
    border: '1px solid #2c7be5',
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    color: '#6c757d',
    background: 'white',
    borderRadius: '12px',
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
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  headerRight: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  viewBtn: {
    padding: '6px 12px',
    background: '#f0f7ff',
    border: '1px solid #2c7be5',
    color: '#2c7be5',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: '600',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    background: '#fff3cd',
    border: '1px solid #ffc107',
    color: '#856404',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: '600',
  },
  updateBtn: {
    padding: '6px 14px',
    background:
      'linear-gradient(135deg, #198754, #146c43)',
    border: 'none',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: '600',
  },
  cardBody: {
    padding: '15px',
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  issueImgBox: {
    width: '110px',
    flexShrink: 0,
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #dee2e6',
  },
  imgLabel: {
    background: '#fff3cd',
    color: '#856404',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    margin: 0,
  },
  issueImg: {
    width: '100%',
    height: '80px',
    objectFit: 'cover',
    display: 'block',
  },
  issueInfo: {
    flex: 1,
    minWidth: '200px',
  },
  issueTitle: {
    margin: '0 0 6px',
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '15px',
  },
  issueDesc: {
    margin: '0 0 10px',
    color: '#6c757d',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  metaRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '8px',
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
  citizenBox: {
    fontSize: '12px',
    color: '#555',
    marginBottom: '6px',
  },
  citizenLabel: {
    color: '#adb5bd',
    marginRight: '4px',
  },
  citizenName: {
    fontWeight: '600',
    marginRight: '4px',
  },
  citizenCity: {
    color: '#6c757d',
  },
  expectedBox: {
    fontSize: '12px',
    color: '#555',
    marginBottom: '4px',
    background: '#f0f7ff',
    padding: '5px 10px',
    borderRadius: '6px',
    display: 'inline-block',
  },
  workersBox: {
    fontSize: '12px',
    color: '#555',
    background: '#f5f0ff',
    padding: '5px 10px',
    borderRadius: '6px',
    display: 'inline-block',
    marginLeft: '8px',
  },
  progressBox: {
    padding: '15px',
    borderTop: '1px solid #f0f0f0',
  },
  feedbackBox: {
    background: '#fff8e1',
    border: '1px solid #ffe082',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '15px',
  },
  feedbackTitle: {
    margin: '0 0 10px',
    fontWeight: '700',
    color: '#856404',
    fontSize: '14px',
  },
  starsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    marginBottom: '8px',
  },
  ratingNum: {
    marginLeft: '8px',
    fontWeight: '700',
    color: '#ffc107',
    fontSize: '14px',
  },
  feedbackComment: {
    color: '#555',
    fontSize: '13px',
    fontStyle: 'italic',
    margin: 0,
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
    maxWidth: '450px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    borderBottom: '1px solid #dee2e6',
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: 1,
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
  },
  modalBody: {
    padding: '20px',
  },
  modalSubtitle: {
    color: '#6c757d',
    fontSize: '14px',
    marginBottom: '15px',
  },
  beforeRef: {
    marginBottom: '15px',
  },
  beforeRefLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#856404',
    marginBottom: '6px',
  },
  beforeRefImg: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },
  uploadArea: {
    border: '2px dashed #dee2e6',
    borderRadius: '10px',
    height: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    marginBottom: '15px',
    transition: 'all 0.2s ease',
  },
  uploadPlaceholder: {
    textAlign: 'center',
    color: '#adb5bd',
  },
  uploadIcon: {
    fontSize: '28px',
    marginBottom: '8px',
    display: 'block',
    margin: '0 auto 8px',
  },
  uploadText: {
    fontWeight: '600',
    color: '#6c757d',
    margin: '0 0 4px',
    fontSize: '14px',
  },
  uploadHint: {
    fontSize: '12px',
    color: '#adb5bd',
    margin: 0,
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  uploadConfirmBtn: {
    width: '100%',
    padding: '13px',
    background:
      'linear-gradient(135deg, #198754, #146c43)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: '700',
  },
};

export default AssignedIssues;
