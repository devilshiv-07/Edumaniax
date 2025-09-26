import React, { useEffect, useRef } from "react";

// Initializes Google Translate and mounts into an existing placeholder
const GoogleTranslate = () => {
  const initializedRef = useRef(false);

  useEffect(() => {
    // Wait for mount points (desktop or mobile) and initialize once
    let attemptsForMount = 0;
    const mountTimer = setInterval(() => {
      const desktop = document.getElementById("google_translate_element_desktop");
      const mobile = document.getElementById("google_translate_element_mobile");
      const el = desktop || mobile;
      attemptsForMount += 1;
      if (el) {
        // Ensure only one active mount has the expected id
        const existing = document.getElementById("google_translate_element");
        if (existing !== el) {
          if (existing) existing.removeAttribute("id");
          el.id = "google_translate_element";
        }
        if (window.google && window.google.translate) {
          window.googleTranslateElementInit?.();
        }
        // do not clear timer immediately, keep syncing id for a few cycles
        if (attemptsForMount > 5) clearInterval(mountTimer);
      } else if (attemptsForMount > 60) {
        clearInterval(mountTimer);
      }
    }, 200);

    const SCRIPT_ID = "google-translate-script";

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function googleTranslateElementInit() {
        try {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en" },
            "google_translate_element"
          );

          const saved = localStorage.getItem("preferredLang");
          if (saved && saved !== "") {
            const tryApply = () => {
              const select = document.querySelector("#google_translate_element select.goog-te-combo");
              if (select && select.value !== saved) {
                select.value = saved;
                select.dispatchEvent(new Event("change"));
                return true;
              }
              return !!select;
            };
            let attempts = 0;
            const t = setInterval(() => {
              attempts += 1;
              if (tryApply() || attempts > 20) clearInterval(t);
            }, 150);
          }

          const persistLang = () => {
            const select = document.querySelector("#google_translate_element select.goog-te-combo");
            if (select) {
              const handler = () => localStorage.setItem("preferredLang", select.value || "");
              select.addEventListener("change", handler);
            }
          };
          setTimeout(persistLang, 500);
        } catch (_e) {}
      };
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      const existing = document.getElementById(SCRIPT_ID);
      if (!existing) {
        const s = document.createElement("script");
        s.id = SCRIPT_ID;
        s.type = "text/javascript";
        s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        s.async = true;
        document.body.appendChild(s);
      } else if (window.google && window.google.translate) {
        // If script exists and google is ready, initialize immediately
        window.googleTranslateElementInit?.();
      }
    }

    return () => {
      clearInterval(mountTimer);
    };
  }, []);

  return null;
};

export default GoogleTranslate;


