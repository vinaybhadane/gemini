'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/LoginForm';
import ChatHeader from '@/components/ChatHeader';
import ChatSidebar from '@/components/ChatSidebar';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import { useMessages } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { useTyping } from '@/hooks/useTyping';

function ChatContent({ currentUser }: { currentUser: 'user1' | 'user2' }) {
  const { messages, loading, sendMessage, editMessage, deleteMessage, clearAllMessages } = useMessages(currentUser);
  const { partnerOnline } = usePresence(currentUser);
  const { partnerTyping, onTyping, stopTyping } = useTyping(currentUser);

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="gemini-layout"
    >
      {/* Desktop sidebar */}
      <ChatSidebar currentUser={currentUser} partnerOnline={partnerOnline} onClearAll={clearAllMessages} />

      {/* Main content */}
      <div className="gemini-main">
        {/* Mobile-only top bar */}
        <ChatHeader partnerOnline={partnerOnline} currentUser={currentUser} onClearAll={clearAllMessages} />

        <MessageList
          messages={messages}
          loading={loading}
          currentUser={currentUser}
          partnerTyping={partnerTyping}
          onEdit={editMessage}
          onDelete={deleteMessage}
        />

        <MessageInput
          onSend={sendMessage}
          onTyping={onTyping}
          onStopTyping={stopTyping}
        />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <main className="app-root">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="app-full"
          >
            <LoginForm />
          </motion.div>
        ) : (
          <ChatContent key="chat" currentUser={currentUser} />
        )}
      </AnimatePresence>
    </main>
  );
}
