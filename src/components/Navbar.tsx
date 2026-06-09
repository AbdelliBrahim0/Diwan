import React, { useState, useEffect, useMemo } from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';
import { API_URL } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  type: 'rent' | 'sell';
  price: string;
  image: string;
  quantity: number;
  source?: string;
  originalPrice?: string | number;
}

interface NavbarProps {
  onNavigate?: (to: 'home' | 'products' | 'happyhour' | 'blackfriday' | 'auth') => void
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'none' | 'selection' | 'confirm' | 'whatsapp_form' | 'success' | 'login_required'>('none');
  const [whatsappForm, setWhatsappForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('diwan_theme') as 'dark' | 'light') || 'dark'
  );

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('diwan_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');

  const loadCart = () => {
    const rawItems = JSON.parse(localStorage.getItem('diwan_cart') || '[]');
    const sanitizedItems = rawItems.map((item: any) => ({
      ...item,
      productId: item.productId || item.id || 'N/A',
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      source: item.source || 'Catalogue'
    }));
    setCartItems(sanitizedItems);

    const token = localStorage.getItem('diwan_auth_token');
    const storedUser = localStorage.getItem('diwan_user_data');
    if (token && storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      setCurrentUser(null);
      if (!token) localStorage.removeItem('diwan_user_data');
    }
  };

  useEffect(() => {
    loadCart();
    const handleCartUpdate = () => loadCart();
    const handleAdd = () => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 3000);
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('itemAddedToCart', handleAdd);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('itemAddedToCart', handleAdd);
    };
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoError('');
    try {
      const res = await fetch(`${API_URL}/promo-codes/validate/${promoCodeInput}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Code invalide');
      }
      const data = await res.json();
      setAppliedPromo(data);
    } catch (err: any) {
      setPromoError(err.message);
      setAppliedPromo(null);
    }
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    const baseTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    if (appliedPromo.type === 'percentage') {
      return baseTotal * (appliedPromo.value / 100);
    } else {
      return Math.min(appliedPromo.value, baseTotal);
    }
  };

  const totalPrice = useMemo(() => {
    const baseTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const discount = calculateDiscount();
    return Math.max(0, baseTotal - discount);
  }, [cartItems, appliedPromo]);

  const handleCheckoutSelection = () => {
    setCartOpen(false);
    setCheckoutStep('selection');
  };

  const handleWhatsAppCheckout = () => {
    // If already logged in, pre-fill the form
    if (currentUser) {
      setWhatsappForm({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
    }
    setCheckoutStep('whatsapp_form');
  };

  const handleFinalWhatsAppCheckout = () => {
    const whatsappNumber = "21655089122";
    const total = totalPrice;
    const dateStr = new Date().toLocaleString('fr-FR');

    let message = `*⚜️ NOUVELLE COMMANDE DIWAN ELITE ⚜️*\n\n`;
    message += `📅 *Date:* ${dateStr}\n`;

    message += `👤 *Client:* ${whatsappForm.firstName} ${whatsappForm.lastName}\n`;
    if (whatsappForm.phone) {
      message += `📞 *Tel (Contact):* ${whatsappForm.phone}\n`;
    }
    message += `📍 *Adresse:* ${whatsappForm.address}\n`;

    message += `\n📦 *ARTICLES:*\n`;

    cartItems.forEach(item => {
      const typeLabel = item.type === 'rent' ? 'Location' : 'Vente';
      const sourceLabel = item.source || 'Catalogue';

      const priceDisplay = item.originalPrice && Number(item.originalPrice) > Number(item.price)
        ? `~${item.originalPrice} DT~ *${item.price} DT* (Remisé)`
        : `*${item.price} DT*`;

      message += `\n▫️ *${item.name.toUpperCase()}*\n`;
      message += `   • Qté: ${item.quantity}\n`;
      message += `   • Type: ${typeLabel}\n`;
      message += `   • Provenance: ${sourceLabel}\n`;
      message += `   • ID Produit: #${item.productId}\n`;
      message += `   • Prix: ${priceDisplay}\n`;
    });

    if (appliedPromo) {
      const disc = calculateDiscount();
      message += `\n🎁 *Code Promo:* ${appliedPromo.code} (-${disc} DT)\n`;
    }

    message += `\n──────────────────\n`;
    message += `💰 *TOTAL À PAYER: ${total} DT*\n`;
    message += `──────────────────\n\n`;
    message += `Je souhaite confirmer ma commande. Voici mes coordonnées pour la livraison.`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setCheckoutStep('none');
  };

  const handleAccountCheckoutStart = () => {
    const token = localStorage.getItem('diwan_auth_token');
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      setCheckoutStep('login_required');
      return;
    }
    setCheckoutStep('confirm');
  };

  const handleFinalAccountCheckout = async () => {
    const token = localStorage.getItem('diwan_auth_token');
    if (!token) {
      setCheckoutStep('login_required');
      return;
    }

    setIsOrdering(true);
    try {
      console.log("Sending order to:", `${API_URL}/orders`);
      const response = await fetch(`${API_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
            type: item.type,
            source: item.source || 'catalogue',
            original_price: item.originalPrice ? Number(item.originalPrice) : Number(item.price),
            price_at_purchase: Number(item.price)
          })),
          promo_code: appliedPromo?.code || null,
          discount_amount: calculateDiscount()
        })
      });

      if (!response.ok) {
        let errorMessage = "Erreur lors de la commande";
        try {
          const err = await response.json();
          errorMessage = err.detail || errorMessage;
        } catch (e) {
          console.error("Failed to parse error JSON", e);
        }
        throw new Error(errorMessage);
      }

      localStorage.setItem('diwan_cart', JSON.stringify([]));
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
      setCheckoutStep('success');
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert("⚠️ ERREUR LORS DE LA VALIDATION: " + (error.message || "Erreur inconnue"));
    } finally {
      setIsOrdering(false);
    }
  };

  const removeFromCart = (cartId: string) => {
    const newItems = cartItems.filter(item => item.cartId !== cartId);
    setCartItems(newItems);
    localStorage.setItem('diwan_cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    const newItems = cartItems.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(newItems);
    localStorage.setItem('diwan_cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    if (window.confirm('Voulez-vous vraiment vider tout votre panier ?')) {
      setCartItems([]);
      localStorage.setItem('diwan_cart', JSON.stringify([]));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar glass">
      <div className="navbar-container container">
        <div className="logo-container">
          <img src={logo} alt="Diwan Logo" className="navbar-logo" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            className="nav-theme-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            style={{
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'dark' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          <button
            className="nav-account-btn"
            onClick={() => onNavigate?.('auth')}
            title="Mon Compte"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          <div className="cart-wrapper">
            <button
              className={`cart-btn-nav ${isAnimating ? 'pulse-cart' : ''}`}
              onClick={() => {
                setCartOpen(!cartOpen);
                setIsOpen(false);
              }}
            >
              {isAnimating && (
                <div className="cart-pointer-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c4a77d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </div>
              )}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
            </button>

            <div className={`cart-dropdown ${cartOpen ? 'active' : ''}`}>
              <div className="cart-dropdown-header">
                <div className="cart-header-title">
                  <h4>Votre Panier</h4>
                  <span className="cart-count">{totalItemsCount} articles</span>
                </div>
                <div className="cart-header-actions">
                  {cartItems.length > 0 && (
                    <button className="btn-clear-cart" onClick={clearCart}>Vider</button>
                  )}
                  <button className="btn-close-cart" onClick={() => setCartOpen(false)}>×</button>
                </div>
              </div>

              {cartItems.length === 0 ? (
                <div className="cart-empty">Votre panier est vide.</div>
              ) : (
                <>
                  <div className="cart-items-list">
                    {cartItems.map((item) => (
                      <div key={item.cartId} className="cart-item">
                        <img src={item.image} alt={item.name} className="cart-item-img" />
                        <div className="cart-item-info">
                          <h5 className="item-name">{item.name}</h5>
                          <div className="item-meta">
                            <span className="item-source">{item.source || 'Catalogue'}</span>
                            <span className="item-type">{item.type === 'rent' ? 'Location' : 'Vente'}</span>
                            <span className="item-price">{item.price} DT</span>
                          </div>
                          <div className="item-quantity-controls">
                            <button className="qty-btn" onClick={() => updateQuantity(item.cartId, -1)}>-</button>
                            <span className="qty-value">{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(item.cartId, 1)}>+</button>
                          </div>
                        </div>
                        <button className="btn-remove-item" onClick={() => removeFromCart(item.cartId)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="cart-dropdown-footer">
                    <div className="promo-section">
                      <div className="promo-input-group">
                        <input
                          type="text"
                          placeholder="Code promo"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        />
                        <button onClick={handleApplyPromo}>Appliquer</button>
                      </div>
                      {promoError && <p className="promo-error">{promoError}</p>}
                      {appliedPromo && (
                        <p className="promo-success">
                          Code "{appliedPromo.code}" appliqué (-{calculateDiscount()} DT)
                        </p>
                      )}
                      <div className="promo-disclaimer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>Ce code est à usage unique. S'il est utilisé, il sera perdu même en cas d'annulation de commande.</span>
                      </div>
                    </div>
                    <div className="cart-total">
                      <span>Total</span>
                      <div className="total-stack">
                        {appliedPromo && (
                          <span className="old-total">
                            {cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)} DT
                          </span>
                        )}
                        <span className="total-price">{totalPrice} DT</span>
                      </div>
                    </div>
                    <button
                      className="btn-checkout"
                      onClick={handleCheckoutSelection}
                    >
                      Commander
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            className={`menu-toggle ${isOpen ? 'active' : ''}`}
            onClick={() => {
              setIsOpen(!isOpen);
              setCartOpen(false);
            }}
            aria-label="Toggle menu"
          >
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        <div
          className={`nav-menu-overlay ${isOpen ? 'show' : ''}`}
          onClick={() => setIsOpen(false)}
        />

        <div className={`nav-menu ${isOpen ? 'show' : ''} glass`}>
          <div className="nav-menu-header">
            <div className="nav-menu-header-top">
              <span className="nav-menu-tagline">L'Élite de la Haute Couture</span>
              <button className="nav-menu-close" onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div className="nav-menu-divider"></div>
          </div>

          <ul className="nav-list">
            <li className="nav-item">
              <a href="/" className="nav-link" onClick={(e) => { e.preventDefault(); setIsOpen(false); onNavigate?.('home') }}>
                <span className="link-num">01</span>
                <span className="link-text">Accueil</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/catalog" className="nav-link" onClick={(e) => { e.preventDefault(); setIsOpen(false); onNavigate?.('products') }}>
                <span className="link-num">02</span>
                <span className="link-text">Catalogue</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/happy-hour" className="nav-link" onClick={(e) => { e.preventDefault(); setIsOpen(false); onNavigate?.('happyhour') }}>
                <span className="link-num">03</span>
                <span className="link-text">Happy Hour</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/black-friday" className="nav-link" onClick={(e) => { e.preventDefault(); setIsOpen(false); onNavigate?.('blackfriday') }}>
                <span className="link-num">04</span>
                <span className="link-text">Black Friday</span>
              </a>
            </li>
          </ul>

          <div className="nav-menu-footer">
            <img src={logo} alt="Diwan Logo" className="nav-menu-logo" />
            <div className="nav-menu-copyright">© 2026 Diwan Elite</div>
          </div>
        </div>

        <AnimatePresence>
          {/* Checkout Selection Popup */}
          {checkoutStep === 'selection' && (
            <motion.div
              className="checkout-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutStep('none')}
            >
              <motion.div
                className="checkout-popup glass"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="popup-header">
                  <div className="popup-gold-line"></div>
                  <h3>Finaliser la commande</h3>
                  <p>L'expérience Diwan se poursuit avec votre mode de validation préféré.</p>
                </div>

                <div className="checkout-options">
                  <button className="opt-btn account-opt" onClick={handleAccountCheckoutStart}>
                    <div className="opt-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="opt-text">
                      <strong>Par Compte Diwan</strong>
                      <span>Utilisez vos coordonnées enregistrées</span>
                    </div>
                    <div className="opt-arrow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </button>

                  <div className="opt-divider">
                    <span>ou</span>
                  </div>

                  <button className="opt-btn whatsapp-opt" onClick={handleWhatsAppCheckout}>
                    <div className="opt-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"></path>
                      </svg>
                    </div>
                    <div className="opt-text">
                      <strong>Par WhatsApp</strong>
                      <span>Une validation directe et personnalisée</span>
                    </div>
                    <div className="opt-arrow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </button>
                </div>

                <button className="btn-close-checkout" onClick={() => setCheckoutStep('none')}>
                  <span>Retour au panier</span>
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Account Confirmation Popup */}
          {checkoutStep === 'confirm' && currentUser && (
            <motion.div
              className="checkout-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutStep('none')}
            >
              <motion.div
                className="checkout-popup glass confirm-popup"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="popup-header">
                  <div className="popup-gold-line"></div>
                  <h3>Détails de Livraison</h3>
                  <p>Veuillez confirmer vos coordonnées pour l'expédition de votre commande.</p>
                </div>

                <div className="verification-details">
                  <div className="v-card">
                    <div className="v-item">
                      <div className="v-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="v-content">
                        <label>Destinataire</label>
                        <p>{currentUser.firstName} {currentUser.lastName}</p>
                      </div>
                    </div>

                    <div className="v-item">
                      <div className="v-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div className="v-content">
                        <label>Contact</label>
                        <p>{currentUser.phone}</p>
                      </div>
                    </div>

                    <div className="v-item">
                      <div className="v-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <div className="v-content">
                        <label>Adresse d'expédition</label>
                        <p>{currentUser.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="v-actions">
                  <button
                    className="btn-confirm-final"
                    onClick={handleFinalAccountCheckout}
                    disabled={isOrdering}
                  >
                    {isOrdering ? (
                      <div className="btn-loader">
                        <span></span>
                        Validation...
                      </div>
                    ) : (
                      "Valider ma commande d'exception"
                    )}
                  </button>
                  <button className="btn-edit-redirect" onClick={() => { setCheckoutStep('none'); onNavigate?.('auth'); }}>
                    Modifier mes informations
                  </button>
                </div>

                <button className="btn-close-checkout" onClick={() => setCheckoutStep('none')}>
                  <span>Annuler</span>
                </button>
              </motion.div>
            </motion.div>
          )}
          {/* WhatsApp Form Popup */}
          {checkoutStep === 'whatsapp_form' && (
            <motion.div
              className="checkout-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutStep('none')}
            >
              <motion.div
                className="checkout-popup glass whatsapp-form-popup"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="popup-header">
                  <div className="popup-gold-line"></div>
                  <h3>Vos Coordonnées</h3>
                  <p>Pour préparer votre message WhatsApp, veuillez remplir ces informations de livraison.</p>
                </div>

                <div className="whatsapp-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Prénom</label>
                      <input
                        type="text"
                        value={whatsappForm.firstName}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, firstName: e.target.value })}
                        placeholder="Ex: Amine"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nom</label>
                      <input
                        type="text"
                        value={whatsappForm.lastName}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, lastName: e.target.value })}
                        placeholder="Ex: Ben Salem"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Numéro de téléphone (si différent de WhatsApp)</label>
                    <input
                      type="tel"
                      value={whatsappForm.phone}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, phone: e.target.value })}
                      placeholder="Ex: 55 000 000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Adresse de livraison complète</label>
                    <textarea
                      value={whatsappForm.address}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, address: e.target.value })}
                      placeholder="Rue, Ville, Code Postal..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="whatsapp-info-notice">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <p>L'application WhatsApp va s'ouvrir avec un message prêt à être envoyé. Vous n'aurez qu'à cliquer sur "Envoyer".</p>
                </div>

                <div className="v-actions">
                  <button
                    className="btn-confirm-final whatsapp-final-btn"
                    onClick={handleFinalWhatsAppCheckout}
                    disabled={!whatsappForm.firstName || !whatsappForm.lastName || !whatsappForm.address}
                  >
                    Ouvrir WhatsApp et commander
                  </button>
                </div>

                <button className="btn-close-checkout" onClick={() => setCheckoutStep('none')}>
                  <span>Annuler</span>
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Success Popup */}
          {checkoutStep === 'success' && (
            <motion.div
              className="checkout-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutStep('none')}
            >
              <motion.div
                className="checkout-popup glass success-popup"
                initial={{ scale: 0.8, opacity: 0, rotateY: 20 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="success-icon-wrap">
                  <motion.div
                    className="success-circle"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </motion.div>
                  <div className="success-particles"></div>
                </div>

                <div className="popup-header">
                  <h3>Commande Transmise</h3>
                  <p>Votre commande d'exception a bien été enregistrée dans notre univers.</p>
                </div>

                <div className="service-notice">
                  <div className="notice-line"></div>
                  <p>Notre service technique va vous appeler dans les plus brefs délais pour finaliser les détails de votre expérience.</p>
                </div>

                <button className="btn-confirm-final" onClick={() => setCheckoutStep('none')}>
                  Fermer
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Login Required Popup */}
          {checkoutStep === 'login_required' && (
            <motion.div
              className="checkout-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutStep('none')}
            >
              <motion.div
                className="checkout-popup glass login-req-popup"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="popup-header">
                  <div className="lock-icon-wrap">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <h3>Connexion Requise</h3>
                  <p>Pour valider votre commande par compte Diwan, une authentification est nécessaire.</p>
                </div>

                <div className="v-actions">
                  <button className="btn-confirm-final" onClick={() => { setCheckoutStep('none'); onNavigate?.('auth'); }}>
                    Se Connecter / S'Inscrire
                  </button>
                  <button className="btn-edit-redirect" onClick={() => setCheckoutStep('selection')}>
                    Retour aux options
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
