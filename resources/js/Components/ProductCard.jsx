import { Link, router } from '@inertiajs/react';
import { ArrowRight, Star, BookOpen, Video, Mic, MapPin } from 'lucide-react';
import { formatCurrency, getCategoryLabel, getStorageUrl } from '../Utils/helpers';
import './ProductCard.css';

const categoryIcons = {
    ebook: BookOpen,
    video: Video,
    webinar: Mic,
    offline: MapPin,
};

export default function ProductCard({ product }) {
    // Determine properties securely (compatible with DB fields & Mock data)
    const categorySlug = product.category?.slug || product.category || 'ebook';
    const CatIcon = categoryIcons[categorySlug] || BookOpen;
    const title = product.name || product.title;
    const desc = product.short_description || product.description;
    const image = getStorageUrl(product.image || product.thumbnail);
    const price = product.price;
    const originalPrice = product.normal_price || product.originalPrice;
    
    // Auto-calculate discount if DB doesn't have it natively
    const discount = product.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

    const goToDetail = () => router.get(route('products.detail', product.id || product.slug));

    return (
        <div 
            className="product-card" 
            onClick={goToDetail} 
            role="button" 
            tabIndex={0} 
            onKeyDown={e => e.key === 'Enter' && goToDetail()}
            aria-label={`Lihat detail ${title}`}
        >
            <div className="product-card__image-wrap">
                <img
                    src={image}
                    alt={title}
                    className="product-card__image"
                    loading="lazy"
                />
                {(product.badge || 'Baru') && (
                    <span className="product-card__badge">
                        {product.badge || 'Baru'}
                    </span>
                )}
                {discount > 0 && (
                    <span className="product-card__discount">-{discount}%</span>
                )}
                <div className="product-card__overlay">
                    <span className="overlay-text">Lihat Detail →</span>
                </div>
            </div>

            <div className="product-card__body">
                <div className="product-card__category">
                    <CatIcon size={12} />
                    <span>{getCategoryLabel(categorySlug)}</span>
                </div>

                <h3 className="product-card__title">{title}</h3>
                <p className="product-card__desc">{desc}</p>

                <div className="product-card__footer">
                    <div className="product-card__price">
                        <span className="price-current">{formatCurrency(price)}</span>
                        {originalPrice > price && (
                            <span className="price-original">{formatCurrency(originalPrice)}</span>
                        )}
                    </div>


                    <button
                        className="product-card__btn-detail"
                        onClick={(e) => {
                            e.stopPropagation();
                            goToDetail();
                        }}
                    >
                        Lihat Detailnya <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
