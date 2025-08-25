import {XIcon} from "lucide-react";
import React, {JSX, useEffect, useRef, useState} from "react";
import {Badge} from "../../../../components/ui/badge";
import {Button} from "../../../../components/ui/button";
import {APISubcategory, useGetCategoriesTreeQuery,} from "../../../../lib/api/categoriesApi";

export const CategoryFilterByAnima = (
    {setSelectedCategories}: {
        setSelectedCategories: (categories: string[]) => void;
    }): JSX.Element => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);

    // New state for category filtering
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    // API queries
    const {data: categoriesData, isFetching: isFetchingCategories} =
        useGetCategoriesTreeQuery();
    // const { data: userInterestsData } = useGetUserInterestsQuery();

    const categories = (categoriesData?.data || []).filter((category) => category.subcategories && category.subcategories.length > 0);
    const [subCategories, setSubCategories] = useState<APISubcategory[]>([]);
    // const userInterests = userInterestsData?.data?.categories || [];

    // Handle category selection
    const handleCategoryClick = (categoryId: string) => {
        if (dragDistance > 5) return; // Prevent if dragging

        if (selectedCategory === categoryId) {
            setSelectedCategory(null);
            setSelectedInterests([]);
            setSelectedCategories([]);
            // Clear category filter
            // updateFilters({ category: "all-categories" });
        } else {
            setSelectedCategory(categoryId);
            setSelectedInterests([]);
            const categorySubCategories = categories.filter((e) => e.id === categoryId).flatMap((e) => e.subcategories || []);
            setSubCategories(categorySubCategories);
            setSelectedCategories(categorySubCategories.map((subCategory) => subCategory.id));
            // Set category filter
            // updateFilters({ category: categoryId });
        }
    };

    // Handle interest selection
    const handleInterestToggle = (interestId: string) => {
        const newSelectedInterests = selectedInterests.includes(interestId)
            ? selectedInterests.filter((id) => id !== interestId)
            : [...selectedInterests, interestId];

        setSelectedInterests(newSelectedInterests);

        // Update search filters with selected interests
        if (newSelectedInterests.length > 0) {
            setSelectedCategories(newSelectedInterests);
        } else {
            setSelectedCategories([]);
        }
    };

    // Check if an interest is selected
    const isInterestSelected = (interestId: string) => {
        return selectedInterests.includes(interestId);
    };

    // Check if a category has selected interests
    const hasSelectedInterests = (categoryId: string) => {
        if (categoryId !== selectedCategory) return false;
        return selectedInterests.length > 0;
    };

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSelectedInterests([]);

        setSelectedCategories([]);
    };

    const hasActiveFilters = selectedInterests.length > 0;

    // Mouse drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;

        setIsDragging(true);
        setDragDistance(0);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);

        // Prevent text selection while dragging
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;

        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        const newDragDistance = Math.abs(x - startX);

        setDragDistance(newDragDistance);
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        // Reset drag distance after a short delay to allow click handler to check it
        setTimeout(() => setDragDistance(0), 100);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        setTimeout(() => setDragDistance(0), 100);
    };

    // Touch drag handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (!scrollContainerRef.current) return;

        setIsDragging(true);
        setDragDistance(0);
        setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;

        const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        const newDragDistance = Math.abs(x - startX);

        setDragDistance(newDragDistance);
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setTimeout(() => setDragDistance(0), 100);
    };

    // Add global mouse event listeners for better drag experience
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isDragging || !scrollContainerRef.current) return;

            e.preventDefault();
            const x = e.pageX - scrollContainerRef.current.offsetLeft;
            const walk = (x - startX) * 2;
            const newDragDistance = Math.abs(x - startX);

            setDragDistance(newDragDistance);
            scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            setTimeout(() => setDragDistance(0), 100);
        };

        if (isDragging) {
            document.addEventListener("mousemove", handleGlobalMouseMove);
            document.addEventListener("mouseup", handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleGlobalMouseMove);
            document.removeEventListener("mouseup", handleGlobalMouseUp);
        };
    }, [isDragging, startX, scrollLeft]);

    if (isFetchingCategories) {
        return (
            <div className="flex w-full items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8a358a]"></div>
            </div>
        );
    }

    return (
        <div className="flex w-full items-center justify-between py-4">
            <div className="w-full max-w-[calc(100%-120px)] relative">
                {/* Main categories row with inline industries */}
                <div
                    ref={scrollContainerRef}
                    className={`flex items-center gap-5 overflow-x-auto scrollbar-hide pb-2 ${
                        isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                    }`}
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitOverflowScrolling: "touch",
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category.id;
                        const hasInterests = hasSelectedInterests(category.id);

                        // Hide other categories when one is selected, unless no category is selected
                        const shouldShow = !selectedCategory || isSelected;

                        return (
                            <div
                                key={category.id}
                                className={`flex items-center gap-5 flex-shrink-0 ${
                                    !shouldShow ? "hidden" : ""
                                }`}
                            >
                                {/* Main category badge */}
                                <Badge
                                    variant="outline"
                                    className={`px-[18px] py-2 rounded-[40px] cursor-pointer transition-colors ${
                                        isSelected
                                            ? "bg-[#8a358a33] text-[#8a358a] border-transparent"
                                            : hasInterests
                                                ? "bg-[#8a358a1a] text-[#8a358a] border-[#8a358a]"
                                                : "bg-transparent text-[#141b34] border-zinc-200 hover:bg-[#8a358a1a]"
                                    }`}
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    <div className="flex items-center gap-1">
                    <span className="font-body-small font-normal text-current whitespace-nowrap">
                      {category.name}
                    </span>
                                    </div>
                                </Badge>

                                {/* Industries displayed beside the selected category */}
                                {isSelected && (
                                    <>
                                        {/* Separator line */}
                                        <div className="w-px h-6 bg-gray-300 mx-2"></div>

                                        {/* Industries */}
                                        {subCategories.length > 0 ? (
                                            subCategories.map((subcategory) => (
                                                <Badge
                                                    key={subcategory.id}
                                                    variant="outline"
                                                    className={`px-3 py-1 rounded-full cursor-pointer text-xs transition-colors flex-shrink-0 ${
                                                        isInterestSelected(subcategory.id)
                                                            ? "bg-[#8a358a] text-white border-[#8a358a]"
                                                            : "bg-transparent text-[#141b34] border-zinc-200 hover:bg-[#8a358a1a]"
                                                    }`}
                                                    onClick={() => handleInterestToggle(subcategory.id)}
                                                >
                                                    {subcategory.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">
                        This category has no interests
                      </span>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {hasActiveFilters && (
                <Button
                    variant="outline"
                    className="flex items-center gap-2 px-4 py-2 h-10 rounded-[40px] ml-4 flex-shrink-0"
                    onClick={handleClearFilters}
                >
                    <XIcon className="w-6 h-6"/>
                    <span className="font-body-caption text-[#8a358a] text-xs">
            Clear Filter
          </span>
                </Button>
            )}

            <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
};
