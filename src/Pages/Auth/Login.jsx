import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import  useAdminLogin from "../../Components/auth/login";

import {
  MdMail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook } from "react-icons/fa";

const COLORS = {
  onyx: "#0B0B0F",
  bg: "#12131A",
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

const LoginPage = () => {
  const navigate = useNavigate();
   const { loginAdmin, loading, error } = useAdminLogin();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({ email: "", pwd: "" });

  const validate = () => {
    const next = { email: "", pwd: "" };
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) next.email = "Enter a valid email address.";
    if (pwd.length < 6) next.pwd = "Password must be at least 6 characters.";
    setErrors(next);
    return !next.email && !next.pwd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const user = await loginAdmin({
        email: email.trim(),
        password: pwd,
      });

      if (remember) {
        localStorage.setItem("remember_admin_email", email.trim());
      } else {
        localStorage.removeItem("remember_admin_email");
      }

      navigate("/", { replace: true, state: { user } });
    } catch (err) {
      console.error("Login failed:", err.message);
    }
  };

  const socialComingSoon = (name) => {
    alert(`${name} Sign-In coming soon 🙂`);
  };

  return (
    <div className="min-h-[calc(100vh-0px)] grid lg:grid-cols-2">
      {/* Left Branding (hidden on small) */}
      <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 500px at 20% 30%, rgba(110,86,207,0.20), transparent 60%), radial-gradient(600px 400px at 70% 70%, rgba(212,175,55,0.15), transparent 60%)",
          }}
        />
        <div className="relative max-w-lg p-10">
          <div className="flex items-center gap-3 mb-6">
            <img src="/assets/Logo.png" alt="Logo" className="h-10 w-10" />
            <div className="text-2xl font-semibold" style={{ color: COLORS.text }}>
              Sexy Soul Living — Admin
            </div>
          </div>
          <h2
            className="text-3xl font-semibold leading-tight"
            style={{ color: COLORS.text }}
          >
            Empowering Luxurious Success
          </h2>
          <p className="mt-3 text-sm leading-6" style={{ color: COLORS.text2 }}>
            Manage members, content, live events, and partner deals in one elegant
            dashboard. Log in to get started.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: "KPI", value: "MAU 21k" },
              { label: "Subs", value: "Paid 9.4k" },
              { label: "ARPU", value: "$19.95" },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded-xl p-3"
                style={{
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.ring}`,
                  color: COLORS.text,
                }}
              >
                <div className="text-xs" style={{ color: COLORS.text2 }}>
                  {k.label}
                </div>
                <div className="text-lg font-semibold mt-1">{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center px-4 py-10">
        <div
          className="w-full max-w-md rounded-2xl p-6 shadow-lg"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.ring}`,
            color: COLORS.text,
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <img src="/assets/Logo.png" alt="Logo" className="h-8 w-8" />
            <h1 className="text-xl font-semibold">Admin Login</h1>
          </div>
          <p className="text-sm mb-6" style={{ color: COLORS.text2 }}>
            Sign in with your admin credentials to access the dashboard.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs" style={{ color: COLORS.text2 }}>
                Email
              </label>
              <div className="relative mt-1">
                <MdMail
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={18}
                  style={{ color: COLORS.text2 }}
                />
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full h-11 rounded-xl pl-10 pr-3 text-sm outline-none"
                  style={{
                    backgroundColor: "#12131A",
                    color: COLORS.text,
                    border: `1px solid ${errors.email ? "#EF4444" : COLORS.ring}`,
                  }}
                />
              </div>
              {errors.email ? (
                <div className="mt-1 text-xs" style={{ color: "#EF4444" }}>
                  {errors.email}
                </div>
              ) : null}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs" style={{ color: COLORS.text2 }}>
                Password
              </label>
              <div className="relative mt-1">
                <MdLock
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={18}
                  style={{ color: COLORS.text2 }}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl pl-10 pr-10 text-sm outline-none"
                  style={{
                    backgroundColor: "#12131A",
                    color: COLORS.text,
                    border: `1px solid ${errors.pwd ? "#EF4444" : COLORS.ring}`,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  style={{ color: COLORS.text2 }}
                >
                  {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
              {errors.pwd ? (
                <div className="mt-1 text-xs" style={{ color: "#EF4444" }}>
                  {errors.pwd}
                </div>
              ) : null}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm" style={{ color: COLORS.text2 }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-[#6E56CF]"
                />
                Remember me
              </label>

              {/* If you have a real route, replace with Link to="/auth/forgot" */}
              <button
                type="button"
                onClick={() => alert("Forgot password flow coming soon")}
                className="text-sm underline"
                style={{ color: COLORS.text }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-80"
              style={{
                background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                color: COLORS.onyx,
              }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-black/40 border-t-transparent animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="h-px flex-1" style={{ backgroundColor: COLORS.ring }} />
              <div className="text-xs" style={{ color: COLORS.text2 }}>
                or continue with
              </div>
              <div className="h-px flex-1" style={{ backgroundColor: COLORS.ring }} />
            </div>

            {/* Social */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => socialComingSoon("Google")}
                className="h-11 rounded-xl border flex items-center justify-center gap-2"
                style={{ borderColor: COLORS.ring, backgroundColor: "#12131A", color: COLORS.text }}
              >
                <FcGoogle size={18} />
                <span className="text-sm">Google</span>
              </button>
              <button
                type="button"
                onClick={() => socialComingSoon("Facebook")}
                className="h-11 rounded-xl border flex items-center justify-center gap-2"
                style={{ borderColor: COLORS.ring, backgroundColor: "#12131A", color: COLORS.text }}
              >
                <FaFacebook size={18} />
                <span className="text-sm">Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => socialComingSoon("Apple")}
                className="h-11 rounded-xl border flex items-center justify-center gap-2"
                style={{ borderColor: COLORS.ring, backgroundColor: "#12131A", color: COLORS.text }}
              >
                <FaApple size={18} />
                <span className="text-sm">Apple</span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-xs text-center" style={{ color: COLORS.text2 }}>
            By continuing, you agree to our{" "}
            <button
              type="button"
              className="underline"
              onClick={() => alert("Terms coming soon")}
              style={{ color: COLORS.text }}
            >
              Terms
            </button>{" "}
            &{" "}
            <button
              type="button"
              className="underline"
              onClick={() => alert("Privacy coming soon")}
              style={{ color: COLORS.text }}
            >
              Privacy
            </button>
            .
          </div>

          {/* Optional links */}
          <div className="mt-2 text-xs text-center" style={{ color: COLORS.text2 }}>
            Don’t have an account?{" "}
            {/* If you add a real signup route, replace with <Link to="/auth/signup" …> */}
            <button
              type="button"
              className="underline"
              onClick={() => alert("Sign up flow coming soon")}
              style={{ color: COLORS.text }}
            >
              Request access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
