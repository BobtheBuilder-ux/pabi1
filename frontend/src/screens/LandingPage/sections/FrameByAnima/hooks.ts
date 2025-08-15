import { useState } from "react";
import {
  useAddUserInterestsMutation,
  useGetUserInterestsQuery,
  useRemoveUserInterestsMutation,
} from "../../../../lib/api/userApi";
import { useGetCategoriesQuery } from "../../../../lib/api/categoriesApi";

export const useFrameByAnima = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const [addUserInterests] = useAddUserInterestsMutation();
  const [removeUserInterests] = useRemoveUserInterestsMutation();

  const { data: userInterestsData, isFetching: isFetchingInterests } =
    useGetUserInterestsQuery();
  const interests = userInterestsData?.data?.categories || [];
  const { data: categoriesData, isFetching: isFetchingCategories } =
    useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const handleSelectInterest = (interest: string) => {
    setSelectedInterests([...selectedInterests, interest]);
    addUserInterests({
      categories: [interest],
    });
  };

  const handleDeselectInterest = (interest: string) => {
    setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    removeUserInterests({
      categories: [interest],
    });
  };

  return {
    selectedInterests,
    setSelectedInterests,
    searchQuery,
    setSearchQuery,
    selectedCountry,
    setSelectedCountry,
    handleSelectInterest,
    handleDeselectInterest,
    interests,
    categories,
    isFetchingInterests,
    isFetchingCategories,
  };
};
