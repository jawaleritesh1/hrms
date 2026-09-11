import "./LoginPage.css";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { apiRequest } from "../../services/api";
import type { AuthLoginResponse, SessionUser } from "../../types";

type LoginPageProps = {
  onLogin: (token: string, user?: SessionUser | null) => void;
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await apiRequest<AuthLoginResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      onLogin(response.data.token, response.data.user);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page-root">
      <div className="login-page-frame">
        {/* Background Image Layer from public/assets/images/login-bg.png */}
        <div className="login-page-bg" />

        {/* Soft overlay ensuring text legibility on the left while revealing the scene */}
        <div className="login-page-overlay" />

        {/* Left Value & Brand Showcase */}
        <section className="login-showcase-section">
          <div className="login-showcase-top">
            <p className="login-eyebrow-tag">S G S &nbsp; H R M S</p>
            <h1 className="login-tagline-title">
              People.<br />
              Process.<br />
              <span className="text-highlight-gold">Progress.</span>
            </h1>
            <p className="login-tagline-desc">
              A smarter workspace for a<br />
              more connected team.
            </p>

            <div className="login-features-grid">
              <div className="login-feature-card">
                <div className="login-feature-icon-circle icon-circle-sand">
                  <Users size={18} strokeWidth={2.2} />
                </div>
                <div className="login-feature-info">
                  <h3>Manage People</h3>
                  <p>Employees, teams &amp; roles</p>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon-circle icon-circle-sage">
                  <CalendarCheck size={18} strokeWidth={2.2} />
                </div>
                <div className="login-feature-info">
                  <h3>Track Attendance</h3>
                  <p>Be on time, always</p>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon-circle icon-circle-amber">
                  <FileText size={18} strokeWidth={2.2} />
                </div>
                <div className="login-feature-info">
                  <h3>Simplify Leaves</h3>
                  <p>Apply, track &amp; approve</p>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon-circle icon-circle-emerald">
                  <BarChart3 size={18} strokeWidth={2.2} />
                </div>
                <div className="login-feature-info">
                  <h3>Grow Together</h3>
                  <p>A more productive tomorrow</p>
                </div>
              </div>
            </div>
          </div>

          <div className="login-showcase-bottom">
            <div className="login-signature-unit">
              <span className="login-script-quote">Building<br />Better Workplaces</span>
              <svg className="login-script-underline" viewBox="0 0 150 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5C45 2 95 3 148 9C102 7 52 9 16 13" stroke="#B88A44" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </section>

        {/* Center Pillars Column */}
        <div className="login-pillars-track" aria-hidden="true">
          <span>P E O P L E</span>
          <span>C U L T U R E</span>
          <span>P R O D U C T I V I T Y</span>
          <span>S U C C E S S</span>
        </div>

        {/* Right Login Form Card */}
        <section className="login-panel-section">
          <div className="login-white-card">
            <div className="login-card-topbar">
              <img
                src="/assets/images/Logo.png?v=2"
                alt="Sanskar Growth Solutions"
                className="login-card-logo"
              />
              <span className="login-new-here-text">
                New here?{" "}
                <a href="mailto:hr@sanskargrowthsolutions.com" className="login-contact-hr-link">
                  Contact HR
                </a>
              </span>
            </div>

            <div className="login-card-brand-header">
              <p className="login-card-portal-eyebrow">S G S &nbsp; H R M S &nbsp; P O R T A L</p>
              <h2 className="login-card-greeting">Welcome back</h2>
              <p className="login-card-prompt">Use your work credentials to continue.</p>
            </div>

            <form className="login-auth-form" onSubmit={handleSubmit}>
              <div className="login-input-group">
                <label htmlFor="work-email" className="login-label-text">Work email</label>
                <div className="login-field-box">
                  <Mail className="login-field-icon-left" size={17} />
                  <input
                    id="work-email"
                    className="login-text-input"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label htmlFor="work-password" className="login-label-text">Password</label>
                <div className="login-field-box">
                  <Lock className="login-field-icon-left" size={17} />
                  <input
                    id="work-password"
                    className="login-text-input login-input-with-eye"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-field-eye-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="login-options-bar">
                <label className="login-remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
                <button
                  type="button"
                  className="login-forgot-pwd-btn"
                  onClick={() => setError("Please contact your HR administrator to reset your credentials.")}
                >
                  Forgot password?
                </button>
              </div>

              {error ? <p className="login-error-badge">{error}</p> : null}

              <button type="submit" className="login-main-submit-btn" disabled={submitting}>
                <span>{submitting ? "Signing in..." : "Sign in"}</span>
                <ArrowRight size={17} strokeWidth={2.4} />
              </button>
            </form>

            <div className="login-card-trust-capsule">
              <div className="login-capsule-item">
                <div className="login-capsule-icon-box">
                  <Building2 size={16} strokeWidth={1.9} />
                </div>
                <div className="login-capsule-text">
                  <strong>Access</strong>
                  <span>Role-based workspace</span>
                </div>
              </div>
              <div className="login-capsule-divider" />
              <div className="login-capsule-item">
                <div className="login-capsule-icon-box">
                  <Users size={16} strokeWidth={1.9} />
                </div>
                <div className="login-capsule-text">
                  <strong>Users</strong>
                  <span>HR, managers, employees</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
