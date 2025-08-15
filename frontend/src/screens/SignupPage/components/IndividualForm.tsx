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

interface IndividualFormProps {
  formik: FormikProps<SignupFormValues>;
  countries: string[];
}

export const IndividualForm: React.FC<IndividualFormProps> = ({ formik, countries }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Input
            placeholder="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            name="name"
            className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
          />
          {formik.errors.name && formik.touched.name && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
          )}
        </div>
      </div>

      <div className="grid grid-flow-row sm:grid-cols-2 gap-6">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            name="email"
            className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
          />
          {formik.errors.email && formik.touched.email && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
          )}
        </div>
        <Input
          type="tel"
          placeholder="Phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          name="phone"
          className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
        />
      </div>

      <textarea
        placeholder="Biography"
        value={formik.values.biography}
        onChange={formik.handleChange}
        name="biography"
        rows={3}
        className="w-full px-6 py-6 text-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent resize-none"
      />

      <div>
        <h4 className="text-sm font-semibold text-[#141b34] mb-3 uppercase tracking-wide">
          Address
        </h4>
        <div className="grid grid-flow-row sm:grid-cols-2 gap-6">
          <Select onValueChange={(value) => formik.setFieldValue('nationality', value)}>
            <SelectTrigger className="w-full px-6 py-8 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent">
              <SelectValue placeholder="Nationality" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        </div>
      </div>
    </div>
  );
}; 