import React, {Dispatch, JSX, SetStateAction, useEffect, useState} from "react";
import {
    CheckCircleIcon,
    CheckIcon,
    ClockIcon,
    EyeIcon,
    MapPinIcon,
    PlusCircleIcon,
    Save,
    Search,
    SlidersHorizontalIcon,
    UserPlusIcon,
    X,
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {Button} from "../../../../components/ui/button";
import {Card, CardContent} from "../../../../components/ui/card";
import {ScrollArea} from "../../../../components/ui/scroll-area";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../../components/ui/dialog";
import {useGlobalSearchQuery} from "../../../../lib/api/userApi.ts";
import {SearchProfile} from "../../../../lib/store/slices/searchSlice.ts";
import {Input} from "../../../../components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "../../../../components/ui/select";
import {useFrameByAnima} from "./hooks.ts";
import GLoader from "../../../../components/ui/loader.tsx";
import {useFormik} from "formik";
import {ConnectionRequestBody} from "../../../../lib/store/slices/connections.ts";
import {
    useAcceptConnectionRequestMutation,
    useRejectConnectionRequestMutation,
    useSendConnectionRequestMutation,
} from "../../../../lib/api/connectionsApi.ts";
import {toast} from "sonner";
import {useAuth} from "../../../../lib/hooks/useAuth.ts";

const reasons = [
    "I want to explore possible collaborations",
    "I want to present to you my service/product",
    "I want to buy your services/products",
    "I am looking for a coach/mentor",
    "I am looking for a coachee/mentee",
    "I am looking for sponsoring for my project",
    "I am looking for a start up to sponsor/support",
    "I am looking for a full time job",
    "I am looking for an employee candidate",
    "I am looking for a part time job",
    "I am freelancer looking for new clients",
    "I want to invite you for my event",
    "I have a business proposal",
    "I want to import your product to my country",
    "I want to export my product to your country",
    "I am looking for a trainer/facilitator",
    "I am looking for a scholarship",
    "I am looking for a training program",
    "I am looking for students for my programs",
];

// Simple checkbox component
const Checkbox = ({
                      checked,
                      onCheckedChange,
                      children,
                  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    children: React.ReactNode;
}) => (
    <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => onCheckedChange(!checked)}
    >
        <div
            className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                checked
                    ? "bg-brand-colorsprimary border-brand-colorsprimary"
                    : "border-gray-300"
            }`}
        >
            {checked && <CheckIcon className="w-4 h-4 text-white"/>}
        </div>
        <span className="text-sm py-1">{children}</span>
    </div>
);

const countries = [
    "Nigeria",
    "Kenya",
    "South Africa",
    "Ghana",
    "Egypt",
    "Ethiopia",
    "Morocco",
    "Tunisia",
    "Uganda",
    "Tanzania",
];

// Profile card component
const ProfileCard = ({profile}: { profile: SearchProfile }) => {
    const navigate = useNavigate();
    const {user} = useAuth();

    const [sendConnectionRequest, {isLoading: isConnecting}] =
        useSendConnectionRequestMutation();
    const [acceptConnectionRequest, {isLoading: isAccepting}] =
        useAcceptConnectionRequestMutation();
    const [rejectConnectionRequest, {isLoading: isRejecting}] =
        useRejectConnectionRequestMutation();

    const [recipientId, setRecipientId] = useState<string>("");
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [smallPreviewOpen, setSmallPreviewOpen] = useState<boolean>(false);

    const formik = useFormik<ConnectionRequestBody>({
        initialValues: {
            recipientId: "",
            reason: "",
            message: "",
        },
        onSubmit: (values) => {
            sendConnectionRequest({
                ...values,
                recipientId,
            })
                .unwrap()
                .then(() => {
                    toast.success("Connection request sent successfully");
                    formik.resetForm();
                    setRecipientId("");
                    setOpenDialog(false);
                })
                .catch(() => {
                    toast.error("Failed to send connection request");
                });
        },
    });

    if (profile == undefined) {
        return <></>;
    }

    const handleViewProfile = () => {
        navigate(`/user/${profile.id}`);
    };

    interface DisplayedStatus {
        status: "Connect" | "Pending Response" | "Accept Request" | "Connected";
        connect?: boolean;
        acceptRequest?: boolean;
    }

    const getConnectionStatus = (
        connectionStatus:
            | "NONE"
            | "REQUEST_SENT"
            | "REQUEST_RECEIVED"
            | "CONNECTED"
            | "REQUEST_REJECTED"
            | "REQUEST_CANCELLED"
    ): DisplayedStatus => {
        switch (connectionStatus) {
            case "NONE":
                return {
                    status: "Connect",
                    connect: true,
                };
            case "REQUEST_SENT":
                return {
                    status: "Pending Response",
                    connect: false,
                };
            case "REQUEST_RECEIVED":
                return {
                    status: "Accept Request",
                    acceptRequest: true,
                };
            case "CONNECTED":
                return {
                    status: "Connected",
                    connect: false,
                };
            case "REQUEST_REJECTED":
                return {
                    status: "Connect",
                    connect: true,
                };
            case "REQUEST_CANCELLED":
                return {
                    status: "Connect",
                    connect: true,
                };
            default:
                return {
                    status: "Connect",
                    connect: true,
                };
        }
    };

    const statusIcons = {
        Connect: <PlusCircleIcon className="w-4 h-4"/>,
        "Pending Response": <ClockIcon className="w-4 h-4"/>,
        "Accept Request": <UserPlusIcon className="w-4 h-4"/>,
        Connected: <CheckCircleIcon className="w-4 h-4"/>,
    };

    const status = getConnectionStatus(profile.connectionStatus);

    const handleRejectConnectionRequest = (connectionRequestId?: string) => {
        if (!connectionRequestId) return;

        rejectConnectionRequest({requestId: connectionRequestId})
            .unwrap()
            .then(() => {
                toast.success("Connection request rejected successfully");
            })
            .catch(() => {
                toast.error("Failed to reject connection request");
            });
    };
    const handleAcceptConnectionRequest = (connectionRequestId?: string) => {
        if (!connectionRequestId) return;

        acceptConnectionRequest({requestId: connectionRequestId})
            .unwrap()
            .then(() => {
                toast.success("Connection request accepted successfully");
            })
            .catch(() => {
                toast.error("Failed to accept connection request");
            });
    };

    return (
        <div className="flex flex-col w-full items-start gap-3 py-3">
            <div className="relative w-full h-[100px]">
                <div
                    className="flex w-full items-center gap-2.5 p-2.5 relative rounded-xl overflow-hidden border border-solid border-zinc-200 bg-[url(..//frame-416-11.png)] bg-cover bg-center">
                    <div
                        className="relative w-20 h-20 rounded-[100px] border-2 border-solid border-zinc-200 cursor-pointer"
                        style={{
                            backgroundImage: `url(${
                                profile.profile?.profilePictureUrl ||
                                "https://avatar.iran.liara.run/public/12"
                            })`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                        onClick={() => setSmallPreviewOpen(true)}
                    />
                </div>
            </div>

            <div className="flex flex-col items-end gap-5 w-full">
                <div className="flex items-start justify-between w-full">
                    <div className="flex flex-col w-full items-start gap-2">
                        <div className="flex items-center align-middle gap-1 w-full min-h-8">
                            {
                                /*<img
                                    className="w-6 h-6"
                                    alt="New releases"
                                    src="/new-releases-7.svg"
                                />*/
                            }
                            <div
                                className="font-bold text-[#141b34] text-sm [font-family:'Host_Grotesk',Helvetica] cursor-pointer hover:text-[#8a358a] transition-colors"
                                onClick={() => setSmallPreviewOpen(true)}
                            >
                                {profile.profile?.companyName || profile.profile?.personalName}
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full">
                            <MapPinIcon className="w-4 h-4"/>
                            <div className="font-normal text-[#141b34] text-xs [font-family:'Host_Grotesk',Helvetica]">
                                {profile.profile?.registrationCountry ||
                                    profile.profile?.residenceCountry ||
                                    "Unknown Location"}
                            </div>
                        </div>
                    </div>

                    <Dialog open={smallPreviewOpen} onOpenChange={setSmallPreviewOpen}>
                        <DialogTrigger>
                            <Button
                                variant={"outline"}
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-[#E5D8E7] rounded-xl flex-shrink-0 text-xs"
                            >
                                <EyeIcon className="w-4 h-4 text-brand-colorsprimary"/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl mb-4">
                                    Profile Preview
                                </DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-24 h-24 rounded-full border-2 border-solid border-zinc-200"
                                        style={{
                                            backgroundImage: `url(${
                                                profile.profile?.profilePictureUrl ||
                                                "https://avatar.iran.liara.run/public/12"
                                            })`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }}
                                    />
                                    <div>
                                        <h3 className="text-lg font-bold mb-1">
                                            {profile.profile?.companyName ||
                                                profile.profile?.personalName}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPinIcon className="w-4 h-4"/>
                                            <span>
                        {profile.profile?.registrationCountry ||
                            profile.profile?.residenceCountry ||
                            "Unknown Location"}
                      </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-semibold">Background</h4>
                                    <p className="text-gray-600">
                                        {profile.profile?.biography ||
                                            `A passionate professional located in ${
                                                profile.profile?.registrationCountry ||
                                                profile.profile?.residenceCountry ||
                                                "Unknown Location"
                                            }`}
                                    </p>
                                    <h4 className="font-semibold">Profile Details</h4>
                                    <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {profile.profile?.registrationCountry ||
                          profile.profile?.residenceCountry ||
                          "Unknown Location"}
                    </span>
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {profile.profile?.residenceCountry}
                    </span>
                                        {
                                            <span
                                                className="px-3 py-1 bg-[#8a358a]/10 text-[#8a358a] rounded-full text-sm">
                        Boosted Profile
                      </span>
                                        }
                                    </div>
                                </div>
                                {user && (
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleViewProfile}
                                            className="flex-1 bg-[#8a358a] hover:bg-[#7a2f7a] text-white"
                                        >
                                            View Full Profile
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="flex-1"
                                            onClick={() => {
                                                // Navigate to messages page with intent to start conversation
                                                navigate(`/messages?userId=${profile.id}&action=start-conversation`);
                                            }}
                                        >
                                            Message
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center justify-between w-full">
                {!status.acceptRequest && (
                    <Dialog
                        open={openDialog}
                        onOpenChange={(e) => {
                            if (!user && e) {
                                toast.info("You need to be logged in to send a connection request");
                                setOpenDialog(false);
                                navigate("/login");
                            } else setOpenDialog(e);
                        }}
                    >
                        <DialogTrigger disabled={!status.connect}>
                            <Button
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-brand-colorsprimary rounded-xl flex-shrink-0 text-xs">
                                {statusIcons[status.status] || (
                                    <PlusCircleIcon className="w-4 h-4"/>
                                )}
                                {status.status}
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogTitle>Connection Request</DialogTitle>
                            <DialogDescription className="mb-4">
                                Please select the reason why you want to connect with this
                                person
                            </DialogDescription>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setRecipientId(profile.id);
                                    formik.handleSubmit({
                                        ...e,
                                    });
                                }}
                            >
                                <div className="flex flex-col gap-3">
                                    <label className="w-full">
                                        <Select
                                            onValueChange={(value) =>
                                                formik.setFieldValue("reason", value)
                                            }
                                        >
                                            <SelectTrigger
                                                className="flex items-center justify-between w-full px-6 py-6 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent">
                                                <SelectValue placeholder="Select reason"/>
                                            </SelectTrigger>
                                            <SelectContent
                                                className="bg-white shadow-md rounded-xl border border-solid border-zinc-200 max-h-[300px] overflow-y-auto">
                                                {reasons.map((reason) => (
                                                    <SelectItem
                                                        key={reason}
                                                        value={reason}
                                                        className="cursor-pointer hover:bg-[#8A358A]/10 px-4 py-2 text-sm rounded-lg"
                                                    >
                                                        {reason}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </label>
                                    <label>
                                        <Input
                                            className="w-full px-6 py-8 pb-12 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                                            defaultValue="Message"
                                            name="message"
                                            value={formik.values.message}
                                            onChange={formik.handleChange}
                                            placeholder="Message"
                                        />
                                    </label>
                                </div>

                                <div className="flex w-full gap-auto mt-4 justify-between">
                                    <DialogClose>
                                        <Button
                                            className="rounded-xl"
                                            variant={"outline"}
                                            color="gray"
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>

                                    <Button
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-brand-colorsprimary rounded-xl flex-shrink-0 text-xs"
                                        variant={"default"}
                                        type="submit"
                                    >
                                        {isConnecting ? (
                                            <GLoader className="w-4 h-4"/>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4"/>
                                            </>
                                        )}
                                        Save
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
                {status.acceptRequest === true && (
                    <Dialog>
                        <DialogTrigger>
                            <Button
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-brand-colorsprimary rounded-xl flex-shrink-0 text-xs">
                                Accept Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader className="my-8">
                                <DialogTitle>Accept Connection Request</DialogTitle>
                                <DialogDescription className="text-primary my-12">
                                    Are you sure you want to accept this connection request?
                                    <div className="">
                                        <div
                                            className="ring-1 ring-gray-200 bg-white rounded-xl px-4 py-2 mt-8 space-y-1">
                                            <h3 className="font-bold text-brand-colorsprimary text-sm">
                                                Connection reason
                                            </h3>
                                            <p className="text-primary text-xs font-light">
                                                I am looking for a start up to sponsor/support
                                            </p>
                                        </div>
                                        <div
                                            className="ring-1 ring-gray-200 bg-white rounded-xl px-4 py-2 my-4 space-y-1">
                                            <h3 className="font-bold text-brand-colorsprimary text-sm">
                                                Message
                                            </h3>
                                            <p className="text-primary text-xs font-light">
                                                I am looking for a start up to sponsor/support
                                            </p>
                                        </div>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex w-full gap-auto justify-between">
                                {!isRejecting && (
                                    <Button
                                        className="rounded-xl"
                                        variant={"outline"}
                                        color="gray"
                                        onClick={() =>
                                            handleRejectConnectionRequest(profile.connectionRequestId)
                                        }
                                    >
                                        Reject
                                    </Button>
                                )}
                                {isRejecting && <GLoader className="w-4 h-4"/>}

                                {!isAccepting && (
                                    <Button
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-brand-colorsprimary rounded-xl flex-shrink-0 text-xs"
                                        variant={"default"}
                                        onClick={() =>
                                            handleAcceptConnectionRequest(profile.connectionRequestId)
                                        }
                                    >
                                        Accept
                                    </Button>
                                )}
                                {isAccepting && <GLoader className="w-4 h-4"/>}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
};

export const FrameByAnima = ({
                                 search,
                                 selectedCategories,
                                 selectedCountry,
                                 hasConnection,
                                 noPagination,
                                 setNoPagination
                             }: {
    search: string;
    selectedCategories: string[];
    selectedCountry?: string;
    hasConnection?: boolean;
    noPagination?: boolean
    setNoPagination: Dispatch<SetStateAction<boolean>>
}): JSX.Element => {
    const {user} = useAuth();
    const {
        selectedInterests,
        setSelectedInterests,
        searchQuery,
        setSearchQuery,
        setSelectedCountry,
        handleSelectInterest,
        handleDeselectInterest,
        interests,
        categories,
        isFetchingInterests,
        isFetchingCategories,
    } = useFrameByAnima();

    const [cursor, setCursor] = useState<string>("");

    const [paginatedData, setPaginatedData] = useState<SearchProfile[]>([]);

    const {data: searchResultsData, isFetching: isFetchingGlobalSearch} =
        useGlobalSearchQuery({
            q: search,
            size: 10,
            categoryIds: selectedCategories,
            country: selectedCountry === "All Countries" ? "" : selectedCountry,
            hasConnection: hasConnection,
            cursor: !noPagination ? cursor : "",
        });

    const searchResults = paginatedData;

    useEffect(() => {
        if (searchResultsData) {
            if (cursor && !noPagination) {
                setPaginatedData([
                    ...paginatedData,
                    ...(searchResultsData?.data?.users || []),
                ]);
            } else {
                setPaginatedData(searchResultsData?.data?.users || []);
            }
        }
    }, [searchResultsData]);

    useEffect(() => {
        if (categories) {
            setSelectedInterests(interests.map((interest) => interest?.id));
        }
    }, [categories]);

    if (searchResultsData == undefined) {
        return <></>;
    }

    // Split results into different sections
    const forYouProfiles = searchResults;

    const hasActiveFilters = false;
    const nextCursor = searchResultsData?.data?.pagination?.nextCursor || "";
    const hasNextCursor = searchResultsData?.data?.pagination?.hasNext;

    return (
        <ScrollArea className="h-fit w-full flex-1">
            <div className="flex flex-col w-full gap-12 p-4">
                {/* For You Section */}
                <section className="flex flex-col gap-5 w-full">
                    <div className="flex flex-col items-start md:flex-row md:items-end gap-4">
                        <div className="flex flex-col w-full">
                            <h2 className="[font-family:'Host_Grotesk',Helvetica] font-bold text-[#141b34] text-base">
                                {hasActiveFilters ? "Search Results" : "For You"}
                            </h2>
                            <p className="max-w-fit font-normal text-[#141b34] text-xs leading-relaxed [font-family:'Host_Grotesk',Helvetica]">
                                {hasActiveFilters
                                    ? `Found ${searchResults.length} profile${
                                        searchResults.length !== 1 ? "s" : ""
                                    } matching your search criteria.`
                                    : "Match and connect with potential partners, sponsors, organizations and take your business ventures to an African level."}
                            </p>
                        </div>

                        {user && (
                            <Dialog>
                                <DialogTrigger>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-3 px-4 py-2 rounded-[100px] border border-solid border-zinc-200"
                                    >
                                        <SlidersHorizontalIcon className="w-4 h-4"/>
                                        <span
                                            className="[font-family:'Host_Grotesk',Helvetica] font-normal text-[#141b34] text-xs whitespace-nowrap">
                          Personalize your results
                        </span>
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="max-w-md">
                                    {/* Selected Filters */}
                                    {selectedInterests.length > 0 && (
                                        <div className="mb-4 max-h-32 overflow-y-auto scrollbar-hide">
                                            <div className="flex flex-wrap gap-2">
                                                {categories
                                                    ?.filter((category) =>
                                                        selectedInterests.includes(category?.id)
                                                    )
                                                    ?.map((filter) => (
                                                        <div
                                                            key={filter?.id}
                                                            className="flex items-center gap-1 px-4 py-3 border border-gray-200 rounded-2xl text-xs"
                                                        >
                                                            <span>{filter?.name}</span>
                                                            <button
                                                                onClick={() => {
                                                                    handleDeselectInterest(filter?.id);
                                                                    setSelectedInterests(
                                                                        selectedInterests.filter(
                                                                            (id) => id !== filter?.id
                                                                        )
                                                                    );
                                                                }}
                                                                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                                            >
                                                                <X className="w-3 h-3"/>
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Country Selection */}
                                    <div className="mb-4">
                                        <Select
                                            value={selectedCountry}
                                            onValueChange={setSelectedCountry}
                                        >
                                            <SelectTrigger
                                                className="w-full px-6 py-6 pr-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent">
                                                <SelectValue placeholder="Select a country"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map((country) => (
                                                    <SelectItem key={country} value={country}>
                                                        {country}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Sub-categories */}
                                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                        {/* Search Bar */}
                                        <div className="relative mb-4">
                                            <Input
                                                placeholder="Search sub-categories"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full px-6 py-6 pr-10 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                                            />
                                            <button
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-colorsprimary text-white rounded-full p-2">
                                                <Search className="w-4 h-4"/>
                                            </button>
                                        </div>

                                        {isFetchingCategories || isFetchingInterests ? (
                                            <div className="flex items-center justify-center w-full h-[200px]">
                                                <GLoader className="h-4 w-4"/>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    className="space-y-3 max-h-56 overflow-y-auto scrollbar-hide">
                                                    {categories
                                                        ?.filter(
                                                            (category) =>
                                                                searchQuery === "" ||
                                                                category?.name
                                                                    .toLowerCase()
                                                                    .includes(searchQuery.toLowerCase())
                                                        )
                                                        .map((category) => (
                                                            <Checkbox
                                                                key={category?.id}
                                                                checked={selectedInterests.includes(
                                                                    category?.id
                                                                )}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        handleSelectInterest(category?.id);
                                                                    } else {
                                                                        handleDeselectInterest(category?.id);
                                                                    }
                                                                }}
                                                            >
                                                                {category?.name}
                                                            </Checkbox>
                                                        ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex mt-6">
                                        <Button
                                            className="flex-1 bg-brand-colorsprimary hover:bg-brand-colorsprimary rounded-2xl py-6 px-6 text-white"
                                            onClick={() => {
                                                // Reload the page when filter button is clicked
                                                setTimeout(() => {
                                                    window.location.reload();
                                                }, 100);
                                            }}
                                        >
                                            Change Category
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                    {isFetchingGlobalSearch && noPagination && (<GLoader className="w-8 h-8"/>)}
                    {/* First row of profiles */}
                    <div
                        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {forYouProfiles.map((profile: SearchProfile) => (
                            <Card
                                key={profile.id}
                                className="border-none shadow-none"
                            >
                                <CardContent className="p-0">
                                    <ProfileCard profile={profile}/>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {hasNextCursor && (
                        <div className="flex items-center justify-center w-full">
                            {isFetchingGlobalSearch && <GLoader className="h-2 w-2"/>}
                            <Button
                                variant="link"
                                className="text-brand-colorsprimary font-semibold px-4 py-2 bg-[#E8D7E8]/30 text-xs [font-family:'Host_Grotesk',Helvetica] hover:no-underline hover:bg-[#E8D7E8] rounded-xl"
                                disabled={isFetchingGlobalSearch}
                                onClick={() => {
                                    if (isFetchingGlobalSearch) return;
                                    setNoPagination(false)
                                    setCursor(nextCursor || "");
                                }}
                            >
                                View more
                            </Button>
                        </div>
                    )}
                </section>
            </div>
        </ScrollArea>
    );
};
