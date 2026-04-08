import { Head } from '@inertiajs/react';
import { 
    Users, Target, Eye, BookOpen, Award, CheckCircle, Zap, Shield, 
    Video, Mic, MessageSquare, Globe, Star, Heart, Rocket, Trophy, Lightbulb, TrendingUp 
} from 'lucide-react';
import { useContent } from '../../Contexts/ContentContext';
import MainLayout from '../../Layouts/MainLayout';
import './About.css';

export default function About({ previewMode = false }) {
    const { content } = useContent();
    const about = content?.about || {};

    const iconMap = {
        Users, Target, Eye, BookOpen, Award, Zap, Shield, CheckCircle,
        Video, Mic, MessageSquare, Globe, Star, Heart, Rocket, Trophy, Lightbulb, TrendingUp
    };

    const PageContent = (
        <div className="about-page">
            <Head title="Tentang Kami - JAGGAD ACADEMY" />
            <div className="about-hero section-dark">
                <div className="about-hero__glow" />
                <div className="container">
                    <div className="about-hero__content">
                        <p className="section-label">Tentang Kami</p>
                        <h1 className="about-title">Misi Kami: <span className="text-gradient">{about.heroTitle}</span></h1>
                        <p className="about-desc">{about.heroDesc}</p>
                    </div>
                </div>
            </div>

            <div className="container about-main">
                {/* Story */}
                <section className="about-section story-section">
                    <div className="story-text">
                        <h2 className="about-section-title">{about.storyTitle}</h2>
                        <p>{about.storyP1}</p>
                        <p>{about.storyP2}</p>
                    </div>
                    <div className="story-visual">
                        {(about.milestones || []).map((ms, idx) => (
                            <div key={idx} className="story-card">
                                <div className="story-card__year">{ms.year}</div>
                                <p>{ms.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Vision & Mission */}
                <section className="about-section vm-section section-light-red" style={{ padding: 'var(--space-12) var(--space-6)', margin: '0 calc(-1 * var(--space-6))', borderRadius: 'var(--radius-xl)' }}>
                    <div className="vm-card">
                        <div className="vm-icon"><Eye size={28} /></div>
                        <h3>{about.visionTitle}</h3>
                        <p>{about.visionDesc}</p>
                    </div>
                    <div className="vm-card">
                        <div className="vm-icon"><Target size={28} /></div>
                        <h3>{about.missionTitle}</h3>
                        <ul className="mission-list-refined">
                            {about.missions?.map((m, idx) => (
                                <li key={idx} className="mission-item">
                                    <div className="mission-check-icon">
                                        <CheckCircle size={16} />
                                    </div>
                                    <span className="mission-text">{m}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Achievements */}
                <section className="about-section">
                    <h2 className="about-section-title text-center">JAGGAD dalam Angka</h2>
                    <div className="achievements-grid">
                        {(about.achievements || []).map(({ icon, value, label }, idx) => {
                            const IconComp = iconMap[icon] || Award;
                            return (
                                <div key={idx} className="achievement-card">
                                    <div className="achievement-icon"><IconComp size={24} /></div>
                                    <div className="achievement-value">{value}</div>
                                    <div className="achievement-label">{label}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );

    if (previewMode) return PageContent;

    return (
        <MainLayout>
            {PageContent}
        </MainLayout>
    );
}
