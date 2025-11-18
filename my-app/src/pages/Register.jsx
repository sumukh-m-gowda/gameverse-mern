import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleRegister = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      alert("Registered successfully! (Dummy backend)");
      navigate("/login");
    } catch {
      alert("Backend offline (dummy API).");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#fef3c7",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: "350px",
          padding: "30px",
          background: "white",
          borderRadius: "20px",
          border: "2px solid #ccc",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Create Account</h2>

        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            borderRadius: "10px",
            border: "2px solid #ddd",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            borderRadius: "10px",
            border: "2px solid #ddd",
          }}
        />

        <button
          onClick={handleRegister}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            background: "#2563eb",
            color: "white",
            border: "none",
            marginTop: "20px",
            fontWeight: "bold",
          }}
        >
          Register
        </button>

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#2563eb", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
