"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { validateEmail } from "@/lib/validation";
import { ApiError } from "@/lib/api/client";
import { fetchProducts } from "@/lib/api/products";
import { splitImages } from "@/lib/format";
import Reveal from "@/components/Reveal";

function useArtImage() {
  const [img, setImg] = useState("");
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await fetchProducts();
        if (!mounted) return;
        const first = all.find((p) => splitImages(p.image_url).length > 0);
        if (first) setImg(splitImages(first.image_url)[0]);
      } catch {
        // Art is optional — fall back to the dark panel.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return img;
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading: authLoading, isAdmin } = useAuth();
  const { notify } = useUi();
  const art = useArtImage();

  const next = searchParams.get("next") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(next);
    }
  }, [authLoading, isAuthenticated, next, router]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
    setServerError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!validateEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.password) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      await login(form.email.trim(), form.password);
      notify("Welcome back");
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setServerError("Incorrect email or password.");
        } else if (err.status === 404) {
          setServerError("No account found with that email.");
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError("Could not sign in right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nav-spacer">
      <div className="auth-shell">
        <div className="auth-shell__form">
          <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
            <Reveal>
              <p className="section-label">Welcome back</p>
              <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", marginBottom: 10 }}>
                Sign in
              </h1>
              <p style={{ color: "var(--muted)", marginBottom: 34, lineHeight: 1.7 }}>
                Pick up where you left off — track orders, manage your details
                and move through checkout faster.
              </p>

              <form onSubmit={onSubmit} noValidate>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={onChange}
                    className={errors.email ? "has-error" : ""}
                  />
                  {errors.email && <span className="field__error">{errors.email}</span>}
                </div>

                <div className="field">
                  <label htmlFor="password">Password</label>
                  <div className="field__box">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={onChange}
                      className={errors.password ? "has-error" : ""}
                      style={{ paddingRight: 64 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 12,
                        fontSize: "0.76rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        fontFamily: "var(--display)",
                      }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && <span className="field__error">{errors.password}</span>}
                </div>

                {serverError && (
                  <div
                    role="alert"
                    style={{
                      color: "var(--err)",
                      background: "rgba(192,57,43,0.07)",
                      border: "1px solid rgba(192,57,43,0.2)",
                      padding: "12px 14px",
                      borderRadius: "var(--radius)",
                      fontSize: "0.88rem",
                      marginBottom: 18,
                    }}
                  >
                    {serverError}
                  </div>
                )}

                <button className="btn btn--primary btn--block" disabled={submitting} type="submit">
                  {submitting ? (
                    <>
                      <span
                        className="spin"
                        aria-hidden="true"
                        style={{
                          display: "inline-block",
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(245,243,239,0.4)",
                          borderTopColor: "var(--bg)",
                          borderRadius: "50%",
                        }}
                      />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              <p style={{ marginTop: 24, fontSize: "0.9rem", color: "var(--muted)" }}>
                New to VANTA?{" "}
                <Link href={`/signup?next=${encodeURIComponent(next)}`} className="u-link" style={{ color: "var(--ink)", fontWeight: 600 }}>
                  Create an account
                </Link>
              </p>
              {isAdmin && (
                <p style={{ marginTop: 10, fontSize: "0.84rem", color: "var(--muted)" }}>
                  Admin session detected —{" "}
                  <Link href="/admin" className="u-link" style={{ color: "var(--accent)" }}>
                    open the admin area
                  </Link>
                </p>
              )}
            </Reveal>
          </div>
        </div>

        <div className="auth-shell__art">
          {art && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={art} alt="" />
          )}
          <div className="auth-shell__quote">
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.7,
                fontStyle: "italic",
                color: "rgba(245,243,239,0.9)",
              }}
            >
              Your wardrobe, your account, your pace — everything exactly where
              you left it.
            </p>
            <p
              style={{
                marginTop: 16,
                fontFamily: "var(--display)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                fontSize: "0.74rem",
                color: "var(--accent)",
              }}
            >
              VANTA members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}