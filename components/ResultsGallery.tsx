
import React, { useState, useEffect } from 'react';
import { HairstyleLook } from '../types';

interface ResultsGalleryProps {
  looks: HairstyleLook[];
  onRestart: () => void;
  onRetryLook: (lookId: string) => void;
  onOpenKeys: () => void;
  isStillLoading: boolean;
  isPremium: boolean;
}

const ResultsGallery: React.FC<ResultsGalleryProps> = ({ looks, onRestart, onRetryLook, onOpenKeys, isStillLoading, isPremium }) => {
  const [selectedLook, setSelectedLook] = useState<HairstyleLook | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('Processando...');
  
  const generatedCount = looks.filter(l => !l.isLoading && !l.error).length;
  const errorCount = looks.filter(l => !!l.error).length;
  const progressPercent = ((generatedCount + errorCount) / looks.length) * 100;

  useEffect(() => {
    if (isStillLoading) {
      const msgs = isPremium ? [
        'Renderizando em alta velocidade...',
        'Esculpindo próximos looks...',
        'Quase lá...',
        'Finalizando transformação...'
      ] : [
        'Aguardando janela de cota gratuita (45s)...',
        'Processando lentamente para evitar erros...',
        'Respeitando limites da API...',
        'Paciência é a chave do plano grátis...',
        'Quer velocidade? Ative o Modo Pro no topo.'
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingMsg(msgs[i % msgs.length]);
        i++;
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isStillLoading, isPremium]);

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fadeIn pb-24">
      {isStillLoading && (
        <div className="fixed top-[81px] left-0 w-full h-1 bg-gray-50 z-[49]">
          <div 
            className={`h-full transition-all duration-1000 linear shadow-md ${isPremium ? 'bg-pink-500' : 'bg-gray-400'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="text-center mb-16">
        <span className="text-gray-400 font-bold text-[9px] tracking-[0.4em] uppercase mb-4 block">
          {isStillLoading ? (isPremium ? 'Geração de Alta Performance' : 'Geração em Lote Controlado') : 'Galeria BH Concluída'}
        </span>
        <h2 className="text-5xl font-bold text-gray-900 mb-6 font-serif">Sua Galeria Digital</h2>
        <div className="h-[1px] w-24 bg-gray-200 mx-auto"></div>
        
        {isStillLoading && (
          <div className="mt-8 flex flex-col items-center gap-3">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-bounce ${isPremium ? 'bg-pink-600' : 'bg-gray-300'}`} style={{ animationDelay: '0s' }}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${isPremium ? 'bg-pink-600' : 'bg-gray-300'}`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`w-2 h-2 rounded-full animate-bounce ${isPremium ? 'bg-pink-600' : 'bg-gray-300'}`} style={{ animationDelay: '0.4s' }}></div>
             </div>
             <p className="text-[10px] text-gray-900 font-black uppercase tracking-[0.3em] max-w-sm">{loadingMsg}</p>
             <p className="text-[9px] text-pink-600 font-bold uppercase tracking-widest">
               {generatedCount} gerados | {errorCount} falhas
             </p>
          </div>
        )}

        {!isStillLoading && errorCount > 0 && (
          <div className="mt-10 p-6 bg-pink-50 rounded-[2rem] max-w-2xl mx-auto border border-pink-100 animate-fadeIn">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600 mb-2">Por que alguns falharam?</h4>
            <p className="text-xs text-pink-400 leading-relaxed mb-4">
              Você atingiu o limite de cota gratuita do Google Gemini. Para gerar looks instantaneamente sem erros, 
              ative o faturamento (Pay-as-you-go) no seu projeto e selecione sua chave.
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-bold uppercase tracking-widest text-pink-600 underline"
              >
                Docs de Faturamento
              </a>
              <button 
                onClick={onOpenKeys}
                className="text-[9px] font-bold uppercase tracking-widest bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                Selecionar Minha Chave Pro
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-10">
        {looks.map((look) => (
          <div 
            key={look.id}
            className={`group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 ${look.imageUrl ? 'cursor-pointer' : ''} border border-gray-50`}
            onClick={() => look.imageUrl && setSelectedLook(look)}
          >
            <div className="aspect-[3/4] overflow-hidden relative bg-gray-50">
              {look.imageUrl ? (
                <img src={look.imageUrl} alt={look.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 animate-fadeIn" />
              ) : look.error ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-red-50/20">
                  <i className="fas fa-lock text-red-200 mb-3 text-xl"></i>
                  <p className="text-[7px] font-black text-red-400 uppercase tracking-widest text-center leading-tight mb-4">
                    COTA EXCEDIDA
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRetryLook(look.id); }}
                    className="px-4 py-2 bg-black text-white text-[8px] font-bold uppercase rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[shimmer_3s_infinite]"></div>
                  <div className={`w-6 h-6 border border-gray-100 rounded-full animate-spin mb-4 ${isPremium ? 'border-t-pink-600' : 'border-t-gray-400'}`}></div>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest text-center">{look.name}</p>
                </div>
              )}
            </div>
            <div className="p-5 text-center">
              <h3 className={`text-[10px] font-black uppercase tracking-widest truncate ${look.imageUrl ? 'text-gray-900' : 'text-gray-300'}`}>
                {look.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <button 
          onClick={onRestart} 
          className="px-12 py-5 bg-black text-white rounded-full font-bold uppercase tracking-[0.2em] text-[9px] shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
          disabled={isStillLoading}
        >
          {isStillLoading ? 'Aguarde Conclusão...' : 'Novo Ensaio'}
        </button>
      </div>

      {selectedLook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/95 backdrop-blur-xl animate-fadeIn" onClick={() => setSelectedLook(null)}>
          <div className="bg-white rounded-[3rem] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="md:w-1/2 aspect-square md:aspect-auto">
              <img src={selectedLook.imageUrl} className="w-full h-full object-cover" />
            </div>
            <div className="p-12 md:p-16 md:w-1/2 flex flex-col justify-center">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Beleza na Hora Professional</span>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 font-serif leading-tight">{selectedLook.name}</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                Sua essência preservada, seu estilo reinventado.
              </p>
              <div className="flex flex-col gap-4">
                <button className="w-full py-5 bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl hover:bg-gray-800 transition-all">Salvar Look</button>
                <button onClick={() => setSelectedLook(null)} className="w-full py-5 border border-gray-100 rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-gray-50 transition-all">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
};

export default ResultsGallery;
