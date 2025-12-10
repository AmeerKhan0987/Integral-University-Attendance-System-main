import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../../types";
import { useData } from "../../context/DataContext"; // ✅ Optional global sync

interface ProfileData {
  id: number;
  name: string;
  email: string;
  profile_image: string;
}

interface ProfileProps {
  user: User;
  onImageChange?: (url: string) => void; // ✅ Added for header sync
}

export default function Profile({ user, onImageChange }: ProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });

  // ✅ Optional context for persistence
  const { updateUserProfileImage } = useData();

  const employeeId = user.id;

  // ✅ Fetch profile from backend
  useEffect(() => {
    if (!employeeId) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost/zaphira-backend/api/get_profile.php?employee_id=${employeeId}`,
          { withCredentials: true }
        );

        if (res.data.success) {
          const d = res.data.data;
          setProfile({
            id: d.id,
            name: d.name,
            email: d.email,
            profile_image: d.profileImage || d.profile_image || "",
          });
        } else {
          setMessage({ type: "error", text: res.data.error });
        }
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Failed to fetch profile data" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [employeeId]);

  // ✅ Handle field input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // ✅ Update profile details
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const res = await axios.post(
        "http://localhost/zaphira-backend/api/update_profile.php",
        profile,
        { withCredentials: true }
      );

      if (res.data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: res.data.error });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Update failed. Try again." });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Handle image upload and sync with header
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("employee_id", profile.id.toString());
    formData.append("profile_image", file);

    try {
      const res = await axios.post(
        "http://localhost/zaphira-backend/api/update_profile_image.php",
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        const newImageUrl = `http://localhost/zaphira-backend/${res.data.image_url}`;

        // ✅ Update local state
        setProfile({ ...profile, profile_image: newImageUrl });

        // Changes: ensure updateUserProfileImage(profile.id, newImageUrl)
        updateUserProfileImage(profile.id, newImageUrl);

        // ✅ Send new image to Header via prop
        if (onImageChange) onImageChange(newImageUrl);

        // ✅ Persist in localStorage
        localStorage.setItem(
          "currentUserImage",
          JSON.stringify({ id: profile.id, url: newImageUrl })
        );

        setMessage({ type: "success", text: "Profile image updated!" });
      } else {
        setMessage({ type: "error", text: res.data.error });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Image upload failed!" });
    }
  };

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">Loading profile...</div>
    );

  if (!profile)
    return (
      <div className="text-center py-10 text-red-500">Profile not found.</div>
    );

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        My Profile
      </h2>

      {message.text && (
        <div
          className={`mb-4 text-center py-2 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ✅ Profile Image Section */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={
            profile.profile_image
              ? profile.profile_image.startsWith("http")
                ? profile.profile_image
                : `http://localhost/zaphira-backend/${profile.profile_image}`
              : "/images/logo.jpeg"
          }
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-4 border-primary-500 shadow-md mb-3"
        />

        {/* ✅ Allow photo update */}
        <label className="bg-primary-600 text-white px-4 py-1 rounded-lg cursor-pointer hover:bg-primary-700">
          Change Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {/* ✅ Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={profile.email}
            disabled
            className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition duration-300"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
