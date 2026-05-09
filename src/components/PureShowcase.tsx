import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PureShowcase.css';

// Asset Imports
import jebbaImg from '../assets/categorieAssets/jebba.png';
import jebba2Img from '../assets/categorieAssets/jebba2.png';
import costumeImg from '../assets/categorieAssets/costume.png';
import costumeEnfantImg from '../assets/categorieAssets/costume enfant.png';
import dengriImg from '../assets/categorieAssets/dengri.png';
import dengriEnfantImg from '../assets/categorieAssets/dengri enfant.png';
import blouzaImg from '../assets/categorieAssets/blouza.png';
import blouzaEnfantImg from '../assets/categorieAssets/blouza enfant.png';

const CATEGORIES = [
  {
    id: 'jebba',
    items: [jebbaImg, jebba2Img],
    title: 'JEBBA',
    subtitle: "L'ESSENCE DU PATRIMOINE",
    serial: '01'
  },
  {
    id: 'costume',
    items: [costumeImg, costumeEnfantImg],
    title: 'COSTUME',
    subtitle: 'ÉLÉGANCE CONTEMPORAINE',
    serial: '02'
  },
  {
    id: 'dengri',
    items: [dengriImg, dengriEnfantImg],
    title: 'DENGRI',
    subtitle: 'L\'ICÔNE AUTHENTIQUE',
    serial: '03'
  },
  {
    id: 'farmla',
    items: [blouzaImg, blouzaEnfantImg],
    title: 'BLOUZA',
    subtitle: 'RAFFINEMENT TRADITIONNEL',
    serial: '04'
  }
];

interface PureShowcaseProps {
  onNavigate?: () => void;
}

const PureShowcase: React.FC<PureShowcaseProps> = ({ onNavigate }) => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % CATEGORIES.length);
  const prev = () => setIndex((i) => (i - 1 + CATEGORIES.length) % CATEGORIES.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [index]);

  return (
    <section className="pure-showcase">
      {/* Luminous Background Layer */}
      <div className="luminous-bg">
        <div className="main-glow" style={{ background: `radial-gradient(circle at center, rgba(255,255,255,0.12) 0%, transparent 70%)` }} />
        <div className="accent-glow" style={{ background: `radial-gradient(circle at 70% 30%, rgba(196,167,125,0.08) 0%, transparent 50%)` }} />
        <div className="ray-effect" />
      </div>

      <div className="visual-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={CATEGORIES[index].id}
            className="showcase-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Creative Title Layer */}
            <div className="category-header">
              <motion.div
                className="bg-title"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 0.1 }}
                transition={{ delay: 0.2, duration: 1 }}
              >
                {CATEGORIES[index].title}
              </motion.div>

              <div className="title-stack">
                <motion.span
                  className="serial-num"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 0.5 }}
                  transition={{ delay: 0.4 }}
                >
                  {CATEGORIES[index].serial}
                </motion.span>
                <motion.h2
                  className="main-title"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  {CATEGORIES[index].title}
                </motion.h2>
                <motion.p
                  className="sub-title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 1 }}
                >
                  {CATEGORIES[index].subtitle}
                </motion.p>
              </div>
            </div>

            <motion.div
              className="duo-display"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="item-wrap main">
                <img src={CATEGORIES[index].items[0]} alt="Article Principal" />
              </div>
              <div className="item-wrap side">
                <img src={CATEGORIES[index].items[1]} alt="Article Secondaire" />
              </div>
            </motion.div>

          </motion.div>
        </AnimatePresence>

        <div className="category-action">
          <button className="btn-category-consult" onClick={() => onNavigate?.()}>
            Consulter les produits
          </button>
        </div>

        {/* Minimal Navigation */}
        <div className="pure-controls">
          <button className="pure-nav" onClick={prev}>←</button>
          <div className="pure-indicators">
            {CATEGORIES.map((_, i) => (
              <div key={i} className={`indicator ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} />
            ))}
          </div>
          <button className="pure-nav" onClick={next}>→</button>
        </div>
      </div>
    </section>
  );
};

export default PureShowcase;
