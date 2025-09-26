import React, { useEffect, useRef } from "react";

// Initializes Google Translate once into an inner container (#gt-widget)
// and moves that inner container between desktop and mobile mounts safely.
const GoogleTranslate = () => {
  const scriptLoadedRef = useRef(false);
  const widgetContainerRef = useRef(null); // <div id="gt-widget"> that Google fills
  const activeMountRef = useRef(null); // current mount element (desktop/mobile)

  useEffect(() => {
    // Create widget container once; this node will be moved between mounts
    if (!widgetContainerRef.current) {
      widgetContainerRef.current = document.createElement("div");
      widgetContainerRef.current.id = "gt-widget";
    }

    const selectMount = (preferMobile) => {
      const desktop = document.getElementById("google_translate_element_desktop");
      const mobile = document.getElementById("google_translate_element_mobile");
      return preferMobile ? (mobile || desktop) : (desktop || mobile);
    };

    const moveWidgetTo = (mount) => {
      if (!mount) return;
      // Attach our widget container under the target mount
      try {
        mount.appendChild(widgetContainerRef.current);
        activeMountRef.current = mount;
      } catch {}
    };

    const initIfNeeded = () => {
      if (!(window.google && window.google.translate)) return;
      // Initialize only once into our inner container
      if (!widgetContainerRef.current.dataset.initialized) {
        try {
          new window.google.translate.TranslateElement({ pageLanguage: "en" }, "gt-widget");
          widgetContainerRef.current.dataset.initialized = "true";
        } catch {}

        const saved = localStorage.getItem("preferredLang");
        if (saved) {
          const tryApply = () => {
            const select = widgetContainerRef.current.querySelector("select.goog-te-combo");
            if (!select) return false;
            if (select.value !== saved) {
              select.value = saved;
              select.dispatchEvent(new Event("change"));
            }
            return true;
          };
          let attempts = 0;
          const t = setInterval(() => {
            if (tryApply() || ++attempts > 20) clearInterval(t);
          }, 150);
        }

        setTimeout(() => {
          const select = widgetContainerRef.current.querySelector("select.goog-te-combo");
          if (select) {
            select.addEventListener("change", () => {
              localStorage.setItem("preferredLang", select.value || "");
            });
          }
        }, 500);
      }
    };

    // Load Google script once
    const SCRIPT_ID = "google-translate-script";
    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement("script");
        s.id = SCRIPT_ID;
        s.type = "text/javascript";
        s.src = "//translate.google.com/translate_a/element.js?cb=__gt_init";
        s.async = true;
        // Attach a small global shim to init after script load
        window.__gt_init = () => {
          // Move to current preferred mount then init
          moveWidgetTo(selectMount(false));
          initIfNeeded();
        };
        document.body.appendChild(s);
      } else {
        moveWidgetTo(selectMount(false));
        initIfNeeded();
      }
    } else {
      moveWidgetTo(selectMount(false));
      initIfNeeded();
    }

    // Handle sidebar open/close to move the existing widget container
    const onOpen = () => {
      setTimeout(() => {
        moveWidgetTo(selectMount(true));
        initIfNeeded();
      }, 50);
    };
    const onClose = () => {
      setTimeout(() => {
        moveWidgetTo(selectMount(false));
        initIfNeeded();
      }, 50);
    };
    window.addEventListener("gt:sidebar-open", onOpen);
    window.addEventListener("gt:sidebar-close", onClose);

    return () => {
      window.removeEventListener("gt:sidebar-open", onOpen);
      window.removeEventListener("gt:sidebar-close", onClose);
    };
  }, []);

  return null;
};

export default GoogleTranslate;


