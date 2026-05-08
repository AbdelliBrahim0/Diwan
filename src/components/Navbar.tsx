import React, { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';

interface CartItem {
  cartId: string;
  productId: number;
  name: string;
  type: 'rent' | 'sell';
  price: string;
  image: string;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadCart = () => {
    const items = JSON.parse(localStorage.getItem('diwan_cart') || '[]');
    setCartItems(items);
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const removeFromCart = (cartId: string) => {
    const newItems = cartItems.filter(item => item.cartId !== cartId);
    setCartItems(newItems);
    localStorage.setItem('diwan_cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + parseInt(item.price), 0);

  return (
    <nav className="navbar glass">
      <div className="navbar-container container">
        <div className="logo-container">
          <img src={logo} alt="Diwan Logo" className="navbar-logo" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="cart-wrapper">
            <button className="cart-btn-nav" onClick={() => setCartOpen(!cartOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
            </button>

            <div className={`cart-dropdown ${cartOpen ? 'active' : ''}`}>
              <div className="cart-dropdown-header">
                <h4>Votre Panier</h4>
                <span className="cart-count">{cartItems.length} articles</span>
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
                            <span className="item-type">{item.type === 'rent' ? 'Location' : 'Vente'}</span>
                            <span className="item-price">{item.price} DT</span>
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
                    <div className="cart-total">
                      <span>Total</span>
                      <span className="total-price">{totalPrice} DT</span>
                    </div>
                    <button className="btn-checkout">Commander</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <button 
            className={`menu-toggle ${isOpen ? 'active' : ''}`} 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        <div className={`nav-menu ${isOpen ? 'show' : ''} glass`}>
          <ul className="nav-list">
            <li className="nav-item">
              <a href="#" className="nav-link" onClick={() => setIsOpen(false)}>Accueil</a>
            </li>
            {/* Future links can be added here */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
