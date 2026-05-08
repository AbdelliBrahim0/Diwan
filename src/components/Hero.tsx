import React, { useState, useEffect } from 'react';
import './Hero.css';
import heroVideo from '../assets/hero.webm';

const Hero: React.FC = () => {
  const phrases = [
    "انت تختار واحنا نجيوك لباب الدار",
    "نقيسولك ونلبسوك على كيفك",
    "vente - بيع - location - كراء",
    "L'excellence s'invite chez vous : Mesures et essayages à domicile.",
    "Du Marié à l'invité : Dominez l'événement avec une allure sur mesure."
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % phrases.length);
        setIsVisible(true);
      }, 800); // Wait for fade out
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <div className="hero-video-container">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="hero-video"
        >
          <source src={heroVideo} type="video/webm" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content container">
        <h1 className="hero-title">
          <span className="title-en">DIWAN</span>
          <span className="title-ar">ديوان</span>
        </h1>
        <div className={`hero-subtitle-container ${isVisible ? 'fade-in' : 'fade-out'}`}>
          <p className={`hero-subtitle ${/[ء-ي]/.test(phrases[currentIdx]) ? 'arabic' : ''}`}>
            {phrases[currentIdx]}
          </p>
        </div>
        <div className="hero-cta">
          <a href="#collection" className="btn btn-primary">Explorer la Collection</a>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <div className="arrows">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
