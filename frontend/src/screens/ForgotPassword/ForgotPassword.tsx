import React, {useState} from "react";
import {Input} from "../../components/ui/input";
import {Button} from "../../components/ui/button";
import {NavigationBarMainByAnima} from "../LandingPage/sections/NavigationBarMainByAnima";
import {useForgotPasswordMutation} from "../../lib/api/authApi.ts";
import {toast} from "sonner";
import GLoader from "../../components/ui/loader.tsx";
import {CheckCircle} from "lucide-react";

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [forgotPassword, {isLoading}] = useForgotPasswordMutation()
    const [emailSent, setEmailSent] = useState<boolean>(false);

    const handleResetPassword = (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        //validate email format
        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        forgotPassword({email})
            .unwrap()
            .then((res) => {
                if (res.data && !res.data.success) {
                    toast.error("Password reset email not sent successfully, please try again later");
                    return
                }
                setEmailSent(true)
            })
            .catch((error) => {
                    console.error("Error sending password reset email:", error);
                    toast.error("Failed to send password reset email. Please try again.");
                }
            );
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
            <NavigationBarMainByAnima/>

            {emailSent && (
                <div className="flex items-center justify-center min-h-[calc(100vh-73px)] px-4">
                    <div className="w-full max-w-md">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                            <div className="text-center">
                                <div
                                    className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600"/>
                                </div>
                                <h2 className="text-2xl font-bold text-[#141b34] mb-2">Email Sent!</h2>
                                <p className="text-gray-600 mb-4">Please check your email for the reset password
                                    link.</p>
                                <p className="text-sm text-gray-500">If you don't see it, check your spam
                                    folder.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!emailSent && <div className="w-full flex justify-center h-[calc(100vh-90px)] items-center">
                <div
                    className="w-full h-fit max-w-lg bg-white/80 border border-[#E4E4E7] backdrop-blur-sm rounded-2xl px-6 lg:px-12 pt-4 lg:pt-20 pb-8 shadow-sm m-12">
                    <div className="mb-8 mt-8 space-y-8">
                        <h2 className="text-center text-3xl font-bold text-[#141b34] mb-2">
                            Forgot Password?
                        </h2>
                        <p className="text-center">
                            Enter your account’s email and we’ll send you an email to reset
                            the password.
                        </p>
                    </div>

                    <form className="space-y-6">
                        <div>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                                placeholder="Email Address"
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !email}
                            onClick={handleResetPassword}
                            className="w-full bg-[#8a358a] hover:bg-[#7a2f7a] text-white py-8 rounded-2xl font-semibold transition-colors"
                        >
                            {isLoading && <GLoader className="w-4 h-4" useMainBorder={false}/>}
                            Send Email
                        </Button>
                    </form>
                </div>
            </div>}
        </div>
    );
};

export default ForgotPasswordPage;
