/**
 * API Service Layer
 * Centralized API calls to avoid code duplication
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Get authorization headers
 */
function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  const lang = localStorage.getItem("lang") || "vi";
  
  const headers = {
    "Content-Type": "application/json",
    "x-lang": lang,
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Get headers for file upload
 */
function getUploadHeaders() {
  const token = localStorage.getItem("access_token");
  const headers = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Handle API response
 */
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }
  
  return data;
}

// ============= AUTH API =============
export const authAPI = {
  login: async (credentials) => {
    const lang = localStorage.getItem("lang") || "vi";
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-lang": lang },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const lang = localStorage.getItem("lang") || "vi";
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-lang": lang },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
};

// ============= DISH API =============
export const dishAPI = {
  create: async (dishData) => {
    const response = await fetch(`${API_BASE}/dishes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(dishData),
    });
    return handleResponse(response);
  },

  list: async (query = {}) => {
    const params = new URLSearchParams(query);
    const response = await fetch(`${API_BASE}/dishes?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (dishId) => {
    const response = await fetch(`${API_BASE}/dishes/${dishId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  update: async (dishId, updateData) => {
    const response = await fetch(`${API_BASE}/dishes/${dishId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleResponse(response);
  },

  delete: async (dishId) => {
    const response = await fetch(`${API_BASE}/dishes/${dishId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getSubmissions: async (query = {}) => {
    const params = new URLSearchParams(query);
    const response = await fetch(`${API_BASE}/dishes/admin/dish-submissions?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMySubmissions: async () => {
    const response = await fetch(`${API_BASE}/dishes/my-submissions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ============= UPLOAD API =============
export const uploadAPI = {
  uploadDishImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE}/upload/dish-image`, {
      method: "POST",
      headers: getUploadHeaders(),
      body: formData,
    });
    
    const data = await handleResponse(response);
    return data.image_url || data.url;
  },
};

// ============= OPTIONS API =============
export const optionsAPI = {
  getCategories: async () => {
    const response = await fetch(`${API_BASE}/categories`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  getRegions: async () => {
    const response = await fetch(`${API_BASE}/regions`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },
};

