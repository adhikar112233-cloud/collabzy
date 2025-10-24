import React, { useState, useRef } from 'react';
import { HelpTicket, User, UserRole, Attachment } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { format, formatDistanceToNow } from 'date-fns';
import { PaperClipIcon, XMarkIcon, DocumentIcon, PhotoIcon } from '../../components/icons/HeroIcons';

interface HelpViewProps {
    currentUser: User;
    users: User[];
    myTickets: HelpTicket[];
    onCreateTicket: (ticketData: { userId: number; subject: string; message: string; attachment?: Attachment }) => void;
    onBack: () => void;
}

const CreateTicketModal: React.FC<{ onClose: () => void; onSubmit: (data: { subject: string; message: string; attachment?: Attachment }) => void; }> = ({ onClose, onSubmit }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject.trim() && message.trim()) {
            onSubmit({ subject, message, attachment });
            onClose();
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Create a New Support Ticket">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,.doc,.docx,.zip" />
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                        id="subject"
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                        id="message"
                        rows={5}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        placeholder="Please describe your issue in detail..."
                        required
                    />
                </div>
                 <div>
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
                            Attach File (Optional)
                        </Button>
                    )}
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit Ticket</Button>
                </div>
            </form>
        </Modal>
    );
};

const ViewTicketModal: React.FC<{ ticket: HelpTicket; onClose: () => void; users: User[] }> = ({ ticket, onClose, users }) => {
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
            <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm font-semibold mb-1">Your Original Message</p>
                    <p className="text-xs text-gray-500 mb-2">{format(new Date(ticket.createdAt), 'PP pp')}</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                    {ticket.attachment && renderAttachment(ticket.attachment)}
                </div>

                 <h4 className="font-semibold text-gray-800 border-b pb-2">Conversation History</h4>
                 <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {ticket.replies.length === 0 ? (
                        <p className="text-sm text-gray-500">No replies yet. An admin will get back to you shortly.</p>
                    ) : (
                        ticket.replies.map((reply, index) => {
                            const author = getAuthor(reply.authorId);
                            const isAdminReply = author.role === UserRole.Admin;
                            return (
                                <div key={index} className={`flex items-start gap-2.5 ${isAdminReply ? '' : 'justify-end'}`}>
                                    {isAdminReply && <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full"/>}
                                    <div className={`p-3 rounded-lg ${isAdminReply ? 'bg-indigo-100 rounded-bl-none' : 'bg-gray-100 rounded-br-none'}`}>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                                            <span className="text-sm font-semibold text-gray-900">{author.name}</span>
                                            <span className="text-xs font-normal text-gray-500">{format(new Date(reply.timestamp), 'p')}</span>
                                        </div>
                                        <p className="text-sm font-normal text-gray-800 whitespace-pre-wrap">{reply.message}</p>
                                        {reply.attachment && renderAttachment(reply.attachment)}
                                    </div>
                                    {!isAdminReply && <img src={author.avatar} alt={author.name} className="w-8 h-8 rounded-full"/>}
                                </div>
                            )
                        })
                    )}
                 </div>
                 <div className="flex justify-end pt-4 border-t">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
};


const HelpView: React.FC<HelpViewProps> = ({ currentUser, users, myTickets, onCreateTicket, onBack }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [ticketToView, setTicketToView] = useState<HelpTicket | null>(null);

    const handleCreateTicket = (data: { subject: string; message: string; attachment?: Attachment }) => {
        onCreateTicket({ ...data, userId: currentUser.id });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Button onClick={onBack} variant="secondary" className="mb-2">
                        &larr; Back to Dashboard
                    </Button>
                    <h2 className="text-3xl font-bold">Help & Support</h2>
                    <p className="text-gray-500">Create and track your support tickets here.</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>Create New Ticket</Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Last Updated</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myTickets.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(ticket => (
                                <tr key={ticket.id} className="border-b">
                                    <td className="p-4 font-medium">{ticket.subject}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ticket.isResolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {ticket.isResolved ? 'Resolved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                                    </td>
                                    <td className="p-4">
                                        <Button size="sm" variant="secondary" onClick={() => setTicketToView(ticket)}>View Details</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {myTickets.length === 0 && (
                        <div className="text-center p-8">
                            <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
                            <p className="text-sm text-gray-500">Click "Create New Ticket" to get started.</p>
                        </div>
                    )}
                </div>
            </Card>

            {isCreateModalOpen && <CreateTicketModal onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateTicket} />}
            {ticketToView && <ViewTicketModal ticket={ticketToView} onClose={() => setTicketToView(null)} users={users} />}
        </div>
    );
};

export default HelpView;