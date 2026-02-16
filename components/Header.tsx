
import React from 'react';

interface HeaderProps {
  onGoHome: () => void;
  onOpenKeys: () => void;
  isPremium: boolean;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, onOpenKeys, isPremium }) => {
  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-50 px-6 py-5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={onGoHome}
        >
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-serif text-xl font-bold shadow-xl group-hover:bg-gray-800 transition-all">
            BH
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tighter text-gray-900 leading-none">
              BELEZA NA HORA
            </h1>
            <span className="text-[8px] tracking-[0.3em] text-gray-400 font-black uppercase mt-1">
              Professional Studio
            </span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          <button onClick={onGoHome} className="hover:text-black transition-colors">Página Inicial</button>
          
          {isPremium ? (
            <div className="flex items-center gap-2 text-pink-600 bg-pink-50 px-4 py-2 rounded-full border border-pink-100">
              <i className="fas fa-bolt"></i>
              <span>MODO PRO ATIVO</span>
            </div>
          ) : (
            <button 
              onClick={onOpenKeys}
              className="hover:text-pink-600 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-key text-[8px]"></i>
              Aumentar Velocidade (API)
            </button>
          )}

          <button className="bg-black text-white px-6 py-3 rounded-full hover:scale-105 transition-all text-[9px] shadow-lg">
            CONTATO
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
