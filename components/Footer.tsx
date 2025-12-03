import React from 'react';
import { Fingerprint } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-bg border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
                <Fingerprint className="h-8 w-8 text-neon-cyan" />
                <span className="font-display font-bold text-2xl tracking-wider text-white">
                NEXUS<span className="text-neon-cyan">TOUCH</span>
                </span>
            </div>
            <p className="text-gray-400 max-w-sm leading-relaxed">
                Líderes globais em soluções de hardware interativo. Criando o futuro do autoatendimento com tecnologia de ponta e design inovador.
            </p>
          </div>

          <div>
              <h4 className="text-white font-semibold mb-6">Mapa</h4>
              <ul className="space-y-4 text-gray-400">
                  <li><a href="#home" className="hover:text-neon-cyan transition-colors">Início</a></li>
                  <li><a href="#catalog" className="hover:text-neon-cyan transition-colors">Catálogo</a></li>
                  <li><a href="#about" className="hover:text-neon-cyan transition-colors">Sobre</a></li>
                  <li><a href="https://wa.me/554197513625" className="hover:text-neon-cyan transition-colors" target="_blank" rel="noopener noreferrer">Contato</a></li>
              </ul>
          </div>

        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Nexus Touch Systems. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
