import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../lib/api';
import './CollectionsSlider.css';

interface Collection {
  id: number;
  name: string;
  name_ar?: string;
  slug: string;
  description?: string;
  description_ar?: string;
  image_url?: string;
  order: number;
}

interface CollectionsSliderProps {
  onNavigate?: () => void;
}

const CollectionsSlider: React.FC<CollectionsSliderProps> = ({ onNavigate }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(`${API_URL}/collections`);
        if (response.ok) {
          const data = await response.json();
          // Sort by order
          const sorted = (data as Collection[]).sort((a, b) => a.order - b.order);
          setCollections(sorted);
        }
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };
    fetchCollections();
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="collections-section" ref={containerRef}>
      <div className="collections-bg">
        <div className="bg-pattern" />
        <div className="bg-glow" />
      </div>

      <div className="container">
        <motion.div 
          className="collections-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="ornament-wrap">
            <div className="ornament-line" />
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
            </svg>
            <div className="ornament-line" />
          </div>
          <span className="subtitle">L'Art de Vivre</span>
          <h2 className="title">Nos Collections Signature</h2>
          <p className="description">Explorez des univers uniques où la tradition rencontre le luxe contemporain.</p>
        </motion.div>

        <div className="slider-outer">
          <motion.div 
            className="collections-slider"
            ref={scrollRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {collections.map((col) => (
              <motion.div 
                key={col.id} 
                className="collection-card-wrap"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="collection-card glass">
                  <div className="card-image-wrapper">
                    <img src={col.image_url} alt={col.name} className="card-image" />
                    <div className="card-overlay" />
                  </div>

                  <div className="card-content">
                    <div className="card-info">
                      <div className="card-names">
                        <h3 className="card-name-fr">{col.name}</h3>
                        {col.name_ar && <h3 className="card-name-ar">{col.name_ar}</h3>}
                      </div>
                      <p className="card-desc">
                        {col.description || "Découvrez l'essence du luxe traditionnel à travers cette collection exclusive."}
                      </p>
                    </div>

                    <div className="card-footer">
                      <div className="card-divider" />
                      <button className="btn-discover" onClick={onNavigate}>
                        <span>Explorer</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="card-corner tl" />
                  <div className="card-corner br" />
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="slider-hint mobile-only">
            <span className="swipe-text">Faites glisser pour explorer</span>
            <div className="swipe-line">
              <motion.div 
                className="swipe-dot"
                animate={{ x: [0, 40, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionsSlider;
