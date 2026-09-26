"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOtp, signup } from "@/lib/api/auth";
import { validateName, validateEmail, validatePassword, validatePhone, validateOtp } from "@/lib/validation";
import { isApiError } from "@/lib/api/client";
import { fetchProducts } from "@/lib/api/products";
import { splitImages } from "@/lib/format";
import { useLocale } from "@/context/LocaleContext";
import OTPInput from "@/components/OTPInput";
import Reveal from "@/components/Reveal";
import Loader from "@/components/Loader";

const OTP_TTL_SECONDS = 60;

function userFacingError(err, fallback, t) {
  if (isApiError(err) && err.details?.length) {
    return err.details.join(" ");
  }
  if (isApiError(err)) {
    if (err.status === 429) return t("auth.tooMany");
    if (err.status === 409) return t("auth.accountExists");
    return err.message;
  }
  return fallback;
}

function AuthArt({ t }) {
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
          {t("auth.quoteSignup")}
        </p>
        <p style={{ marginTop: 16, fontFamily: "var(--display)", letterSpacing: "0.3em", textTransform: "uppercase", fontSize: "0.74rem", color: "var(--accent)" }}>
          {t("auth.quoteSignupTag")}
        </p>
      </div>
    </div>
  );
}

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const next = searchParams.get("next") || "/";

  const STEPS = [t("auth.stepDetails"), t("auth.stepVerify"), t("auth.stepDone")];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", otp: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
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
    if (!validateName(form.name)) er.name = t("auth.nameError");
    if (!validateEmail(form.email)) er.email = t("auth.emailInvalid");
    if (!validatePassword(form.password)) er.password = t("auth.passwordError");
    if (!validatePhone(form.phone)) er.phone = t("auth.phoneError");
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
      setStep(2);
      startCountdown();
    } catch (err) {
      setServerError(userFacingError(err, t("auth.sendFail"), t));
    } finally {
      setSending(false);
    }
  };

  const submitSignup = async () => {
    if (!validateOtp(form.otp)) {
      setErrors((er) => ({ ...er, otp: t("auth.otpInvalid") }));
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
      setServerError(userFacingError(err, t("auth.signupFail"), t));
      setErrors((er) => ({ ...er, otp: "" }));
    } finally {
      setSubmitting(false);
    }
  };

  const goLogin = () => {
    router.push(`/login?next=${encodeURIComponent(next)}`);
  };

  return (
    <div className="auth-shell">
      <div className="auth-shell__form">
        <div style={{ maxWidth: 460, width: "100%", margin: "0 auto" }}>
          <Reveal eager>
            <div className="auth-stepper" aria-hidden={step === 3}>
              {STEPS.map((label, i) => {
                const n = i + 1;
                const done = step > n;
                const current = step === n;
                return (
                  <React.Fragment key={label}>
                    <div className="auth-stepper__item">
                      <span
                        className={`auth-stepper__dot ${done || current ? "is-on" : ""}`}
                      >
                        {done ? "✓" : n}
                      </span>
                      <span className={`auth-stepper__label ${current ? "is-on" : ""}`}>
                        {label}
                      </span>
                    </div>
                    {n < STEPS.length && (
                      <span className={`auth-stepper__line ${done ? "is-on" : ""}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {step === 3 ? (
              <div>
                <p className="section-label">{t("auth.done")}</p>
                <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", marginBottom: 12 }}>
                  {t("auth.youreIn")}
                </h1>
                <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 28 }}>
                  {t("auth.accountReady")}
                </p>
                <button className="btn btn--primary btn--block" onClick={goLogin}>
                  {t("auth.goSignin")}
                </button>
              </div>
            ) : (
              <>
                <p className="section-label">{t("auth.newHere")}</p>
                <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", marginBottom: 10 }}>
                  {t("nav.createAccount")}
                </h1>
                <p style={{ color: "var(--muted)", marginBottom: 30, lineHeight: 1.7 }}>
                  {t("auth.tellUs")}
                </p>

                {serverError && (
                  <div className="form-alert form-alert--err" role="alert">
                    {serverError}
                  </div>
                )}

                {step === 1 ? (
                  <div>
                    <div className="field">
                      <label htmlFor="signup-name">{t("auth.name")}</label>
                      <input id="signup-name" name="name" type="text" autoComplete="name" placeholder="Jordan Smith" value={form.name} onChange={onChange} className={errors.name ? "has-error" : ""} />
                      {errors.name && <span className="field__error">{errors.name}</span>}
                    </div>
                    <div className="field">
                      <label htmlFor="signup-email">{t("auth.email")}</label>
                      <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={onChange} className={errors.email ? "has-error" : ""} />
                      {errors.email && <span className="field__error">{errors.email}</span>}
                    </div>
                    <div className="field">
                      <label htmlFor="signup-phone">{t("auth.phone")}</label>
                      <input id="signup-phone" name="phone" type="tel" autoComplete="tel" placeholder="+1 555 000 1234" value={form.phone} onChange={onChange} className={errors.phone ? "has-error" : ""} />
                      {errors.phone && <span className="field__error">{errors.phone}</span>}
                    </div>
                    <div className="field">
                      <label htmlFor="signup-password">{t("auth.password")}</label>
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
                          style={{ paddingInlineEnd: 72 }}
                        />
                        <button
                          type="button"
                          className="field__toggle"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                        >
                          {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                        </button>
                      </div>
                      {errors.password && <span className="field__error">{errors.password}</span>}
                    </div>

                    <button className="btn btn--primary btn--block" onClick={requestOtp} disabled={sending}>
                      {sending ? t("auth.sendingCode") : t("auth.sendCode")}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ marginBottom: 18, color: "var(--muted)", lineHeight: 1.6 }}>
                      {t("auth.otpSentTo", { email: form.email })}
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
                      {submitting ? t("auth.creatingAccount") : t("auth.submitSignup")}
                    </button>

                    <div style={{ marginTop: 18, textAlign: "center", fontSize: "0.86rem", color: "var(--muted)" }}>
                      {countdown > 0 ? (
                        <span>{t("auth.resendIn", { n: countdown })}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={requestOtp}
                          disabled={sending}
                          className="u-link"
                          style={{ color: "var(--ink)", fontWeight: 600 }}
                        >
                          {t("auth.resendCode")}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <p style={{ marginTop: 22, fontSize: "0.9rem", color: "var(--muted)" }}>
                  {step === 1 ? (
                    <>
                      {t("auth.haveAccount")}{" "}
                      <Link href={`/login?next=${encodeURIComponent(next)}`} className="u-link" style={{ color: "var(--ink)", fontWeight: 600 }}>
                        {t("nav.signin")}
                      </Link>
                    </>
                  ) : (
                    <>
                      {t("auth.otherEmail")}{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setForm((f) => ({ ...f, otp: "" }));
                        }}
                        className="u-link"
                        style={{ color: "var(--ink)", fontWeight: 600 }}
                      >
                        {t("auth.goBack")}
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </Reveal>
        </div>
      </div>
      <AuthArt t={t} />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<Loader label="…" />}>
      <SignupInner />
    </Suspense>
  );
}
