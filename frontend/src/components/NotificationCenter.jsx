import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationCenter = ({ token, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/tenant/notifications');
      setNotifications(response.data.notifications || []);
      const unread = response.data.notifications?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      const notification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (!notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'agreement':
        return '📄';
      case 'payment':
        return '💰';
      case 'system':
        return '🔔';
      case 'message':
        return '💬';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'agreement':
        return '#3b82f6';
      case 'payment':
        return '#10b981';
      case 'system':
        return '#f59e0b';
      case 'message':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <button
        className="btn btn-outline"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          pointerEvents: 'auto', 
          zIndex: 10, 
          position: 'relative',
          position: 'relative'
        }}
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '350px',
            maxHeight: '400px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h4 style={{ margin: 0 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button
                className="btn btn-small"
                onClick={markAllAsRead}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}
              >
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #f3f4f6',
                    background: notification.read ? 'white' : '#f9fafb',
                    cursor: 'pointer'
                  }}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span
                      style={{
                        fontSize: '1.2rem',
                        marginRight: '0.5rem',
                        color: getNotificationColor(notification.type)
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: notification.read ? 'normal' : 'bold',
                          marginBottom: '0.25rem'
                        }}
                      >
                        {notification.message}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#6b7280'
                        }}
                      >
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      className="btn btn-small btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      style={{ 
                        pointerEvents: 'auto', 
                        zIndex: 10,
                        padding: '4px 8px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
