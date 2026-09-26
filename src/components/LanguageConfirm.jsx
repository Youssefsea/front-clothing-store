"use client";

import React, { useEffect, useId, useRef } from "react";
import { useLocale, LANGS } from "@/context/LocaleContext";

export default function LanguageConfirm() {
  const { pendingLang, confirmLang, cancelLang, t, lang } = useLocale();
  const confirmBtnRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!pendingLang) return undefined;
    const prev = document.activeElement;
    confirmBtnRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") cancelLang();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (prev && typeof prev.focus === "function") prev.focus();
    };
  }, [pendingLang, cancelLang]);

  if (!pendingLang) return null;

  const target = LANGS[pendingLang];
  const previewDir = target.dir;

  return (
    <div
      className="lang-confirm"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) cancelLang();
      }}
    >
      <div
        className="lang-confirm__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        dir={previewDir}
        lang={pendingLang}
      >
        <p className="lang-confirm__eyebrow" id={titleId}>
          {t("lang.switchTitle")}
        </p>
        <h2 className="lang-confirm__title">
          {pendingLang === "ar" ? t("lang.switchToAr") : t("lang.switchToEn")}
        </h2>
        <p className="lang-confirm__body" id={descId}>
          {t("lang.switchBody", { lang: target.label })}
        </p>
        <div className="lang-confirm__actions">
          <button
            type="button"
            className="btn btn--outline btn--dark-text btn--sm"
            onClick={cancelLang}
          >
            {t("lang.cancel")}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className="btn btn--primary btn--sm"
            onClick={confirmLang}
          >
            {t("lang.confirm")}
          </button>
        </div>
        <p className="lang-confirm__hint">
          {t("lang.current", { lang: LANGS[lang].label })}
        </p>
      </div>
    </div>
  );
}
