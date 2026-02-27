import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const MessagingSystem = ({ token, user, recipient }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/messages/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await api.post('/messages/send', {
        conversationId: selectedConversation._id,
        content: newMessage
      });
      
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      fetchConversations(); // Update conversation list
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const startNewConversation = async () => {
    if (!newRecipient) return;

    try {
      const response = await api.post('/messages/conversations', {
        recipientId: newRecipient
      });
      
      const newConv = response.data.conversation;
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setShowNewMessageModal(false);
      setNewRecipient('');
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user.id);
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    return other.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = users.filter(u => 
    u._id !== user.id && 
    u.name.toLowerCase().includes(newRecipient.toLowerCase())
  );

  return (
    <div className="card messaging-system">
      <h3>Messages</h3>
      
      <div className="messaging-layout">
        {/* Conversations List */}
        <div className="conversations-panel">
          <div className="conversations-header">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            />
            <button 
              className="btn btn-small btn-primary"
              onClick={() => setShowNewMessageModal(true)}
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            >
              New Message
            </button>
          </div>
          
          <div className="conversations-list">
            {filteredConversations.map(conversation => {
              const other = getOtherParticipant(conversation);
              const lastMessage = conversation.lastMessage;
              
              return (
                <div
                  key={conversation._id}
                  className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    {other.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <span className="conversation-name">{other.name}</span>
                      <span className="conversation-time">
                        {lastMessage ? formatTime(lastMessage.createdAt) : ''}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      {lastMessage ? (
                        <span className={lastMessage.sender._id === user.id ? 'sent' : 'received'}>
                          {lastMessage.content.length > 30 
                            ? `${lastMessage.content.substring(0, 30)}...` 
                            : lastMessage.content}
                        </span>
                      ) : (
                        <span className="no-messages">No messages yet</span>
                      )}
                    </div>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="unread-badge">{conversation.unreadCount}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="messages-panel">
          {selectedConversation ? (
            <>
              <div className="messages-header">
                <div className="messages-participant">
                  <div className="participant-avatar">
                    {getOtherParticipant(selectedConversation).name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="participant-name">
                      {getOtherParticipant(selectedConversation).name}
                    </div>
                    <div className="participant-role">
                      {getOtherParticipant(selectedConversation).role}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="messages-container">
                {messages.map(message => (
                  <div
                    key={message._id}
                    className={`message ${message.sender._id === user.id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="message-input-container">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="message-input"
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                />
                <button 
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="modal" onClick={() => setShowNewMessageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Start New Conversation</h4>
            <input
              type="text"
              placeholder="Search users..."
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              className="search-input"
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            />
            
            <div className="users-list">
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  className="user-item"
                  onClick={() => setNewRecipient(user._id)}
                >
                  <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="user-name">{user.name}</div>
                    <div className="user-role">{user.role}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                className="btn btn-primary"
                onClick={startNewConversation}
                disabled={!newRecipient}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                Start Conversation
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => setShowNewMessageModal(false)}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .messaging-system {
          height: 600px;
          display: flex;
          flex-direction: column;
        }

        .messaging-layout {
          display: flex;
          height: 100%;
          gap: 1rem;
        }

        .conversations-panel {
          width: 350px;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }

        .conversations-header {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          gap: 0.5rem;
        }

        .search-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }

        .conversation-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.2s;
        }

        .conversation-item:hover {
          background-color: #f9fafb;
        }

        .conversation-item.active {
          background-color: #eff6ff;
          border-left: 3px solid #3b82f6;
        }

        .conversation-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-right: 0.75rem;
        }

        .conversation-content {
          flex: 1;
          min-width: 0;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .conversation-name {
          font-weight: 600;
          color: #111827;
        }

        .conversation-time {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .conversation-preview {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .sent {
          color: #3b82f6;
        }

        .received {
          color: #111827;
        }

        .no-messages {
          font-style: italic;
          color: #9ca3af;
        }

        .unread-badge {
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .messages-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .messages-header {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .messages-participant {
          display: flex;
          align-items: center;
        }

        .participant-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-right: 0.75rem;
        }

        .participant-name {
          font-weight: 600;
          color: #111827;
        }

        .participant-role {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .messages-container {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 70%;
        }

        .message.sent {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message.received {
          align-self: flex-start;
          align-items: flex-start;
        }

        .message-content {
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          word-wrap: break-word;
        }

        .message.sent .message-content {
          background: #3b82f6;
          color: white;
          border-bottom-right-radius: 0.25rem;
        }

        .message.received .message-content {
          background: #f3f4f6;
          color: #111827;
          border-bottom-left-radius: 0.25rem;
        }

        .message-time {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .message-input-container {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 0.5rem;
        }

        .message-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          outline: none;
        }

        .no-conversation-selected {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .users-list {
          max-height: 200px;
          overflow-y: auto;
          margin: 1rem 0;
        }

        .user-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .user-item:hover {
          background-color: #f3f4f6;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #6b7280;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-right: 0.75rem;
        }

        .user-name {
          font-weight: 600;
          color: #111827;
        }

        .user-role {
          font-size: 0.875rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default MessagingSystem;
