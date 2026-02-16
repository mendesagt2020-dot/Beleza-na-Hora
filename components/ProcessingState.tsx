
import React, { useState, useEffect } from 'react';

interface ProcessingStateProps {
  currentCount: number;
  total: number;
}

const ProcessingState: React.FC<ProcessingStateProps> = ({ currentCount, total }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const messages = [
    "Analisando formato do rosto...",
    "Escolhendo as melhores opções...",
    "Aplicando estilos realistas...",
    "Finalizando seus looks exclusivos...",
    "Quase lá! Preparando a vitrine..."
  ];

  const currentMsgIndex = Math.min(Math.floor((currentCount / total) * messages.length), messages.length - 1);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="relative w-48 h-48 mb-8">
        {/* Animated Rings */}
        <div className="absolute inset-0 border-4 border-pink-100 rounded-full"></div>
        <div 
          className="absolute inset-0 border-4 border-pink-600 rounded-full animate-spin"
          style={{ 
            clipPath: `polygon(50% 50%, -50% -50%, 150% -50%, 150% 150%, -50% 150%, -50% -50%)`,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            animationDuration: '3s'
          }}
        ></div>
        
        {/* Progress Center */}
        <div className="absolute inset-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-full flex flex-col items-center justify-center shadow-inner">
          <span className="text-3xl font-bold text-pink-600">{currentCount}/{total}</span>
          <span className="text-xs uppercase tracking-widest text-pink-400 font-semibold mt-1">Gerados</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Criando seu Look{dots}
      </h2>
      
      <p className="text-gray-600 max-w-sm mb-8 leading-relaxed">
        {messages[currentMsgIndex]}
      </p>

      <div className="w-full max-w-md h-2 bg-pink-100 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500 ease-out"
          style={{ width: `${(currentCount / total) * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">Isso pode levar cerca de um minuto. A mágica exige paciência.</p>
    </div>
  );
};

export default ProcessingState;
