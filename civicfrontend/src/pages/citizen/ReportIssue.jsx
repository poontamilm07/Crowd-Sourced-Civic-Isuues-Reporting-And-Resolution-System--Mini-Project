import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCity, FaPlus, FaList, FaSearch,
  FaGlobe, FaUser, FaSignOutAlt,
  FaUpload, FaExclamationTriangle,
  FaChartBar, FaMapMarkerAlt,
  FaThumbsUp, 
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { citizenAPI, publicAPI } from '../../api/axios';

const TAMIL_NADU_DISTRICTS = [
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
];

const TAMIL_NADU_TALUKS = {
  Chennai: ['Alandur','Ambattur','Aminjikarai','Ayanavaram','Egmore','Guindy','Kolathur','Madhavaram','Maduravoyal','Mambalam','Manali','Mylapore','Perambur','Purasawalkam','Sholinganallur','Thiruvottiyur','Tondiarpet','Velachery'],

  Coimbatore: ['Annur','Anaimalai','Coimbatore North','Coimbatore South','Kinathukadavu','Madukkarai','Mettupalayam','Perur','Pollachi','Sulur','Valparai'],

  Madurai: ['Madurai North','Madurai South','Peraiyur','Thirumangalam','Kallikudi','Sedapatti','T.Kallupatti','Chellampatti','Usilampatti','Vadipatti','Alanganallur','Melur','Madurai East'],

  Tiruchirappalli: ['Tiruchirappalli West','Tiruchirappalli East','Srirangam','Thiruverumbur','Lalgudi','Manachanallur','Manapparai','Marungapuri','Musiri','Thottiyam','Thuraiyur'],

  Salem: ['Attur','Edappadi','Gangavalli','Kadaiyampatti','Mettur','Omalur','Pethanaickenpalayam','Salem','Salem South','Salem West','Sankari','Vazhapadi','Yercaud'],

  Tirunelveli: ['Ambasamudram','Nanguneri','Palayamkottai','Radhapuram','Tirunelveli','Cheranmahadevi','Manur','Thisayanvilai'],

  Vellore: ['Gudiyatham','K V Kuppam','Katpadi','Pernambut'],

  Erode: ['Erode','Modakkurichi','Kodumudi','Perundurai','Bhavani','Anthiyur','Gobichettipalayam','Sathyamangalam','Thalavadi','Nambiyur'],

  Tiruppur: ['Avinashi','Dharapuram','Kangeyam','Madathukulam','Palladam','Tiruppur North','Tiruppur South','Udumalaipettai','Uthukuli'],

  Dindigul: ['Dindigul East','Dindigul West','Athoor','Nilakkottai','Natham','Palani','Oddanchatram','Vedasandur','Kodaikanal','Gujiliamparai'],

  Thanjavur: ['Thanjavur','Budalur','Thiruvaiyaru','Kumbakonam','Thiruvidaimarudur','Papanasam','Orathanadu','Pattukkottai','Peravurani'],

  Kancheepuram: ['Kanchipuram','Sriperumbudur','Uthiramerur','Walajabad','Kundrathur'],

  Cuddalore: ['Cuddalore','Chidambaram','Kattumannarkoil','Kurinjipadi','Panruti','Tittakudi','Virudhachalam','Bhuvanagiri','Mangalore','Parangipettai'],

  Villupuram: ['Villupuram','Vikravandi','Kandachipuram','Tiruvennainallur','Gingee','Melmalayanur','Vanur','Tindivanam','Marakkanam'],

  Nagapattinam: ['Nagapattinam','Kilvelur','Vedaranyam','Thirukuvalai','Sirkazhi','Tharangambadi','Kuttalam'],

  Pudukkottai: ['Pudukkottai','Aranthangi','Alangudi','Karambakudi','Thirumaya','Ponnamaravati','Gandharva Fort','Avaudaiyar Temple','Manamelkudi','Kulathur','Illupur','Viralimalai'],

  Ramanathapuram: ['Ramanathapuram','Rameswaram','Tiruvadanai','Keelakarai','Kadaladi','Kamuthi','Mudukulathur','Paramakudi','Rajasingamangalam'],

  Virudhunagar: ['Virudhunagar','Aruppukkottai','Rajapalayam','Sattur','Sivakasi','Srivilliputhur','Tiruchuli','Kariapatti','Vembakottai','Watrap'],

  Sivaganga: ['Sivagangai','Manamadurai','Ilayangudi','Thiruppuvanam','Kalaiyarkoil','Karaikkudi','Devakottai','Thiruppattur','Sigampunari'],

  Theni: ['Theni','Andipatti','Bodinayakanur','Periyakulam','Uthamapalayam'],

  Nilgiris: ['Ooty','Coonoor','Gudalur','Kotagiri','Kundah','Pandalur'],

  Krishnagiri: ['Krishnagiri','Bargur','Denkanikotta','Hosur','Pochampalli','Sulagiri','Thally','Uthangarai'],

  Dharmapuri: ['Dharmapuri','Harur','Palakkodu','Pappireddipatti','Pennagaram','Nallampalli','Karimangalam'],

  Namakkal: ['Namakkal','Rasipuram','Tiruchengode','Paramathi Velur','Kollimalai','Sendamangalam','Kumarapalayam','Mohanur'],

  Karur: ['Karur','Aravakurichi','Manmangalam','Pugalur','Kulithalai','Krishnarayapuram','Kadavur'],

  Perambalur: ['Perambalur','Alathur','Kunnam','Veppanthattai'],

  Ariyalur: ['Ariyalur','Andimadam','Jayankondam','Sendurai','Udayarpalayam'],

  Thoothukudi: ['Thoothukudi','Srivaikuntam','Tiruchendur','Sathankulam','Ottapidaram','Kovilpatti','Kayathar','Vilathikulam','Eral','Udangudi'],

  Kanyakumari: ['Agastheeswaram','Kalkulam','Killiyoor','Thovalai','Vilavancode','Thiruvattar'],

  Tiruvannamalai: ['Arani','Chengam','Tiruvannamalai','Polur','Thandrampet','Vandavasi','Kalasapakkam','Chetpet','Kilpennathur','Jamunamathur','Cheyyar','Vembakkam'],

  Tenkasi: ['Tenkasi','Kadayanallur','Shenkottai','Alangulam','Sankarankovil','Veerakeralampudur','Thiruvengadam','Sivagiri'],

  Mayiladuthurai: ['Mayiladuthurai','Kuthalam','Poompuhar','Sirkazhi','Tharangambadi'],

  Chengalpattu: ['Chengalpattu','Pallavaram','Cheyyur','Madurantakam','Tambaram','Thiruporur','Thirukazhukundram','Vandalur'],

  Ranipet: ['Arcot','Walajah','Kalavai','Sholinghur','Arakkonam','Nemili'],

  Tirupattur: ['Tirupattur','Ambur','Jolarpettai','Natrampalli','Vaniyambadi'],

  Kallakurichi: ['Kallakurichi','Chinnasalem','Ulundurpet','Thirunavalur','Sankarapuram','Kalrayan Hills','Thiyagadurgam']

};

const ReportIssue = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] =
    useState(false);
  const [imagePreview, setImagePreview] =
    useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] =
    useState('');

  // Duplicate detection states
  const [duplicateResult, setDuplicateResult] =
    useState(null);
  const [showDuplicateModal, setShowDuplicateModal] =
    useState(false);
  const [votingId, setVotingId] = useState(null);
  const [votedIds, setVotedIds] = useState([]);
  const [duplicateChecked, setDuplicateChecked] =
    useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issueType: '',
    customIssueType: '',
    urgencyLevel: 'LOW',
    emergency: false,
    address: '',
    city: user?.city || '',
    district: user?.district || '',
    taluk: user?.taluk || '',
    pincode: user?.pincode || '',
    landmark: '',
    wardNumber: user?.wardNumber || '',
    reportedDate: new Date()
      .toISOString().split('T')[0],
  });

  const issueTypes = [
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

  const menuItems = [
    { id: 'dashboard', icon: <FaChartBar />,
      label: 'Dashboard',
      path: '/citizen/dashboard' },
    { id: 'report', icon: <FaPlus />,
      label: 'Report Issue',
      path: '/citizen/report-issue' },
    { id: 'my-issues', icon: <FaList />,
      label: 'My Issues',
      path: '/citizen/my-issues' },
    { id: 'track', icon: <FaSearch />,
      label: 'Track Issue',
      path: '/citizen/track-issue' },
    { id: 'public', icon: <FaGlobe />,
      label: 'Public Issues',
      path: '/citizen/public-issues' },
    { id: 'profile', icon: <FaUser />,
      label: 'My Profile',
      path: '/citizen/profile' },
  ];

  useEffect(() => {
    publicAPI.getDistricts()
      .then((res) => {
        if (res.data.success) {
          setDistricts(res.data.data);
        }
      })
      .catch(() => {
        setDistricts(TAMIL_NADU_DISTRICTS);
      });
  }, []);

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const districtName = districts.find(
      (d) => String(d.id) === String(districtId)
    )?.name || '';
    setSelectedDistrictId(districtId);
    setTaluks([]);
    setFormData({
      ...formData,
      district: districtName,
      city: districtName,
      taluk: '',
    });
    // Reset duplicate check when location changes
    setDuplicateChecked(false);
    setDuplicateResult(null);

    if (districtId) {
      publicAPI.getTaluks(districtId)
        .then((res) => {
          if (res.data.success) {
            setTaluks(res.data.data);
          }
        })
        .catch(() => {
          const fallback =
            TAMIL_NADU_TALUKS[districtName] || [];
          setTaluks(fallback.map((t, i) => ({
            id: i + 1, name: t,
          })));
        });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Reset duplicate check when key fields change
    if (['title', 'description', 'issueType',
         'wardNumber', 'pincode'].includes(name)) {
      setDuplicateChecked(false);
      setDuplicateResult(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg',
      'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ─────────────────────────────────────────
  // DUPLICATE CHECK
  // ─────────────────────────────────────────
  const handleCheckDuplicate = async () => {
  if (!formData.title.trim()) {
    toast.error(
      'Please enter issue title first'
    );
    return;
  }
  if (!formData.issueType) {
    toast.error(
      'Please select issue type first'
    );
    return;
  }
  if (!formData.wardNumber.trim() &&
      !formData.pincode.trim()) {
    toast.error(
      'Please enter ward number or pincode'
    );
    return;
  }

  setCheckingDuplicate(true);
  setDuplicateResult(null);

  try {
    const res =
      await citizenAPI.checkDuplicate({
        title: formData.title,
        description: formData.description,
        issueType: formData.issueType,
        city: formData.city,
        district: formData.district,
        taluk: formData.taluk,
        wardNumber: formData.wardNumber,
        pincode: formData.pincode,
        address: formData.address,
      });

    if (res.data.success) {
      const data = res.data.data;
      setDuplicateResult(data);
      setDuplicateChecked(true);

      if (data.isDuplicate) {
        setShowDuplicateModal(true);
        toast.warning(
          `⚠️ Similar issue found (${
            Math.round(data.score)
          }% match). Please upvote instead!`
        );
      } else {
        toast.success(
          '✅ No duplicate found! You can submit.'
        );
      }
    }
  } catch (err) {
    console.error(
      'Duplicate check error:', err
    );
    setDuplicateChecked(true);
    setDuplicateResult({
      isDuplicate: false,
      score: 0,
    });
    toast.info(
      'Duplicate check skipped. You can submit.'
    );
  } finally {
    setCheckingDuplicate(false);
  }
};

  // ─────────────────────────────────────────
  // VOTE ON EXISTING ISSUE
  // ─────────────────────────────────────────
  const handleVoteExisting = async (issueId) => {
    if (votedIds.includes(issueId)) {
      toast.info('Already voted!');
      return;
    }
    setVotingId(issueId);
    try {
      const res =
        await citizenAPI.voteOnIssue(issueId);
      if (res.data.success) {
        toast.success(
          '✅ Vote recorded! +2 reward points 🏆'
        );
        setVotedIds([...votedIds, issueId]);
        // Update vote count in modal
        setDuplicateResult((prev) => ({
          ...prev,
          existingIssue: {
            ...prev.existingIssue,
            voteCount:
              (prev.existingIssue?.voteCount
               || 0) + 1,
          },
        }));
        setShowDuplicateModal(false);
        navigate('/citizen/public-issues');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to vote');
    } finally {
      setVotingId(null);
    }
  };

  const validate = () => {
    if (!formData.title.trim()) {
      toast.error('Issue title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!formData.issueType) {
      toast.error('Please select issue type');
      return false;
    }
    if (formData.issueType === 'Other Issue' &&
        !formData.customIssueType.trim()) {
      toast.error(
        'Please describe the issue type'
      );
      return false;
    }
    if (!formData.district) {
      toast.error('Please select a district');
      return false;
    }
    if (!formData.taluk.trim()) {
      toast.error('Please select a taluk');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return false;
    }
    if (!formData.pincode.trim()) {
      toast.error('Pincode is required');
      return false;
    }
    if (!formData.wardNumber.trim()) {
      toast.error('Ward number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  // BLOCK if duplicate found
  if (duplicateResult?.isDuplicate) {
    toast.error(
      '🚫 Cannot submit — duplicate issue exists! Please upvote the existing issue.'
    );
    setShowDuplicateModal(true);
    return;
  }

  // Force duplicate check
  if (!duplicateChecked) {
    toast.warning(
      '⚠️ Please check for duplicates first!'
    );
    await handleCheckDuplicate();
    return;
  }

  setLoading(true);
  try {
    const data = new FormData();
    const requestData = {
      title: formData.title,
      description: formData.description,
      issueType: formData.issueType,
      customIssueType:
        formData.customIssueType,
      urgencyLevel: formData.urgencyLevel,
      emergency: formData.emergency,
      address: formData.address,
      city: formData.city ||
        formData.district,
      district: formData.district,
      taluk: formData.taluk,
      pincode: formData.pincode,
      landmark: formData.landmark,
      wardNumber: formData.wardNumber,
      reportedDate: formData.reportedDate,
    };

    data.append(
      'data',
      new Blob(
        [JSON.stringify(requestData)],
        { type: 'application/json' }
      )
    );
    if (imageFile) {
      data.append('image', imageFile);
    }

    const res =
      await citizenAPI.reportIssue(data);
    if (res.data.success) {
      toast.success(
        `✅ Issue reported! ID: ${res.data.data.issueCode}`
      );
      navigate('/citizen/my-issues');
    } else {
      toast.error(res.data.message);
    }
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      'Failed to report issue.'
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
        day: '2-digit', month: 'short',
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
            <Link key={item.id} to={item.path}
              style={{
                ...styles.navItem,
                ...(item.id === 'report'
                  ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <button style={styles.logoutBtn}
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
            Report New Issue
          </h4>
          <p style={styles.pageSubtitle}>
            Fill in details and check for
            duplicates before submitting
          </p>
        </div>

        {/* Duplicate Check Status Banner */}
        {duplicateChecked && duplicateResult && (
          <div style={{
            ...styles.statusBanner,
            background:
              duplicateResult.isDuplicate
              ? '#fff5f5'
              : '#f0fff4',
            border: `1px solid ${
              duplicateResult.isDuplicate
              ? '#fc8181' : '#68d391'
            }`,
          }}>
            {duplicateResult.isDuplicate ? (
              <span style={{
                color: '#c53030',
                fontWeight: '600',
                fontSize: '14px',
              }}>
                ⚠️ Similar issue found (
                {Math.round(
                  duplicateResult.score
                )}% match).
                Please upvote instead of
                creating a new issue.
                <button
                  style={styles.viewDupBtn}
                  onClick={() =>
                    setShowDuplicateModal(true)
                  }
                >
                  View Existing Issue
                </button>
              </span>
            ) : (
              <span style={{
                color: '#276749',
                fontWeight: '600',
                fontSize: '14px',
              }}>
                ✅ No duplicate found.
                You can submit this issue.
              </span>
            )}
          </div>
        )}

        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>

            {/* Emergency */}
            <div style={styles.emergencyBox}>
              <label style={styles.emergencyLabel}>
                <input
                  type="checkbox"
                  name="emergency"
                  checked={formData.emergency}
                  onChange={handleChange}
                  style={styles.checkbox}
                />
                <FaExclamationTriangle
                  style={styles.emergencyIcon}
                />
                <div>
                  <strong style={
                    styles.emergencyTitle
                  }>
                    🚨 Mark as Emergency
                  </strong>
                  <p style={styles.emergencyDesc}>
                    Open manholes, Electric
                    danger, Chemical leaks,
                    Flooding
                  </p>
                </div>
              </label>
            </div>

            {/* Issue Details */}
            <div style={styles.sectionDivider}>
              📋 Issue Details
            </div>

            <div style={styles.twoCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Issue Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief title of the issue"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Issue Type *
                </label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">
                    Select Issue Type
                  </option>
                  {issueTypes.map((type) => (
                    <option
                      key={type} value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.issueType ===
              'Other Issue' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Describe Issue Type *
                </label>
                <input
                  type="text"
                  name="customIssueType"
                  value={formData.customIssueType}
                  onChange={handleChange}
                  placeholder="Describe the type"
                  style={styles.input}
                />
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                style={styles.textarea}
                rows={4}
                required
              />
            </div>

            <div style={styles.threeCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Urgency Level *
                </label>
                <select
                  name="urgencyLevel"
                  value={formData.urgencyLevel}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="LOW">
                    🟢 Low
                  </option>
                  <option value="MEDIUM">
                    🟡 Medium
                  </option>
                  <option value="HIGH">
                    🔴 High
                  </option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Ward Number *
                </label>
                <input
                  type="text"
                  name="wardNumber"
                  value={formData.wardNumber}
                  onChange={handleChange}
                  placeholder="Ward number"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Reported Date *
                </label>
                <input
                  type="date"
                  name="reportedDate"
                  value={formData.reportedDate}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div style={styles.sectionDivider}>
              📍 Location Details
            </div>

            <div style={styles.twoCol}>

              {/* District */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  District *
                </label>
                <div style={styles.selectWrapper}>
                  <FaMapMarkerAlt
                    style={styles.selectIcon}
                  />
                  <select
                    value={selectedDistrictId}
                    onChange={handleDistrictChange}
                    style={styles.selectInput}
                    required
                  >
                    <option value="">
                      Select District
                    </option>
                    {districts.map((d) => (
                      <option
                        key={d.id} value={d.id}
                      >
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Taluk */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Taluk *
                </label>
                <div style={styles.selectWrapper}>
                  <FaMapMarkerAlt
                    style={styles.selectIcon}
                  />
                  <select
                    name="taluk"
                    value={formData.taluk}
                    onChange={handleChange}
                    style={{
                      ...styles.selectInput,
                      color: taluks.length === 0
                        ? '#adb5bd' : '#333',
                    }}
                    required
                    disabled={taluks.length === 0}
                  >
                    <option value="">
                      {taluks.length === 0
                        ? 'Select District first'
                        : 'Select Taluk'
                      }
                    </option>
                    {taluks.map((t) => (
                      <option
                        key={t.id} value={t.name}
                      >
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  style={styles.input}
                  required
                />
              </div>

              {/* City */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Auto-filled"
                  style={{
                    ...styles.input,
                    background: formData.city
                      ? '#f0f7ff' : '#fafafa',
                  }}
                />
              </div>

              {/* Pincode */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  style={styles.input}
                  maxLength={6}
                  required
                />
              </div>

              {/* Landmark */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Nearby landmark"
                  style={styles.input}
                />
              </div>

            </div>

            {/* Image */}
            <div style={styles.sectionDivider}>
              📸 Issue Photo (Before Image)
            </div>

            <div style={styles.uploadArea}
              onClick={() =>
                document.getElementById(
                  'issueImage'
                ).click()
              }
            >
              {imagePreview ? (
                <div style={styles.imagePreviewBox}>
                  <img src={imagePreview}
                    alt="Issue"
                    style={styles.previewImg}
                  />
                  <div style={styles.imageOverlay}>
                    <p style={styles.changeText}>
                      Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <div style={
                  styles.uploadPlaceholder
                }>
                  <FaUpload
                    style={styles.uploadIcon}
                  />
                  <p style={styles.uploadTitle}>
                    Upload Issue Photo
                  </p>
                  <p style={styles.uploadHint}>
                    JPG, PNG, WEBP (Max 10MB)
                  </p>
                </div>
              )}
              <input
                id="issueImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Action Buttons */}
            {/* Action Buttons */}
<div style={styles.submitRow}>

  <button
    type="button"
    style={styles.cancelBtn}
    onClick={() =>
      navigate('/citizen/dashboard')
    }
  >
    Cancel
  </button>

  {/* Check Duplicate Button */}
  <button
    type="button"
    style={{
      ...styles.checkDupBtn,
      ...(duplicateChecked &&
        !duplicateResult?.isDuplicate
        ? styles.checkDupBtnSuccess
        : {}),
      ...(duplicateResult?.isDuplicate
        ? styles.checkDupBtnDanger
        : {}),
    }}
    onClick={handleCheckDuplicate}
    disabled={checkingDuplicate}
  >
    {checkingDuplicate
      ? '🔍 Checking...'
      : duplicateResult?.isDuplicate
      ? `⚠️ Duplicate Found (${
          Math.round(duplicateResult.score)
        }%)`
      : duplicateChecked
      ? '✅ No Duplicate Found'
      : '🔍 Check Duplicate'
    }
  </button>

  {/* Submit Button */}
  <button
    type="submit"
    style={{
      ...styles.submitBtn,
      opacity:
        duplicateResult?.isDuplicate
        ? 0.4 : 1,
      cursor:
        duplicateResult?.isDuplicate
        ? 'not-allowed' : 'pointer',
    }}
    disabled={
      loading ||
      duplicateResult?.isDuplicate === true
    }
    title={
      duplicateResult?.isDuplicate
      ? 'Cannot submit — duplicate exists. Please upvote the existing issue.'
      : 'Submit your issue report'
    }
  >
    {loading
      ? '⏳ Submitting...'
      : duplicateResult?.isDuplicate
      ? '🚫 Submission Blocked'
      : '🚀 Submit Report'
    }
  </button>

</div>

          </form>
        </div>
      </div>

      {/* ─────────────────────────────────── */}
      {/* DUPLICATE FOUND MODAL              */}
      {/* ─────────────────────────────────── */}
      {showDuplicateModal && duplicateResult && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>

            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div>
                <h5 style={styles.modalTitle}>
                  ⚠️ Similar Issue Already Reported
                </h5>
                <p style={styles.modalSubtitle}>
                  We found a{' '}
                  <strong style={{
                    color: '#e53e3e',
                  }}>
                    {Math.round(
                      duplicateResult.score
                    )}% match
                  </strong>
                  {' '}in your area
                </p>
              </div>
              <button
                style={styles.closeBtn}
                onClick={() =>
                  setShowDuplicateModal(false)
                }
              >
                <FaTimes />
              </button>
            </div>

            {/* Similarity Score Bar */}
            <div style={styles.scoreSection}>
              <div style={styles.scoreBar}>
                <div style={{
                  ...styles.scoreFill,
                  width: `${Math.min(
                    duplicateResult.score, 100
                  )}%`,
                  background:
                    duplicateResult.score >= 90
                    ? '#e53e3e'
                    : duplicateResult.score >= 75
                    ? '#dd6b20'
                    : '#d69e2e',
                }} />
              </div>
              <span style={styles.scoreLabel}>
                {Math.round(duplicateResult.score)}%
                Similarity
              </span>
            </div>

            {/* Existing Issue Details */}
            {duplicateResult.existingIssue && (
              <div style={styles.existingIssue}>

                {/* Issue Image */}
                {duplicateResult.existingIssue
                  .reportedImage && (
                  <img
                    src={`http://localhost:8080${duplicateResult.existingIssue.reportedImage}`}
                    alt="Existing issue"
                    style={styles.existingImg}
                    onError={(e) => {
                      e.target.style.display =
                        'none';
                    }}
                  />
                )}

                <div style={styles.issueInfo}>
                  <div style={styles.issueHeader}>
                    <span style={styles.issueCode}>
                      {duplicateResult
                        .existingIssue.issueCode}
                    </span>
                    <span style={{
                      ...styles.statusBadge,
                      background: getStatusColor(
                        duplicateResult
                          .existingIssue.status
                      ),
                    }}>
                      {getStatusLabel(
                        duplicateResult
                          .existingIssue.status
                      )}
                    </span>
                  </div>

                  <h6 style={styles.issueTitle}>
                    {duplicateResult
                      .existingIssue.title}
                  </h6>

                  <p style={styles.issueDesc}>
                    {duplicateResult
                      .existingIssue
                      .description?.substring(
                        0, 150
                      )}
                    {duplicateResult
                      .existingIssue
                      .description?.length > 150
                      ? '...' : ''
                    }
                  </p>

                  <div style={styles.issueMeta}>
                    <span>
                      📍 {duplicateResult
                        .existingIssue.city},
                      Ward {duplicateResult
                        .existingIssue.wardNumber}
                    </span>
                    <span>
                      🏷️ {duplicateResult
                        .existingIssue.issueType}
                    </span>
                    <span>
                      📅 {formatDate(
                        duplicateResult
                          .existingIssue.reportedAt
                      )}
                    </span>
                  </div>

                  <div style={styles.voteDisplay}>
                    <FaThumbsUp
                      style={styles.voteIcon}
                    />
                    <span style={styles.voteNum}>
                      {duplicateResult
                        .existingIssue.voteCount}
                    </span>
                    <span style={styles.voteText}>
                      people have voted for this
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.modalActions}>

              <button
                style={styles.upvoteBtn}
                onClick={() =>
                  handleVoteExisting(
                    duplicateResult
                      .existingIssue?.id
                  )
                }
                disabled={
                  votingId ===
                  duplicateResult.existingIssue?.id
                  || votedIds.includes(
                    duplicateResult
                      .existingIssue?.id
                  )
                }
              >
                {votingId ===
                  duplicateResult
                    .existingIssue?.id
                  ? '⏳ Voting...'
                  : votedIds.includes(
                    duplicateResult
                      .existingIssue?.id
                  )
                  ? '✅ Voted!'
                  : '👍 Upvote This Issue'
                }
              </button>

              <button
                style={styles.submitAnywayBtn}
                onClick={() => {
                  setShowDuplicateModal(false);
                  setDuplicateResult({
                    isDuplicate: false,
                    score: 0,
                  });
                  setDuplicateChecked(true);
                }}
              >
                📝 Submit as New Issue Anyway
              </button>

              <button
                style={styles.cancelModalBtn}
                onClick={() =>
                  setShowDuplicateModal(false)
                }
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}

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
    top: 0, left: 0,
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
  brandIcon: { fontSize: '24px', color: '#2c7be5' },
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
    width: '40px', height: '40px',
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
    margin: 0, fontWeight: '600',
    fontSize: '14px', color: 'white',
  },
  userRole: {
    margin: 0, fontSize: '11px',
    color: 'rgba(255,255,255,0.6)',
  },
  nav: { padding: '10px', flex: 1 },
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
    fontSize: '16px', width: '20px',
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
  header: { marginBottom: '20px' },
  pageTitle: {
    margin: '0 0 5px',
    color: '#1a1a2e',
    fontWeight: '700',
    fontSize: '22px',
  },
  pageSubtitle: {
    margin: 0, color: '#6c757d', fontSize: '14px',
  },
  statusBanner: {
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewDupBtn: {
    marginLeft: '12px',
    padding: '5px 12px',
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'inherit',
  },

  checkDupBtnDanger: {
  background: '#fff5f5',
  border: '1.5px solid #fc8181',
  color: '#c53030',
},
  formCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.06)',
  },
  emergencyBox: {
    background: '#fff5f5',
    border: '2px solid #fc8181',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
  },
  emergencyLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px', height: '18px',
    marginTop: '3px', cursor: 'pointer',
    flexShrink: 0,
  },
  emergencyIcon: {
    fontSize: '22px', color: '#dc3545',
    marginTop: '2px', flexShrink: 0,
  },
  emergencyTitle: {
    color: '#dc3545', fontSize: '14px',
    display: 'block', marginBottom: '3px',
  },
  emergencyDesc: {
    color: '#666', fontSize: '12px', margin: 0,
  },
  sectionDivider: {
    background: '#f0f7ff',
    color: '#2c7be5',
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '15px',
    border: '1px solid #bee3f8',
    borderLeft: '3px solid #2c7be5',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  threeCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '15px',
  },
  inputGroup: { marginBottom: '15px' },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fafafa',
    boxSizing: 'border-box',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectIcon: {
    position: 'absolute',
    left: '12px',
    color: '#adb5bd',
    fontSize: '13px',
    zIndex: 1,
    pointerEvents: 'none',
  },
  selectInput: {
    width: '100%',
    padding: '10px 12px 10px 36px',
    border: '1.5px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fafafa',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'none',
    color: '#333',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    background: '#fafafa',
    boxSizing: 'border-box',
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
    marginBottom: '20px',
    position: 'relative',
    background: '#fafafa',
  },
  uploadPlaceholder: {
    textAlign: 'center', color: '#adb5bd',
  },
  uploadIcon: {
    fontSize: '30px', marginBottom: '8px',
    display: 'block', margin: '0 auto 8px',
  },
  uploadTitle: {
    fontWeight: '600', color: '#6c757d',
    margin: '0 0 4px', fontSize: '14px',
  },
  uploadHint: {
    fontSize: '12px', color: '#adb5bd',
    margin: '2px 0',
  },
  imagePreviewBox: {
    width: '100%', height: '100%',
    position: 'relative',
  },
  previewImg: {
    width: '100%', height: '100%',
    objectFit: 'cover',
  },
  imageOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: {
    color: 'white', fontWeight: '600',
    fontSize: '14px',
  },
  submitRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  cancelBtn: {
    padding: '11px 20px',
    background: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    color: '#6c757d',
    fontWeight: '600',
  },
  checkDupBtn: {
    padding: '11px 20px',
    background: '#fff3cd',
    border: '1.5px solid #ffc107',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    color: '#856404',
    fontWeight: '600',
  },
  checkDupBtnSuccess: {
    background: '#d1e7dd',
    border: '1.5px solid #198754',
    color: '#0f5132',
  },
  submitBtn: {
    padding: '11px 25px',
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
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
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
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 20px 15px',
    borderBottom: '1px solid #f0f0f0',
    background: '#fff5f5',
    borderRadius: '16px 16px 0 0',
  },
  modalTitle: {
    margin: '0 0 4px',
    fontWeight: '700',
    color: '#c53030',
    fontSize: '17px',
  },
  modalSubtitle: {
    margin: 0,
    color: '#666',
    fontSize: '13px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#6c757d',
    padding: '4px',
  },
  scoreSection: {
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  scoreBar: {
    flex: 1,
    height: '10px',
    background: '#f0f0f0',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease',
  },
  scoreLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#e53e3e',
    flexShrink: 0,
  },
  existingIssue: {
    margin: '0 20px 15px',
    border: '1px solid #dee2e6',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  existingImg: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
  },
  issueInfo: { padding: '14px' },
  issueHeader: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '8px',
  },
  issueCode: {
    color: '#2c7be5',
    fontWeight: '700',
    fontSize: '13px',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
  },
  issueTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '14px',
    marginBottom: '6px',
  },
  issueDesc: {
    color: '#6c757d',
    fontSize: '13px',
    lineHeight: '1.5',
    marginBottom: '10px',
  },
  issueMeta: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '10px',
  },
  voteDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f0f7ff',
    padding: '8px 12px',
    borderRadius: '8px',
  },
  voteIcon: { color: '#2c7be5', fontSize: '14px' },
  voteNum: {
    fontWeight: '800',
    color: '#2c7be5',
    fontSize: '18px',
  },
  voteText: { color: '#6c757d', fontSize: '12px' },
  modalActions: {
    padding: '15px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  upvoteBtn: {
    padding: '13px',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: '700',
  },
  submitAnywayBtn: {
    padding: '11px',
    background: 'white',
    border: '1.5px solid #fd7e14',
    color: '#fd7e14',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '600',
  },
  cancelModalBtn: {
    padding: '11px',
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    color: '#6c757d',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
  },
};

export default ReportIssue;