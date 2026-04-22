import { createContext, useState, useEffect } from "react";

// This creates a shared place for login data across the app.
export const AuthContext = createContext();

// This wraps the app and provides auth data to every page.
export const AuthProvider = ({ children }) => {
  // This stores the logged-in user in React state.
  const [user, setUser] = useState(null);

  // This reloads the user from localStorage when the page refreshes.
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) setUser(stored);
  }, []);

  // This saves the token and user after a successful login.
  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  // This updates the saved user after the profile page changes name or email.
  const updateLoggedInUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // This clears all saved login data.
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // This exposes auth helpers to the rest of the app.
  return (
    <AuthContext.Provider value={{ user, login, logout, updateLoggedInUser }}>
      {children}
    </AuthContext.Provider>
  );
};
