import React, { useState } from 'react';
import { MessageSquarePlus, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NoteModal } from './NoteModal';

interface NotableTextProps {
  text: string;
  note?: string;
  onNoteChange: (note: string) => void;
  className?: string;
}

export const NotableText: React.FC<NotableTextProps> = ({
  text,
  note,
  onNoteChange,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <div 
        className={`group relative inline-flex items-center gap-1 cursor-pointer ${className}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        <span>{text}</span>
        {note ? (
          <MessageSquare className="h-4 w-4 text-blue-500" />
        ) : (
          <MessageSquarePlus className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {note && (
          <div className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-200" />
        )}
      </div>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onNoteChange}
        initialNote={note}
      />
    </>
  );
}; 