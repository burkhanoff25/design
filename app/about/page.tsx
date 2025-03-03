"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";

export default function AboutPage(): React.ReactElement {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">{t("about")}</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          We are a creative design studio specializing in graphic design, motion design, and UI/UX solutions.
        </p>
        <p className="text-lg mb-4">
          Our team of experienced designers and developers work together to create beautiful, functional, and user-friendly digital experiences.
        </p>
      </div>
    </div>
  );
}