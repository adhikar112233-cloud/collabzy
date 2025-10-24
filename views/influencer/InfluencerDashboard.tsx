import React, { useState, useMemo } from 'react';
import { User, CollabStatus, InfluencerProfile, CollabRequest, CampaignPlan, Message, HelpTicket, Payment, PaymentType, PaymentStatus, Attachment, BannerAd, BannerAudience } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ProfileEditor from './ProfileEditor';
import Modal from '../../components/common/Modal';
import PaytmPaymentView from '../customer/PhonePePaymentView';
import ChatView from '../chat/ChatView';
import HelpView from '../shared/HelpView';
import BannerAdDisplay from '../shared/BannerAdDisplay';

interface InfluencerDashboardProps {
  user: User;
  influencerProfiles: (InfluencerProfile & { user: User })[];
  onUpdateProfile: (profile: InfluencerProfile) => void;
  onUpdateUser: (user: User) => void;
  collabRequests: CollabRequest[];
  setCollabRequests: React.Dispatch<React.SetStateAction<CollabRequest[]>>;
  users: User[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  helpTickets: HelpTicket[];
  onCreateTicket: (ticketData: { userId: number; subject: string; message: string; attachment?: Attachment; }) => void;
  onCreatePayment: (paymentData: Omit<Payment, 'id' | 'date'>) => void;
  campaignPlans: CampaignPlan[];
  bannerAds: BannerAd[];
}

const InfluencerDashboard: React.FC<InfluencerDashboardProps> = ({ user, influencerProfiles, onUpdateProfile, onUpdateUser, collabRequests, setCollabRequests, users, messages, setMessages, helpTickets, onCreateTicket, onCreatePayment, campaignPlans, bannerAds }) => {
    const [view, setView] = useState<'dashboard' | 'editProfile' | 'payment' | 'chat' | 'help'>('dashboard');
    const [isCampaignModalOpen, setCampaignModalOpen] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<{ amount: number; description: string; onSuccess: () => void; onFailure: () => void; } | null>(null);
    const [statusFilter, setStatusFilter] = useState<CollabStatus | 'All'>('All');
    const [now, setNow] = useState(new Date());
    
    const myProfile = useMemo(() => influencerProfiles.find(p => p.userId === user.id), [user.id, influencerProfiles]);
    
    const myRequests = useMemo(() => collabRequests
        .filter(r => r.influencerId === user.id)
        .filter(r => statusFilter === 'All' || r.status === statusFilter)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [user.id, collabRequests, statusFilter]);

    if (!myProfile) return <div className="text-red-500">Could not find influencer profile.</div>;
    
    const allMyRequests = useMemo(() => collabRequests.filter(r => r.influencerId === user.id), [user.id, collabRequests]);
    const pendingRequestsCount = useMemo(() => allMyRequests.filter(r => r.status === CollabStatus.Pending).length, [allMyRequests]);
    const acceptedRequestsCount = useMemo(() => allMyRequests.filter(r => r.status === CollabStatus.Accepted).length, [allMyRequests]);
    const completedRequestsCount = useMemo(() => allMyRequests.filter(r => r.status === CollabStatus.Completed).length, [allMyRequests]);

    const isCampaignCurrentlyActive = myProfile.adCampaignActive && myProfile.campaignEndDate && new Date(myProfile.campaignEndDate) > now;

    const relevantAds = useMemo(() => {
        return bannerAds.filter(ad => 
            ad.isActive &&
            new Date(ad.expiryDate) > now &&
            (ad.targetAudience === BannerAudience.Influencer || ad.targetAudience === BannerAudience.Both)
        ).sort((a,b) => b.id - a.id);
    }, [bannerAds, now]);

    const handleStatusChange = (requestId: number, newStatus: CollabStatus) => {
        setCollabRequests(prevRequests =>
            prevRequests.map(req =>
                req.id === requestId ? { ...req, status: newStatus } : req
            )
        );
    };

    const getStatusColor = (status: CollabStatus) => {
        switch (status) {
            case CollabStatus.Accepted: return 'border-green-500';
            case CollabStatus.Pending: return 'border-yellow-500';
            case CollabStatus.Rejected: return 'border-red-500';
            case CollabStatus.Completed: return 'border-blue-500';
        }
    }

    const handleChooseCampaignPlan = (plan: CampaignPlan) => {
        setPaymentDetails({
            amount: plan.price,
            description: `Activate ${plan.name}`,
            onSuccess: () => {
                const newEndDate = new Date();
                newEndDate.setMonth(newEndDate.getMonth() + plan.durationMonths);
                
                const updatedProfile = {
                    ...myProfile,
                    adCampaignActive: true,
                    campaignEndDate: newEndDate.toISOString().split('T')[0],
                };
                onUpdateProfile(updatedProfile);
                onCreatePayment({
                    userId: user.id,
                    amount: plan.price,
                    type: PaymentType.AdCampaign,
                    status: PaymentStatus.Successful,
                    description: plan.name,
                    influencerId: user.id
                });
                alert(`Successfully activated the ${plan.name}! Your profile is now boosted.`);
            },
            onFailure: () => {
                onCreatePayment({
                    userId: user.id,
                    amount: plan.price,
                    type: PaymentType.AdCampaign,
                    status: PaymentStatus.Failed,
                    description: plan.name,
                    influencerId: user.id
                });
                alert(`Payment for the ${plan.name} failed. Please try again.`);
            }
        });
        setCampaignModalOpen(false);
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
    
    if (view === 'editProfile') {
        return <ProfileEditor 
            profile={myProfile} 
            user={user} 
            onBack={() => setView('dashboard')} 
            onSave={(updatedProfile) => {
                onUpdateProfile(updatedProfile);
                setView('dashboard');
            }}
            onUpdateUser={onUpdateUser}
            collabRequests={collabRequests}
            users={users}
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
            onBack={() => setView('dashboard')}
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
                    <Button onClick={() => setView('editProfile')}>Edit Profile</Button>
                </div>
            </div>

            {relevantAds.length > 0 && (
                <div className="space-y-4">
                    {relevantAds.map(ad => <BannerAdDisplay key={ad.id} ad={ad} />)}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Requests Column */}
                <div className="md:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold">Collaboration Requests</h3>

                    <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
                        {(['All', ...Object.values(CollabStatus)] as const).map(status => (
                            <Button
                                key={status}
                                size="sm"
                                variant={statusFilter === status ? 'primary' : 'secondary'}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {myRequests.length > 0 ? (
                            myRequests.map(req => {
                                const customer = users.find(u => u.id === req.customerId);
                                return (
                                    <Card key={req.id} className={`border-l-4 ${getStatusColor(req.status)}`}>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold">{customer?.name}</p>
                                                    <p className="text-sm text-gray-500">{req.date}</p>
                                                    <p className="mt-2 text-gray-700">{req.message}</p>
                                                </div>
                                                <div className={`px-2 py-1 text-xs font-semibold rounded-full bg-opacity-20 ${
                                                    req.status === CollabStatus.Accepted ? 'bg-green-500 text-green-800' :
                                                    req.status === CollabStatus.Pending ? 'bg-yellow-500 text-yellow-800' :
                                                    req.status === CollabStatus.Rejected ? 'bg-red-500 text-red-800' : 'bg-blue-500 text-blue-800'
                                                }`}>{req.status}</div>
                                            </div>
                                             {(req.status === CollabStatus.Pending || req.status === CollabStatus.Accepted) && (
                                                <div className="flex space-x-2 mt-4">
                                                    {req.status === CollabStatus.Pending && (
                                                        <>
                                                            <Button size="sm" onClick={() => handleStatusChange(req.id, CollabStatus.Accepted)}>Accept</Button>
                                                            <Button size="sm" variant="secondary" onClick={() => handleStatusChange(req.id, CollabStatus.Rejected)}>Reject</Button>
                                                        </>
                                                    )}
                                                    {req.status === CollabStatus.Accepted && (
                                                        <Button size="sm" onClick={() => handleStatusChange(req.id, CollabStatus.Completed)}>Mark as Complete</Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )
                            })
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No requests match the '{statusFilter}' filter.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Profile Stats Column */}
                <div className="space-y-6">
                     <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">My Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between"><span>Followers:</span><span className="font-bold">{(myProfile.followers/1000)}k</span></div>
                            <div className="flex justify-between"><span>Price/Post:</span><span className="font-bold">₹{myProfile.pricePerPost.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between"><span>Verification:</span><span className={`font-bold ${myProfile.isVerified ? 'text-green-600' : 'text-gray-500'}`}>{myProfile.isVerified ? 'Verified' : 'Not Verified'}</span></div>
                            <div className="border-t pt-3 mt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Pending Requests:</span>
                                    <span className="font-bold text-yellow-600">{pendingRequestsCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Active Collabs:</span>
                                    <span className="font-bold text-green-600">{acceptedRequestsCount}</span>
                                </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Completed Collabs:</span>
                                    <span className="font-bold text-blue-600">{completedRequestsCount}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-indigo-600 text-white">
                        <h3 className="text-lg font-bold mb-2">Boost Your Visibility</h3>
                        <p className="text-sm opacity-90 mb-4">Run an ad campaign to get noticed by more customers and get bookings faster.</p>
                        <Button 
                            variant="secondary" 
                            className="w-full"
                            onClick={() => setCampaignModalOpen(true)}
                            disabled={isCampaignCurrentlyActive}
                        >
                            {isCampaignCurrentlyActive 
                                ? `Campaign Active Until ${new Date(myProfile.campaignEndDate!).toLocaleDateString()}` 
                                : 'Start Campaign'}
                        </Button>
                    </Card>
                </div>
            </div>
            <Modal isOpen={isCampaignModalOpen} onClose={() => setCampaignModalOpen(false)} title="Choose a Campaign Plan">
                <div className="space-y-4">
                    {campaignPlans.map(plan => (
                        <div key={plan.name} className="border p-4 rounded-lg hover:border-indigo-500 hover:ring-2 hover:ring-indigo-200">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xl font-bold text-indigo-600">{plan.name}</h4>
                                <p className="text-2xl font-bold">₹{plan.price}</p>
                            </div>
                            <p className="text-gray-600 my-2 text-sm">{plan.description}</p>
                            <Button 
                              className="w-full" 
                              onClick={() => handleChooseCampaignPlan(plan)}
                            >
                              Choose {plan.name}
                            </Button>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default InfluencerDashboard;