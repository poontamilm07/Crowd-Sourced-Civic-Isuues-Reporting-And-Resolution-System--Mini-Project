import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCity, FaUsers, FaChartBar,
  FaClipboardList, FaSignOutAlt,
  FaSearch, FaCheck, FaTimes,
  FaIdCard, FaEye,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/axios';

const ManageUsers = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] =
    useState('pending');
  const [pendingCitizens, setPendingCitizens] =
    useState([]);
  const [pendingAuthorities,
    setPendingAuthorities] = useState([]);
  const [allCitizens, setAllCitizens] =
    useState([]);
  const [allAuthorities, setAllAuthorities] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] =
    useState('');
  const [selectedUser, setSelectedUser] =
    useState(null);
  const [actionLoading, setActionLoading] =
    useState(null);

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
    fetchAllData();
  }, []);

 const fetchAllData = async () => {
  setLoading(true);
  try {
    const pendingRes =
      await adminAPI.getPendingUsers();
    if (pendingRes.data.success) {
      setPendingCitizens(
        pendingRes.data.data.pendingCitizens || []
      );
      setPendingAuthorities(
        pendingRes.data.data.pendingAuthorities || []
      );
    }
  } catch (err) {
    console.error('Pending users error:', err);
  }

  try {
    const citizensRes =
      await adminAPI.getUsersByRole('CITIZEN');
    if (citizensRes.data.success) {
      setAllCitizens(citizensRes.data.data);
    }
  } catch (err) {
    console.error('Citizens error:', err);
  }

  try {
    const authoritiesRes =
      await adminAPI.getUsersByRole('AUTHORITY');
    if (authoritiesRes.data.success) {
      setAllAuthorities(authoritiesRes.data.data);
    }
  } catch (err) {
    console.error('Authorities error:', err);
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (userId,
    userName) => {
    setActionLoading(userId);
    try {
      const res =
        await adminAPI.approveUser(userId);
      if (res.data.success) {
        toast.success(
          `${userName} approved successfully!`
        );
        fetchAllData();
        setSelectedUser(null);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId,
    userName) => {
    if (!window.confirm(
      `Are you sure you want to reject ${userName}?`
    )) return;

    setActionLoading(userId);
    try {
      const res =
        await adminAPI.rejectUser(userId);
      if (res.data.success) {
        toast.success(
          `${userName} rejected.`
        );
        fetchAllData();
        setSelectedUser(null);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to reject user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = async (role) => {
    if (!searchKeyword.trim()) {
      fetchAllData();
      return;
    }
    try {
      const res = await adminAPI.searchUsers(
        role, searchKeyword
      );
      if (res.data.success) {
        if (role === 'CITIZEN') {
          setAllCitizens(res.data.data);
        } else {
          setAllAuthorities(res.data.data);
        }
      }
    } catch (err) {
      toast.error('Search failed');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: {
        bg: '#fff3cd', color: '#856404',
        label: 'Pending'
      },
      APPROVED: {
        bg: '#d1e7dd', color: '#0f5132',
        label: 'Approved'
      },
      REJECTED: {
        bg: '#f8d7da', color: '#842029',
        label: 'Rejected'
      },
    };
    const c = config[status] ||
      config.PENDING;
    return (
      <span style={{
        background: c.bg,
        color: c.color,
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

  const UserCard = ({ u, showActions }) => (
    <div style={styles.userCard}>
      <div style={styles.userCardLeft}>
        <div style={styles.userCardAvatar}>
          {u.name?.charAt(0).toUpperCase()}
        </div>
        <div style={styles.userCardInfo}>
          <h6 style={styles.userCardName}>
            {u.name}
          </h6>
          <p style={styles.userCardEmail}>
            {u.email}
          </p>
          <div style={styles.userCardMeta}>
            <span style={styles.metaTag}>
              📍 {u.city}, Ward {u.wardNumber}
            </span>
            {u.department && (
              <span style={styles.metaTag}>
                🏢 {u.department}
              </span>
            )}
            <span style={styles.metaTag}>
              📅 {formatDate(u.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.userCardRight}>
        {getStatusBadge(u.status)}

        <div style={styles.userCardActions}>
          <button
            style={styles.viewBtn}
            onClick={() => setSelectedUser(u)}
          >
            <FaEye /> View
          </button>

          {showActions &&
            u.status === 'PENDING' && (
            <>
              <button
                style={styles.approveBtn}
                onClick={() =>
                  handleApprove(u.id, u.name)
                }
                disabled={
                  actionLoading === u.id
                }
              >
                {actionLoading === u.id
                  ? '⏳'
                  : <><FaCheck /> Approve</>
                }
              </button>
              <button
                style={styles.rejectBtn}
                onClick={() =>
                  handleReject(u.id, u.name)
                }
                disabled={
                  actionLoading === u.id
                }
              >
                <FaTimes /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
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
                ...(item.id === 'users'
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
            Manage Users
          </h4>
          <p style={styles.pageSubtitle}>
            Approve or reject citizen and
            authority registrations
          </p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            {
              id: 'pending',
              label: `Pending Approvals (${
                pendingCitizens.length +
                pendingAuthorities.length
              })`,
            },
            {
              id: 'citizens',
              label: `All Citizens (${
                allCitizens.length
              })`,
            },
            {
              id: 'authorities',
              label: `All Authorities (${
                allAuthorities.length
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

        {/* Search Bar
            (for citizens and authorities) */}
        {activeTab !== 'pending' && (
          <div style={styles.searchBar}>
            <FaSearch style={styles.searchIcon}/>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) =>
                setSearchKeyword(e.target.value)
              }
              placeholder="Search by name or email..."
              style={styles.searchInput}
              onKeyPress={(e) =>
                e.key === 'Enter' &&
                handleSearch(
                  activeTab === 'citizens'
                    ? 'CITIZEN'
                    : 'AUTHORITY'
                )
              }
            />
            <button
              style={styles.searchBtn}
              onClick={() =>
                handleSearch(
                  activeTab === 'citizens'
                    ? 'CITIZEN'
                    : 'AUTHORITY'
                )
              }
            >
              Search
            </button>
            <button
              style={styles.resetBtn}
              onClick={() => {
                setSearchKeyword('');
                fetchAllData();
              }}
            >
              Reset
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={styles.loading}>
            Loading users...
          </div>
        ) : (
          <>
            {/* Pending Tab */}
            {activeTab === 'pending' && (
              <div>
                {pendingCitizens.length === 0
                  && pendingAuthorities.length
                  === 0 ? (
                  <div style={styles.emptyState}>
                    <p style={styles.emptyIcon}>
                      ✅
                    </p>
                    <p style={styles.emptyText}>
                      No pending approvals!
                    </p>
                  </div>
                ) : (
                  <>
                    {pendingCitizens.length > 0 && (
                      <div
                        style={styles.section}
                      >
                        <h6 style={styles.sectionTitle}>
                          👤 Pending Citizens (
                          {pendingCitizens.length}
                          )
                        </h6>
                        {pendingCitizens.map(
                          (u) => (
                            <UserCard
                              key={u.id}
                              u={u}
                              showActions={true}
                            />
                          )
                        )}
                      </div>
                    )}
                    {pendingAuthorities.length
                      > 0 && (
                      <div style={styles.section}>
                        <h6 style={
                          styles.sectionTitle
                        }>
                          👷 Pending Authorities
                          ({pendingAuthorities
                            .length})
                        </h6>
                        {pendingAuthorities.map(
                          (u) => (
                            <UserCard
                              key={u.id}
                              u={u}
                              showActions={true}
                            />
                          )
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Citizens Tab */}
            {activeTab === 'citizens' && (
              <div>
                {allCitizens.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p style={styles.emptyIcon}>
                      👤
                    </p>
                    <p style={styles.emptyText}>
                      No citizens found.
                    </p>
                  </div>
                ) : (
                  allCitizens.map((u) => (
                    <UserCard
                      key={u.id}
                      u={u}
                      showActions={true}
                    />
                  ))
                )}
              </div>
            )}

            {/* Authorities Tab */}
            {activeTab === 'authorities' && (
              <div>
                {allAuthorities.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p style={styles.emptyIcon}>
                      👷
                    </p>
                    <p style={styles.emptyText}>
                      No authorities found.
                    </p>
                  </div>
                ) : (
                  allAuthorities.map((u) => (
                    <UserCard
                      key={u.id}
                      u={u}
                      showActions={true}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h5 style={styles.modalTitle}>
                User Details
              </h5>
              <button
                style={styles.closeBtn}
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>

              {/* Avatar */}
              <div style={styles.modalAvatar}>
                {selectedUser.name
                  ?.charAt(0).toUpperCase()}
              </div>
              <h5 style={styles.modalName}>
                {selectedUser.name}
              </h5>
              <p style={styles.modalEmail}>
                {selectedUser.email}
              </p>
              {getStatusBadge(
                selectedUser.status
              )}

              {/* Details Grid */}
              <div style={styles.detailGrid}>
                {[
                  {
                    label: 'Role',
                    value: selectedUser.role,
                  },
                  {
                    label: 'City',
                    value: selectedUser.city,
                  },
                  {
                    label: 'Area',
                    value:
                      selectedUser.villageOrArea,
                  },
                  {
                    label: 'Ward',
                    value: selectedUser.wardNumber,
                  },
                  {
                    label: 'Pincode',
                    value: selectedUser.pincode,
                  },
                  {
                    label: 'Address',
                    value: selectedUser.address,
                  },
                  {
                    label: 'Department',
                    value:
                      selectedUser.department
                      || 'N/A',
                  },
                  {
                    label: 'Contact',
                    value:
                      selectedUser.contactNumber
                      || 'N/A',
                  },
                  {
                    label: 'Registered',
                    value: formatDate(
                      selectedUser.createdAt
                    ),
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

              {/* ID Card */}
              {selectedUser.idCardPhoto && (
                <div style={styles.idCardBox}>
                  <h6 style={styles.idCardTitle}>
                    <FaIdCard /> ID Card
                  </h6>
                  <img
                    src={`http://localhost:8080${selectedUser.idCardPhoto}`}
                    alt="ID Card"
                    style={styles.idCardImg}
                    onError={(e) => {
                      e.target.style.display =
                        'none';
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              {selectedUser.status ===
                'PENDING' && (
                <div style={styles.modalActions}>
                  <button
                    style={styles.modalApproveBtn}
                    onClick={() =>
                      handleApprove(
                        selectedUser.id,
                        selectedUser.name
                      )
                    }
                    disabled={
                      actionLoading ===
                      selectedUser.id
                    }
                  >
                    {actionLoading ===
                      selectedUser.id
                      ? '⏳ Processing...'
                      : '✅ Approve Account'
                    }
                  </button>
                  <button
                    style={styles.modalRejectBtn}
                    onClick={() =>
                      handleReject(
                        selectedUser.id,
                        selectedUser.name
                      )
                    }
                  >
                    ❌ Reject Account
                  </button>
                </div>
              )}

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
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '9px 18px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    fontWeight: '500',
    color: '#6c757d',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: '#2c7be5',
    color: 'white',
    border: '1px solid #2c7be5',
    fontWeight: '600',
  },
  searchBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    background: 'white',
    padding: '12px',
    borderRadius: '10px',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.05)',
    flexWrap: 'wrap',
  },
  searchIcon: {
    color: '#adb5bd',
    alignSelf: 'center',
  },
  searchInput: {
    flex: 1,
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    minWidth: '200px',
  },
  searchBtn: {
    padding: '9px 18px',
    background: '#2c7be5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: '600',
    fontSize: '13px',
  },
  resetBtn: {
    padding: '9px 18px',
    background: '#f8f9fa',
    color: '#6c757d',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '13px',
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
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '12px',
    fontSize: '15px',
    padding: '10px 15px',
    background: '#f0f7ff',
    borderRadius: '8px',
    border: '1px solid #bee3f8',
  },
  userCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '10px',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  userCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: 1,
  },
  userCardAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: '#2c7be5',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
    flexShrink: 0,
  },
  userCardInfo: {
    flex: 1,
  },
  userCardName: {
    margin: '0 0 3px',
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '15px',
  },
  userCardEmail: {
    margin: '0 0 6px',
    color: '#6c757d',
    fontSize: '13px',
  },
  userCardMeta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  metaTag: {
    fontSize: '11px',
    color: '#6c757d',
    background: '#f8f9fa',
    padding: '2px 8px',
    borderRadius: '10px',
    border: '1px solid #dee2e6',
  },
  userCardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  userCardActions: {
    display: 'flex',
    gap: '8px',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
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
  approveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    background: '#198754',
    border: 'none',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: '600',
  },
  rejectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    background: '#dc3545',
    border: 'none',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
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
    maxWidth: '520px',
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
    textAlign: 'center',
  },
  modalAvatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: '#2c7be5',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 auto 12px',
  },
  modalName: {
    margin: '0 0 5px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  modalEmail: {
    color: '#6c757d',
    fontSize: '14px',
    marginBottom: '10px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    margin: '20px 0',
    textAlign: 'left',
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
  idCardBox: {
    textAlign: 'left',
    marginBottom: '20px',
  },
  idCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#555',
    marginBottom: '10px',
    fontSize: '13px',
    fontWeight: '600',
  },
  idCardImg: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    flexDirection: 'column',
  },
  modalApproveBtn: {
    padding: '12px',
    background: '#198754',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '700',
  },
  modalRejectBtn: {
    padding: '12px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '700',
  },
};

export default ManageUsers;
