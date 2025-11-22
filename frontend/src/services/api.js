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
  create: async (dishData, imageFile = null) => {
    const token = localStorage.getItem("access_token");
    const lang = localStorage.getItem("lang") || "vi";
    
    const headers = {
      "x-lang": lang,
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    let body;
    
    if (imageFile) {
      const formData = new FormData();
      
      Object.keys(dishData).forEach((key) => {
        const value = dishData[key];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });
      
      if (imageFile instanceof File) {
        formData.append("image", imageFile);
      }
      
      body = formData;
      
      if (headers["Content-Type"]) {
        delete headers["Content-Type"];
      }
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(dishData);
    }
    
    const response = await fetch(`${API_BASE}/dishes`, {
      method: "POST",
      headers,
      body,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Gửi món ăn thất bại";
      try {
        const json = JSON.parse(errorText);
        errorMessage = json.message || json.error || "Bad Request";
        if (Array.isArray(json.message)) {
          errorMessage = json.message.join(', ');
        }
      } catch {
        errorMessage = errorText || response.statusText;
      }
      throw new Error(errorMessage);
    }
    
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
    console.log("Upload API response:", data);
    
    const imageUrl = data.url || data.image_url;
    console.log("Extracted image URL:", imageUrl);
    
    if (!imageUrl) {
      throw new Error("Không nhận được URL ảnh từ server");
    }
    
    return imageUrl;
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

