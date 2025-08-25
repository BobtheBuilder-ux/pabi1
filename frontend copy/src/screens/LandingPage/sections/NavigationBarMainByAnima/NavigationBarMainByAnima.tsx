import {ArrowUpRightIcon, Bell, LogOutIcon, MenuIcon, MessageCircle, Rocket, SettingsIcon, UserIcon, XIcon,} from "lucide-react";
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
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            type: 'new_connection',
            title: 'New Connection Request',
            message: 'John Doe wants to connect with you',
            timestamp: '2 minutes ago',
            read: false
        },
        {
            id: '2',
            type: 'connection_accepted',
            title: 'Connection Accepted',
            message: 'Sarah Smith accepted your connection request',
            timestamp: '1 hour ago',
            read: false
        }
    ]);

    // Determine active nav based on current location
    const getActiveNav = () => {
        if (location.pathname === "/my-connections") {
            return "my-connections";
        }
        if (location.pathname === "/messages") {
            return "messages";
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

    const handleMessages = () => {
        setActiveNav("messages");
        navigate("/messages");
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

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
    };

    const handleNotificationItemClick = (notificationId: string) => {
        // Mark notification as read
        setNotifications(prev => prev.map(notif => 
            notif.id === notificationId 
                ? { ...notif, read: true }
                : notif
        ));
        // Close notifications dropdown
        setShowNotifications(false);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

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
                    {user && <div
                        className={`text-sm flex items-center gap-2 cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                            currentActiveNav === "messages"
                                ? "text-[#8a358a] font-bold"
                                : "text-[#141b34]"
                        } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                        onClick={handleMessages}
                    >
                        <MessageCircle className="w-4 h-4" />
                        Messages
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

                                    <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                                        <DropdownMenuTrigger asChild>
                                            <div className="relative hover:cursor-pointer" onClick={handleNotificationClick}>
                                                <Bell className="w-6 h-6 text-[#141b34] hover:text-[#8a358a] transition-colors" />
                                                {unreadCount > 0 && (
                                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-80" align="end">
                                            <div className="p-3 border-b">
                                                <h3 className="font-semibold text-sm">Notifications</h3>
                                            </div>
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    No notifications
                                                </div>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <DropdownMenuItem
                                                        key={notification.id}
                                                        className="cursor-pointer p-3 hover:bg-gray-50"
                                                        onClick={() => handleNotificationItemClick(notification.id)}
                                                    >
                                                        <div className="flex items-start gap-3 w-full">
                                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                                                notification.read ? 'bg-gray-300' : 'bg-blue-500'
                                                            }`} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm text-gray-900 truncate">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                    {notification.timestamp}
                                                </p>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
                        <>
                            {/* Messages Icon */}
                            <div 
                                className="relative hover:cursor-pointer p-1 hover:bg-gray-100 rounded-md transition-colors"
                                onClick={handleMessages}
                            >
                                <MessageCircle className="w-5 h-5 text-[#141b34]" />
                            </div>
                            
                            {/* Notifications Icon */}
                            <div 
                                className="relative hover:cursor-pointer p-1 hover:bg-gray-100 rounded-md transition-colors"
                                onClick={handleNotificationClick}
                            >
                                <Bell className="w-5 h-5 text-[#141b34]" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </>
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
                                className={`flex items-center gap-2 text-sm cursor-pointer transition-colors duration-150 px-4 py-2 rounded-xl ${
                                    currentActiveNav === "messages"
                                        ? "text-[#8a358a] font-bold"
                                        : "text-[#141b34]"
                                } hover:text-[#8a358a] hover:bg-[#E8D7E8]/30 hover:font-semibold`}
                                onClick={handleMessages}
                            >
                                <MessageCircle className="w-4 h-4" />
                                Messages
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

            {/* Mobile Notifications Dropdown */}
            {showNotifications && (
                <div className="md:hidden fixed inset-0 top-[73px] bg-white z-20 border-b border-zinc-200">
                    <div className="flex flex-col p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#141b34]">Notifications</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowNotifications(false)}
                                className="p-2"
                            >
                                <XIcon className="w-5 h-5" />
                            </Button>
                        </div>
                        
                        <div className="flex flex-col space-y-3 max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No notifications yet</p>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                            notification.read
                                                ? 'bg-gray-50 border-gray-200'
                                                : 'bg-blue-50 border-blue-200'
                                        } hover:bg-gray-100`}
                                        onClick={() => handleNotificationItemClick(notification.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm text-[#141b34] mb-1">
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {notification.timestamp}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {notifications.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setShowNotifications(false);
                                        navigate('/notifications');
                                    }}
                                >
                                    View All Notifications
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
