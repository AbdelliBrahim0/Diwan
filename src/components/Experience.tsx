import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Experience.css';

const steps = [
  {
    id: 1,
    title: "L'Initiation",
    subtitle: "Sélection & Réservation",
    desc: "Choisissez les pièces maîtresses sur notre site, ajoutez-les à votre panier et validez votre réservation en toute simplicité.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    ),
    align: "left"
  },
  {
    id: 2,
    title: "Le Service Privilège",
    subtitle: "Location Sur-Mesure",
    desc: "Nous nous déplaçons à votre domicile pour vous conseiller et prendre vos mesures. Le retour s'effectue également chez vous, sans le moindre effort.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    align: "right"
  },
  {
    id: 3,
    title: "L'Acquisition Royale",
    subtitle: "Achat & Livraison",
    desc: "Votre création Diwan Elite est livrée directement à votre porte, soigneusement préparée dans un écrin pour vous.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    ),
    align: "left"
  }
];

const Experience: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="experience-section" ref={containerRef}>
      {/* Background Decor */}
      <div className="exp-bg-glow top-left"></div>
      <div className="exp-bg-glow bottom-right"></div>
      
      <div className="container">
        <motion.div 
          className="experience-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1 }}
        >
          <span className="exp-subtitle">Le Processus</span>
          <h2 className="exp-title">L'Expérience Diwan</h2>
          <div className="exp-header-divider"></div>
        </motion.div>

        <div className="timeline-container">
          {/* The Golden Thread */}
          <div className="timeline-track">
            <motion.div className="timeline-fill" style={{ height: lineHeight }} />
          </div>

          <div className="timeline-steps">
            {steps.map((step, index) => (
              <div key={step.id} className={`timeline-row ${step.align}`}>
                
                {/* Node on the line */}
                <motion.div 
                  className="timeline-node"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                >
                  <div className="node-inner"></div>
                </motion.div>

                {/* Content Card */}
                <motion.div 
                  className="timeline-card-wrapper"
                  initial={{ opacity: 0, x: step.align === 'left' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                >
                  <div className="timeline-card glass-panel">
                    <div className="step-number">0{step.id}</div>
                    <div className="card-icon">
                      {step.icon}
                    </div>
                    <h3 className="card-title">{step.title}</h3>
                    <h4 className="card-subtitle">{step.subtitle}</h4>
                    <p className="card-desc">{step.desc}</p>
                    
                    <div className="card-corner top-left"></div>
                    <div className="card-corner bottom-right"></div>
                  </div>
                </motion.div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
