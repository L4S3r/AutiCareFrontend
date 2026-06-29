"use client";
import Link from "next/link";
import Image from "next/image";
import { Language } from "../types";
import { TRANSLATIONS } from "../data";

interface FooterProps {
  language: Language;
  setCurrentTab?: (tab: string) => void;
}

function SocialIcon({ type }: { type: string }) {
  const paths: Record<string, string> = {
    facebook:
      "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    instagram:
      "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z",
    linkedin:
      "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
    youtube:
      "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z",
  };
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d={paths[type]} />
    </svg>
  );
}

export default function Footer({ language, setCurrentTab }: FooterProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === "ar";

  const footerLinks = {
    [t.footerSupport]: [
      { href: "#", label: t.footerGettingStarted },
      { href: "#", label: t.footerFAQs },
      { href: "#", label: t.footerHelpArticles },
      { href: "#", label: t.footerReportIssue },
      { href: "#", label: t.footerContactHelpDesk },
    ],
    [t.footerPlatform]: [
      { href: "#", label: t.footerFeatures },
      { href: "#", label: t.footerPricing },
      { href: "#", label: t.footerAboutUs },
    ],
    [t.footerLegal]: [
      { href: "#", label: t.footerTerms },
      { href: "#", label: t.footerPrivacy },
      { href: "#", label: t.footerCookieNotice },
      { href: "#", label: t.footerHIPAA },
    ],
  };

  const handleLinkClick = (e: React.MouseEvent, label: string) => {
    if (!setCurrentTab) return;

    if (label === t.footerFeatures) {
      e.preventDefault();
      setCurrentTab("features");
    } else if (label === t.footerPricing) {
      e.preventDefault();
      setCurrentTab("pricing");
    } else if (label === t.footerContactHelpDesk || label === t.footerReportIssue) {
      e.preventDefault();
      setCurrentTab("contact");
    } else if (label === t.footerGettingStarted) {
      e.preventDefault();
      setCurrentTab("home");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 150);
    } else if (label === t.footerFAQs) {
      e.preventDefault();
      setCurrentTab("pricing");
      setTimeout(() => {
        const element = document.getElementById("faqs");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    } else if (label === t.footerHelpArticles) {
      e.preventDefault();
      setCurrentTab("home");
      setTimeout(() => {
        const element = document.getElementById("testimonials-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } else if (label === t.footerAboutUs) {
      e.preventDefault();
      setCurrentTab("home");
      setTimeout(() => {
        const element = document.getElementById("home-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } else if (label === t.footerTerms) {
      e.preventDefault();
      setCurrentTab("legal-terms");
    } else if (label === t.footerPrivacy) {
      e.preventDefault();
      setCurrentTab("legal-privacy");
    } else if (label === t.footerCookieNotice) {
      e.preventDefault();
      setCurrentTab("legal-cookie");
    } else if (label === t.footerHIPAA) {
      e.preventDefault();
      setCurrentTab("legal-hipaa");
    }
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <Link
                href="/"
                onClick={(e) => {
                  if (setCurrentTab) {
                    e.preventDefault();
                    setCurrentTab("home");
                  }
                }}
                className="flex items-center gap-1 mb-4"
              >
                <Image
                  src="/images/logo-footer.png"
                  alt="AutiCare"
                  width={100}
                  height={80}
                  className="h-16 w-auto"
                />
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
                {t.quoteText}
              </p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      onClick={(e) => handleLinkClick(e, l.label)}
                      className="text-xs text-slate-500 hover:text-sky-500 transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social icons at bottom-left */}
          <div className={`flex gap-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            {["facebook", "instagram", "linkedin", "youtube"].map((s) => {
              const hrefs: Record<string, string> = {
                instagram: "https://www.instagram.com/auticare.ai/",
                facebook: "https://www.facebook.com/profile.php?id=61591280124719",
                youtube: "https://www.youtube.com/@AutiCare-j7y",
                linkedin: "https://www.linkedin.com/in/auti-care-41a336419/",
              };
              return (
                <a
                  key={s}
                  href={hrefs[s] || "#"}
                  target={hrefs[s] ? "_blank" : undefined}
                  rel={hrefs[s] ? "noopener noreferrer" : undefined}
                  className="text-slate-500 hover:text-sky-500 transition-colors duration-200 flex items-center justify-center p-1"
                  aria-label={s}
                >
                  <SocialIcon type={s} />
                </a>
              );
            })}
          </div>
          <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{t.footerRights}</p>
        </div>
      </div>
    </footer>
  );
}
