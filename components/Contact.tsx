import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', company: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Criar mensagem personalizada para WhatsApp
    const message = `*Solicitação de Orçamento - Nexus Touch*

*Nome:* ${formState.name}
*Empresa:* ${formState.company || 'Não informado'}
*Email:* ${formState.email}

*Detalhes do Projeto:*
${formState.message}`;

    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);

    // Número do WhatsApp (código do país + DDD + número)
    const whatsappNumber = '5541997513625';

    // Abrir WhatsApp em nova aba
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');

    // Limpar formulário
    setFormState({ name: '', company: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="py-24 bg-dark-bg relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Inicie seu Projeto <br/>
              <span className="text-neon-cyan">Nexus Touch</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              Pronto para transformar a experiência do seu cliente? Nossa equipe de especialistas está aguardando para desenhar a solução perfeita para o seu negócio.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="p-4 rounded-xl bg-dark-card border border-white/5 text-neon-cyan group-hover:border-neon-cyan/50 group-hover:bg-neon-cyan/10 transition-all duration-300">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Comercial</h4>
                  <a
                    href="https://wa.me/5541997513625"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 font-light hover:text-neon-cyan transition-colors block"
                  >
                    (41) 99751-3625
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-6 group">
                <div className="p-4 rounded-xl bg-dark-card border border-white/5 text-neon-cyan group-hover:border-neon-cyan/50 group-hover:bg-neon-cyan/10 transition-all duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Email</h4>
                  <a href="mailto:suporte@nexusagi.com" className="text-gray-400 font-light hover:text-neon-cyan transition-colors block">
                    suporte@nexusagi.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="p-4 rounded-xl bg-dark-card border border-white/5 text-neon-cyan group-hover:border-neon-cyan/50 group-hover:bg-neon-cyan/10 transition-all duration-300">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Guarapuava</h4>
                  <p className="text-gray-400 font-light">Guarapuava, PR</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-8 md:p-10 rounded-2xl border-t border-white/10 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Nome</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                    className="w-full bg-dark-bg/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:bg-dark-bg/80 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Empresa</label>
                  <input
                    type="text"
                    value={formState.company}
                    onChange={(e) => setFormState({...formState, company: e.target.value})}
                    className="w-full bg-dark-bg/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:bg-dark-bg/80 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({...formState, email: e.target.value})}
                  className="w-full bg-dark-bg/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:bg-dark-bg/80 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Detalhes do Projeto</label>
                <textarea
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                  className="w-full bg-dark-bg/60 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:bg-dark-bg/80 transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-lg bg-neon-cyan hover:bg-cyan-400 text-dark-bg font-bold text-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 flex items-center justify-center gap-2 group mt-4"
              >
                Solicitar Orçamento
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
