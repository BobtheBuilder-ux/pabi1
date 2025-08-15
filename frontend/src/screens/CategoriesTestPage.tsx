import React from 'react';
import { NavigationBarMainByAnima } from './LandingPage/sections/NavigationBarMainByAnima';
import { useGetCategoriesTreeQuery } from '../lib/api/categoriesApi';

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

export const CategoriesTestPage: React.FC = () => {
  const { data: categoriesTreeResponse, isLoading: isLoadingCategoriesTree, error: categoriesTreeError, refetch: refetchCategoriesTree } = useGetCategoriesTreeQuery();
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>('');
  const [manualTestResult, setManualTestResult] = React.useState<any>(null);

  const categoriesTree: APICategory[] = categoriesTreeResponse?.data || [];

  // Get subcategories for selected category
  const selectedCategory = categoriesTree.find(cat => cat.id === selectedCategoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const handleManualTest = async () => {
    try {
      console.log('🧪 Manual test started');
      const result = await refetchCategoriesTree();
      setManualTestResult(result);
      console.log('🧪 Manual test result:', result);
    } catch (error) {
      console.error('🧪 Manual test error:', error);
      setManualTestResult({ error: error });
    }
  };

  if (isLoadingCategoriesTree) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <NavigationBarMainByAnima />
        <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8a358a] mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-[#141b34] mb-2">Loading categories tree...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (categoriesTreeError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <NavigationBarMainByAnima />
        <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#141b34] mb-2">Error loading categories tree</h2>
            <p className="text-red-600 mb-4">{JSON.stringify(categoriesTreeError)}</p>
            <button 
              onClick={() => refetchCategoriesTree()}
              className="bg-[#8a358a] text-white px-4 py-2 rounded-lg hover:bg-[#7a2f7a]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <NavigationBarMainByAnima />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#141b34] mb-8">Categories Tree from API</h1>
        
        {/* Manual Test Section */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-4 text-blue-800">Manual API Test</h2>
          <button 
            onClick={handleManualTest}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4"
          >
            Test Categories Tree API Manually
          </button>
          {manualTestResult && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Manual Test Result:</h3>
              <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-64">
                {JSON.stringify(manualTestResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* API Response Debug */}
        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">API Response Structure:</h2>
          <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-64">
            {JSON.stringify(categoriesTreeResponse, null, 2)}
          </pre>
        </div>

        {/* Categories Tree */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#141b34]">Categories Tree ({categoriesTree.length})</h2>
              <button 
                onClick={() => refetchCategoriesTree()}
                className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-2">
              {categoriesTree.map((category: APICategory) => (
                <div key={category.id} className="border border-gray-200 rounded-lg">
                  <div 
                    onClick={() => setSelectedCategoryId(category.id === selectedCategoryId ? '' : category.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedCategoryId === category.id 
                        ? 'bg-[#8a358a] text-white' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs opacity-75 mt-1">ID: {category.id}</div>
                    {category.description && (
                      <div className="text-sm opacity-75 mt-1">{category.description}</div>
                    )}
                    <div className="text-xs opacity-75 mt-1">
                      Subcategories: {category.subcategories?.length || 0}
                    </div>
                  </div>
                  
                  {/* Show subcategories when category is selected */}
                  {selectedCategoryId === category.id && category.subcategories && (
                    <div className="border-t border-gray-200 bg-gray-50 p-3">
                      <h4 className="text-sm font-semibold mb-2 text-gray-700">Subcategories:</h4>
                      <div className="space-y-1">
                        {category.subcategories.map((subcategory: APISubcategory) => (
                          <div key={subcategory.id} className="pl-4 py-1 text-sm">
                            <div className="font-medium">{subcategory.name}</div>
                            <div className="text-xs text-gray-500">ID: {subcategory.id}</div>
                            {subcategory.description && (
                              <div className="text-xs text-gray-600">{subcategory.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {categoriesTree.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No categories found
                </div>
              )}
            </div>
          </div>

          {/* Selected Category Details */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#141b34] mb-4">
              Selected Category Details
              {selectedCategoryId && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({selectedCategory?.name})
                </span>
              )}
            </h2>
            {selectedCategory ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Category Info:</h3>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <p><strong>Name:</strong> {selectedCategory.name}</p>
                    <p><strong>ID:</strong> {selectedCategory.id}</p>
                    {selectedCategory.description && (
                      <p><strong>Description:</strong> {selectedCategory.description}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Subcategories ({subcategories.length}):</h3>
                  <div className="mt-2 space-y-2">
                    {subcategories.map((subcategory: APISubcategory) => (
                      <div key={subcategory.id} className="p-3 bg-gray-50 rounded">
                        <div className="font-medium">{subcategory.name}</div>
                        <div className="text-xs text-gray-500">ID: {subcategory.id}</div>
                        {subcategory.description && (
                          <div className="text-sm text-gray-600 mt-1">{subcategory.description}</div>
                        )}
                      </div>
                    ))}
                    {subcategories.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No subcategories for this category</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Select a category to view its details and subcategories
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 