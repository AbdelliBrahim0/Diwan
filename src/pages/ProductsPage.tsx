import React, { useEffect, useMemo, useState } from 'react';
import './ProductsPage.css';
import { API_URL } from '../lib/api';

import CatalogHero from '../components/CatalogHero';
import Footer from '../components/Footer';

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

interface Category {
  id: number;
  name: string;
  subcategory_ids: number[];
}

interface SubCategory {
  id: number;
  name: string;
  category_ids: number[];
}

interface Collection {
  id: number;
  name: string;
}

interface Props {
  onBack?: () => void;
  initialCollectionId?: number | null;
}



export default function ProductsPage({ onBack, initialCollectionId }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const PRODUCTS_PER_PAGE = 12;

  const handleAddToCart = (product: Product, type: 'rent' | 'sell') => {
    const cart = JSON.parse(localStorage.getItem('diwan_cart') || '[]') as any[];
    const price = type === 'rent' ? product.rental_price : product.sale_price;
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
        price: String(Math.round(price)),
        image: product.img_url,
        quantity: 1,
        source: source,
        originalPrice: price
      });
    }

    localStorage.setItem('diwan_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('itemAddedToCart'));

    setJustAdded(`${product.id}-${type}`);
    setTimeout(() => {
      setJustAdded(null);
    }, 1500);
  };

  useEffect(() => {
    void (async () => {
      try {
        const [productsRes, categoriesRes, subcategoriesRes, collectionsRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/subcategories`),
          fetch(`${API_URL}/collections`),
        ]);

        const productsData = productsRes.ok ? await productsRes.json() : [];
        const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];
        const subcategoriesData = subcategoriesRes.ok ? await subcategoriesRes.json() : [];
        const collectionsData = collectionsRes.ok ? await collectionsRes.json() : [];

        const normalizedProducts = (productsData || []) as Product[];

        setProducts(normalizedProducts);
        setCategories((categoriesData || []) as Category[]);
        setSubcategories((subcategoriesData || []) as SubCategory[]);
        setCollections((collectionsData || []) as Collection[]);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return subcategories;
    return subcategories.filter((subcategory) => subcategory.category_ids.includes(selectedCategory));
  }, [selectedCategory, subcategories]);

  useEffect(() => {
    if (selectedSubCategory && !availableSubcategories.some((subcategory) => subcategory.id === selectedSubCategory)) {
      setSelectedSubCategory(null);
    }
  }, [availableSubcategories, selectedSubCategory]);
  
  // Handle initial collection from homepage
  useEffect(() => {
    if (initialCollectionId) {
      setSelectedCollection(initialCollectionId);
      setShowFilters(true); // Open filters so user sees the active collection
      
      // Scroll to filters or results after a short delay for data to load
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }, 500);
    }
  }, [initialCollectionId]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedSubCategory, selectedCollection, minPrice, maxPrice]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    let results = products.filter((product) => {
      if (!product.is_available) return false;
      if (normalizedSearch) {
        const haystack = [product.name, product.description].join(' ').toLowerCase();
        if (!haystack.includes(normalizedSearch)) return false;
      }
      if (selectedCategory && !product.category_ids.includes(selectedCategory)) return false;
      if (selectedSubCategory && !product.subcategory_ids.includes(selectedSubCategory)) return false;
      if (selectedCollection && !product.collection_ids.includes(selectedCollection)) return false;
      if (minPrice !== '' && product.sale_price < Number(minPrice)) return false;
      if (maxPrice !== '' && product.sale_price > Number(maxPrice)) return false;
      return true;
    });

    // Shuffle randomly if no filters are active
    const hasActiveFilters =
      search || selectedCategory || selectedSubCategory || selectedCollection || minPrice !== '' || maxPrice !== '';

    if (!hasActiveFilters) {
      results = results.sort(() => Math.random() - 0.5);
    }

    return results;
  }, [products, search, selectedCategory, selectedSubCategory, selectedCollection, minPrice, maxPrice]);

  // Paginate results
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage, PRODUCTS_PER_PAGE]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedCollection(null);
    setMinPrice('');
    setMaxPrice('');
  };

  const selectedCategoryLabel = categories.find((category) => category.id === selectedCategory)?.name;
  const selectedSubCategoryLabel = subcategories.find((subcategory) => subcategory.id === selectedSubCategory)?.name;
  const selectedCollectionLabel = collections.find((collection) => collection.id === selectedCollection)?.name;

  return (
    <section className="catalog-page">
      <div className="catalog-ambient catalog-ambient-one" />
      <div className="catalog-ambient catalog-ambient-two" />

      <div className="catalog-shell">
        <CatalogHero
          onBack={onBack}
          visibleCount={filteredProducts.length}
          totalCount={products.length}
        />

        <section className="catalog-toolbar">
          <div className="catalog-search-wrap">
            <input
              type="search"
              placeholder="Rechercher une pièce, un style, une matière..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="catalog-search"
            />
          </div>

          <div className="catalog-toolbar-actions">
            <button className="catalog-filters-button mobile-only" onClick={() => setMobileFiltersOpen((value) => !value)}>
              {mobileFiltersOpen ? 'Masquer les filtres' : 'Afficher les filtres'}
            </button>
            <button className="catalog-filters-button desktop-only" onClick={() => setShowFilters((value) => !value)}>
              {showFilters ? 'Réduire les filtres' : 'Déployer les filtres'}
            </button>
            <button className="catalog-reset" onClick={resetFilters}>Réinitialiser</button>
          </div>
        </section>

        <section className={`catalog-filters-panel ${showFilters ? 'open' : 'closed'} ${mobileFiltersOpen ? 'mobile-open' : ''}`}>
          <div className="filter-group">
            <div className="filter-label">Catégories</div>
            <div className="filter-chips">
              <button
                className={`chip ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubCategory(null);
                }}
              >
                Toutes
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`chip ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedSubCategory(null);
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-grid">
            <div className="filter-group">
              <div className="filter-label">Sous-catégories</div>
              <div className="filter-chips filter-chips-scroll">
                <button
                  className={`chip ${selectedSubCategory === null ? 'active' : ''}`}
                  onClick={() => setSelectedSubCategory(null)}
                >
                  Toutes
                </button>
                {availableSubcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    className={`chip ${selectedSubCategory === subcategory.id ? 'active' : ''}`}
                    onClick={() => setSelectedSubCategory(subcategory.id)}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-label">Collections</div>
              <div className="filter-chips filter-chips-scroll">
                <button
                  className={`chip ${selectedCollection === null ? 'active' : ''}`}
                  onClick={() => setSelectedCollection(null)}
                >
                  Toutes
                </button>
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    className={`chip ${selectedCollection === collection.id ? 'active' : ''}`}
                    onClick={() => setSelectedCollection(collection.id)}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-grid prices">
            <label className="price-field">
              <span>Prix min</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPrice as any}
                onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </label>
            <label className="price-field">
              <span>Prix max</span>
              <input
                type="number"
                min="0"
                placeholder="999"
                value={maxPrice as any}
                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </label>
          </div>

          <div className="active-filters">
            {selectedCategoryLabel && <span>{selectedCategoryLabel}</span>}
            {selectedSubCategoryLabel && <span>{selectedSubCategoryLabel}</span>}
            {selectedCollectionLabel && <span>{selectedCollectionLabel}</span>}
          </div>
        </section>

        <section className="catalog-results-head">
          <div>
            <span className="results-kicker">Sélection raffinée</span>
          </div>
          <div className="results-note">{filteredProducts.length} résultat(s)</div>
        </section>

        <section className="catalog-grid">
          {loading ? (
            <div className="catalog-loading">Chargement des pièces...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="catalog-empty">
              Aucun produit ne correspond à vos filtres.
              <button onClick={resetFilters}>Effacer les filtres</button>
            </div>
          ) : (
            paginatedProducts.map((product) => {
              const productCategoryNames = product.category_ids
                .map((id) => categories.find((category) => category.id === id)?.name)
                .filter(Boolean)
                .slice(0, 2) as string[];
              const productSubCategoryNames = product.subcategory_ids
                .map((id) => subcategories.find((subcategory) => subcategory.id === id)?.name)
                .filter(Boolean)
                .slice(0, 2) as string[];

              return (
                <article key={product.id} className="catalog-card">
                  <button className="catalog-card-media" onClick={() => setSelectedProduct(product)} type="button">
                    <div className="catalog-card-frame" />
                    <img src={product.img_url} alt={product.name} />
                    <div className="catalog-card-overlay">
                      {productSubCategoryNames[0] || 'Sous-catégorie'}
                    </div>
                  </button>

                  <div className="catalog-card-body">
                    <h3>{product.name}</h3>

                    <div className="catalog-pricing">
                      <div>
                        <span>Vente</span>
                        <strong>{product.sale_price} DT</strong>
                      </div>
                      <div>
                        <span>Location</span>
                        <strong>{product.rental_price} DT</strong>
                      </div>
                    </div>

                    <div className="catalog-actions">
                      <button 
                        className={`catalog-btn secondary ${justAdded === `${product.id}-rent` ? 'success' : ''}`} 
                        onClick={() => handleAddToCart(product, 'rent')} 
                        type="button"
                      >
                        {justAdded === `${product.id}-rent` ? 'Ajouté ✔' : 'Louer'}
                      </button>
                      <button 
                        className={`catalog-btn primary ${justAdded === `${product.id}-sell` ? 'success' : ''}`} 
                        onClick={() => handleAddToCart(product, 'sell')} 
                        type="button"
                      >
                        {justAdded === `${product.id}-sell` ? 'Ajouté ✔' : 'Acheter'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Pagination */}
        {!loading && filteredProducts.length > PRODUCTS_PER_PAGE && (
          <section className="catalog-pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Précédent
            </button>

            <div className="pagination-dots">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  className={`pagination-dot ${idx + 1 === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(idx + 1)}
                  aria-label={`Page ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Suivant →
            </button>
          </section>
        )}

        {selectedProduct && (
          <div className="catalog-modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="catalog-modal" onClick={(e) => e.stopPropagation()}>
              <button className="catalog-modal-close" onClick={() => setSelectedProduct(null)} type="button">×</button>
              <div className="catalog-modal-media">
                <img src={selectedProduct.img_url} alt={selectedProduct.name} />
              </div>
              <div className="catalog-modal-body">
                <span className="catalog-kicker">
                  {selectedProduct.subcategory_ids
                    .map((id) => subcategories.find((subcategory) => subcategory.id === id)?.name)
                    .filter(Boolean)
                    .slice(0, 1)[0] || 'Diwan'}
                </span>
                <h3>{selectedProduct.name}</h3>
                <div className="catalog-modal-tags">
                  <span className="catalog-chip gold">Disponible</span>
                  {selectedProduct.category_ids
                    .map((id) => categories.find((category) => category.id === id)?.name)
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((label) => (
                      <span key={label} className="catalog-chip">{label}</span>
                    ))}
                  {selectedProduct.subcategory_ids
                    .map((id) => subcategories.find((subcategory) => subcategory.id === id)?.name)
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((label) => (
                      <span key={label} className="catalog-chip muted">{label}</span>
                    ))}
                </div>
                <p>{selectedProduct.description}</p>
                <div className="catalog-modal-details">
                  <div>
                    <span>Catégories</span>
                    <strong>
                      {selectedProduct.category_ids
                        .map((id) => categories.find((category) => category.id === id)?.name)
                        .filter(Boolean)
                        .join(' · ') || 'Aucune'}
                    </strong>
                  </div>
                  <div>
                    <span>Sous-catégories</span>
                    <strong>
                      {selectedProduct.subcategory_ids
                        .map((id) => subcategories.find((subcategory) => subcategory.id === id)?.name)
                        .filter(Boolean)
                        .join(' · ') || 'Aucune'}
                    </strong>
                  </div>
                  <div>
                    <span>Collections</span>
                    <strong>
                      {selectedProduct.collection_ids
                        .map((id) => collections.find((collection) => collection.id === id)?.name)
                        .filter(Boolean)
                        .join(' · ') || 'Aucune'}
                    </strong>
                  </div>
                </div>
                <div className="catalog-modal-prices">
                  <div><span>Vente</span><strong>{selectedProduct.sale_price} DT</strong></div>
                  <div><span>Location</span><strong>{selectedProduct.rental_price} DT</strong></div>
                </div>
                <div className="catalog-modal-actions">
                  <button 
                    className={`catalog-btn secondary ${justAdded === `${selectedProduct.id}-rent` ? 'success' : ''}`} 
                    type="button" 
                    onClick={() => handleAddToCart(selectedProduct, 'rent')}
                  >
                    {justAdded === `${selectedProduct.id}-rent` ? 'Ajouté ✔' : 'Louer'}
                  </button>
                  <button 
                    className={`catalog-btn primary ${justAdded === `${selectedProduct.id}-sell` ? 'success' : ''}`} 
                    type="button" 
                    onClick={() => handleAddToCart(selectedProduct, 'sell')}
                  >
                    {justAdded === `${selectedProduct.id}-sell` ? 'Ajouté ✔' : 'Acheter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </section>
  );
}
