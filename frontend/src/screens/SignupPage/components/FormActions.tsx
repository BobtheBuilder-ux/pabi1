import React from 'react';
import { Button } from '../../../components/ui/button';

interface FormActionsProps {
  isRegistering: boolean;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({ isRegistering, onCancel }) => {
  return (
    <div className="flex gap-4 justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="px-6 py-6 text-sm border-gray-200 hover:bg-gray-50 text-gray-600 rounded-2xl"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isRegistering}
        className="px-6 py-6 rounded-2xl text-sm bg-[#8a358a] hover:bg-[#7a2f7a] text-white font-semibold transition-colors"
      >
        {isRegistering ? 'Creating Account...' : 'Save & Login'}
      </Button>
    </div>
  );
}; 