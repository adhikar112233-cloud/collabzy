import React, { useState, useCallback, useMemo } from 'react';
import { User, UserRole, InfluencerProfile, MembershipTier, CollabRequest, Message, HelpTicket, Payment, MembershipPlan, CampaignPlan, Attachment, BannerAd } from './types';
import { USERS, INFLUENCER_PROFILES as INITIAL_PROFILES, COLLAB_REQUESTS, MESSAGES, HELP_TICKETS, PAYMENTS, MEMBERSHIP_PLANS, CAMPAIGN_PLANS, BANNER_ADS } from './constants';
import AuthView from './views/AuthView';
import CustomerDashboard from './views/customer/CustomerDashboard';
import InfluencerDashboard from './views/influencer/InfluencerDashboard';
import AdminDashboard from './views/admin/AdminDashboard';
import Header from './components/common/Header';

// The initial profiles constant only contains profile data, not the user object.
const INITIAL_INFLUENCER_PROFILES: InfluencerProfile[] = INITIAL_PROFILES.map(({ user, ...profile }) => profile);


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(USERS);
  // State now only holds the raw profile data, not the joined user data.
  const [influencerProfiles, setInfluencerProfiles] = useState<InfluencerProfile[]>(INITIAL_INFLUENCER_PROFILES);
  const [collabRequests, setCollabRequests] = useState(COLLAB_REQUESTS);
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [helpTickets, setHelpTickets] = useState<HelpTicket[]>(HELP_TICKETS);
  const [payments, setPayments] = useState<Payment[]>(PAYMENTS);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>(MEMBERSHIP_PLANS);
  const [campaignPlans, setCampaignPlans] = useState<CampaignPlan[]>(CAMPAIGN_PLANS);
  const [bannerAds, setBannerAds] = useState<BannerAd[]>(BANNER_ADS);


  // Create a memoized, combined list of profiles with their user data. This is the single source of truth.
  const profilesWithUsers = useMemo(() => {
    return influencerProfiles.map(profile => {
      const user = users.find(u => u.id === profile.userId);
      // We must find a user, otherwise the profile is orphaned. Filter it out if no user found.
      return user ? { ...profile, user } : null;
    }).filter((p): p is InfluencerProfile & { user: User } => p !== null);
  }, [influencerProfiles, users]);


  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const handleSignup = useCallback((details: { name: string; emailOrPhone: string; password: string; role: UserRole; }) => {
    const { name, emailOrPhone, password, role } = details;

    const newUser: User = {
      id: (users[users.length - 1]?.id || 0) + 1,
      name,
      email: emailOrPhone.includes('@') ? emailOrPhone.toLowerCase() : '',
      phone: !emailOrPhone.includes('@') ? emailOrPhone : undefined,
      password,
      role,
      avatar: `https://picsum.photos/seed/${name.split(' ').join('')}/100/100`,
      isBlocked: false,
      membership: role === UserRole.Customer ? MembershipTier.None : undefined,
    };
    
    // Add the new user to the users state first.
    setUsers(prevUsers => [...prevUsers, newUser]);

    if (role === UserRole.Influencer) {
        const newProfile: InfluencerProfile = {
            userId: newUser.id,
            bio: 'Welcome! Please edit your profile to tell the world about yourself.',
            categories: [],
            location: 'Not set',
            followers: 0,
            pricePerPost: 0,
            socialLinks: {},
            isVerified: false,
            adCampaignActive: false,
            rating: 0,
            reviews: [],
        };
        // Add only the profile data. The `profilesWithUsers` memo will join it with the new user.
        setInfluencerProfiles(prev => [...prev, newProfile]);
    }

    handleLogin(newUser);
  }, [users, handleLogin]);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
        if (updatedUser.isBlocked) { // If the current user gets blocked
            handleLogout(); // Force logout
        } else {
            setCurrentUser(updatedUser); // Otherwise update their state
        }
    }
  }, [currentUser, handleLogout]);

  const handleUpdateProfile = useCallback((updatedProfile: InfluencerProfile) => {
    setInfluencerProfiles(prev => prev.map(p => 
        p.userId === updatedProfile.userId ? updatedProfile : p
    ));
  }, []);

  const handleCreateTicket = useCallback((ticketData: { userId: number; subject: string; message: string; attachment?: Attachment; }) => {
    const newTicket: HelpTicket = {
        id: (helpTickets[helpTickets.length - 1]?.id || 0) + 1,
        userId: ticketData.userId,
        subject: ticketData.subject,
        message: ticketData.message,
        attachment: ticketData.attachment,
        isResolved: false,
        createdAt: new Date().toISOString(),
        replies: [],
    };
    setHelpTickets(prev => [...prev, newTicket]);
    alert('Help ticket submitted successfully!');
  }, [helpTickets]);

  const handleUpdateTicket = useCallback((updatedTicket: HelpTicket) => {
      setHelpTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  }, []);

  const handleCreatePayment = useCallback((paymentData: Omit<Payment, 'id' | 'date'>) => {
    const newPayment: Payment = {
        id: (payments[payments.length - 1]?.id || 0) + 1,
        date: new Date().toISOString(),
        ...paymentData
    };
    setPayments(prev => [...prev, newPayment]);
  }, [payments]);
  
  const handleUpdatePayment = useCallback((updatedPayment: Payment) => {
      setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
  }, []);
  
  const handleUpdateMembershipPlan = useCallback((updatedPlan: MembershipPlan) => {
      setMembershipPlans(prev => prev.map(p => p.tier === updatedPlan.tier ? updatedPlan : p));
  }, []);

  const handleUpdateCampaignPlan = useCallback((updatedPlan: CampaignPlan) => {
      setCampaignPlans(prev => prev.map(p => p.durationMonths === updatedPlan.durationMonths ? updatedPlan : p));
  }, []);

  const handleCreateBannerAd = useCallback((bannerData: Omit<BannerAd, 'id'>) => {
    const newBanner: BannerAd = {
        id: (bannerAds[bannerAds.length - 1]?.id || 0) + 1,
        ...bannerData
    };
    setBannerAds(prev => [...prev, newBanner]);
  }, [bannerAds]);

  const handleUpdateBannerAd = useCallback((updatedBanner: BannerAd) => {
      setBannerAds(prev => prev.map(b => b.id === updatedBanner.id ? updatedBanner : b));
  }, []);

  const handleDeleteBannerAd = useCallback((bannerId: number) => {
      setBannerAds(prev => prev.filter(b => b.id !== bannerId));
  }, []);

  const handleCreateAdmin = useCallback((adminData: { name: string; email: string; password?: string }) => {
    const newAdmin: User = {
        id: (users[users.length - 1]?.id || 0) + 1,
        name: adminData.name,
        email: adminData.email.toLowerCase(),
        password: adminData.password || 'password123', // Default password for simplicity
        role: UserRole.Admin,
        avatar: `https://picsum.photos/seed/${adminData.name.split(' ').join('')}/100/100`,
        isBlocked: false,
    };
    setUsers(prev => [...prev, newAdmin]);
    alert(`Admin user ${newAdmin.name} created successfully.`);
  }, [users]);


  const renderDashboard = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case UserRole.Customer:
        return <CustomerDashboard 
                    user={currentUser} 
                    onUpdateUser={handleUpdateUser}
                    influencerProfiles={profilesWithUsers} // Pass the joined data
                    setInfluencerProfiles={setInfluencerProfiles}
                    collabRequests={collabRequests}
                    setCollabRequests={setCollabRequests} 
                    users={users}
                    messages={messages}
                    setMessages={setMessages}
                    helpTickets={helpTickets}
                    onCreateTicket={handleCreateTicket}
                    onCreatePayment={handleCreatePayment}
                    membershipPlans={membershipPlans}
                    payments={payments}
                    bannerAds={bannerAds}
                />;
      case UserRole.Influencer:
        return <InfluencerDashboard 
                    user={currentUser} 
                    influencerProfiles={profilesWithUsers} // Pass the joined data
                    onUpdateProfile={handleUpdateProfile}
                    onUpdateUser={handleUpdateUser}
                    collabRequests={collabRequests}
                    setCollabRequests={setCollabRequests}
                    users={users}
                    messages={messages}
                    setMessages={setMessages}
                    helpTickets={helpTickets}
                    onCreateTicket={handleCreateTicket}
                    onCreatePayment={handleCreatePayment}
                    campaignPlans={campaignPlans}
                    bannerAds={bannerAds}
                />;
      case UserRole.Admin:
        return <AdminDashboard 
                    currentUser={currentUser}
                    users={users}
                    onUpdateUser={handleUpdateUser}
                    influencerProfiles={profilesWithUsers} // Pass the joined data
                    onUpdateProfile={handleUpdateProfile}
                    collabRequests={collabRequests}
                    helpTickets={helpTickets}
                    onUpdateTicket={handleUpdateTicket}
                    payments={payments}
                    onUpdatePayment={handleUpdatePayment}
                    messages={messages}
                    membershipPlans={membershipPlans}
                    onUpdateMembershipPlan={handleUpdateMembershipPlan}
                    campaignPlans={campaignPlans}
                    onUpdateCampaignPlan={handleUpdateCampaignPlan}
                    bannerAds={bannerAds}
                    onCreateBannerAd={handleCreateBannerAd}
                    onUpdateBannerAd={handleUpdateBannerAd}
                    onDeleteBannerAd={handleDeleteBannerAd}
                    onCreateAdmin={handleCreateAdmin}
                />;
      default:
        return <div className="text-red-500 p-4">Invalid user role.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {currentUser ? (
        <>
          <Header user={currentUser} onLogout={handleLogout} />
          <main className="p-4 sm:p-6 lg:p-8">
            {renderDashboard()}
          </main>
        </>
      ) : (
        <AuthView onLogin={handleLogin} onSignup={handleSignup} users={users} />
      )}
    </div>
  );
};

export default App;