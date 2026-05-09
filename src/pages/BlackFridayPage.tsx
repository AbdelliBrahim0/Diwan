import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { API_URL } from '../lib/api';

import Footer from '../components/Footer';
import './BlackFridayPage.css';
import blackFridayAd from '../assets/graphicADS/BlackFriday.png';

interface BlackFridayPromotion {
  product_id: number;
  rental_price: number | null;
  sale_price: number | null;
}

interface BlackFridaySession {
  id: number;
  name: string;
  starts_at: string;
  ends_at: string;
  products: BlackFridayPromotion[];
}

interface Product {
  id: number;
  name: string;
  rental_price: number;
  sale_price: number;
  description: string;
  sizes: string[];
  img_url: string;
  img_url2?: string | null;
  is_available: boolean;
  category_ids: number[];
  subcategory_ids: number[];
  collection_ids: number[];
}

interface EnrichedPromoProduct extends Product {
  discountedRental: number | null;
  discountedSale: number | null;
  rentalSavings: number;
  saleSavings: number;
}

interface Props {
  onBack?: () => void;
  onExploreCatalog?: () => void;
}

const formatCurrency = (value: number) => `${Math.round(value).toLocaleString('fr-TN')} DT`;

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-TN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

const getCountdown = (targetIso: string) => {
  const target = new Date(targetIso).getTime();
  const diff = Math.max(target - Date.now(), 0);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, expired: diff === 0 };
};

const toTwoDigits = (value: number) => String(value).padStart(2, '0');



export default function BlackFridayPage({ onBack, onExploreCatalog }: Props) {
  const [sessions, setSessions] = useState<BlackFridaySession[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [eventActive, setEventActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [sessionsRes, productsRes, categoriesRes, subcategoriesRes, collectionsRes, settingRes] = await Promise.all([
          fetch(`${API_URL}/blackfridays`),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/subcategories`),
          fetch(`${API_URL}/collections`),
          fetch(`${API_URL}/event-settings/black_friday`),
        ]);

        const sessionsData = sessionsRes.ok ? (await sessionsRes.json()) as BlackFridaySession[] : [];
        const productsData = productsRes.ok ? (await productsRes.json()) as Product[] : [];
        const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
        const subcategoriesData = subcategoriesRes.ok ? await subcategoriesRes.json() : [];
        const collectionsData = collectionsRes.ok ? await collectionsRes.json() : [];
        const settingData = settingRes.ok ? await settingRes.json() : { is_active: true };

        if (!active) return;

        setEventActive(settingData.is_active);
        setSessions(sessionsData || []);
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
        setCollections(collectionsData);
        const normalizedProducts = (productsData || [])
          .filter((product) => product.is_available);

        setProducts(normalizedProducts);
      } catch (fetchError) {
        console.error(fetchError);
        if (active) setError('Impossible de charger la page Black Friday pour le moment.');
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const activeSession = useMemo(() => {
    const now = nowTick;
    const liveSession = sessions.find((session) => {
      const starts = new Date(session.starts_at).getTime();
      const ends = new Date(session.ends_at).getTime();
      return now >= starts && now <= ends;
    });

    if (liveSession) return liveSession;

    const upcomingSession = [...sessions]
      .filter((session) => new Date(session.starts_at).getTime() > now)
      .sort((left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime())[0];

    if (upcomingSession) return upcomingSession;

    return [...sessions].sort((left, right) => new Date(right.starts_at).getTime() - new Date(left.starts_at).getTime())[0] || null;
  }, [sessions, nowTick]);

  const promotedProducts = useMemo<EnrichedPromoProduct[]>(() => {
    if (!activeSession) return [];

    const productMap = new Map(products.map((product) => [product.id, product]));

    return activeSession.products
      .map((promotion) => {
        const product = productMap.get(promotion.product_id);
        if (!product) return null;

        const discountedRental = promotion.rental_price ?? null;
        const discountedSale = promotion.sale_price ?? null;
        const rentalSavings = discountedRental != null ? Math.max(product.rental_price - discountedRental, 0) : 0;
        const saleSavings = discountedSale != null ? Math.max(product.sale_price - discountedSale, 0) : 0;

        return {
          ...product,
          discountedRental,
          discountedSale,
          rentalSavings,
          saleSavings,
        };
      })
      .filter((product): product is EnrichedPromoProduct => product !== null)
      .sort((left, right) => (right.rentalSavings + right.saleSavings) - (left.rentalSavings + left.saleSavings));
  }, [activeSession, products]);

  const displayedProducts = useMemo<EnrichedPromoProduct[]>(() => {
    return promotedProducts;
  }, [promotedProducts]);

  const [selectedProduct, setSelectedProduct] = useState<EnrichedPromoProduct | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const isLiveSession = activeSession
    ? nowTick >= new Date(activeSession.starts_at).getTime() && nowTick <= new Date(activeSession.ends_at).getTime()
    : false;

  const handleAddToCart = (product: EnrichedPromoProduct, type: 'rent' | 'sell') => {
    const cart = JSON.parse(localStorage.getItem('diwan_cart') || '[]') as any[];
    const price = type === 'rent'
      ? (product.discountedRental ?? product.rental_price)
      : (product.discountedSale ?? product.sale_price);
    const source = 'Black Friday';

    const existingIndex = cart.findIndex(item => 
      item.productId === product.id && 
      item.type === type && 
      item.source === source
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        cartId: Date.now() + Math.random().toString(36).substring(2, 9),
        productId: product.id,
        name: product.name,
        type: type,
        price: String(Math.round(price)),
        image: product.img_url,
        quantity: 1,
        source: source,
        originalPrice: type === 'rent' ? product.rental_price : product.sale_price
      });
    }

    localStorage.setItem('diwan_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('itemAddedToCart'));

    setJustAdded(type);
    setTimeout(() => {
      setJustAdded(null);
    }, 1500);
  };

  const countdownTarget = activeSession
    ? isLiveSession
      ? activeSession.ends_at
      : activeSession.starts_at
    : null;

  const countdown = countdownTarget ? getCountdown(countdownTarget) : null;
  const sessionStatus = activeSession
    ? isLiveSession
      ? 'En direct'
      : nowTick < new Date(activeSession.starts_at).getTime()
        ? 'À venir'
        : 'Terminée'
    : 'Bientôt';

  const savingsCount = promotedProducts.length;
  const sessionLabel = activeSession ? activeSession.name : 'Black Friday Diwan';
  const hasPromotionDiscounts = promotedProducts.length > 0;

  if (!loading && !eventActive) {
    return (
      <section className="black-friday-page closed">
        <div className="black-friday-shell flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="closed-content glass p-12 rounded-3xl border border-white/10 max-w-2xl"
          >
            <div className="closed-icon mb-6">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#c4a77d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h2 className="text-4xl font-serif mb-4 text-[#c4a77d]">Événement Privé Terminé</h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Les sessions Black Friday sont des événements exclusifs et limités dans le temps. 
              Cette offre est actuellement fermée, mais de nouvelles opportunités d'exception s'ouvriront bientôt.
            </p>
            <button 
              onClick={onBack}
              className="bg-[#c4a77d] text-black px-10 py-4 rounded-full font-bold hover:bg-white transition-all duration-500"
            >
              Retour à la boutique
            </button>
          </motion.div>
        </div>
        <Footer />
      </section>
    );
  }

  return (
    <section className="black-friday-page">
      <div className="black-friday-noise" />
      <div className="black-friday-gradient black-friday-gradient-a" />
      <div className="black-friday-gradient black-friday-gradient-b" />

      <div className="black-friday-shell">
        <motion.header
          className="black-friday-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="black-friday-hero-copy promo-ad">
             <img src={blackFridayAd} alt="Black Friday Diwan" className="black-friday-ad-image" />
          </div>

          <motion.aside
            className="black-friday-hero-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
          >
            <div className="black-friday-status-row">
              <span className={`black-friday-status ${countdown?.expired ? 'expired' : ''}`}>
                {sessionStatus}
              </span>
              <span className="black-friday-session-name">{sessionLabel}</span>
            </div>

            <div className="black-friday-countdown">
              {countdown?.days !== undefined && countdown.days > 0 && (
                <div className="countdown-block">
                  <span>{toTwoDigits(countdown.days)}</span>
                  <small>Jours</small>
                </div>
              )}
              <div className="countdown-block">
                <span>{countdown ? toTwoDigits(countdown.hours) : '00'}</span>
                <small>Heures</small>
              </div>
              <div className="countdown-block">
                <span>{countdown ? toTwoDigits(countdown.minutes) : '00'}</span>
                <small>Minutes</small>
              </div>
              <div className="countdown-block">
                <span>{countdown ? toTwoDigits(countdown.seconds) : '00'}</span>
                <small>Secondes</small>
              </div>
            </div>

            <div className="black-friday-timing">
              <div>
                <span>Début</span>
                <strong>{activeSession ? formatDate(activeSession.starts_at) : 'À venir'}</strong>
              </div>
              <div>
                <span>Fin</span>
                <strong>{activeSession ? formatDate(activeSession.ends_at) : 'À venir'}</strong>
              </div>
            </div>

            <div className="black-friday-metrics">
              <div className="metric-card">
                <strong>{savingsCount}</strong>
                <span>Produits soldés</span>
              </div>
              <div className="metric-card">
                <strong>BF</strong>
                <span>Offres exclusives</span>
              </div>
              <div className="metric-card">
                <strong>Luxury</strong>
                <span>Diwan Elite</span>
              </div>
            </div>

            <div className="black-friday-actions">
                <button className="black-friday-primary" onClick={onExploreCatalog}>
                  Catalogue
                </button>
                <button className="black-friday-secondary" onClick={onBack}>
                  Accueil
                </button>
            </div>
          </motion.aside>
        </motion.header>

        {error && <div className="black-friday-alert">{error}</div>}

        {loading ? (
          <div className="black-friday-loading">
            <div className="loading-line" />
            <div className="loading-line short" />
          </div>
        ) : (
          <>
            <section className="black-friday-grid-section">
              <div className="section-heading compact">
                <span>Événement Exceptionnel</span>
                <h2>{displayedProducts.length} offres disponibles</h2>
              </div>

              <div className="black-friday-grid">
                <AnimatePresence>
                  {displayedProducts.map((product, index) => (
                    <motion.article
                      key={product.id}
                      className="black-product-card clickable"
                      onClick={() => setSelectedProduct(product)}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.55, delay: index * 0.08 }}
                      whileHover={{ y: -6 }}
                    >
                      <div className="black-product-image">
                        <img src={product.img_url} alt={product.name} />
                      </div>

                      <div className="black-product-body">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>

                        <div className="black-product-prices">
                          <div>
                            <span>Location</span>
                            <strong>{formatCurrency(product.discountedRental ?? product.rental_price)}</strong>
                            {product.discountedRental != null && <small>{formatCurrency(product.rental_price)}</small>}
                          </div>
                          <div>
                            <span>Vente</span>
                            <strong>{formatCurrency(product.discountedSale ?? product.sale_price)}</strong>
                            {product.discountedSale != null && <small>{formatCurrency(product.sale_price)}</small>}
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>

              {!hasPromotionDiscounts && (
                <div className="black-friday-alert">
                  L'événement Black Friday n'a pas encore commencé. Revenez bientôt pour découvrir nos offres exclusives !
                </div>
              )}
            </section>
          </>
        )}

        <Footer />
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="promo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              className="promo-modal-content"
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="promo-modal-close" onClick={() => setSelectedProduct(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="promo-modal-grid">
                <div className="promo-modal-image">
                  <img src={selectedProduct.img_url} alt={selectedProduct.name} />
                </div>
                <div className="promo-modal-info">
                  <span className="promo-modal-kicker">Collection Diwan Elite</span>
                  <h2 className="promo-modal-title">{selectedProduct.name}</h2>
                  <p className="promo-modal-desc">{selectedProduct.description}</p>

                  <div className="promo-modal-details-grid">
                    {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">Tailles</span>
                        <div className="size-chips">
                          {selectedProduct.sizes.map(s => <span key={s} className="size-chip">{s}</span>)}
                        </div>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Catégorie</span>
                      <span className="detail-value">
                        {selectedProduct.category_ids
                          .map(id => categories.find(c => c.id === id)?.name)
                          .filter(Boolean)
                          .join(', ') || 'Traditionnel'}
                      </span>
                    </div>
                    {selectedProduct.subcategory_ids.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">Sous-catégorie</span>
                        <span className="detail-value">
                          {selectedProduct.subcategory_ids
                            .map(id => subcategories.find(sc => sc.id === id)?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {selectedProduct.collection_ids.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">Collection</span>
                        <span className="detail-value">
                          {selectedProduct.collection_ids
                            .map(id => collections.find(col => col.id === id)?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="promo-modal-pricing">
                    <div className="promo-price-card">
                      <span>Prix Location</span>
                      <div className="price-stack">
                        <strong>{formatCurrency(selectedProduct.discountedRental ?? selectedProduct.rental_price)}</strong>
                        {selectedProduct.discountedRental && <small>{formatCurrency(selectedProduct.rental_price)}</small>}
                      </div>
                      <button
                        className={`promo-add-btn ${justAdded === 'rent' ? 'added' : ''}`}
                        onClick={() => handleAddToCart(selectedProduct, 'rent')}
                      >
                        {justAdded === 'rent' ? 'Ajouté !' : 'Louer'}
                      </button>
                    </div>

                    <div className="promo-price-card gold">
                      <span>Prix Vente</span>
                      <div className="price-stack">
                        <strong>{formatCurrency(selectedProduct.discountedSale ?? selectedProduct.sale_price)}</strong>
                        {selectedProduct.discountedSale && <small>{formatCurrency(selectedProduct.sale_price)}</small>}
                      </div>
                      <button
                        className={`promo-add-btn primary ${justAdded === 'sale' ? 'added' : ''}`}
                        onClick={() => handleAddToCart(selectedProduct, 'sale')}
                      >
                        {justAdded === 'sale' ? 'Ajouté !' : 'Acheter'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
