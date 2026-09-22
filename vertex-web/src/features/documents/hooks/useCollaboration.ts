import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';

export type ActiveUser = {
  userId: string;
  email: string;
  isTyping?: boolean;
};

interface UseCollaborationProps {
  documentId: string;
  user: { id: string; email: string } | null;
  canEdit: boolean;
  onIncomingUpdate: (title?: string, content?: string) => void;
}

export const useCollaboration = ({ documentId, user, canEdit, onIncomingUpdate }: UseCollaborationProps) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isLive, setIsLive] = useState(false);
  
  // 1. Initialize empty
  const [activeUsers, setActiveUsers] = useState<Record<string, ActiveUser>>({});
  const typingTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // 2. THE FIX: Whenever the 'user' object finishes loading, guarantee they are in the active users list!
  useEffect(() => {
    if (user) {
      setActiveUsers(prev => ({
        ...prev,
        [user.id]: prev[user.id] || { userId: user.id, email: user.email, isTyping: false }
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setIsLive(true);
        
        // Subscribe to edits
        client.subscribe(`/topic/documents/${documentId}`, (message) => {
          const payload = JSON.parse(message.body);
          if (payload.senderId !== user.id) {
            onIncomingUpdate(payload.title, payload.content);

            // Mark this user as typing
            setActiveUsers(prev => {
              const existing = prev[payload.senderId] || { userId: payload.senderId, email: 'Teammate' };
              return { ...prev, [payload.senderId]: { ...existing, isTyping: true } };
            });

            if (typingTimers.current[payload.senderId]) {
              clearTimeout(typingTimers.current[payload.senderId]);
            }

            typingTimers.current[payload.senderId] = setTimeout(() => {
              setActiveUsers(prev => {
                if (!prev[payload.senderId]) return prev;
                return { ...prev, [payload.senderId]: { ...prev[payload.senderId], isTyping: false } };
              });
            }, 1500);
          }
        });

        // Subscribe to Presence
        client.subscribe(`/topic/documents/${documentId}/presence`, (message) => {
          const payload = JSON.parse(message.body);
          if (payload.userId === user.id) return; // Ignore our own broadcasts

          if (payload.action === 'JOIN' || payload.action === 'HERE') {
            setActiveUsers(prev => ({ ...prev, [payload.userId]: { userId: payload.userId, email: payload.email, isTyping: false } }));
            if (payload.action === 'JOIN') {
              client.publish({
                destination: `/app/documents/${documentId}/presence`,
                body: JSON.stringify({ userId: user.id, email: user.email, action: 'HERE' })
              });
            }
          } else if (payload.action === 'LEAVE') {
            setActiveUsers(prev => {
              const newUsers = { ...prev };
              delete newUsers[payload.userId];
              return newUsers;
            });
          }
        });

        client.publish({
          destination: `/app/documents/${documentId}/presence`,
          body: JSON.stringify({ userId: user.id, email: user.email, action: 'JOIN' })
        });
      },
      onDisconnect: () => setIsLive(false)
    });

    client.activate();
    setStompClient(client);

    const publishLeave = () => {
      if (client.connected) {
        client.publish({
          destination: `/app/documents/${documentId}/presence`,
          body: JSON.stringify({ userId: user.id, email: user.email, action: 'LEAVE' })
        });
      }
    };

    window.addEventListener('beforeunload', publishLeave);

    return () => {
      publishLeave();
      window.removeEventListener('beforeunload', publishLeave);
      client.deactivate();
    };
  }, [documentId, user, onIncomingUpdate]); 

  const broadcastChange = useCallback((title: string, content: string) => {
    if (canEdit && stompClient && stompClient.connected && user) {
      stompClient.publish({
        destination: `/app/documents/${documentId}/edit`,
        body: JSON.stringify({ title, content, senderId: user.id })
      });
    }
  }, [canEdit, stompClient, user, documentId]);

  return { isLive, activeUsers: Object.values(activeUsers), broadcastChange };
};