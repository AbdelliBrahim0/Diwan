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

interface Entity {
  id: number;
  name: string;
}

interface PacksSectionProps {
  onNavigateToPack?: (packId: number) => void;
}

const PacksSection: React.FC<PacksSectionProps> = ({ onNavigateToPack }) => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allProducts, setAllProducts] = useState<Entity[]>([]);
  const [categories, setCategories] = useState<Entity[]>([]);
  const [collections, setCollections] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, prRes, cRes, clRes] = await Promise.all([
          fetch(`${API_URL}/packs`),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/collections`)
        ]);
        if (pRes.ok) setPacks((await pRes.json()).filter((p: Pack) => p.is_active));
        if (prRes.ok) setAllProducts(await prRes.json());
        if (cRes.ok) setCategories(await cRes.json());
        if (clRes.ok) setCollections(await clRes.json());
      } catch (error) {
        console.error('Packs fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (packs.length <= 1) return;
    const timer = setInterval(() => setCurrentIndex((c) => (c + 1) % packs.length), 7000);
    return () => clearInterval(timer);
  }, [packs.length]);

  if (loading || packs.length === 0) return null;

  const pack = packs[currentIndex];

  const getCompLabel = (comp: PackComponent) => {
    let name = '';
    if (comp.type === 'product') name = allProducts.find(p => p.id === comp.product_id)?.name || 'Produit';
    else if (comp.type === 'category') name = categories.find(c => c.id === comp.category_id)?.name || 'Catégorie';
    else if (comp.type === 'collection') name = collections.find(cl => cl.id === comp.collection_id)?.name || 'Collection';
    
    return {
      qty: comp.quantity,
      name: name,
      isSelection: comp.type !== 'product'
    };
  };

  return (
    <section className="luxury-packs-showcase">
      <div className="luxury-bg-layers">
        <div className="luxury-grain"></div>
        <div className="luxury-gradient"></div>
      </div>

      <div className="container showcase-inner">
        <AnimatePresence mode="wait">
          <motion.div
            key={pack.id}
            className="pack-artistic-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Background Text Reveal */}
            <motion.div 
              className="artistic-bg-title"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 0.05, scale: 1 }}
              transition={{ duration: 2 }}
            >
              {pack.name.split(' ')[0]}
            </motion.div>

            <div className="pack-visual-reveal">
              <motion.div 
                className="reveal-frame"
                initial={{ clipPath: 'inset(100% 0 0 0)' }}
                animate={{ clipPath: 'inset(0% 0 0 0)' }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <img src={pack.image_url} alt={pack.name} className="parallax-img" />
              </motion.div>
              
              <motion.div 
                className="floating-price"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <span className="price-num">{pack.price}</span>
                <span className="currency">DT</span>
              </motion.div>
            </div>

            <div className="pack-content-elegant">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <span className="elegant-tag">Collection Privée</span>
                <h2 className="elegant-title">{pack.name}</h2>
                <p className="elegant-desc">{pack.description}</p>

                <div className="composition-legend">
                  <div className="legend-label">COMPOSITION</div>
                  <div className="legend-items">
                    {pack.components.map((comp, i) => {
                      const data = getCompLabel(comp);
                      return (
                        <motion.div 
                          key={i} 
                          className="legend-row"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                        >
                          <div className="legend-bullet">
                            <div className="diamond"></div>
                            <span className="num">{data.qty}</span>
                          </div>
                          <div className="legend-text">
                            <span className="item-name">{data.name}</span>
                            {data.isSelection && <span className="item-note">au choix</span>}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="pack-actions-minimal">
                  <button className="btn-explore-luxe" onClick={() => onNavigateToPack?.(pack.id)}>
                    Personnaliser
                    <div className="btn-line"></div>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Global Controls */}
        <div className="showcase-footer">
          <div className="pack-counter">
            <span className="current">0{currentIndex + 1}</span>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill" 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                key={currentIndex}
                transition={{ duration: 7, ease: "linear" }}
              />
            </div>
            <span className="total">0{packs.length}</span>
          </div>
          
          <div className="nav-controls-elegant">
            <button className="nav-btn" onClick={() => setCurrentIndex((c) => (c - 1 + packs.length) % packs.length)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="nav-btn" onClick={() => setCurrentIndex((c) => (c + 1) % packs.length)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PacksSection;
