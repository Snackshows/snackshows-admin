

import { apiCall, apiCallFormData } from './apiConfig';

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  // GET /dashboard/info - Get Dashboard Statistics
  getDashboardInfo: () => apiCall('/dashboard/info', 'GET'),
};

// ==================== AUTHENTICATION API ====================
export const authAPI = {
  // POST /dashboard/auth/login - Employee Login
  login: (credentials) => apiCall('/dashboard/auth/login', 'POST', credentials),
  
  // POST /dashboard/auth/forget-password - Forget Password
  forgetPassword: (data) => apiCall('/dashboard/auth/forget-password', 'POST', data),
  
  // POST /dashboard/auth/reset-password - Reset Password
  resetPassword: (data) => apiCall('/dashboard/auth/reset-password', 'POST', data),
};

// ==================== PROFILE API ====================

export const profileAPI = {
  // GET /dashboard/profile - Get Profile Data
  getProfile: () => apiCall('/dashboard/profile', 'GET'),
  
  // PUT /dashboard/profile - Update Profile Data
  updateProfile: (data) => apiCall('/dashboard/profile', 'PUT', data),
  
  // PATCH /dashboard/profile/change-password - Change Password
  changePassword: (data) => apiCall('/dashboard/profile/change-password', 'PATCH', data),

  uploadProfilePicture: (formData) => apiCallFormData('/dashboard/profile/picture', 'PATCH', formData),
  
  // POST /dashboard/profile/picture/presign - Get Profile Picture Upload URL
  getProfilePictureUploadUrl: (data) => apiCall('/dashboard/profile/picture/presign', 'POST', data),
  
  // PATCH /dashboard/profile/picture - Save Profile Picture
  saveProfilePicture: (data) => apiCall('/dashboard/profile/picture', 'PATCH', data),
};

// ==================== EMPLOYEE API ====================
export const employeeAPI = {
  // POST /dashboard/employee/create - Create New Employee
  createEmployee: (data) => apiCall('/dashboard/employee/create', 'POST', data),
  
  // GET /dashboard/employee - Get All Employees
  getAllEmployees: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/dashboard/employee${queryString}`, 'GET');
  },
  
  getEmployeeDetails: (employeeId) => apiCall(`/dashboard/employee/${employeeId}`, 'GET'),

  // PUT /dashboard/employee - Edit Employee Details
  updateEmployee: (data) => apiCall('/dashboard/employee', 'PUT', data),
  
  // DELETE /dashboard/employee - Remove Employee
  deleteEmployee: (employeeId) => apiCall(`/dashboard/employee/${employeeId}`, 'DELETE'),
  
  // PATCH /dashboard/employee/permission - Change Permission
  changePermission: (data) => apiCall('/dashboard/employee/permission', 'PATCH', data),
};



// ==================== USERS API ====================
export const usersAPI = {
  // GET /dashboard/users - Get All Users
  getAllUsers: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/dashboard/users${queryString}`, 'GET');
  },
  
  // GET /dashboard/users/:id - Get User Profile
  getUserProfile: (userId) => apiCall(`/dashboard/users/${userId}`, 'GET'),
  
  // PATCH /dashboard/users/permissions - Change User Permission
  changeUserPermission: (data) => apiCall('/dashboard/users/permissions', 'PATCH', data),
  
};

// ==================== CATEGORY API ====================
// export const categoryAPI = {
//   // POST /dashboard/category/create - Create New Category
//   createCategory: (data) => apiCall('/dashboard/category/create', 'POST', data),
  
//   // GET /dashboard/category - Get All Categories
//   getAllCategories: (params) => {
//     const queryString = params ? `?${new URLSearchParams(params)}` : '';
//     return apiCall(`/dashboard/category${queryString}`, 'GET');
//   },
  
//   // GET /dashboard/category/:id - Get Category Details
//   getCategoryDetails: (categoryId) => apiCall(`/dashboard/category/${categoryId}`, 'GET'),
  
//   // PUT /dashboard/category - Update Category
//   updateCategory: (data) => apiCall('/dashboard/category', 'PUT', data),
  
//   // DELETE /dashboard/category/:id - Delete Category
//   deleteCategory: (categoryId) => apiCall(`/dashboard/category/${categoryId}`, 'DELETE'),
// };
export const categoryAPI = {
  // POST /dashboard/category/thumbnail/presign - Get Presigned URL for Image Upload
  getThumbnailUploadUrl: (data) => apiCall('/dashboard/category/thumbnail/presign', 'POST', data),
  
  // Upload image to S3 using presigned URL
  uploadToS3: async (presignedUrl, file) => {
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  },
  
  // POST /dashboard/category/create - Create New Category
  createCategory: (data) => apiCall('/dashboard/category/create', 'POST', data),
  
  // GET /dashboard/category - Get All Categories
  getAllCategories: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/dashboard/category${queryString}`, 'GET');
  },

  createCategoryWithImage: (formData) => apiCallFormData('/dashboard/category/create', 'POST', formData),
  
  //  - Update category with FormData (includes image)
  updateCategoryWithImage: (formData) => apiCallFormData('/dashboard/category', 'PUT', formData),
  
  // GET /dashboard/category/:id - Get Category Details
  getCategoryDetails: (categoryId) => apiCall(`/dashboard/category/${categoryId}`, 'GET'),
  
  // PUT /dashboard/category - Update Category
  updateCategory: (data) => apiCall('/dashboard/category', 'PUT', data),
  
  // PATCH /dashboard/category/isActive - Change isActive Status
  changeIsActive: (data) => apiCall('/dashboard/category/isActive', 'PATCH', data),
  
  // DELETE /dashboard/category/:id - Delete Category
  deleteCategory: (categoryId) => apiCall(`/dashboard/category/${categoryId}`, 'DELETE'),
};

// ==================== VIDEO SERIES API ====================
export const seriesAPI = {


  createSeriesWithImages: (formData) => apiCallFormData('/dashboard/videoSeries', 'POST', formData),
  updateSeriesWithImages: (formData) => apiCallFormData('/dashboard/videoSeries', 'PUT', formData),
  // Get Presigned URLs for Image Upload
  getThumbnailUploadUrl: (data) => apiCall('/dashboard/videoSeries/thumbnail/presign', 'POST', data),
  getBannerUploadUrl: (data) => apiCall('/dashboard/videoSeries/banner/presign', 'POST', data),
  
  // Upload to S3
  uploadToS3: async (presignedUrl, file) => {
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      return response.ok;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  },
  
  // CRUD Operations
  createSeries: (data) => apiCall('/dashboard/videoSeries', 'POST', data),
  getAllSeries: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/dashboard/videoSeries${queryString}`, 'GET');
  },
  getSeriesDetails: (seriesId) => apiCall(`/dashboard/videoSeries/${seriesId}`, 'GET'),
  updateSeries: (data) => apiCall('/dashboard/videoSeries', 'PUT', data),
  deleteSeries: (seriesId) => apiCall(`/dashboard/videoSeries/${seriesId}`, 'DELETE'),
};

// ==================== EPISODES API ====================
export const episodesAPI = {
  // POST /dashboard/episode - Add New Episode
  createEpisode: (data) => apiCall('/dashboard/episode', 'POST', data),
  
  // GET /dashboard/episode - Get All Episodes of a Series
  getAllEpisodes: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/dashboard/episode${queryString}`, 'GET');
  },
  
  // GET /dashboard/episode/:id - Get Episode Details
  getEpisodeDetails: (episodeId) => apiCall(`/dashboard/episode/${episodeId}`, 'GET'),
  
  // PUT /dashboard/episode - Update Episode
  updateEpisode: (data) => apiCall('/dashboard/episode', 'PUT', data),
  
  // DELETE /dashboard/episode/:id - Delete Episode
  deleteEpisode: (episodeId) => apiCall(`/dashboard/episode/${episodeId}`, 'DELETE'),
};

// ==================== FILE UPLOAD API ====================
export const uploadAPI = {
  // Upload file with FormData
  uploadFile: (formData) => apiCallFormData('/upload', 'POST', formData),
  
  // Upload image
  uploadImage: (formData) => apiCallFormData('/upload/image', 'POST', formData),
  
  // Upload video
  uploadVideo: (formData) => apiCallFormData('/upload/video', 'POST', formData),
};

// ==================== LANGUAGE API ====================
export const languageAPI = {
  // GET /dashboard/language - Get All Languages
  getAllLanguages: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/dashboard/language${queryString}`, 'GET');
  },
  
  // POST /dashboard/language - Create New Language
  createLanguage: (data) => apiCall('/dashboard/language', 'POST', data),
  
  // PUT /dashboard/language - Update Language
  updateLanguage: (data) => apiCall('/dashboard/language', 'PUT', data),
  
  // DELETE /dashboard/language/:id - Delete Language
  deleteLanguage: (languageId) => apiCall(`/dashboard/language/${languageId}`, 'DELETE'),
  
  // PATCH /dashboard/language/isActive - Set IsActive
  setIsActive: (data) => apiCall('/dashboard/language/isActive', 'PATCH', data),
};


export const episodeAPI = {
  getAllEpisodes: () => apiCall('/dashboard/episode', 'GET'),
  getEpisodeDetails: (episodeId) => apiCall(`/dashboard/episode/${episodeId}`, 'GET'),
  createEpisode: (data) => apiCall('/dashboard/episode', 'POST', data),
  updateEpisode: (episodeId, data) => apiCall(`/dashboard/videoSeries/${episodeId}`, 'PUT', data),
  deleteEpisode: (episodeId) => apiCall(`/dashboard/episode/${episodeId}`, 'DELETE'),
  getThumbnailPresignedUrl: (data) => apiCall('/dashboard/videoSeries/thumbnail/presign', 'POST', data),
  getVideoPresignedUrl: (data) => apiCall('/dashboard/episode/video/presign', 'POST', data),
};


// ==================== SUBSCRIPTION API ====================
export const subscriptionAPI = {
  // POST /dashboard/subscription - Create New Subscription
  createSubscription: (data) => apiCall('/dashboard/subscription', 'POST', data),
  
  // GET /dashboard/subscription - Get All Subscriptions
  getAllSubscriptions: (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiCall(`/dashboard/subscription${queryString}`, 'GET');
  },
  
  // GET /dashboard/subscription/:id - Get Subscription Details by ID
  getSubscriptionById: (subscriptionId) => apiCall(`/dashboard/subscription/${subscriptionId}`, 'GET'),
  
  // PUT /dashboard/subscription - Update Subscription
  updateSubscription: (data) => apiCall('/dashboard/subscription', 'PUT', data),
  
  // DELETE /dashboard/subscription/:id - Delete Subscription
  deleteSubscription: (subscriptionId) => apiCall(`/dashboard/subscription/${subscriptionId}`, 'DELETE'),
};


// Export all APIs as a single object
const API = {
  dashboard: dashboardAPI,
  auth: authAPI,
  profile: profileAPI,
  employee: employeeAPI,
  users: usersAPI,
  category: categoryAPI,
  series: seriesAPI,
  episodes: episodesAPI,
  upload: uploadAPI,
  language: languageAPI, 
  episode: episodeAPI, 
  subscription: subscriptionAPI,
};

export default API;
