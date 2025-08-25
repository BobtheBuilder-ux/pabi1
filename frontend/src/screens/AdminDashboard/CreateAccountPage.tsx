import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, X, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Interface for form data
 */
interface CreateAccountForm {
  accountType: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  biography: string;
  nationality: string;
  countryOfResidence: string;
  locations: LocationData[];
}

/**
 * Interface for location data
 */
interface LocationData {
  id: string;
  city: string;
  region: string;
}

/**
 * Create account page component
 * Provides form interface for creating new user accounts
 */
export const CreateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateAccountForm>({
    accountType: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    biography: '',
    nationality: '',
    countryOfResidence: '',
    locations: [
      {
        id: '1',
        city: 'Paris, Saint-Denis',
        region: 'Saint-Denis, Île-de-france'
      }
    ]
  });

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: keyof CreateAccountForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle location addition
   */
  const handleAddLocation = () => {
    const newLocation: LocationData = {
      id: Date.now().toString(),
      city: '',
      region: ''
    };
    setFormData(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation]
    }));
  };

  /**
   * Handle location removal
   */
  const handleRemoveLocation = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== locationId)
    }));
  };

  /**
   * Handle location update
   */
  const handleLocationUpdate = (locationId: string, field: 'city' | 'region', value: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.map(loc => 
        loc.id === locationId ? { ...loc, [field]: value } : loc
      )
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating account with data:', formData);
    // TODO: Implement API call to create account
    // After successful creation, navigate back to accounts page
    navigate('/admin/accounts');
  };

  /**
   * Handle form cancellation
   */
  const handleCancel = () => {
    navigate('/admin/accounts');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-1">Add a new user account to the platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Details Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">ACCOUNT DETAILS</h2>
          
          <div className="space-y-6">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account type
              </label>
              <Select value={formData.accountType} onValueChange={(value) => handleInputChange('accountType', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First name
                </label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last name
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className="w-full"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <Select value={formData.phone} onValueChange={(value) => handleInputChange('phone', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select phone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1 (US)</SelectItem>
                    <SelectItem value="+33">+33 (France)</SelectItem>
                    <SelectItem value="+44">+44 (UK)</SelectItem>
                    <SelectItem value="+256">+256 (Uganda)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Select value={formData.email} onValueChange={(value) => handleInputChange('email', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select email" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Email</SelectItem>
                    <SelectItem value="business">Business Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Biography */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biography
              </label>
              <textarea
                value={formData.biography}
                onChange={(e) => handleInputChange('biography', e.target.value)}
                placeholder="Enter biography"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Address Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">ADDRESS</h2>
          
          <div className="space-y-6">
            {/* Nationality and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality
                </label>
                <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="ugandan">Ugandan</SelectItem>
                    <SelectItem value="british">British</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country of residence
                </label>
                <Select value={formData.countryOfResidence} onValueChange={(value) => handleInputChange('countryOfResidence', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="usa">United States</SelectItem>
                    <SelectItem value="uganda">Uganda</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Location Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddLocation}
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
            >
              <Plus size={16} className="mr-2" />
              ADD LOCATION
            </Button>

            {/* Locations */}
            <div className="space-y-4">
              {formData.locations.map((location) => (
                <div key={location.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{location.city || 'New Location'}</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLocation(location.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{location.region}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 px-8"
          >
            SAVE CHANGES
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAccountPage;