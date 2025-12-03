import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Hands: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

const HAND_SCRIPT = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
const DRAWING_SCRIPT = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';

const triageOptions = [
  { id: 'triagem', title: 'Triagem', desc: 'Iniciar classificação de atendimento' },
  { id: 'prioridade', title: 'Prioridade', desc: 'Atendimento prioritário' },
  { id: 'info', title: 'Informações', desc: 'Dúvidas e orientações' },
];

const HandTracking: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [message, setMessage] = useState<string>('Pronto para iniciar o tracking de mãos (MediaPipe).');
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const [handsCount, setHandsCount] = useState(0);
  const [triageState, setTriageState] = useState<'aguardando' | 'triagem' | 'encaminhar'>('aguardando');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // load external scripts
  useEffect(() => {
    let cancelled = false;
    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
        document.body.appendChild(script);
      });

    const loadAll = async () => {
      try {
        setStatus('loading');
        await loadScript(HAND_SCRIPT);
        await loadScript(DRAWING_SCRIPT);
        if (!window.Hands || !window.drawConnectors || !window.drawLandmarks) {
          throw new Error('MediaPipe não disponível');
        }
        if (cancelled) return;
        setStatus('ready');
        setMessage('Biblioteca carregada. Ative o vídeo para rastrear gestos.');
      } catch (err: any) {
        if (!cancelled) {
          setStatus('error');
          setMessage(err?.message || 'Erro ao carregar MediaPipe.');
        }
      }
    };

    loadAll();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startTracking = async () => {
    if (status !== 'ready' || !videoRef.current || !canvasRef.current) return;
    try {
      const videoEl = videoRef.current;
      const canvasEl = canvasRef.current;
      const ctx = canvasEl.getContext('2d');
      if (!ctx) throw new Error('Canvas não disponível');

      // get user media
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 960, height: 540 } });
      streamRef.current = stream;
      videoEl.srcObject = stream;
      await videoEl.play();

      const hands = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6,
      });
      hands.onResults((results: any) => {
        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        ctx.save();
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
        const count = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;
        setHandsCount(count);
        if (count === 0) {
          setTriageState('aguardando');
        } else if (count === 1) {
          setTriageState('triagem');
        } else if (count >= 2) {
          setTriageState('encaminhar');
        }
        if (results.multiHandLandmarks) {
          for (const landmarks of results.multiHandLandmarks) {
            window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#06b6d4', lineWidth: 3 });
            window.drawLandmarks(ctx, landmarks, { color: '#ffffff', lineWidth: 2 });
          }
        }
        ctx.restore();
      });

      handsRef.current = hands;
      const loop = async () => {
        try {
          await hands.send({ image: videoEl });
        } catch (err: any) {
          console.error('Hand tracking error', err);
          setStatus('error');
          setMessage('Falha ao processar o tracking. Tente em HTTPS/desktop ou atualize o navegador.');
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          return;
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
      setMessage('Tracking ativo: mova as mãos na frente da webcam.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Erro ao iniciar tracking.');
    }
  };

  return (
    <section id="hand-tracking" className="py-24 bg-[#050b1e] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-10 top-20 w-[360px] h-[360px] rounded-full bg-neon-cyan/5 blur-[140px]" />
        <div className="absolute right-0 bottom-0 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neon-cyan font-semibold mb-3">
              Demo Interativa
            </p>
            <h3 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
              Tracking de mãos em tempo real
            </h3>
            <p className="text-gray-400 mt-3 max-w-2xl">
              Pipeline multimodal: webcam + detecção de mãos em tempo real. Use para gestos, menus aéreos e navegação sem toque.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={startTracking}
              disabled={status === 'loading' || status === 'error'}
              className="px-5 py-3 rounded-lg bg-neon-cyan text-dark-bg font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-60"
            >
              {status === 'loading' ? 'Carregando...' : 'Ativar webcam'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl shadow-black/40">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-dark-bg/60 via-transparent to-transparent" />
            <canvas ref={canvasRef} className="w-full h-full min-h-[360px] bg-black" />

            {/* Totem overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-semibold uppercase">
                  Totem Nexus Health
                </div>
                <h4 className="mt-4 text-white text-2xl font-display">Atendimento sem toque</h4>
                <p className="text-gray-300 text-sm mt-2">
                  Use gestos ou toque nas opções abaixo para iniciar triagem ou prioridade.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-4xl">
                {triageOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedOption(opt.id);
                      if (opt.id === 'triagem') setTriageState('triagem');
                      else if (opt.id === 'prioridade') setTriageState('encaminhar');
                      else setTriageState('aguardando');
                    }}
                    className={`text-left rounded-xl border bg-white/5 p-4 transition ${
                      selectedOption === opt.id ? 'border-neon-cyan/60 shadow-[0_0_20px_rgba(6,182,212,0.35)]' : 'border-white/10 hover:border-neon-cyan/40'
                    }`}
                  >
                    <div className="text-sm text-neon-cyan font-semibold uppercase">{opt.title}</div>
                    <div className="text-gray-300 text-sm mt-2">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs text-gray-400">Estado atual</div>
                  <div className="text-white text-lg font-display">
                    {triageState === 'aguardando' && 'Aguardando paciente'}
                    {triageState === 'triagem' && 'Triagem por voz ativa'}
                    {triageState === 'encaminhar' && 'Encaminhar para Nexus Health'}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">Mãos detectadas: {handsCount}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-200">
                    <span>Sintomas por voz</span>
                    <span className={`px-2 py-1 rounded text-xs ${triageState === 'triagem' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/10 text-gray-400'}`}>
                      {triageState === 'triagem' ? 'Gravando' : 'Standby'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-200">
                    <span>Encaminhar Nexus Health</span>
                    <span className={`px-2 py-1 rounded text-xs ${triageState === 'encaminhar' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/10 text-gray-400'}`}>
                      {triageState === 'encaminhar' ? 'Liberado' : 'Standby'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-200">
                    <span>Interface sem toque</span>
                    <span className="px-2 py-1 rounded text-xs bg-neon-cyan/20 text-neon-cyan">Ativo</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setTriageState('triagem')}
                  className="px-3 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan text-xs hover:bg-neon-cyan/20 transition"
                >
                  Simular triagem
                </button>
                <button
                  onClick={() => setTriageState('encaminhar')}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-xs hover:border-neon-cyan hover:text-neon-cyan transition"
                >
                  Simular prioridade
                </button>
                <button
                  onClick={() => {
                    setTriageState('aguardando');
                    setSelectedOption(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-xs hover:border-neon-cyan hover:text-neon-cyan transition"
                >
                  Reset
                </button>
              </div>
            </div>
            <video ref={videoRef} className="hidden" playsInline />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Estado</h4>
              <p className="text-gray-300 text-sm mb-2">{message}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className={`inline-flex h-2 w-2 rounded-full ${handsCount > 0 ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                <span className="text-gray-300">Mãos detectadas: {handsCount}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Roteiro médico por gestos</h4>
              <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
                <li>Sem mãos: aguarda paciente aproximar do totem.</li>
                <li>1 mão na câmera: triagem rápida (coletar sintomas por voz).</li>
                <li>2 mãos: acionar fluxo preferencial Nexus Health (prioridade/atendimento humano).</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-white font-semibold">Ações de totem</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <div className="flex items-center justify-between">
                  <span>Coletar sintomas por voz</span>
                  <span className={`text-xs px-2 py-1 rounded ${triageState === 'triagem' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/10 text-gray-400'}`}>
                    {triageState === 'triagem' ? 'Ativo' : 'Aguardando'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Encaminhar para Nexus Health</span>
                  <span className={`text-xs px-2 py-1 rounded ${triageState === 'encaminhar' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/10 text-gray-400'}`}>
                    {triageState === 'encaminhar' ? 'Pronto' : 'Aguardando'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Interface sem toque</span>
                  <span className="text-xs px-2 py-1 rounded bg-neon-cyan/20 text-neon-cyan">Sempre ativo</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setTriageState('triagem')}
                  className="px-3 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan text-xs hover:bg-neon-cyan/20 transition"
                >
                  Simular triagem
                </button>
                <button
                  onClick={() => setTriageState('encaminhar')}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-xs hover:border-neon-cyan hover:text-neon-cyan transition"
                >
                  Simular prioridade
                </button>
                <button
                  onClick={() => setTriageState('aguardando')}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white text-xs hover:border-neon-cyan hover:text-neon-cyan transition"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Uso real</h4>
              <p className="text-gray-300 text-sm">
                Totens sem contato para pré-atendimento, acessibilidade por gestos e experiências imersivas em saúde e cultura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HandTracking;
