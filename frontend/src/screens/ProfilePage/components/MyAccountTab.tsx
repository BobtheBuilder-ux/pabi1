import React, { useEffect, useState } from "react";
import { ImagePlus, User2 } from "lucide-react";
import { useAuth } from "../../../lib/hooks/useAuth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { toast } from "sonner";
import { fileUploader } from "../../../lib/api/fileUploader.ts";
import { useUpdateUserProfileMutation } from "../../../lib/api/userApi.ts";
import GLoader from "../../../components/ui/loader.tsx";
import { COUNTRIES } from "../../../lib/utils/countries.ts";

export const MyAccountTab = (): JSX.Element => {
  const [selectedCoverImage, setSelectedCoverImage] = useState<string>("");
  const [selectedProfileImage, setSelectedProfileImage] = useState<string>("");
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    biography: user?.biography || "",
    nationality: user?.nationality || "",
    countryOfResidence: user?.countryOfResidence || "",
  });
  const [updateUserProfile] = useUpdateUserProfileMutation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (formData && user && !isUpdating) {
      const initialData = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        biography: user.biography || "",
        nationality: user.nationality || "",
        countryOfResidence: user.countryOfResidence || "",
      };

      setHasChanges(JSON.stringify(formData) !== JSON.stringify(initialData));
    }
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const changedData = Object.keys(formData).reduce((acc, key) => {
      // @ts-ignore
      if (formData[key as keyof typeof formData] !== user?.[key]) {
        acc[key] = formData[key as keyof typeof formData];
      }
      return acc;
    }, {} as Record<string, string>);

    setIsUpdating(true);
    updateUserProfile(changedData)
      .unwrap()
      .then((_) => {
        setHasChanges(false);
        setIsUpdating(false);
        toast.success("Profile updated successfully");
      })
      .catch((error) => {
        setHasChanges(false);
        setIsUpdating(false);
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
      });
  };

  const handleCoverImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedCoverImage(reader.result as string);
        fileUploader(file, "/profile/upload/cover")
          .then((_) => {
            toast.success("Cover image uploaded successfully");
          })
          .catch((error) => {
            console.error("Error uploading cover image:", error);
            toast.error("Failed to upload cover image");
          });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedProfileImage(reader.result as string);
        fileUploader(file, "/profile/upload/avatar")
          .then((_) => {
            toast.success("Profile image uploaded successfully");
          })
          .catch((error) => {
            console.error("Error uploading profile image:", error);
            toast.error("Failed to upload profile image");
          });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Profile Header */}
      <div
        style={{
          background: `linear-gradient(0deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02)), url(${
            selectedCoverImage ||
            user?.coverImage ||
            "https://placehold.co/800x200"
          })`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className=" rounded-xl border border-gray-200"
      >
        <div className="rounded-xl bg-gray-950/35 bg-blend-multiply flex items-center justify-between w-full bg-lime p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                style={{
                  backgroundImage: `url(${
                    selectedProfileImage ||
                    user?.avatar ||
                    "https://avatar.iran.liara.run/public/9"
                  })`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                className="relative w-24 h-24 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center"
              >
                <ImagePlus className="hidden w-4 h-4 text-gray-400" />
                <input
                  type="file"
                  className="absolute top-0 left-0 opacity-0 w-24 h-24 cursor-pointer"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-2">
                {user?.name || "Your Name"}
              </div>
              <div className="rounded-full py-2 px-4 bg-white/10 backdrop-blur-sm">
                <p className="text-white text-sm">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-full bg-white/10 backdrop-blur-sm text-white">
            <div className="flex items-center gap-2 px-4 py-2 border-gray-200 cursor-pointer">
              <ImagePlus className="w-4 h-4" />
              <span className="text-xs cursor-pointer">Upload cover</span>
            </div>
            <input
              type="file"
              className="absolute top-0 left-0 opacity-0 h-10 w-full cursor-pointer"
              accept="image/*"
              onChange={handleCoverImageChange}
            />
          </div>
        </div>
      </div>

      {/* Personal Details Form */}
      <div className="bg-white rounded-xl p-8 border border-gray-200 mt-6">
        <div className="flex items-center gap-3 mb-14">
          <div className="w-12 h-12 rounded-full bg-[#8a358a]/10 flex items-center justify-center">
            <div className="rounded-full">
              <User2 className="w-4 h-4 text-[#8a358a]" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#141b34]">
              Personal Details
            </h2>
            <p className="text-sm text-gray-600">
              Press save after editing for changes to be reflected on your
              profile.
            </p>
          </div>
        </div>

        <form className="space-y-8">
          {/* Account Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-[#141b34] mb-4 uppercase tracking-wide">
              ACCOUNT INFO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Input
                  disabled={true}
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                />
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <textarea
                placeholder="Biography"
                value={formData.biography}
                onChange={(e) => handleInputChange("biography", e.target.value)}
                rows={4}
                className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h3 className="text-sm font-semibold text-[#141b34] mb-4 uppercase tracking-wide">
              LOCATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  value={formData.nationality}
                  onValueChange={(value) =>
                    handleInputChange("nationality", value)
                  }
                >
                  <SelectTrigger className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent">
                    <SelectValue placeholder="Nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.title} value={country.title}>
                        {country.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={formData.countryOfResidence}
                  onValueChange={(value) =>
                    handleInputChange("countryOfResidence", value)
                  }
                >
                  <SelectTrigger className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent">
                    <SelectValue placeholder="Country of residence" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.title} value={country.title}>
                        {country.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 flex gap-4 justify-end">
            <div className="flex items-center gap-2">
              {!isUpdating && (
                <Button
                  disabled={!hasChanges}
                  type="button"
                  onClick={handleSave}
                  className="bg-[#8a358a] hover:bg-[#7a2f7a] text-white px-8 py-6 rounded-xl font-semibold transition-colors"
                >
                  Save
                </Button>
              )}
              {isUpdating && <GLoader className="w-8 h-8" />}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
