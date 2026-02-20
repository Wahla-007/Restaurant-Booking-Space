import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState("");
 const { login } = useAuth();
 const navigate = useNavigate();

 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
   const result = await login(email, password);
   if (result.success) {
    if (result.role === "admin") {
     navigate("/super-admin");
    } else if (result.role === "business") {
     navigate("/business-dashboard");
    } else {
     navigate("/"); // Go home
    }
   } else {
    setError(result.message);
   }
  } catch {
   setError("Failed to login. Please try again.");
  } finally {
   setLoading(false);
  }
 };

 return (
  <div
   className="container"
   style={{
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
   }}>
   <div
    className="glass"
    style={{
     padding: "3rem",
     width: "100%",
     maxWidth: "400px",
     borderRadius: "var(--radius)",
    }}>
    <h2
     className="title-gradient"
     style={{
      textAlign: "center",
      fontWeight: 800,
      fontSize: "2rem",
      marginBottom: "2rem",
     }}>
     Welcome Back
    </h2>

    <form
     onSubmit={handleSubmit}
     style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
     <div>
      <label
       style={{
        display: "block",
        marginBottom: "0.5rem",
        color: "var(--text-muted)",
       }}>
       Email
      </label>
      <input
       type="email"
       required
       value={email}
       onChange={(e) => setEmail(e.target.value)}
       placeholder="you@example.com"
      />
     </div>

     <div>
      <label
       style={{
        display: "block",
        marginBottom: "0.5rem",
        color: "var(--text-muted)",
       }}>
       Password
      </label>
      <input
       type="password"
       required
       value={password}
       onChange={(e) => setPassword(e.target.value)}
       placeholder="••••••••"
      />
     </div>

     {error && (
      <p style={{ color: "#ef4444", textAlign: "center", fontSize: "0.9rem" }}>
       {error}
      </p>
     )}

     <button
      type="submit"
      className="btn btn-primary"
      style={{ marginTop: "1rem" }}
      disabled={loading}>
      {loading ? "Signing In..." : "Sign In"}
     </button>
    </form>

    <p
     style={{
      textAlign: "center",
      marginTop: "2rem",
      color: "var(--text-muted)",
     }}>
     Don't have an account?{" "}
     <Link
      to="/signup"
      style={{ color: "var(--primary)", textDecoration: "none" }}>
      Sign up
     </Link>
    </p>
   </div>
  </div>
 );
}
