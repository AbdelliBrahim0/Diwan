import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';
import logo from '../assets/logo.png';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Top golden divider */}
      <div className="footer-top-line">
        <div className="footer-top-ornament">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4a77d" strokeWidth="1">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
          </svg>
        </div>
      </div>

      <div className="footer-bg-glow" />

      <div className="footer-container">

        {/* Brand block */}
        <motion.div
          className="footer-brand"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img src={logo} alt="Diwan Logo" className="footer-logo" />
          <p className="footer-tagline">
            L'élégance du patrimoine tunisien,<br />réinventée pour l'époque moderne.
          </p>
          <div className="footer-social">
            {/* Facebook */}
            <a href="#" className="social-link" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
            {/* WhatsApp */}
            <a href="#" className="social-link" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Navigation links */}
        <motion.div
          className="footer-col"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h4 className="footer-col-title">Navigation</h4>
          <ul className="footer-links">
            <li><a href="#">Accueil</a></li>
            <li><a href="#">Collections</a></li>
            <li><a href="#">Galerie</a></li>
            <li><a href="#">Notre Processus</a></li>
          </ul>
        </motion.div>

        {/* Services */}
        <motion.div
          className="footer-col"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h4 className="footer-col-title">Services</h4>
          <ul className="footer-links">
            <li><a href="#">Location de tenues</a></li>
            <li><a href="#">Vente & Livraison</a></li>
            <li><a href="#">Mesures à domicile</a></li>
            <li><a href="#">Conseil personnalisé</a></li>
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          className="footer-col"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h4 className="footer-col-title">Contact</h4>
          <ul className="footer-contact-list">
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4a77d" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.42 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>+216 XX XXX XXX</span>
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4a77d" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>contact@diwan.tn</span>
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4a77d" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Tunisie</span>
            </li>
          </ul>
        </motion.div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-line" />
        <div className="footer-bottom-content">
          <span className="footer-copy">
            © {year} Diwan Elite. Tous droits réservés.
          </span>
          <span className="footer-craft">
            Artisanat tunisien authentique
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
