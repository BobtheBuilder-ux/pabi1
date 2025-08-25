export type AccountType = 'individual' | 'company';

export interface SignupFormValues {
  // Individual fields
  name: string;
  email: string;
  phone: string;
  nationality: string;
  residenceCountry: string;
  // Company fields
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  personalName: string;
  personalEmail: string;
  registrationCountry: string;
  // Common fields
  password: string;
  biography: string;
  confirmPassword: string; // For form validation only
} 