import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      login(data.user, data.token);

      const userRole = data.user.role.toLowerCase();

      setTimeout(() => {
        if (userRole === "teacher") {
          navigate("/teacher-dashboard");
        } else if (userRole === "student") {
          navigate("/student-dashboard");
        } else if (userRole === "admin") {
          navigate("/admin-dashboard");
        } else {
          setError(`Unknown role: ${data.user.role}`);
        }
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.card}>
        <div style={styles.logo}>OSS</div>

        <h1 style={styles.heading}>Welcome Back</h1>

        <p style={styles.subHeading}>
          Login to continue to Online Submission System
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <div style={styles.footer}>
          Don’t have an account?
          <span
            onClick={() => navigate("/register")}
            style={styles.link}
          >
            {" "}
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', sans-serif",
  },

  overlay: {
    position: "absolute",
    width: "500px",
    height: "500px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "50%",
    top: "-100px",
    right: "-100px",
    filter: "blur(20px)",
  },

  card: {
    width: "400px",
    padding: "40px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    zIndex: 2,
  },

  logo: {
    width: "70px",
    height: "70px",
    margin: "0 auto 20px",
    borderRadius: "50%",
    background: "#fff",
    color: "#1e3c72",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "24px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "32px",
    fontWeight: "700",
  },

  subHeading: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#e0e0e0",
    fontSize: "14px",
  },

  inputGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    fontSize: "15px",
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#1e3c72",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.3s",
    marginTop: "10px",
  },

  footer: {
    marginTop: "25px",
    textAlign: "center",
    fontSize: "14px",
    color: "#ddd",
  },

  link: {
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  },

  error: {
    background: "rgba(255, 0, 0, 0.15)",
    color: "#ffb3b3",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
  },
};

export default Login;