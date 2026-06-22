"use client";
import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Language } from "../types";
import { TRANSLATIONS } from "../data";

interface TestimonialsProps {
  language: Language;
}

export default function Testimonials({ language }: TestimonialsProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === "ar";

  const testimonials = [
    {
      quote: t.test1Quote,
      author: t.test1Author,
      avatar: "/images/avatar-1.png",
    },
    {
      quote: t.test2Quote,
      author: t.test2Author,
      avatar: "/images/avatar-2.png",
    },
    {
      quote: t.test3Quote,
      author: t.test3Author,
      avatar: "/images/avatar-3.png",
    },
    {
      quote: t.test4Quote,
      author: t.test4Author,
      avatar: "/images/avatar-4.png",
    },
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden" id="testimonials-section">
      {/* Decorative dots in the background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <svg className="absolute right-8 bottom-8 w-48 h-48 text-sky-400" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {isRtl ? (
              <>
                آراء شركائنا و<span className="italic bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>عائلاتنا</span>
              </>
            ) : (
              <>
                <span className="italic bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Testimonials</span>
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
            {t.testimonialSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((test, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -3 }}
              className={`bg-sky-50/30 border border-sky-100 hover:border-sky-300 hover:shadow-md transition-all duration-300 p-6 rounded-3xl flex gap-5 items-start ${
                isRtl ? "flex-row-reverse text-right" : "flex-row text-left"
              }`}
            >
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-sky-100 shadow-sm">
                <Image
                  src={test.avatar}
                  alt={test.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed italic">
                  "{test.quote}"
                </p>
                <p className="text-[11px] font-black text-slate-500 tracking-wide uppercase">
                  - {test.author}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
