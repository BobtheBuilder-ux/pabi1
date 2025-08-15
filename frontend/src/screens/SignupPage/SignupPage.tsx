import {useState} from 'react';
import {NavigationBarMainByAnima} from '../LandingPage/sections/NavigationBarMainByAnima';
import {useNavigate} from 'react-router-dom';
import {toast} from 'sonner';
import {useFormik} from 'formik';

// Import components
import {AccountTypeSelector, CompanyForm, FormActions, IndividualForm, PasswordFields,} from './components';

// Import types
import {AccountType, SignupFormValues} from './types';
import {ImagePlus} from 'lucide-react';
import {Button} from '../../components/ui/button';
import {useRegisterBusinessMutation, useRegisterIndividualMutation} from '../../lib/api/authApi';
import {COUNTRIES} from "../../lib/utils/countries.ts";

const countries = COUNTRIES.map(country => country.title);

export const SignupPage = (): JSX.Element => {
    const [accountType, setAccountType] = useState<AccountType>('individual');
    const [registerIndividual, {isLoading: isRegisteringIndividual}] = useRegisterIndividualMutation();
    const [registerBusiness, {isLoading: isRegisteringBusiness}] = useRegisterBusinessMutation();
    const navigate = useNavigate();

    // Determine if any registration is in progress
    const isRegistering = isRegisteringIndividual || isRegisteringBusiness;

    const formik = useFormik<SignupFormValues>({
        initialValues: {
            // Individual fields
            name: '',
            email: '',
            phone: '',
            biography: '',
            nationality: '',
            residenceCountry: '',
            // Company fields
            companyName: '',
            companyEmail: '',
            companyPhone: '',
            personalEmail: '',
            personalName: '',
            registrationCountry: '',
            // Common fields
            password: '',
            confirmPassword: '',
        },
        validate: (values) => {
            const errors: Partial<SignupFormValues> = {};
            const isEmpty = (value: string | undefined) => !value || value.trim() === '';

            // Shared validation for password
            const validatePassword = () => {
                if (isEmpty(values.password)) errors.password = 'Password is required';
                if (isEmpty(values.confirmPassword)) {
                    errors.confirmPassword = 'Confirm password is required';
                } else if (values.password !== values.confirmPassword) {
                    errors.confirmPassword = 'Passwords do not match';
                }
            };

            if (accountType === 'individual') {
                if (isEmpty(values.name)) errors.name = 'Name is required';
                if (isEmpty(values.email)) errors.email = 'Email is required';
                if (isEmpty(values.nationality)) errors.nationality = 'Nationality is required';
                if (isEmpty(values.residenceCountry)) errors.residenceCountry = 'Residence country is required';

                validatePassword();
            } else if (accountType === 'company') {
                if (isEmpty(values.companyName)) errors.companyName = 'Company name is required';
                if (isEmpty(values.companyEmail)) errors.companyEmail = 'Company email is required';
                if (isEmpty(values.personalName)) errors.personalName = 'Personal name is required';
                if (isEmpty(values.personalEmail)) errors.personalEmail = 'Personal email is required';
                if (isEmpty(values.registrationCountry)) errors.registrationCountry = 'Registration country is required';
                if (isEmpty(values.residenceCountry)) errors.residenceCountry = 'Residence country is required';

                validatePassword();
            }

            return errors;
        },
        onSubmit: (values) => {
            if (accountType === 'individual') {
                const formData = {
                    accountType: 'individual' as const,
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    password: values.password,
                    nationality: values.nationality,
                    residenceCountry: values.residenceCountry,
                    biography: values.biography,
                };

                registerIndividual(formData)
                    .unwrap()
                    .then(() => {
                        navigate('/verify-account?emailSent=true')
                    })
                    .catch((error: any) => {
                        console.error('Individual registration failed:', error);
                        const errorMessage = error.data?.message || 'Failed to create individual account. Please try again.';
                        toast.error('Registration failed', {
                            description: errorMessage,
                        });
                    });
            } else {
                const formData = {
                    accountType: 'company' as const,
                    companyName: values.companyName,
                    companyEmail: values.companyEmail,
                    companyPhone: values.companyPhone,
                    personalName: values.personalName,
                    personalEmail: values.personalEmail,
                    password: values.password,
                    registrationCountry: values.registrationCountry,
                    residenceCountry: values.residenceCountry,
                    biography: values.biography,
                };

                registerBusiness(formData)
                    .unwrap()
                    .then(() => {
                        navigate('/verify-account?emailSent=true')
                    })
                    .catch((error: any) => {
                        console.error('Business registration failed:', error);
                        const errorMessage = error.data?.message || 'Failed to create business account. Please try again.';
                        toast.error('Registration failed', {
                            description: errorMessage,
                        });
                    });
            }
        },
    });

    const handleAccountTypeChange = (type: AccountType) => {
        setAccountType(type);

        // Reset form when switching account types
        if (type === 'individual') {
            formik.setValues({
                ...formik.values,
                // Reset company-specific fields
                companyName: '',
                companyEmail: '',
                companyPhone: '',
                personalEmail: '',
                personalName: '',
                registrationCountry: '',
            });
        } else {
            formik.setValues({
                ...formik.values,
                // Reset individual-specific fields
                name: '',
                email: '',
                phone: '',
                nationality: '',
                residenceCountry: '',
            });
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
            <NavigationBarMainByAnima/>

            <div className="flex justify-center min-h-[calc(100vh-73px)] px-4">
                <div className="flex flex-col w-full max-w-4xl gap-4 p-2 md:gap-6 md:p-8">
                    {/* Cover image */}
                    <div
                        className="flex bg-white items-center justify-between rounded-xl shadow-sm p-4 lg:p-8 sticky top-0">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div
                                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                                    <ImagePlus className="w-5 h-5 text-gray-400"/>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="flex items-center text-xs gap-2 px-4 py-2 border-gray-200 hover:bg-gray-50 text-gray-400"
                        >
                            Upload cover
                            <ImagePlus className="w-4 h-4 text-gray-400"/>

                        </Button>
                    </div>

                    <div className="w-full flex items-center justify-center">
                        <div
                            className="w-full bg-white backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg h-full md:h-[calc(100vh-310px)] overflow-y-auto no-scrollbar">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-[#141b34] mb-2">Create account</h2>
                                <p className="text-sm text-gray-600">Connect with professionals and unlock
                                    opportunities</p>
                            </div>

                            <form onSubmit={formik.handleSubmit} className="space-y-6">
                                {/* Account Type Selection */}
                                <AccountTypeSelector
                                    accountType={accountType}
                                    onAccountTypeChange={handleAccountTypeChange}
                                />

                                {/* Form Fields based on account type */}
                                {accountType === 'individual' ? (
                                    <IndividualForm formik={formik} countries={countries}/>
                                ) : (
                                    <CompanyForm formik={formik} countries={countries}/>
                                )}

                                {/* Password Fields */}
                                <PasswordFields formik={formik}/>

                                {/* Action Buttons */}
                                <FormActions
                                    isRegistering={isRegistering}
                                    onCancel={handleLoginRedirect}
                                />
                            </form>

                            {/* Mobile version of "Sign in" link */}
                            <div className="lg:hidden text-center mt-4">
                                <div className="flex items-center justify-center gap-2 text-[#8a358a]">
                                    <span className="text-sm">Already have an account?</span>
                                    <button
                                        onClick={handleLoginRedirect}
                                        className="text-sm font-semibold underline hover:no-underline"
                                    >
                                        Sign in →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};