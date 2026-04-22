import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

// This page lets the logged-in user edit only their own profile.
export default function Profile() {
  // This reads the logged-in user and updater from global auth state.
  const { user, updateLoggedInUser } = useContext(AuthContext);

  // This stores the editable name field.
  const [name, setName] = useState(user?.name || "");

  // This stores the editable email field.
  const [email, setEmail] = useState(user?.email || "");

  // This stores the optional new password field.
  const [password, setPassword] = useState("");

  // This sends profile changes to the backend.
  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      // This updates only name, email, and password; role is never sent.
      const { data } = await API.put("/users/profile/me", {
        name,
        email,
        password,
      });

      // This refreshes localStorage and the dashboard name/email after saving.
      updateLoggedInUser(data.user);

      // This clears the password field so it does not stay visible in the form.
      setPassword("");

      // This tells the user the update worked.
      alert(data.message);
    } catch (err) {
      // This shows the backend reason when the update fails.
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <main className="page-shell scene-shell">
      <section className="floating-panel profile-panel">
        <Link className="text-btn" to="/">Back to dashboard</Link>
        <h1>My Profile</h1>
        <p className="muted-text">You can update your name, email, and password. Your role is protected.</p>

        <form className="form-stack" onSubmit={updateProfile}>
          <label className="field-label">Name</label>
          <input className="input-3d" value={name} onChange={(e) => setName(e.target.value)} />

          <label className="field-label">Email</label>
          <input className="input-3d" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className="field-label">Role</label>
          <input className="input-3d locked-input" value={user?.role || ""} disabled />

          <label className="field-label">New Password</label>
          <input
            className="input-3d"
            type="password"
            placeholder="Leave blank to keep current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="primary-btn" type="submit">Update Profile</button>
        </form>
      </section>
    </main>
  );
}
