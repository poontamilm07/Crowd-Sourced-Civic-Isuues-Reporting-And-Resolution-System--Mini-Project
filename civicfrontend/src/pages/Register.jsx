import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCity, FaUser, FaEnvelope,
  FaLock, FaMapMarkerAlt,
  FaEye, FaEyeSlash, FaUpload,
  FaCalendarAlt,
} from 'react-icons/fa';
import { authAPI, publicAPI } from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);
  const [idCardPreview, setIdCardPreview] =
    useState(null);
  const [idCardFile, setIdCardFile] =
    useState(null);
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] =
    useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CITIZEN',
    city: '',
    district: '',
    villageOrArea: '',
    taluk: '',
    wardNumber: '',
    pincode: '',
    address: '',
    dateOfBirth: '',
    department: '',
    contactNumber: '',
  });

  const departments = [
    'Roads Department',
    'Water Supply Department',
    'Electricity Department',
    'Sanitation Department',
    'Parks and Gardens Department',
    'Drainage Department',
    'Public Works Department',
    'Health Department',
    'Fire Department',
    'Other Department',
  ];

  // Load districts on mount
  useEffect(() => {
    publicAPI.getDistricts()
      .then((res) => {
        if (res.data.success) {
          setDistricts(res.data.data);
        }
      })
      .catch(() => {
        // If API fails use hardcoded list
        setDistricts(TAMIL_NADU_DISTRICTS);
      });
  }, []);

  // Load taluks when district changes
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const districtName = districts.find(
      (d) => String(d.id) === String(districtId)
    )?.name || '';

    setSelectedDistrictId(districtId);
    setFormData({
      ...formData,
      district: districtName,
      city: districtName,
      taluk: '',
    });
    setTaluks([]);

    if (districtId) {
      publicAPI.getTaluks(districtId)
        .then((res) => {
          if (res.data.success) {
            setTaluks(res.data.data);
          }
        })
        .catch(() => {
          // Fallback to hardcoded taluks
          const fallback =
            TAMIL_NADU_TALUKS[districtName] || [];
          setTaluks(
            fallback.map((t, i) => ({
              id: i + 1,
              name: t,
            }))
          );
        });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleIdCardUpload = (e) => {
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
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        'File size must be under 5MB'
      );
      return;
    }
    setIdCardFile(file);
    setIdCardPreview(URL.createObjectURL(file));
  };

  const maxDOB = new Date(
    new Date().setFullYear(
      new Date().getFullYear() - 18
    )
  ).toISOString().split('T')[0];

  const validate = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Invalid email format');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error(
        'Password must be at least 6 characters'
      );
      return false;
    }
    if (formData.password !==
        formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!idCardFile) {
      toast.error(
        'Please upload your ID card'
      );
      return false;
    }
    if (!formData.dateOfBirth) {
      toast.error('Date of Birth is required');
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
    if (!formData.villageOrArea.trim()) {
      toast.error(
        'Village or Area is required'
      );
      return false;
    }
    if (!formData.wardNumber.trim()) {
      toast.error('Ward number is required');
      return false;
    }
    if (!formData.pincode.trim()) {
      toast.error('Pincode is required');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return false;
    }
    if (
      formData.role === 'AUTHORITY' &&
      !formData.department
    ) {
      toast.error(
        'Department is required for Authority'
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = new FormData();
      const requestData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        city: formData.city ||
          formData.district,
        district: formData.district,
        villageOrArea: formData.villageOrArea,
        taluk: formData.taluk,
        wardNumber: formData.wardNumber,
        pincode: formData.pincode,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        department: formData.department,
        contactNumber: formData.contactNumber,
      };

      data.append(
        'data',
        new Blob(
          [JSON.stringify(requestData)],
          { type: 'application/json' }
        )
      );
      data.append('idCardPhoto', idCardFile);

      const res = await authAPI.register(data);
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/verify-otp', {
          state: {
            email: formData.email,
            purpose: 'REGISTRATION',
          },
        });
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Registration failed. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.brand}>
            <FaCity style={styles.brandIcon} />
            <span style={styles.brandName}>
              CivicFix
            </span>
          </div>
          <h2 style={styles.leftTitle}>
            Join CivicFix Today
          </h2>
          <p style={styles.leftSubtitle}>
            Report civic issues in your area
            and help make your community better.
          </p>
          <div style={styles.features}>
            {[
              '✅ Report issues with photo evidence',
              '✅ Track real-time progress',
              '✅ Vote on community issues',
              '✅ Get email notifications',
              '✅ Earn reward points',
              '✅ Rate authority performance',
            ].map((f, i) => (
              <p key={i} style={styles.feature}>
                {f}
              </p>
            ))}
          </div>
          <p style={styles.loginPrompt}>
            Already have an account?{' '}
            <Link to="/login"
              style={styles.loginLink}>
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>
            Create Account
          </h3>
          <p style={styles.formSubtitle}>
            Fill in all details to register
          </p>

          <form onSubmit={handleSubmit}>

            {/* Role Selector */}
            <div style={styles.roleSelector}>
              {['CITIZEN', 'AUTHORITY'].map(
                (role) => (
                  <button
                    key={role}
                    type="button"
                    style={{
                      ...styles.roleBtn,
                      ...(formData.role === role
                        ? styles.roleBtnActive
                        : {}),
                    }}
                    onClick={() =>
                      setFormData({
                        ...formData, role,
                      })
                    }
                  >
                    {role === 'CITIZEN'
                      ? '👤 Citizen'
                      : '👷 Authority'
                    }
                  </button>
                )
              )}
            </div>

            {/* Section: Personal Info */}
            <div style={styles.sectionTitle}>
              👤 Personal Information
            </div>

            {/* Full Name */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Full Name *
              </label>
              <div style={styles.inputWrapper}>
                <FaUser style={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Email + DOB */}
            <div style={styles.twoCol}>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Email Address *
                </label>
                <div style={styles.inputWrapper}>
                  <FaEnvelope
                    style={styles.inputIcon}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Date of Birth *
                </label>
                <div style={styles.inputWrapper}>
                  <FaCalendarAlt
                    style={styles.inputIcon}
                  />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    style={styles.input}
                    max={maxDOB}
                    required
                  />
                </div>
              </div>

            </div>

            {/* Password Row */}
            <div style={styles.twoCol}>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Password *
                </label>
                <div style={styles.inputWrapper}>
                  <FaLock
                    style={styles.inputIcon}
                  />
                  <input
                    type={showPassword
                      ? 'text' : 'password'
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    style={styles.input}
                    required
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword
                      ? <FaEyeSlash />
                      : <FaEye />
                    }
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Confirm Password *
                </label>
                <div style={styles.inputWrapper}>
                  <FaLock
                    style={styles.inputIcon}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

            </div>

            {/* ID Card Upload */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                ID Card Photo *
              </label>
              <div
                style={styles.uploadArea}
                onClick={() =>
                  document.getElementById(
                    'idCard'
                  ).click()
                }
              >
                {idCardPreview ? (
                  <img
                    src={idCardPreview}
                    alt="ID Card"
                    style={styles.idPreview}
                  />
                ) : (
                  <div style={
                    styles.uploadPlaceholder
                  }>
                    <FaUpload
                      style={styles.uploadIcon}
                    />
                    <p style={styles.uploadText}>
                      Click to upload ID Card
                    </p>
                    <p style={styles.uploadHint}>
                      JPG, PNG, WEBP (Max 5MB)
                    </p>
                  </div>
                )}
                <input
                  id="idCard"
                  type="file"
                  accept="image/*"
                  onChange={handleIdCardUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Section: Location Info */}
            <div style={styles.sectionTitle}>
              📍 Location Information
            </div>

            {/* District + Taluk Dropdowns */}
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
                        key={d.id}
                        value={d.id}
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
                        key={t.id}
                        value={t.name}
                      >
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Village + Ward */}
            <div style={styles.twoCol}>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Village / Area *
                </label>
                <div style={styles.inputWrapper}>
                  <FaMapMarkerAlt
                    style={styles.inputIcon}
                  />
                  <input
                    type="text"
                    name="villageOrArea"
                    value={formData.villageOrArea}
                    onChange={handleChange}
                    placeholder="Village or area"
                    style={styles.input}
                    required
                  />
                </div>
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
                  style={styles.inputFull}
                  required
                />
              </div>

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
                style={styles.inputFull}
                maxLength={6}
                required
              />
            </div>

            {/* Address */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Full Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                style={styles.textarea}
                rows={2}
                required
              />
            </div>

            {/* Authority Fields */}
            {formData.role === 'AUTHORITY' && (
              <>
                <div style={styles.sectionTitle}>
                  🏢 Authority Information
                </div>

                <div style={styles.twoCol}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      style={styles.inputFull}
                      required
                    >
                      <option value="">
                        Select Department
                      </option>
                      {departments.map((dept) => (
                        <option
                          key={dept}
                          value={dept}
                        >
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Official contact number"
                      style={styles.inputFull}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading
                ? '⏳ Registering...'
                : '🚀 Create Account'
              }
            </button>

            <p style={styles.loginText}>
              Already have an account?{' '}
              <Link to="/login"
                style={styles.link}>
                Login
              </Link>
            </p>

          </form>
        </div>
      </div>

    </div>
  );
};

// ─────────────────────────────────────────
// FALLBACK DATA (if API fails)
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8f9fa',
  },
  leftPanel: {
    flex: '0 0 420px',
    background:
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 40px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  leftContent: {
    color: 'white',
    width: '100%',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '30px',
  },
  brandIcon: {
    fontSize: '32px',
    color: '#2c7be5',
  },
  brandName: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#2c7be5',
  },
  leftTitle: {
    fontSize: '26px',
    fontWeight: '700',
    marginBottom: '12px',
    lineHeight: '1.3',
    color: 'white',
  },
  leftSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '14px',
    lineHeight: '1.8',
    marginBottom: '25px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '30px',
  },
  feature: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '13px',
    margin: 0,
    background: 'rgba(255,255,255,0.07)',
    padding: '9px 13px',
    borderRadius: '8px',
  },
  loginPrompt: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '14px',
  },
  loginLink: {
    color: '#2c7be5',
    textDecoration: 'none',
    fontWeight: '700',
  },
  rightPanel: {
    flex: 1,
    overflowY: 'auto',
    padding: '40px 50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    background: '#f0f4f8',
  },
  formContainer: {
    width: '100%',
    maxWidth: '680px',
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow:
      '0 8px 40px rgba(0,0,0,0.10)',
    height: 'fit-content',
    marginBottom: '40px',
  },
  formTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: '5px',
  },
  formSubtitle: {
    color: '#6c757d',
    fontSize: '14px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#2c7be5',
    background: '#f0f7ff',
    padding: '8px 12px',
    borderRadius: '8px',
    marginBottom: '15px',
    marginTop: '5px',
    borderLeft: '3px solid #2c7be5',
  },
  roleSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  roleBtn: {
    flex: 1,
    padding: '10px',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  roleBtnActive: {
    border: '2px solid #2c7be5',
    background: '#f0f7ff',
    color: '#2c7be5',
  },
  inputGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#adb5bd',
    fontSize: '13px',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 36px',
    border: '1.5px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fafafa',
    boxSizing: 'border-box',
  },
  inputFull: {
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
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#adb5bd',
    fontSize: '16px',
    padding: 0,
    zIndex: 1,
  },
  uploadArea: {
    border: '2px dashed #dee2e6',
    borderRadius: '10px',
    height: '110px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    background: '#fafafa',
  },
  uploadPlaceholder: {
    textAlign: 'center',
    color: '#adb5bd',
  },
  uploadIcon: {
    fontSize: '26px',
    marginBottom: '6px',
    display: 'block',
    margin: '0 auto 6px',
  },
  uploadText: {
    margin: '0 0 3px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6c757d',
  },
  uploadHint: {
    margin: 0,
    fontSize: '11px',
    color: '#adb5bd',
  },
  idPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
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
  submitBtn: {
    width: '100%',
    padding: '13px',
    background:
      'linear-gradient(135deg, #2c7be5, #1a68d1)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    fontFamily: 'inherit',
  },
  loginText: {
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '14px',
    color: '#6c757d',
  },
  link: {
    color: '#2c7be5',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default Register;