import React from 'react';
import { motion } from 'framer-motion';
import { Hand, ShieldCheck, MonitorSmartphone, Sparkles } from 'lucide-react';
import { FeatureCard } from '../types';

const features: FeatureCard[] = [
  {
    title: 'Gestos Inteligentes',
    description: 'Reconhecimento avançado de gestos com as mãos, oferecendo acessibilidade completa para pessoas com deficiência visual através de navegação por voz e feedback tátil.',
    icon: Hand,
  },
  {
    title: 'Estrutura Premium',
    description: 'Totens desenvolvidos com materiais de alta resistência, garantindo robustez e durabilidade excepcionais para ambientes de alto fluxo.',
    icon: ShieldCheck,
  },
  {
    title: 'Displays Ultra HD',
    description: 'Telas touchscreen de última geração em altíssima definição, disponíveis de 32 a 55 polegadas, com tecnologia multi-touch responsiva e precisão milimétrica.',
    icon: MonitorSmartphone,
  },
  {
    title: 'Inovação Contínua',
    description: 'Tecnologia de vanguarda com processamento em nuvem, inteligência artificial embarcada e atualizações constantes para manter seu totem sempre à frente.',
    icon: Sparkles,
  },
];

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-dark-bg relative">
      {/* Fade superior para transição fluida (mesmo efeito do bottom da hero) */}
      <div className="pointer-events-none absolute inset-0 z-30">
        <div
          className="absolute inset-x-0 top-0 bg-gradient-to-b from-black via-black/100 to-transparent"
          style={{ height: '20%' }}
        ></div>
      </div>
      <div className="relative z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              A Diferença <span className="text-neon-cyan">Nexus</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Na Nexus Touch, fundimos engenharia de precisão com design imersivo. Nossos totens não são apenas máquinas; são pontos de contato sensoriais que elevam sua marca.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative p-8 rounded-xl bg-dark-card border border-white/5 overflow-hidden hover:border-neon-cyan/30 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-neon-cyan/10 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-neon-cyan transition-colors" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default About;
