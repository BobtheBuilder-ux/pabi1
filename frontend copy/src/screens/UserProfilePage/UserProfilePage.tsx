import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CalendarCheckIcon,
  FilterIcon,
  InfoIcon,
  ListCollapse,
  ListFilter,
  Mail,
  MapPinIcon,
  MenuIcon,
  Phone,
  Plus,
  SearchIcon,
  TagIcon,
  User2,
} from "lucide-react";
import { NavigationBarMainByAnima } from "../LandingPage/sections/NavigationBarMainByAnima";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Card } from "../../components/ui/card";
import { useGetUserPublicProfileQuery } from "../../lib/api/userApi.ts";
import GLoader from "../../components/ui/loader.tsx";

export const UserProfilePage = (): JSX.Element => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <GLoader />
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("About");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: userPublicProfileData, isLoading: isLoadingUserProfile } =
    useGetUserPublicProfileQuery(userId);

  if (isLoadingUserProfile || !userPublicProfileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <GLoader />
      </div>
    );
  }

  const userPublicProfile = userPublicProfileData?.data;

  const tabs = ["About" /*"Services", "Products", "Events", "Gallery"*/];

  /*    const productCategories = [
            {name: "Clothing & Fashion", icon: "👔"},
            {name: "Electronics", icon: "📱"},
            {name: "Home Goods & Furniture", icon: "🏠"},
            {name: "Beauty & Personal Care", icon: "💄"},
            {name: "More", icon: "⚙️"},
        ];

        const renderStars = (rating: number) => {
            return Array(5)
                .fill(null)
                .map((_, index) => (
                    <StarIcon
                        key={index}
                        className={`w-4 h-4 ${
                            index < Math.floor(rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                        }`}
                    />
                ));
        };*/

  const renderTabContent = () => {
    switch (activeTab) {
      case "About":
        return (
          <div className="space-y-6">
            {/* Background Card */}
            <Card className="p-6 shadow-none">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <User2 className="w-4 h-4 text-brand-colorsprimary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">
                    Background
                  </h3>
                  <p className="text-xs text-gray-600">
                    About this professional
                  </p>
                </div>
              </div>
              <p className="text-primary leading-normal text-sm">
                {userPublicProfile.biography}
              </p>
            </Card>

            {/* Location Info Card */}
            <Card className="p-6 shadow-none">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 text-brand-colorsprimary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">
                    Location Details
                  </h3>
                  <p className="text-xs text-gray-600">
                    Registration and residence information
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 bg-white/60 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Country of Registration
                  </span>
                  <span className="text-sm text-primary font-semibold">
                    <Badge className="font-semibold shadow-none rounded-full px-6 py-2 text-sm bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200">
                      {userPublicProfile.countryOfRegistration}
                    </Badge>
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-white/60 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Country of Residence
                  </span>
                  <Badge className="font-semibold shadow-none rounded-full px-6 py-2 text-sm bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200">
                    {userPublicProfile.countryOfResidence}
                  </Badge>
                </div>
                {/*                <div className="flex items-center justify-between py-2 px-3 bg-white/60 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Current Location
                  </span>
                  <span className="text-sm text-[#141b34] font-semibold">
                    {userPublicProfile.location}
                  </span>
                </div>*/}
              </div>
            </Card>

            {/* Categories Card */}
            <Card className="p-6 shadow-none">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <TagIcon className="w-4 h-4 text-brand-colorsprimary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#141b34]">
                    Categories & Expertise
                  </h3>
                  <p className="text-sm text-gray-600">
                    Professional areas of focus
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Main Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {userPublicProfile.industries.map((category, index) => (
                      <Badge
                        key={index}
                        className="font-semibold shadow-none rounded-full px-6 py-2 text-sm bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                {/*<div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Subcategories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {userData.subcategories.map((subcategory, index) => (
                      <Badge
                        key={index}
                        className="rounded-full px-6 py-2 text-sm bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200"
                      >
                        {subcategory}
                      </Badge>
                    ))}
                  </div>
                </div>*/}
              </div>
            </Card>

            {/* Looking For Card */}
            <Card className="p-6 shadow-none">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <SearchIcon className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#141b34]">
                    What I'm Looking For
                  </h3>
                  <p className="text-sm text-gray-600">
                    Opportunities and collaborations
                  </p>
                </div>
              </div>
              <p className="text-[#141b34] leading-relaxed text-base">
                {userPublicProfile.interests.join(", ")}
              </p>
            </Card>

            {/* Member Since Card */}
            <Card className="p-6 shadow-none">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <CalendarCheckIcon className="w-4 h-4 text-brand-colorsprimary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#141b34]">
                    Member Since
                  </h3>
                  <p className="text-sm text-gray-600">
                    Join date and experience
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-6 py-2 bg-white rounded-full border border-brand-colorsprimary">
                  <p className="text-sm font-semibold text-brand-colorsprimary">
                    {userPublicProfile.joinedAt}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Active member of the community</p>
                </div>
              </div>
            </Card>
          </div>
        );

      /*      case "Services":
                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-end">
                          <Button variant="outline" className="flex items-center gap-2">
                            <FilterIcon className="w-4 h-4" />
                            Filter
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {userData.services.map((service) => (
                            <div
                              key={service.id}
                              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                              <div className="aspect-video bg-gray-100">
                                <img
                                  src={service.image}
                                  alt={service.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-4">
                                <h4 className="font-semibold text-[#141b34] mb-2">
                                  {service.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {service.location}
                                </p>
                                <p className="font-semibold text-[#141b34]">
                                  {service.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );*/

      /*case "Products":
              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-x-auto">
                      {productCategories.map((category) => (
                        <Button
                          key={category.name}
                          variant="outline"
                          className="flex items-center gap-2 whitespace-nowrap"
                        >
                          <span>{category.icon}</span>
                          <span className="text-sm">{category.name}</span>
                        </Button>
                      ))}
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <FilterIcon className="w-4 h-4" />
                      Filter
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userData.products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-[#141b34] mb-1">
                            {product.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            {product.brand}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            {product.location}
                          </p>
                          <p className="font-semibold text-[#141b34]">
                            {product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );*/

      /*      case "Events":
                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-end">
                          <Button variant="outline" className="flex items-center gap-2">
                            <FilterIcon className="w-4 h-4" />
                            Filter
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {userData.events.map((event) => (
                            <div
                              key={event.id}
                              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                              <div className="aspect-video bg-gray-100">
                                <img
                                  src={event.image}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-4">
                                <h4 className="font-semibold text-[#141b34] mb-2">
                                  {event.title}
                                </h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p>📅 {event.date}</p>
                                  <p>🕐 {event.time}</p>
                                  <p>📍 {event.location}</p>
                                </div>
                                <p className="font-semibold text-[#141b34] mt-2">
                                  {event.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );*/

      /*      case "Gallery":
                    return (
                      <div className="space-y-6">
                        <div className="flex items-center justify-end">
                          <Button variant="outline" className="flex items-center gap-2">
                            <FilterIcon className="w-4 h-4" />
                            Filter
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {userData.gallery.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                              <div className="aspect-square bg-gray-100">
                                <img
                                  src={item.image}
                                  alt={`Gallery item ${item.id}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );*/

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBarMainByAnima />

      <div className="relative">
        {/* Cover Image with Gradient */}
        <div
          className="h-64 md:h-80 bg-purple-400 relative overflow-hidden"
          style={{
            background: `linear-gradient(0deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02)), url(${
              userPublicProfile.coverPictureUrl ||
              "https://placehold.co/600x400/888888/888882"
            })`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0"></div>

          {/* Profile Layout */}
          <div className="absolute bottom-12 md:bottom-8 left-0 right-0 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                {/* Left Side - Profile Image and Info */}
                <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                  {/* Profile Picture */}
                  <div className="relative flex justify-center md:justify-start">
                    <img
                      style={{
                        background: `linear-gradient(0deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02)), url(${
                          userPublicProfile.profilePictureUrl ||
                          "https://avatar.iran.liara.run/public/9"
                        })`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      className="w-24 h-24 md:w-44 md:h-44 rounded-full object-cover"
                    />
                  </div>

                  {/* User Info */}
                  <div className="text-center md:text-left md:pb-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {userPublicProfile.name}
                      </h1>
                      {userPublicProfile.boosted && (
                        <img
                          className="w-[24px] h-[24px]"
                          alt="New releases"
                          src="/new-releases.svg"
                        />
                      )}
                    </div>
                    <p className="text-white/90 text-base md:text-lg mb-1">
                      {userPublicProfile.industries.join(", ")}
                    </p>
                    <p className="text-white/80 text-sm mb-4">
                      based in {userPublicProfile.countryOfResidence}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <Button className="bg-brand-colorsprimary hover:brand-colorsprimary/20 text-white px-4 md:px-6 py-6 rounded-2xl font-medium text-sm md:text-base">
                        <div className="bg-white/40 rounded-full p-1">
                          <Plus className="w-4 h-4" />
                        </div>
                        <p className="text-sm">Connect</p>
                      </Button>

                      {userPublicProfile.email && (
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10 hover:text-white/80 px-4 md:px-6 py-6 rounded-lg font-medium bg-white/5 backdrop-blur-sm text-sm md:text-base"
                        >
                          Get in touch
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - Stats */}
                <div className="flex items-center justify-center md:justify-end gap-4 md:gap-8 md:pb-2">
                  {userPublicProfile.email && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/40 hover:text-white/80"
                      onClick={() => {
                        // Navigate to messages page with intent to start conversation
                        navigate(`/messages?userId=${userId}&action=start-conversation`);
                      }}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                  {userPublicProfile.phone && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/40 hover:text-white/80"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                  {/*<Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/40 hover:text-white/80"
                                    >
                                        <CalendarDays className="w-4 h-4"/>
                                    </Button>*/}
                </div>
              </div>
            </div>
          </div>

          {/* Info Icon */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/40 hover:text-white/80"
          >
            <InfoIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="pt-8 pb-8">
          <div className="max-w-7xl mx-auto px-4 flex gap-8">
            {/* Collapsible Sidebar */}
            <div
              className={`transition-all duration-600 ${
                sidebarCollapsed ? "w-16" : "w-80"
              } flex-shrink-0`}
            >
              <div className="bg-white rounded-lg border border-gray-200 sticky top-8">
                {/* Sidebar Header */}
                <div className="px-4  py-2 border-b border-gray-200 flex items-center justify-between">
                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#141b34]">
                        User Profile Info
                      </span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="h-8 w-8"
                  >
                    {sidebarCollapsed ? (
                      <ListCollapse className="w-4 h-4" />
                    ) : (
                      <ListCollapse className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {!sidebarCollapsed && (
                  <div className="p-4 space-y-6">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="preferences" className="border-0">
                        <AccordionTrigger className="py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <User2 className="w-4 h-4 text-brand-colorsprimary" />
                            <span className="font-semibold text-primary uppercase text-xs">
                              Profile info
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {/* About */}
                          <div className="my-2 pt-4">
                            <h3 className="font-bold text-primary text-xs">
                              About
                            </h3>
                            <p className="text-[10px] text-[#898989]">
                              {userPublicProfile.biography}
                            </p>
                          </div>
                          {/* Country of registration */}
                          <div className="my-2 pt-4">
                            <h3 className="font-bold text-primary text-xs">
                              Country Of Registration
                            </h3>
                            <p className="text-[10px] text-[#898989]">
                              {userPublicProfile.countryOfRegistration}
                            </p>
                          </div>
                          {/* Country of residence */}
                          <div className="my-2 pt-4">
                            <h3 className="font-bold text-primary text-xs">
                              Country Of Residence
                            </h3>
                            <p className="text-[10px] text-[#898989]">
                              {userPublicProfile.countryOfResidence}
                            </p>
                          </div>
                          {/* City */}
                          <div className="my-2 pt-4">
                            <h3 className="font-bold text-primary text-xs">
                              City
                            </h3>
                            <p className="text-[10px] text-[#898989]">
                              Kartoum
                            </p>
                          </div>
                          {/* Member since */}
                          <div className="my-2 pt-4 border-t border-gray-200">
                            <h3 className="font-bold text-primary text-xs">
                              Member since
                            </h3>
                            <p className="text-[10px] text-[#898989]">
                              {userPublicProfile.joinedAt}
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Preferences Accordion */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="preferences" className="border-0">
                        <AccordionTrigger className="py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <ListFilter className="w-4 h-4 text-[#8a358a]" />
                            <span className="font-semibold text-[#141b34] uppercase text-xs">
                              Preferences
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div>
                              <h4 className="font-medium text-[#141b34] mb-2 text-xs py-2">
                                What I'm looking for
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {userPublicProfile.interests.map(
                                  (category, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs rounded-xl px-4 py-2"
                                    >
                                      {category}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* <AccordionItem value="ratings" className="border-0">
                        <AccordionTrigger className="py-2 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <StarIcon className="w-4 h-4 text-[#8a358a]" />
                            <span className="font-semibold text-[#141b34] uppercase text-sm">
                              Ratings
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {renderStars(userData.rating)}
                              </div>
                              <span className="text-sm font-medium">
                                {userData.rating}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {userData.reviewCount} reviews
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>*/}
                    </Accordion>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Tab Navigation */}
              <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="flex border-b border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? "text-[#8a358a] border-b-2 border-[#8a358a] bg-gray-50"
                          : "text-gray-600 hover:text-[#141b34]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">{renderTabContent()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
