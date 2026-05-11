import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../lib/api';
import './PacksSection.css';

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

interface PacksSectionProps {
  onNavigateToPack?: (packId: number) => void;
}

const PacksSection: React.FC<PacksSectionProps> = ({ onNavigateToPack }) => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packsRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/packs`),
          fetch(`${API_URL}/products`)
        ]);

        if (packsRes.ok) {
          const packsData = await packsRes.json();
          setPacks(packsData.filter((p: Pack) => p.is_active));
        }

        if (productsRes.ok) {
          setAllProducts(await productsRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch packs data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-play
  useEffect(() => {
    if (packs.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % packs.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [packs.length]);

  if (loading || packs.length === 0) return null;

  const currentPack = packs[currentIndex];

  const getComponentProducts = (comp: PackComponent) => {
    if (comp.type === 'product') {
      return allProducts.filter(p => p.id === comp.product_id);
    } else if (comp.type === 'category') {
      return allProducts.filter(p => p.category_ids?.includes(comp.category_id));
    } else if (comp.type === 'collection') {
      return allProducts.filter(p => p.collection_ids?.includes(comp.collection_id));
    }
    return [];
  };

  return (
    <section className="packs-experience">
      <div className="section-decoration">
        <div className="line-left"></div>
        <div className="diamond-center"></div>
        <div className="line-right"></div>
      </div>

      <div className="container overflow-hidden">
        <motion.div 
          className="packs-header"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <span className="gold-text-gradient uppercase tracking-[0.3em] text-xs font-bold mb-2 block">Offres Exclusives</span>
          <h2 className="section-title">Les Packs Diwan</h2>
          <div className="ornament-divider">
            <div className="dot"></div>
            <div className="line"></div>
            <div className="dot"></div>
          </div>
        </motion.div>

        <div className="packs-carousel-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPack.id}
              className="pack-slide-inner"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="pack-grid">
                {/* Visual Area */}
                <div className="pack-visual">
                  <div className="visual-background">
                    <div className="glow-orb"></div>
                  </div>
                  <motion.div 
                    className="main-ad-image"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  >
                    <img src={currentPack.image_url} alt={currentPack.name} />
                    <div className="image-frame"></div>
                  </motion.div>
                  
                  <div className="price-badge-floating">
                    <span className="label">Pack Complet</span>
                    <span className="value">{currentPack.price} <small>DT</small></span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="pack-info-content">
                  <motion.h3 
                    className="pack-name"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentPack.name}
                  </motion.h3>
                  
                  <motion.p 
                    className="pack-description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentPack.description}
                  </motion.p>

                  <div className="composition-title">Composition du Pack</div>
                  
                  <div className="components-list">
                    {currentPack.components.map((comp, idx) => {
                      const compProducts = getComponentProducts(comp);
                      return (
                        <motion.div 
                          key={idx}
                          className="comp-item-card"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                        >
                          <div className="comp-info">
                            <span className="comp-type-label">
                              {comp.type === 'product' ? 'Produit fixe' : 
                               comp.type === 'category' ? 'Au choix par catégorie' : 'Au choix par collection'}
                            </span>
                            <div className="comp-main-row">
                              <span className="comp-qty">{comp.quantity}x</span>
                              <span className="comp-name">
                                {comp.type === 'product' ? compProducts[0]?.name : 
                                 comp.type === 'category' ? 'Sélection de produits' : 'Articles de collection'}
                              </span>
                            </div>
                          </div>

                          {/* Mini Slider for choices */}
                          {(comp.type === 'category' || comp.type === 'collection') && (
                            <div className="mini-product-strip">
                              <motion.div 
                                className="strip-inner"
                                animate={{ x: [0, -100, 0] }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                              >
                                {compProducts.slice(0, 8).map((p, pIdx) => (
                                  <div key={pIdx} className="mini-p-thumb">
                                    <img src={p.img_url} alt={p.name} title={p.name} />
                                  </div>
                                ))}
                              </motion.div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.button 
                    className="btn-pack-discover"
                    onClick={() => onNavigateToPack?.(currentPack.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Personnaliser mon Pack</span>
                    <div className="btn-glow"></div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          {packs.length > 1 && (
            <div className="packs-nav-dots">
              {packs.map((_, idx) => (
                <button
                  key={idx}
                  className={`nav-dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PacksSection;
