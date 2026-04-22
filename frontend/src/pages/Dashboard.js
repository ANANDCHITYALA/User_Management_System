import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import API from "../api/axios";

// This gives a readable error message from API failures.
const getApiMessage = (err) => err.response?.data?.message || "Dashboard data could not be loaded";

// This page is the first useful screen after login.
export default function Dashboard() {
  // This reads the logged-in user and logout function from global auth state.
  const { user, logout } = useContext(AuthContext);

  // This stores user-management summary data for admins and managers.
  const [summary, setSummary] = useState({
    active: 0,
    inactive: 0,
    managers: 0,
    users: 0,
  });

  // This stores the newest accounts so admin and manager know what needs attention.
  const [recentUsers, setRecentUsers] = useState([]);

  // This stores a friendly loading or error message.
  const [message, setMessage] = useState("");

  // This decides whether this role can load account data.
  const canManageUsers = user?.role === "admin" || user?.role === "manager";

  // This text explains the user's main permission in one sentence.
  const permissionText = useMemo(() => {
    // This returns admin-specific dashboard guidance.
    if (user?.role === "admin") {
      return "Review pending signups, activate accounts, and keep roles accurate.";
    }

    // This returns manager-specific dashboard guidance.
    if (user?.role === "manager") {
      return "Update active user records and deactivate users who should no longer have access.";
    }

    // This returns normal user guidance.
    return "Keep your own name, email, and password up to date.";
  }, [user?.role]);

  // This loads dashboard summary data for admin and manager roles.
  useEffect(() => {
    // This skips account summaries for normal users because they do not have user-list access.
    if (!canManageUsers) return;

    // This keeps React from updating state after the component is gone.
    let isMounted = true;

    // This requests active and inactive account lists from the backend.
    const loadSummary = async () => {
      try {
        // This shows a short loading message while the dashboard checks account data.
        setMessage("Checking account status...");

        // This loads active and inactive accounts in parallel for faster dashboard data.
        const [activeRes, inactiveRes] = await Promise.all([
          API.get("/users", { params: { limit: 100, status: "active" } }),
          API.get("/users", { params: { limit: 100, status: "inactive" } }),
        ]);

        // This stops work if the user already navigated away.
        if (!isMounted) return;

        // This combines active and inactive accounts into one list for counting.
        const allUsers = [
          ...(activeRes.data.users || []),
          ...(inactiveRes.data.users || []),
        ];

        // This saves the dashboard numbers.
        setSummary({
          active: activeRes.data.total || 0,
          inactive: inactiveRes.data.total || 0,
          managers: allUsers.filter((account) => account.role === "manager").length,
          users: allUsers.filter((account) => account.role === "user").length,
        });

        // This keeps only a few latest accounts for the activity list.
        setRecentUsers(allUsers.slice(0, 4));

        // This clears the loading message after success.
        setMessage("");
      } catch (err) {
        // This shows a helpful message if the summary cannot load.
        if (isMounted) setMessage(getApiMessage(err));
      }
    };

    // This starts loading the dashboard data.
    loadSummary();

    // This cleanup prevents stale state updates.
    return () => {
      isMounted = false;
    };
  }, [canManageUsers]);

  return (
    <main className="page-shell scene-shell">
      <section className="floating-panel dashboard-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">User Management System</p>
            <h1>Welcome, {user?.name}</h1>
            <p className="muted-text">{permissionText}</p>
          </div>
          <span className="role-pill">{user?.role}</span>
        </div>

        {canManageUsers ? (
          <>
            <div className="stats-grid">
              <div className="glass-tile metric-tile">
                <strong>{summary.active}</strong>
                <span>Active accounts</span>
              </div>
              <div className="glass-tile metric-tile">
                <strong>{summary.inactive}</strong>
                <span>Waiting or inactive</span>
              </div>
              <div className="glass-tile metric-tile">
                <strong>{user?.role === "admin" ? summary.managers : summary.users}</strong>
                <span>{user?.role === "admin" ? "Managers in system" : "Users you can manage"}</span>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="glass-tile action-tile">
                <strong>Priority</strong>
                <span>
                  {summary.inactive > 0
                    ? `${summary.inactive} account needs activation or review.`
                    : "No pending activation work right now."}
                </span>
                <Link to="/users" className="secondary-btn">Open Manage Users</Link>
              </div>

              <div className="glass-tile action-tile">
                <strong>Recent Accounts</strong>
                {message && <span>{message}</span>}
                {!message && recentUsers.length === 0 && <span>No account activity yet.</span>}
                {!message && recentUsers.map((account) => (
                  <span className="recent-line" key={account._id}>
                    {account.name} · {account.role} · {account.status}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="dashboard-grid">
            <div className="glass-tile action-tile">
              <strong>Account Health</strong>
              <span>Your account is active. Update your profile when your name, email, or password changes.</span>
              <Link to="/profile" className="secondary-btn">Update Profile</Link>
            </div>
            <div className="glass-tile action-tile">
              <strong>Access Level</strong>
              <span>You can use your own profile page only. Admin approval protects account changes.</span>
            </div>
          </div>
        )}

        <div className="dashboard-actions">
          <Link to="/profile" className="primary-btn">My Profile</Link>
          {canManageUsers && <Link to="/users" className="secondary-btn">Manage Users</Link>}
          <button className="secondary-btn danger-outline" onClick={logout}>Logout</button>
        </div>
      </section>
    </main>
  );
}
