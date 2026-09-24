"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOtp, signup } from "@/lib/api/auth";
import { validateName, validateEmail, validatePassword, validatePhone, validateOtp } from "@/lib/validation";
import { ApiError, isApiError } from "@/lib/api/client";
import { fetchProducts } from "@/lib/api/products";
import { splitImages } from "@/lib/format";
import OTPInput from "@/components/OTPInput";
import Reveal from "@/components/Reveal";

const OTP_TTL_SECONDS = 60;

function userFacingError(err, fallback) {
  if (isApiError(err) && err.details?.length) {
    return err.details.join(" ");
  }
  if (isApiError(err)) {
    if (err.status === 429) return "Too many attempts. Please wait a moment, then try again.";
    if (err.status === 409) return "This account already exists. Try signing in instead.";
    return err.message;
  }
  return fallback;
}

function AuthArt() {
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
        // optional
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="auth-shell__art">
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" />
      )}
      <div className="auth-shell__quote">
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, fontStyle: "italic", color: "rgba(245,243,239,0.9)" }}>
          Join the list. Early access to drops, member pricing and pieces built
          to stay in rotation.
        </p>
        <p style={{ marginTop: 16, fontFamily: "var(--display)", letterSpacing: "0.3em", textTransform: "uppercase", fontSize: "0.74rem", color: "var(--accent)" }}>
          VANTA membership
        </p>
      </div>
    </div>
  );
}

const STEPS = ["Details", "Verify", "You're in"];

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", otp: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCountdown = () => {
    setCountdown(OTP_TTL_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
    setServerError("");
  };

  const validateStep1 = () => {
    const er = {};
    if (!validateName(form.name)) er.name = "Name must be between 3 and 100 characters.";
    if (!validateEmail(form.email)) er.email = "Enter a valid email address.";
    if (!validatePassword(form.password)) er.password = "Password must be 6–50 characters.";
    if (!validatePhone(form.phone)) er.phone = "Phone must be 10–15 digits.";
    return er;
  };

  const requestOtp = async () => {
    const er = validateStep1();
    setErrors(er);
    if (Object.keys(er).length > 0) return;

    setSending(true);
    setServerError("");
    try {
      await sendOtp(form.email.trim(), form.phone);
      setOtpSent(true);
      setStep(2);
      startCountdown();
    } catch (err) {
      setServerError(userFacingError(err, "Could not send the code. Please try again."));
    } finally {
      setSending(false);
    }
  };

  const submitSignup = async () => {
    if (!validateOtp(form.otp)) {
      setErrors((er) => ({ ...er, otp: "Enter the 6-digit code." }));
      return;
    }
    setSubmitting(true);
    setServerError("");
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone,
        otp: form.otp,
      });
      setStep(3);
    } catch (err) {
      setServerError(userFacingError(err, "Signup failed. Please try again."));
      setErrors((er) => ({ ...er, otp: "" }));
    } finally {
      setSubmitting(false);
    }
  };

  const goLogin = () => {
    router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  return (
    <div className="nav-spacer">
      <div className="auth-shell">
        <div className="auth-shell__form">
          <div style={{ maxWidth: 460, width: "100%", margin: "0 auto" }}>
            <Reveal>
              {/* Stepper */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
                {STEPS.map((label, i) => {
                  const n = i + 1;
                  const done = step > n;
                  const current = step === n;
                  return (
                    <React.Fragment key={label}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            border: `1px solid ${done || current ? "var(--ink)" : "var(--line)"}`,
                            background: done || current ? "var(--ink)" : "transparent",
                            color: done || current ? "var(--bg)" : "var(--muted)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            fontFamily: "var(--display)",
                          }}
                        >
                          {done ? "✓" : n}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--display)",
                            fontSize: "0.72rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: current ? "var(--ink)" : "var(--muted)",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                      {n < STEPS.length && (
                        <span style={{ flex: 1, height: 1, background: done ? "var(--ink)" : "var(--line)", minWidth: 24 }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {step === 3 ? (
                <div>
                  <p className="section-label">Done</p>
                  <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", marginBottom: 12 }}>
                    You&apos;re in.
                  </h1>
                  <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 28 }}>
                    Your VANTA account is ready. Sign in to start filling
                    your bag.
                  </p>
                  <button className="btn btn--primary btn--block" onClick={goLogin}>
                    Go to sign in
                  </button>
                </div>
              ) : (
                <>
                  <p className="section-label">New here</p>
                  <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", marginBottom: 10 }}>
                    Create your account
                  </h1>
                  <p style={{ color: "var(--muted)", marginBottom: 30, lineHeight: 1.7 }}>
                    Tell us who you are, verify your email, and you&apos;re in.
                  </p>

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

                  {step === 1 ? (
                    <div>
                      <div className="field">
                        <label htmlFor="signup-name">Full name</label>
                        <input id="signup-name" name="name" type="text" autoComplete="name" placeholder="Jordan Smith" value={form.name} onChange={onChange} className={errors.name ? "has-error" : ""} />
                        {errors.name && <span className="field__error">{errors.name}</span>}
                      </div>
                      <div className="field">
                        <label htmlFor="signup-email">Email</label>
                        <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={onChange} className={errors.email ? "has-error" : ""} />
                        {errors.email && <span className="field__error">{errors.email}</span>}
                      </div>
                      <div className="field">
                        <label htmlFor="signup-phone">Phone</label>
                        <input id="signup-phone" name="phone" type="tel" autoComplete="tel" placeholder="+1 555 000 1234" value={form.phone} onChange={onChange} className={errors.phone ? "has-error" : ""} />
                        {errors.phone && <span className="field__error">{errors.phone}</span>}
                      </div>
                      <div className="field">
                        <label htmlFor="signup-password">Password</label>
                        <div className="field__box">
                          <input
                            id="signup-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="6–50 characters"
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

                      <button className="btn btn--primary btn--block" onClick={requestOtp} disabled={sending}>
                        {sending ? "Sending code…" : "Send verification code"}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p style={{ marginBottom: 18, color: "var(--muted)", lineHeight: 1.6 }}>
                        We sent a 6-digit code to{" "}
                        <strong style={{ color: "var(--ink)" }}>{form.email}</strong>.
                      </p>
                      <div className="field" style={{ textAlign: "center" }}>
                        <OTPInput
                          value={form.otp}
                          onChange={(val) => {
                            setForm((f) => ({ ...f, otp: val }));
                            setErrors((er) => ({ ...er, otp: "" }));
                          }}
                        />
                        {errors.otp && <span className="field__error">{errors.otp}</span>}
                      </div>

                      <button className="btn btn--primary btn--block" onClick={submitSignup} disabled={submitting}>
                        {submitting ? "Creating account…" : "Create account"}
                      </button>

                      <div style={{ marginTop: 18, textAlign: "center", fontSize: "0.86rem", color: "var(--muted)" }}>
                        {countdown > 0 ? (
                          <span>Resend code in {countdown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={requestOtp}
                            disabled={sending}
                            className="u-link"
                            style={{ color: "var(--ink)", fontWeight: 600 }}
                          >
                            Resend the code
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <p style={{ marginTop: 22, fontSize: "0.9rem", color: "var(--muted)" }}>
                    {step === 1 ? (
                      <>
                        Already have an account?{" "}
                        <Link href={`/login?next=${encodeURIComponent(next)}`} className="u-link" style={{ color: "var(--ink)", fontWeight: 600 }}>
                          Sign in
                        </Link>
                      </>
                    ) : (
                      <>
                        Need a different email?{" "}
                        <button type="button" onClick={() => { setOtpSent(false); setStep(1); setForm((f) => ({ ...f, otp: "" })); }} className="u-link" style={{ color: "var(--ink)", fontWeight: 600 }}>
                          Go back
                        </button>
                      </>
                    )}
                  </p>
                </>
              )}
            </Reveal>
          </div>
        </div>
        <AuthArt />
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="nav-spacer" />}>
      <SignupInner />
    </Suspense>
  );
}