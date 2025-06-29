// frontend/src/components/Invites/InviteForm.jsx
import { useState } from 'react';
import { inviteAPI } from '../../utils/api';

const InviteForm = ({ eventId, onInviteSent, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await inviteAPI.sendInvite(eventId, formData);
      setFormData({ email: '', message: '' });
      onInviteSent(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invite');
    }
    
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3>Invite Someone</h3>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="Enter their email address"
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="message">Optional Message</label>
          <textarea
            id="message"
            className="form-input"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Add a personal message..."
            rows={3}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteForm;
