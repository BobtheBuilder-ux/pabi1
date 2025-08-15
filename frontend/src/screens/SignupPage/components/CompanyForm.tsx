import React from 'react';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { FormikProps } from 'formik';
import { SignupFormValues } from '../types';

interface CompanyFormProps {
  formik: FormikProps<SignupFormValues>;
  countries: string[];
}

export const CompanyForm: React.FC<CompanyFormProps> = ({ formik, countries }) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-[#141b34] mb-3 uppercase tracking-wide">
          Company Info
        </h4>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Input
                placeholder="Company name"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                name="companyName"
                className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
              />
              {formik.errors.companyName && formik.touched.companyName && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.companyName}</p>
              )}
            </div>
          </div>


          <div className='grid grid-flow-row sm:grid-cols-2 gap-6'>
            <Input
              type="email"
              placeholder="Company email"
              value={formik.values.companyEmail}
              onChange={formik.handleChange}
              name="companyEmail"
              className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
            />
              {formik.errors.companyEmail && formik.touched.companyEmail && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.companyEmail}</p>
            )}

            <Input
              placeholder="Company phone"
              value={formik.values.companyPhone}
              onChange={formik.handleChange}
              name="companyPhone"
              type='tel'
              className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
            />  
          </div>

          <textarea
            placeholder="Biography"
            value={formik.values.biography}
            onChange={formik.handleChange}
            name="biography"
            rows={3}
            className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent resize-none"
          />
          
          <div className="grid grid-flow-row sm:grid-cols-2 gap-6">
            <div>
              <Select onValueChange={(value) => formik.setFieldValue('registrationCountry', value)}>
                <SelectTrigger className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent">
                  <SelectValue placeholder="Registration country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.errors.registrationCountry && formik.touched.registrationCountry && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.registrationCountry}</p>
              )}
            </div>
            <div>
              <Select onValueChange={(value) => formik.setFieldValue('residenceCountry', value)}>
                <SelectTrigger className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent">
                  <SelectValue placeholder="Residence country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.errors.residenceCountry && formik.touched.residenceCountry && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.residenceCountry}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[#141b34] mb-3 uppercase tracking-wide">
          Owner Info
        </h4>
        <div className="space-y-6">
          <div>
            <Input
              placeholder="Personal name"
              value={formik.values.personalName}
              onChange={formik.handleChange}
              name="personalName"
              className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
            />
            {formik.errors.personalName && formik.touched.personalName && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.personalName}</p>
            )}
          </div>
          <div>
            <Input
              type="email"
              placeholder="Personal email"
              value={formik.values.personalEmail}
              onChange={formik.handleChange}
              name="personalEmail"
              className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
            />
            {formik.errors.personalEmail && formik.touched.personalEmail && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.personalEmail}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 