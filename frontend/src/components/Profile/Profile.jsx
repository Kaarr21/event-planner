// frontend/src/components/Profile/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { profileAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProfileSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.data);
    } catch (err) {
      setError('Failed to fetch profile');
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await profileAPI.updateProfile(values);
      setProfile(response.data);
      updateUser(response.data); // Update user in auth context
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setSubmitting(false);
  };

  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      await profileAPI.changePassword({
        current_password: values.currentPassword,
        new_password: values.newPassword
      });
      
      setSuccess('Password changed successfully!');
      setShowPasswordForm(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
    setSubmitting(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion');
      return;
    }

    try {
      setError('');
      await profileAPI.deleteAccount();
      logout();
      navigate('/login', { 
        state: { message: 'Your account has been successfully deleted.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '30px' }}>
      <h1>My Profile</h1>
      
      {error && <div style={{ color: 'var(--danger)', marginBottom: '20px' }}>{error}</div>}
      {success && <div style={{ color: 'var(--success)', marginBottom: '20px' }}>{success}</div>}

      {/* Profile Information */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2>Profile Information</h2>
        
        {profile && (
          <Formik
            initialValues={{
              username: profile.username || '',
              email: profile.email || ''
            }}
            validationSchema={ProfileSchema}
            onSubmit={handleProfileUpdate}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <Field name="username" type="text" className="form-control" />
                  <ErrorMessage name="username" component="div" className="form-error" />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <Field name="email" type="email" className="form-control" />
                  <ErrorMessage name="email" component="div" className="form-error" />
                </div>

                <div className="form-group">
                  <label className="form-label">Member Since</label>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                    {formatDate(profile.created_at)}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Profile'}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>

      {/* Password Change Section */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2>Change Password</h2>
        
        {!showPasswordForm ? (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Keep your account secure by using a strong password.
            </p>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowPasswordForm(true)}
            >
              Change Password
            </button>
          </div>
        ) : (
          <div>
            <Formik
              initialValues={{
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              }}
              validationSchema={PasswordSchema}
              onSubmit={handlePasswordChange}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <Field name="currentPassword" type="password" className="form-control" />
                    <ErrorMessage name="currentPassword" component="div" className="form-error" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <Field name="newPassword" type="password" className="form-control" />
                    <ErrorMessage name="newPassword" component="div" className="form-error" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <Field name="confirmPassword" type="password" className="form-control" />
                    <ErrorMessage name="confirmPassword" component="div" className="form-error" />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Changing...' : 'Change Password'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>

      {/* Account Deletion Section */}
      <div className="card" style={{ border: '2px solid var(--danger)' }}>
        <h2 style={{ color: 'var(--danger)' }}>Danger Zone</h2>
        
        {!showDeleteConfirm ? (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button 
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'rgba(220, 53, 69, 0.1)', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid var(--danger)'
            }}>
              <h4 style={{ color: 'var(--danger)', marginBottom: '15px' }}>⚠️ Confirm Account Deletion</h4>
              <p style={{ marginBottom: '15px' }}>This will permanently delete:</p>
              <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
                <li>Your profile and account information</li>
                <li>All events you've created</li>
                <li>All tasks associated with your events</li>
                <li>All RSVPs and invitations</li>
                <li>All notifications</li>
              </ul>
              <p style={{ fontWeight: 'bold', color: 'var(--danger)' }}>
                This action cannot be undone!
              </p>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="form-control"
                placeholder="Type DELETE to confirm"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Yes, Delete My Account
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                  setError('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
