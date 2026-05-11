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
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packsRes, productsRes, catsRes, collsRes] = await Promise.all([
          fetch(`${API_URL}/packs`),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/collections`)
        ]);

        if (packsRes.ok) {
          const packsData = await packsRes.json();
          setPacks(packsData.filter((p: Pack) => p.is_active));
        }
        if (productsRes.ok) setAllProducts(await productsRes.json());
        if (catsRes.ok) setCategories(await catsRes.json());
        if (collsRes.ok) setCollections(await collsRes.json());
      } catch (error) {
        console.error('Failed to fetch packs data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (packs.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % packs.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [packs.length]);

  if (loading || packs.length === 0) return null;

  const currentPack = packs[currentIndex];

  const getComponentName = (comp: PackComponent) => {
    if (comp.type === 'product') {
      return allProducts.find(p => p.id === comp.product_id)?.name || 'Produit';
    } else if (comp.type === 'category') {
      return categories.find(c => c.id === comp.category_id)?.name || 'Catégorie';
    } else if (comp.type === 'collection') {
      return collections.find(coll => coll.id === comp.collection_id)?.name || 'Collection';
    }
    return '';
  };

  return (
    <section className="packs-experience">
      <div className="container">
        <div className="packs-carousel-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPack.id}
              className="pack-slide-inner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
            >
              <div className="pack-grid">
                {/* Visual Area - Graphic Ad */}
                <div className="pack-visual">
                  <motion.div 
                    className="main-ad-image"
                    layoutId={`pack-img-${currentPack.id}`}
                  >
                    <img src={currentPack.image_url} alt={currentPack.name} />
                    <div className="image-overlay-gold"></div>
                    <div className="price-tag-minimal">
                      <span>{currentPack.price} DT</span>
                    </div>
                  </motion.div>
                </div>

                {/* Content Area - Fine & Luxe */}
                <div className="pack-info-content">
                  <div className="pack-label-luxury">Édition Limitée</div>
                  <h3 className="pack-name-minimal">{currentPack.name}</h3>
                  <p className="pack-desc-minimal">{currentPack.description}</p>

                  <div className="composition-minimal">
                    <div className="comp-title-luxe">Inclus dans ce pack :</div>
                    <div className="comp-items-wrapper">
                      {currentPack.components.map((comp, idx) => (
                        <div key={idx} className="comp-pill">
                          <span className="comp-pill-qty">{comp.quantity}</span>
                          <span className="comp-pill-name">{getComponentName(comp)}</span>
                          {comp.type !== 'product' && <span className="comp-pill-choice">au choix</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="btn-luxe-discover"
                    onClick={() => onNavigateToPack?.(currentPack.id)}
                  >
                    <span>Découvrir l'expérience</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {packs.length > 1 && (
            <div className="packs-pagination-minimal">
              {packs.map((_, idx) => (
                <button
                  key={idx}
                  className={`pag-dot ${idx === currentIndex ? 'active' : ''}`}
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
