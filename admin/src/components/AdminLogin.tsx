import React, { useState } from "react";
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import type { User } from "../types";
import { AashrayoLogo } from "./AashrayoLogo";

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      if (
        email.toLowerCase() === "admin@aashrayo.in" ||
        (email.includes("@") && password.length >= 6)
      ) {
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
        setError("Invalid credentials. Please verify or use demo autofill below.");
      }
    }, 400);
  };

  const handleOtpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || otp.trim().length < 6) {
      setError("Please enter your 10-digit mobile number and 6-digit OTP.");
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
    if (authMode === "email") {
      setEmail("admin@aashrayo.in");
      setPassword("Aashrayo@Admin2026");
    } else {
      setPhone("+91 99999 99999");
      setOtp("123456");
    }
    setError(null);
  };

  return (
    <div className="login-wrapper">
      {/* Background Ambient Lighting */}
      <div className="login-ambient-orb login-ambient-orb-1" />
      <div className="login-ambient-orb login-ambient-orb-2" />
      <div className="login-ambient-grid" />

      <div className="login-card">
        {/* Clean Logo Header */}
        <div className="login-header">
          <AashrayoLogo
            size={52}
            variant="stacked"
            theme="light"
            subtitle="ADMIN PORTAL"
          />
        </div>

        {/* Tab Switcher */}
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
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Email Form */}
        {authMode === "email" && (
          <form onSubmit={handleEmailLogin} className="auth-form">
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Official Email</label>
              <div className="input-with-icon">
                <Mail size={17} className="input-icon" />
                <input
                  type="email"
                  className="form-control-app"
                  placeholder="admin@aashrayo.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={17} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control-app form-control-has-eye"
                  placeholder="Enter security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Mobile OTP Form */}
        {authMode === "otp" && (
          <form onSubmit={handleOtpLogin} className="auth-form">
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Registered Mobile</label>
              <div className="input-with-icon">
                <Phone size={17} className="input-icon" />
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

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>6-Digit OTP</label>
              <div className="input-with-icon">
                <KeyRound size={17} className="input-icon" />
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
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Verify & Access</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Discrete Demo Autofill Helper */}
        <div className="demo-hint-row">
          <span>Quick testing?</span>
          <button
            type="button"
            className="demo-link-btn"
            onClick={fillDemoCredentials}
          >
            <Sparkles size={13} />
            <span>Autofill Demo Credentials</span>
          </button>
        </div>

        {/* Minimal Clean Footer */}
        <div className="login-footer">
          <p>© 2026 Aashrayo · Secure Channel Partner Operations</p>
        </div>
      </div>
    </div>
  );
};
