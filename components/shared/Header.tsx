import React, { useState, useRef, useEffect } from "react";
import { User } from "../../types";
import {
  PowerIcon,
  UserCircleIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

interface HeaderProps {
  user: User;
  onLogout: () => void;
  logoUrl: string;
}

export default function Header({ user, onLogout, logoUrl }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(
    user.profileImage || ""
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Load image from localStorage (after refresh)
  useEffect(() => {
    const saved = localStorage.getItem("currentUserImage");
    if (saved) {
      const { id, url } = JSON.parse(saved);
      if (id === user.id && url) setProfileImage(url);
    }
  }, [user.id]);

  // ✅ Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // ✅ Upload new image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("employee_id", user.id.toString());
    formData.append("profile_image", file);

    setUpdatingImage(true);
    try {
      const res = await axios.post(
        "http://localhost/zaphira-backend/api/update_profile_image.php",
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        const newUrl = `http://localhost/zaphira-backend/${res.data.image_url}`;
        setProfileImage(newUrl);
        localStorage.setItem(
          "currentUserImage",
          JSON.stringify({ id: user.id, url: newUrl })
        );
        alert("✅ Profile photo updated successfully!");
      } else {
        alert("❌ " + res.data.error);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Failed to upload image!");
    } finally {
      setUpdatingImage(false);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT */}
          <div className="flex items-center">
            <img
              className="h-9 w-9 rounded-full object-cover"
              src={logoUrl}
              alt="Logo"
            />
            <span className="ml-3 font-bold text-xl text-gray-800">
              Integral University
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <BellIcon className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  className="h-9 w-9 rounded-full object-cover border border-gray-300"
                  src={profileImage || user.profileImage || "/images/logo.jpeg"}
                  alt={user.name}
                />
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>
              </button>

              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-md shadow-lg py-2 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    <UserCircleIcon className="w-5 h-5 mr-2" />
                    {updatingImage ? "Uploading..." : "Change Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={onLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <PowerIcon className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
