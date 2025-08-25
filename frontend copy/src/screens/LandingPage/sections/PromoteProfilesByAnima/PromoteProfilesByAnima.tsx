import {ArrowUpRightIcon, EyeIcon, MapPinIcon, PlusCircleIcon, Save,} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {Button} from "../../../../components/ui/button";
import {Card, CardContent} from "../../../../components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../../components/ui/dialog";
import {usePromotedSearchQuery,} from "../../../../lib/api/userApi.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "../../../../components/ui/select";
import {Input} from "../../../../components/ui/input.tsx";
import {useFormik} from "formik";
import {
    useAcceptConnectionRequestMutation,
    useRejectConnectionRequestMutation,
    useSendConnectionRequestMutation
} from "../../../../lib/api/connectionsApi.ts";
import {ConnectionRequestBody} from "../../../../lib/store/slices/connections.ts";
import {JSX, useState} from "react";
import {toast} from "sonner";
import GLoader from "../../../../components/ui/loader.tsx";

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

export const PromoteProfilesByAnima = ({search, selectedCategories, selectedCountry, hasConnection}: {
    search: string,
    selectedCategories: string[],
    selectedCountry?: string,
    hasConnection?: boolean
}): JSX.Element => {
    const navigate = useNavigate();
    const {data: searchResultsData, isFetching: isFetchingGlobalSearch} = usePromotedSearchQuery({
        q: search,
        cursor: "",
        size: 10,
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
        country: selectedCountry === "All Countries" ? "" : selectedCountry,
        hasConnection: hasConnection
    });

    const searchResults = searchResultsData?.data?.users || [];

    const handleViewProfile = (profileId: string) => {
        navigate(`/user/${profileId}`);
    };

    const [sendConnectionRequest, {isLoading: isConnecting}] = useSendConnectionRequestMutation();
    const [acceptConnectionRequest, {isLoading: isAccepting}] = useAcceptConnectionRequestMutation();
    const [rejectConnectionRequest, {isLoading: isRejecting}] = useRejectConnectionRequestMutation();

    const [recipientId, setRecipientId] = useState<string>("");

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
                })
                .catch(() => {
                    toast.error("Failed to send connection request");
                });
        },
    });

    if (searchResultsData == undefined) return <></>;

    interface DisplayedStatus {
        status: string,
        connect?: boolean,
        acceptRequest?: boolean,
    }

    const getConnectionStatus = (connectionStatus: 'NONE' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'CONNECTED' | 'REQUEST_REJECTED' | 'REQUEST_CANCELLED'): DisplayedStatus => {
        switch (connectionStatus) {
            case 'NONE':
                return {
                    status: 'Connect',
                    connect: true,
                };
            case 'REQUEST_SENT':
                return {
                    status: 'Pending Response',
                    connect: false,
                };
            case 'REQUEST_RECEIVED':
                return {
                    status: 'Accept Request',
                    acceptRequest: true,
                }
            case 'CONNECTED':
                return {
                    status: 'Connected',
                    connect: false,
                }
            case 'REQUEST_REJECTED':
                return {
                    status: 'Connect',
                    connect: true,
                }
            case 'REQUEST_CANCELLED':
                return {
                    status: 'Connect',
                    connect: true,
                }
            default:
                return {
                    status: 'Connect',
                    connect: true,
                };
        }
    };

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
        isFetchingGlobalSearch ?
            <div className="flex items-center justify-center h-full">
                <GLoader className="w-8 h-8 text-brand-colorsprimary"/>
            </div>
            :
            <div className="p-6 md:pb-6 md:p-0">
                <div
                    className="flex flex-col sm:flex-row gap-5 max-w-[1860px]  overflow-x-auto whitespace-nowrap w-full scroll-smooth"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {searchResults.map((profile) => {
                        const status = getConnectionStatus(profile.connectionStatus);
                        return (
                            <Card
                                key={profile.id}
                                className="min-w-[320px] md:min-w-[400px] bg-white"
                            >
                                <CardContent className="p-4">
                                    <div className="flex flex-col items-start gap-3 w-full">
                                        <div className="flex items-center gap-3 w-full">
                                            <div
                                                className="w-[70px] h-[70px] rounded-xl bg-cover bg-center cursor-pointer flex-shrink-0"
                                                style={{
                                                    backgroundImage: `url(${
                                                        profile.profile?.profilePictureUrl ||
                                                        "/profile-image.png"
                                                    })`,
                                                }}
                                                onClick={() => handleViewProfile(profile.id)}
                                            />

                                            <div
                                                className="flex flex-col flex-1 items-start justify-center gap-2 min-w-0">
                                                <div className="flex flex-col items-start gap-1 w-full">
                                                    <div className="flex items-center justify-between w-full">
                                                        <div
                                                            className="font-title-medium text-default-800 text-sm leading-tight cursor-pointer hover:text-[#8a358a] transition-colors truncate flex-1 mr-2"
                                                            onClick={() => handleViewProfile(profile.id)}
                                                            title={`${
                                                                profile.profile?.companyName ||
                                                                profile.profile?.personalName
                                                            }`}
                                                        >
                                                            {profile.profile?.companyName ||
                                                                profile.profile?.personalName}
                                                        </div>

                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <img
                                                                className="w-5 h-5"
                                                                alt="New releases"
                                                                src="/new-releases-7.svg"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 w-full">
                                                        <MapPinIcon className="w-3 h-3 flex-shrink-0"/>
                                                        <div
                                                            className="font-normal text-default-800 text-xs leading-normal truncate">
                                                            {profile.profile?.registrationCountry ||
                                                                profile.profile?.residenceCountry ||
                                                                "Unknown Location"}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 w-full">
                                                        <ArrowUpRightIcon className="w-3 h-3 flex-shrink-0"/>
                                                        <div
                                                            className="font-normal text-[#141b34] text-xs leading-normal underline cursor-pointer hover:text-[#8a358a] transition-colors truncate"
                                                            onClick={() => handleViewProfile(profile.id)}
                                                        >
                                                            Visit profile
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between w-full gap-2">
                                            <div
                                                className="flex flex-col items-start justify-center gap-1 flex-1 min-w-0">
                                                <div className="flex flex-col w-full items-start gap-1">
                                                    <div className="flex items-center gap-2 w-full">
                                                        <img
                                                            className="w-3 h-3 flex-shrink-0"
                                                            alt="Job search"
                                                            src="/job-search.svg"
                                                        />
                                                        <div
                                                            className="font-normal text-default-800 text-xs leading-normal truncate">
                                                            {profile.industries.slice(0, 1)}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 w-full">
                                                        <img
                                                            className="w-3 h-3 flex-shrink-0"
                                                            alt="Eye"
                                                            src="/eye.svg"
                                                        />
                                                        <div
                                                            className="font-normal text-default-800 text-xs leading-normal truncate">
                                                            {profile.interests.slice(0, 2).join(", ")}{" "}
                                                            {profile.interests.length - 2 > 0
                                                                ? `+ ${profile.interests.length - 2}`
                                                                : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Dialog>
                                                <DialogTrigger>
                                                    <Button
                                                        variant={"outline"}
                                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-[#E5D8E7] rounded-xl flex-shrink-0 text-xs"
                                                    >
                                                        <EyeIcon
                                                            className="w-4 h-4 text-brand-colorsprimary hover:text-brand-colorsprimary/80"/>
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
                                                                        "/profile-image.png"
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
                                                                <div
                                                                    className="flex items-center gap-2 text-gray-600">
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
                                                            <h4 className="font-semibold">Specializations</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {profile.industries?.map((item, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                                                                    >
                                  {item}
                                </span>
                                                                ))}
                                                            </div>
                                                            {profile.interests && (
                                                                <>
                                                                    <h4 className="font-semibold">Looking for</h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {profile.interests.map((item, index) => (
                                                                            <span
                                                                                key={index}
                                                                                className="px-3 py-1 bg-[#8a358a]/10 text-[#8a358a] rounded-full text-sm"
                                                                            >
                                      {item}
                                    </span>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <Button
                                                                onClick={() => handleViewProfile(profile.id)}
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
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {!status.acceptRequest && <Dialog>
                                                <DialogTrigger disabled={!status.connect}>
                                                    <Button
                                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-brand-colorsprimary rounded-xl flex-shrink-0 text-xs">
                                                        <PlusCircleIcon className="w-4 h-4"/>
                                                        <span className="font-body-caption text-white">
                              {status.status}
                            </span>
                                                    </Button>
                                                </DialogTrigger>

                                                <DialogContent>
                                                    <DialogTitle>Connection Request</DialogTitle>
                                                    <DialogDescription className="mb-4">
                                                        Please select the reason why you want to connect with
                                                        this person
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
                                            </Dialog>}

                                            {status.acceptRequest === true && (
                                                <Dialog>
                                                    <DialogTrigger>
                                                        <Button
                                                            className="flex items-center justify-center gap-1 px-3 py-2 bg-brand-colorsprimary rounded-xl flex-shrink-0 text-xs">
                                                            Accept Request
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Accept Connection Request</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to accept this connection
                                                                request?
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="flex w-full gap-auto mt-4 justify-between">
                                                            {!isRejecting && <Button
                                                                className="rounded-xl"
                                                                variant={"outline"}
                                                                color="gray"
                                                                onClick={() => handleRejectConnectionRequest(profile.connectionRequestId)}
                                                            >
                                                                Reject
                                                            </Button>}
                                                            {isRejecting && <GLoader className="w-4 h-4"/>}

                                                            {!isAccepting && <Button
                                                                className="flex items-center justify-center gap-1 px-3 py-2 bg-brand-colorsprimary rounded-xl flex-shrink-0 text-xs"
                                                                variant={"default"}
                                                                onClick={() => handleAcceptConnectionRequest(profile.connectionRequestId)}>
                                                                Accept
                                                            </Button>}
                                                            {isAccepting && <GLoader className="w-4 h-4"/>}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
    );
};
