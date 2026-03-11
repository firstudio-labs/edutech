import { createContext, useContext, useState, useEffect } from 'react';

const defaultContent = {
    home: {
        heroBadge: 'Platform Digital Learning #1 Indonesia',
        heroTitleLine1: 'Kuasai Skill Digital,',
        heroTitleLine2: 'Akselerasi Karir Anda',
        heroSubtitle: 'Pelajari keterampilan digital terbaru dari para mentor berpengalaman. Ebook, Video Kelas, Webinar, dan Kelas Offline tersedia untuk membantu perjalanan sukses Anda.',
        ctaPrimary: 'Jelajahi Produk',
        ctaSecondary: 'Lihat Paket Bundling',
        proofText: 'Bergabung dengan 5.200+ pelajar yang telah meningkatkan skill mereka',
        catTitlePrefix: 'Berbagai Format',
        catTitleAccent: 'Pembelajaran',
        featuredTitlePrefix: 'Pilihan',
        featuredTitleAccent: 'Terbaik',
        whySagaTitleLine1: 'Platform Pembelajaran',
        whySagaTitleLine2: 'Terpercaya',
        whySagaSubtitle: 'Ribuan pelajar telah mempercayakan pengembangan skill mereka kepada SAGA Academy.',
        ctaBannerTitle: 'Siap Tingkatkan Skill Anda?',
        ctaBannerDesc: 'Bergabunglah dengan ribuan pelajar yang telah mengubah karir mereka bersama SAGA Academy.',
        ctaBannerBtn: 'Mulai Belajar Sekarang'
    },
    about: {
        heroTitle: 'Mencerdaskan Generasi Digital',
        heroDesc: 'SAGA Academy adalah platform edukasi digital yang berfokus pada pengembangan skill praktis bagi mahasiswa, profesional, dan entrepreneur di Indonesia.',
        storyTitle: 'Cerita di Balik SAGA',
        storyP1: 'Berawal dari keresahan akan tingginya kesenjangan antara kurikulum akademis dengan kebutuhan industri digital yang sangat cepat berubah.',
        storyP2: 'SAGA Academy lahir untuk menjadi jembatan bagi mereka yang ingin belajar langsung dari praktisi, menggunakan materi yang up-to-date dan metode yang fleksibel.',
        visionTitle: 'Visi',
        visionDesc: 'Menjadi platform pembelajaran digital terdepan di Indonesia yang melahirkan generasi profesional kompeten dan siap bersaing di era global.',
        missionTitle: 'Misi',
        missions: [
            'Menyediakan konten pembelajaran berkualitas tinggi yang praktis dan langsung dapat diterapkan',
            'Membangun ekosistem pelajar yang saling mendukung dan mendorong pertumbuhan',
            'Berkolaborasi dengan para profesional terbaik sebagai mentor',
            'Terus berinovasi dalam metode pembelajaran digital'
        ],
        achievements: [
            { label: 'Alumni Sukses', value: '10.000+', icon: 'Users' },
            { label: 'Produk Digital', value: '50+', icon: 'BookOpen' },
            { label: 'Tingkat Kepuasan', value: '98%', icon: 'Target' }
        ],
        milestones: [
            { year: '2021', text: 'SAGA Academy berdiri dengan 3 produk pertama' },
            { year: '2022', text: 'Meraih 1.000 pelajar aktif pertama' },
            { year: '2023', text: 'Ekspansi ke kelas offline dan webinar live' },
            { year: '2024', text: '5.200+ pelajar aktif, 50+ produk tersedia' }
        ]
    },
    contact: {
        title: 'Ada Pertanyaan? Kami Siap Membantu',
        subtitle: 'Tim kami siap menjawab pertanyaan Anda seputar produk, metode pembelajaran, atau kerjasama strategis lainnya.',
        email: 'halo@sagaacademy.id',
        phone: '+62 812 3456 7890',
        address: 'Gedung SAGA Digital Hub, Lt. 5, Jl. Sudirman No. 123, Jakarta Selatan',
        mapsUrl: 'https://maps.app.goo.gl/saga-academy-example'
    },
    ads: {
        heroTitle: 'Bongkar Rahasia Bisnis Beromset Ratusan Juta',
        heroSubtitle: 'Pelajari strategi digital yang telah terbukti langsung dari praktisinya. Kuasai pasar sekarang juga!',
        videoUrl: '',
        selectedProductIds: [1]
    },
    social: {
        instagram: 'https://instagram.com/sagaacademy',
        youtube: 'https://youtube.com/@sagaacademy',
        twitter: 'https://twitter.com/sagaacademy'
    }
};

const ContentContext = createContext();

export function ContentProvider({ children, initialData }) {
    const mergeData = (base, source) => {
        if (!source) return base;
        const merged = { ...base };
        Object.keys(source).forEach(key => {
            if (merged[key] && typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
                merged[key] = { ...merged[key], ...source[key] };
            } else {
                merged[key] = source[key];
            }
        });
        return merged;
    };

    const [content, setContent] = useState(() => {
        let source = initialData;
        if (!source) {
            const saved = localStorage.getItem('saga_content');
            if (saved) {
                try {
                    source = JSON.parse(saved);
                } catch (e) {
                    source = null;
                }
            }
        }
        return mergeData(defaultContent, source);
    });

    useEffect(() => {
        if (initialData) {
            setContent(prev => mergeData(prev, initialData));
        }
    }, [initialData]);

    useEffect(() => {
        localStorage.setItem('saga_content', JSON.stringify(content));
    }, [content]);

    const updateContent = (page, key, value) => {
        setContent(prev => ({
            ...prev,
            [page]: { ...prev[page], [key]: value }
        }));
    };

    return (
        <ContentContext.Provider value={{ content, updateContent }}>
            {children}
        </ContentContext.Provider>
    );
}

export const useContent = () => useContext(ContentContext);
