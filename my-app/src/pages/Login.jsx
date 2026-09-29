
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);

      navigate("/home");
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f3f4f6",
      fontFamily: "Arial, sans-serif"
    }}>
      <form onSubmit={handleLogin} style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        width: "340px",
        display: "flex",
        flexDirection: "column",
        gap: "18px"
      }}>
        <h2 style={{ textAlign: "center", color: "#2c3e50" }}>
          GameVerse Login
        </h2>

        <input
          type="text"
          placeholder="Enter Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
          style={{ padding: "12px", fontSize: "15px" }}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          style={{ padding: "12px", fontSize: "15px" }}
        />

        {error && (
          <p style={{ color: "red", margin: 0 }}>{error}</p>
        )}

        <button type="submit" disabled={loading} style={{
          padding: "12px",
          background: "#3498db",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer"
        }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center" }}>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: "#2563eb", cursor: "pointer" }}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}