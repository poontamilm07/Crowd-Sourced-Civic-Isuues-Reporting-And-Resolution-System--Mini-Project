import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCity, FaUsers, FaChartBar,
  FaClipboardList, FaSignOutAlt,
  FaSearch, FaFilter, FaTimes,
  FaUserCheck,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/axios';

const ManageIssues = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [authorities, setAuthorities] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState('ALL');
  const [selectedIssue, setSelectedIssue] =
    useState(null);
  const [showAssignModal, setShowAssignModal] =
    useState(false);
  const [assignData, setAssignData] = useState({
    authorityId: '',
    workerCount: 1,
    expectedCompletionDate: '',
  });
  const [assignLoading, setAssignLoading] =
    useState(false);
  const [filterData, setFilterData] = useState({
    ward: '',
    pincode: '',
    department: '',
  });
  const [searchKeyword, setSearchKeyword] =
    useState('');

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

  const statusTabs = [
    'ALL', 'REPORTED', 'ASSIGNED',
    'WORK_ASSIGNED', 'IN_PROGRESS',
    'COMPLETED',
  ];

  useEffect(() => {
    fetchIssues();
    fetchAuthorities();
  }, []);

 const fetchIssues = async (status = 'ALL') => {
  setLoading(true);
  try {
    let res;
    if (status === 'ALL') {
      res = await adminAPI.getAllIssues();
    } else {
      res = await adminAPI
        .getIssuesByStatus(status);
    }
    if (res.data.success) {
      setIssues(res.data.data);
    }
  } catch (err) {
    console.error('Issues error:', err);
  } finally {
    setLoading(false);
  }
};

 const fetchAuthorities = async () => {
  try {
    const res =
      await adminAPI.getAllAuthorities();
    if (res.data.success) {
      setAuthorities(res.data.data);
    }
  } catch (err) {
    console.error('Authorities error:', err);
  }
};

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchIssues(tab);
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.filterIssues(
        filterData.ward,
        filterData.pincode,
        filterData.department
      );
      if (res.data.success) {
        setIssues(res.data.data);
      }
    } catch (err) {
      toast.error('Filter failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignData.authorityId) {
      toast.error('Please select an authority');
      return;
    }
    if (!assignData.expectedCompletionDate) {
      toast.error(
        'Please set expected completion date'
      );
      return;
    }

    setAssignLoading(true);
    try {
      const res = await adminAPI.assignIssue(
        selectedIssue.id,
        {
          authorityId: parseInt(
            assignData.authorityId
          ),
          workerCount: parseInt(
            assignData.workerCount
          ),
          expectedCompletionDate:
            assignData.expectedCompletionDate,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setShowAssignModal(false);
        setSelectedIssue(null);
        setAssignData({
          authorityId: '',
          workerCount: 1,
          expectedCompletionDate: '',
        });
        fetchIssues(activeTab);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message
        || 'Failed to assign issue'
      );
    } finally {
      setAssignLoading(false);
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

  const filteredIssues = searchKeyword
    ? issues.filter((i) =>
        i.title?.toLowerCase().includes(
          searchKeyword.toLowerCase()
        ) ||
        i.issueCode?.toLowerCase().includes(
          searchKeyword.toLowerCase()
        ) ||
        i.city?.toLowerCase().includes(
          searchKeyword.toLowerCase()
        )
      )
    : issues;

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
            Manage Issues
          </h4>
          <p style={styles.pageSubtitle}>
            View, filter and assign issues
            to authorities
          </p>
        </div>

        {/* Search and Filter */}
        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon}/>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) =>
                setSearchKeyword(e.target.value)
              }
              placeholder="Search by title, ID or city..."
              style={styles.searchInput}
            />
          </div>
          <input
            type="text"
            value={filterData.ward}
            onChange={(e) =>
              setFilterData({
                ...filterData,
                ward: e.target.value,
              })
            }
            placeholder="Ward #"
            style={styles.filterInput}
          />
          <input
            type="text"
            value={filterData.pincode}
            onChange={(e) =>
              setFilterData({
                ...filterData,
                pincode: e.target.value,
              })
            }
            placeholder="Pincode"
            style={styles.filterInput}
          />
          <select
            value={filterData.department}
            onChange={(e) =>
              setFilterData({
                ...filterData,
                department: e.target.value,
              })
            }
            style={styles.filterSelect}
          >
            <option value="">
              All Departments
            </option>
            {[
              'Roads Department',
              'Water Supply Department',
              'Electricity Department',
              'Sanitation Department',
              'Drainage Department',
              'Public Works Department',
            ].map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <button
            style={styles.filterBtn}
            onClick={handleFilter}
          >
            <FaFilter /> Filter
          </button>
          <button
            style={styles.resetBtn}
            onClick={() => {
              setFilterData({
                ward: '', pincode: '',
                department: '',
              });
              setSearchKeyword('');
              fetchIssues(activeTab);
            }}
          >
            Reset
          </button>
        </div>

        {/* Status Tabs */}
        <div style={styles.tabs}>
          {statusTabs.map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab
                  ? styles.tabActive
                  : {}),
              }}
              onClick={() =>
                handleTabChange(tab)
              }
            >
              {tab === 'ALL'
                ? `All (${issues.length})`
                : `${getStatusLabel(tab)} (${
                    issues.filter(
                      (i) => i.status === tab
                    ).length
                  })`
              }
            </button>
          ))}
        </div>

        {/* Issues Table */}
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
          <div style={styles.tableCard}>
            {/* Table Header */}
            <div style={styles.tableHeader}>
              <span style={styles.th}>
                Issue ID
              </span>
              <span style={styles.th}>
                Title
              </span>
              <span style={styles.th}>
                City / Ward
              </span>
              <span style={styles.th}>
                Type
              </span>
              <span style={styles.th}>
                Urgency
              </span>
              <span style={styles.th}>
                Status
              </span>
              <span style={styles.th}>
                Actions
              </span>
            </div>

            {/* Table Rows */}
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                style={{
                  ...styles.tableRow,
                  borderLeft: issue.emergency
                    ? '4px solid #dc3545'
                    : '4px solid transparent',
                }}
              >
                <span style={styles.issueCode}>
                  {issue.issueCode}
                  {issue.emergency && (
                    <span style={
                      styles.emergencyDot
                    }>
                      🚨
                    </span>
                  )}
                </span>
                <span style={styles.td}>
                  {issue.title?.length > 30
                    ? issue.title
                        .substring(0, 30) + '...'
                    : issue.title
                  }
                </span>
                <span style={styles.td}>
                  {issue.city},
                  Ward {issue.wardNumber}
                </span>
                <span style={styles.td}>
                  {issue.issueType}
                </span>
                <span style={{
                  ...styles.urgencyBadge,
                  color:
                    issue.urgencyLevel === 'HIGH'
                      ? '#dc3545'
                    : issue.urgencyLevel ===
                      'MEDIUM'
                      ? '#fd7e14'
                    : '#198754',
                }}>
                  {issue.urgencyLevel}
                </span>
                <span>
                  <span style={{
                    background: getStatusColor(
                      issue.status
                    ),
                    color: issue.status ===
                      'IN_PROGRESS'
                      ? '#333' : 'white',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}>
                    {getStatusLabel(issue.status)}
                  </span>
                </span>
                <span style={styles.actionBtns}>
                  <button
                    style={styles.viewBtn}
                    onClick={() =>
                      setSelectedIssue(issue)
                    }
                  >
                    View
                  </button>
                  {issue.status === 'REPORTED' && (
                    <button
                      style={styles.assignBtn}
                      onClick={() => {
                        setSelectedIssue(issue);
                        setShowAssignModal(true);
                      }}
                    >
                      Assign
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && !showAssignModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>
                {selectedIssue.issueCode} —
                Issue Details
              </h5>
              <button
                style={styles.closeBtn}
                onClick={() =>
                  setSelectedIssue(null)
                }
              >
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>

              {/* Emergency Badge */}
              {selectedIssue.emergency && (
                <div style={styles.emergencyAlert}>
                  🚨 This is an Emergency Issue
                </div>
              )}

              {/* Reported Image */}
              {selectedIssue.reportedImage && (
                <div style={styles.imageSection}>
                  <p style={styles.imageLabel}>
                    📸 Reported Image (Before)
                  </p>
                  <img
                    src={`http://localhost:8080${selectedIssue.reportedImage}`}
                    alt="Issue"
                    style={styles.modalImg}
                    onError={(e) => {
                      e.target.style
                        .display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Details Grid */}
              <div style={styles.detailGrid}>
                {[
                  {
                    label: 'Title',
                    value: selectedIssue.title,
                  },
                  {
                    label: 'Issue Type',
                    value: selectedIssue.issueType,
                  },
                  {
                    label: 'Urgency',
                    value:
                      selectedIssue.urgencyLevel,
                  },
                  {
                    label: 'Status',
                    value: getStatusLabel(
                      selectedIssue.status
                    ),
                  },
                  {
                    label: 'City',
                    value: selectedIssue.city,
                  },
                  {
                    label: 'Ward',
                    value: selectedIssue.wardNumber,
                  },
                  {
                    label: 'Pincode',
                    value: selectedIssue.pincode,
                  },
                  {
                    label: 'Address',
                    value: selectedIssue.address,
                  },
                  {
                    label: 'Landmark',
                    value: selectedIssue.landmark
                      || 'N/A',
                  },
                  {
                    label: 'Reported By',
                    value:
                      selectedIssue.citizen?.name,
                  },
                  {
                    label: 'Reported Date',
                    value: formatDate(
                      selectedIssue.reportedDate
                    ),
                  },
                  {
                    label: 'Votes',
                    value: selectedIssue.voteCount,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={styles.detailItem}
                  >
                    <span style={styles.detailLabel}>
                      {item.label}
                    </span>
                    <span style={styles.detailValue}>
                      {item.value || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={styles.descBox}>
                <p style={styles.descLabel}>
                  Description
                </p>
                <p style={styles.descText}>
                  {selectedIssue.description}
                </p>
              </div>

              {/* Authority Info */}
              {selectedIssue.authority && (
                <div style={styles.authorityBox}>
                  <p style={styles.authorityTitle}>
                    👷 Assigned Authority
                  </p>
                  <p style={styles.authorityName}>
                    {selectedIssue.authority.name}
                  </p>
                  <p style={styles.authorityDept}>
                    {selectedIssue
                      .authority.department}
                  </p>
                </div>
              )}

              {/* Before After Images */}
              {selectedIssue.afterImage && (
                <div style={styles.beforeAfter}>
                  <div style={styles.imgBox}>
                    <div style={styles.beforeLabel}>
                      Before
                    </div>
                    <img
                      src={`http://localhost:8080${selectedIssue.reportedImage}`}
                      alt="Before"
                      style={styles.compareImg}
                      onError={(e) => {
                        e.target.style
                          .display = 'none';
                      }}
                    />
                  </div>
                  <div style={styles.imgBox}>
                    <div style={styles.afterLabel}>
                      After
                    </div>
                    <img
                      src={`http://localhost:8080${selectedIssue.afterImage}`}
                      alt="After"
                      style={styles.compareImg}
                      onError={(e) => {
                        e.target.style
                          .display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Assign Button */}
              {selectedIssue.status ===
                'REPORTED' && (
                <button
                  style={styles.assignNowBtn}
                  onClick={() =>
                    setShowAssignModal(true)
                  }
                >
                  <FaUserCheck /> Assign to
                  Authority
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedIssue && (
        <div style={styles.modalOverlay}>
          <div style={styles.assignModal}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>
                Assign Issue —
                {selectedIssue.issueCode}
              </h5>
              <button
                style={styles.closeBtn}
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedIssue(null);
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div style={styles.assignBody}>

              {/* Issue Summary */}
              <div style={styles.issueSummary}>
                <p style={styles.summaryTitle}>
                  {selectedIssue.title}
                </p>
                <p style={styles.summaryMeta}>
                  📍 {selectedIssue.city},
                  Ward {selectedIssue.wardNumber}
                  | {selectedIssue.issueType}
                </p>
              </div>

              {/* Select Authority */}
              <div style={styles.assignField}>
                <label style={styles.assignLabel}>
                  Select Authority *
                </label>
                <select
                  value={assignData.authorityId}
                  onChange={(e) =>
                    setAssignData({
                      ...assignData,
                      authorityId: e.target.value,
                    })
                  }
                  style={styles.assignSelect}
                >
                  <option value="">
                    Choose Authority...
                  </option>
                  {authorities.map((auth) => (
                    <option
                      key={auth.id}
                      value={auth.id}
                    >
                      {auth.name} —
                      {auth.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Worker Count */}
              <div style={styles.assignField}>
                <label style={styles.assignLabel}>
                  Number of Workers
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={assignData.workerCount}
                  onChange={(e) =>
                    setAssignData({
                      ...assignData,
                      workerCount: e.target.value,
                    })
                  }
                  style={styles.assignInput}
                />
              </div>

              {/* Expected Date */}
              <div style={styles.assignField}>
                <label style={styles.assignLabel}>
                  Expected Completion Date *
                </label>
                <input
                  type="date"
                  min={new Date()
                    .toISOString()
                    .split('T')[0]}
                  value={
                    assignData
                      .expectedCompletionDate
                  }
                  onChange={(e) =>
                    setAssignData({
                      ...assignData,
                      expectedCompletionDate:
                        e.target.value,
                    })
                  }
                  style={styles.assignInput}
                />
              </div>

              {/* Submit */}
              <button
                style={styles.submitAssignBtn}
                onClick={handleAssign}
                disabled={assignLoading}
              >
                {assignLoading
                  ? '⏳ Assigning...'
                  : '✅ Assign Issue'
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
  filterBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    background: 'white',
    padding: '12px',
    borderRadius: '10px',
    flexWrap: 'wrap',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.05)',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 2,
    background: '#f8f9fa',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    minWidth: '200px',
  },
  searchIcon: {
    color: '#adb5bd',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  filterInput: {
    padding: '9px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100px',
    background: '#f8f9fa',
  },
  filterSelect: {
    padding: '9px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#f8f9fa',
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    background: '#2c7be5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '13px',
    fontWeight: '600',
  },
  resetBtn: {
    padding: '9px 16px',
    background: '#f8f9fa',
    color: '#6c757d',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '13px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '7px 14px',
    border: '1px solid #dee2e6',
    borderRadius: '20px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
    color: '#6c757d',
  },
  tabActive: {
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
  tableCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.06)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 2fr 1.5fr 1fr 0.8fr 1fr 1fr',
    gap: '10px',
    padding: '12px 15px',
    background: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
  },
  th: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 2fr 1.5fr 1fr 0.8fr 1fr 1fr',
    gap: '10px',
    padding: '12px 15px',
    borderBottom: '1px solid #f0f0f0',
    alignItems: 'center',
    transition: 'background 0.2s ease',
  },
  issueCode: {
    color: '#2c7be5',
    fontWeight: '700',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  emergencyDot: {
    fontSize: '12px',
  },
  td: {
    fontSize: '13px',
    color: '#555',
  },
  urgencyBadge: {
    fontSize: '12px',
    fontWeight: '700',
  },
  actionBtns: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  viewBtn: {
    padding: '5px 10px',
    background: '#f0f7ff',
    border: '1px solid #2c7be5',
    color: '#2c7be5',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'inherit',
    fontWeight: '600',
  },
  assignBtn: {
    padding: '5px 10px',
    background: '#198754',
    border: 'none',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontFamily: 'inherit',
    fontWeight: '600',
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
    maxWidth: '580px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.2)',
  },
  assignModal: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '460px',
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
    fontSize: '15px',
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
  emergencyAlert: {
    background: '#f8d7da',
    color: '#842029',
    padding: '10px 15px',
    borderRadius: '8px',
    fontWeight: '700',
    marginBottom: '15px',
    fontSize: '14px',
  },
  imageSection: {
    marginBottom: '15px',
  },
  imageLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '8px',
  },
  modalImg: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    maxHeight: '200px',
    objectFit: 'cover',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '15px',
  },
  detailItem: {
    background: '#f8f9fa',
    padding: '10px',
    borderRadius: '8px',
  },
  detailLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#adb5bd',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '3px',
  },
  detailValue: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '500',
  },
  descBox: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '15px',
  },
  descLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: '5px',
  },
  descText: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.6',
    margin: 0,
  },
  authorityBox: {
    background: '#f0f7ff',
    border: '1px solid #bee3f8',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '15px',
  },
  authorityTitle: {
    margin: '0 0 5px',
    fontWeight: '700',
    color: '#2c7be5',
    fontSize: '13px',
  },
  authorityName: {
    margin: '0 0 3px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  authorityDept: {
    margin: 0,
    color: '#6c757d',
    fontSize: '13px',
  },
  beforeAfter: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '15px',
  },
  imgBox: {
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #dee2e6',
  },
  beforeLabel: {
    background: '#fff3cd',
    color: '#856404',
    padding: '6px 10px',
    fontWeight: '700',
    fontSize: '12px',
  },
  afterLabel: {
    background: '#d1e7dd',
    color: '#0f5132',
    padding: '6px 10px',
    fontWeight: '700',
    fontSize: '12px',
  },
  compareImg: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    display: 'block',
  },
  assignNowBtn: {
    width: '100%',
    padding: '12px',
    background:
      'linear-gradient(135deg, #198754, #146c43)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  assignBody: {
    padding: '20px',
  },
  issueSummary: {
    background: '#f0f7ff',
    border: '1px solid #bee3f8',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
  },
  summaryTitle: {
    margin: '0 0 4px',
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '14px',
  },
  summaryMeta: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px',
  },
  assignField: {
    marginBottom: '15px',
  },
  assignLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '7px',
  },
  assignSelect: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fafafa',
  },
  assignInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fafafa',
  },
  submitAssignBtn: {
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
    marginTop: '5px',
  },
};

export default ManageIssues;
