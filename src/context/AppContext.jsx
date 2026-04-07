import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = async () => {
    try {
      const usersRes = await fetch(`${API_BASE}/users`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
        // Sync currentUser if it exists
        if (currentUser) {
           const updatedMe = usersData.find(u => u.id === currentUser.id);
           if (updatedMe) setCurrentUser(updatedMe);
        }
      }

      const leavesRes = await fetch(`${API_BASE}/leaves`);
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        resetTimeout();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login failed:", e);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (window.timeoutId) clearTimeout(window.timeoutId);
  };

  // Session Timeout Logic (15 minutes)
  const resetTimeout = () => {
    if (window.timeoutId) clearTimeout(window.timeoutId);
    window.timeoutId = setTimeout(() => {
      alert("Session Expired due to inactivity. Protective protocols engaged.");
      logout();
    }, 15 * 60 * 1000); 
  };

  useEffect(() => {
    if (currentUser) {
      window.addEventListener('mousemove', resetTimeout);
      window.addEventListener('keypress', resetTimeout);
      resetTimeout();
    }
    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
    };
  }, [currentUser]);

  const applyLeave = async (leaveData) => {
    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leaveData,
          userId: currentUser.id
        })
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (e) {
      console.error("Failed to apply leave:", e);
    }
    return false;
  };

  const updateLeaveStatus = async (leaveId, status, remarks) => {
    try {
      const res = await fetch(`${API_BASE}/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks })
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
    return false;
  };

  // User CRUD
  const addUser = async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const editUser = async (id, userData) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const deleteUser = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  return (
    <AppContext.Provider value={{ 
      users, leaves, currentUser, 
      login, logout, applyLeave, updateLeaveStatus,
      addUser, editUser, deleteUser
    }}>
      {children}
    </AppContext.Provider>
  );
};
