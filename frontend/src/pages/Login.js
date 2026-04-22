import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// This extracts a clear message from Axios errors for alerts.
const getErrorMessage = (err, fallback) => {
  // This handles backend JSON errors like { message: "User already exists" }.
  if (err.response?.data?.message) return err.response.data.message;

  // This handles backend HTML errors like "<pre>Cannot POST /api/auth/signup</pre>".
  if (typeof err.response?.data === "string") {
    const plainText = err.response.data.replace(/<[^>]+>/g, "").trim();
    return plainText || fallback;
  }

  // This handles network errors when the backend server is not reachable.
  if (err.request) return "Backend is not reachable. Start the backend server on http://localhost:5000 and try again.";

  // This returns the fallback when no better message exists.
  return fallback;
};

// This page handles login, signup, forgot password, and generated-password setup.
export default function AuthPage() {
  // This decides which form is currently shown.
  const [tab, setTab] = useState("login");

  // This stores login form values.
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // This stores public signup form values.
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // This stores the generated-password change form values.
  const [initialPasswordData, setInitialPasswordData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  // This gives access to the global login helper.
  const { login } = useContext(AuthContext);

  // This lets the page move to the dashboard after login.
  const navigate = useNavigate();

  // This sends login data to the backend.
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // This asks the backend to verify email and password.
      const { data } = await API.post("/auth/login", loginData);

      // This stores the token and user in the auth context.
      login(data);

      // This opens the dashboard after a successful login.
      navigate("/");
    } catch (err) {
      // This opens the change-password tab when the backend says the generated password must be changed.
      if (err.response?.data?.code === "PASSWORD_CHANGE_REQUIRED") {
        setInitialPasswordData({
          email: loginData.email,
          currentPassword: loginData.password,
          newPassword: "",
        });
        setTab("initial");
        alert(err.response.data.message);
        return;
      }

      // This shows the real backend error instead of a generic failed alert.
      alert(getErrorMessage(err, "Login failed"));
    }
  };

  // This sends signup data to the backend.
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // This creates an inactive account that waits for admin approval.
      const { data } = await API.post("/auth/signup", signupData);

      // This tells the person that signup worked and approval is needed.
      alert(data.message);

      // This returns to the login form after signup.
      setTab("login");
    } catch (err) {
      // This shows the exact backend signup problem, such as duplicate email.
      alert(getErrorMessage(err, "Signup failed"));
    }
  };

  // This changes the generated password before the first real login.
  const handleInitialPasswordChange = async (e) => {
    e.preventDefault();

    try {
      // This asks the backend to replace the generated password.
      const { data } = await API.put("/auth/change-initial-password", initialPasswordData);

      // This tells the user they can now login with the new password.
      alert(data.message);

      // This pre-fills the login email and clears the password field.
      setLoginData({ email: initialPasswordData.email, password: "" });

      // This returns to login after the password is changed.
      setTab("login");
    } catch (err) {
      // This shows the backend reason if password change fails.
      alert(getErrorMessage(err, "Password change failed"));
    }
  };

  return (
    <main className="auth-shell scene-shell">
      <div className="depth-grid" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <aside className="auth-visual" aria-hidden="true">
        <div className="cube-stack">
          <span className="cube cube-one"></span>
          <span className="cube cube-two"></span>
          <span className="cube cube-three"></span>
        </div>
        <div className="mini-card card-one">Approval</div>
        <div className="mini-card card-two">Roles</div>
        <div className="mini-card card-three">Security</div>
      </aside>

      <div className="floating-panel auth-panel">
        <div className="brand-mark">UMS</div>
        <h1>Welcome Back</h1>
        <p className="muted-text">Secure account access with admin approval built in.</p>

        <div className="tabs">
          <button className={tab === "login" ? "tab active" : "tab"} onClick={() => setTab("login")}>
            Login
          </button>
          <button className={tab === "signup" ? "tab active" : "tab"} onClick={() => setTab("signup")}>
            Signup
          </button>
          <button className={tab === "forgot" ? "tab active" : "tab"} onClick={() => setTab("forgot")}>
            Reset
          </button>
        </div>

        {tab === "login" && (
          <form className="form-stack" onSubmit={handleLogin}>
            <input
              className="input-3d"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            />
            <input
              className="input-3d"
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
            <button className="primary-btn" type="submit">Login</button>
            <button className="text-btn" type="button" onClick={() => setTab("forgot")}>
              Forgot password?
            </button>
          </form>
        )}

        {tab === "signup" && (
          <form className="form-stack" onSubmit={handleSignup}>
            <input
              className="input-3d"
              placeholder="Name"
              value={signupData.name}
              onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
            />
            <input
              className="input-3d"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
            />
            <input
              className="input-3d"
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
            />
            <select
              className="input-3d"
              value={signupData.role}
              onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
            <button className="primary-btn" type="submit">Signup</button>
          </form>
        )}

        {tab === "initial" && (
          <form className="form-stack" onSubmit={handleInitialPasswordChange}>
            <p className="notice-text">Use the generated password once, then set your own password.</p>
            <input
              className="input-3d"
              placeholder="Email"
              value={initialPasswordData.email}
              onChange={(e) => setInitialPasswordData({ ...initialPasswordData, email: e.target.value })}
            />
            <input
              className="input-3d"
              type="password"
              placeholder="Generated password"
              value={initialPasswordData.currentPassword}
              onChange={(e) => setInitialPasswordData({ ...initialPasswordData, currentPassword: e.target.value })}
            />
            <input
              className="input-3d"
              type="password"
              placeholder="New password"
              value={initialPasswordData.newPassword}
              onChange={(e) => setInitialPasswordData({ ...initialPasswordData, newPassword: e.target.value })}
            />
            <button className="primary-btn" type="submit">Change Password</button>
          </form>
        )}

        {tab === "forgot" && <Forgot setTab={setTab} />}
      </div>
    </main>
  );
}

// This component handles forgot password updates.
function Forgot({ setTab }) {
  // This stores the email typed for password reset.
  const [email, setEmail] = useState("");

  // This stores the new password typed for password reset.
  const [password, setPassword] = useState("");

  // This sends the reset request to the backend.
  const handleReset = async (e) => {
    e.preventDefault();

    try {
      // This updates the password for the matching email.
      const { data } = await API.put("/auth/reset-password", { email, password });

      // This tells the user the password was updated.
      alert(data.message);

      // This returns to login after reset.
      setTab("login");
    } catch (err) {
      // This shows the backend error if reset fails.
      alert(getErrorMessage(err, "Password reset failed"));
    }
  };

  return (
    <form className="form-stack" onSubmit={handleReset}>
      <input
        className="input-3d"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="input-3d"
        placeholder="New Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="primary-btn" type="submit">Update Password</button>
    </form>
  );
}
