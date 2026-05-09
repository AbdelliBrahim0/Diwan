import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AuthPage.css';
import logo from '../assets/logo.png';
import { API_URL } from '../lib/api';

interface AuthPageProps {
  onBack: () => void;
  onSuccess: (userData: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
          } else {
            setFormData(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
          }
        } catch (error) {
          setFormData(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
        }
        setLocating(false);
      },
      (error) => {
        alert("Impossible de récupérer votre localisation.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!isLogin) {
        // Signup
        const signupRes = await fetch(`${API_URL}/users/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone_number: formData.phone,
            address: formData.address,
            password: formData.password
          })
        });
        
        if (!signupRes.ok) {
          const err = await signupRes.json();
          throw new Error(err.detail || "Erreur lors de l'inscription");
        }
      }

      // Login (always login after signup or if in login mode)
      const loginRes = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(err.detail || "Identifiants invalides");
      }

      const { access_token } = await loginRes.json();
      localStorage.setItem('diwan_auth_token', access_token);

      // Fetch Profile
      const profileRes = await fetch(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });

      if (!profileRes.ok) throw new Error("Impossible de récupérer le profil");

      const userData = await profileRes.json();
      
      // Map backend fields to frontend fields for the ProfilePage
      onSuccess({
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        phone: userData.phone_number,
        address: userData.address
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="auth-back-btn" onClick={onBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Retour
      </button>

      <div className="auth-container">
        <motion.div 
          className="auth-card glass"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-header">
            <img src={logo} alt="Diwan Logo" className="auth-logo" />
            <h2>{isLogin ? 'Bienvenue chez Diwan' : 'Rejoindre l\'Élite'}</h2>
            <p>{isLogin ? 'Connectez-vous pour accéder à votre univers.' : 'Créez votre compte pour une expérience personnalisée.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <motion.div 
                className="auth-error-msg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              {!isLogin ? (
                <motion.div 
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="signup-extra-fields"
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label>Prénom</label>
                      <input type="text" name="firstName" placeholder="Jean" required onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label>Nom</label>
                      <input type="text" name="lastName" placeholder="Dupont" required onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" name="phone" placeholder="+216 -- --- ---" required onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Adresse à domicile</label>
                    <div className="address-input-wrapper">
                      <textarea 
                        name="address" 
                        placeholder="Votre adresse complète..." 
                        required 
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                      <button 
                        type="button" 
                        className={`btn-locate ${locating ? 'loading' : ''}`}
                        onClick={handleGetLocation}
                        title="Localiser automatiquement"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{locating ? 'Localisation...' : 'Localiser'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="form-group">
              <label>Adresse Email</label>
              <input type="email" name="email" placeholder="contact@diwan.com" required onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" name="password" placeholder="••••••••" required onChange={handleInputChange} />
            </div>

            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? <div className="loader-mini"></div> : (isLogin ? 'Se Connecter' : 'S\'Inscrire')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Vous n'avez pas de compte ?" : "Déjà membre ?"}
              <button onClick={() => setIsLogin(!isLogin)} className="btn-toggle-auth">
                {isLogin ? 'Créer un compte' : 'Se connecter'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
