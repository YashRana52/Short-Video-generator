import { useEffect, useState } from "react";
import {
  DollarSignIcon,
  FolderEditIcon,
  GalleryHorizontalEnd,
  MenuIcon,
  SparkleIcon,
  XIcon,
} from "lucide-react";
import { GhostButton, PrimaryButton } from "./Buttons";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useClerk, useUser, UserButton, useAuth } from "@clerk/clerk-react";
import api from "../configs/axios";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState(0);

  const { pathname } = useLocation();
  const { user } = useUser();
  const navigate = useNavigate();
  const { openSignIn, openSignUp } = useClerk();
  const { getToken } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Create", href: "/generate" },
    { name: "Community", href: "/community" },
    { name: "Plans", href: "/plans" },
  ];

  const handleNavigate = (path: any) => {
    navigate(path);
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  const getUserCredits = async () => {
    try {
      const token = await getToken();

      const res = await api.get("/api/user/credits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCredits(res.data?.credits ?? 0);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      getUserCredits();
    }
  }, [user, pathname]);

  return (
    <motion.nav
      className="fixed top-5 left-0 right-0 z-50 px-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 250, damping: 70 }}
    >
      {/* ================= NAV BAR ================= */}
      <div className="max-w-6xl mx-auto flex items-center justify-between bg-black/50 backdrop-blur-md border border-white/5 rounded-2xl p-3">
        {/* Logo */}
        <Link to="/" onClick={() => window.scrollTo(0, 0)}>
          <img src={assets.logo} alt="logo" className="h-8" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => window.scrollTo(0, 0)}
              className="hover:text-white transition"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <button
                onClick={openSignIn}
                className="text-sm font-medium text-gray-300 hover:text-white transition"
              >
                Sign in
              </button>
              <PrimaryButton onClick={openSignUp}>Get Started</PrimaryButton>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <GhostButton
                onClick={() => navigate("/plans")}
                className="border-none text-gray-300"
              >
                Credits: {credits}
              </GhostButton>

              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Generate"
                    labelIcon={<SparkleIcon size={18} />}
                    onClick={() => navigate("/generate")}
                  />
                  <UserButton.Action
                    label="My Generations"
                    labelIcon={<FolderEditIcon size={18} />}
                    onClick={() => navigate("/my-generations")}
                  />
                  <UserButton.Action
                    label="Community"
                    labelIcon={<GalleryHorizontalEnd size={18} />}
                    onClick={() => navigate("/community")}
                  />
                  <UserButton.Action
                    label="Plans"
                    labelIcon={<DollarSignIcon size={18} />}
                    onClick={() => navigate("/plans")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(true)} className="md:hidden">
          <MenuIcon className="size-6 text-white" />
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/60 backdrop-blur-md transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {navLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleNavigate(link.href)}
            className="text-lg font-medium text-white"
          >
            {link.name}
          </button>
        ))}

        {!user ? (
          <>
            <button
              onClick={() => {
                openSignIn();
                setIsOpen(false);
              }}
              className="text-gray-300 hover:text-white"
            >
              Sign in
            </button>

            <PrimaryButton
              onClick={() => {
                openSignUp();
                setIsOpen(false);
              }}
            >
              Get Started
            </PrimaryButton>
          </>
        ) : (
          <>
            <div className="w-40 h-px bg-white/20 my-2" />

            <button
              onClick={() => handleNavigate("/my-generations")}
              className="text-white text-lg"
            >
              My Generations
            </button>

            <button
              onClick={() => handleNavigate("/generate")}
              className="text-white text-lg"
            >
              Generate
            </button>

            <button
              onClick={() => handleNavigate("/plans")}
              className="text-white text-lg"
            >
              Plans
            </button>

            <UserButton afterSignOutUrl="/" />
          </>
        )}

        <button
          onClick={() => setIsOpen(false)}
          className="rounded-md bg-white p-2 text-gray-800"
        >
          <XIcon />
        </button>
      </div>
    </motion.nav>
  );
}
