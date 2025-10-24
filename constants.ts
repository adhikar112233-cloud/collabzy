


import { User, InfluencerProfile, CollabRequest, HelpTicket, MembershipPlan, UserRole, InfluencerCategory, CollabStatus, MembershipTier, Review, CampaignPlan, Message, MessageType, Payment, PaymentType, PaymentStatus, BannerAd } from './types';

const getExpiryDate = (hours: number): string => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date.toISOString();
};

export const USERS: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '1112223331', role: UserRole.Customer, avatar: 'https://picsum.photos/seed/alice/100/100', membership: MembershipTier.Gold, password: 'password123', membershipExpiry: getExpiryDate(12), isBlocked: false },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '1112223332', role: UserRole.Customer, avatar: 'https://picsum.photos/seed/bob/100/100', membership: MembershipTier.Basic, password: 'password123', membershipExpiry: getExpiryDate(-2), isBlocked: false }, // Expired 2 hours ago
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '1112223333', role: UserRole.Influencer, avatar: 'https://picsum.photos/seed/charlie/100/100', password: 'password123', isBlocked: false },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', phone: '1112223334', role: UserRole.Influencer, avatar: 'https://picsum.photos/seed/diana/100/100', password: 'password123', isBlocked: false },
  { id: 5, name: 'Admin User', email: 'admin@collabzy.com', phone: '1112223335', role: UserRole.Admin, avatar: 'https://picsum.photos/seed/admin/100/100', password: 'password123', isBlocked: false },
  { id: 6, name: 'Eve Williams', email: 'eve@example.com', phone: '1112223336', role: UserRole.Influencer, avatar: 'https://picsum.photos/seed/eve/100/100', password: 'password123', isBlocked: true },
  { id: 7, name: 'Frank Miller', email: 'frank@example.com', phone: '1112223337', role: UserRole.Customer, avatar: 'https://picsum.photos/seed/frank/100/100', membership: MembershipTier.Premium, password: 'password123', membershipExpiry: getExpiryDate(20), isBlocked: false },
  { id: 9, name: 'rabial', email: 'rabialhaque19999@gmail.com', phone: '1112223339', role: UserRole.Admin, avatar: 'https://picsum.photos/seed/rabial/100/100', password: '11111112', isBlocked: false },
  { id: 10, name: 'nilima', email: 'nillo@gmail.com', role: UserRole.Customer, avatar: 'https://picsum.photos/seed/nilima/100/100', membership: MembershipTier.None, password: '1111111@', isBlocked: false },
];

export const REVIEWS: Review[] = [
  { id: 1, customerId: 1, rating: 5, comment: 'Charlie was amazing to work with! So professional.', date: '2024-08-02' },
  { id: 2, customerId: 7, rating: 4, comment: 'Great collaboration, would work with them again.', date: '2024-06-16' },
  { id: 3, customerId: 2, rating: 5, comment: 'Diana is a true fitness pro. Highly recommend!', date: '2024-07-10' },
  { id: 4, customerId: 1, rating: 3, comment: 'The collab was okay, but communication could have been better.', date: '2024-07-22' },
];

export const CAMPAIGN_PLANS: CampaignPlan[] = [
    { durationMonths: 1, name: '1 Month Boost', price: 999, description: 'Get featured at the top of search results for 1 month.' },
    { durationMonths: 6, name: '6 Month Boost', price: 2999, description: 'Get featured for 6 months and maximize your visibility.' },
    { durationMonths: 12, name: '1 Year Boost', price: 4999, description: 'Become a top influencer for a full year with our best value plan.' },
];

const getFutureDate = (months: number): string => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
}

// NOTE: This constant now uses the type (InfluencerProfile & { user: User }) for initialization convenience,
// but the App state will separate them into InfluencerProfile[] and User[] for a cleaner data model.
export const INFLUENCER_PROFILES: (Omit<InfluencerProfile, 'user'> & { user: User })[] = [
  {
    user: USERS[2],
    userId: 3,
    bio: 'Fashion-forward creator exploring the latest trends. Based in NYC.',
    categories: [InfluencerCategory.Fashion, InfluencerCategory.Beauty],
    location: 'New York, NY',
    followers: 125000,
    pricePerPost: 40000,
    socialLinks: { instagram: 'charliefashion', tiktok: 'charliefashion', facebook: 'charlie.fashion' },
    isVerified: true,
    adCampaignActive: true,
    campaignEndDate: getFutureDate(1),
    rating: 4.5,
    reviews: [REVIEWS[0], REVIEWS[1]],
    bankAccount: {
        accountHolderName: 'Charlie Brown',
        accountNumber: '123456789012',
        ifscCode: 'CBIN0123456',
        branchName: 'New York Main',
        bankName: 'Collabzy Bank',
    },
    upiId: 'charlie@collabzyupi',
  },
  {
    user: USERS[3],
    userId: 4,
    bio: 'Fitness enthusiast and certified personal trainer. Let\'s get moving!',
    categories: [InfluencerCategory.Fitness],
    location: 'Los Angeles, CA',
    followers: 250000,
    pricePerPost: 65000,
    socialLinks: { instagram: 'dianafit', youtube: 'dianafitness', facebook: 'diana.fit' },
    isVerified: true,
    adCampaignActive: false,
    rating: 4.0,
    reviews: [REVIEWS[2], REVIEWS[3]],
    bankAccount: {
        accountHolderName: 'Diana Prince',
        accountNumber: '987654321098',
        ifscCode: 'CBIN0987654',
        branchName: 'Los Angeles Fitness',
        bankName: 'Collabzy Bank',
    },
    upiId: 'diana@collabzyupi',
  },
  {
    user: USERS[5],
    userId: 6,
    bio: 'Tech reviewer making complex gadgets simple. Unboxing the future.',
    categories: [InfluencerCategory.Tech, InfluencerCategory.Travel],
    location: 'San Francisco, CA',
    followers: 85000,
    pricePerPost: 30000,
    socialLinks: { youtube: 'evetech', instagram: 'evetech', facebook: 'eve.williams.tech' },
    isVerified: false,
    adCampaignActive: true,
    campaignEndDate: getFutureDate(3),
    rating: 0,
    reviews: [],
    bankAccount: {
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        bankName: '',
    },
    upiId: '',
  },
];

export const COLLAB_REQUESTS: CollabRequest[] = [
  { id: 1, customerId: 1, influencerId: 3, message: 'Hi Charlie, we love your style! We\'d like to collab on our new clothing line.', status: CollabStatus.Accepted, bookingType: 'Collabzy', discountApplied: true, date: '2024-08-01', isRated: true },
  { id: 2, customerId: 2, influencerId: 4, message: 'Hey Diana, interested in promoting our new protein powder?', status: CollabStatus.Pending, bookingType: 'Direct', discountApplied: false, date: '2024-08-05' },
  { id: 3, customerId: 1, influencerId: 4, message: 'We\'re launching a new fitness app and would love for you to try it.', status: CollabStatus.Completed, bookingType: 'Collabzy', discountApplied: true, date: '2024-07-20', isRated: true },
  { id: 4, customerId: 7, influencerId: 6, message: 'Hi Eve, could you review our new smartphone?', status: CollabStatus.Pending, bookingType: 'Collabzy', discountApplied: true, date: '2024-08-10' },
  { id: 5, customerId: 7, influencerId: 3, message: 'Another campaign for you!', status: CollabStatus.Completed, bookingType: 'Direct', discountApplied: false, date: '2024-06-15', isRated: true },
  { id: 6, customerId: 2, influencerId: 3, message: 'Quick shoot for our summer collection?', status: CollabStatus.Pending, bookingType: 'Direct', discountApplied: false, date: '2024-07-15', isRated: false },
];

export const HELP_TICKETS: HelpTicket[] = [
    { 
        id: 1, 
        userId: 1, 
        subject: 'Payment Issue', 
        message: 'My payment for the Gold membership failed, but my card was charged. Can you please check?', 
        isResolved: false,
        createdAt: '2024-08-10T14:00:00Z',
        replies: []
    },
    { 
        id: 2, 
        userId: 3, 
        subject: 'Can\'t update profile', 
        message: 'The save button on my profile editor is not working. I make changes, click save, but nothing happens.', 
        isResolved: false,
        createdAt: '2024-08-09T11:20:00Z',
        replies: []
    },
    { 
        id: 3, 
        userId: 2, 
        subject: 'Question about booking', 
        message: 'How do I get the 5% discount mentioned for the Basic plan? It did not apply automatically.', 
        isResolved: true,
        createdAt: '2024-08-08T18:00:00Z',
        replies: [
            { authorId: 5, message: 'Hi Bob, thanks for reaching out. The discount is applied on the final payment screen for collaborations booked via the "Collabzy" option. It does not apply to "Direct" bookings. Let us know if you have more questions!', timestamp: '2024-08-08T18:30:00Z' }
        ]
    },
];

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
    { tier: MembershipTier.Basic, name: 'Basic', price: 10, features: ['Valid for 24 hours', 'Request collab with 1 profile', 'Send SMS notifications'] },
    { tier: MembershipTier.Gold, name: 'Gold', price: 25, features: ['Valid for 24 hours', 'Request collab with up to 4 profiles', 'Send SMS notifications'] },
    { tier: MembershipTier.Premium, name: 'Premium', price: 50, features: ['Valid for 24 hours', 'Request collab with unlimited profiles', 'Send SMS notifications'] },
];

export const MESSAGES: Message[] = [
    { id: 1, senderId: 1, receiverId: 3, type: MessageType.Text, text: 'Hi Charlie! We were really impressed with our last collaboration. Ready for another one?', timestamp: '2024-08-10T10:00:00Z', isRead: true },
    { id: 2, senderId: 3, receiverId: 1, type: MessageType.Text, text: 'Hey Alice! Absolutely, I had a great time working with your team. What do you have in mind?', timestamp: '2024-08-10T10:05:00Z', isRead: true },
    { id: 3, senderId: 1, receiverId: 3, type: MessageType.Text, text: 'We\'re launching a new fall collection and we think your aesthetic is a perfect match.', timestamp: '2024-08-10T10:06:00Z', isRead: true },
    { id: 4, senderId: 1, receiverId: 3, type: MessageType.Image, text: 'Here\'s a sneak peek of the mood board!', attachment: { url: 'https://picsum.photos/seed/moodboard/400/300' }, timestamp: '2024-08-10T10:07:00Z', isRead: false },
    { id: 5, senderId: 2, receiverId: 4, type: MessageType.Text, text: 'Hey Diana, are you available for a sponsored post next month?', timestamp: '2024-08-09T14:30:00Z', isRead: true },
    { id: 6, senderId: 4, receiverId: 2, type: MessageType.Text, text: 'Hi Bob! Let me check my calendar. What are the dates?', timestamp: '2024-08-09T14:32:00Z', isRead: true },
    { id: 7, senderId: 7, receiverId: 3, type: MessageType.Text, text: 'Hey, I saw your profile is promoted. I have a project that might interest you.', timestamp: '2024-08-11T09:00:00Z', isRead: true },
    { id: 8, senderId: 3, receiverId: 7, type: MessageType.Text, text: 'Hi Frank, thanks for reaching out. Tell me more!', timestamp: '2024-08-11T09:02:00Z', isRead: false },
    { id: 9, senderId: 2, receiverId: 4, type: MessageType.Document, attachment: { url: '#', fileName: 'Campaign_Brief.pdf' }, timestamp: '2024-08-09T14:33:00Z', isRead: true },
    { id: 10, senderId: 4, receiverId: 2, type: MessageType.Video, attachment: { url: '#', fileName: 'Product_Demo.mp4' }, timestamp: '2024-08-09T14:35:00Z', isRead: true },
];

export const PAYMENTS: Payment[] = [
    { id: 1, userId: 1, amount: 25, date: '2024-08-10T10:00:00Z', type: PaymentType.Membership, description: 'Gold Membership Plan', status: PaymentStatus.Successful },
    { id: 2, userId: 3, amount: 999, date: '2024-08-09T11:00:00Z', type: PaymentType.AdCampaign, description: '1 Month Boost', influencerId: 3, status: PaymentStatus.Successful },
    { id: 3, userId: 1, amount: 36000, date: '2024-08-01T12:00:00Z', type: PaymentType.CollabBooking, description: 'Collab with Charlie Brown', influencerId: 3, collabRequestId: 1, status: PaymentStatus.Pending },
    { id: 4, userId: 7, amount: 50, date: '2024-07-28T15:00:00Z', type: PaymentType.Membership, description: 'Premium Membership Plan', status: PaymentStatus.Successful },
    { id: 5, userId: 1, amount: 65000, date: '2024-07-20T18:00:00Z', type: PaymentType.CollabBooking, description: 'Collab with Diana Prince', influencerId: 4, collabRequestId: 3, status: PaymentStatus.Successful },
    { id: 6, userId: 6, amount: 2999, date: '2024-07-15T09:00:00Z', type: PaymentType.AdCampaign, description: '6 Month Boost', influencerId: 6, status: PaymentStatus.Failed },
];

export const BANNER_ADS: BannerAd[] = [];