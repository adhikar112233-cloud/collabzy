import React, { useState, useMemo, useEffect } from 'react';
import { User, CollabRequest, InfluencerProfile as InfluencerProfileType, CollabStatus, MembershipTier } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { formatDistanceToNowStrict } from 'date-fns';
import { CameraIcon } from '../../components/icons/HeroIcons';

interface CustomerProfileViewProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  collabRequests: CollabRequest[];
  influencerProfiles: (InfluencerProfileType & { user: User })[];
}

const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({ user, onUpdateUser, onBack, collabRequests, influencerProfiles }) => {
  const [formData, setFormData] = useState<User>(user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update time every minute
    return () => clearInterval(timer);
  }, []);

  const isMembershipActive = useMemo(() => {
    if (!user.membership || user.membership === MembershipTier.None || !user.membershipExpiry) {
      return false;
    }
    return new Date(user.membershipExpiry) > now;
  }, [user.membership, user.membershipExpiry, now]);

  const effectiveMembership = isMembershipActive ? user.membership : MembershipTier.None;

  const myCollabs = useMemo(() => 
      collabRequests
          .filter(c => c.customerId === user.id)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle password change separately and with more security.
    let updatedUser = { ...formData };
    if (newPassword && newPassword === confirmPassword) {
      updatedUser.password = newPassword;
    }
    onUpdateUser(updatedUser);
    alert('Profile saved!'); // Provide feedback to the user
    onBack(); // Go back to dashboard after saving
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <div className="relative">
                <img className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-200" src={formData.avatar} alt={formData.name} />
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
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{formData.name}</h2>
              <p className="text-gray-500">{user.role}</p>
              <div className="mt-2">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full">
                  {effectiveMembership} Member
                </span>
                {isMembershipActive && user.membershipExpiry && (
                    <p className="text-sm text-gray-500 mt-1">
                        Plan valid for another {formatDistanceToNowStrict(new Date(user.membershipExpiry), { addSuffix: false })}.
                    </p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveChanges} className="space-y-8">
            {/* Personal Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                 <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input type="password" id="currentPassword" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div></div> {/* Spacer */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input type="password" id="newPassword" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input type="password" id="confirmPassword" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
            </div>

            {/* Collaboration History */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Collaboration History</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {myCollabs.length > 0 ? (
                        myCollabs.map(collab => {
                            const influencer = influencerProfiles.find(p => p.userId === collab.influencerId);
                            return (
                                <div key={collab.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-3">
                                            <img src={influencer?.user.avatar} alt={influencer?.user.name} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-semibold">{influencer?.user.name}</p>
                                                <p className="text-sm text-gray-500">{new Date(collab.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(collab.status)}`}>
                                            {collab.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 pl-[52px]">{collab.message}</p>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500 text-center py-4">No collaboration history found.</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onBack}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CustomerProfileView;