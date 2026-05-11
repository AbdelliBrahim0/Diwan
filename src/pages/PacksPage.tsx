import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../lib/api';
import './PacksPage.css';

interface PackComponent {
  id: number;
  type: 'product' | 'category' | 'collection';
  product_id?: number;
  category_id?: number;
  collection_id?: number;
  quantity: number;
}

interface Pack {
  id: number;
  name: string;
  description: string;
  image_url: string;
  price: number;
  is_active: boolean;
  components: PackComponent[];
}

interface Product {
  id: number;
  name: string;
  img_url: string;
  category_ids: number[];
  collection_ids: number[];
}

interface PacksPageProps {
  onBack: () => void;
  initialPackId?: number | null;
}

const PacksPage: React.FC<PacksPageProps> = ({ onBack, initialPackId }) => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, number[]>>({}); // compIdx -> productIds[]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, prRes] = await Promise.all([
          fetch(`${API_URL}/packs`),
          fetch(`${API_URL}/products`)
        ]);

        if (pRes.ok) {
          const activePacks = (await pRes.json()).filter((p: Pack) => p.is_active);
          setPacks(activePacks);
          
          if (activePacks.length > 0) {
            const initial = initialPackId 
              ? activePacks.find(p => p.id === initialPackId) || activePacks[0]
              : activePacks[0];
            setSelectedPack(initial);
          }
        }
        if (prRes.ok) setAllProducts(await prRes.json());
      } catch (error) {
        console.error('Failed to fetch packs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialPackId]);

  // Initialize selections when pack changes
  useEffect(() => {
    if (selectedPack) {
      const initialSelections: Record<number, number[]> = {};
      selectedPack.components.forEach((comp, idx) => {
        if (comp.type === 'product' && comp.product_id) {
          initialSelections[idx] = [comp.product_id];
        } else {
          initialSelections[idx] = [];
        }
      });
      setSelections(initialSelections);
      setCurrentStep(0);
    }
  }, [selectedPack]);

  const handleProductToggle = (compIdx: number, productId: number, max: number) => {
    const current = selections[compIdx] || [];
    if (current.includes(productId)) {
      setSelections({ ...selections, [compIdx]: current.filter(id => id !== productId) });
    } else {
      if (current.length < max) {
        setSelections({ ...selections, [compIdx]: [...current, productId] });
      }
    }
  };

  const isStepComplete = (idx: number) => {
    const comp = selectedPack?.components[idx];
    if (!comp) return false;
    return (selections[idx]?.length || 0) === comp.quantity;
  };

  const canAddToCart = selectedPack?.components.every((_, idx) => isStepComplete(idx));

  const handleAddToCart = () => {
    if (!selectedPack || !canAddToCart) return;

    const cart = JSON.parse(localStorage.getItem('diwan_cart') || '[]') as any[];
    
    // Flatten selections into item details
    const selectedProductDetails = Object.values(selections).flat().map(id => {
      const p = allProducts.find(prod => prod.id === id);
      return { id: p?.id, name: p?.name };
    });

    cart.push({
      cartId: `pack-${Date.now()}`,
      productId: selectedPack.id, 
      name: `Pack: ${selectedPack.name}`,
      type: 'sell',
      price: selectedPack.price,
      image: selectedPack.image_url,
      quantity: 1,
      source: 'Pack Custom',
      details: selectedProductDetails
    });

    localStorage.setItem('diwan_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('itemAddedToCart'));
    onBack();
  };

  if (loading) {
    return (
      <div className="packs-page-loading">
        <div className="luxury-spinner"></div>
        <span>Initialisation de l'expérience...</span>
      </div>
    );
  }

  if (packs.length === 0) {
    return (
      <div className="packs-page-empty">
        <motion.div 
          className="empty-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="ornament-large"></div>
          <h1>Expérience en Préparation</h1>
          <p>Nos packs exclusifs sont en cours de création par nos experts. Revenez très bientôt pour découvrir nos nouvelles compositions.</p>
          <button className="btn-back-catalog" onClick={onBack}>Retour au Catalogue</button>
        </motion.div>
      </div>
    );
  }

  const currentComp = selectedPack?.components[currentStep];
  const availableProducts = currentComp ? (
    currentComp.type === 'product' ? allProducts.filter(p => p.id === currentComp.product_id) :
    currentComp.type === 'category' ? allProducts.filter(p => p.category_ids?.includes(currentComp.category_id)) :
    allProducts.filter(p => p.collection_ids?.includes(currentComp.collection_id))
  ) : [];

  return (
    <div className="packs-page-container">
      {/* Sidebar - Summary & Packs List */}
      <aside className="packs-sidebar">
        <button className="btn-back-minimal" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Retour</span>
        </button>

        <div className="sidebar-header">
          <span className="subtitle">Votre Sélection</span>
          <h1 className="main-title">Personnalisation</h1>
        </div>

        <div className="packs-selector-mini">
          {packs.map(p => (
            <button 
              key={p.id} 
              className={`pack-mini-card ${selectedPack?.id === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPack(p)}
            >
              <img src={p.image_url} alt={p.name} />
              <div className="mini-info">
                <span className="name">{p.name}</span>
                <span className="price">{p.price} DT</span>
              </div>
            </button>
          ))}
        </div>

        {selectedPack && (
          <div className="current-pack-summary">
            <div className="summary-image">
              <img src={selectedPack.image_url} alt={selectedPack.name} />
            </div>
            <div className="summary-details">
              <h3>{selectedPack.name}</h3>
              <p>{selectedPack.description}</p>
              <div className="total-price-box">
                <span className="label">Prix Total</span>
                <span className="value">{selectedPack.price} DT</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Customizer Area */}
      <main className="packs-customizer">
        <div className="customizer-header">
          <div className="steps-progress">
            {selectedPack?.components.map((_, idx) => (
              <div 
                key={idx} 
                className={`step-indicator ${idx === currentStep ? 'active' : ''} ${isStepComplete(idx) ? 'complete' : ''}`}
                onClick={() => setCurrentStep(idx)}
              >
                <div className="dot"></div>
                <span className="label">Étape {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="step-content-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedPack?.id}-${currentStep}`}
              className="step-animation-box"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="step-instruction">
                <h2>
                  {currentComp?.type === 'product' ? 'Votre article inclus' : 
                   `Choisissez ${currentComp?.quantity} article${currentComp?.quantity! > 1 ? 's' : ''}`}
                </h2>
                <p className="instruction-sub">
                  {currentComp?.type === 'product' ? 'Cet article est une pièce maîtresse fixe de votre pack.' : 
                   'Sélectionnez les pièces qui composeront votre ensemble unique.'}
                </p>
              </div>

              <div className="products-selection-grid">
                {availableProducts.map(product => {
                  const isSelected = selections[currentStep]?.includes(product.id);
                  const isFixed = currentComp?.type === 'product';
                  
                  return (
                    <motion.div 
                      key={product.id}
                      className={`selection-card ${isSelected ? 'selected' : ''} ${isFixed ? 'fixed' : ''}`}
                      onClick={() => !isFixed && handleProductToggle(currentStep, product.id, currentComp?.quantity || 1)}
                      whileHover={!isFixed ? { y: -5 } : {}}
                    >
                      <div className="card-img-box">
                        <img src={product.img_url} alt={product.name} />
                        {isSelected && (
                          <div className="selected-overlay">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="card-info">
                        <span className="name">{product.name}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="customizer-footer">
          <div className="footer-left">
            {currentStep > 0 && (
              <button className="btn-prev-step" onClick={() => setCurrentStep(c => c - 1)}>
                Précédent
              </button>
            )}
          </div>
          <div className="footer-right">
            {currentStep < (selectedPack?.components.length || 0) - 1 ? (
              <button 
                className="btn-next-step" 
                disabled={!isStepComplete(currentStep)}
                onClick={() => setCurrentStep(c => c + 1)}
              >
                Suivant
              </button>
            ) : (
              <button 
                className="btn-finish-pack" 
                disabled={!canAddToCart}
                onClick={handleAddToCart}
              >
                Ajouter au Panier
              </button>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default PacksPage;
