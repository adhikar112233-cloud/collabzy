import React, { useState, useMemo, useRef, useCallback } from 'react';
import { User, InfluencerProfile, CollabRequest, HelpTicket, CollabStatus, HelpTicketReply, UserRole, Payment, PaymentType, Message, MessageType, PaymentStatus, MembershipPlan, CampaignPlan, Attachment, BannerAd, BannerAudience } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { format, isToday, isYesterday } from 'date-fns';
import { ChatBubbleOvalLeftEllipsisIcon, DocumentIcon, CurrencyDollarIcon, PaperClipIcon, XMarkIcon, PhotoIcon, PencilIcon, TrashIcon, MegaphoneIcon, UserPlusIcon } from '../../components/icons/HeroIcons';

type AdminTab = 'analytics' | 'users' | 'influencers' | 'bookings' | 'help' | 'payments' | 'messages' | 'pricing' | 'banners';

interface AdminDashboardProps {
    currentUser: User;
    users: User[];
    onUpdateUser: (user: User) => void;
    influencerProfiles: (InfluencerProfile & { user: User })[];
    onUpdateProfile: (profile: InfluencerProfile) => void;
    collabRequests: CollabRequest[];
    helpTickets: HelpTicket[];
    onUpdateTicket: (ticket: HelpTicket) => void;
    payments: Payment[];
    onUpdatePayment: (payment: Payment) => void;
    messages: Message[];
    membershipPlans: MembershipPlan[];
    onUpdateMembershipPlan: (plan: MembershipPlan) => void;
    campaignPlans: CampaignPlan[];
    onUpdateCampaignPlan: (plan: CampaignPlan) => void;
    bannerAds: BannerAd[];
    onCreateBannerAd: (bannerData: Omit<BannerAd, 'id'>) => void;
    onUpdateBannerAd: (updatedBanner: BannerAd) => void;
    onDeleteBannerAd: (bannerId: number) => void;
    onCreateAdmin: (adminData: { name: string; email: string; password?: string }) => void;
}

const FinancialsModal: React.FC<{ profile: InfluencerProfile & { user: User }; onClose: () => void; onSave: (profile: InfluencerProfile) => void; }> = ({ profile, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      ...profile,
      bankAccount: profile.bankAccount || { accountHolderName: '', accountNumber: '', ifscCode: '', branchName: '', bankName: '' },
      upiId: profile.upiId || ''
    });

    const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, bankAccount: { ...prev.bankAccount!, [name]: value } }));
    };

    const handleUpiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, upiId: e.target.value }));
    };
    
    const handleSaveChanges = () => {
        const { user, ...profileData } = formData;
        onSave(profileData);
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Financial Details for ${profile.user.name}`}>
            <div className="space-y-4">
                 <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-700 mb-3">Bank Account Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="adminAccountHolderName" className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                            <input type="text" id="adminAccountHolderName" name="accountHolderName" value={formData.bankAccount?.accountHolderName} onChange={handleBankDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="adminAccountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                            <input type="text" id="adminAccountNumber" name="accountNumber" value={formData.bankAccount?.accountNumber} onChange={handleBankDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="adminIfscCode" className="block text-sm font-medium text-gray-700">IFSC Code</label>
                            <input type="text" id="adminIfscCode" name="ifscCode" value={formData.bankAccount?.ifscCode} onChange={handleBankDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="adminBankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                            <input type="text" id="adminBankName" name="bankName" value={formData.bankAccount?.bankName} onChange={handleBankDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="adminBranchName" className="block text-sm font-medium text-gray-700">Branch Name</label>
                            <input type="text" id="adminBranchName" name="branchName" value={formData.bankAccount?.branchName} onChange={handleBankDetailsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-700 mb-3">UPI ID</h4>
                    <div>
                        <label htmlFor="adminUpiId" className="block text-sm font-medium text-gray-700">UPI ID</label>
                        <input type="text" id="adminUpiId" name="upiId" value={formData.upiId} onChange={handleUpiChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="yourname@bank" />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
            </div>
        </Modal>
    );
};

const TicketDetailModal: React.FC<{ ticket: HelpTicket; onClose: () => void; onUpdate: (ticket: HelpTicket) => void; users: User[], adminUser: User | undefined }> = ({ ticket, onClose, onUpdate, users, adminUser }) => {
    const [replyMessage, setReplyMessage] = useState('');
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const ticketUser = users.find(u => u.id === ticket.userId);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachment({
                    url: reader.result as string,
                    fileName: file.name,
                    mimeType: file.type,
                });
            };
            reader.readAsDataURL(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleSendReply = () => {
        if ((!replyMessage.trim() && !attachment) || !adminUser) return;
        
        const newReply: HelpTicketReply = {
            authorId: adminUser.id,
            message: replyMessage,
            timestamp: new Date().toISOString(),
            attachment: attachment,
        };

        const updatedTicket = {
            ...ticket,
            replies: [...ticket.replies, newReply]
        };

        onUpdate(updatedTicket);
        setReplyMessage('');
        setAttachment(null);
    };

    const handleToggleStatus = () => {
        const updatedTicket = { ...ticket, isResolved: !ticket.isResolved };
        onUpdate(updatedTicket);
    };

    const getAuthor = (authorId: number) => users.find(u => u.id === authorId) || { name: 'Unknown', avatar: '' };

    const renderAttachment = (attachment: Attachment) => (
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" download={attachment.fileName} className="mt-2 flex items-center p-2 bg-gray-200/50 rounded-lg hover:bg-gray-200/80 transition-colors max-w-xs">
            {attachment.mimeType?.startsWith('image/') ? (
                <img src={attachment.url} alt={attachment.fileName} className="w-10 h-10 object-cover rounded-md mr-2" />
            ) : (
                <DocumentIcon className="w-8 h-8 text-gray-600 mr-2 flex-shrink-0" />
            )}
            <div className="truncate">
                <p className="text-sm font-medium text-gray-800 truncate">{attachment.fileName}</p>
                <p className="text-xs text-gray-500">Click to view</p>
            </div>
        </a>
    );

    return (
        <Modal isOpen={true} onClose={onClose} title={`Ticket: ${ticket.subject}`}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,.doc,.docx,.zip" />
            <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md border">
                    <div className="flex justify-between items-center text-sm mb-2">
                       <p className="font-semibold">{ticketUser?.name}</p>
                       <p className="text-gray-500">{format(new Date(ticket.createdAt), 'PP pp')}</p>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                    {ticket.attachment && renderAttachment(ticket.attachment)}
                </div>
                
                <h4 className="font-semibold text-gray-800 border-b pb-2">Conversation</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {ticket.replies.map((reply, index) => {
                        const author = getAuthor(reply.authorId);
                        const isAdminReply = author.role === UserRole.Admin;
                        return (
                             <div key={index} className={`flex items-start gap-2.5 ${isAdminReply ? 'justify-end' : ''}`}>
                                <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full"/>
                                <div className={`p-3 rounded-lg ${isAdminReply ? 'bg-indigo-100 rounded-br-none' : 'bg-gray-100 rounded-bl-none'}`}>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                                        <span className="text-sm font-semibold text-gray-900">{author.name}</span>
                                        <span className="text-xs font-normal text-gray-500">{format(new Date(reply.timestamp), 'p')}</span>
                                    </div>
                                    <p className="text-sm font-normal text-gray-800 whitespace-pre-wrap">{reply.message}</p>
                                    {reply.attachment && renderAttachment(reply.attachment)}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="border-t pt-4">
                    <label htmlFor="replyMessage" className="block text-sm font-medium text-gray-700">Your Reply</label>
                    <textarea
                        id="replyMessage"
                        rows={3}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Type your response..."
                    />
                    <div className="mt-2">
                        {attachment ? (
                             <div className="flex items-center justify-between p-2 bg-gray-100 border rounded-md">
                                <div className="flex items-center space-x-2 truncate">
                                    {attachment.mimeType?.startsWith('image/') ? <PhotoIcon className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <DocumentIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                                    <span className="text-sm text-gray-700 truncate">{attachment.fileName}</span>
                                </div>
                                <button type="button" onClick={() => setAttachment(null)} className="p-1 rounded-full hover:bg-gray-200">
                                    <XMarkIcon className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        ) : (
                            <Button type="button" variant="secondary" size="sm" onClick={handleAttachClick}>
                                <PaperClipIcon className="w-4 h-4 mr-2" />
                                Attach File
                            </Button>
                        )}
                    </div>
                </div>
                 <div className="flex justify-between items-center pt-4 border-t">
                    <Button variant={ticket.isResolved ? 'secondary' : 'primary'} onClick={handleToggleStatus}>
                        {ticket.isResolved ? 'Re-open Ticket' : 'Mark as Resolved'}
                    </Button>
                    <div className="flex space-x-2">
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                        <Button onClick={handleSendReply} disabled={!replyMessage.trim() && !attachment}>Send Reply</Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, users, onUpdateUser, influencerProfiles, onUpdateProfile, collabRequests, helpTickets, onUpdateTicket, payments, onUpdatePayment, messages, membershipPlans, onUpdateMembershipPlan, campaignPlans, onUpdateCampaignPlan, bannerAds, onCreateBannerAd, onUpdateBannerAd, onDeleteBannerAd, onCreateAdmin }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
    const [isCredentialModalOpen, setCredentialModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [ticketToView, setTicketToView] = useState<HelpTicket | null>(null);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [openPaymentMenuId, setOpenPaymentMenuId] = useState<number | null>(null);
    const [editingPlan, setEditingPlan] = useState<MembershipPlan | CampaignPlan | null>(null);
    const [newPrice, setNewPrice] = useState(0);
    const [financialsModalProfile, setFinancialsModalProfile] = useState<(InfluencerProfile & { user: User }) | null>(null);
    
    // New state for banner and staff management
    const [isBannerModalOpen, setBannerModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerAd | null>(null);
    const [isStaffModalOpen, setStaffModalOpen] = useState(false);
    const [userRoleFilter, setUserRoleFilter] = useState<UserRole | 'All'>('All');


    const handleOpenCredentialModal = (user: User) => {
        setSelectedUser(user);
        setNewPassword(user.password || '');
        setCredentialModalOpen(true);
    };

    const handleCloseCredentialModal = () => {
        setSelectedUser(null);
        setNewPassword('');
        setCredentialModalOpen(false);
    };
    
    const handlePasswordSave = () => {
        if (selectedUser && newPassword) {
            onUpdateUser({ ...selectedUser, password: newPassword });
            alert(`Password for ${selectedUser.name} has been updated.`);
            handleCloseCredentialModal();
        } else {
            alert('Please enter a new password.');
        }
    };
    
    const handleToggleVerification = (profileWithUser: InfluencerProfile & { user: User }) => {
        const { user, ...profileData } = profileWithUser;
        onUpdateProfile({ ...profileData, isVerified: !profileData.isVerified });
    };

    const handlePaymentStatusUpdate = (payment: Payment, status: PaymentStatus) => {
        onUpdatePayment({ ...payment, status });
        setOpenPaymentMenuId(null);
    };

    const handleEditPrice = (plan: MembershipPlan | CampaignPlan) => {
        setEditingPlan(plan);
        setNewPrice(plan.price);
    };

    const handleSaveFinancials = (updatedProfile: InfluencerProfile) => {
        onUpdateProfile(updatedProfile);
        alert(`Financial details for ${users.find(u => u.id === updatedProfile.userId)?.name} updated.`);
    };

    const handleSavePrice = () => {
        if (!editingPlan) return;

        if ('tier' in editingPlan) { // It's a MembershipPlan
            onUpdateMembershipPlan({ ...editingPlan, price: newPrice });
        } else { // It's a CampaignPlan
            onUpdateCampaignPlan({ ...editingPlan, price: newPrice });
        }
        setEditingPlan(null);
    };

    const conversations = useMemo(() => {
        const conversationsMap = new Map<string, { users: User[], lastMessage: Message }>();
        messages.forEach(message => {
            const participantIds = [message.senderId, message.receiverId].sort((a,b) => a - b);
            const conversationId = participantIds.join('-');
            
            const user1 = users.find(u => u.id === participantIds[0]);
            const user2 = users.find(u => u.id === participantIds[1]);

            if (!user1 || !user2 || user1.role === UserRole.Admin || user2.role === UserRole.Admin) return;

            const existing = conversationsMap.get(conversationId);
            if (!existing || new Date(message.timestamp) > new Date(existing.lastMessage.timestamp)) {
                conversationsMap.set(conversationId, {
                    users: [user1, user2],
                    lastMessage: message
                });
            }
        });
        return Array.from(conversationsMap.values()).sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
    }, [messages, users]);


    const Analytics = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center"><p className="text-3xl font-bold">{users.length}</p><p>Total Users</p></Card>
            <Card className="p-4 text-center"><p className="text-3xl font-bold">{influencerProfiles.length}</p><p>Influencers</p></Card>
            <Card className="p-4 text-center"><p className="text-3xl font-bold">{collabRequests.length}</p><p>Total Bookings</p></Card>
            <Card className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{influencerProfiles.filter(p => p.adCampaignActive).length}</p><p>Active Ad Campaigns</p></Card>
        </div>
    );
    
    const getStatusColor = (status: CollabStatus) => {
        switch (status) {
            case CollabStatus.Accepted: return 'text-green-600 bg-green-100';
            case CollabStatus.Pending: return 'text-yellow-600 bg-yellow-100';
            case CollabStatus.Rejected: return 'text-red-600 bg-red-100';
            case CollabStatus.Completed: return 'text-blue-600 bg-blue-100';
        }
    };

    const getRoleColor = (role: UserRole | undefined) => {
        switch (role) {
            case UserRole.Customer: return 'bg-blue-100 text-blue-800';
            case UserRole.Influencer: return 'bg-purple-100 text-purple-800';
            case UserRole.Admin: return 'bg-gray-200 text-gray-800 font-semibold';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    const getPaymentTypeColor = (type: PaymentType) => {
        switch (type) {
            case PaymentType.Membership: return 'bg-blue-100 text-blue-800';
            case PaymentType.AdCampaign: return 'bg-yellow-100 text-yellow-800';
            case PaymentType.CollabBooking: return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    const getPaymentStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.Successful: return 'bg-green-100 text-green-800';
            case PaymentStatus.Pending: return 'bg-yellow-100 text-yellow-800';
            case PaymentStatus.Failed: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    const renderMessageContent = (message: Message) => {
        if (message.type === MessageType.Document && message.attachment) {
           return (
               <a 
                   href={message.attachment.url} 
                   download={message.attachment.fileName}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
               >
                   <DocumentIcon className="w-6 h-6 mr-2 flex-shrink-0"/>
                   <div className="flex-1 min-w-0">
                       <p className="truncate text-sm font-medium">{message.attachment.fileName}</p>
                   </div>
               </a>
           );
        }
        if (message.text) {
            return <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.text}</p>
        }
        return <p className="text-sm italic text-gray-400">[{message.type} attachment]</p>;
    };

    const MessageManager = () => {
        const selectedConversation = conversations.find(c => c.users.map(u => u.id).sort((a,b) => a - b).join('-') === selectedConversationId);
        const selectedMessages = useMemo(() => {
            if (!selectedConversation) return [];
            const [user1, user2] = selectedConversation.users;
            return messages
                .filter(m => (m.senderId === user1.id && m.receiverId === user2.id) || (m.senderId === user2.id && m.receiverId === user1.id))
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }, [selectedConversation, messages]);

        const formatTimestamp = (timestamp: string) => {
            const date = new Date(timestamp);
            if (isToday(date)) return format(date, 'p');
            if (isYesterday(date)) return 'Yesterday';
            return format(date, 'MM/dd/yy');
        };

        return (
            <Card className="h-[calc(100vh-20rem)] flex">
                <div className="w-1/3 border-r overflow-y-auto">
                    {conversations.map(conv => {
                        const [user1, user2] = conv.users;
                        const convId = [user1.id, user2.id].sort((a,b) => a - b).join('-');
                        return (
                            <div key={convId} onClick={() => setSelectedConversationId(convId)} className={`p-3 cursor-pointer hover:bg-gray-100 border-b ${selectedConversationId === convId ? 'bg-indigo-50' : ''}`}>
                               <div className="flex items-center space-x-2">
                                    <div className="flex -space-x-4">
                                        <img className="w-8 h-8 rounded-full border-2 border-white" src={user1.avatar} alt={user1.name} />
                                        <img className="w-8 h-8 rounded-full border-2 border-white" src={user2.avatar} alt={user2.name} />
                                    </div>
                                    <p className="font-semibold text-sm truncate">{user1.name} / {user2.name}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-gray-500 truncate pr-2">{conv.lastMessage.text || `[${conv.lastMessage.type}]`}</p>
                                    <p className="text-xs text-gray-400 flex-shrink-0">{formatTimestamp(conv.lastMessage.timestamp)}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="w-2/3 flex flex-col">
                    {selectedConversation ? (
                         <>
                            <div className="p-3 border-b flex items-center space-x-2">
                                {selectedConversation.users.map(u => <span key={u.id} className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(u.role)}`}>{u.name}</span>)}
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                               {selectedMessages.map(message => {
                                   const sender = users.find(u => u.id === message.senderId);
                                   const isCustomer = sender?.role === UserRole.Customer;
                                   if (!sender) return null;
                                   return (
                                        <div key={message.id} className={`flex items-end gap-2 ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                                            {isCustomer && <img src={sender.avatar} className="w-6 h-6 rounded-full self-start" alt={sender.name} />}
                                            <div className={`max-w-md p-3 rounded-xl ${isCustomer ? 'bg-white rounded-bl-none' : 'bg-indigo-500 text-white rounded-br-none'}`}>
                                                {renderMessageContent(message)}
                                                <p className={`text-xs mt-1 ${isCustomer ? 'text-gray-400' : 'text-indigo-200'} text-right`}>
                                                    {format(new Date(message.timestamp), 'p')}
                                                </p>
                                            </div>
                                            {!isCustomer && <img src={sender.avatar} className="w-6 h-6 rounded-full self-start" alt={sender.name} />}
                                        </div>
                                   )
                               })}
                            </div>
                        </>
                    ) : (
                         <div className="flex flex-col h-full items-center justify-center text-center bg-gray-50 p-4">
                            <ChatBubbleOvalLeftEllipsisIcon className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700">Message Monitoring</h3>
                            <p className="text-gray-500">Select a conversation from the left to view the chat history.</p>
                        </div>
                    )}
                </div>
            </Card>
        )
    }
    
    const renderContent = () => {
        switch (activeTab) {
            case 'analytics': return <Analytics />;
            case 'users': return (
                <Card>
                    <div className="p-3 flex justify-between items-center border-b">
                        <div className="flex items-center space-x-2">
                            {(['All', UserRole.Customer, UserRole.Influencer, UserRole.Admin] as const).map(role => (
                                <Button
                                    key={role}
                                    size="sm"
                                    variant={userRoleFilter === role ? 'primary' : 'secondary'}
                                    onClick={() => setUserRoleFilter(role)}
                                >
                                    {role === UserRole.Admin ? 'Staff' : role}s
                                </Button>
                            ))}
                        </div>
                        {userRoleFilter === UserRole.Admin && (
                            <Button size="sm" onClick={() => setStaffModalOpen(true)}>
                                <UserPlusIcon className="w-4 h-4 mr-2" />
                                Create New Staff
                            </Button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th>Email/Phone</th>
                                    <th>Role</th>
                                    <th>Membership</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => userRoleFilter === 'All' || u.role === userRoleFilter).map(u => (
                                    <tr key={u.id} className="border-b">
                                        <td className="p-3">{u.name}</td>
                                        <td>{u.email || u.phone}</td>
                                        <td>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(u.role)}`}>{u.role}</span>
                                        </td>
                                        <td>{u.membership || 'N/A'}</td>
                                        <td>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {u.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-3 space-x-2 whitespace-nowrap">
                                            <Button size="sm" variant="secondary" onClick={() => handleOpenCredentialModal(u)}>Credentials</Button>
                                            {u.id !== currentUser.id && (
                                                <Button size="sm" variant={u.isBlocked ? 'primary' : 'danger'} onClick={() => onUpdateUser({ ...u, isBlocked: !u.isBlocked })}>
                                                    {u.isBlocked ? 'Unblock' : 'Block'}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            );
            case 'influencers': return (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th>Categories</th>
                                    <th>Followers</th>
                                    <th>Payment Info</th>
                                    <th>Verified</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {influencerProfiles.map(p => (
                                    <tr key={p.userId} className="border-b">
                                        <td className="p-3">{p.user.name}</td>
                                        <td>{p.categories.join(', ')}</td>
                                        <td>{(p.followers / 1000).toFixed(1)}k</td>
                                        <td className="p-3 text-sm">
                                            {(() => {
                                                const hasUpi = p.upiId && p.upiId.trim() !== '';
                                                const hasBank = p.bankAccount && p.bankAccount.accountNumber && p.bankAccount.accountNumber.trim() !== '';
                                                if (hasUpi) {
                                                    return <div className="font-mono bg-gray-100 px-2 py-1 rounded inline-block">{p.upiId}</div>;
                                                }
                                                if (hasBank) {
                                                    return (
                                                        <div>
                                                            <p className="font-semibold">{p.bankAccount!.bankName}</p>
                                                            <p className="text-gray-500 font-mono">...{p.bankAccount!.accountNumber.slice(-4)}</p>
                                                        </div>
                                                    );
                                                }
                                                return <span className="text-gray-400 italic">Not provided</span>;
                                            })()}
                                        </td>
                                        <td>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {p.isVerified ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-3 space-x-2 whitespace-nowrap">
                                            <Button size="sm" variant={p.isVerified ? 'secondary' : 'primary'} onClick={() => handleToggleVerification(p)}>
                                                {p.isVerified ? 'Unverify' : 'Verify'}
                                            </Button>
                                            <Button size="sm" variant="secondary" onClick={() => setFinancialsModalProfile(p)}>
                                                <CurrencyDollarIcon className="w-4 h-4 mr-1"/>
                                                Financials
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            );
            case 'bookings': return (
                <Card>
                     <table className="w-full text-left">
                        <thead className="bg-gray-50"><tr><th className="p-3">Customer</th><th>Influencer</th><th>Date</th><th>Status</th></tr></thead>
                        <tbody>{collabRequests.map(req => {
                            const customer = users.find(u => u.id === req.customerId);
                            const influencer = users.find(u => u.id === req.influencerId);
                            return <tr key={req.id} className="border-b">
                                <td className="p-3">{customer?.name}</td><td>{influencer?.name}</td><td>{req.date}</td>
                                <td><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}>{req.status}</span></td>
                            </tr>
                        })}</tbody>
                    </table>
                </Card>
            );
            case 'help': return (
                 <Card>
                     <table className="w-full text-left">
                        <thead className="bg-gray-50"><tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Subject</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3">Actions</th></tr></thead>
                        <tbody>{[...helpTickets].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(t => {
                            const user = users.find(u => u.id === t.userId);
                            return <tr key={t.id} className="border-b">
                                <td className="p-3">{user?.name}</td>
                                <td className="p-3">
                                    {user?.role && user.role !== UserRole.Admin && (
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    )}
                                </td>
                                <td className="p-3">{t.subject}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.isResolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {t.isResolved ? 'Resolved' : 'Pending'}
                                    </span>
                                </td>
                                <td className="p-3 text-sm text-gray-500">{format(new Date(t.createdAt), 'PP')}</td>
                                <td className="p-3">
                                    <Button size="sm" onClick={() => setTicketToView(t)}>View & Reply</Button>
                                </td>
                            </tr>
                        })}</tbody>
                    </table>
                </Card>
            );
             case 'payments': return (
                <Card>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">User</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Amount</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...payments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => {
                                    const user = users.find(u => u.id === p.userId);
                                    return (
                                        <tr key={p.id} className="border-b">
                                            <td className="p-3 text-sm text-gray-500 whitespace-nowrap">{format(new Date(p.date), 'PP')}</td>
                                            <td className="p-3 font-medium">{user?.name || 'Unknown User'}</td>
                                            <td className="p-3">
                                                {user?.role && <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>{user.role}</span>}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeColor(p.type)}`}>
                                                    {p.type}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm">{p.description}</td>
                                            <td className="p-3">
                                                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(p.status)}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="p-3 font-semibold text-right">₹{p.amount.toLocaleString('en-IN')}</td>
                                            <td className="p-3 relative">
                                                <Button size="sm" onClick={() => setOpenPaymentMenuId(prevId => prevId === p.id ? null : p.id)}>Manage</Button>
                                                {openPaymentMenuId === p.id && (
                                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border">
                                                        <ul className="py-1">
                                                            <li><button onClick={() => handlePaymentStatusUpdate(p, PaymentStatus.Successful)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Set Successful</button></li>
                                                            <li><button onClick={() => handlePaymentStatusUpdate(p, PaymentStatus.Pending)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Set Pending</button></li>
                                                            <li><button onClick={() => handlePaymentStatusUpdate(p, PaymentStatus.Failed)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Set Failed</button></li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            );
            case 'messages': return <MessageManager />;
            case 'pricing': return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-bold p-4 border-b">Customer Membership Plans</h3>
                        <div className="space-y-4 p-4">
                            {membershipPlans.map(plan => (
                                <div key={plan.tier} className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-indigo-600">{plan.name} Plan</h4>
                                        <Button size="sm" variant="secondary" onClick={() => handleEditPrice(plan)}>Edit Price</Button>
                                    </div>
                                    <p className="text-2xl font-bold mt-2">₹{plan.price.toLocaleString('en-IN')}</p>
                                    <ul className="text-xs text-gray-500 list-disc list-inside mt-2">
                                        {plan.features.map(f => <li key={f}>{f}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-bold p-4 border-b">Influencer Campaign Plans</h3>
                         <div className="space-y-4 p-4">
                            {campaignPlans.map(plan => (
                                <div key={plan.durationMonths} className="p-3 bg-gray-50 rounded-lg border">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-indigo-600">{plan.name}</h4>
                                        <Button size="sm" variant="secondary" onClick={() => handleEditPrice(plan)}>Edit Price</Button>
                                    </div>
                                    <p className="text-2xl font-bold mt-2">₹{plan.price.toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-gray-500 mt-2">{plan.description}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            );
            case 'banners': return (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Manage Ad Banners</h3>
                        <Button onClick={() => { setEditingBanner(null); setBannerModalOpen(true); }}>
                            <MegaphoneIcon className="w-5 h-5 mr-2" />
                            Create New Banner
                        </Button>
                    </div>
                    <Card>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3">Preview</th>
                                        <th>Title</th>
                                        <th>Target</th>
                                        <th>Status</th>
                                        <th>Expires</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bannerAds.map(ad => (
                                        <tr key={ad.id} className="border-b">
                                            <td className="p-3">
                                                <img src={ad.imageUrl} alt={ad.title} className="w-24 h-12 object-cover rounded-md" />
                                            </td>
                                            <td className="font-medium">{ad.title}</td>
                                            <td>{ad.targetAudience}</td>
                                            <td>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {ad.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="text-sm text-gray-500">{format(new Date(ad.expiryDate), 'PP')}</td>
                                            <td className="p-3 space-x-2 whitespace-nowrap">
                                                <Button size="sm" variant="secondary" onClick={() => { setEditingBanner(ad); setBannerModalOpen(true); }}>
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="danger" onClick={() => { if(confirm('Are you sure?')) onDeleteBannerAd(ad.id); }}>
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            );
            default: return null;
        }
    };

    const TabButton: React.FC<{ tab: AdminTab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold rounded-t-lg ${activeTab === tab ? 'bg-white border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Admin Panel</h2>
            <Card className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">NOTICE BOARD</h3>
                <p className="text-gray-600 mt-2">Welcome to the admin dashboard. System is currently running at 99.9% uptime. All services are operational.</p>
            </Card>

            <div>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 overflow-x-auto">
                        <TabButton tab="analytics" label="Analytics" />
                        <TabButton tab="users" label="Manage Users" />
                        <TabButton tab="influencers" label="Manage Influencers" />
                        <TabButton tab="bookings" label="Manage Bookings" />
                        <TabButton tab="payments" label="Payment History" />
                        <TabButton tab="pricing" label="Pricing" />
                         <TabButton tab="banners" label="Ad Banners" />
                        <TabButton tab="help" label="Help Section" />
                        <TabButton tab="messages" label="Manage Messages" />
                    </nav>
                </div>
                <div className="mt-4">
                    {renderContent()}
                </div>
            </div>

            <Modal isOpen={isCredentialModalOpen} onClose={handleCloseCredentialModal} title={`Manage Credentials for ${selectedUser?.name}`}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="userIdentifier" className="block text-sm font-medium text-gray-700">Email or Phone</label>
                        <input
                            id="userIdentifier"
                            type="text"
                            readOnly
                            value={selectedUser?.email || selectedUser?.phone || ''}
                            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Set New Password</label>
                        <input
                            id="newPassword"
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter new password"
                        />
                         <p className="text-xs text-gray-500 mt-1">Note: In a real app, passwords would be hashed and not shown.</p>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="secondary" onClick={handleCloseCredentialModal}>Cancel</Button>
                        <Button onClick={handlePasswordSave}>Save Changes</Button>
                    </div>
                </div>
            </Modal>
             <Modal isOpen={!!editingPlan} onClose={() => setEditingPlan(null)} title={`Edit Price for ${editingPlan?.name}`}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="newPrice" className="block text-sm font-medium text-gray-700 flex items-center">
                            <CurrencyDollarIcon className="w-5 h-5 mr-2 text-gray-400"/>
                            Set New Price (₹)
                        </label>
                        <input
                            id="newPrice"
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter new price"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="secondary" onClick={() => setEditingPlan(null)}>Cancel</Button>
                        <Button onClick={handleSavePrice}>Save Price</Button>
                    </div>
                </div>
            </Modal>
            {ticketToView && (
                <TicketDetailModal 
                    ticket={ticketToView}
                    onClose={() => setTicketToView(null)}
                    onUpdate={onUpdateTicket}
                    users={users}
                    adminUser={users.find(u => u.role === UserRole.Admin)}
                />
            )}
            {financialsModalProfile && (
                <FinancialsModal
                    profile={financialsModalProfile}
                    onClose={() => setFinancialsModalProfile(null)}
                    onSave={handleSaveFinancials}
                />
            )}
            {isBannerModalOpen && <BannerModal isOpen={isBannerModalOpen} onClose={() => setBannerModalOpen(false)} banner={editingBanner} onCreate={onCreateBannerAd} onUpdate={onUpdateBannerAd} />}
            {isStaffModalOpen && <StaffModal isOpen={isStaffModalOpen} onClose={() => setStaffModalOpen(false)} onCreate={onCreateAdmin} />}
        </div>
    );
};


const BannerModal: React.FC<{ isOpen: boolean; onClose: () => void; banner: BannerAd | null; onCreate: (data: Omit<BannerAd, 'id'>) => void; onUpdate: (data: BannerAd) => void; }> = ({ isOpen, onClose, banner, onCreate, onUpdate }) => {
    const [formData, setFormData] = useState({
        imageUrl: banner?.imageUrl || '',
        title: banner?.title || '',
        ctaLink: banner?.ctaLink || '',
        targetAudience: banner?.targetAudience || BannerAudience.Both,
        isActive: banner?.isActive ?? true,
        expiryDate: banner?.expiryDate ? banner.expiryDate.split('T')[0] : ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, imageUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (banner) {
            onUpdate({ ...banner, ...formData });
        } else {
            onCreate(formData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={banner ? 'Edit Banner Ad' : 'Create Banner Ad'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Banner Image</label>
                    <div className="mt-1 flex items-center space-x-4 p-2 border-2 border-dashed rounded-md">
                        {formData.imageUrl ? <img src={formData.imageUrl} alt="Preview" className="w-24 h-12 object-cover rounded" /> : <div className="w-24 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Preview</div>}
                        <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="ctaLink" className="block text-sm font-medium text-gray-700">CTA Link (URL)</label>
                    <input type="url" name="ctaLink" id="ctaLink" value={formData.ctaLink} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">Target Audience</label>
                        <select name="targetAudience" id="targetAudience" value={formData.targetAudience} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            {Object.values(BannerAudience).map(aud => <option key={aud} value={aud}>{aud}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input type="date" name="expiryDate" id="expiryDate" value={formData.expiryDate} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" min={new Date().toISOString().split("T")[0]} />
                    </div>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Activate this banner</label>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{banner ? 'Save Changes' : 'Create Banner'}</Button>
                </div>
            </form>
        </Modal>
    );
};

const StaffModal: React.FC<{ isOpen: boolean, onClose: () => void, onCreate: (data: { name: string; email: string; password?: string }) => void; }> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({ name, email, password });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Staff Member">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="staffName" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" id="staffName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="staffEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" id="staffEmail" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="staffPassword" className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="staffPassword" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create Staff</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AdminDashboard;