import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Search, SlidersHorizontal, BookOpen, Zap } from 'lucide-react';
import { products } from '../../Data/products';
import { categories as categoriesData } from '../../Data/categories';
import ProductCard from '../../Components/ProductCard';
import { useCart } from '../../Contexts/CartContext';
import MainLayout from '../../Layouts/MainLayout';
import './Products.css';

const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Harga: Rendah ke Tinggi' },
    { value: 'newest', label: 'Terbaru' },
    { value: 'popular', label: 'Terpopuler' },
    { value: 'price_low', label: 'Harga Terendah' },
];

export default function Products({ products = [], categories: categoriesData = [] }) {
    const { props } = usePage();
    const initCat = props.category || 'all';
    const [activeCategory, setActiveCategory] = useState(initCat);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default');

    const categories = [{ id: 'all', slug: 'all', name: 'Semua', label: 'Semua' }, ...categoriesData.map(c => ({...c, label: c.name, id: c.slug}))];

    // Fallback to imported mock products if database is empty for UI testing
    const displayProducts = products.length > 0 ? products : [];

    const filtered = displayProducts
        .filter(p => activeCategory === 'all' || p.category?.slug === activeCategory)
        .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.short_description?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sort === 'price-asc') return a.price - b.price;
            if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
            if (sort === 'popular') return b.sold_count - a.sold_count;
            if (sort === 'price_low') return a.price - b.price;
            return 0;
        });

    return (
        <MainLayout>
            <Head title="Katalog Produk - JAGGAD ACADEMY" />
            <div className="products-page">
                <div className="products-header section-dark">
                    <div className="container">
                        <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>
                            <BookOpen size={14} /> Katalog Produk
                        </p>
                        <h1 className="products-title">Semua <span className="text-gradient">Produk</span></h1>
                        <p className="products-subtitle">Temukan produk digital yang sesuai dengan kebutuhan dan tujuan belajar Anda.</p>
                    </div>
                </div>

                <div className="container products-main">
                    {/* Filters */}
                    <div className="products-filters">
                        <div className="search-wrap">
                            <Search size={17} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="categories-tabs">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="sort-wrap">
                            <SlidersHorizontal size={15} />
                            <select value={sort} onChange={e => setSort(e.target.value)} className="sort-select">
                                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="results-info">
                        <span className="results-count">{filtered.length} produk ditemukan</span>
                        {activeCategory !== 'all' && (
                            <button className="clear-filter" onClick={() => setActiveCategory('all')}>
                                Hapus filter ×
                            </button>
                        )}
                    </div>

                    {/* Grid */}
                    {filtered.length > 0 ? (
                        <div className="products-grid">
                            {filtered.map(product => (
                                <ProductCard key={product.id} product={product} className="card-red" />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>😕 Tidak ada produk yang ditemukan.</p>
                            <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="btn-reset">
                                Reset pencarian
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
