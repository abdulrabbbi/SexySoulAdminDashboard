import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
const useAdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 const loginAdmin = async (formData) => {
  setLoading(true);
  setError(null);

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
      formData,
      { withCredentials: true }
    );

    const { token, user } = response.data.data;

    if (!token || !user) {
      throw new Error("Invalid server response");
    }

    localStorage.setItem("token", token);

    return user; 
  } catch (err) {
    const message = err.response?.data?.message || "Login failed";

    setError(message);
    toast.error(message); 
    throw new Error(message);
  } finally {
    setLoading(false);
  }
};
const logoutAdmin = async () => {
  setLoading(true);
  setError(null);
  
   const token = localStorage.getItem("token");

  try {
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
      {},
      {
    headers: {
      Authorization: `Bearer ${token}`
    },
    withCredentials: true,
  }
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");

  } catch (err) {
    const message =
      err.response?.data?.message || "Logout failed";

    setError(message);
    toast.error(message);

    throw new Error(message);
  } finally {
    setLoading(false);
  }
};
  return {
    loginAdmin,
    logoutAdmin,
    loading,
    error,
  };
};

export default useAdminLogin;