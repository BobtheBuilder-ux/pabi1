import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { FormikProps } from 'formik';
import { SignupFormValues } from '../types';

interface PasswordFieldsProps {
  formik: FormikProps<SignupFormValues>;
}

export const PasswordFields: React.FC<PasswordFieldsProps> = ({ formik }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start my-6">
      <div className="relative w-full">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          name="password"
          className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <EyeOffIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
        </button>
        {formik.errors.password && formik.touched.password && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
        )}
      </div>

      <div className="relative w-full">
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm Password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          name="confirmPassword"
          className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showConfirmPassword ? (
            <EyeOffIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
        </button>
        {formik.errors.confirmPassword && formik.touched.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
}; 