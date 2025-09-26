import React, { useEffect, useRef } from "react";

// Loads Google Translate widget once and provides a single mount point
const GoogleTranslate = () => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const SCRIPT_ID = "google-translate-script";

    // Callback must be on window for Google to call
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function googleTranslateElementInit() {
        try {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en" },
            "google_translate_element"
          );

          // Apply previously selected language if any
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

          // Persist changes
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

    // Inject script once
    const existing = document.getElementById(SCRIPT_ID);
    if (!existing) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.type = "text/javascript";
      s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div id="google_translate_element" className="gt-container" aria-label="Language selector" />
  );
};

export default GoogleTranslate;


