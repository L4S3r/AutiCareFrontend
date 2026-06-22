"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact us" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-md bg-white/95 backdrop-blur-sm" : "bg-white"
      }`}
    >
      <div className="container flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5">
          <Image
            src="/images/logo-nav.png"
            alt="AutiCare"
            width={140}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === l.href
                  ? "text-[var(--color-brand-primary)] font-semibold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/app/login"
            className="btn btn-outline-light btn-sm"
            style={{ borderRadius: "0.5rem" }}
          >
            Log in
          </Link>
          <Link
            href="/app/login"
            className="btn btn-primary btn-sm"
            style={{ borderRadius: "0.5rem" }}
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)]"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[var(--color-border)] animate-fade-in-up">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  pathname === l.href
                    ? "text-[var(--color-brand-primary)] bg-[var(--color-sky-light)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
              <Link href="/app/login" className="btn btn-outline-light flex-1 text-sm">
                Log in
              </Link>
              <Link href="/app/login" className="btn btn-primary flex-1 text-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
