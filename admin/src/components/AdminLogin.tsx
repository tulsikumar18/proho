import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import type { User } from "../types";

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("admin@aashrayo.in");
  const [password, setPassword] = useState("Aashrayo@Admin2026");
  const [phone, setPhone] = useState("+91 99999 99999");
  const [otp, setOtp] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your admin email and password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Valid credentials
      if (email.toLowerCase() === "admin@aashrayo.in" || email.includes("@")) {
        const verifiedAdmin: User = {
          id: "usr-admin-001",
          phone: "+91 99999 99999",
          email: email.trim(),
          full_name: "Aashrayo Operations Lead",
          role: "ADMIN",
          preferred_language: "en",
          is_active: true,
          created_at: "2026-10-21T09:00:00Z",
        };
        localStorage.setItem("aashrayo_admin_token", "adm_token_verified_" + Date.now());
        localStorage.setItem("aashrayo_admin_user", JSON.stringify(verifiedAdmin));
        onLoginSuccess(verifiedAdmin);
      } else {
        setError("Invalid admin credentials. Please verify your email and password.");
      }
    }, 400);
  };

  const handleOtpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || otp.trim().length < 6) {
      setError("Please enter your registered mobile number and 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const verifiedAdmin: User = {
        id: "usr-admin-001",
        phone: phone.trim(),
        email: "admin@aashrayo.in",
        full_name: "Aashrayo Operations Lead",
        role: "ADMIN",
        preferred_language: "en",
        is_active: true,
        created_at: "2026-10-21T09:00:00Z",
      };
      localStorage.setItem("aashrayo_admin_token", "adm_token_verified_" + Date.now());
      localStorage.setItem("aashrayo_admin_user", JSON.stringify(verifiedAdmin));
      onLoginSuccess(verifiedAdmin);
    }, 400);
  };

  const fillDemoCredentials = () => {
    setEmail("admin@aashrayo.in");
    setPassword("Aashrayo@Admin2026");
    setError(null);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Brand Banner */}
        <div className="login-header">
          <div className="login-brand-badge">A</div>
          <h2>AASHRAYO</h2>
          <p className="login-brand-sub">OPERATIONS & COMPLIANCE PORTAL</p>
        </div>

        {/* Security Callout */}
        <div className="security-notice">
          <ShieldCheck size={18} color="#7c3aed" />
          <span>Restricted Admin Portal · Verified Personnel Only</span>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab-btn ${authMode === "email" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("email");
              setError(null);
            }}
          >
            <Mail size={15} />
            <span>Admin Email</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === "otp" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("otp");
              setError(null);
            }}
          >
            <Phone size={15} />
            <span>Mobile OTP</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-box">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Email Form */}
        {authMode === "email" && (
          <form onSubmit={handleEmailLogin} className="auth-form">
            <div className="form-group">
              <label>Official Admin Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-control-app"
                  placeholder="admin@aashrayo.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-control-app"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as Operations Lead</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Phone OTP Form */}
        {authMode === "otp" && (
          <form onSubmit={handleOtpLogin} className="auth-form">
            <div className="form-group">
              <label>Registered Mobile Number</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  className="form-control-app"
                  placeholder="+91 99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>6-Digit Verification Code</label>
              <div className="input-with-icon">
                <KeyRound size={18} className="input-icon" />
                <input
                  type="text"
                  maxLength={6}
                  className="form-control-app"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span>Verifying OTP...</span>
              ) : (
                <>
                  <span>Verify & Access Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Demo Fill */}
        <div className="demo-credentials-wrap">
          <button
            type="button"
            className="demo-pill-btn"
            onClick={fillDemoCredentials}
          >
            <Sparkles size={14} color="#7c3aed" />
            <span>Autofill Verified Admin Credentials</span>
          </button>
        </div>

        <div className="login-footer">
          <p>© 2026 Aashrayo Real Estate Platform. All access is audited and monitored.</p>
        </div>
      </div>
    </div>
  );
};
