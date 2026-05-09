import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CartNotification.css';
import logo from '../assets/logo.png';

const CartNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Check if user has muted for this session
    const muted = sessionStorage.getItem('diwan_cart_notif_muted') === 'true';
    setIsMuted(muted);

    const handleItemAdded = () => {
      if (sessionStorage.getItem('diwan_cart_notif_muted') === 'true') return;
      
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('itemAddedToCart', handleItemAdded);
    return () => window.removeEventListener('itemAddedToCart', handleItemAdded);
  }, []);

  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem('diwan_cart_notif_muted', 'true');
    setIsMuted(true);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && !isMuted && (
        <motion.div 
          className="cart-notif-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="cart-notif-content"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="cart-notif-logo">
              <img src={logo} alt="Diwan Logo" />
            </div>
            <div className="cart-notif-text">
              <h3>Produit ajouté !</h3>
              <p>Votre sélection a été ajoutée avec succès. Retrouvez vos articles dans le panier en haut à droite pour finaliser votre commande d'exception.</p>
            </div>
            <div className="cart-notif-footer">
              <div className="cart-notif-line" />
              <label className="mute-checkbox-container">
                <input 
                  type="checkbox" 
                  onChange={handleMute} 
                  checked={isMuted}
                />
                <span className="checkmark"></span>
                <span className="mute-label">Ne plus afficher cette confirmation</span>
              </label>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartNotification;
