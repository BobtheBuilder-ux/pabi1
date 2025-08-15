import {useNavigate} from "react-router-dom";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../../../../components/ui/accordion";
import {Avatar} from "../../../../components/ui/avatar";
import {Badge} from "../../../../components/ui/badge";
import {Button} from "../../../../components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../../../components/ui/card";
import {ScrollArea} from "../../../../components/ui/scroll-area";
import {useAuth} from "../../../../lib/hooks/useAuth";
import {usePreferences} from "../../../../lib/hooks/usePreferences";
import {BoxIcon, CalendarDays, ListFilter, MessageCircleCodeIcon, Network} from "lucide-react";

export const PersonalizeByAnima = (): JSX.Element => {
    const {user} = useAuth();
    const {hasCompletedOnboarding} = usePreferences();
    const navigate = useNavigate();

    // Show preferences only if user is authenticated AND has completed onboarding
    const showPreferences = user && hasCompletedOnboarding;

    // Connection requests data
    const connectionRequests = [
        {
            id: 1,
            type: "New connection request",
            time: "1 minutes ago",
            message: "Fabrice wants to match with you",
        },
        {
            id: 2,
            type: "Connection request accepted",
            time: "1 minutes ago",
            message: "Fabrice accepted to match with you",
        },
    ];

    // Network contacts data
    const networkContacts = [
        {
            id: 1,
            name: "Eric Mugisha",
            role: "Consultant",
            image: "/ellipse-10.png",
        },
        {
            id: 2,
            name: "Raisa Umwiza",
            role: "Consultant",
            image: "/ellipse-10-1.png",
        },
    ];

    // Meeting requests data
    const meetingRequests = [
        {
            id: 1,
            title: "My Meeting requests",
            message: "You have sent a meeting request to Pacific",
            hasCheckmark: false,
            hasCancel: true,
        },
        {
            id: 2,
            title: "New meeting request",
            message: "Pacific wants to meet",
            hasCheckmark: true,
            hasCancel: true,
        },
        {
            id: 3,
            title: "New meeting request",
            message: "Pacific wants to meet",
            hasCheckmark: true,
            hasCancel: true,
        },
    ];

    // Preference categories data
    const preferenceCategories = [
        {id: 1, name: "Funding"},
        {id: 2, name: "Incubators"},
        {id: 3, name: "Enterprises"},
    ];

    // Chat messages data
    const chatMessages = [
        {
            id: 1,
            title: "A new message",
            time: "00:30 AM",
            message: "Take a look",
            unread: 2,
            isHighlighted: true,
        },
        {
            id: 2,
            title: "A new message",
            time: "00:30 AM",
            message: "Take a look",
            unread: 2,
            isHighlighted: false,
        },
    ];

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignup = () => {
        navigate('/signup');
    };

    // Empty state component for different user states
    const EmptyStateMessage = () => {
        if (!user) {
            // User is not authenticated
            return (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-white">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <BoxIcon className="w-6 h-6"/>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-500 text-sm mb-3">Nothing here yet!</p>
                        <div className="flex items-center gap-2 text-sm">
                            <button
                                onClick={handleLogin}
                                className="text-[#8a358a] hover:underline font-medium"
                            >
                                Login
                            </button>
                            <span className="text-gray-400">Or</span>
                            <button
                                onClick={handleSignup}
                                className="text-[#8a358a] hover:underline font-medium"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // User is authenticated but hasn't completed onboarding
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-white">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <img className="w-6 h-6 text-[#8a358a]" alt="Onboarding" src="/frame-570.svg"/>
                </div>
                <div className="text-center">
                    <p className="text-gray-500 text-sm mb-3">Complete your onboarding to access preferences!</p>
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="text-[#8a358a] hover:underline font-medium text-sm"
                    >
                        Complete Onboarding
                    </button>
                </div>
            </div>
        );
    };

    return (
        <Card
            className="flex flex-col w-full min-w-[320px] max-w-sm border-zinc-200 rounded-xl overflow-hidden h-[650px]">
            <CardHeader className="px-6 py-4 border-b border-zinc-200 flex-shrink-0 bg-white">
                <CardTitle className="font-title-base text-[#141b34]">
                    Manage your preferences
                </CardTitle>
            </CardHeader>

            <ScrollArea className="flex-1 overflow-y-auto no-scrollbar">
                <CardContent className="p-0">
                    {/* New Connections Section */}
                    <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between px-6 py-2 w-full">
                            <div className="inline-flex items-center gap-2">
                                <img
                                    className="w-4 h-4 flex-shrink-0"
                                    alt="Anchor point"
                                    src="/anchor-point.svg"
                                />
                                <span className="text-sm font-bold truncate">
                  New Connections
                </span>
                            </div>
                            <span className="text-xs flex-shrink-0">View all</span>
                        </div>

                        {showPreferences ? (
                            <div className="flex flex-col w-full">
                                {connectionRequests.map((request) => (
                                    <div key={request.id} className="flex flex-col w-full bg-white">
                                        <div className="flex items-center gap-2.5 px-6 py-3 border-b border-zinc-200">
                                            <div
                                                className="flex items-center gap-2.5 pl-0 pr-[11px] py-px flex-1 rounded-xl min-w-0">
                                                <div
                                                    className="flex flex-col items-start justify-center gap-2 min-w-0 flex-1">
                                                    <div className="text-[#888888] text-xs leading-[14px]">
                                                        {request.time}
                                                    </div>
                                                    <div
                                                        className="font-bold text-[#141b34] text-sm leading-[14px] truncate w-full">
                                                        {request.type}
                                                    </div>
                                                    <div
                                                        className="text-[#141b34] text-xs leading-[14px] truncate w-full">
                                                        {request.message}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                className="h-[35px] px-3.5 py-1.5 bg-[#8a358a] rounded-xl text-xs flex-shrink-0">
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full">
                                <EmptyStateMessage/>
                            </div>
                        )}
                    </div>

                    {/* My Network Section */}
                    <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between px-6 py-2 w-full">
                            <div className="inline-flex items-center gap-2">
                                <Network className="w-4 h-4"/>
                                <span className="text-sm font-bold truncate">
                  My Network
                </span>
                            </div>
                            <span className="text-xs flex-shrink-0">View all</span>
                        </div>

                        {showPreferences ? (
                            <div className="flex flex-col w-full">
                                {networkContacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="flex items-center gap-3 px-6 py-4 w-full border-b border-zinc-200"
                                    >
                                        <Avatar className="w-[50px] h-[50px] flex-shrink-0">
                                            <img
                                                src={contact.image}
                                                alt={contact.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </Avatar>
                                        <div className="flex flex-col items-start gap-1.5 flex-1 min-w-0">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="font-bold text-[#141b34] text-sm truncate flex-1">
                                                    {contact.name}
                                                </div>
                                                <div className="text-transparent text-[10px] flex-shrink-0">
                                                    Yesterday
                                                </div>
                                                <div className="inline-flex items-center gap-2 flex-shrink-0">
                                                    <img
                                                        className="w-4 h-4"
                                                        alt="Calendar add"
                                                        src="/calendar-add-02.svg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between w-full">
                                                <div className="inline-flex items-center gap-1 flex-1 min-w-0">
                                                    <img className="w-4 h-4 flex-shrink-0" alt="Work" src="/work.svg"/>
                                                    <div className="text-[#141b34] text-xs truncate">
                                                        {contact.role}
                                                    </div>
                                                </div>
                                                <div
                                                    className="flex items-center justify-center w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                                                    <img className="w-4 h-4" alt="View" src="/view.svg"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full">
                                <EmptyStateMessage/>
                            </div>
                        )}
                    </div>

                    {/* Meetings Section */}
                    <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between px-6 py-2 w-full">
                            <div className="inline-flex items-center gap-2">
                                <CalendarDays className="w-4 h-4"/>
                                <span className="text-sm font-bold text-[#141b34] truncate">Meetings</span>
                            </div>
                            <span className="text-xs text-[#141b34] flex-shrink-0">View all</span>
                        </div>

                        {showPreferences ? (
                            <div className="flex flex-col w-full">
                                {meetingRequests.map((meeting) => (
                                    <div key={meeting.id} className="flex flex-col w-full">
                                        <div
                                            className="flex flex-col items-start gap-2.5 px-[22px] py-4 w-full bg-white border-b border-zinc-200">
                                            <div className="flex flex-col items-start gap-1.5 w-full">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="font-bold text-[#141b34] text-sm truncate flex-1">
                                                        {meeting.title}
                                                    </div>
                                                    <div
                                                        className="text-transparent text-[10px] text-right flex-shrink-0">
                                                        Yesterday
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="inline-flex items-center gap-1 flex-1 min-w-0">
                                                        <div className="text-[#141b34] text-xs truncate">
                                                            {meeting.message}
                                                        </div>
                                                    </div>
                                                    <div className="inline-flex items-center gap-2 flex-shrink-0">
                                                        <div
                                                            className="w-6 h-6 flex items-center justify-center rounded-full overflow-hidden">
                                                            <img
                                                                className="w-4 h-4"
                                                                alt="View"
                                                                src="/view.svg"
                                                            />
                                                        </div>
                                                        {meeting.hasCheckmark && (
                                                            <img
                                                                className="w-6 h-6"
                                                                alt="Checkmark circle"
                                                                src="/checkmark-circle-02.svg"
                                                            />
                                                        )}
                                                        {meeting.hasCancel && (
                                                            <img
                                                                className="w-6 h-6"
                                                                alt="Cancel circle"
                                                                src="/cancel-circle.svg"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full">
                                <EmptyStateMessage/>
                            </div>
                        )}
                    </div>

                    {/* Preferences Section */}
                    <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between px-6 py-2 w-full">
                            <div className="inline-flex items-center gap-2">
                                <ListFilter className="w-4 h-4"/>
                                <span className="text-sm font-bold truncate">
                  Preferences
                </span>
                            </div>
                            <span className="text-xs flex-shrink-0">View all</span>
                        </div>

                        {showPreferences ? (
                            <div className="flex flex-col items-start gap-3 w-full">
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="categories" className="border-0">
                                        <AccordionTrigger className="px-6 py-2 bg-[#f6f6f6] hover:no-underline">
                      <span className="font-body-caption text-[#141b34] text-xs truncate">
                        Categories (What I am looking for)
                      </span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-col items-start gap-2.5 p-3">
                                                <div
                                                    className="flex items-center gap-3 px-6 py-3 h-10 w-full bg-[#f6f6f6] rounded-lg">
                                                    <img
                                                        className="w-4 h-4 flex-shrink-0"
                                                        alt="Search"
                                                        src="/search-01-1.svg"
                                                    />
                                                    <span className="font-body-caption text-[#141b34] truncate">
                            Search categories
                          </span>
                                                </div>
                                            </div>

                                            <div
                                                className="flex flex-col items-start gap-px p-3 max-h-[158px] overflow-y-auto">
                                                {preferenceCategories.map((category) => (
                                                    <div
                                                        key={category.id}
                                                        className="flex items-center gap-3 px-3 py-2 w-full bg-white border-b border-zinc-200"
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className="text-[#141b34] text-xs truncate flex-1">
                                                                {category.name}
                                                            </div>
                                                            <img
                                                                className="w-6 h-6 flex-shrink-0"
                                                                alt="Checkmark square"
                                                                src="/checkmark-square-01.svg"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="subcategories" className="border-0">
                                        <AccordionTrigger className="px-6 py-2 bg-[#f6f6f6] hover:no-underline">
                      <span className="font-body-caption text-[#141b34] text-xs truncate">
                        Sub-Categories (What I am looking for)
                      </span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            {/* Sub-categories content would go here */}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        ) : (
                            <div className="w-full">
                                <EmptyStateMessage/>
                            </div>
                        )}
                    </div>

                    {/* Chats Section */}
                    <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between px-6 py-2 w-full">
                            <div className="inline-flex items-center gap-2">
                                <MessageCircleCodeIcon className="w-4 h-4"/>
                                <span className="text-sm font-bold truncate">
                  Charts
                </span>
                            </div>
                            <span className="text-xs flex-shrink-0">View all</span>
                        </div>

                        {showPreferences ? (
                            <div className="flex flex-col w-full">
                                {chatMessages.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`flex items-center gap-3 px-6 py-4 w-full border-b border-zinc-200 ${chat.isHighlighted ? "bg-[#f9f9f9]" : ""}`}
                                    >
                                        <img
                                            className="w-[50px] h-[50px] object-cover flex-shrink-0"
                                            alt="Profile"
                                            src="/ellipse-10-2.svg"
                                        />
                                        <div className="flex flex-col items-start gap-1.5 flex-1 min-w-0">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="font-bold text-[#141b34] text-sm truncate flex-1">
                                                    {chat.title}
                                                </div>
                                                <div className="text-[#5f5f5f] text-[10px] text-right flex-shrink-0">
                                                    {chat.time}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between w-full">
                                                <div className="text-[#5f5f5f] text-xs truncate flex-1">
                                                    {chat.message}
                                                </div>
                                                <Badge
                                                    className="w-5 h-5 p-[3px] bg-[#8a358a] rounded-full flex-shrink-0">
                          <span className="font-bold text-white text-xs text-center">
                            {chat.unread}
                          </span>
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full">
                                <EmptyStateMessage/>
                            </div>
                        )}
                    </div>
                </CardContent>
            </ScrollArea>
        </Card>
    );
};