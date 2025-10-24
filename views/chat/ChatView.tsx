import React, { useState, useEffect } from 'react';
import { User, Message, MessageType, Attachment } from '../../types';
import Card from '../../components/common/Card';
import ConversationList from './ConversationList';
import MessageArea from './MessageArea';
import Button from '../../components/common/Button';

interface ChatViewProps {
    currentUser: User;
    users: User[];
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    onBack: () => void;
    initialSelectedUserId?: number | null;
}

type NewMessagePayload = {
    type: MessageType;
    text?: string;
    attachment?: Attachment;
};

const ChatView: React.FC<ChatViewProps> = ({ currentUser, users, messages, setMessages, onBack, initialSelectedUserId = null }) => {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(initialSelectedUserId);

    useEffect(() => {
        // When a conversation is selected, mark its messages as read
        if (selectedUserId) {
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    msg.receiverId === currentUser.id && msg.senderId === selectedUserId && !msg.isRead 
                    ? { ...msg, isRead: true } 
                    : msg
                )
            );
        }
    }, [selectedUserId, currentUser.id, setMessages]);

    const handleSendMessage = (payload: NewMessagePayload) => {
        if (!selectedUserId) return;

        const newMessage: Message = {
            id: messages.length + 1,
            senderId: currentUser.id,
            receiverId: selectedUserId,
            timestamp: new Date().toISOString(),
            isRead: false,
            ...payload
        };
        setMessages(prev => [...prev, newMessage]);
    };

    return (
        <div>
             <Button onClick={onBack} variant="secondary" className="mb-4">
                &larr; Back to Dashboard
            </Button>
            <Card className="h-[calc(100vh-12rem)] flex">
                <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${selectedUserId !== null ? 'hidden md:flex' : 'flex'}`}>
                   <ConversationList 
                     currentUser={currentUser}
                     users={users}
                     messages={messages}
                     selectedUserId={selectedUserId}
                     onSelectConversation={(userId) => setSelectedUserId(userId)}
                   />
                </div>
                <div className={`w-full md:w-2/3 flex flex-col ${selectedUserId === null ? 'hidden md:flex' : 'flex'}`}>
                    <MessageArea
                        currentUser={currentUser}
                        users={users}
                        messages={messages}
                        selectedUserId={selectedUserId}
                        onSendMessage={handleSendMessage}
                        onBackToConversations={() => setSelectedUserId(null)}
                    />
                </div>
            </Card>
        </div>
    );
};

export default ChatView;