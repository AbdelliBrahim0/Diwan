import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductGrid.css';

// Asset Imports
import blouzaEnfantImg from '../assets/products/blouza enfant.png';
import costumeEnfantImg from '../assets/products/costume enfant.png';
import costumeImg from '../assets/products/costume.png';
import dengriEnfantImg from '../assets/products/dengri enfant.png';
import dengriImg from '../assets/products/dengri.png';
import jebbaImg from '../assets/products/jebba.png';
import jebba2Img from '../assets/products/jebba2.png';

const PRODUCTS = [
  { id: 1, name: 'Blouza Enfant', rent: '80', sell: '240', image: blouzaEnfantImg, desc: "Découvrez l'élégance intemporelle de cette Blouza pour enfant. Confectionnée avec des tissus de haute qualité, elle apporte une touche de noblesse traditionnelle aux plus jeunes." },
  { id: 2, name: 'Costume', rent: '150', sell: '580', image: costumeImg, desc: "Un costume au design sophistiqué, taillé sur mesure pour sublimer votre allure. L'alliance parfaite entre le savoir-faire classique et la modernité audacieuse de Diwan Elite." },
  { id: 3, name: 'Jebba Traditionnelle', rent: '120', sell: '450', image: jebbaImg, desc: "La Jebba traditionnelle incarne l'héritage authentique. Broderies minutieuses et coupe majestueuse, elle est la pièce maîtresse des grandes cérémonies." },
  { id: 4, name: 'Dengri Authentique', rent: '60', sell: '180', image: dengriImg, desc: "Le Dengri, symbole de l'élégance brute et du caractère. Repensé avec des finitions premium, il offre un confort absolu tout en affirmant une identité forte." },
  { id: 5, name: 'Costume Enfant', rent: '90', sell: '320', image: costumeEnfantImg, desc: "L'élégance n'attend pas le nombre des années. Ce costume pour enfant est conçu pour offrir prestance et aisance lors des moments les plus précieux." },
  { id: 6, name: 'Jebba Royale', rent: '180', sell: '620', image: jebba2Img, desc: "Un chef-d'œuvre de l'artisanat. La Jebba Royale se distingue par ses finitions dorées et son tissu opulent, réservée aux occasions les plus grandioses." },
];

const ProductGrid: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const handleAddToCart = (product: any, type: 'rent' | 'sell') => {
    const cart = JSON.parse(localStorage.getItem('diwan_cart') || '[]');
    const price = type === 'rent' ? product.rent : product.sell;
    
    const newItem = {
      cartId: Date.now() + Math.random().toString(36).substring(2, 9),
      productId: product.id,
      name: product.name,
      type: type,
      price: price,
      image: product.image
    };
    
    cart.push(newItem);
    localStorage.setItem('diwan_cart', JSON.stringify(cart));
    
    // Dispatch custom event to notify Navbar
    window.dispatchEvent(new Event('cartUpdated'));

    setJustAdded(type);
    setTimeout(() => {
      setJustAdded(null);
      setSelectedProduct(null); // Close modal automatically after adding? Or let user close. Let's keep it open, just remove success state.
    }, 1500);
  };

  return (
    <section className="creative-grid-section">
      <div className="container">
        <motion.div 
          className="creative-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="ornament-top">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c4a77d" strokeWidth="1">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
            </svg>
          </div>
          <span className="subtitle">L'Élégance Héritée</span>
          <h2 className="title">Pièces Maîtresses</h2>
          <div className="header-divider"></div>
        </motion.div>

        <div className="creative-products-container">
          {PRODUCTS.slice(0, 6).map((product, idx) => (
            <motion.div 
              key={product.id}
              className="creative-card clickable"
              onClick={() => setSelectedProduct(product)}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: idx * 0.1 }}
            >
              <div className="creative-card-inner">
                {/* Traditional Border Corners */}
                <div className="corner-deco top-left"></div>
                <div className="corner-deco top-right"></div>
                <div className="corner-deco bottom-left"></div>
                <div className="corner-deco bottom-right"></div>

                <div className="card-image-box">
                  <div className="image-aura"></div>
                  <img src={product.image} alt={product.name} />
                  <div className="action-overlay hint">
                    <span className="discover-hint">Découvrir l'œuvre</span>
                  </div>
                </div>

                <div className="card-details">
                  <span className="brand-tag">Diwan Elite</span>
                  <h3 className="creative-name">{product.name}</h3>
                  
                  <div className="fancy-divider">
                    <div className="fancy-line"></div>
                    <div className="fancy-diamond"></div>
                    <div className="fancy-line"></div>
                  </div>

                  <div className="creative-pricing">
                    <div className="price-block">
                      <span className="p-label">Location</span>
                      <span className="p-value">{product.rent} <small>DT</small></span>
                    </div>
                    <div className="price-separator"></div>
                    <div className="price-block highlight">
                      <span className="p-label">Vente</span>
                      <span className="p-value gold">{product.sell} <small>DT</small></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="creative-footer">
          <button className="btn-discover-all">
            <span className="text">Consulter tout</span>
          </button>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            className="product-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div 
              className="product-modal-content"
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedProduct(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="modal-grid">
                <div className="modal-image-col">
                  <div className="modal-image-wrapper">
                    <div className="modal-aura"></div>
                    <img src={selectedProduct.image} alt={selectedProduct.name} />
                  </div>
                </div>
                
                <div className="modal-info-col">
                  <div className="modal-header">
                    <span className="modal-brand">Diwan Elite</span>
                    <h2 className="modal-title">{selectedProduct.name}</h2>
                    <div className="fancy-divider left">
                      <div className="fancy-diamond"></div>
                      <div className="fancy-line"></div>
                    </div>
                  </div>

                  <div className="modal-desc">
                    <p>{selectedProduct.desc}</p>
                  </div>

                  <div className="modal-actions">
                    <div className="action-card rent">
                      <div className="action-price">
                        <span className="action-label">Louer pour</span>
                        <span className="action-val">{selectedProduct.rent} <small>DT</small></span>
                      </div>
                      <button 
                        className={`btn-modal-action ${justAdded === 'rent' ? 'success' : ''}`}
                        onClick={() => handleAddToCart(selectedProduct, 'rent')}
                      >
                        {justAdded === 'rent' ? 'Ajouté ✔' : 'Ajouter au Panier'}
                      </button>
                    </div>

                    <div className="action-card sell">
                      <div className="action-price">
                        <span className="action-label">Acquérir pour</span>
                        <span className="action-val gold">{selectedProduct.sell} <small>DT</small></span>
                      </div>
                      <button 
                        className={`btn-modal-action primary ${justAdded === 'sell' ? 'success' : ''}`}
                        onClick={() => handleAddToCart(selectedProduct, 'sell')}
                      >
                        {justAdded === 'sell' ? 'Ajouté ✔' : 'Ajouter au Panier'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProductGrid;
