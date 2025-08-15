import React, { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // New state for dropdown
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null); // New ref for dropdown

  // Effect to handle clicks outside the sidebar and dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLogoutConfirm) return;
      // Check if click is outside the sidebar
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
      // Check if click is outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogoutConfirm]); // Run this effect only once on mount

  const handleItemClick = () => {
    setIsSidebarOpen(false);
    // Optional: Close dropdown when a sidebar link is clicked
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
  setIsDropdownOpen(false); // Close dropdown if open
  setIsSidebarOpen(false);  // Close sidebar if open
  setShowLogoutConfirm(true); // Show the confirmation modal
};

// This function performs the actual logout
const confirmLogout = () => {
  logout(navigate);
  setShowLogoutConfirm(false); // Hide modal after logging out
};

// This function cancels the logout and closes the modal
const cancelLogout = () => {
  setShowLogoutConfirm(false);
};

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getNavLinkClasses = (path) => {
    const baseClasses = "font-medium transition duration-300";
    if (isActive(path)) {
      return `${baseClasses} text-green-600`;
    }
    return `${baseClasses} text-black hover:text-green-600`;
  };

  const getCharacterIconPath = () => {
    if (user?.avatar) {
      return user.avatar;
    }
    if (!user || !user.characterGender || !user.characterStyle) {
      return "/dashboardDesign/boy.png";
    }

    const gender =
      user.characterGender === "Boy" || user.characterGender === "Male"
        ? "male"
        : "female";

    const style = user.characterStyle.toLowerCase().replace(/\s/g, "");

    return `/dashboardDesign/${style}_${gender}.png`;
  };

  const dropdownLinkClasses =
    "block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-300";

  return (<>
    <nav className="bg-white text-black sticky top-0 z-200 w-full rounded-bl-4xl rounded-br-4xl shadow-lg">
      <div className="w-full py-4 px-6 flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo Section */}
        <div className="">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-15 h-10 relative">
              <img className="h-12 w-full" src="/midLogo.png" alt="logo" />
            </div>
            <span className="text-[#09BE43] mt-1 font-bold text-2xl">
              Edumaniax
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={getNavLinkClasses("/")}>
            Home
          </Link>
          <Link to="/about" className={getNavLinkClasses("/about")}>
            About Us
          </Link>
          <Link to="/courses" className={getNavLinkClasses("/courses")}>
            Courses
          </Link>
          <Link to="/pricing" className={getNavLinkClasses("/pricing")}>
            Pricing
          </Link>
          <Link to="/blogs" className={getNavLinkClasses("/blogs")}>
            Blogs
          </Link>
        </div>

        {/* Right Side Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition duration-300 focus:outline-none"
              >
                <img
                  src={getCharacterIconPath()}
                  alt="User Dashboard"
                  className={`${
                    user?.avatar
                      ? "h-10 w-10 object-cover rounded-full border-2 border-green-500"
                      : "h-10 w-10 object-cover rounded-full border-2 border-green-500"
                  }`}
                />
                <span className="text-black font-medium">{user.name}</span>
                <ChevronDown
                  size={20}
                  className={`text-gray-500 transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-100">
                  <div className="py-1">
                    <Link
                      to="/dashboard?section=profile"
                      className={dropdownLinkClasses}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard?section=modules"
                      className={dropdownLinkClasses}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Modules
                    </Link>
                    <Link
                      to="/dashboard?section=subscriptions"
                      className={dropdownLinkClasses}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Subscription
                    </Link>
                  </div>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-2 text-red-700 hover:bg-gray-100 transition duration-300"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-green-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-black"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar (This part remains largely the same) */}
      {isSidebarOpen && (
        <div
          ref={sidebarRef}
          className="md:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
        >
          <div className="px-6 py-6 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black">Menu</h2>
              <button onClick={handleItemClick}>
                <X size={24} className="text-black" />
              </button>
            </div>

            <hr className="mb-6" />

            {/* Navigation Links */}
            <div className="space-y-4">
              <Link
                to="/"
                onClick={handleItemClick}
                className={`block text-lg font-medium transition duration-300 ${
                  isActive("/")
                    ? "text-green-600"
                    : "text-black hover:text-green-600"
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={handleItemClick}
                className={`block text-lg font-medium transition duration-300 ${
                  isActive("/about")
                    ? "text-green-600"
                    : "text-black hover:text-green-600"
                }`}
              >
                About Us
              </Link>
              <Link
                to="/courses"
                onClick={handleItemClick}
                className={`block text-lg font-medium transition duration-300 ${
                  isActive("/courses")
                    ? "text-green-600"
                    : "text-black hover:text-green-600"
                }`}
              >
                Courses
              </Link>
              <Link
                to="/pricing"
                onClick={handleItemClick}
                className={`block text-lg font-medium transition duration-300 ${
                  isActive("/pricing")
                    ? "text-green-600"
                    : "text-black hover:text-green-600"
                }`}
              >
                Pricing
              </Link>
              <Link
                to="/blogs"
                onClick={handleItemClick}
                className={`block text-lg font-medium transition duration-300 ${
                  isActive("/blogs")
                    ? "text-green-600"
                    : "text-black hover:text-green-600"
                }`}
              >
                Blogs
              </Link>
            </div>
          </div>

          {/* Bottom Buttons for Mobile */}
          <div className="px-6 py-6 border-t border-gray-200">
            {user ? (
              <div className="space-y-3">
                <Link
                  to="/dashboard"
                  onClick={handleItemClick}
                  className="w-full flex items-center justify-center bg-green-600 text-white hover:bg-green-700 transition duration-300 px-4 py-3 rounded-lg font-medium overflow-hidden"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="w-full border border-red-600 text-red-600 hover:bg-red-50 transition duration-300 px-4 py-3 rounded-lg font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={handleItemClick}
                  className="block bg-green-600 text-white text-center hover:bg-green-700 transition duration-300 px-4 py-3 rounded-lg font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={handleItemClick}
                  className="block bg-green-600 text-white text-center hover:bg-green-700 transition duration-300 px-4 py-3 rounded-lg font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
{showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-300">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-800">Logout Confirmation</h2>
            </div>
            <p className="text-gray-600 mt-4">
              Are you sure you want to logout?
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
</>
  );
};

export default Navbar;
