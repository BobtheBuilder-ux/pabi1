import React from 'react';
import { AccountType } from '../types';

interface AccountTypeSelectorProps {
  accountType: AccountType;
  onAccountTypeChange: (type: AccountType) => void;
}

export const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({
  accountType,
  onAccountTypeChange,
}) => {
  return (
    <div>
      <h3 className="text-xs font-semibold text-[#141b34] mb-3 uppercase tracking-wide">
        Account Info
      </h3>
      <div className="grid grid-flow-row sm:grid-cols-2 gap-6 mb-4">
        <button
          type="button"
          onClick={() => onAccountTypeChange('individual')}
          className={`p-4 sm:p-6 border rounded-2xl text-left transition-all text-sm h-20 sm:h-full ${
            accountType === 'individual'
              ? 'border-[#8a358a] bg-[#8a358a]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="font-bold text-[#141b34] text-md uppercase">Individual</div>
          <div className="text-xs text-gray-600 py-2">Personal account</div>
        </button>
        <button
          type="button"
          onClick={() => onAccountTypeChange('company')}
          className={`p-4 sm:p-6 border rounded-2xl text-left transition-all text-sm h-20 sm:h-full ${
            accountType === 'company'
              ? 'border-[#8a358a] bg-[#8a358a]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="font-bold text-[#141b34] text-md uppercase">Company</div>
          <div className="text-xs text-gray-600 py-2">Business account</div>
        </button>
      </div>
    </div>
  );
}; 