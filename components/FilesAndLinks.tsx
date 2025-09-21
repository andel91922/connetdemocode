import React, { useMemo } from 'react';
import { Message, User } from '../types';
import { DocumentTextIcon } from './Icons';

interface FilesAndLinksProps {
    messages: Message[];
    users: Record<string, User>;
}

interface ExtractedFile {
    name: string;
    type: string;
    size: number;
    user: User;
    timestamp: string;
}

interface ExtractedLink {
    url: string;
    user: User;
    timestamp: string;
}

const FilesAndLinks: React.FC<FilesAndLinksProps> = ({ messages, users }) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const { files, links } = useMemo(() => {
        const extractedFiles: ExtractedFile[] = [];
        const extractedLinks: ExtractedLink[] = [];

        messages.forEach(msg => {
            if (msg.attachment && users[msg.userId]) {
                extractedFiles.push({ ...msg.attachment, user: users[msg.userId], timestamp: msg.timestamp });
            }
            const foundLinks = msg.text.match(urlRegex);
            if (foundLinks && users[msg.userId]) {
                foundLinks.forEach(link => {
                    extractedLinks.push({ url: link, user: users[msg.userId], timestamp: msg.timestamp });
                });
            }
        });

        return { files: extractedFiles.reverse(), links: extractedLinks.reverse() };
    }, [messages, users]);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-base font-semibold text-brand-text-secondary mb-3 uppercase tracking-wider">Shared Files</h3>
                {files.length > 0 ? (
                    <ul className="space-y-3">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex-shrink-0 bg-brand-blue text-white p-2 rounded-md mr-4">
                                    <DocumentTextIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold text-brand-blue truncate">{file.name}</p>
                                    <p className="text-sm text-gray-500">Shared by {file.user.name} - {formatBytes(file.size)}</p>
                                </div>
                                <div className="text-sm text-gray-500 ml-4 flex-shrink-0">{file.timestamp}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">No files have been shared in this chat yet.</p>
                )}
            </section>
            <section>
                <h3 className="text-base font-semibold text-brand-text-secondary mb-3 uppercase tracking-wider">Shared Links</h3>
                {links.length > 0 ? (
                    <ul className="space-y-3">
                        {links.map((link, index) => (
                             <li key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-teal hover:underline break-all">{link.url}</a>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-sm text-gray-500">Shared by {link.user.name}</p>
                                    <span className="text-sm text-gray-500">{link.timestamp}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <p className="text-gray-500 italic">No links have been shared in this chat yet.</p>
                )}
            </section>
        </div>
    );
}

export default FilesAndLinks;
