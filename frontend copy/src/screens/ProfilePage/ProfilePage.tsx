import { useState } from "react";
import { NavigationBarMainByAnima } from "../LandingPage/sections/NavigationBarMainByAnima";
import {
  MyAccountTab,
  NetworkingTab,
  ServicesTab,
  ProductsTab,
  GalleryTab,
  JobsOpportunitiesTab,
  AdsTab,
} from "./components";

export const ProfilePage = (): JSX.Element => {
  const [activeSection, setActiveSection] = useState("My Account");

  const sidebarItems = [
    "My Account",
    "Networking",
    "Services",
    "Products",
    "Gallery",
    "Jobs & Opportunities",
    "Ads",
  ];

  const renderActiveTab = () => {
    switch (activeSection) {
      case "My Account":
        return <MyAccountTab />;
      case "Networking":
        return <NetworkingTab />;
      case "Services":
        return <ServicesTab />;
      case "Products":
        return <ProductsTab />;
      case "Gallery":
        return <GalleryTab />;
      case "Jobs & Opportunities":
        return <JobsOpportunitiesTab />;
      case "Ads":
        return <AdsTab />;
      default:
        return <MyAccountTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBarMainByAnima />

      <div className="flex max-w-7xl mx-auto gap-5 py-5 px-5">
        {/* Sidebar */}
        <div className="w-72 bg-white shadow-sm border border-gray-200 h-fit rounded-xl">
          <div className="py-6">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSection(item)}
                  className={`w-full text-left px-4 py-3 lg text-xs transition-colors ${
                    activeSection === item
                      ? "bg-[#8a358a]/10 text-[#8a358a] border-[#8a358a] font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">{renderActiveTab()}</div>
      </div>
    </div>
  );
};
