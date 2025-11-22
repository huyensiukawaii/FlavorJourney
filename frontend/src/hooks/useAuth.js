import { useNavigate } from "react-router-dom";

/**
 * Custom hook for authentication logic
 */
export function useAuth() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const isAuthenticated = () => {
    return !!getToken();
  };

  return {
    logout,
    getUser,
    getToken,
    isAuthenticated,
  };
}

