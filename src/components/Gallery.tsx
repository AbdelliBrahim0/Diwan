import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import './Gallery.css';

import img1 from '../assets/gallerie/1.png';
import img2 from '../assets/gallerie/2.png';
import img3 from '../assets/gallerie/3.png';
import img4 from '../assets/gallerie/4.png';
import img5 from '../assets/gallerie/5.png';
import img6 from '../assets/gallerie/6.png';
import img7 from '../assets/gallerie/7.png';
import img8 from '../assets/gallerie/8.png';
import img9 from '../assets/gallerie/9.png';

const IMAGES = [
  { id: 1, src: img1, serial: '001' },
  { id: 2, src: img2, serial: '002' },
  { id: 3, src: img3, serial: '003' },
  { id: 4, src: img4, serial: '004' },
  { id: 5, src: img5, serial: '005' },
  { id: 6, src: img6, serial: '006' },
  { id: 7, src: img7, serial: '007' },
  { id: 8, src: img8, serial: '008' },
  { id: 9, src: img9, serial: '009' },
];

const Gallery: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const navigate = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setCurrent(prev => (prev + dir + IMAGES.length) % IMAGES.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || lightboxOpen) return;
    const timer = setInterval(() => navigate(1), 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, lightboxOpen, navigate]);

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  const prev = IMAGES[(current - 1 + IMAGES.length) % IMAGES.length];
  const next = IMAGES[(current + 1) % IMAGES.length];

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80, scale: 0.97 }),
  };

  return (
    <>
      <section
        className="gallery-section"
        ref={sectionRef}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="gallery-bg">
          <div className="gallery-bg-glow left" />
          <div className="gallery-bg-glow right" />
          <div className="gallery-bg-pattern" />
        </div>

        <div className="gallery-container">
          <motion.div
            className="gallery-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="gallery-ornament">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#c4a77d" strokeWidth="1">
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
              </svg>
            </div>
            <span className="gallery-label">Notre Savoir-Faire</span>
            <h2 className="gallery-title">Galerie d'Excellence</h2>
            <p className="gallery-subtitle">Chaque pièce, un témoignage de l'artisanat tunisien</p>
            <div className="gallery-title-line" />
          </motion.div>

          <div className="slider-layout">
            <motion.button
              className="thumb-nav prev"
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="thumb-img-wrap">
                <img src={prev.src} alt="précédent" />
                <div className="thumb-overlay" />
              </div>
              <div className="thumb-arrow">←</div>
            </motion.button>

            <div className="hero-slide-wrap">
              <div className="slide-corner tl" />
              <div className="slide-corner tr" />
              <div className="slide-corner bl" />
              <div className="slide-corner br" />
              <div className="slide-serial">{IMAGES[current].serial}</div>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  className="hero-slide-inner"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  style={{ y: parallaxY }}
                  onClick={() => openLightbox(current)}
                >
                  <motion.img
                    src={IMAGES[current].src}
                    alt={`Diwan galerie ${IMAGES[current].serial}`}
                    className="hero-img"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="slide-shimmer" />
                  <div className="slide-hint">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                    <span>Agrandir</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="slide-progress">
                <motion.div
                  className="slide-progress-fill"
                  key={current}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 4.5, ease: 'linear' }}
                />
              </div>
            </div>

            <motion.button
              className="thumb-nav next"
              onClick={() => navigate(1)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="thumb-img-wrap">
                <img src={next.src} alt="suivant" />
                <div className="thumb-overlay" />
              </div>
              <div className="thumb-arrow">→</div>
            </motion.button>
          </div>

          <div className="gallery-dots">
            {IMAGES.map((_, i) => (
              <button
                key={i}
                className={`gallery-dot ${i === current ? 'active' : ''}`}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              />
            ))}
          </div>

          <div className="gallery-strip">
            {IMAGES.map((img, i) => (
              <motion.button
                key={img.id}
                className={`strip-thumb ${i === current ? 'active' : ''}`}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <img src={img.src} alt={`galerie ${img.serial}`} />
                <div className={`strip-overlay ${i === current ? 'active' : ''}`} />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
              <button className="lightbox-nav prev" onClick={() => setLightboxIdx(i => (i - 1 + IMAGES.length) % IMAGES.length)}>←</button>
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightboxIdx}
                  src={IMAGES[lightboxIdx].src}
                  alt="Diwan galerie"
                  className="lightbox-img"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                />
              </AnimatePresence>
              <button className="lightbox-nav next" onClick={() => setLightboxIdx(i => (i + 1) % IMAGES.length)}>→</button>
              <div className="lightbox-counter">{lightboxIdx + 1} / {IMAGES.length}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;
