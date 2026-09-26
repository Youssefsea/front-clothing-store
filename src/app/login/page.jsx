"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { useLocale } from "@/context/LocaleContext";
import { validateEmail } from "@/lib/validation";
import { ApiError } from "@/lib/api/client";
import { fetchProducts } from "@/lib/api/products";
import { splitImages } from "@/lib/format";
import Reveal from "@/components/Reveal";
import Loader from "@/components/Loader";

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
  const { t } = useLocale();
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
    if (!validateEmail(form.email)) nextErrors.email = t("auth.emailInvalid");
    if (!form.password) nextErrors.password = t("auth.passwordRequired");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      await login(form.email.trim(), form.password);
      notify(t("auth.welcomeBack"));
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setServerError(t("auth.badCredentials"));
        } else if (err.status === 404) {
          setServerError(t("auth.noAccount"));
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError(t("auth.cantSignin"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-shell__form">
        <div style={{ maxWidth: 420, width: "100%", margin: "0 auto" }}>
          <Reveal eager>
            <p className="section-label">{t("auth.welcomeBack")}</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", marginBottom: 10 }}>
              {t("nav.signin")}
            </h1>
            <p style={{ color: "var(--muted)", marginBottom: 34, lineHeight: 1.7 }}>
              {t("auth.loginBody")}
            </p>

            <form onSubmit={onSubmit} noValidate>
              <div className="field">
                <label htmlFor="email">{t("auth.email")}</label>
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
                <label htmlFor="password">{t("auth.password")}</label>
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

              {serverError && (
                <div className="form-alert form-alert--err" role="alert">
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
                    {t("auth.signingIn")}
                  </>
                ) : (
                  t("nav.signin")
                )}
              </button>
            </form>

            <p style={{ marginTop: 24, fontSize: "0.9rem", color: "var(--muted)" }}>
              {t("auth.newPrompt")}{" "}
              <Link href={`/signup?next=${encodeURIComponent(next)}`} className="u-link" style={{ color: "var(--ink)", fontWeight: 600 }}>
                {t("nav.createAccount")}
              </Link>
            </p>
            {isAdmin && (
              <p style={{ marginTop: 10, fontSize: "0.84rem", color: "var(--muted)" }}>
                {t("auth.adminSession")}{" "}
                <Link href="/admin" className="u-link" style={{ color: "var(--accent)" }}>
                  {t("auth.openAdmin")}
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
            {t("auth.quoteLogin")}
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
            {t("auth.quoteLoginTag")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loader label="…" />}>
      <LoginInner />
    </Suspense>
  );
}
