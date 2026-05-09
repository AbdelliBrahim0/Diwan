import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductGrid.css';
import { API_URL } from '../lib/api';

export const PRODUCTS = [];

interface Product {
  id: number;
  name: string;
  rental_price: number;
  sale_price: number;
  description: string;
  img_url: string;
  img_url2?: string | null;
  is_available: boolean;
  category_ids: number[];
  subcategory_ids: number[];
  collection_ids: number[];
}

interface DisplayProduct {
  id: number;
  name: string;
  rent: string;
  sell: string;
  image: string;
  desc: string;
  category_ids?: number[];
  subcategory_ids?: number[];
  collection_ids?: number[];
  is_available?: boolean;
}

interface ProductGridProps {
  onNavigate?: () => void
}

const ProductGrid: React.FC<ProductGridProps> = ({ onNavigate }) => {
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  // Fetch products from API on mount
  useEffect(() => {
    void (async () => {
      try {
        const [productsRes, categoriesRes, subcategoriesRes, collectionsRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/subcategories`),
          fetch(`${API_URL}/collections`),
        ]);

        const productsData = (productsRes.ok ? await productsRes.json() : []) as Product[];
        const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
        const subcategoriesData = subcategoriesRes.ok ? await subcategoriesRes.json() : [];
        const collectionsData = collectionsRes.ok ? await collectionsRes.json() : [];

        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
        setCollections(collectionsData);

        // Convert and randomize products
        let products: DisplayProduct[] = (productsData || [])
          .filter((p: Product) => p.is_available)
          .map((p: Product) => ({
            id: p.id,
            name: p.name,
            rent: String(p.rental_price),
            sell: String(p.sale_price),
            image: p.img_url,
            desc: p.description,
            category_ids: p.category_ids,
            subcategory_ids: p.subcategory_ids,
            collection_ids: p.collection_ids,
            is_available: p.is_available,
          }));

        // Shuffle randomly
        products = products.sort(() => Math.random() - 0.5);

        // Take first 6
        setDisplayProducts(products.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setDisplayProducts([]);
      }
    })();
  }, []);

  const handleAddToCart = (product: any, type: 'rent' | 'sell') => {
    const cart = JSON.parse(localStorage.getItem('diwan_cart') || '[]') as any[];
    const price = type === 'rent' ? product.rent : product.sell;
    const source = 'Catalogue';
    
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
        price: price,
        image: product.image,
        quantity: 1,
        source: source
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

  return (
    <section className="creative-grid-section">
      <div className="container">
        <motion.div 
          className="creative-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="ornament-top">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c4a77d" strokeWidth="1">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
            </svg>
          </div>
          <span className="subtitle">L'Élégance Héritée</span>
          <h2 className="title">Pièces Maîtresses</h2>
          <div className="header-divider"></div>
        </motion.div>

        <div className="creative-products-container">
          {displayProducts.map((product, idx) => (
            <motion.div 
              key={product.id}
              className="creative-card clickable"
              onClick={() => setSelectedProduct(product)}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: idx * 0.1 }}
            >
              <div className="creative-card-inner">
                {/* Traditional Border Corners */}
                <div className="corner-deco top-left"></div>
                <div className="corner-deco top-right"></div>
                <div className="corner-deco bottom-left"></div>
                <div className="corner-deco bottom-right"></div>

                <div className="card-image-box">
                  <div className="image-aura"></div>
                  <img src={product.image} alt={product.name} />
                  <div className="action-overlay hint">
                    <span className="discover-hint">Découvrir l'œuvre</span>
                  </div>
                </div>

                <div className="card-details">
                  <span className="brand-tag">Diwan Elite</span>
                  <h3 className="creative-name">{product.name}</h3>
                  
                  <div className="fancy-divider">
                    <div className="fancy-line"></div>
                    <div className="fancy-diamond"></div>
                    <div className="fancy-line"></div>
                  </div>

                  <div className="creative-pricing">
                    <div className="price-block">
                      <span className="p-label">Location</span>
                      <span className="p-value">{product.rent} <small>DT</small></span>
                    </div>
                    <div className="price-separator"></div>
                    <div className="price-block highlight">
                      <span className="p-label">Vente</span>
                      <span className="p-value gold">{product.sell} <small>DT</small></span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="creative-footer">
          <button className="btn-discover-all" onClick={() => onNavigate?.() }>
            <span className="text">Consulter tout</span>
          </button>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            className="product-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div 
              className="product-modal-content"
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedProduct(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <div className="modal-grid">
                <div className="modal-image-col">
                  <div className="modal-image-wrapper">
                    <div className="modal-aura"></div>
                    <img src={selectedProduct.image} alt={selectedProduct.name} />
                  </div>
                </div>
                
                <div className="modal-info-col">
                  <div className="modal-header">
                    <span className="modal-brand">Diwan Elite</span>
                    <h2 className="modal-title">{selectedProduct.name}</h2>
                    <div className="fancy-divider left">
                      <div className="fancy-diamond"></div>
                      <div className="fancy-line"></div>
                    </div>
                  </div>

                  <div className="modal-desc">
                    <p>{selectedProduct.desc}</p>
                  </div>

                  {/* Additional Info */}
                  <div className="modal-info-section">
                    {selectedProduct.category_ids && selectedProduct.category_ids.length > 0 && (
                      <div className="info-item">
                        <span className="info-label">Catégorie</span>
                        <span className="info-value">
                          {selectedProduct.category_ids
                            .map((id) => categories.find((c) => c.id === id)?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {selectedProduct.subcategory_ids && selectedProduct.subcategory_ids.length > 0 && (
                      <div className="info-item">
                        <span className="info-label">Sous-catégorie</span>
                        <span className="info-value">
                          {selectedProduct.subcategory_ids
                            .map((id) => subcategories.find((sc) => sc.id === id)?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {selectedProduct.collection_ids && selectedProduct.collection_ids.length > 0 && (
                      <div className="info-item">
                        <span className="info-label">Collection</span>
                        <span className="info-value">
                          {selectedProduct.collection_ids
                            .map((id) => collections.find((col) => col.id === id)?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    <div className="action-card rent">
                      <div className="action-price">
                        <span className="action-label">Louer pour</span>
                        <span className="action-val">{selectedProduct.rent} <small>DT</small></span>
                      </div>
                      <button 
                        className={`btn-modal-action ${justAdded === 'rent' ? 'success' : ''}`}
                        onClick={() => handleAddToCart(selectedProduct, 'rent')}
                      >
                        {justAdded === 'rent' ? 'Ajouté ✔' : 'Ajouter au Panier'}
                      </button>
                    </div>

                    <div className="action-card sell">
                      <div className="action-price">
                        <span className="action-label">Acquérir pour</span>
                        <span className="action-val gold">{selectedProduct.sell} <small>DT</small></span>
                      </div>
                      <button 
                        className={`btn-modal-action primary ${justAdded === 'sell' ? 'success' : ''}`}
                        onClick={() => handleAddToCart(selectedProduct, 'sell')}
                      >
                        {justAdded === 'sell' ? 'Ajouté ✔' : 'Ajouter au Panier'}
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
};

export default ProductGrid;
