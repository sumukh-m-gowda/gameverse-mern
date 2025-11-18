import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  // Multiple allowed users
  const validUsers = [
    { username: "test", password: "test@123" },
    { username: "pes", password: "pes@123" },
    { username: "play", password: "play@123" }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Check if entered username & password exist in validUsers array
    const userFound = validUsers.find(
      (user) =>
        user.username === formData.username &&
        user.password === formData.password
    );

    if (userFound) {
      localStorage.setItem("username", userFound.username);
      localStorage.setItem("token", "dummy-token-123");
      navigate("/home");
      return;
    }

    alert("Invalid credentials");
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "#ffffff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          width: "340px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Login</h2>

        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          onChange={handleChange}
          required
          style={{
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "15px",
          }}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          onChange={handleChange}
          required
          style={{
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "15px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "12px",
            borderRadius: "6px",
            border: "none",
            background: "#3498db",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
