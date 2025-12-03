import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Sparkles } from 'lucide-react';

const AboutStory: React.FC = () => {
  return (
    <section id="about-us" className="py-24 bg-dark-bg relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-transparent to-transparent" />
        <div className="absolute right-0 top-10 w-[380px] h-[380px] rounded-full bg-neon-cyan/5 blur-[140px]" />
        <div className="absolute left-0 bottom-0 w-[320px] h-[320px] rounded-full bg-blue-500/5 blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.35em] text-neon-cyan font-semibold mb-4"
          >
            Quem Somos
          </motion.p>
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold text-white leading-tight"
          >
            Nexus Touch: hardware confiável, IA multimodal e pessoas no centro.
          </motion.h3>
          <p className="text-gray-400 mt-4 max-w-3xl mx-auto">
            Nascemos para dar voz e presença física à inteligência artificial. Cada totem, avatar ou mesa interativa que entregamos
            é construído para operar 24/7 com alta disponibilidade, segurança e UX inclusiva.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-black/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-neon-cyan" />
              <h4 className="text-xl font-display text-white">Fundação & Missão</h4>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Criada em 2023, a Nexus nasceu para materializar experiências de IA em pontos físicos: totens, avatares e mesas que
              respondem em voz, visão e texto. Nossa missão é entregar interações seguras, acessíveis e disponíveis 24/7,
              com monitoramento ativo e atualizações contínuas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-black/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-neon-cyan" />
              <h4 className="text-xl font-display text-white">Equipe & Verticais</h4>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Taffarel é CEO e lidera também a Nexus Health, focada em jornadas digitais de saúde. Leandro é CTO e conduz
              tecnologia, IA e totens interativos. Atuamos com um arsenal de multi-agentes para atendimento, triagem,
              concierge e suporte técnico, sempre com orquestração segura e responsiva.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl shadow-black/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-6 h-6 text-neon-cyan" />
              <h4 className="text-xl font-display text-white">Tecnologia & IA</h4>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Stack multimodal (voz, visão e texto) com tracking de movimentos via webcam, sensores de presença e
              GPUs dedicadas. Construímos desde o alicerce: firmware seguro, pipeline de telemetria, orquestração
              de multi-agentes e atualizações OTA. Entregamos SLAs de 99,5% e conectamos modelos proprietários
              ou externos com monitoramento ativo.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { title: 'Blueprint sólido', desc: 'Arquitetura de segurança, privacidade e compliance aplicada em cada projeto.' },
            { title: 'Operação assistida', desc: 'Monitoramento em produção, telemetria multimodal e alertas acionáveis.' },
            { title: 'Equipe próxima', desc: 'Onboarding guiado, treinamento e suporte técnico direto com o time.' },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-5 rounded-xl bg-black/40 border border-white/10 shadow-md shadow-black/30"
            >
              <div className="text-neon-cyan font-display text-2xl mb-2">{item.title}</div>
              <div className="text-gray-300 text-sm leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="text-gray-300">
            <p className="font-semibold text-white mb-1">Clientes confiam, usuários retornam.</p>
            <p className="text-sm text-gray-400">
              Implementação acompanhada de onboarding, manuais digitais, suporte multicanal e analytics em tempo real.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/554197513625"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-lg bg-neon-cyan text-dark-bg font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(6,182,212,0.35)]"
            >
              Falar com o time
            </a>
            <a
              href="#catalog"
              className="px-5 py-3 rounded-lg border border-white/15 text-white hover:border-neon-cyan hover:text-neon-cyan transition"
            >
              Ver soluções
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStory;
