import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProfilePage.css';
import logo from '../assets/logo.png';
import { API_URL } from '../lib/api';

interface ProfilePageProps {
  onBack: () => void;
  onLogout: () => void;
  onUpdateSuccess?: (newData: any) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack, onLogout, onUpdateSuccess }) => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('diwan_user_data');
    if (storedUser) {
      const data = JSON.parse(storedUser);
      setUser(data);
      setEditForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        address: data.address || ''
      });
    }
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setEditForm(prev => ({ ...prev, address: data.display_name }));
          }
        } catch (error) {
          console.error("Geocoding error", error);
        }
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('diwan_auth_token');

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          phone_number: editForm.phone,
          address: editForm.address
        })
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      const updatedUser = await response.json();
      const mappedData = {
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        email: updatedUser.email,
        phone: updatedUser.phone_number,
        address: updatedUser.address
      };

      setUser(mappedData);
      localStorage.setItem('diwan_user_data', JSON.stringify(mappedData));
      if (onUpdateSuccess) onUpdateSuccess(mappedData);
      setIsEditing(false);
    } catch (error) {
      alert("Erreur lors de la mise à jour de vos informations.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <button className="profile-back-btn" onClick={onBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      <div className="profile-container">
        <motion.div
          className="profile-card glass"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="profile-header">
            <div className="profile-avatar">
              <span>{user.firstName[0]}{user.lastName[0]}</span>
            </div>
            <h2>Mon Profil Diwan</h2>
            <p className="profile-rank">Membre Élite</p>
          </div>

          <div className="profile-details">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-form"
                  className="edit-form-container"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="edit-group">
                    <label>Prénom</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="edit-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                  <div className="edit-group">
                    <label>Téléphone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="edit-group">
                    <label>Adresse de Livraison</label>
                    <div className="edit-address-wrapper">
                      <textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      />
                      <button
                        className={`btn-locate-small ${locating ? 'loading' : ''}`}
                        onClick={handleGetLocation}
                      >
                        {locating ? '...' : '📍'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="view-details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="detail-item">
                    <label>Nom Complet</label>
                    <p>{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Adresse Email</label>
                    <p>{user.email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Numéro de Téléphone</label>
                    <p>{user.phone}</p>
                  </div>
                  <div className="detail-item">
                    <label>Adresse de Livraison</label>
                    <p>{user.address}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="btn-save-profile" onClick={handleSave} disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button className="btn-cancel-edit" onClick={() => setIsEditing(false)}>Annuler</button>
              </>
            ) : (
              <>
                <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>Modifier mes informations</button>
                <button className="btn-logout" onClick={onLogout}>Se déconnecter</button>
              </>
            )}
          </div>

          <div className="profile-logo-bg">
            <img src={logo} alt="Diwan Logo" />
          </div>
        </motion.div>

        <motion.div
          className="profile-orders glass"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3>Mes Commandes Récentes</h3>
          <div className="orders-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Vous n'avez pas encore passé de commande d'exception.</p>
            <button className="btn-start-shopping" onClick={onBack}>Découvrir le catalogue</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
