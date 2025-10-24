import React, { useState, useMemo } from 'react';
import { InfluencerProfile, User, InfluencerCategory, CollabRequest, CollabStatus } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { generateBio } from '../../services/geminiService';
import { SparklesIcon, CameraIcon } from '../../components/icons/HeroIcons';

interface ProfileEditorProps {
  profile: InfluencerProfile;
  user: User;
  onBack: () => void;
  onSave: (profile: InfluencerProfile) => void;
  onUpdateUser: (user: User) => void;
  collabRequests: CollabRequest[];
  users: User[];
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, user, onBack, onSave, onUpdateUser, collabRequests, users }) => {
  const [formData, setFormData] = useState({
    ...profile,
    bankAccount: profile.bankAccount || { accountHolderName: '', accountNumber: '', ifscCode: '', branchName: '', bankName: '' },
    upiId: profile.upiId || ''
  });
  const [userData, setUserData] = useState<User>(user);
  const [bioKeywords, setBioKeywords] = useState('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const myRequests = useMemo(() => 
      collabRequests
          .filter(r => r.influencerId === user.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
  [user.id, collabRequests]);

  const getStatusColor = (status: CollabStatus) => {
    switch (status) {
        case CollabStatus.Accepted: return 'text-green-800 bg-green-100';
        case CollabStatus.Pending: return 'text-yellow-800 bg-yellow-100';
        case CollabStatus.Rejected: return 'text-red-800 bg-red-100';
        case CollabStatus.Completed: return 'text-blue-800 bg-blue-100';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setUserData(prev => ({ ...prev, avatar: reader.result as string }));
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please select a valid image file.');
    }
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount!,
        [name]: value
      }
    }));
  };

  const handleGenerateBio = async () => {
    if (!bioKeywords) return;
    setIsGeneratingBio(true);
    try {
      const newBio = await generateBio(bioKeywords);
      setFormData(prev => ({ ...prev, bio: newBio }));
    } catch (error) {
      console.error(error);
      // You might want to show a toast notification here
    } finally {
      setIsGeneratingBio(false);
    }
  };
  
  const handleCategoryChange = (category: InfluencerCategory, isChecked: boolean) => {
      setFormData(prev => {
          const currentCategories = prev.categories || [];
          if (isChecked) {
              if (currentCategories.length < 6) {
                  return { ...prev, categories: [...currentCategories, category] };
              }
              return prev; 
          } else {
              return { ...prev, categories: currentCategories.filter(c => c !== category) };
          }
      });
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categories.length < 1) {
        alert("Please select at least one category.");
        return;
    }
    
    const bank = formData.bankAccount;
    const isBankDetailsFilled = bank && bank.accountHolderName && bank.accountNumber && bank.ifscCode && bank.bankName && bank.branchName;
    const isUpiFilled = formData.upiId && formData.upiId.trim() !== '';

    if (!isBankDetailsFilled && !isUpiFilled) {
        alert("Payment details are mandatory. Please fill in either your bank account details or your UPI ID to receive payments.");
        return;
    }

    onUpdateUser(userData);
    onSave(formData);
    alert("Profile saved successfully!");
  };


  return (
    <div className="max-w-4xl mx-auto">
      <Button onClick={onBack} variant="secondary" className="mb-4">
        &larr; Back to Dashboard
      </Button>
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>
          <form className="space-y-6" onSubmit={handleSaveChanges}>
            {/* Personal Details Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Details</h3>
              <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg border">
                  <div className="relative flex-shrink-0">
                      <img className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-200" src={userData.avatar} alt={userData.name} />
                      <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition"
                          title="Change profile picture"
                      >
                          <CameraIcon className="w-5 h-5 text-gray-600" />
                          <input
                              id="avatar-upload"
                              type="file"
                              accept="image/png, image/jpeg, image/gif"
                              className="hidden"
                              onChange={handleAvatarChange}
                          />
                      </label>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                          <input type="text" id="name" name="name" value={userData.name} onChange={handleUserInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                      </div>
                      <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                          <input type="email" id="email" name="email" value={userData.email} onChange={handleUserInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                      </div>
                  </div>
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bio Section with AI */}
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                  <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-md">
                    <p className="text-sm font-medium text-indigo-700 mb-2">Need inspiration?</p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="e.g., minimalist fashion, vegan recipes"
                          value={bioKeywords}
                          onChange={(e) => setBioKeywords(e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                        />
                        <Button type="button" onClick={handleGenerateBio} disabled={isGeneratingBio || !bioKeywords}>
                          <SparklesIcon className="w-5 h-5 mr-1" />
                          {isGeneratingBio ? 'Generating...' : 'Generate with AI'}
                        </Button>
                      </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Categories</label>
                    <p className="text-xs text-gray-500 mb-2">Select between 1 and 6 categories that best describe you.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border p-3 rounded-md">
                        {Object.values(InfluencerCategory).map(cat => (
                            <div key={cat} className="flex items-center">
                                <input
                                    id={`cat-${cat}`}
                                    type="checkbox"
                                    checked={formData.categories.includes(cat)}
                                    onChange={(e) => handleCategoryChange(cat, e.target.checked)}
                                    disabled={!formData.categories.includes(cat) && formData.categories.length >= 6}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor={`cat-${cat}`} className="ml-2 block text-sm text-gray-900">{cat}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other Fields */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                  <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="pricePerPost" className="block text-sm font-medium text-gray-700">Price per Post (₹)</label>
                  <input type="number" id="pricePerPost" name="pricePerPost" value={formData.pricePerPost} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="followers" className="block text-sm font-medium text-gray-700">Followers</label>
                  <input type="number" id="followers" name="followers" value={formData.followers} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Social Links</h3>
                  <div className="space-y-4">
                    <input type="text" placeholder="Instagram username" name="instagram" value={formData.socialLinks.instagram || ''} onChange={handleSocialChange} className="block w-full border-gray-300 rounded-md shadow-sm" />
                    <input type="text" placeholder="Facebook profile URL" name="facebook" value={formData.socialLinks.facebook || ''} onChange={handleSocialChange} className="block w-full border-gray-300 rounded-md shadow-sm" />
                    <input type="text" placeholder="YouTube channel name" name="youtube" value={formData.socialLinks.youtube || ''} onChange={handleSocialChange} className="block w-full border-gray-300 rounded-md shadow-sm" />
                    <input type="text" placeholder="TikTok username" name="tiktok" value={formData.socialLinks.tiktok || ''} onChange={handleSocialChange} className="block w-full border-gray-300 rounded-md shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Payment Details</h3>
                <p className="text-sm text-gray-500 mb-4">This information is mandatory to receive payments for collaborations. Please provide either bank account details OR a UPI ID.</p>
                
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-700 mb-3">Bank Account Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                            <input type="text" id="accountHolderName" name="accountHolderName" value={formData.bankAccount?.accountHolderName} onChange={handleBankDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                            <input type="text" id="accountNumber" name="accountNumber" value={formData.bankAccount?.accountNumber} onChange={handleBankDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700">IFSC Code</label>
                            <input type="text" id="ifscCode" name="ifscCode" value={formData.bankAccount?.ifscCode} onChange={handleBankDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                            <input type="text" id="bankName" name="bankName" value={formData.bankAccount?.bankName} onChange={handleBankDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="branchName" className="block text-sm font-medium text-gray-700">Branch Name</label>
                            <input type="text" id="branchName" name="branchName" value={formData.bankAccount?.branchName} onChange={handleBankDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                </div>

                <div className="my-4 flex items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm font-semibold">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-700 mb-3">UPI ID</h4>
                    <div>
                        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">Your UPI ID</label>
                        <input type="text" id="upiId" name="upiId" value={formData.upiId} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="yourname@bank" />
                    </div>
                </div>
            </div>

            {/* Collaboration History */}
            <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Collaboration History</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {myRequests.length > 0 ? (
                        myRequests.map(req => {
                            const customer = users.find(u => u.id === req.customerId);
                            return (
                                <div key={req.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-3">
                                            <img src={customer?.avatar} alt={customer?.name} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-semibold">{customer?.name}</p>
                                                <p className="text-sm text-gray-500">{new Date(req.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 pl-[52px]">{req.message}</p>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 text-center py-4">No collaboration history found.</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="secondary" onClick={onBack}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ProfileEditor;