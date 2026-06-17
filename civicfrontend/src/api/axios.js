import axios from 'axios';

const API_URL = 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────
// REQUEST INTERCEPTOR
// Add JWT token to every request
// ─────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] =
        `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// ─────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If token expired or unauthorized
    if (error.response &&
      error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
// ─────────────────────────────────────────
// API FUNCTIONS — AUTH
// ─────────────────────────────────────────

export const authAPI = {

  // Register new user
  register: (formData) =>
    axiosInstance.post(
      '/api/auth/register',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    ),

  // Verify registration OTP
  verifyRegistrationOtp: (data) =>
    axiosInstance.post(
      '/api/auth/verify-registration-otp',
      data
    ),

  // Login
  login: (data) =>
    axiosInstance.post('/api/auth/login', data),

  // Verify login OTP
  verifyLoginOtp: (data) =>
    axiosInstance.post(
      '/api/auth/verify-login-otp',
      data
    ),

  // Resend OTP
  resendOtp: (email, purpose) =>
    axiosInstance.post(
      `/api/auth/resend-otp?email=${email}&purpose=${purpose}`
    ),

  // Check email exists
  checkEmail: (email) =>
    axiosInstance.get(
      `/api/auth/check-email?email=${email}`
    ),
};

// ─────────────────────────────────────────
// API FUNCTIONS — CITIZEN
// ─────────────────────────────────────────

export const citizenAPI = {

  // Get profile
  getProfile: () =>
    axiosInstance.get('/api/citizen/profile'),


  searchBeforeReport: (keyword, pincode, wardNumber) =>
    axiosInstance.get(
      '/api/citizen/search-before-report',
      { params: { keyword, pincode, wardNumber } }
    ),


    checkDuplicate: (data) =>
    axiosInstance.post(
      '/api/citizen/check-duplicate', data
    ),
  // Get dashboard stats
  getDashboardStats: () =>
    axiosInstance.get(
      '/api/citizen/dashboard-stats'
    ),

  // Report issue
  reportIssue: (formData) =>
    axiosInstance.post(
      '/api/citizen/report-issue',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    ),

  // Get my issues
  getMyIssues: () =>
    axiosInstance.get('/api/citizen/my-issues'),

  // Get issue by code
  getIssueByCode: (issueCode) =>
    axiosInstance.get(
      `/api/citizen/issue/${issueCode}`
    ),

  // Get public issues
  getPublicIssues: (city = '') =>
    axiosInstance.get(
      '/api/public/issues',
      { params: { city, pincode: '' } }
    ),
searchAdvanced: (params) =>
    axiosInstance.get(
      '/api/public/issues/search',
      { params }
    ),

  // Vote on issue
  voteOnIssue: (issueId) =>
    axiosInstance.post(
      `/api/citizen/vote/${issueId}`
    ),

  // Search issues
  searchIssues: (keyword, city) =>
    axiosInstance.get(
      `/api/citizen/search-issues?keyword=${keyword}${city
        ? `&city=${city}`
        : ''
      }`
    ),

  // Submit feedback
  submitFeedback: (data) =>
    axiosInstance.post(
      '/api/citizen/submit-feedback',
      data
    ),

  // Get voted issues
  getVotedIssues: () =>
    axiosInstance.get(
      '/api/citizen/voted-issues'
    ),
};

// ─────────────────────────────────────────
// API FUNCTIONS — ADMIN
// ─────────────────────────────────────────

export const adminAPI = {

  // Get dashboard stats
  getDashboardStats: () =>
    axiosInstance.get(
      '/api/admin/dashboard-stats'
    ),


    mergeIssues: (originalId, duplicateId) =>
    axiosInstance.post(
      '/api/admin/issues/merge',
      null,
      { params: { originalId, duplicateId } }
    ),
  // Get pending users
  getPendingUsers: () =>
    axiosInstance.get('/api/admin/pending-users'),

  // Get users by role
  getUsersByRole: (role) =>
    axiosInstance.get(
      `/api/admin/users?role=${role}`
    ),

  // Search users
  searchUsers: (role, keyword) =>
    axiosInstance.get(
      `/api/admin/users/search?role=${role}&keyword=${keyword}`
    ),

  // Approve user
  approveUser: (userId) =>
    axiosInstance.put(
      `/api/admin/users/${userId}/approve`
    ),

  // Reject user
  rejectUser: (userId) =>
    axiosInstance.put(
      `/api/admin/users/${userId}/reject`
    ),

  // Get all issues
  getAllIssues: () =>
    axiosInstance.get('/api/admin/issues'),

  // Get issues by status
  getIssuesByStatus: (status) =>
    axiosInstance.get(
      `/api/admin/issues/status/${status}`
    ),

  // Get overdue issues
  getOverdueIssues: () =>
    axiosInstance.get(
      '/api/admin/issues/overdue'
    ),

  // Filter issues
  filterIssues: (ward, pincode, department) =>
    axiosInstance.get(
      `/api/admin/issues/filter?ward=${ward || ''}&pincode=${pincode || ''}&department=${department || ''}`
    ),

  // Assign issue
  assignIssue: (issueId, data) =>
    axiosInstance.put(
      `/api/admin/issues/${issueId}/assign`,
      data
    ),

  // Get all authorities
  getAllAuthorities: () =>
    axiosInstance.get('/api/admin/authorities'),

  // Get authorities by department
  getAuthoritiesByDepartment: (department) =>
    axiosInstance.get(
      `/api/admin/authorities/department/${department}`
    ),

  // Get issue analytics
  getIssueAnalytics: () =>
    axiosInstance.get(
      '/api/admin/analytics/issues'
    ),

  // Get authority performance
  getAuthorityPerformance: () =>
    axiosInstance.get(
      '/api/admin/analytics/authority-performance'
    ),
};

// ─────────────────────────────────────────
// API FUNCTIONS — AUTHORITY
// ─────────────────────────────────────────

export const authorityAPI = {

  // Get profile
  getProfile: () =>
    axiosInstance.get('/api/authority/profile'),

  // Get dashboard stats
  getDashboardStats: () =>
    axiosInstance.get(
      '/api/authority/dashboard-stats'
    ),

  // Get assigned issues
  getAssignedIssues: () =>
    axiosInstance.get(
      '/api/authority/assigned-issues'
    ),

  // Get issues by status
  getIssuesByStatus: (status) =>
    axiosInstance.get(
      `/api/authority/issues/status/${status}`
    ),

  // Get issue details
  getIssueDetails: (issueId) =>
    axiosInstance.get(
      `/api/authority/issue/${issueId}`
    ),

  // Update issue status
  updateIssueStatus: (issueId, status) =>
    axiosInstance.put(
      `/api/authority/issue/${issueId}/status?status=${status}`
    ),

  // Upload after image
  uploadAfterImage: (issueId, formData) =>
    axiosInstance.post(
      `/api/authority/issue/${issueId}/after-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    ),

  // Get feedbacks
  getMyFeedbacks: () =>
    axiosInstance.get('/api/authority/feedbacks'),

  // Get performance
  getPerformance: () =>
    axiosInstance.get(
      '/api/authority/performance'
    ),
};

// ─────────────────────────────────────────
// API FUNCTIONS — PUBLIC
// ─────────────────────────────────────────

export const publicAPI = {

  // Get public issues
  getPublicIssues: (city, pincode) =>
    axiosInstance.get(
      `/api/public/issues?city=${city || ''}&pincode=${pincode || ''}`
    ),


    getDistricts: () =>
    axiosInstance.get('/api/public/districts'),

getTaluks: (districtId) =>
    axiosInstance.get(
      `/api/public/taluks/${districtId}`
    ),

  // Get public stats
  getPublicStats: () =>
    axiosInstance.get('/api/public/stats'),


  // Advanced search
searchAdvanced: (params) =>
    axiosInstance.get(
      '/api/public/issues/search',
      { params }
    ),

  // Search public issues
  searchPublicIssues: (keyword) =>
    axiosInstance.get(
      `/api/public/search?keyword=${keyword}`
    ),

  // Get top issues
  getTopIssues: (city) =>
    axiosInstance.get(
      `/api/public/top-issues${city
        ? `?city=${city}`
        : ''
      }`
    ),

  // Track issue by code
  trackIssue: (issueCode) =>
    axiosInstance.get(
      `/api/public/track/${issueCode}`
    ),
};

export default axiosInstance;

