import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/services/apiClient";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuthStore();

  const submit = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data.user);
      setAccessToken(data.accessToken);
      navigate("/dashboard");
    } catch (e: any) {
      const msg = e.response?.data?.errors?.[0]?.message || e.response?.data?.message || e.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="bg-white rounded-2xl border border-[#DCEEFA] shadow-sm p-9 w-full max-w-sm">
        <h2 className="font-display text-2xl font-bold text-center mb-1">Welcome back</h2>
        <p className="text-textmuted text-sm text-center mb-6">Continue where you left off</p>
        {error && <p className="text-error text-xs mb-3 p-2 bg-error/10 rounded-lg">{error}</p>}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
          className="w-full px-4 py-3 rounded-xl border border-[#DCEEFA] text-sm mb-3 outline-none focus:border-primary" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password"
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full px-4 py-3 rounded-xl border border-[#DCEEFA] text-sm mb-5 outline-none focus:border-primary" />
        <button onClick={submit} disabled={loading} className="w-full bg-ocean text-white rounded-xl py-3 font-bold mb-4 disabled:opacity-60 transition-opacity">
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="text-center text-sm text-textmuted">
          New to BookBuddy?{" "}
          <Link to="/signup" className="text-primary font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
