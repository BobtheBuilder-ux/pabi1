import React from "react";
import { Search } from "lucide-react";

export const AdsTab = (): JSX.Element => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-[#141b34] mb-2">Ads</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          This section is coming soon. We're working hard to bring you the best
          experience.
        </p>
      </div>
    </div>
  );
};
