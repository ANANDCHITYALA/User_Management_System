import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Profile from "./pages/Profile";

// This component defines all frontend routes.
function App() {
  return (
    // This gives every page access to login state.
    <AuthProvider>
      {/* This turns URL paths into React pages. */}
      <BrowserRouter>
        <Routes>
          {/* This route shows the login/signup page. */}
          <Route path="/login" element={<Login />} />

          {/* This route protects and shows the dashboard after login. */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* This route protects the user's own profile page. */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* This route protects the admin and manager user-management page. */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// This exports App so index.js can render it.
export default App;
