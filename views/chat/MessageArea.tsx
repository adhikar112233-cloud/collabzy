import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Message, MessageType, Attachment } from '../../types';
import Button from '../../components/common/Button';
import { PaperAirplaneIcon, PaperClipIcon, PhotoIcon, VideoCameraIcon, DocumentIcon } from '../../components/icons/HeroIcons';
import { format } from 'date-fns';

interface MessageAreaProps {
    currentUser: User;
    users: User[];
    messages: Message[];
    selectedUserId: number | null;
    onSendMessage: (payload: { type: MessageType; text?: string; attachment?: Attachment }) => void;
    onBackToConversations: () => void;
}

const MessageArea: React.FC<MessageAreaProps> = ({ currentUser, users, messages, selectedUserId, onSendMessage, onBackToConversations }) => {
    const [newMessage, setNewMessage] = useState('');
    const [isAttachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
    const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const attachmentButtonRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const conversationMessages = useMemo(() => {
        if (!selectedUserId) return [];
        return messages
            .filter(m => (m.senderId === currentUser.id && m.receiverId === selectedUserId) || (m.senderId === selectedUserId && m.receiverId === currentUser.id))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, selectedUserId, currentUser.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationMessages]);

    // Close attachment menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (attachmentButtonRef.current && !attachmentButtonRef.current.contains(event.target as Node)) {
                setAttachmentMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSendText = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage({ type: MessageType.Text, text: newMessage.trim() });
            setNewMessage('');
            const audio = new Audio('https://www.soundjay.com/communication/sounds/whoosh-01.mp3');
            audio.play().catch(e => console.error("Error playing sound:", e));
        }
    };
    
    const handleAttachmentClick = (acceptType: string) => {
        const input = fileInputRef.current;
        if (!input) return;
        input.accept = acceptType;
        input.click();
        setAttachmentMenuOpen(false);
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            let messageType: MessageType;
            if (file.type.startsWith('image/')) {
                messageType = MessageType.Image;
            } else if (file.type.startsWith('video/')) {
                messageType = MessageType.Video;
            } else {
                messageType = MessageType.Document;
            }

            const fileUrl = URL.createObjectURL(file);
            const attachment: Attachment = {
                url: fileUrl,
                fileName: file.name,
                mimeType: file.type,
            };

            onSendMessage({
                type: messageType,
                text: newMessage.trim() || undefined,
                attachment,
            });

            setNewMessage('');
        }
        // Reset file input to allow selecting the same file again
        if (event.target) {
            event.target.value = '';
        }
    };

    const renderMessageContent = (message: Message) => {
        const content = [];
        // Render image
        if (message.type === MessageType.Image && message.attachment) {
            content.push(<img key="img" src={message.attachment.url} alt={message.attachment.fileName || "attachment"} className="rounded-lg my-1 max-w-full h-auto" />);
        }
        // Render video
        if (message.type === MessageType.Video && message.attachment) {
            content.push(
               <video key="video" src={message.attachment.url} controls className="rounded-lg my-1 max-w-full" style={{ maxHeight: '300px' }} />
           );
        }
        // Render document
        if (message.type === MessageType.Document && message.attachment) {
            content.push(
               <a 
                   key="doc" 
                   href={message.attachment.url} 
                   download={message.attachment.fileName}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center p-3 bg-gray-500/20 rounded-lg hover:bg-gray-500/30 transition-colors"
               >
                   <DocumentIcon className="w-8 h-8 mr-3 flex-shrink-0 text-gray-700"/>
                   <div className="flex-1 min-w-0">
                       <p className="truncate text-sm font-medium text-gray-800">{message.attachment.fileName}</p>
                       <p className="text-xs text-gray-500">Click to view/download</p>
                   </div>
               </a>
           );
        }
        // Render text/caption
        if (message.text) {
            content.push(<p key="text" className="text-sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.text}</p>);
        }
        return <div className="space-y-1">{content}</div>;
    };
    
    if (!selectedUser) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center bg-gray-50 p-4">
                <ChatBubbleOvalLeftEllipsisIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Welcome to your Messages</h3>
                <p className="text-gray-500">Select a conversation to start chatting.</p>
            </div>
        )
    }

    return (
        <>
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                className="hidden"
            />
            {/* Header */}
            <div className="flex items-center p-3 border-b border-gray-200">
                <button onClick={onBackToConversations} className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100">
                     &larr;
                </button>
                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                    <p className="text-xs text-green-500">Online</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
                <div className="space-y-4">
                    {conversationMessages.map(message => (
                        <div key={message.id} className={`flex items-end gap-2 ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                             {message.senderId !== currentUser.id && <img src={selectedUser.avatar} className="w-6 h-6 rounded-full self-start" alt={selectedUser.name} />}
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-xl ${
                                message.senderId === currentUser.id 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 rounded-bl-none'
                            }`}>
                                {renderMessageContent(message)}
                                <p className={`text-xs mt-1 ${message.senderId === currentUser.id ? 'text-indigo-200' : 'text-gray-400'} text-right`}>
                                    {format(new Date(message.timestamp), 'p')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendText} className="flex items-center space-x-3">
                    <div ref={attachmentButtonRef} className="relative">
                        <button type="button" onClick={() => setAttachmentMenuOpen(prev => !prev)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100">
                            <PaperClipIcon className="w-6 h-6" />
                        </button>
                        {isAttachmentMenuOpen && (
                            <div className="absolute bottom-12 left-0 w-48 bg-white border rounded-lg shadow-xl py-1 z-10">
                                <button type="button" onClick={() => handleAttachmentClick('image/*')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"><PhotoIcon className="w-5 h-5 mr-3"/>Photo</button>
                                <button type="button" onClick={() => handleAttachmentClick('video/*')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"><VideoCameraIcon className="w-5 h-5 mr-3"/>Video</button>
                                <button type="button" onClick={() => handleAttachmentClick('.pdf,.doc,.docx,.zip')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"><DocumentIcon className="w-5 h-5 mr-3"/>Document</button>
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 w-full px-4 py-2 bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoComplete="off"
                    />
                    <Button type="submit" className="!p-3 rounded-full" disabled={!newMessage.trim()}>
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </>
    );
};

export default MessageArea;

const ChatBubbleOvalLeftEllipsisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.761 9.761 0 0 1-2.546-.423l-1.393.392c-.38.107-.822-.172-.822-.567v-1.926A8.975 8.975 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
  </svg>
);