
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Registration successful!");
      navigate("/login");
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
      background: "#fef3c7",
      fontFamily: "Arial, sans-serif"
    }}>
      <form onSubmit={handleRegister} style={{
        width: "350px",
        padding: "30px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
      }}>
        <h2 style={{ textAlign: "center" }}>Create Account</h2>

        <input
          type="text"
          placeholder="Username (at least 3 characters)"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
          minLength={3}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            boxSizing: "border-box"
          }}
        />

        <input
          type="password"
          placeholder="Password (at least 8 characters)"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          minLength={8}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            boxSizing: "border-box"
          }}
        />

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            marginTop: "20px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#2563eb", cursor: "pointer" }}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}