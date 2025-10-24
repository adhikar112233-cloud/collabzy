import React, { useState, useMemo, useEffect } from 'react';
import { User, InfluencerCategory, CollabStatus, InfluencerProfile as InfluencerProfileType, MembershipTier, MembershipPlan, CollabRequest, Message, HelpTicket, Payment, PaymentType, PaymentStatus, Attachment, BannerAd, BannerAudience } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { UsersIcon, MapPinIcon, CurrencyDollarIcon, StarIcon, CheckCircleIcon, ChatBubbleOvalLeftEllipsisIcon, CalendarDaysIcon, SolidStarIcon, CreditCardIcon } from '../../components/icons/HeroIcons';
import CustomerProfileView from './CustomerProfileView';
import PaytmPaymentView from './PhonePePaymentView';
import ChatView from '../chat/ChatView';
import HelpView from '../shared/HelpView';
import { format, formatDistanceToNowStrict } from 'date-fns';
import BannerAdDisplay from '../shared/BannerAdDisplay';

interface CustomerDashboardProps {
  user: User;
  onUpdateUser: (user: User) => void;
  influencerProfiles: (InfluencerProfileType & { user: User })[];
  setInfluencerProfiles: React.Dispatch<React.SetStateAction<(InfluencerProfileType & { user: User })[]>>;
  collabRequests: CollabRequest[];
  setCollabRequests: React.Dispatch<React.SetStateAction<CollabRequest[]>>;
  users: User[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  helpTickets: HelpTicket[];
  onCreateTicket: (ticketData: { userId: number; subject: string; message: string; attachment?: Attachment; }) => void;
  onCreatePayment: (paymentData: Omit<Payment, 'id' | 'date'>) => void;
  membershipPlans: MembershipPlan[];
  payments: Payment[];
  bannerAds: BannerAd[];
}

const StarRatingDisplay: React.FC<{ rating: number, totalStars?: number }> = ({ rating, totalStars = 5 }) => {
    const fullStars = Math.floor(rating);
    const emptyStars = totalStars - fullStars;

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <SolidStarIcon key={`full-${i}`} className="w-4 h-4 text-yellow-400" />)}
            {[...Array(emptyStars)].map((_, i) => <StarIcon key={`empty-${i}`} className="w-4 h-4 text-yellow-400" />)}
            {rating > 0 && <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>}
        </div>
    );
};


interface InfluencerCardProps {
    influencer: InfluencerProfileType & { user: User };
    onSendMessage: (influencer: InfluencerProfileType & { user: User }) => void;
    onRequestCollab: (influencer: InfluencerProfileType & { user: User }) => void;
    currentUser: User;
    collabRequests: CollabRequest[];
}

const InfluencerCard: React.FC<InfluencerCardProps> = ({ influencer, onSendMessage, onRequestCollab, currentUser, collabRequests }) => {
    const isCampaignCurrentlyActive = influencer.adCampaignActive && influencer.campaignEndDate && new Date(influencer.campaignEndDate) > new Date();
    
    const latestRequest = useMemo(() => collabRequests
        .filter(r => r.influencerId === influencer.userId && r.customerId === currentUser.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0], 
    [collabRequests, influencer.userId, currentUser.id]);

    const getStatusColor = (status: CollabStatus) => {
        switch (status) {
            case CollabStatus.Accepted: return 'text-green-800 bg-green-100';
            case CollabStatus.Pending: return 'text-yellow-800 bg-yellow-100';
            case CollabStatus.Rejected: return 'text-red-800 bg-red-100';
            case CollabStatus.Completed: return 'text-blue-800 bg-blue-100';
        }
    };

    return (
        <Card className="hover:shadow-indigo-200 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
            <div>
                <div className="relative">
                    <img className="h-48 w-full object-cover" src={`https://picsum.photos/seed/${influencer.user.name}/400/300`} alt={influencer.user.name} />
                    {isCampaignCurrentlyActive && (
                        <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                            <StarIcon className="w-4 h-4 mr-1"/> Promoted
                        </span>
                    )}
                     {influencer.isVerified && (
                        <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold p-1 rounded-full">
                            <CheckCircleIcon className="w-5 h-5"/>
                        </span>
                    )}
                </div>
                <div className="p-4">
                    <div className="flex items-start space-x-3 mb-2">
                        <img className="h-12 w-12 rounded-full object-cover" src={influencer.user.avatar} alt={influencer.user.name} />
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-bold text-gray-900">{influencer.user.name}</h3>
                                <StarRatingDisplay rating={influencer.rating} />
                            </div>
                             <div className="flex flex-wrap gap-1 mt-1">
                                {influencer.categories.map(cat => (
                                    <span key={cat} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">{cat}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                     {latestRequest && (
                        <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-semibold text-gray-700 flex justify-between items-center">
                                <span>Your Last Status:</span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(latestRequest.status)}`}>
                                    {latestRequest.status}
                                </span>
                            </p>
                        </div>
                    )}
                    <p className="text-gray-600 text-sm my-4 h-10 overflow-hidden">{influencer.bio}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
                       <div className="flex items-center"><UsersIcon className="w-4 h-4 mr-1"/> {(influencer.followers / 1000).toFixed(1)}k</div>
                       <div className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1"/> {influencer.location}</div>
                       <div className="flex items-center"><CurrencyDollarIcon className="w-4 h-4 mr-1"/> ₹{influencer.pricePerPost.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>
            <div className="p-4 pt-0">
                 <div className="flex space-x-2">
                    <Button className="w-full" size="sm" variant="secondary" onClick={() => onSendMessage(influencer)}>
                        <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 mr-2" />
                        Message
                    </Button>
                    <Button className="w-full" size="sm" onClick={() => onRequestCollab(influencer)}>
                        <CalendarDaysIcon className="w-4 h-4 mr-2" />
                        Collab
                    </Button>
                </div>
            </div>
        </Card>
    );
};

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onUpdateUser, influencerProfiles, setInfluencerProfiles, collabRequests, setCollabRequests, users, messages, setMessages, helpTickets, onCreateTicket, onCreatePayment, membershipPlans, payments, bannerAds }) => {
    const [view, setView] = useState<'dashboard' | 'profile' | 'payment' | 'chat' | 'help'>('dashboard');
    const [isMembershipModalOpen, setMembershipModalOpen] = useState<boolean>(false);
    const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
    const [selectedInfluencer, setSelectedInfluencer] = useState<(InfluencerProfileType & { user: User }) | null>(null);
    const [paymentDetails, setPaymentDetails] = useState<{ amount: number; description: string; onSuccess: () => void; onFailure: () => void; } | null>(null);
    const [isCollabModalOpen, setCollabModalOpen] = useState<boolean>(false);
    const [collabMessage, setCollabMessage] = useState<string>('');
    const [collabDate, setCollabDate] = useState<string>('');
    const [initialChatUserId, setInitialChatUserId] = useState<number | null>(null);
    const [now, setNow] = useState(new Date());

    // Rating Modal State
    const [isRatingModalOpen, setRatingModalOpen] = useState(false);
    const [collabToRate, setCollabToRate] = useState<CollabRequest | null>(null);
    const [rating, setRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update time every minute for countdown
        return () => clearInterval(timer);
    }, []);

    const isMembershipActive = useMemo(() => {
        if (!user.membership || user.membership === MembershipTier.None || !user.membershipExpiry) {
            return false;
        }
        return new Date(user.membershipExpiry) > now;
    }, [user.membership, user.membershipExpiry, now]);

    const effectiveMembership = isMembershipActive ? user.membership : MembershipTier.None;

    // Filter states for controlled inputs
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [priceFilter, setPriceFilter] = useState<number>(100000);

    // Applied filter states for filtering logic
    const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>('');
    const [appliedCategoryFilter, setAppliedCategoryFilter] = useState<string>('All');
    const [appliedPriceFilter, setAppliedPriceFilter] = useState<number>(100000);

    const filteredInfluencers = useMemo(() => {
        const now = new Date();
        return influencerProfiles
            .filter(p => {
                const matchesCategory = appliedCategoryFilter === 'All' || p.categories.includes(appliedCategoryFilter as InfluencerCategory);
                const matchesPrice = p.pricePerPost <= appliedPriceFilter;
                const searchTermLower = appliedSearchTerm.toLowerCase();
                const matchesSearch = p.user.name.toLowerCase().includes(searchTermLower) || p.location.toLowerCase().includes(searchTermLower);
                return matchesCategory && matchesPrice && matchesSearch;
            })
            .sort((a, b) => {
                const aIsActive = a.adCampaignActive && a.campaignEndDate && new Date(a.campaignEndDate) > now;
                const bIsActive = b.adCampaignActive && b.campaignEndDate && new Date(b.campaignEndDate) > now;
                
                if (aIsActive === bIsActive) return 0;
                return aIsActive ? -1 : 1;
            });
    }, [influencerProfiles, appliedCategoryFilter, appliedPriceFilter, appliedSearchTerm]);

    const myCollabs = useMemo(() => collabRequests.filter(c => c.customerId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [user.id, collabRequests]);
    const myPayments = useMemo(() => payments.filter(p => p.userId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [user.id, payments]);
    
    const relevantAds = useMemo(() => {
      return bannerAds.filter(ad => 
        ad.isActive &&
        new Date(ad.expiryDate) > now &&
        (ad.targetAudience === BannerAudience.Customer || ad.targetAudience === BannerAudience.Both)
      ).sort((a,b) => b.id - a.id); // Show newest first
    }, [bannerAds, now]);

    const getStatusColor = (status: CollabStatus) => {
        switch (status) {
            case CollabStatus.Accepted: return 'text-green-600 bg-green-100';
            case CollabStatus.Pending: return 'text-yellow-600 bg-yellow-100';
            case CollabStatus.Rejected: return 'text-red-600 bg-red-100';
            case CollabStatus.Completed: return 'text-blue-600 bg-blue-100';
        }
    };
    
    const getPaymentStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.Successful: return 'text-green-800 bg-green-100';
            case PaymentStatus.Pending: return 'text-yellow-800 bg-yellow-100';
            case PaymentStatus.Failed: return 'text-red-800 bg-red-100';
        }
    };
    
    const getDiscountRate = (tier: MembershipTier) => {
        switch (tier) {
            case MembershipTier.Basic: return 0.05; // 5%
            case MembershipTier.Gold: return 0.10; // 10%
            case MembershipTier.Premium: return 0.15; // 15%
            default: return 0;
        }
    };

    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        setAppliedSearchTerm(searchTerm);
        setAppliedCategoryFilter(categoryFilter);
        setAppliedPriceFilter(priceFilter);
    };

    const handleCloseMembershipModal = () => {
        setMembershipModalOpen(false);
        setUpgradeReason(null);
    };

    const handleChoosePlan = (plan: MembershipPlan) => {
        setPaymentDetails({
            amount: plan.price,
            description: `Upgrade to ${plan.name} Plan`,
            onSuccess: () => {
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 24);
                const updatedUser = { 
                    ...user, 
                    membership: plan.tier,
                    membershipExpiry: expiryDate.toISOString()
                };
                onUpdateUser(updatedUser);
                onCreatePayment({
                    userId: user.id,
                    amount: plan.price,
                    type: PaymentType.Membership,
                    status: PaymentStatus.Successful,
                    description: `${plan.name} Membership Plan`,
                });
                alert(`Successfully upgraded to the ${plan.name} plan! It is valid for 24 hours.`);
            },
            onFailure: () => {
                onCreatePayment({
                    userId: user.id,
                    amount: plan.price,
                    type: PaymentType.Membership,
                    status: PaymentStatus.Failed,
                    description: `${plan.name} Membership Plan`,
                });
                alert(`Payment for the ${plan.name} plan failed. Please try again.`);
            }
        });
        handleCloseMembershipModal();
        setView('payment');
    };

    const cleanupPayment = () => {
        setView('dashboard');
        setPaymentDetails(null);
    };

    const handlePaymentSuccess = () => {
        paymentDetails?.onSuccess();
        cleanupPayment();
    };

    const handlePaymentFailure = () => {
        paymentDetails?.onFailure();
        cleanupPayment();
    };


    const handleSendMessageClick = (influencer: InfluencerProfileType & { user: User }) => {
        if (!isMembershipActive) {
            setUpgradeReason('Please upgrade your plan to send messages to influencers.');
            setMembershipModalOpen(true);
            return;
        }
        setInitialChatUserId(influencer.userId);
        setView('chat');
    };

    const handleRequestCollabClick = (influencer: InfluencerProfileType & { user: User }) => {
         if (!isMembershipActive) {
            setUpgradeReason('Please upgrade your plan to request collaborations.');
            setMembershipModalOpen(true);
            return;
        }
        setSelectedInfluencer(influencer);
        setCollabModalOpen(true);
    };

    const handleCloseCollabModal = () => {
        setCollabModalOpen(false);
        setSelectedInfluencer(null);
        setCollabMessage('');
        setCollabDate('');
    };

    const handleProceedToPayment = () => {
        if (!collabMessage.trim() || !collabDate || !selectedInfluencer) {
            alert('Please fill out all fields.');
            return;
        }

        const currentInfluencer = selectedInfluencer;
        const currentMessage = collabMessage;
        const currentDate = collabDate;

        const discountRate = getDiscountRate(effectiveMembership as MembershipTier);
        const finalAmount = currentInfluencer.pricePerPost * (1 - discountRate);

        const newRequestData: Omit<CollabRequest, 'id'> = {
            customerId: user.id,
            influencerId: currentInfluencer.userId,
            message: currentMessage,
            status: CollabStatus.Pending,
            bookingType: effectiveMembership === MembershipTier.None ? 'Direct' : 'Collabzy',
            discountApplied: effectiveMembership !== MembershipTier.None,
            date: currentDate,
        };

        setPaymentDetails({
            amount: finalAmount,
            description: `Collaboration with ${currentInfluencer.user.name}`,
            onSuccess: () => {
                const newRequestId = (collabRequests[collabRequests.length - 1]?.id || 0) + 1;
                const newRequest: CollabRequest = { ...newRequestData, id: newRequestId };
                setCollabRequests(prev => [newRequest, ...prev]);
                onCreatePayment({
                    userId: user.id,
                    amount: finalAmount,
                    type: PaymentType.CollabBooking,
                    status: PaymentStatus.Successful,
                    description: `Collab with ${currentInfluencer.user.name}`,
                    influencerId: currentInfluencer.userId,
                    collabRequestId: newRequestId,
                });
                alert(`Collaboration request sent to ${currentInfluencer.user.name}!`);
            },
            onFailure: () => {
                 const newRequestId = (collabRequests[collabRequests.length - 1]?.id || 0) + 1;
                 onCreatePayment({
                    userId: user.id,
                    amount: finalAmount,
                    type: PaymentType.CollabBooking,
                    status: PaymentStatus.Failed,
                    description: `Collab with ${currentInfluencer.user.name}`,
                    influencerId: currentInfluencer.userId,
                    collabRequestId: newRequestId
                });
                alert(`Payment failed for collaboration with ${currentInfluencer.user.name}. Please try again.`);
            }
        });

        handleCloseCollabModal();
        setView('payment');
    };

    const handleOpenRatingModal = (collab: CollabRequest) => {
        setCollabToRate(collab);
        setRatingModalOpen(true);
    };

    const handleCloseRatingModal = () => {
        setRatingModalOpen(false);
        setCollabToRate(null);
        setRating(0);
        setReviewComment('');
    };

    const handleSubmitReview = () => {
        if (!collabToRate || rating === 0) {
            alert('Please select a star rating.');
            return;
        }

        setInfluencerProfiles(prevProfiles => {
            const profileIndex = prevProfiles.findIndex(p => p.userId === collabToRate.influencerId);
            if (profileIndex === -1) return prevProfiles;

            const updatedProfile = { ...prevProfiles[profileIndex] };
            const newReview = {
                id: Date.now(),
                customerId: user.id,
                rating,
                comment: reviewComment,
                date: new Date().toISOString().split('T')[0],
            };
            
            updatedProfile.reviews = [...updatedProfile.reviews, newReview];
            const totalRating = updatedProfile.reviews.reduce((sum, r) => sum + r.rating, 0);
            updatedProfile.rating = totalRating / updatedProfile.reviews.length;
            
            const newProfiles = [...prevProfiles];
            newProfiles[profileIndex] = updatedProfile;
            return newProfiles;
        });

        setCollabRequests(prevReqs => 
            prevReqs.map(req => req.id === collabToRate.id ? { ...req, isRated: true } : req)
        );

        handleCloseRatingModal();
        alert('Thank you for your review!');
    };

    const discount = selectedInfluencer ? getDiscountRate(effectiveMembership as MembershipTier) * selectedInfluencer.pricePerPost : 0;
    const finalPrice = selectedInfluencer ? selectedInfluencer.pricePerPost - discount : 0;


    if (view === 'profile') {
        return <CustomerProfileView 
                    user={user} 
                    onUpdateUser={onUpdateUser} 
                    onBack={() => setView('dashboard')} 
                    collabRequests={collabRequests}
                    influencerProfiles={influencerProfiles}
                />;
    }
    
    if (view === 'payment' && paymentDetails) {
        return <PaytmPaymentView 
            amount={paymentDetails.amount} 
            description={paymentDetails.description} 
            onSuccess={handlePaymentSuccess} 
            onFailure={handlePaymentFailure} 
            onCancel={cleanupPayment}
        />;
    }

    if (view === 'chat') {
        return <ChatView
            currentUser={user}
            users={users}
            messages={messages}
            setMessages={setMessages}
            initialSelectedUserId={initialChatUserId}
            onBack={() => {
                setView('dashboard');
                setInitialChatUserId(null);
            }}
        />
    }

    if (view === 'help') {
        return <HelpView
            currentUser={user}
            users={users}
            myTickets={helpTickets.filter(t => t.userId === user.id)}
            onCreateTicket={onCreateTicket}
            onBack={() => setView('dashboard')}
        />
    }

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Welcome, {user.name}!</h2>
                <div className="flex space-x-2">
                    <Button onClick={() => setView('help')} variant="secondary">Help & Support</Button>
                    <Button onClick={() => setView('chat')} variant="secondary">Messages</Button>
                    <Button onClick={() => setView('profile')} variant="secondary">My Profile</Button>
                </div>
            </div>

            {relevantAds.length > 0 && (
                <div className="space-y-4">
                    {relevantAds.map(ad => <BannerAdDisplay key={ad.id} ad={ad} />)}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Filters */}
                    <Card className="p-4">
                        <form onSubmit={handleApplyFilters}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
                                    <input
                                        id="search"
                                        type="text"
                                        placeholder="Name or location..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                    <select id="category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option>All</option>
                                        {Object.values(InfluencerCategory).map(cat => <option key={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Max Price: ₹{priceFilter.toLocaleString('en-IN')}</label>
                                    <input id="price" type="range" min="10000" max="100000" step="5000" value={priceFilter} onChange={e => setPriceFilter(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button type="submit">Apply Filters</Button>
                            </div>
                        </form>
                    </Card>

                    {/* Influencers Grid */}
                    {filteredInfluencers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredInfluencers.map(p => <InfluencerCard 
                                key={p.userId} 
                                influencer={p} 
                                onSendMessage={handleSendMessageClick} 
                                onRequestCollab={handleRequestCollabClick} 
                                currentUser={user}
                                collabRequests={collabRequests}
                            />)}
                        </div>
                    ) : (
                        <Card className="text-center py-16 px-6">
                             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No Influencers Found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Sorry, we couldn't find any profiles matching your current filters.
                            </p>
                            <div className="mt-6">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setCategoryFilter('All');
                                        setPriceFilter(100000);
                                        setAppliedSearchTerm('');
                                        setAppliedCategoryFilter('All');
                                        setAppliedPriceFilter(100000);
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Membership Card */}
                    <Card className="p-6 text-center">
                        <h3 className="text-lg font-bold mb-2">Your Membership</h3>
                        <p className={`text-2xl font-bold ${effectiveMembership === MembershipTier.Premium ? 'text-yellow-500' : 'text-indigo-600'}`}>{effectiveMembership}</p>
                        {isMembershipActive && user.membershipExpiry ? (
                            <p className="text-sm text-gray-500 mb-4">
                                Expires in {formatDistanceToNowStrict(new Date(user.membershipExpiry), { addSuffix: false })}.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 mb-4">Upgrade to access member-only features and discounts.</p>
                        )}
                        <Button onClick={() => setMembershipModalOpen(true)}>
                            {isMembershipActive ? 'Change Plan' : 'Upgrade Plan'}
                        </Button>
                    </Card>

                    {/* My Collaborations */}
                    <Card>
                        <h3 className="p-4 text-lg font-bold border-b">My Collaborations</h3>
                        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                            {myCollabs.map(collab => {
                                const influencer = influencerProfiles.find(p => p.userId === collab.influencerId);
                                return (
                                <li key={collab.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div>
                                        <p className="font-semibold">{influencer?.user.name}</p>
                                        <p className="text-sm text-gray-500">{collab.date}</p>
                                    </div>
                                    <div className="flex items-center mt-2 sm:mt-0">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(collab.status)}`}>
                                            {collab.status}
                                        </span>
                                        {collab.status === CollabStatus.Completed && !collab.isRated && (
                                            <Button size="sm" variant="secondary" className="ml-3" onClick={() => handleOpenRatingModal(collab)}>Rate</Button>
                                        )}
                                    </div>
                                </li>
                            )})}
                        </ul>
                    </Card>

                    {/* Transaction History */}
                    <Card>
                        <h3 className="p-4 text-lg font-bold border-b">Transaction History</h3>
                        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                            {myPayments.map(payment => (
                                <li key={payment.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gray-100 rounded-full mr-3">
                                            <CreditCardIcon className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{payment.description}</p>
                                            <p className="text-sm text-gray-500">{format(new Date(payment.date), 'PP')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">₹{payment.amount.toLocaleString('en-IN')}</p>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
             <Modal isOpen={isMembershipModalOpen} onClose={handleCloseMembershipModal} title="Upgrade Your Plan">
                {upgradeReason && (
                    <div className="p-3 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50" role="alert">
                        <span className="font-medium">Action Required!</span> {upgradeReason}
                    </div>
                )}
                <div className="space-y-4">
                    {membershipPlans.map(plan => (
                        <div key={plan.tier} className={`border p-4 rounded-lg ${effectiveMembership === plan.tier ? 'border-indigo-500 ring-2 ring-indigo-200' : ''}`}>
                            <h4 className="text-xl font-bold text-indigo-600">{plan.name} - ₹{plan.price}</h4>
                            <ul className="list-disc list-inside text-gray-600 my-2">
                                {plan.features.map(f => <li key={f}>{f}</li>)}
                            </ul>
                            {effectiveMembership === plan.tier ? (
                                <Button className="w-full" disabled variant="secondary">Current Plan</Button>
                            ) : (
                                <Button 
                                  className="w-full" 
                                  onClick={() => handleChoosePlan(plan)}
                                >
                                  Choose {plan.name}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </Modal>
             <Modal isOpen={isCollabModalOpen} onClose={handleCloseCollabModal} title={`Request Collab with ${selectedInfluencer?.user.name}`}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="collabMessage" className="block text-sm font-medium text-gray-700">Collaboration Brief</label>
                        <textarea
                            id="collabMessage"
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={`Hi ${selectedInfluencer?.user.name}, I'd like to propose a collaboration for...`}
                            value={collabMessage}
                            onChange={(e) => setCollabMessage(e.target.value)}
                        />
                    </div>
                     <div>
                        <label htmlFor="collabDate" className="block text-sm font-medium text-gray-700">Proposed Date</label>
                        <input
                            type="date"
                            id="collabDate"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={collabDate}
                            onChange={(e) => setCollabDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    {selectedInfluencer && (
                        <div className="p-4 bg-gray-50 rounded-lg border">
                             <h4 className="text-md font-semibold text-gray-800 mb-2">Payment Summary</h4>
                             <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Influencer Rate:</span>
                                    <span>₹{selectedInfluencer.pricePerPost.toLocaleString('en-IN')}</span>
                                </div>
                                {discount > 0 && (
                                     <div className="flex justify-between text-green-600">
                                        <span >{effectiveMembership} Discount ({getDiscountRate(effectiveMembership as MembershipTier) * 100}%):</span>
                                        <span>-₹{discount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg text-indigo-600 border-t pt-2 mt-2">
                                    <span>Total:</span>
                                    <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                                </div>
                             </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="secondary" onClick={handleCloseCollabModal}>Cancel</Button>
                        <Button onClick={handleProceedToPayment}>Proceed to Payment</Button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isRatingModalOpen} onClose={handleCloseRatingModal} title={`Rate ${influencerProfiles.find(p => p.userId === collabToRate?.influencerId)?.user.name}`}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                                    {star <= rating ? (
                                        <SolidStarIcon className="w-8 h-8 text-yellow-400" />
                                    ) : (
                                        <StarIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700">Add a comment (optional)</label>
                        <textarea
                            id="reviewComment"
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Share your experience..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="secondary" onClick={handleCloseRatingModal}>Cancel</Button>
                        <Button onClick={handleSubmitReview}>Submit Review</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
};

export default CustomerDashboard;