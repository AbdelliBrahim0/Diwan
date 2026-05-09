import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import shootingImg1 from '../assets/Shooting/7.png';
import shootingImg2 from '../assets/Shooting/ChatGPT Image 9 mai 2026, 13_32_04.png';
import shootingImg3 from '../assets/Shooting/ChatGPT Image 9 mai 2026, 13_34_21.png';
import shootingImg4 from '../assets/Shooting/ChatGPT Image 9 mai 2026, 13_36_39.png';
import './CatalogHero.css';

interface Props {
  onBack?: () => void;
  visibleCount: number;
  totalCount: number;
}

const SLIDES = [
  {
    image: shootingImg1,
    kicker: 'Catalogue Diwan',
    title: 'Pièces d\'exception, sélectionnées avec caractère',
    description: 'Une collection pensée pour celles qui portent l\'élégance comme un art de vivre.',
  },
  {
    image: shootingImg2,
    kicker: 'Collection Premium',
    title: 'Savoir-faire traditionnel',
    description: 'Chaque pièce raconte une histoire de passion et d\'authenticité.',
  },
  {
    image: shootingImg3,
    kicker: 'Style Intemporel',
    title: 'L\'art de s\'habiller',
    description: 'Des créations qui transcendent les saisons et les tendances.',
  },
  {
    image: shootingImg4,
    kicker: 'Exclusivité',
    title: 'Raffinement et distinction',
    description: 'Pour celles qui reconnaissent la vraie valeur du luxe discret.',
  },
];

export default function CatalogHero({ onBack, visibleCount, totalCount }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const slide = SLIDES[currentSlide];

  return (
    <header className="catalog-hero-carousel">
      {/* Background Image Carousel */}
      <div className="hero-bg-container">
        <AnimatePresence mode="fade">
          <motion.div
            key={currentSlide}
            className="hero-bg-image"
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
        <div className="hero-bg-overlay" />
      </div>

      {/* Navigation Button */}
      <button className="catalog-back-carousel" onClick={() => onBack?.()}>
        ← Retour
      </button>

      {/* Content Overlay */}
      <div className="hero-content-carousel">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="hero-text-block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            <span className="hero-kicker-carousel">{slide.kicker}</span>
            <h1 className="hero-title-carousel">{slide.title}</h1>
            <p className="hero-subtitle-carousel">{slide.description}</p>

            <motion.button
              className="hero-cta-carousel"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Découvrir la collection ↓
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="hero-dots-carousel">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`dot-carousel ${idx === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <button className="hero-nav-arrow hero-nav-prev" onClick={prevSlide} aria-label="Previous slide">
        ‹
      </button>
      <button className="hero-nav-arrow hero-nav-next" onClick={nextSlide} aria-label="Next slide">
        ›
      </button>
    </header>
  );
}
