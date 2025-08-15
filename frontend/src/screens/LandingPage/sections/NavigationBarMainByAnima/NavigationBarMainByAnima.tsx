import {ArrowUpRightIcon, LogOutIcon, MenuIcon, Rocket, SettingsIcon, UserIcon, XIcon,} from "lucide-react";
import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Avatar, AvatarImage} from "../../../../components/ui/avatar";
import {Button} from "../../../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import {useAuth} from "../../../../lib/hooks/useAuth";
import {usePreferences} from "../../../../lib/hooks/usePreferences";

export const NavigationBarMainByAnima = (): JSX.Element => {
    const {user, logout} = useAuth();
    const {hasCompletedOnboarding} = usePreferences();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeNav, setActiveNav] = useState<string>("");

    // Determine active nav based on current location
    const getActiveNav = () => {
        if (location.pathname === "/my-connections") {
            return "my-connections";
        }
        // Explore is active by default on landing page
        if (location.pathname === "/") {
            return "explore";
        }
        // Add other routes as needed
        return activeNav;
    };

    const currentActiveNav = getActiveNav();

    const showFullFeatures = user && hasCompletedOnboarding;

    const isAuthenticated = !!user;

    const handleLogin = () => {
        navigate("/login");
        setIsMobileMenuOpen(false);
    };

    const handleSignup = () => {
        navigate("/signup");
        setIsMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
            setIsMobileMenuOpen(false);
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/");
            setIsMobileMenuOpen(false);
        }
    };

    const handleProfile = () => {
        navigate("/profile");
        setIsMobileMenuOpen(false);
    };

    const handleSettings = () => {
        navigate("/settings");
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleMyConnections = () => {
        setActiveNav("my-connections");
        navigate("/my-connections");
        setIsMobileMenuOpen(false);
    };

    const handleExplore = () => {
        setActiveNav("explore");
        navigate("/");
        setIsMobileMenuOpen(false);
    };

    const handleGoPro = () => {
        setActiveNav("go-pro");
        // Add navigation if needed
        setIsMobileMenuOpen(false);
    };

    const handleAboutUs = () => {
        setActiveNav("about-us");
        // Add navigation if needed
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header
                className="flex w-full h-[73px] items-center justify-between px-4 md:px-8 py-0 sticky top-0 left-0 bg-white border-b border-zinc-200 z-20">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    <img
                        className="h-[50px] md:h-[65px] w-auto"
                        alt="Logo"
                        src="/whatsapp-image-2025-05-05-at-12-10-06-5991b0a4-2.png"
                    />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-10">
                    <div
                        className={`text-sm cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                            currentActiveNav === "explore"
                                ? "text-[#8a358a] font-bold"
                                : "text-[#141b34]"
                        } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                        onClick={handleExplore}
                    >
                        Explore
                    </div>
                    {user && <div
                        className={`text-sm cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                            currentActiveNav === "my-connections"
                                ? "text-[#8a358a] font-bold"
                                : "text-[#141b34]"
                        } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                        onClick={handleMyConnections}
                    >
                        My Connections
                    </div>}
                    <div
                        className={`text-sm flex items-center cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                            currentActiveNav === "go-pro"
                                ? "text-[#8a358a] font-bold"
                                : "text-[#141b34]"
                        } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                        onClick={handleGoPro}
                    >
                        Go Pro
                        <img
                            className="w-[19px] h-[19px]"
                            alt="New releases"
                            src="/new-releases.svg"
                        />
                    </div>

                    <div
                        className={`text-sm cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                            currentActiveNav === "about-us"
                                ? "text-[#8a358a] font-bold"
                                : "text-[#141b34]"
                        } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                        onClick={handleAboutUs}
                    >
                        About us
                    </div>
                </nav>

                {/* Desktop User Section */}
                <div className="hidden md:flex items-center gap-[37px]">
                    {isAuthenticated ? (
                        <>
                            {showFullFeatures && (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center justify-center gap-2 px-[18px] py-3 bg-[#8a358a33] text-[#8a358a] rounded-xl hover:bg-[#8a358a45]"
                                    >
                    <span className="font-semibold text-xs text-brand-colorsprimary">
                      Boost your profile
                    </span>
                                        <Rocket className="w-[17px] h-[17px] text-[#8a358a]"/>
                                    </Button>

                                    <div className="relative hover:cursor-pointer">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <image
                                                href="/notification-02.svg"
                                                width="24"
                                                height="24"
                                            />
                                        </svg>
                                    </div>
                                </>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar
                                        className="w-[38px] h-[38px] cursor-pointer hover:ring-2 hover:ring-[#8a358a] hover:ring-offset-2 transition-all">
                                        <AvatarImage
                                            src={
                                                user?.avatar ||
                                                "/ellipse-10-4.svg"
                                            }
                                            alt="User profile"
                                        />
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <div className="flex items-center gap-2 p-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage
                                                src={
                                                    user?.avatar ||
                                                    "/ellipse-10-4.svg"
                                                }
                                                alt="User profile"
                                            />
                                        </Avatar>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                            {!hasCompletedOnboarding && (
                                                <p className="text-xs leading-none text-orange-600 font-medium">
                                                    Completing onboarding...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator/>
                                    {showFullFeatures && (
                                        <>
                                            <DropdownMenuItem
                                                onClick={handleProfile}
                                                className="cursor-pointer"
                                            >
                                                <UserIcon className="mr-2 h-4 w-4"/>
                                                <span>Profile</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={handleSettings}
                                                className="cursor-pointer"
                                            >
                                                <SettingsIcon className="mr-2 h-4 w-4"/>
                                                <span>Settings</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                        </>
                                    )}
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer text-red-600"
                                    >
                                        <LogOutIcon className="mr-2 h-4 w-4"/>
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={handleLogin}
                                className="text-[#141b34] hover:bg-gray-100"
                            >
                                Login
                            </Button>
                            <Button
                                onClick={handleSignup}
                                className="bg-[#8a358a] hover:bg-[#7a2f7a] text-white px-6"
                            >
                                Join Now
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center gap-2">
                    {isAuthenticated && showFullFeatures && (
                        <div className="relative hover:cursor-pointer">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <image href="/notification-02.svg" width="24" height="24"/>
                            </svg>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMobileMenu}
                        className="p-2"
                    >
                        {isMobileMenuOpen ? (
                            <XIcon className="w-5 h-5"/>
                        ) : (
                            <MenuIcon className="w-5 h-5"/>
                        )}
                    </Button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[73px] bg-white z-10 border-b border-zinc-200">
                    <div className="flex flex-col p-4 space-y-4">
                        {/* Navigation Links */}
                        <div className="flex flex-col space-y-4 border-b border-zinc-200 pb-4">
                            <div
                                className={`text-sm cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                                    currentActiveNav === "explore"
                                        ? "text-[#8a358a] font-bold"
                                        : "text-[#141b34]"
                                } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                                onClick={handleExplore}
                            >
                                Explore
                            </div>
                            <div
                                className={`text-sm cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                                    currentActiveNav === "my-connections"
                                        ? "text-[#8a358a] font-bold"
                                        : "text-[#141b34]"
                                } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                                onClick={handleMyConnections}
                            >
                                My Connections
                            </div>
                            <div
                                className={`flex items-center gap-2 cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                                    currentActiveNav === "go-pro"
                                        ? "text-[#8a358a] font-bold"
                                        : "text-[#141b34]"
                                } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                                onClick={handleGoPro}
                            >
                                Go Pro
                                <img
                                    className="w-[19px] h-[19px]"
                                    alt="New releases"
                                    src="/new-releases.svg"
                                />
                            </div>
                            <div
                                className={`text-sm cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                                    currentActiveNav === "about-us"
                                        ? "text-[#8a358a] font-bold"
                                        : "text-[#141b34]"
                                } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                                onClick={handleAboutUs}
                            >
                                About us
                            </div>
                            <div
                                className={`text-sm cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                                    currentActiveNav === "my-connections"
                                        ? "text-[#8a358a] font-bold"
                                        : "text-[#141b34]"
                                } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                                onClick={handleMyConnections}
                            >
                                My Connections
                            </div>
                        </div>

                        {isAuthenticated ? (
                            <div className="flex flex-col space-y-4">
                                {/* User Info */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage
                                            src={
                                                user?.avatar || "/ellipse-10-4.svg"
                                            }
                                            alt="User profile"
                                        />
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {user.email}
                                        </p>
                                        {!hasCompletedOnboarding && (
                                            <p className="text-xs text-orange-600 font-medium">
                                                Completing onboarding...
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* User Actions */}
                                {showFullFeatures && (
                                    <Button
                                        variant="ghost"
                                        className="flex items-center justify-center gap-2 bg-[#8a358a33] text-[#8a358a] hover:bg-[#8a358a45] w-full"
                                    >
                    <span className="font-semibold text-sm">
                      Boost your profile
                    </span>
                                        <ArrowUpRightIcon className="w-4 h-4"/>
                                    </Button>
                                )}

                                <div className="flex flex-col space-y-2">
                                    {showFullFeatures && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                onClick={handleProfile}
                                                className="justify-start"
                                            >
                                                <UserIcon className="mr-2 h-4 w-4"/>
                                                Profile
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={handleSettings}
                                                className="justify-start"
                                            >
                                                <SettingsIcon className="mr-2 h-4 w-4"/>
                                                Settings
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <LogOutIcon className="mr-2 h-4 w-4"/>
                                        Sign out
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-3">
                                <Button
                                    variant="ghost"
                                    onClick={handleLogin}
                                    className="text-[#141b34] hover:bg-gray-100 w-full"
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={handleSignup}
                                    className="bg-[#8a358a] hover:bg-[#7a2f7a] text-white w-full"
                                >
                                    Join Now
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
