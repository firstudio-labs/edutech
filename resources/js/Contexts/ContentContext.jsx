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
        whyJaggadTitleLine1: 'Platform Pembelajaran',
        whyJaggadTitleLine2: 'Terpercaya',
        whyJaggadSubtitle: 'Ribuan pelajar telah mempercayakan pengembangan skill mereka kepada JAGGAD ACADEMY.',
        ctaBannerTitle: 'Siap Tingkatkan Skill Anda?',
        ctaBannerDesc: 'Bergabunglah dengan ribuan pelajar yang telah mengubah karir mereka bersama JAGGAD ACADEMY.',
        ctaBannerBtn: 'Mulai Belajar Sekarang',
        features: [
            { icon: 'Zap', title: 'Akses Instan', desc: 'Nikmati produk digital Anda segera setelah pembayaran berhasil, tanpa menunggu.' },
            { icon: 'Shield', title: 'Akses Seumur Hidup', desc: 'Satu kali beli, akses selamanya. Termasuk semua update konten di masa mendatang.' },
            { icon: 'Award', title: 'Dijamin Berkualitas', desc: 'Semua materi dikurasi oleh para expert dengan pengalaman industri yang terbukti.' },
        ]
    },
    about: {
        heroTitle: 'Mencerdaskan Generasi Digital',
        heroDesc: 'JAGGAD ACADEMY adalah platform edukasi digital yang berfokus pada pengembangan skill praktis bagi mahasiswa, profesional, dan entrepreneur di Indonesia.',
        storyTitle: 'Cerita di Balik JAGGAD',
        storyP1: 'Berawal dari keresahan akan tingginya kesenjangan antara kurikulum akademis dengan kebutuhan industri digital yang sangat cepat berubah.',
        storyP2: 'JAGGAD ACADEMY lahir untuk menjadi jembatan bagi mereka yang ingin belajar langsung dari praktisi, menggunakan materi yang up-to-date dan metode yang fleksibel.',
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
            { label: 'Tingkat Kepuasan', value: '98%', icon: 'Target' },
            { label: 'Mentor Expert', value: '25+', icon: 'Award' }
        ],
        milestones: [
            { year: '2021', text: 'JAGGAD ACADEMY berdiri dengan 3 produk pertama' },
            { year: '2022', text: 'Meraih 1.000 pelajar aktif pertama' },
            { year: '2023', text: 'Ekspansi ke kelas offline dan webinar live' },
            { year: '2024', text: '5.200+ pelajar aktif, 50+ produk tersedia' }
        ]
    },
    contact: {
        title: 'Ada Pertanyaan? Kami Siap Membantu',
        subtitle: 'Tim kami siap menjawab pertanyaan Anda seputar produk, metode pembelajaran, atau kerjasama strategis lainnya.',
        email: 'halo@jaggad.id',
        phone: '+62 812 3456 7890',
        address: 'Gedung JAGGAD Digital Hub, Lt. 5, Jl. Sudirman No. 123, Jakarta Selatan',
        mapsUrl: 'https://maps.app.goo.gl/jaggad.academy-example'
    },
    ads: {
        heroTitle: 'Bongkar Rahasia Bisnis Beromset Ratusan Juta',
        heroSubtitle: 'Pelajari strategi digital yang telah terbukti langsung dari praktisinya. Kuasai pasar sekarang juga!',
        videoUrl: '',
        selectedProductIds: [1]
    },
    social: {
        instagram: 'https://instagram.com/jaggad',
        youtube: 'https://youtube.com/@jaggad',
        twitter: 'https://twitter.com/jaggad'
    },
    branding: {
        siteName: 'JAGGAD',
        siteTagline: 'Academy',
        favicon: '',
        logo: '',
    },
    checkout: {
        introTitle: 'Apakah Anda Siap Mengubah Karir Anda?',
        introSubtitle: 'Setiap pelajar sukses dimulai dari satu langkah yang berani. Hari ini, Anda sudah di sini — itu adalah langkah terbaik.',
        introQuote: '"Investasi terbaik adalah investasi pada ilmu pengetahuan. Dan ilmu yang tepat bisa mengubah hidup Anda selamanya."',
        introStats: [
            { icon: 'ShieldCheck', value: 'Akses Selamanya', label: 'Lifetime Access' },
            { icon: 'Clock', value: '24/7', label: 'Dukungan Teknis' },
        ],
        problemSectionTitle: 'Apakah Anda merasakan ini?',
        problemIcon: 'Zap',
        problems: [
            'Merasa tertinggal di era digital yang bergerak cepat',
            'Skill yang belum relevan dengan kebutuhan industri',
            'Bingung mulai dari mana untuk meningkatkan penghasilan',
            'Belajar sendiri tapi tidak tahu mana yang benar'
        ],
        explanationTitle: 'Mengapa Ini Penting untuk Anda?',
        explanationHeading: 'Perjalanan Belajar yang Telah Terbukti',
        journeySteps: [
            { num: '01', title: 'Dapatkan Fondasi yang Kuat', desc: 'Mulai dari dasar yang tepat agar setiap langkah selanjutnya menjadi lebih mudah dan efektif.' },
            { num: '02', title: 'Praktik Langsung dengan Studi Kasus Nyata', desc: 'Bukan hanya teori — setiap materi dilengkapi contoh nyata dari praktisi industri berpengalaman.' },
            { num: '03', title: 'Bangun Portfolio yang Mengesankan', desc: 'Terapkan ilmu untuk menciptakan karya nyata yang bisa ditunjukkan kepada klien atau perusahaan.' },
            { num: '04', title: 'Raih Hasil yang Terukur', desc: 'Ikuti jalur yang telah membantu ribuan peserta mendapatkan pekerjaan baru atau meningkatkan penghasilan.' },
        ],
        preCheckoutHeading: 'Anda Selangkah Lagi! 🎉',
        preCheckoutUrgency: '🔥 Penawaran terbatas! Harga ini hanya berlaku hari ini.',
        preCheckoutIncludes: [
            'Akses seumur hidup ke semua materi',
            'Sertifikat penyelesaian resmi',
            'Garansi uang kembali 7 hari',
            'Update materi gratis selamanya',
            'Akses komunitas eksklusif peserta'
        ],
        faqs: [
            { q: 'Apakah saya mendapat akses seumur hidup?', a: 'Ya! Setelah membeli, akses produk ini tidak akan pernah kedaluwarsa.' },
            { q: 'Apakah ada garansi uang kembali?', a: 'Kami memberikan garansi uang kembali 7 hari penuh jika Anda tidak puas.' },
            { q: 'Apakah ada sertifikat?', a: 'Ya, tersedia sertifikat penyelesaian yang dapat Anda tambahkan ke LinkedIn.' },
            { q: 'Bagaimana cara mengakses setelah membeli?', a: 'Setelah pembayaran berhasil, produk langsung dapat diakses di dashboard Anda.' },
        ]
    },
    ads: {
        ctaSubtitle: 'Berakhir Dalam 15 Menit'
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
            const saved = localStorage.getItem('jaggad_content');
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
        localStorage.setItem('jaggad_content', JSON.stringify(content));
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
