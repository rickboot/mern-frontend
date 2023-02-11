import { useState, useEffect, useCallback } from 'react';

let logoutTimerHandle; 

export const useAuth = () => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(false);
  const [expirationDate, setExpirationDate] = useState();

  const login = useCallback((userId, token, expiration) => {
    setToken(token);
    setUserId(userId);
    expiration = expiration || new Date(new Date().getTime() + 1000 * 60 * 60);
    setExpirationDate(expiration);
    localStorage.setItem('userData', JSON.stringify({ userId, token, expiration: expiration.toISOString() }));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setExpirationDate(null);
    localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData && userData.token && new Date(userData.expiration) > new Date()) {
      login(userData.userId, userData.token, new Date(userData.expiration));
    }
  }, [login]);

  useEffect(() => {
    if (token && expirationDate) {
      const remainingTime = expirationDate.getTime() - new Date().getTime();
      logoutTimerHandle = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimerHandle);
    }
  }, [token, logout, expirationDate]);

  return { userId, token, login, logout };
}