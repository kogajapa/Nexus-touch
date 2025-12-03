import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Product } from '../types';
import { ArrowUpRight, X, Cpu, Maximize, Layers } from 'lucide-react';

const products: Product[] = [
  {
    id: 'ai-avatar',
    name: 'Nexus AI Avatar',
    category: 'ai-solution',
    description: 'Experiência educativa imersiva com avatares 3D responsivos em tempo real.',
    longDescription: 'Uma revolução na educação museológica. O sistema utiliza LLMs avançados para dar vida a personagens históricos ou especialistas, como o Paleontólogo "Ed". O avatar reconhece presença, mantém contato visual e responde perguntas complexas sobre o acervo em tempo real.',
    features: ['Reconhecimento de Voz', 'Avatar 3D Realista', 'Base de Conhecimento Customizável'],
    imageUrl: '/media/nexus-memorial.jpg',
    videoUrl: '/media/nexus-memorial.mp4',
    alternateVideoUrl: '/media/nexus-ai-avatar.mp4',
    specs: {
      "Processador": "Intel Core i5 + RTX 2060",
      "Display": "32\" 4K Vertical",
      "Câmera": "Sensor de presença + 4K Webcam",
      "Áudio": "Array de microfones direcionais"
    },
    caseStudy: undefined
  },
  {
    id: 'memorial',
    name: 'Nexus Memorial Interactive',
    category: 'ai-solution',
    description: 'Linhas do tempo interativas e preservação de memória corporativa.',
    longDescription: 'Solução dedicada para memoriais corporativos e museus históricos. Permite que visitantes naveguem por décadas de história através de uma interface de toque intuitiva, explorando documentos, fotos e vídeos digitalizados.',
    features: ['Timeline Infinita', 'Digitalização de Acervo', 'Multi-idioma (PT/EN)'],
    imageUrl: '/media/nexus-memorial.jpg',
    gallery: ['/media/nexus-memorial.jpg', '/media/nexus-memorial-alt.jpg'],
    specs: {
      "Interface": "Capacitiva PCAP 10 toques",
      "Resolução": "UHD 3840x2160",
      "Software": "Nexus Timeline OS",
      "Conectividade": "Cloud Sync para atualizações"
    },
    caseStudy: {
      title: "Memorial Sicredi & Monsenhor Ermínio",
      content: "Projeto para preservar a história do cooperativismo e a biografia do Monsenhor Ermínio Celso Duca. Visitantes exploram a fundação em 1990 até os dias atuais."
    }
  },
  {
    id: '1',
    name: 'Neo Slim V3',
    category: 'indoor',
    description: 'Elegância minimalista para ambientes corporativos e varejo de luxo.',
    longDescription: 'O Neo Slim V3 redefine a sinalização digital corporativa com seu perfil ultra-fino de apenas 22mm. Ideal para wayfinding em escritórios modernos ou catálogos digitais em boutiques.',
    features: ['Tela 43"', 'Ultra Fino', 'Android/Windows'],
    imageUrl: '/media/nexus-neo-slim.jpg',
    gallery: ['/media/nexus-neo-slim.jpg', '/media/nexus-neo-slim-alt.jpg'],
    specs: {
      "Brilho": "500 nits",
      "Espessura": "22mm",
      "Material": "Alumínio Anodizado",
      "OS": "Windows 11 IoT / Android 12"
    }
  },
];

const Catalog: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'ai-solution' | 'indoor'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [activeVideoSrc, setActiveVideoSrc] = useState<string | undefined>(undefined);
  const [activeImageSrc, setActiveImageSrc] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Always reset mute state and restart playback when trocar de produto
    setIsMuted(true);
    setActiveVideoSrc(selectedProduct?.videoUrl);
    setActiveImageSrc(selectedProduct?.imageUrl);
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = true;
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.play().catch(() => {});
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (modalVideoRef.current && activeVideoSrc) {
      // Force mute when alternate video is selected
      const shouldMute = selectedProduct?.alternateVideoUrl === activeVideoSrc ? true : isMuted;
      modalVideoRef.current.muted = shouldMute;
      if (shouldMute !== isMuted) {
        setIsMuted(shouldMute);
      }
      modalVideoRef.current.load();
      modalVideoRef.current.play().catch(() => {});
    }
  }, [activeVideoSrc]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

  const filteredProducts = products.filter(p => filter === 'all' || p.category === filter);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'ai-solution', label: 'IA & Museus' },
    { id: 'indoor', label: 'Indoor' },
  ];

  return (
    <section id="catalog" ref={containerRef} className="py-24 bg-[#050b1e] relative overflow-hidden min-h-screen">
       {/* Background Grid Accent com Parallax */}
       <motion.div 
         style={{ y: backgroundY, opacity: backgroundOpacity }}
         className="absolute -top-[20%] -left-[10%] -right-[10%] h-[140%] pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:60px_60px]"
       ></motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">
              Nossas <span className="text-neon-cyan">Soluções</span>
            </h2>
            <p className="text-gray-400">Do hardware robusto à inteligência artificial avançada.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id as 'all' | 'ai-solution' | 'indoor')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  filter === cat.id
                    ? 'bg-neon-cyan text-dark-bg shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedProduct(product)}
                className="group relative bg-dark-card rounded-2xl overflow-hidden border border-white/10 hover:border-neon-cyan/50 transition-all duration-500 hover:shadow-2xl hover:shadow-neon-cyan/10 cursor-pointer"
              >
                {/* Media Container (image or video) */}
                <div className="aspect-[4/5] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-80 z-10 pointer-events-none" />
                    {product.videoUrl ? (
                      <video
                        src={product.videoUrl}
                        poster={product.imageUrl}
                        muted
                        loop
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    
                    {/* Floating Badge */}
                    <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{product.category}</span>
                    </div>

                    {/* Icon Overlay on Hover */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-neon-cyan/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                         <Maximize className="w-8 h-8 text-dark-bg" />
                      </div>
                    </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2">
                        {product.name}
                        <ArrowUpRight className="w-5 h-5 text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {product.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        {product.features.map(feat => (
                            <span key={feat} className="px-2 py-1 text-xs rounded bg-white/5 text-neon-cyan border border-neon-cyan/20">
                                {feat}
                            </span>
                        ))}
                    </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedProduct(null)}
            />
            
            <motion.div
              layoutId={selectedProduct.id}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-[#0b1121] rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-neon-cyan hover:text-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Left Side: Image/Gallery */}
              <div className="w-full md:w-2/5 h-64 md:h-auto bg-black relative">
                 {selectedProduct.videoUrl ? (
                    <video
                      ref={modalVideoRef}
                      key={activeVideoSrc}
                      src={activeVideoSrc}
                      poster={selectedProduct.imageUrl}
                      muted={isMuted}
                      loop
                      autoPlay
                      playsInline
                      controls
                      className="w-full h-full object-cover opacity-90"
                    />
                 ) : (
                    <img 
                      src={activeImageSrc || selectedProduct.imageUrl} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover opacity-80"
                    />
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0b1121] via-transparent to-transparent md:bg-gradient-to-r" />
                 
                 <div
                   className="absolute left-6 right-6 flex items-center justify-between gap-3"
                   style={{ bottom: (!selectedProduct.videoUrl && selectedProduct.gallery && selectedProduct.gallery.length > 1) ? '5.5rem' : '1.5rem' }}
                 >
                   <div>
                     <h3 className="text-3xl font-display font-bold text-white mb-2 leading-tight">{selectedProduct.name}</h3>
                     <div className="flex items-center gap-2 text-neon-cyan text-sm font-mono">
                         <Cpu className="w-4 h-4" />
                          <span>Série Nexus 2024</span>
                      </div>
                    </div>
                    {selectedProduct.videoUrl && (
                      <div className="flex items-center gap-2 justify-end">
                        {selectedProduct.alternateVideoUrl && (
                          <>
                            <button
                              onClick={() => setActiveVideoSrc(selectedProduct.videoUrl)}
                              className={`px-3 py-2 rounded-full border text-sm backdrop-blur transition-all ${
                                activeVideoSrc === selectedProduct.videoUrl
                                  ? 'bg-neon-cyan text-dark-bg border-neon-cyan'
                                  : 'bg-black/60 text-white border-white/20 hover:border-neon-cyan/60 hover:text-neon-cyan'
                              }`}
                            >
                              Vídeo 1
                            </button>
                            <button
                              onClick={() => {
                                setIsMuted(true);
                                setActiveVideoSrc(selectedProduct.alternateVideoUrl!);
                              }}
                              className={`px-3 py-2 rounded-full border text-sm backdrop-blur transition-all ${
                                activeVideoSrc === selectedProduct.alternateVideoUrl
                                  ? 'bg-neon-cyan text-dark-bg border-neon-cyan'
                                  : 'bg-black/60 text-white border-white/20 hover:border-neon-cyan/60 hover:text-neon-cyan'
                              }`}
                            >
                              Vídeo 2
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            const next = !isMuted;
                            setIsMuted(next);
                            if (modalVideoRef.current) {
                              modalVideoRef.current.muted = next;
                              modalVideoRef.current.play().catch(() => {});
                            }
                          }}
                          disabled={selectedProduct.alternateVideoUrl === activeVideoSrc}
                          className={`px-3 py-2 rounded-full border text-sm backdrop-blur transition-all ${
                            selectedProduct.alternateVideoUrl === activeVideoSrc
                              ? 'bg-black/40 text-gray-500 border-white/10 cursor-not-allowed'
                              : 'bg-black/60 text-white border-white/20 hover:border-neon-cyan/60 hover:text-neon-cyan'
                          }`}
                        >
                          {isMuted ? 'Ativar som' : 'Silenciar'}
                        </button>
                      </div>
                    )}
                 </div>
                 {(!selectedProduct.videoUrl && selectedProduct.gallery && selectedProduct.gallery.length > 1) && (
                   <div className="absolute left-4 right-4 bottom-4 flex gap-2 justify-center">
                     {selectedProduct.gallery.map((img) => (
                       <button
                         key={img}
                         onClick={() => setActiveImageSrc(img)}
                         className={`h-14 w-10 overflow-hidden rounded-md border ${activeImageSrc === img ? 'border-neon-cyan' : 'border-white/10'} bg-white/5`}
                       >
                         <img src={img} alt="thumb" className="w-full h-full object-cover" />
                       </button>
                     ))}
                   </div>
                 )}
              </div>

              {/* Right Side: Details & Tabs */}
              <div className="w-full md:w-3/5 p-8 overflow-y-auto custom-scrollbar">
                 <div className="mb-8">
                    <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Visão Geral
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        {selectedProduct.longDescription || selectedProduct.description}
                    </p>
                 </div>

                 {/* Specifications Grid */}
                 {selectedProduct.specs && (
                    <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4 flex items-center gap-2">
                            <Maximize className="w-4 h-4" /> Especificações
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(selectedProduct.specs).map(([key, value]) => (
                                <div key={key}>
                                    <span className="block text-xs text-gray-500 mb-1">{key}</span>
                                    <span className="block text-white font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}

                 <div className="mt-8 flex gap-4">
                    <button className="flex-1 py-3 bg-neon-cyan hover:bg-cyan-400 text-dark-bg font-bold rounded-lg transition-colors shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        Solicitar Demonstração
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Catalog;
