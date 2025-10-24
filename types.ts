// FIX: Removed self-import of enums which was causing declaration conflicts.
export enum UserRole {
  Customer = 'Customer',
  Influencer = 'Influencer',
  Admin = 'Admin',
}

export enum InfluencerCategory {
  Fashion = 'Fashion',
  Fitness = 'Fitness',
  Food = 'Food',
  Travel = 'Travel',
  Tech = 'Tech',
  Beauty = 'Beauty',
}

export enum CollabStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Completed = 'Completed',
}

export enum MembershipTier {
  None = 'None',
  Basic = 'Basic',
  Gold = 'Gold',
  Premium = 'Premium',
}

export enum MessageType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Document = 'document',
}

export enum PaymentType {
  Membership = 'Membership',
  AdCampaign = 'Ad Campaign',
  CollabBooking = 'Collab Booking',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Successful = 'Successful',
  Failed = 'Failed',
}

export enum BannerAudience {
  Customer = 'Customer',
  Influencer = 'Influencer',
  Both = 'Both',
}

export interface BannerAd {
  id: number;
  imageUrl: string;
  title: string;
  ctaLink: string;
  targetAudience: BannerAudience;
  isActive: boolean;
  expiryDate: string; // ISO string
}

export interface Attachment {
  url: string;
  fileName?: string;
  mimeType?: string;
}

export interface Review {
  id: number;
  customerId: number;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  password?: string; // For simulation purposes
  role: UserRole;
  avatar: string;
  isBlocked: boolean;
  membership?: MembershipTier;
  membershipExpiry?: string; // ISO string for expiry date
}

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  facebook?: string;
}

export interface BankAccountDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  bankName: string;
}

export interface InfluencerProfile {
  userId: number;
  bio: string;
  categories: InfluencerCategory[];
  location: string;
  followers: number;
  pricePerPost: number;
  socialLinks: SocialLinks;
  isVerified: boolean;
  adCampaignActive: boolean;
  campaignEndDate?: string;
  rating: number;
  reviews: Review[];
  bankAccount?: BankAccountDetails;
  upiId?: string;
}

export interface CollabRequest {
  id: number;
  customerId: number;
  influencerId: number;
  message: string;
  status: CollabStatus;
  bookingType: 'Direct' | 'Collabzy';
  discountApplied: boolean;
  date: string;
  isRated?: boolean;
}

export interface HelpTicketReply {
  authorId: number;
  message: string;
  timestamp: string;
  attachment?: Attachment;
}

export interface HelpTicket {
  id: number;
  userId: number;
  subject: string;
  message: string;
  attachment?: Attachment;
  isResolved: boolean;
  createdAt: string;
  replies: HelpTicketReply[];
}

export interface MembershipPlan {
  tier: MembershipTier;
  name: string;
  price: number;
  features: string[];
}

export interface CampaignPlan {
  durationMonths: number;
  name: string;
  price: number;
  description: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  text?: string;
  timestamp: string; // ISO string
  isRead: boolean;
  type: MessageType;
  attachment?: Attachment;
}

export interface Payment {
  id: number;
  userId: number; // The user who PAID
  amount: number;
  date: string; // ISO string
  type: PaymentType;
  status: PaymentStatus;
  description: string;
  // Optional fields for context
  influencerId?: number; // For CollabBooking and AdCampaign
  collabRequestId?: number; // For CollabBooking
}