import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCity, FaPlus, FaList, FaSearch,
  FaGlobe, FaUser, FaSignOutAlt,
  FaChartBar, FaThumbsUp, 
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { citizenAPI, publicAPI } from '../../api/axios';
import { toast } from 'react-toastify';

const ISSUE_TYPES = [
  'Road Pothole',
  'Garbage Overflow',
  'Broken Street Light',
  'Water Leakage',
  'Drainage Blockage',
  'Open Manhole',
  'Illegal Dumping',
  'Damaged Public Property',
  'Flooded Road',
  'Fallen Tree',
  'Other Issue',
];

const SMART_SUGGESTIONS = {
  water: ['Water Leakage', 'Flooded Road', 'Drainage Blockage'],
  garbage: ['Garbage Overflow', 'Illegal Dumping'],
  road: ['Road Pothole', 'Flooded Road', 'Damaged Public Property'],
  drain: ['Drainage Blockage', 'Open Manhole', 'Flooded Road'],
  light: ['Broken Street Light'],
  tree: ['Fallen Tree', 'Damaged Public Property'],
  manhole: ['Open Manhole', 'Drainage Blockage'],
};

const PublicIssues = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] =
    useState('');
  const [filterCity, setFilterCity] =
    useState(user?.city || '');
  const [filterWard, setFilterWard] =
    useState('');
  const [filterPincode, setFilterPincode] =
    useState('');
  const [filterType, setFilterType] =
    useState('');
  const [votingId, setVotingId] =
    useState(null);
  const [votedIds, setVotedIds] = useState([]);
  const [suggestions, setSuggestions] =
    useState([]);
  const [showSuggestions, setShowSuggestions] =
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
useEffect(() => {
  publicAPI.getDistricts()
    .then((res) => {
      if (res.data.success) {
        setDistricts(res.data.data);
      }
    })
    .catch(() => {
  setDistricts([
    { id: 1, name: 'Chennai' },
    { id: 2, name: 'Coimbatore' },
    { id: 3, name: 'Madurai' },
    { id: 4, name: 'Tiruchirappalli' },
    { id: 5, name: 'Salem' },
    { id: 6, name: 'Tirunelveli' },
    { id: 7, name: 'Vellore' },
    { id: 8, name: 'Erode' },
    { id: 9, name: 'Tiruppur' },
    { id: 10, name: 'Dindigul' },
    { id: 11, name: 'Thanjavur' },
    { id: 12, name: 'Kancheepuram' },
    { id: 13, name: 'Cuddalore' },
    { id: 14, name: 'Villupuram' },
    { id: 15, name: 'Nagapattinam' },
    { id: 16, name: 'Pudukkottai' },
    { id: 17, name: 'Ramanathapuram' },
    { id: 18, name: 'Virudhunagar' },
    { id: 19, name: 'Sivaganga' },
    { id: 20, name: 'Theni' },
    { id: 21, name: 'Nilgiris' },
    { id: 22, name: 'Krishnagiri' },
    { id: 23, name: 'Dharmapuri' },
    { id: 24, name: 'Namakkal' },
    { id: 25, name: 'Karur' },
    { id: 26, name: 'Perambalur' },
    { id: 27, name: 'Ariyalur' },
    { id: 28, name: 'Thoothukudi' },
    { id: 29, name: 'Kanyakumari' },
    { id: 30, name: 'Tiruvannamalai' },
    { id: 31, name: 'Tenkasi' },
    { id: 32, name: 'Mayiladuthurai' },
    { id: 33, name: 'Chengalpattu' },
    { id: 34, name: 'Ranipet' },
    { id: 35, name: 'Tirupattur' },
    { id: 36, name: 'Kallakurichi' },
    { id: 37, name: 'Tirupathur' },
    { id: 38, name: 'Viruthachalam' },
  ]);
});
fetchPublicIssues();   // ✅ ADD THIS
  fetchVotedIssues();
}, [])
  const fetchVotedIssues = async () => {
    try {
      const res =
        await citizenAPI.getVotedIssues();
      if (res.data.success) {
        const ids = res.data.data.map(
          (i) => i.id
        );
        setVotedIds(ids);
      }
    } catch (err) {
      console.error('Voted issues error:', err);
    }
  };

  const fetchPublicIssues = async (city = '') => {
  setLoading(true);
  try {
    const res = await publicAPI.getPublicIssues(city);

    if (res.data.success) {
      setIssues(res.data.data);
    }
  } catch (err) {
    console.error('Fetch issues error:', err);
    toast.error('Failed to load issues');
  } finally {
    setLoading(false);
  }
};

  const handleSearch = async () => {
  if (!searchKeyword.trim() &&
      !filterWard.trim() &&
      !filterPincode.trim() &&
      !filterType) {
    fetchPublicIssues(filterCity);
    return;
  }
  setLoading(true);
  setShowSuggestions(false);
  try {
    const params = {};
    if (searchKeyword.trim())
      params.keyword = searchKeyword.trim();
    // Only add city filter if no keyword
    // so keyword search finds all cities
    if (!searchKeyword.trim() && filterCity)
      params.city = filterCity;
    if (filterWard.trim())
      params.wardNumber = filterWard.trim();
    if (filterPincode.trim())
      params.pincode = filterPincode.trim();
    if (filterType)
      params.issueType = filterType;

    const res =
      await publicAPI.searchAdvanced(params);
    if (res.data.success) {
      setIssues(res.data.data);
    }
  } catch (err) {
    console.error('Search error:', err);
    toast.error('Search failed');
  } finally {
    setLoading(false);
  }
};

  const handleKeywordChange = (value) => {
    setSearchKeyword(value);
    // Smart suggestions
    if (value.length >= 2) {
      const kw = value.toLowerCase();
      let found = [];
      Object.keys(SMART_SUGGESTIONS).forEach(
        (key) => {
          if (kw.includes(key)) {
            found = [
              ...found,
              ...SMART_SUGGESTIONS[key],
            ];
          }
        }
      );
      // Remove duplicates
      const unique = [...new Set(found)];
      setSuggestions(unique);
      setShowSuggestions(unique.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

 const handleSuggestionClick = (suggestion) => {
  setSearchKeyword(suggestion);
  setFilterType('');
  setSuggestions([]);
  setShowSuggestions(false);

  // Search immediately
  setLoading(true);
  publicAPI.searchAdvanced({
    keyword: suggestion,
  }).then((res) => {
    if (res.data.success) {
      setIssues(res.data.data);
    }
  }).catch((err) => {
    console.error('Suggestion search:', err);
  }).finally(() => {
    setLoading(false);
  });
};

const handleCityChange = (e) => {
  const districtId = e.target.value;

  const districtName = districts.find(
    (d) => String(d.id) === String(districtId)
  )?.name || '';

  setSelectedDistrictId(districtId);
  setFilterCity(districtName);
};

  const handleReset = () => {
    setSearchKeyword('');
    setFilterWard('');
    setFilterPincode('');
    setFilterType('');
    setFilterCity(user?.city || '');
    setSuggestions([]);
    setShowSuggestions(false);
    fetchPublicIssues(user?.city || '');
  };

  const handleVote = async (issueId) => {
    if (votedIds.includes(issueId)) {
      toast.info(
        'You already voted on this issue'
      );
      return;
    }
    setVotingId(issueId);
    try {
      const res =
        await citizenAPI.voteOnIssue(issueId);
      if (res.data.success) {
        toast.success(
          'Vote recorded! +2 points 🏆'
        );
        setVotedIds([...votedIds, issueId]);
        setIssues(issues.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                voteCount:
                  res.data.data.voteCount,
              }
            : issue
        ));
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to vote');
    } finally {
      setVotingId(null);
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
    if (!dateStr) return '';
    return new Date(dateStr)
      .toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
  };

  const sortedIssues = [...issues].sort(
    (a, b) => b.voteCount - a.voteCount
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
                ...(item.id === 'public'
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
            Public Issues
          </h4>
          <p style={styles.pageSubtitle}>
            Search, filter and vote on
            community issues
          </p>
        </div>

        {/* Search & Filter Box */}
        <div style={styles.searchFilterCard}>

          {/* Search with Suggestions */}
          <div style={styles.searchWrapper}>
            <div style={styles.searchBox}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) =>
                  handleKeywordChange(
                    e.target.value
                  )
                }
                placeholder="Search issues (e.g., water, garbage, road, drain...)"
                style={styles.searchInput}
                onKeyPress={(e) =>
                  e.key === 'Enter' &&
                  handleSearch()
                }
                onFocus={() =>
                  suggestions.length > 0 &&
                  setShowSuggestions(true)
                }
              />
              {searchKeyword && (
                <button
                  style={styles.clearBtn}
                  onClick={() => {
                    setSearchKeyword('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Smart Suggestions Dropdown */}
            {showSuggestions &&
              suggestions.length > 0 && (
              <div style={styles.suggestions}>
                <p style={styles.suggestionTitle}>
                  💡 Did you mean:
                </p>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    style={styles.suggestionItem}
                    onClick={() =>
                      handleSuggestionClick(s)
                    }
                  >
                    <FaSearch
                      style={styles.suggestionIcon}
                    />
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filters Row */}
          <div style={styles.filtersRow}>

            {/* City Filter */}
            <div style={styles.filterItem}>
  <label style={styles.filterLabel}>
    🏙️ City
  </label>

  <select
    value={selectedDistrictId}
    onChange={handleCityChange}
    style={styles.filterSelect}
  >
    <option value="">Select City</option>
    {districts.map((d) => (
      <option key={d.id} value={d.id}>
        {d.name}
      </option>
    ))}
  </select>
</div>

            {/* Ward Filter */}
            <div style={styles.filterItem}>
              <label style={styles.filterLabel}>
                🗺️ Ward Number
              </label>
              <input
                type="text"
                value={filterWard}
                onChange={(e) =>
                  setFilterWard(e.target.value)
                }
                placeholder="Ward number"
                style={styles.filterInput}
              />
            </div>

  

            {/* Pincode Filter */}
            <div style={styles.filterItem}>
              <label style={styles.filterLabel}>
                📌 Pincode
              </label>
              <input
                type="text"
                value={filterPincode}
                onChange={(e) =>
                  setFilterPincode(
                    e.target.value
                  )
                }
                placeholder="6-digit pincode"
                style={styles.filterInput}
                maxLength={6}
              />
            </div>

            {/* Issue Type Filter */}
            <div style={styles.filterItem}>
              <label style={styles.filterLabel}>
                🏷️ Issue Type
              </label>
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value)
                }
                style={styles.filterSelect}
              >
                <option value="">
                  All Types
                </option>
                {ISSUE_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Action Buttons */}
          <div style={styles.actionRow}>
            <button
              style={styles.searchBtn}
              onClick={handleSearch}
            >
              <FaSearch /> &nbsp;Search Issues
            </button>
            <button
              style={styles.resetBtn}
              onClick={handleReset}
            >
              <FaTimes /> &nbsp;Reset Filters
            </button>
          </div>

        </div>

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          <span style={styles.statItem}>
            📋 Showing: {sortedIssues.length} issues
          </span>
          <span style={styles.statItem}>
            🗳️ Your votes: {votedIds.length}
          </span>
          <span style={styles.statItem}>
            🏙️ City: {filterCity || 'All Cities'}
          </span>
        </div>

        {/* Results */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p>Loading issues...</p>
          </div>
        ) : sortedIssues.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🔍</p>
            <h5 style={styles.emptyTitle}>
              No issues found
            </h5>
            <p style={styles.emptyText}>
              {searchKeyword
                ? `No issues found for "${searchKeyword}". Try different keywords.`
                : 'No public issues found in your area.'
              }
            </p>
            <Link
              to="/citizen/report-issue"
              style={styles.emptyBtn}
            >
              Be the First to Report!
            </Link>
          </div>
        ) : (
          <div style={styles.issuesGrid}>
            {sortedIssues.map((issue) => (
              <div
                key={issue.id}
                style={styles.issueCard}
              >
                {/* Image */}
                {issue.reportedImage && (
                  <div style={styles.cardImage}>
                    <img
                      src={`http://localhost:8080${issue.reportedImage}`}
                      alt={issue.title}
                      style={styles.cardImg}
                      onError={(e) => {
                        e.target
                          .parentElement
                          .style.display = 'none';
                      }}
                    />
                    {issue.emergency && (
                      <div style={
                        styles.emergencyOverlay
                      }>
                        🚨 Emergency
                      </div>
                    )}
                  </div>
                )}

                <div style={styles.cardBody}>
                  <div style={styles.badgeRow}>
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
                    <span style={styles.typeBadge}>
                      {issue.issueType}
                    </span>
                  </div>

                  <h6 style={styles.issueTitle}>
                    {issue.title}
                  </h6>
                  <p style={styles.location}>
                    📍 {issue.city},
                    Ward {issue.wardNumber}
                  </p>
                  <p style={styles.date}>
                    📅 {formatDate(
                      issue.reportedAt
                    )}
                  </p>
                  <p style={{
                    ...styles.urgency,
                    color:
                      issue.urgencyLevel === 'HIGH'
                        ? '#dc3545'
                      : issue.urgencyLevel ===
                        'MEDIUM'
                        ? '#fd7e14'
                      : '#198754',
                  }}>
                    ⚡ {issue.urgencyLevel}
                    Urgency
                  </p>

                  <div style={styles.voteRow}>
                    <div style={styles.voteCount}>
                      <FaThumbsUp
                        style={styles.voteIcon}
                      />
                      <span style={styles.voteNum}>
                        {issue.voteCount}
                      </span>
                      <span style={styles.voteLabel}>
                        votes
                      </span>
                    </div>
                    <button
                      style={{
                        ...styles.voteBtn,
                        ...(votedIds.includes(
                          issue.id
                        )
                          ? styles.votedBtn
                          : {}),
                      }}
                      onClick={() =>
                        handleVote(issue.id)
                      }
                      disabled={
                        votingId === issue.id ||
                        votedIds.includes(issue.id)
                      }
                    >
                      {votingId === issue.id
                        ? '⏳'
                        : votedIds.includes(
                            issue.id
                          )
                        ? '✅ Voted'
                        : '👍 Vote'
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
  searchFilterCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: '15px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f8f9fa',
    border: '1.5px solid #dee2e6',
    borderRadius: '10px',
    padding: '12px 15px',
  },
  searchIcon: {
    color: '#6c757d',
    flexShrink: 0,
    fontSize: '16px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '15px',
    fontFamily: 'inherit',
    color: '#333',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#adb5bd',
    fontSize: '14px',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
    border: '1px solid #dee2e6',
    zIndex: 100,
    overflow: 'hidden',
    marginTop: '4px',
  },
  suggestionTitle: {
    padding: '8px 15px',
    margin: 0,
    fontSize: '12px',
    color: '#adb5bd',
    fontWeight: '600',
    background: '#f8f9fa',
    borderBottom: '1px solid #f0f0f0',
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
    transition: 'background 0.15s ease',
  },
  suggestionIcon: {
    color: '#2c7be5',
    fontSize: '12px',
  },
  filtersRow: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '15px',
  },
  filterItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#555',
  },
  filterInput: {
    padding: '9px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fafafa',
  },
  filterSelect: {
    padding: '9px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fafafa',
    cursor: 'pointer',
  },
  actionRow: {
    display: 'flex',
    gap: '10px',
  },
  searchBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '600',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'white',
    color: '#6c757d',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
  },
  statsBar: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    background: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    flexWrap: 'wrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  statItem: {
    fontSize: '13px',
    color: '#6c757d',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    color: '#6c757d',
    background: 'white',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
  },
  spinner: {
    width: '35px',
    height: '35px',
    border: '3px solid #dee2e6',
    borderTop: '3px solid #2c7be5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  emptyIcon: {
    fontSize: '50px',
    margin: '0 0 15px',
  },
  emptyTitle: {
    color: '#333',
    fontWeight: '700',
    marginBottom: '10px',
  },
  emptyText: {
    color: '#6c757d',
    marginBottom: '20px',
    fontSize: '14px',
  },
  emptyBtn: {
    padding: '10px 25px',
    background: '#2c7be5',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  issuesGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  issueCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    transition: 'transform 0.2s ease',
  },
  cardImage: {
    height: '160px',
    overflow: 'hidden',
    position: 'relative',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  emergencyOverlay: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: '#dc3545',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
  },
  cardBody: {
    padding: '14px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  typeBadge: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    background: '#f0f7ff',
    color: '#2c7be5',
    border: '1px solid #bee3f8',
  },
  issueTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '6px',
    fontSize: '14px',
  },
  location: {
    color: '#6c757d',
    fontSize: '12px',
    margin: '3px 0',
  },
  date: {
    color: '#6c757d',
    fontSize: '12px',
    margin: '3px 0',
  },
  urgency: {
    fontSize: '12px',
    fontWeight: '600',
    margin: '6px 0',
  },
  voteRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f0f0f0',
  },
  voteCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  voteIcon: {
    color: '#2c7be5',
    fontSize: '14px',
  },
  voteNum: {
    fontWeight: '800',
    color: '#2c7be5',
    fontSize: '18px',
  },
  voteLabel: {
    color: '#6c757d',
    fontSize: '12px',
  },
  voteBtn: {
    padding: '7px 16px',
    background: '#2c7be5',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  votedBtn: {
    background: '#d1e7dd',
    color: '#0f5132',
    cursor: 'default',
  },
};

export default PublicIssues;