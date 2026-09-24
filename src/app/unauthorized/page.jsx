"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";

export default function UnauthorizedPage() {
  const { t } = useLocale();
  return (
    <div className="nav-spacer">
      <div className="container page">
        <Reveal>
          <EmptyState
            icon="!"
            title={t("unauth.title")}
            body={t("unauth.body")}
            action={
              <div className="page-actions" style={{ justifyContent: "center" }}>
                <Link href="/login" className="btn btn--primary btn--sm">{t("nav.signin")}</Link>
                <Link href="/" className="btn btn--outline btn--dark-text btn--sm">{t("unauth.goHome")}</Link>
              </div>
            }
          />
        </Reveal>
      </div>
    </div>
  );
}