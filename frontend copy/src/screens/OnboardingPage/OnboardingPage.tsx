import {useState} from 'react';
import {ChevronLeftIcon, SearchIcon} from 'lucide-react';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {NavigationBarMainByAnima} from '../LandingPage/sections/NavigationBarMainByAnima';
import {usePreferences} from '../../lib/hooks/usePreferences';
import {useNavigate} from 'react-router-dom';
import {UserPreferences} from '../../types/categories';
import {useGetCategoriesTreeQuery} from '../../lib/api/categoriesApi';
import {useAddUserIndustriesMutation, useAddUserInterestsMutation} from "../../lib/api/userApi.ts";

// API Category types
interface APICategory {
    id: string;
    name: string;
    description?: string;
    subcategories?: APISubcategory[];
}

interface APISubcategory {
    id: string;
    name: string;
    categoryId: string;
    description?: string;
}

type OnboardingStep = 'my-categories' | 'my-subcategories' | 'looking-for-categories' | 'looking-for-subcategories';

export const OnboardingPage = (): JSX.Element => {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('my-categories');
    const [selectedMyCategories, setSelectedMyCategories] = useState<string[]>([]);
    const [selectedMySubcategories, setSelectedMySubcategories] = useState<string[]>([]);
    const [selectedLookingForCategories, setSelectedLookingForCategories] = useState<string[]>([]);
    const [selectedLookingForSubcategories, setSelectedLookingForSubcategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [addUserInterests] = useAddUserInterestsMutation()
    const [addUserIndustries] = useAddUserIndustriesMutation()

    const {setPreferences, completeOnboarding} = usePreferences();
    const navigate = useNavigate();

    // Fetch categories tree from API
    const {
        data: categoriesTreeResponse,
        isLoading: isLoadingCategoriesTree,
        error: categoriesTreeError
    } = useGetCategoriesTreeQuery();

    // Extract categories and subcategories from API response
    const categoriesTree: APICategory[] = categoriesTreeResponse?.data || [];

    // Flatten categories for display
    const categories: APICategory[] = categoriesTree
        .filter(cat => !cat.subcategories || cat.subcategories.length > 0)
        .map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description
        }));

    // Get subcategories for selected categories
    const getSubcategoriesForSelectedCategories = () => {
        const selectedCategoryIds = currentStep === 'my-subcategories' ? selectedMyCategories : selectedLookingForCategories;
        const subcategories: APISubcategory[] = [];

        categoriesTree.forEach(category => {
            if (selectedCategoryIds.includes(category.id) && category.subcategories) {
                category.subcategories.forEach(sub => {
                    subcategories.push({
                        ...sub,
                        categoryId: category.id
                    });
                });
            }
        });

        return subcategories;
    };

    const subcategories = getSubcategoriesForSelectedCategories();

    const getStepTitle = () => {
        switch (currentStep) {
            case 'my-categories':
                return 'Select your categories';
            case 'my-subcategories':
                return 'Select Subcategory';
            case 'looking-for-categories':
                return "Tell us what you're looking for";
            case 'looking-for-subcategories':
                return "Select what you're looking for";
            default:
                return '';
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case 'my-categories':
                return 'Select the categories related to what you do.';
            case 'my-subcategories':
                return 'Select the subcategories to get more specific results';
            case 'looking-for-categories':
                return 'Select the categories and sub-categories of who you wish to see/connect with. This can be changed later.';
            case 'looking-for-subcategories':
                return 'Select the subcategories of people you want to match with.';
            default:
                return '';
        }
    };

    const getCurrentCategories = () => {
        if (currentStep === 'my-categories' || currentStep === 'looking-for-categories') {
            return categories.filter(cat =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return [];
    };

    const getCurrentSubcategories = () => {
        if (currentStep === 'my-subcategories' || currentStep === 'looking-for-subcategories') {
            return subcategories.filter(sub =>
                sub.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return [];
    };

    const handleCategoryToggle = (categoryId: string) => {
        if (currentStep === 'my-categories') {
            setSelectedMyCategories(prev => {
                if (prev.includes(categoryId)) {
                    return prev.filter(id => id !== categoryId);
                } else {
                    return [...prev, categoryId];
                }
            });
        } else if (currentStep === 'looking-for-categories') {
            setSelectedLookingForCategories(prev => {
                if (prev.includes(categoryId)) {
                    return prev.filter(id => id !== categoryId);
                } else {
                    return [...prev, categoryId];
                }
            });
        }
    };

    const handleSubcategoryToggle = (subcategoryId: string) => {
        if (currentStep === 'my-subcategories') {
            setSelectedMySubcategories(prev => {
                if (prev.includes(subcategoryId)) {
                    return prev.filter(id => id !== subcategoryId);
                } else {
                    return [...prev, subcategoryId];
                }
            });
        } else if (currentStep === 'looking-for-subcategories') {
            setSelectedLookingForSubcategories(prev => {
                if (prev.includes(subcategoryId)) {
                    return prev.filter(id => id !== subcategoryId);
                } else {
                    return [...prev, subcategoryId];
                }
            });
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 'my-categories':
                return selectedMyCategories.length >= 2;
            case 'my-subcategories':
                return selectedMySubcategories.length > 0;
            case 'looking-for-categories':
                return selectedLookingForCategories.length >= 2;
            case 'looking-for-subcategories':
                return selectedLookingForSubcategories.length > 0;
            default:
                return false;
        }
    };

    const handleNext = () => {
        setError('');

        if (!canProceed()) {
            if (currentStep === 'my-categories' || currentStep === 'looking-for-categories') {
                setError('Please select at least 2 categories');
            } else {
                setError('Please select at least 1 subcategory');
            }
            return;
        }

        switch (currentStep) {
            case 'my-categories':
                setCurrentStep('my-subcategories');
                break;
            case 'my-subcategories':
                setCurrentStep('looking-for-categories');
                break;
            case 'looking-for-categories':
                setCurrentStep('looking-for-subcategories');
                break;
            case 'looking-for-subcategories':
                handleComplete();
                break;
        }
        setSearchTerm('');
    };

    const handleBack = () => {
        setError('');
        switch (currentStep) {
            case 'my-subcategories':
                setCurrentStep('my-categories');
                break;
            case 'looking-for-categories':
                setCurrentStep('my-subcategories');
                break;
            case 'looking-for-subcategories':
                setCurrentStep('looking-for-categories');
                break;
        }
        setSearchTerm('');
    };

    const handleComplete = () => {
        const preferences: UserPreferences = {
            myCategories: selectedMyCategories,
            mySubcategories: selectedMySubcategories,
            lookingForCategories: selectedLookingForCategories,
            lookingForSubcategories: selectedLookingForSubcategories,
        };

        addUserInterests({categories: [...selectedLookingForSubcategories]})
        addUserIndustries({categories: [...selectedMySubcategories]})
        setPreferences(preferences);
        completeOnboarding();
        navigate('/');
    };

    const getSelectedCategoriesForDisplay = () => {
        if (currentStep === 'my-subcategories') {
            return categories.filter(cat => selectedMyCategories.includes(cat.id));
        }
        if (currentStep === 'looking-for-subcategories') {
            return categories.filter(cat => selectedLookingForCategories.includes(cat.id));
        }
        return [];
    };

    const isShowingCategories = currentStep === 'my-categories' || currentStep === 'looking-for-categories';
    const isShowingSubcategories = currentStep === 'my-subcategories' || currentStep === 'looking-for-subcategories';

    // Show loading state
    if (isLoadingCategoriesTree) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
                <NavigationBarMainByAnima/>
                <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8a358a] mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-[#141b34] mb-2">Loading categories...</h2>
                        <p className="text-gray-600">Please wait while we fetch the available categories.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (categoriesTreeError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
                <NavigationBarMainByAnima/>
                <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
                    <div className="text-center">
                        <div
                            className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#141b34] mb-2">Failed to load categories</h2>
                        <p className="text-gray-600 mb-4">Please try refreshing the page or contact support.</p>
                        <Button onClick={() => window.location.reload()}
                                className="bg-[#8a358a] hover:bg-[#7a2f7a] text-white">
                            Refresh Page
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
            <NavigationBarMainByAnima/>

            <div className="flex items-center justify-center min-h-[calc(100vh-73px)] px-4">
                <div className="flex w-full max-w-7xl">
                    {/* Left side - Instructions */}
                    <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
                        <div className="max-w-md">
                            <h1 className="text-4xl font-bold text-[#141b34] mb-6">
                                {currentStep === 'my-categories' || currentStep === 'my-subcategories'
                                    ? 'Select your categories'
                                    : "Tell us what you're looking for"
                                }
                            </h1>
                            <p className="text-lg text-[#141b34] mb-6">
                                {getStepDescription()}
                            </p>

                            {isShowingSubcategories && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-[#141b34] mb-3 uppercase tracking-wide">
                                        Selected Preferred Categories
                                    </h3>
                                    <div className="space-y-2">
                                        {getSelectedCategoriesForDisplay().map((category) => (
                                            <div key={category.id}
                                                 className="px-6 py-6 bg-[#8a358a]/10 rounded-2xl border border-[#8a358a]/20">
                                                <span
                                                    className="text-sm font-medium text-[#8a358a]">{category.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side - Selection interface */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                        <div
                            className="w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-h-[70vh] overflow-hidden flex flex-col">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-[#141b34] mb-2">{getStepTitle()}</h2>
                                <p className="text-sm text-gray-600">
                                    {currentStep === 'looking-for-categories'
                                        ? "Start with categories, you can select a maximum of number of two (2)."
                                        : getStepDescription()
                                    }
                                </p>
                            </div>

                            {/* Search bar */}
                            <div className="p-4 border border-gray-200 rounded-t-2xl">
                                <div className="relative">
                                    <SearchIcon
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                    <Input
                                        placeholder={isShowingCategories ? "Search categories" : "Search subcategories"}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-10 py-7 bg-gray-100 shadow-none border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Selection area */}
                            <div
                                className="flex-1 overflow-y-auto mb-6 border-b border-r border-l border-gray-200 rounded-b-2xl p-4">
                                {isShowingCategories && (
                                    <div className="space-y-3">
                                        {getCurrentCategories().map((category) => (
                                            <div
                                                key={category.id}
                                                onClick={() => handleCategoryToggle(category.id)}
                                                className={`p-4 rounded-lg cursor-pointer transition-all ${
                                                    (currentStep === 'my-categories' && selectedMyCategories.includes(category.id)) ||
                                                    (currentStep === 'looking-for-categories' && selectedLookingForCategories.includes(category.id))
                                                        ? 'border-[#8a358a] bg-[#8a358a]/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {((currentStep === 'my-categories' && selectedMyCategories.includes(category.id)) ||
                                                        (currentStep === 'looking-for-categories' && selectedLookingForCategories.includes(category.id))) && (
                                                        <div
                                                            className="w-4 h-4 bg-[#8a358a] rounded-sm flex items-center justify-center">
                                                            <span className="text-white text-xs">✓</span>
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-[#141b34]">{category.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isShowingSubcategories && (
                                    <div className="space-y-3">
                                        {subcategories.map((subcategory) => (
                                            <div
                                                key={subcategory.id}
                                                onClick={() => handleSubcategoryToggle(subcategory.id)}
                                                className={`p-4 rounded-lg cursor-pointer transition-all ${
                                                    (currentStep === 'my-subcategories' && selectedMySubcategories.includes(subcategory.id)) ||
                                                    (currentStep === 'looking-for-subcategories' && selectedLookingForSubcategories.includes(subcategory.id))
                                                        ? 'border-[#8a358a] bg-[#8a358a]/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {((currentStep === 'my-subcategories' && selectedMySubcategories.includes(subcategory.id)) ||
                                                        (currentStep === 'looking-for-subcategories' && selectedLookingForSubcategories.includes(subcategory.id))) && (
                                                        <div
                                                            className="w-4 h-4 bg-[#8a358a] rounded-sm flex items-center justify-center">
                                                            <span className="text-white text-xs">✓</span>
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-[#141b34]">{subcategory.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            {/* Navigation buttons */}
                            <div className="flex justify-between">
                                {currentStep !== 'my-categories' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBack}
                                        className="flex items-center gap-2 px-6 py-6 border-gray-200 hover:bg-gray-50 rounded-2xl"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4"/>
                                        Back
                                    </Button>
                                )}

                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className={`rounded-2xl px-8 py-6 bg-[#8a358a] hover:bg-[#7a2f7a] text-white font-semibold transition-colors ${
                                        currentStep === 'my-categories' ? 'ml-auto' : ''
                                    }`}
                                >
                                    {currentStep === 'looking-for-subcategories' ? 'Save & Continue' : 'Next'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};