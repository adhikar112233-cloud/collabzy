import React, { useMemo } from 'react';
import { User, Message, MessageType, UserRole } from '../../types';
import { format, isToday, isYesterday } from 'date-fns';

interface ConversationListProps {
    currentUser: User;
    users: User[];
    messages: Message[];
    selectedUserId: number | null;
    onSelectConversation: (userId: number) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ currentUser, users, messages, selectedUserId, onSelectConversation }) => {

    const conversations = useMemo(() => {
        const conversationsMap = new Map<number, { otherUser: User, lastMessage: Message, unreadCount: number }>();

        messages.forEach(message => {
            const otherUserId = message.senderId === currentUser.id ? message.receiverId : message.senderId;
            const otherUser = users.find(u => u.id === otherUserId);
            if (!otherUser) return;

            // Apply role-based filtering for conversations
            if (currentUser.role === UserRole.Customer && otherUser.role !== UserRole.Influencer) {
                return; // Customers can only see chats with influencers
            }
            if (currentUser.role === UserRole.Influencer && otherUser.role !== UserRole.Customer) {
                return; // Influencers can only see chats with customers
            }

            const existing = conversationsMap.get(otherUserId);

            if (!existing || new Date(message.timestamp) > new Date(existing.lastMessage.timestamp)) {
                const unreadCount = messages.filter(m => m.senderId === otherUserId && m.receiverId === currentUser.id && !m.isRead).length;
                conversationsMap.set(otherUserId, {
                    otherUser,
                    lastMessage: message,
                    unreadCount
                });
            }
        });
        
        // Recalculate unread count based on the final list of conversations
        for (const [userId, conv] of conversationsMap.entries()) {
            conv.unreadCount = messages.filter(m => m.senderId === userId && m.receiverId === currentUser.id && !m.isRead).length;
        }

        return Array.from(conversationsMap.values()).sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
    }, [messages, currentUser, users]);

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        if (isToday(date)) return format(date, 'p');
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MM/dd/yy');
    };
    
    const renderLastMessagePreview = (message: Message) => {
        let preview = '';
        if (message.senderId === currentUser.id) {
            preview += 'You: ';
        }

        switch(message.type) {
            case MessageType.Image:
                preview += '📷 Photo';
                break;
            case MessageType.Video:
                preview += '📹 Video';
                break;
            case MessageType.Document:
                preview += `📄 ${message.attachment?.fileName || 'Document'}`;
                break;
            case MessageType.Text:
            default:
                 preview += message.text;
                 break;
        }
        return preview;
    };

    return (
        <>
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Chats</h2>
            </div>
            <div className="flex-grow overflow-y-auto">
                {conversations.map(({ otherUser, lastMessage, unreadCount }) => (
                    <div
                        key={otherUser.id}
                        onClick={() => onSelectConversation(otherUser.id)}
                        className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedUserId === otherUser.id ? 'bg-indigo-50' : ''}`}
                    >
                        <img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full mr-4" />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-gray-800 truncate">{otherUser.name}</p>
                                <p className="text-xs text-gray-500">{formatTimestamp(lastMessage.timestamp)}</p>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-sm text-gray-500 truncate pr-2">
                                    {renderLastMessagePreview(lastMessage)}
                                </p>
                                {unreadCount > 0 && (
                                    <span className="bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ConversationList;