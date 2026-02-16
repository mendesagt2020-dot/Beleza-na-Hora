
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import CameraView from './components/CameraView';
import ResultsGallery from './components/ResultsGallery';
import { AppStep, HairstyleLook } from './types';
import { HAIRSTYLES } from './constants';
import { generateHairstyle } from './services/geminiService';

declare global {
  // Definição da interface AIStudio conforme esperado pelo ambiente global
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Garantir que a propriedade aistudio possua os modificadores e o tipo AIStudio corretos
    readonly aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.HOME);
  const [results, setResults] = useState<HairstyleLook[]>([]);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasCustomKey, setHasCustomKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasCustomKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume que a seleção foi bem-sucedida para mitigar condições de corrida conforme as diretrizes
      setHasCustomKey(true);
    }
  };

  const goHome = () => {
    setStep(AppStep.HOME);
    setResults([]);
    setGeneratedCount(0);
    setCapturedImage(null);
  };

  const handleRetryLook = async (lookId: string) => {
    const lookIndex = results.findIndex(l => l.id === lookId);
    if (lookIndex === -1 || !capturedImage) return;

    const look = HAIRSTYLES[lookIndex];
    setResults(prev => {
      const updated = [...prev];
      updated[lookIndex] = { ...updated[lookIndex], isLoading: true, error: undefined };
      return updated;
    });

    try {
      const generatedImage = await generateHairstyle(capturedImage, look.prompt);
      setResults(prev => {
        const updated = [...prev];
        updated[lookIndex] = { ...updated[lookIndex], imageUrl: generatedImage, isLoading: false, error: undefined };
        return updated;
      });
    } catch (err: any) {
      // Se a entidade não for encontrada, reseta o estado da chave e solicita nova seleção via openSelectKey
      if (err?.message?.includes('Requested entity was not found.')) {
        setHasCustomKey(false);
        await handleOpenKeySelector();
      }

      setResults(prev => {
        const updated = [...prev];
        updated[lookIndex] = { ...updated[lookIndex], isLoading: false, error: "Limite de cota." };
        return updated;
      });
    }
  };

  const handleCapture = useCallback(async (image: string) => {
    setStep(AppStep.RESULTS);
    setGeneratedCount(0);
    setCapturedImage(image);

    const initialResults: HairstyleLook[] = HAIRSTYLES.map((style, idx) => ({
      id: `look-${idx}`,
      name: style.name,
      description: `Estilo ${style.name}`,
      isLoading: true
    }));
    setResults(initialResults);

    const processQueue = async () => {
      const queue = [...HAIRSTYLES.map((s, i) => ({ ...s, originalIndex: i }))];
      
      for (const item of queue) {
        try {
          const generatedImage = await generateHairstyle(image, item.prompt);
          setResults(prev => {
            const updated = [...prev];
            updated[item.originalIndex] = { 
              ...updated[item.originalIndex], 
              imageUrl: generatedImage, 
              isLoading: false,
              error: undefined
            };
            return updated;
          });
          
          // Intervalo reduzido se estiver usando chave própria (supostamente com maior cota)
          const waitTime = hasCustomKey ? 5000 : 45000;
          if (queue.indexOf(item) < queue.length - 1) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } catch (err: any) {
          // Se a entidade não for encontrada, reseta o estado da chave e solicita nova seleção via openSelectKey
          if (err?.message?.includes('Requested entity was not found.')) {
            setHasCustomKey(false);
            await handleOpenKeySelector();
          }

          setResults(prev => {
            const updated = [...prev];
            updated[item.originalIndex] = { 
              ...updated[item.originalIndex], 
              isLoading: false, 
              error: "Limite excedido." 
            };
            return updated;
          });
        } finally {
          setGeneratedCount(prev => prev + 1);
        }
      }
    };

    processQueue();
  }, [hasCustomKey]);

  return (
    <div className="min-h-screen bg-[#fffcfd] flex flex-col font-sans selection:bg-pink-100">
      <Header onGoHome={goHome} onOpenKeys={handleOpenKeySelector} isPremium={hasCustomKey} />

      <main className="flex-grow flex flex-col">
        {step === AppStep.HOME && (
          <section className="flex-grow flex flex-col lg:flex-row items-center max-w-7xl mx-auto px-6 py-16 gap-16 lg:py-24">
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block py-2 px-6 bg-pink-50 text-pink-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                {hasCustomKey ? 'Modo de Alta Velocidade Ativo' : 'Premium Virtual Studio'}
              </span>
              <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-[0.9] font-serif">
                Sua Melhor <br />
                <span className="text-pink-700 italic">Versão.</span>
              </h1>
              <p className="text-lg text-gray-400 mb-12 leading-relaxed max-w-xl font-medium">
                Transformações capilares realistas usando IA. 
                {!hasCustomKey && " Experimente nosso plano gratuito ou use sua própria chave de API para resultados instantâneos."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => setStep(AppStep.CAPTURE)}
                  className="px-12 py-6 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 hover:scale-[1.02] transition-all shadow-2xl"
                >
                  Começar Transformação
                </button>
                {!hasCustomKey && (
                  <button 
                    onClick={handleOpenKeySelector}
                    className="px-8 py-6 border-2 border-gray-100 text-gray-400 rounded-2xl font-bold uppercase tracking-widest text-[9px] hover:border-pink-200 hover:text-pink-500 transition-all"
                  >
                    Ativar Modo Pro (Alta Velocidade)
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-[1px] border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1595476108010-b4d1f80d77d2?q=80&w=800&auto=format&fit=crop" 
                  alt="Beleza na Hora" 
                  className="w-full h-full object-cover aspect-[4/5] grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </div>
            </div>
          </section>
        )}

        {step === AppStep.CAPTURE && (
          <div className="flex-grow flex items-center justify-center p-6">
            <CameraView 
              onCapture={handleCapture}
              onCancel={goHome}
            />
          </div>
        )}

        {step === AppStep.RESULTS && (
          <ResultsGallery 
            looks={results}
            onRestart={goHome}
            onRetryLook={handleRetryLook}
            onOpenKeys={handleOpenKeySelector}
            isStillLoading={generatedCount < HAIRSTYLES.length}
            isPremium={hasCustomKey}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="items-center gap-3 hidden md:flex">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-serif font-bold text-xs shadow-lg">BH</div>
            <span className="text-sm font-bold tracking-tight">BELEZA NA HORA</span>
          </div>
          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] text-center w-full md:w-auto">
            Estúdio de Imagem Profissional © 2024
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
