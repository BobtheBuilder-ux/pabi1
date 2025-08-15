import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {toast} from 'sonner';
import {NavigationBarMainByAnima} from '../LandingPage/sections/NavigationBarMainByAnima';
import {useVerifyEmailMutation} from '../../lib/api/authApi';
import {CheckCircle} from "lucide-react";

export const VerifyAccountPage = (): JSX.Element => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifyEmail] = useVerifyEmailMutation();
    const [verificationStatus, setVerificationStatus] = useState<'emailSent' | 'pending' | 'success' | 'error'>('pending');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const emailSent = searchParams.get('emailSent');

        if (emailSent) {
            setVerificationStatus('emailSent');
            return;
        }

        if (!token) {
            setVerificationStatus('error');
            setErrorMessage('Verification token not found in URL');
            return;
        }

        verifyEmail({token})
            .unwrap()
            .then((response: any) => {
                if (response.success) {
                    setVerificationStatus('success');
                    toast.success('Email verified successfully!', {
                        description: 'Your account has been verified. You can now log in.',
                    });

                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    setVerificationStatus('error');
                    setErrorMessage(response.message || 'Email verification failed');
                }
            })
            .catch((error: any) => {
                console.error('Email verification failed:', error);
                setVerificationStatus('error');
                setErrorMessage(error.data?.message || 'Email verification failed. Please try again.');

                toast.error('Verification failed', {
                    description: error.data?.message || 'Email verification failed. Please try again.',
                });
            });
    }, [searchParams, navigate, verifyEmail]);

    const renderContent = () => {
        switch (verificationStatus) {
            case "emailSent":
                return (
                    <div className="text-center">
                        <div
                            className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600"/>
                        </div>
                        <h2 className="text-2xl font-bold text-[#141b34] mb-2">Email Sent!</h2>
                        <p className="text-gray-600 mb-4">Please check your email for the verification link.</p>
                        <p className="text-sm text-gray-500">If you don't see it, check your spam folder.</p>
                    </div>
                );
            case 'pending':
                return (
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8a358a] mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-[#141b34] mb-2">Verifying your email...</h2>
                        <p className="text-gray-600">Please wait while we verify your account.</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center">
                        <div
                            className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#141b34] mb-2">Email verified successfully!</h2>
                        <p className="text-gray-600 mb-4">Your account has been verified. You can now log in.</p>
                        <p className="text-sm text-gray-500">Redirecting to login page...</p>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center">
                        <div
                            className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#141b34] mb-2">Verification failed</h2>
                        <p className="text-gray-600 mb-4">{errorMessage}</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 bg-[#8a358a] text-white rounded-lg hover:bg-[#7a2f7a] transition-colors"
                            >
                                Go to Login
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-6 py-2 border border-[#8a358a] text-[#8a358a] rounded-lg hover:bg-[#8a358a] hover:text-white transition-colors"
                            >
                                Sign Up Again
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
            <NavigationBarMainByAnima/>

            <div className="flex items-center justify-center min-h-[calc(100vh-73px)] px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}; 