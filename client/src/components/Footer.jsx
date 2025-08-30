import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Linkedin, Instagram } from "lucide-react";

const AnimatedAIImage = ({ src, alt, className }) => {
  const [isLaptop, setIsLaptop] = React.useState(window.innerWidth >= 1024); 

  React.useEffect(() => {
    const handleResize = () => {
      setIsLaptop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLaptop) {
    // Laptop/Desktop: Mouse-controlled rotation
    const x = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 120, damping: 20 });
    const rotate = useTransform(springX, [-1, 1], [-15, 15]); 

    React.useEffect(() => {
      const handleMouseMove = (event) => {
        const centerX = window.innerWidth / 2;
        const xPct = (event.clientX - centerX) / centerX; // -1 to 1
        x.set(xPct);
      };

      const handleMouseLeave = () => {
        x.set(0);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, [x]);

    return (
      <motion.img
        src={src}
        alt={alt}
        className={className}
        style={{ rotate }}
      />
    );
  } else {
    // Mobile/Tablet: Self-playing animation loop
    return (
      <motion.img
        src={src}
        alt={alt}
        className={className}
        animate={{ rotate: [0, 10, -20, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }
};

// Export this as named (not default)
export { AnimatedAIImage };

const getFooterImageForGrade = (userClass) => {
  if (!userClass) return "/4.gif";

  const gradeNumber = parseInt(String(userClass).replace(/\D/g, ""), 10);

  if (isNaN(gradeNumber)) return "/4.gif";

  return gradeNumber >= 9 ? "/ai.png" : "/4.gif";
};

const Footer = () => {
  const { user } = useAuth();
  const footerImage = getFooterImageForGrade(user?.userClass);
  const gradeNumber = user?.userClass
    ? parseInt(String(user.userClass).replace(/\D/g, ""), 10)
    : NaN;

  const footerImageMarginClass =
    gradeNumber >= 9 && !isNaN(gradeNumber) ? "mb-12" : "";

  return (
    <div className="w-full mt-30 xl:mt-60 lg:mt-60">
      {/* Wave Section with Teddy */}
      <div className="relative w-full">
        <div
          className="w-full h-50 p-0 m-0 sm:h-56 md:h-64 lg:h-72 xl:h-90 2xl:h-120 bg-contain bg-center bg-no-repeat relative"
          style={{
            backgroundImage: "url('/footerBG.svg')",
            backgroundSize: "contain",
            backgroundPosition: "center bottom",
          }}
        >
          <div className="absolute -z-20 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 sm:translate-y-10 md:translate-y-12 lg:translate-y-16">
            <div className="w-62 h-62 sm:w-32 sm:h-32 md:w-100 md:h-110 lg:w-147 lg:h-147 xl:w-170 xl:h-170 2xl:w-180 2xl:h-180">
              {footerImage === "/ai.png" ? (
                <AnimatedAIImage
                  src={footerImage}
                  alt="AI learning mascot"
                  className={`w-full h-full object-contain ${footerImageMarginClass}`}
                />
              ) : (
                <img
                  src={footerImage}
                  alt="Mascot with educational icons"
                  className={`w-full h-full object-contain ${footerImageMarginClass}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <footer
        className="w-full -mt-5 text-white pt-12 sm:pt-16 md:pt-20 lg:pt-24 xl:pt-28 2xl:pt-32 pb-8 lg:pb-12 relative"
        style={{ backgroundColor: "#068F36" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h2 className="text-xl font-bold">
                  Lyfshilp Academy Pvt. Ltd. (Powered by Agility AI Pvt. Ltd.)
                </h2>
                <div className="flex gap-2">
                  <a
                    href="https://www.linkedin.com/company/100047077"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 text-[#068F36]" />
                  </a>
                  <a
                    href="https://www.instagram.com/edumaniaxx?igsh=eW5oaGdyb203NWtk&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-[#068F36]" />
                  </a>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-md opacity-90">
                Transform your life through learning. Explore expert-led
                programs designed for growth.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 fill-current flex-shrink-0 opacity-80"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <span className="text-sm">Edumaniax@lyfshilpacademy.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 fill-current flex-shrink-0 opacity-80"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <span className="text-sm">+91 8595034205</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-8 sm:gap-14">
              <div>
                <h3 className="text-lg font-semibold mb-4">Explore</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/about" className="text-sm hover:opacity-80">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/courses" className="text-sm hover:opacity-80">
                      Courses
                    </Link>
                  </li>
                  <li>
                    <Link to="/blogs" className="text-sm hover:opacity-80">
                      Blogs
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/privacy-policy"
                      className="text-sm hover:opacity-80"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/terms-conditions"
                      className="text-sm hover:opacity-80"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/refund-policy"
                      className="text-sm hover:opacity-80"
                    >
                      Refund Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-6 border-t border-green-500 border-opacity-50">
          <p className="text-sm opacity-80">
            © 2025 Edumaniax. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;

