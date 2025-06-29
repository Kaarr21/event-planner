// frontend/src/components/Notifications/Notifications.jsx
import { useState, useEffect } from 'react';
import { notificationAPI, inviteAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notificationsRes, invitesRes] = await Promise.all([
        notificationAPI.getNotifications(),
        inviteAPI.getUserInvites()
      ]);
      
      setNotifications(notificationsRes.data);
      setInvites(invitesRes.data);
    } catch (err) {
      setError('Failed to fetch notifications');
    }
    setLoading(false);
  };

  const handleInviteResponse = async (inviteId, status, message = '') => {
    try {
      await inviteAPI.respondToInvite(inviteId, { status, message });
      await fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to respond to invite');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      ));
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' at ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <LoadingSpinner />;

  const pendingInvites = invites.filter(invite => invite.status === 'pending');
  const unreadNotifications = notifications.filter(notification => !notification.read);

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <h1>Notifications</h1>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '20px' }}>{error}</div>}
      
      {/* Pending Invites */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Event Invitations ({pendingInvites.length})</h2>
        {pendingInvites.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No pending invitations</p>
        ) : (
          pendingInvites.map(invite => (
            <div key={invite.id} className="card" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3>{invite.event_title}</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: '5px 0' }}>
                    📅 {formatDate(invite.event_date)}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    Invited by: <strong>{invite.inviter}</strong>
                  </p>
                  {invite.message && (
                    <p style={{ margin: '10px 0', fontStyle: 'italic' }}>
                      "{invite.message}"
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleInviteResponse(invite.id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleInviteResponse(invite.id, 'declined')}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Other Notifications */}
      <div>
        <h2>All Notifications ({notifications.length})</h2>
        {notifications.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No notifications</p>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className="card" 
              style={{ 
                marginBottom: '15px',
                backgroundColor: notification.read ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                opacity: notification.read ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h4>{notification.title}</h4>
                  {notification.message && <p>{notification.message}</p>}
                  <small style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(notification.created_at)}
                  </small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {!notification.read && (
                    <>
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="btn btn-outline"
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Mark as Read
                      </button>
                      <span style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        New
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
