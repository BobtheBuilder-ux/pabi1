import {useEffect, useState} from "react";
import {Check, Edit, MoreVertical, Plus, RocketIcon, Search, Trash2, X,} from "lucide-react";
import {Button} from "../../../components/ui/button";
import {Input} from "../../../components/ui/input";
import {toast} from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
    useAddUserIndustriesMutation,
    useAddUserInterestsMutation,
    useGetUserIndustriesQuery,
    useGetUserInterestsQuery,
    useRemoveUserIndustriesMutation,
    useRemoveUserInterestsMutation,
} from "../../../lib/api/userApi";
import {APICategory, APISubcategory, useGetCategoriesTreeQuery,} from "../../../lib/api/categoriesApi";
import {Category, SubCategory,} from "../../../lib/store/slices/preferencesSlice.ts";

import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@radix-ui/react-tooltip";
import {
    useBoostIndustryMutation,
    useGetBoostPlansQuery,
    useUnBoostIndustryMutation,
} from "../../../lib/api/boostApi.ts";
import GLoader from "../../../components/ui/loader.tsx";

enum EditCategoryMode {
    INTERESTS = "INTERESTS",
    INDUSTRIES = "INDUSTRIES",
}

// Add Category Dialog Component
const AddCategoryDialog = ({
                               isOpen,
                               onClose,
                               onSave,
                               isSaving = false,
                               mode,
                               otherCategories,
                           }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (categoryId: string, mode?: EditCategoryMode) => void;
    isSaving?: boolean;
    mode?: EditCategoryMode;
    otherCategories: APICategory[];
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleSave = () => {
        if (selectedCategory) {
            onSave(selectedCategory, mode);
        }
    };

    const filteredCategories = otherCategories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80" onClick={onClose}/>

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-[#141b34]">
                            Add Category
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500"/>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Search */}
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
                            <Input
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Categories List */}
                        <div className="space-y-3">
                            {filteredCategories.map((category) => (
                                <div
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                                        selectedCategory === category.id
                                            ? "border-[#8a358a] bg-[#8a358a]/5"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                    <span className="font-medium text-[#141b34]">
                      {category.name}
                    </span>
                                        {selectedCategory === category.id && (
                                            <Check className="w-5 h-5 text-[#8a358a]"/>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={onClose} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-[#8a358a] hover:bg-[#7a2f7a]"
                                disabled={isSaving || !selectedCategory}
                            >
                                {isSaving ? (
                                    <>
                                        <div
                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Adding...
                                    </>
                                ) : (
                                    "Add Category"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Edit Categories Dialog Component
const EditCategoriesDialog = ({
                                  isOpen,
                                  onClose,
                                  currentUserCategories,
                                  currentSystemSubcategories,
                                  onSave,
                                  isSaving = false,
                                  mode,
                              }: {
    isOpen: boolean;
    onClose: () => void;
    currentUserCategories: SubCategory[];
    currentSystemSubcategories: APISubcategory[];
    onSave: (subcategories: string[], mode: EditCategoryMode) => void;
    isSaving?: boolean;
    mode: EditCategoryMode;
}) => {
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
        []
    );
    const [searchTerm, setSearchTerm] = useState("");

    // Update selected categories and subcategories when props change
    useEffect(() => {
        if (currentUserCategories.length > 0) {
            setSelectedSubcategories(
                currentUserCategories.map((category) => category.id)
            );
        }
    }, [currentUserCategories]);

    const filteredSystemSubCategories = currentSystemSubcategories.filter(
        (subcategory) =>
            subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubcategoryToggle = (subcategoryId: string) => {
        setSelectedSubcategories((prev) => {
            const categoryDetails = currentSystemSubcategories.find(
                (sub) => sub.id === subcategoryId
            )!!.id;
            const existingCategory = prev.find((cat) => cat === subcategoryId);

            if (existingCategory) {
                return prev.filter((cat) => cat !== subcategoryId);
            } else {
                return [...prev, categoryDetails];
            }
        });
    };

    const handleSave = () => {
        onSave(selectedSubcategories, mode);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80" onClick={onClose}/>

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-[#141b34]">
                            Edit Categories
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500"/>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Step Navigation */}
                        <div className="flex gap-4">
                            <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Subcategories
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                            {filteredSystemSubCategories.map((subcategory) => (
                                <div
                                    key={subcategory.id}
                                    onClick={() => handleSubcategoryToggle(subcategory.id)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                                        selectedSubcategories.includes(subcategory.id)
                                            ? "border-[#8a358a] bg-[#8a358a]/5"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                    <span className="font-medium text-[#141b34]">
                      {subcategory.name}
                    </span>
                                        {selectedSubcategories.includes(subcategory.id) && (
                                            <Check className="w-5 h-5 text-[#8a358a]"/>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={onClose} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-[#8a358a] hover:bg-[#7a2f7a]"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <div
                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NetworkingTab = (): JSX.Element => {
    const {data: boostPlansData} = useGetBoostPlansQuery();
    const {
        data: userInterestsData,
        isLoading: isLoadingInterests,
        refetch: refetchInterests,
    } = useGetUserInterestsQuery();
    const {
        data: userIndustriesData,
        isLoading: isLoadingIndustries,
        refetch: refetchIndustries,
    } = useGetUserIndustriesQuery();
    const {data: categoriesTreeData, isLoading: isLoadingCategories} =
        useGetCategoriesTreeQuery();

    // Mutation hooks for saving changes
    const [addUserIndustries] = useAddUserIndustriesMutation();
    const [removeUserIndustries] = useRemoveUserIndustriesMutation();

    const [addUserInterests] = useAddUserInterestsMutation();
    const [removeUserInterests] = useRemoveUserInterestsMutation();

    const [boostIndustry, {isLoading: isBoosting}] = useBoostIndustryMutation();
    const [unBoostIndustry, {isLoading: isUnboosting}] = useUnBoostIndustryMutation();
    const isBoostingOrUnboosting = isBoosting || isUnboosting;

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingMode, setEditingMode] = useState<EditCategoryMode>();
    const [categoryToModify, setCategoryToModify] = useState("");
    const [userIndustries, setUserIndustries] = useState<Category[]>([]);

    // Reset dialog state when component unmounts or when dialog should be closed
    useEffect(() => {
        if (!isEditDialogOpen) {
            // Small delay to ensure dialog is fully closed before clearing state
            const timer = setTimeout(() => {
                setEditingCategory(null);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isEditDialogOpen]);

    // Process API data
    const userInterests = (userInterestsData?.data?.categories || [])
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id));
    const sortedUserIndustries = (userIndustries)
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id));
    const categoriesTree = categoriesTreeData?.data || [];
    const otherIndustries = categoriesTree
        .filter(
            (cat) =>
                cat.id && !sortedUserIndustries.some((userCat) => userCat.id === cat.id)
        )
        .filter((cat) => cat.subcategories && cat.subcategories.length > 0);
    const otherInterests = categoriesTree
        .filter(
            (cat) => cat.id && !userInterests.some((userCat) => userCat.id === cat.id)
        )
        .filter((cat) => cat.subcategories && cat.subcategories.length > 0);

    const handleAddCategory = async (
        categoryId: string,
        mode?: EditCategoryMode
    ) => {
        if (!categoryId) return;
        if (!mode) return;

        setIsSaving(true);
        try {
            if (mode === EditCategoryMode.INTERESTS) {
                // Add to interests
                await addUserInterests({categories: [categoryId]}).unwrap();

                // Refresh the data
                await refetchInterests();
            }

            if (mode === EditCategoryMode.INDUSTRIES) {
                // Add to industries (categories)
                await addUserIndustries({categories: [categoryId]}).unwrap();

                // Refresh the data
                await refetchIndustries();
            }

            // Close the dialog
            setIsAddDialogOpen(false);

            // Show success message
            toast.success("Category added successfully!");
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error("Failed to add category. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditCategory = (category: Category, mode: EditCategoryMode) => {
        setEditingCategory(category);
        setIsEditDialogOpen(true);
        setEditingMode(mode);
    };

    const handleDeleteCategory = async (
        categoryId: string,
        mode: EditCategoryMode
    ) => {
        setIsDeleting(categoryId);
        try {
            if (mode === EditCategoryMode.INTERESTS) {
                // Remove from interests
                await removeUserInterests({categories: [categoryId]}).unwrap();
                await refetchInterests();
            }

            if (mode === EditCategoryMode.INDUSTRIES) {
                // Remove from industries (categories)
                await removeUserIndustries({categories: [categoryId]}).unwrap();
                await refetchIndustries();
            }

            toast.success("Category and its subcategories deleted successfully!");
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Failed to delete category. Please try again.");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSaveCategories = async (
        subcategories: string[],
        mode: EditCategoryMode
    ) => {
        if (!editingCategory) return;

        setIsSaving(true);
        try {
            // Determine what needs to be added/removed for categories (industries)
            const userCategories =
                mode === EditCategoryMode.INDUSTRIES ? sortedUserIndustries : userInterests;
            const userCategoryIds = userCategories
                .filter((cat) => cat.id === editingCategory.id)
                .flatMap((cat) => cat.subCategories)
                .map((cat) => cat.id);

            const subcategoriesToAdd = subcategories.filter(
                (cat) => !userCategoryIds.includes(cat)
            );

            const subcategoriesToRemove = userCategoryIds.filter(
                (cat) => !subcategories.includes(cat)
            );

            // Check if there are any changes to save
            const hasChanges =
                subcategoriesToAdd.length > 0 || subcategoriesToRemove.length > 0;

            if (!hasChanges) {
                // No changes to save, just close the dialog
                setIsEditDialogOpen(false);
                return;
            }

            // Make API calls for categories (industries)
            if (subcategoriesToAdd.length > 0) {
                if (mode === EditCategoryMode.INDUSTRIES) {
                    await addUserIndustries({categories: subcategoriesToAdd}).unwrap();
                }

                if (mode === EditCategoryMode.INTERESTS) {
                    await addUserInterests({categories: subcategoriesToAdd}).unwrap();
                }
            }

            if (subcategoriesToRemove.length > 0) {
                if (mode === EditCategoryMode.INDUSTRIES) {
                    await removeUserIndustries({
                        categories: subcategoriesToRemove,
                    }).unwrap();
                }

                if (mode === EditCategoryMode.INTERESTS) {
                    await removeUserInterests({
                        categories: subcategoriesToRemove,
                    }).unwrap();
                }
            }

            // Refresh the data
            if (mode === EditCategoryMode.INTERESTS) {
                await refetchInterests();
            }

            if (mode === EditCategoryMode.INDUSTRIES) {
                await refetchIndustries();
            }

            // Close the dialog
            setIsEditDialogOpen(false);

            // Show success message
            toast.success("Categories updated successfully!");
        } catch (error) {
            console.error("Error saving categories:", error);
            toast.error("Failed to update categories. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleBoostSubcategory = (subCategory: SubCategory) => {
        setCategoryToModify(subCategory.id);
        const boostPlans = boostPlansData?.data || [];
        const sortedPlans = [...boostPlans].sort(
            (a, b) => b.durationDays - a.durationDays
        );
        const boostPlan = sortedPlans[0]; // Get the plan with the longest duration

        const updatedIndustries = sortedUserIndustries.map((cat) => {
                if (cat.subCategories.some((sub) => sub.id === subCategory.id)) {
                    return {
                        ...cat,
                        subCategories: cat.subCategories.map((sub) => {
                            if (sub.id === subCategory.id) {
                                return {...sub, boosted: !sub.boosted};
                            }
                            return sub;
                        }),
                    };
                }
                return cat;
            }
        );

        if (subCategory.boosted) {
            // Unboost the subcategory
            unBoostIndustry({industryId: subCategory.id})
                .unwrap()
                .then(() => {
                    setCategoryToModify("");
                    setUserIndustries(updatedIndustries)
                    toast.success(`${subCategory.name} unboosted successfully!`);
                })
                .catch((error) => {
                    console.error("Error unboosting subcategory:", error);
                    toast.error("Failed to unboost subcategory. Please try again.");
                });
        } else {
            // Boost the subcategory
            boostIndustry({
                categoryId: subCategory.id,
                planId: boostPlan?.id || "",
            })
                .unwrap()
                .then(() => {
                    setCategoryToModify("");
                    setUserIndustries(updatedIndustries)
                    toast.success(`${subCategory.name} boosted successfully!`);
                })
                .catch((error) => {
                    console.error("Error boosting subcategory:", error);
                    toast.error("Failed to boost subcategory. Please try again.");
                });
        }
    };

    useEffect(() => {
        if (userIndustriesData?.data?.categories) {
            setUserIndustries(userIndustriesData.data.categories);
        }
    }, [userIndustriesData?.data?.categories]);

    if (isLoadingInterests || isLoadingIndustries || isLoadingCategories) {
        return (
            <div className="max-w-4xl">
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8a358a]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="bg-white rounded-xl p-8 mb-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <Search className="w-5 h-5 text-[#8a358a]"/>
                    <h1 className="text-2xl font-bold text-[#141b34]">Networking</h1>
                </div>
                <p className="text-gray-600 mb-6">
                    Your networking settings are found here.
                </p>
            </div>

            {/* MY CATEGORIES Section */}
            <div className="bg-white rounded-xl p-8 mb-8 border border-gray-200">
                <h2 className="text-sm font-semibold text-[#141b34] mb-6 uppercase tracking-wide">
                    MY CATEGORIES
                </h2>

                {/* Add Category Button */}
                {otherIndustries.length > 0 && (
                    <Button
                        onClick={() => {
                            setEditingMode(EditCategoryMode.INDUSTRIES);
                            setIsAddDialogOpen(true);
                        }}
                        className="bg-[#8a358a] hover:bg-[#7a2f7a] mb-8 text-white px-6 py-3 rounded-xl flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Add Category
                    </Button>
                )}

                {sortedUserIndustries.length === 0 ? (
                    <div className="text-center py-12">
                        <div
                            className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400"/>
                        </div>
                        <h3 className="text-lg font-semibold text-[#141b34] mb-2">
                            No Categories Yet
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            You haven't added any categories yet. Click "Add Category" to get
                            started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sortedUserIndustries.map((category) => (
                            <div
                                key={category.id}
                                className="border border-gray-200 rounded-xl p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-[#141b34]">
                                        {category.name}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        {/* More Options Dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <MoreVertical className="w-4 h-4 text-gray-500"/>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleEditCategory(
                                                            category,
                                                            EditCategoryMode.INDUSTRIES
                                                        )
                                                    }
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Edit className="w-4 h-4 text-gray-600"/>
                                                    <span>Edit category</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            category.id,
                                                            EditCategoryMode.INDUSTRIES
                                                        )
                                                    }
                                                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                                    disabled={isDeleting === category.id}
                                                >
                                                    {isDeleting === category.id ? (
                                                        <span className="flex items-center gap-2">
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></span>
                              Deleting...
                            </span>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-4 h-4"/>
                                                            <span>Delete</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Subcategories */}
                                <div className="flex flex-wrap gap-2">
                                    {category.subCategories.slice()
                                        .sort((a, b) => a.name.localeCompare(b.name)).map(
                                            (subcategory: SubCategory) => (
                                                <div
                                                    key={category.id}
                                                    className="flex items-center gap-1 px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300"
                                                >
                                                    {categoryToModify == subcategory.id && isBoostingOrUnboosting ?
                                                        <GLoader className="w-4 h-4"/>
                                                        : (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="secondary"
                                                                            className="w-8 h-8"
                                                                            disabled={categoryToModify === subcategory.id && isBoostingOrUnboosting}
                                                                            onClick={(_) => handleBoostSubcategory(subcategory)}
                                                                        >
                                                                            <RocketIcon
                                                                                className={`w-[17px] h-[17px]  ${subcategory.boosted && "text-[#8a358a] fill-[#8a358a]"} `}/>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent
                                                                        className="bg-[#8a358a] text-white px-2 py-1 rounded text-xs shadow-md border-none z-50"
                                                                        side="top"
                                                                        sideOffset={5}
                                                                    >
                                                                        <p>
                                                                            {subcategory.boosted ? "Unboost" : "Boost"}
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}

                                                    <span>{subcategory.name}</span>
                                                    <button
                                                        className="ml-1 hover:bg-gray-100 rounded-full p-0.5"
                                                        onClick={(_) =>
                                                            handleDeleteCategory(
                                                                subcategory.id,
                                                                EditCategoryMode.INDUSTRIES
                                                            )
                                                        }
                                                    >
                                                        <X className="w-3 h-3 text-gray-400"/>
                                                    </button>
                                                </div>
                                            )
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* WHAT I AM LOOKING FOR Section */}
            <div className="bg-white rounded-xl p-8 mb-8 border border-gray-200">
                <h2 className="text-sm font-semibold text-[#141b34] mb-6 uppercase tracking-wide">
                    WHAT I AM LOOKING FOR
                </h2>

                {/* Add Category Button */}
                {otherInterests.length > 0 && (
                    <Button
                        onClick={() => {
                            setEditingMode(EditCategoryMode.INTERESTS);
                            setIsAddDialogOpen(true);
                        }}
                        className="bg-[#8a358a] hover:bg-[#7a2f7a] mb-8 text-white px-6 py-3 rounded-xl flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        Add interest
                    </Button>
                )}

                {userInterests.length === 0 ? (
                    <div className="text-center py-12">
                        <div
                            className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400"/>
                        </div>
                        <h3 className="text-lg font-semibold text-[#141b34] mb-2">
                            No interest Yet
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            You haven't added any interest yet. Click "Add interest" to get
                            started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {userInterests.map((category) => (
                            <div
                                key={category.id}
                                className="border border-gray-200 rounded-xl p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-[#141b34]">
                                        {category.name}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        {/* Boost/Booted Badge */}
                                        {/*<Badge
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        category.isBoosted
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-[#8a358a] text-white"
                      }`}
                    >
                      {category.isBoosted ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Rocket className="w-3 h-3" />
                      )}
                      {category.boostStatus}
                    </Badge>*/}

                                        {/* More Options Dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <MoreVertical className="w-4 h-4 text-gray-500"/>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleEditCategory(
                                                            category,
                                                            EditCategoryMode.INTERESTS
                                                        )
                                                    }
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <Edit className="w-4 h-4 text-gray-600"/>
                                                    <span>Edit category</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            category.id,
                                                            EditCategoryMode.INTERESTS
                                                        )
                                                    }
                                                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                                    disabled={isDeleting === category.id}
                                                >
                                                    {isDeleting === category.id ? (
                                                        <span className="flex items-center gap-2">
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></span>
                              Deleting...
                            </span>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-4 h-4"/>
                                                            <span>Delete</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Subcategories */}
                                <div className="flex flex-wrap gap-2">
                                    {category.subCategories.map(
                                        (subcategory: SubCategory, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-1 px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300"
                                            >
                                                <span>{subcategory.name}</span>
                                                <button
                                                    className="ml-1 hover:bg-gray-100 rounded-full p-0.5"
                                                    onClick={(_) =>
                                                        handleDeleteCategory(
                                                            subcategory.id,
                                                            EditCategoryMode.INTERESTS
                                                        )
                                                    }
                                                >
                                                    <X className="w-3 h-3 text-gray-400"/>
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Category Dialog */}

            <AddCategoryDialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onSave={handleAddCategory}
                isSaving={isSaving}
                mode={editingMode}
                otherCategories={
                    editingMode === EditCategoryMode.INDUSTRIES
                        ? otherIndustries
                        : otherInterests
                }
            />

            {editingCategory && editingMode && (
                <EditCategoriesDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                    }}
                    currentUserCategories={editingCategory.subCategories}
                    currentSystemSubcategories={
                        categoriesTree.find((cat) => cat.id === editingCategory?.id)
                            ?.subcategories || []
                    }
                    onSave={handleSaveCategories}
                    isSaving={isSaving}
                    mode={editingMode}
                />
            )}
        </div>
    );
};
