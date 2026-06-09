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
    const timer = setInterval(() => setCurrentIndex((c) => (c + 1) % packs.length), 8000);
    return () => clearInterval(timer);
  }, [packs.length]);

  if (loading || packs.length === 0) return null;

  const pack = packs[currentIndex];

  const getCompLabel = (comp: PackComponent) => {
    let name = '';
    if (comp.type === 'product') name = allProducts.find(p => p.id === comp.product_id)?.name || 'Produit';
    else if (comp.type === 'category') name = categories.find(c => c.id === comp.category_id)?.name || 'Catégorie';
    else if (comp.type === 'collection') name = collections.find(cl => cl.id === comp.collection_id)?.name || 'Collection';
    
    return { qty: comp.quantity, name: name, isSelection: comp.type !== 'product' };
  };

  return (
    <section className="museum-packs-showcase">
      {/* Background Ambience */}
      <div className="museum-ambience">
        <AnimatePresence mode="wait">
          <motion.img 
            key={pack.id}
            src={pack.image_url} 
            className="ambience-blur-img"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        </AnimatePresence>
        <div className="ambience-gradient"></div>
        <div className="museum-grid-lines"></div>
      </div>

      <div className="container museum-container">
        
        {/* Main Content Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pack.id}
            className="museum-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            {/* Background Massive Text */}
            <motion.div 
              className="museum-bg-text"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 0.04 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              {pack.name.split(' ')[0]}
            </motion.div>

            {/* Left Column: Glass Details Panel */}
            <motion.div 
              className="museum-info-panel glass"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="panel-header">
                <span className="museum-kicker">Exposition Privée</span>
                <h2 className="museum-title">{pack.name}</h2>
                <div className="museum-price">
                  <span className="price-val">{pack.price}</span>
                  <span className="price-cur">DT</span>
                </div>
              </div>
              
              <p className="museum-desc">{pack.description}</p>
              
              <div className="museum-composition">
                <h4 className="comp-label">Inclus dans ce coffret</h4>
                <ul className="comp-list">
                  {pack.components.map((comp, i) => {
                    const data = getCompLabel(comp);
                    return (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + (i * 0.1) }}
                      >
                        <span className="comp-qty">{data.qty}x</span>
                        <span className="comp-name">{data.name}</span>
                        {data.isSelection && <span className="comp-note">(Au choix)</span>}
                      </motion.li>
                    );
                  })}
                </ul>
              </div>

              <button className="museum-cta" onClick={() => onNavigateToPack?.(pack.id)}>
                <span className="cta-text">Découvrir l'œuvre</span>
                <span className="cta-line"></span>
              </button>
            </motion.div>

            {/* Right Column: Hero Art Piece */}
            <div className="museum-art-piece">
              <motion.div 
                className="art-frame"
                initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }}
                animate={{ clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)' }}
                transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
              >
                <img src={pack.image_url} alt={pack.name} className="art-img" />
                <div className="art-glow"></div>
              </motion.div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Global Controls */}
        <div className="museum-controls">
          <div className="museum-progress">
            <span className="prog-current">0{currentIndex + 1}</span>
            <div className="prog-track">
              <motion.div 
                className="prog-fill" 
                key={currentIndex}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 8, ease: "linear" }}
              />
            </div>
            <span className="prog-total">0{packs.length}</span>
          </div>

          <div className="museum-nav">
            <button className="nav-arrow" onClick={() => setCurrentIndex((c) => (c - 1 + packs.length) % packs.length)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="nav-arrow" onClick={() => setCurrentIndex((c) => (c + 1) % packs.length)}>
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
