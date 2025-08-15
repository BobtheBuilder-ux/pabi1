import React, {useState} from "react";
import {Input} from "../../components/ui/input";
import {Button} from "../../components/ui/button";
import {NavigationBarMainByAnima} from "../LandingPage/sections/NavigationBarMainByAnima";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useFormik} from "formik";
import {useResetPasswordMutation} from "../../lib/api/authApi.ts";
import GLoader from "../../components/ui/loader.tsx";
import {EyeIcon, EyeOffIcon} from "lucide-react";
import {toast} from "sonner";

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">Invalid or missing token.</div>
            </div>
        );
    }

    const [resetPassword, {isLoading}] = useResetPasswordMutation();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: '',
        },
        validate: () => {
            if (!formik.values.newPassword) {
                return {newPassword: "New password is required"};
            }
            if (!formik.values.confirmPassword) {
                return {confirmPassword: "Confirm password is required"};
            }
            if (formik.values.newPassword !== formik.values.confirmPassword) {
                return {confirmPassword: "Passwords do not match"};
            }

            if (formik.values.newPassword.length < 8 || formik.values.confirmPassword.length < 8) {
                return {
                    newPassword: "Password must be at least 8 characters long",
                    confirmPassword: "Password must be at least 8 characters long"
                };
            }
        },
        validateOnChange: false,
        onSubmit: async (values) => {
            if (!token) {
                toast.error("Invalid or missing token.");
                return;
            }

            if (formik.errors.newPassword || formik.errors.confirmPassword) {
                return;
            }

            await resetPassword({
                token: token,
                newPassword: values.newPassword,
            }).unwrap()
                .then((result) => {
                    if (result.success) {
                        toast.success("Password reset successful", {
                            description: "Your password has been successfully reset.",
                        });
                        setPasswordResetSuccess(true);
                        setTimeout(() => {
                            navigate('/login');
                        }, 3000);
                    } else {
                        toast.error("Password reset failed", {
                            description: "Please try again later.",
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error resetting password:", error);
                    toast.error("Failed to reset password. Please try again.");
                });
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
            <NavigationBarMainByAnima/>

            {passwordResetSuccess && (
                <div className="flex items-center justify-center min-h-[calc(100vh-73px)] px-4">
                    <div className="w-full max-w-md">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                            <div className="text-center">
                                <div
                                    className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M5 13l4 4L19 7"/>
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-[#141b34] mb-2">Password Reset Successful!</h2>
                                <p className="text-gray-600 mb-4">Your password has been successfully reset.</p>
                                <p className="text-sm text-gray-500">You can now log in with your new password.</p>
                                <p className="text-sm text-gray-500">Redirecting to login page...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!passwordResetSuccess && <div className="w-full flex justify-center h-[calc(100vh-90px)] items-center">
                <div
                    className="w-full h-fit max-w-lg bg-white/80 border border-[#E4E4E7] backdrop-blur-sm rounded-2xl px-6 lg:px-12 pt-4 lg:pt-20 pb-8 shadow-sm m-12">
                    <div className="mb-8 mt-8 space-y-8">
                        <h2 className="text-3xl font-bold text-[#141b34] mb-2">
                            Reset Password
                        </h2>
                        <p className="text-primary">
                            Enter your account new password, use it to log in next time.
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="relative">
                            <Input
                                type={showNewPassword ? 'text' : 'password'}
                                id="newPassword"
                                name="newPassword"
                                className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                                placeholder="New Password"
                                value={formik.values.newPassword}
                                onChange={formik.handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <EyeOffIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                            </button>
                        </div>
                        {formik.errors.newPassword && formik.touched.newPassword && (
                            <p className="py-2 px-4 text-red-500 text-xs">{formik.errors.newPassword}</p>
                        )}

                        <div className="relative mt-6">
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                                placeholder="Confirm Password"
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? (
                                    <EyeOffIcon className="w-4 h-4"/>
                                ) : (
                                    <EyeIcon className="w-4 h-4"/>
                                )}
                            </button>

                        </div>
                        {formik.errors.confirmPassword && formik.touched.confirmPassword && (
                            <p className="py-2 px-4 text-red-500 text-xs">{formik.errors.confirmPassword}</p>
                        )}

                        <Button
                            type="submit"
                            className="mt-6 w-full bg-[#8a358a] hover:bg-[#7a2f7a] text-white py-8 rounded-2xl font-semibold transition-colors"
                            disabled={isLoading || !formik.values.newPassword || !formik.values.confirmPassword}
                        >
                            {isLoading && <GLoader className="w-4 h-4" useMainBorder={false}/>} Reset Password
                        </Button>
                    </form>
                </div>
            </div>}
        </div>
    );
};

export default ResetPasswordPage;
