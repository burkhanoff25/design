"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Instagram, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Portfolio</h3>
            <p className="text-muted-foreground">
              Showcasing creative graphic and motion design work with passion and precision.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("home")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("portfolio")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("portfolio")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/portfolio?category=graphic" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("graphic_design")}
                </Link>
              </li>
              <li>
                <Link href="/portfolio?category=motion" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("motion_design")}
                </Link>
              </li>
              <li>
                <Link href="/portfolio?category=ui-ux" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("ui_ux")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("contact")}</h3>
            <p className="text-muted-foreground">info@designportfolio.com</p>
            <div className="flex space-x-4">
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin size={20} />
              </Link>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github size={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
          <p>© {currentYear} Portfolio. {t("copyright")}.</p>
        </div>
      </div>
    </footer>
  );
}