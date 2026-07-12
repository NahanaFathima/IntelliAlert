import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { Link, useNavigate } from "react-router-dom";
import { Train, Mail, Lock, UserPlus, LogIn } from "lucide-react";

export default function Login() {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError("Name is required for sign up.");
          setLoading(false);
          return;
        }
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#003399]/40"></div>
        
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex bg-blue-50 p-3.5 rounded-full mb-3 shadow-sm border border-blue-100">
            <Train className="h-8 w-8 text-[#003399]" />
          </div>
          <h2 className="font-sans font-black text-3xl tracking-tight text-slate-800 uppercase">
            IntelliAlert
          </h2>
          <p className="text-xs font-bold text-[#003399] mt-1.5 uppercase tracking-widest">
            Every Announcement. Only When It Matters.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl text-sm text-center font-semibold" id="login-error">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} id="auth-form">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <UserPlus className="h-5 w-5 text-[#003399]" />
                </span>
                <input
                  type="text"
                  required={isSignUp}
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399] text-sm font-semibold shadow-sm"
                  id="auth-name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Mail className="h-5 w-5 text-[#003399]" />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399] text-sm font-semibold shadow-sm"
                id="auth-email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="h-5 w-5 text-[#003399]" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399] text-sm font-semibold shadow-sm"
                id="auth-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#003399] hover:bg-blue-800 disabled:opacity-40 text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 transition-all shadow-md text-sm uppercase tracking-wider mt-4"
            id="auth-submit-btn"
          >
            {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Authenticating..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Auth Mode Toggle */}
        <div className="pt-6 border-t border-slate-100 flex flex-col space-y-4">
          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold underline focus:outline-none"
              id="toggle-auth-mode"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
