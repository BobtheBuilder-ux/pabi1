export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface UserPreferences {
  myCategories: string[];
  mySubcategories: string[];
  lookingForCategories: string[];
  lookingForSubcategories: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'funding',
    name: 'Funding',
    subcategories: [
      { id: 'seed-funding', name: 'Seed Funding', categoryId: 'funding' },
      { id: 'venture-capital', name: 'Venture Capital (VC)', categoryId: 'funding' },
      { id: 'angel-investors', name: 'Angel Investors', categoryId: 'funding' },
      { id: 'crowdfunding-platforms', name: 'Crowdfunding Platforms', categoryId: 'funding' },
      { id: 'equity-financing', name: 'Equity Financing', categoryId: 'funding' },
      { id: 'government-grants', name: 'Government Grants & Subsidies', categoryId: 'funding' },
      { id: 'impact-investing', name: 'Impact Investing', categoryId: 'funding' }
    ]
  },
  {
    id: 'incubators',
    name: 'Incubators',
    subcategories: [
      { id: 'startup-incubators', name: 'Start-Up Incubators & Accelerators', categoryId: 'incubators' },
      { id: 'established-businesses', name: 'Established Businesses & Scaling Enterprises', categoryId: 'incubators' },
      { id: 'fintech-solutions', name: 'Fintech Solutions', categoryId: 'incubators' },
      { id: 'professional-job-seekers', name: 'Professional Job Seekers & Talent Network', categoryId: 'incubators' }
    ]
  },
  {
    id: 'enterprises',
    name: 'Enterprises',
    subcategories: [
      { id: 'business-angels', name: 'Business Angels & Funding Opportunities', categoryId: 'enterprises' },
      { id: 'startup-incubators-acc', name: 'Start-Up Incubators & Accelerators', categoryId: 'enterprises' },
      { id: 'established-businesses-ent', name: 'Established Businesses & Scaling Enterprises', categoryId: 'enterprises' },
      { id: 'fintech-solutions-ent', name: 'Fintech Solutions', categoryId: 'enterprises' },
      { id: 'professional-job-seekers-ent', name: 'Professional Job Seekers & Talent Network', categoryId: 'enterprises' }
    ]
  },
  {
    id: 'fintech',
    name: 'Fintech',
    subcategories: [
      { id: 'insurtech', name: 'Insurtech', categoryId: 'fintech' },
      { id: 'lender', name: 'Lender', categoryId: 'fintech' },
      { id: 'mobile-payments', name: 'Mobile Payments', categoryId: 'fintech' },
      { id: 'finance', name: 'Finance', categoryId: 'fintech' },
      { id: 'equity-financing-ft', name: 'Equity Financing', categoryId: 'fintech' },
      { id: 'asset-management', name: 'Asset Management', categoryId: 'fintech' },
      { id: 'stock-trading', name: 'Stock Trading', categoryId: 'fintech' }
    ]
  },
  {
    id: 'professionals',
    name: 'Professionals',
    subcategories: [
      { id: 'consultants', name: 'Consultants', categoryId: 'professionals' },
      { id: 'freelancers', name: 'Freelancers', categoryId: 'professionals' },
      { id: 'experts', name: 'Experts', categoryId: 'professionals' },
      { id: 'advisors', name: 'Advisors', categoryId: 'professionals' }
    ]
  },
  {
    id: 'recruiters',
    name: 'Recruiters',
    subcategories: [
      { id: 'talent-acquisition', name: 'Talent Acquisition', categoryId: 'recruiters' },
      { id: 'hr-services', name: 'HR Services', categoryId: 'recruiters' },
      { id: 'executive-search', name: 'Executive Search', categoryId: 'recruiters' },
      { id: 'staffing-agencies', name: 'Staffing Agencies', categoryId: 'recruiters' }
    ]
  },
  {
    id: 'consultants',
    name: 'Consultants',
    subcategories: [
      { id: 'business-consulting', name: 'Business Consulting', categoryId: 'consultants' },
      { id: 'strategy-consulting', name: 'Strategy Consulting', categoryId: 'consultants' },
      { id: 'tech-consulting', name: 'Technology Consulting', categoryId: 'consultants' },
      { id: 'financial-consulting', name: 'Financial Consulting', categoryId: 'consultants' }
    ]
  },
  {
    id: 'ngos',
    name: 'NGOs',
    subcategories: [
      { id: 'social-impact', name: 'Social Impact', categoryId: 'ngos' },
      { id: 'development-orgs', name: 'Development Organizations', categoryId: 'ngos' },
      { id: 'humanitarian', name: 'Humanitarian', categoryId: 'ngos' },
      { id: 'advocacy', name: 'Advocacy', categoryId: 'ngos' }
    ]
  },
  {
    id: 'public-services',
    name: 'Public Services',
    subcategories: [
      { id: 'government-agencies', name: 'Government Agencies', categoryId: 'public-services' },
      { id: 'public-administration', name: 'Public Administration', categoryId: 'public-services' },
      { id: 'municipal-services', name: 'Municipal Services', categoryId: 'public-services' },
      { id: 'regulatory-bodies', name: 'Regulatory Bodies', categoryId: 'public-services' }
    ]
  },
  {
    id: 'associations',
    name: 'Associations',
    subcategories: [
      { id: 'trade-associations', name: 'Trade Associations', categoryId: 'associations' },
      { id: 'professional-bodies', name: 'Professional Bodies', categoryId: 'associations' },
      { id: 'industry-groups', name: 'Industry Groups', categoryId: 'associations' },
      { id: 'chambers-commerce', name: 'Chambers of Commerce', categoryId: 'associations' }
    ]
  },
  {
    id: 'training',
    name: 'Training',
    subcategories: [
      { id: 'corporate-training', name: 'Corporate Training', categoryId: 'training' },
      { id: 'skill-development', name: 'Skill Development', categoryId: 'training' },
      { id: 'certification-programs', name: 'Certification Programs', categoryId: 'training' },
      { id: 'workshops', name: 'Workshops & Seminars', categoryId: 'training' }
    ]
  },
  {
    id: 'students',
    name: 'Students',
    subcategories: [
      { id: 'university-students', name: 'University Students', categoryId: 'students' },
      { id: 'graduate-students', name: 'Graduate Students', categoryId: 'students' },
      { id: 'interns', name: 'Interns', categoryId: 'students' },
      { id: 'recent-graduates', name: 'Recent Graduates', categoryId: 'students' }
    ]
  },
  {
    id: 'content-creators',
    name: 'Content Creators',
    subcategories: [
      { id: 'digital-marketing', name: 'Digital Marketing', categoryId: 'content-creators' },
      { id: 'social-media', name: 'Social Media', categoryId: 'content-creators' },
      { id: 'video-production', name: 'Video Production', categoryId: 'content-creators' },
      { id: 'graphic-design', name: 'Graphic Design', categoryId: 'content-creators' }
    ]
  },
  {
    id: 'product',
    name: 'Product',
    subcategories: [
      { id: 'product-management', name: 'Product Management', categoryId: 'product' },
      { id: 'product-design', name: 'Product Design', categoryId: 'product' },
      { id: 'product-development', name: 'Product Development', categoryId: 'product' },
      { id: 'product-marketing', name: 'Product Marketing', categoryId: 'product' }
    ]
  },
  {
    id: 'tourism-services',
    name: 'Tourism Services',
    subcategories: [
      { id: 'travel-agencies', name: 'Travel Agencies', categoryId: 'tourism-services' },
      { id: 'hospitality', name: 'Hospitality', categoryId: 'tourism-services' },
      { id: 'tour-operators', name: 'Tour Operators', categoryId: 'tourism-services' },
      { id: 'accommodation', name: 'Accommodation', categoryId: 'tourism-services' },
      { id: 'events', name: 'Events', categoryId: 'tourism-services' },
      { id: 'accommodations', name: 'Accommodations', categoryId: 'tourism-services' }
    ]
  }
];