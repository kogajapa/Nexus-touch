import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Fingerprint, Mic, StopCircle } from 'lucide-react';
import { ActivityHandling, EndSensitivity, GoogleGenAI, Modality, StartSensitivity, TurnCoverage } from "@google/genai";
import { SplineScene } from '@/components/ui/splite';

// Imagens para o slider de fundo
const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1531297461136-82lw6416590d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535581652167-3d6693c03337?q=80&w=2070&auto=format&fit=crop',
];

// --- Audio Utilities ---
function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i++) {
    let s = Math.max(-1, Math.min(1, input[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7FFF;
    output.setInt16(i * 2, s, true);
  }
  return output.buffer;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function getSampleRateFromMime(mimeType?: string | null, fallback = 24000): number {
  if (!mimeType) return fallback;
  const match = mimeType.match(/rate=(\d+)/);
  if (match && match[1]) {
    const parsed = parseInt(match[1], 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function pcmToAudioBuffer(audioCtx: AudioContext, audioData: ArrayBuffer, sampleRate?: number) {
  const int16 = new Int16Array(audioData);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 0x8000;
  }
  const rate = sampleRate || audioCtx.sampleRate || 24000;
  const buffer = audioCtx.createBuffer(1, float32.length, rate);
  buffer.copyToChannel(float32, 0);
  return buffer;
}

// --- Components ---

// Componente da Esfera 3D Reativa
const SphereCanvas = ({ audioLevelRef }: { audioLevelRef: React.MutableRefObject<number> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const particles: { x: number; y: number; z: number; size: number; originalX: number; originalY: number; originalZ: number }[] = [];
    const particleCount = 450;
    const baseRadius = Math.min(width, height) * 0.35;

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = baseRadius * Math.sin(phi) * Math.cos(theta);
      const y = baseRadius * Math.sin(phi) * Math.sin(theta);
      const z = baseRadius * Math.cos(phi);

      particles.push({
        x, y, z,
        originalX: x, originalY: y, originalZ: z,
        size: Math.random() * 1.5 + 0.5
      });
    }

    let angleY = 0;
    let angleX = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Get current audio level (0 to 1 range approx)
      const audioBoost = audioLevelRef.current * 2; // amplify effect
      const currentRadius = baseRadius + (baseRadius * audioBoost * 0.5);
      const rotationSpeed = 0.002 + (audioBoost * 0.01);

      angleY += rotationSpeed;
      angleX += rotationSpeed * 0.5;

      // Sort for depth
      particles.sort((a, b) => {
          const az = a.z * Math.cos(angleX) - (a.x * Math.sin(angleY) + a.y * Math.cos(angleY)) * Math.sin(angleX);
          const bz = b.z * Math.cos(angleX) - (b.x * Math.sin(angleY) + b.y * Math.cos(angleY)) * Math.sin(angleX);
          return bz - az; 
      });

      // Change color based on audio activity
      const r = Math.floor(6 + (audioBoost * 250)); // Darker to Red/White
      const g = Math.floor(182 - (audioBoost * 100));
      const b = Math.floor(212 - (audioBoost * 100));
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      particles.forEach(p => {
        // Expand sphere based on audio
        const expansion = 1 + (audioBoost * 0.2);
        
        let px = p.originalX * expansion;
        let py = p.originalY * expansion;
        let pz = p.originalZ * expansion;

        // Rotation Y
        let x1 = px * Math.cos(angleY) - pz * Math.sin(angleY);
        let z1 = pz * Math.cos(angleY) + px * Math.sin(angleY);

        // Rotation X
        let y1 = py * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = z1 * Math.cos(angleX) + py * Math.sin(angleX);

        // Projection
        const scale = 300 / (300 + z2);
        const x2d = centerX + x1 * scale;
        const y2d = centerY + y1 * scale;

        const alpha = (z2 + baseRadius) / (2 * baseRadius);
        ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha + audioBoost));
        
        ctx.beginPath();
        ctx.arc(x2d, y2d, (p.size + (audioBoost * 2)) * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    const handleResize = () => {
        width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef(null);
  const audioLevelRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputStreamRef = useRef<MediaStream | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sessionRef = useRef<any>(null); // Keep track of Gemini session
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]); 

  // Auto-slide logic (desativado ao remover fundo de imagens)
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % SLIDE_IMAGES.length);
  //   }, 6000);
  //   return () => clearInterval(timer);
  // }, []);

  const connectToGemini = async () => {
    try {
      setError(null);
      setIsLive(true);

      console.log('🚀 Iniciando Live Voice...');

      const apiKey = import.meta.env.VITE_API_KEY;
      if (!apiKey) throw new Error('API Key não configurada');

      const ai = new GoogleGenAI({ apiKey });

      // Audio Context para reprodução
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;

      // Analyzer para visualização
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;

      const gainNode = audioCtx.createGain();
      gainNode.connect(analyzer);
      analyzer.connect(audioCtx.destination);

      // Loop de visualização
      const updateAudioLevel = () => {
        if (!sessionRef.current) return;
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        audioLevelRef.current = avg / 128.0;
        requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

      // Capturar microfone
      console.log('🎤 Capturando microfone...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000
        }
      });
      inputStreamRef.current = stream;

      // Conectar ao Gemini com Native Audio (modelo mais recente)
      console.log('🔗 Conectando ao Gemini 2.5 Flash Native Audio...');
      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          realtimeInputConfig: {
            automaticActivityDetection: {
              // Tornar VAD mais agressivo para baixar latência.
              startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
              endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
              silenceDurationMs: 200,
            },
            activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
            turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
          },
          systemInstruction: {
            parts: [{
              text: [
                'Você é o atendente de voz da Nexus Touch (totens, avatares e mesas interativas com IA multimodal).',
                'Pilares: hardware robusto (32"-55" 4K, PCAP, alumínio), rastreamento de mãos/gestos e presença, IA de voz/visão/texto, operação 24/7 com telemetria e atualizações OTA.',
                'Portfólio: Nexus AI Avatar (avatar 3D responsivo para museus/educação), Nexus Memorial Interactive (linhas do tempo e acervos digitais), linha de totens indoor como Neo Slim V3 (22mm, 43" 4K), soluções saúde via Nexus Health (triagem, concierge, multiagentes).',
                'Equipe: Taffarel (CEO, Nexus Health), Leandro (CTO, IA e totens).',
                'Tom: brasileiro, conciso, natural, consultivo; não invente preços; sempre conduza para próximos passos (ver soluções, falar com time, agendar demo).'
              ].join(' ')
            }]
          },
        },
        callbacks: {
          onopen: () => {
            console.log('✅ Conectado!');
          },
          onmessage: async (msg: any) => {
            console.log('📨 Mensagem recebida:', msg);

            // Check for turn complete
            if (msg.serverContent?.turnComplete) {
              console.log('✅ Turno completo');
            }

            // Handle interruption (barge-in)
            if (msg.serverContent?.interrupted) {
              console.log('⏹️ Resposta interrompida');
              scheduledSourcesRef.current.forEach(src => {
                try { src.stop(); } catch (e) {}
              });
              scheduledSourcesRef.current.clear();
              nextStartTimeRef.current = audioCtx.currentTime;
            }

            // Check for audio in response
            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const { data, mimeType } = part.inlineData;
                  console.log(
                    '🎵 Áudio recebido! Tamanho:',
                    data.length,
                    'bytes',
                    'mime:',
                    mimeType || 'desconhecido'
                  );
                  try {
                    const audioData = base64ToArrayBuffer(data);
                    let audioBuffer: AudioBuffer | null = null;

                    // Use browser decoder for encoded formats; fall back to raw PCM conversion.
                    if (mimeType && !mimeType.includes('pcm')) {
                      try {
                        audioBuffer = await audioCtx.decodeAudioData(audioData.slice(0));
                      } catch (decodeErr) {
                        console.warn('ℹ️ decodeAudioData falhou, tentando PCM bruto:', decodeErr);
                      }
                    }

                    if (!audioBuffer) {
                      const sampleRate = getSampleRateFromMime(mimeType, audioCtx.sampleRate || 24000);
                      audioBuffer = pcmToAudioBuffer(audioCtx, audioData, sampleRate);
                    }

                    const source = audioCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(gainNode);

                    // Garantir ordem de reprodução para evitar gaps
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;

                    scheduledSourcesRef.current.add(source);
                    source.onended = () => {
                      scheduledSourcesRef.current.delete(source);
                    };
                    console.log('▶️ Reproduzindo áudio (agendado)...');
                  } catch (err) {
                    console.error('❌ Erro ao decodificar áudio:', err);
                  }
                }
              }
            }
          },
          onclose: () => {
            console.log('❌ Conexão fechada');
            handleDisconnect();
          },
          onerror: (err: any) => {
            console.error('🚨 Erro:', err);
            handleDisconnect();
          }
        }
      });

      sessionRef.current = session;
      console.log('✅ Sistema pronto! Comece a falar...');

      // Processar áudio do microfone para PCM
      const micContext = new AudioContext({ sampleRate: 16000 });
      const micSource = micContext.createMediaStreamSource(stream);
      // Use buffer menor para reduzir latência de envio (~256ms por chunk)
      const micProcessor = micContext.createScriptProcessor(4096, 1, 1);

      micSource.connect(micProcessor);
      micProcessor.connect(micContext.destination);

      let audioChunkCount = 0;
      micProcessor.onaudioprocess = (e) => {
        if (!sessionRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = floatTo16BitPCM(inputData);
        const base64 = btoa(
          new Uint8Array(pcm16).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        try {
          sessionRef.current.sendRealtimeInput({
            media: {
              data: base64,
              mimeType: 'audio/pcm;rate=16000',
            },
          });

          // Log a cada 100 chunks (~25 segundos)
          audioChunkCount++;
          if (audioChunkCount % 100 === 0) {
            console.log(`📤 ${audioChunkCount} chunks de áudio enviados`);
          }
        } catch (err) {
          console.error('⚠️ Erro ao enviar:', err);
        }
      };

    } catch (err: any) {
      console.error("🚨 Erro:", err);
      setError(err.message || "Erro ao conectar");
      setIsLive(false);
    }
  };

  const handleDisconnect = () => {
    setIsLive(false);
    audioLevelRef.current = 0;

    scheduledSourcesRef.current.forEach(src => {
      try { src.stop(); } catch (e) {}
    });
    scheduledSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    // Cleanup Audio
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (inputStreamRef.current) {
      inputStreamRef.current.getTracks().forEach(t => t.stop());
      inputStreamRef.current = null;
    }
    try {
      sessionRef.current?.sendRealtimeInput({ audioStreamEnd: true });
    } catch (err) {
      console.warn('Falha ao avisar fim do áudio:', err);
    }
    sessionRef.current = null;
  };

  const toggleVoice = () => {
    if (isLive) {
      handleDisconnect();
    } else {
      connectToGemini();
    }
  };

  return (
    <section id="home" ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden bg-dark-bg pt-20 lg:pt-0" style={{ isolation: 'isolate' }}>
      
      {/* Background Layer: removido slider de imagens */}
      <div className="absolute inset-0 w-full h-full z-0 bg-dark-bg"></div>

      {/* 3D Spline Background Layer */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto" style={{ transform: 'translate3d(0,0,0)' }}>
        <SplineScene
          scene="https://prod.spline.design/5cpuLrlmubVp36q1/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Main Content Grid */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full pointer-events-none">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center h-full min-h-[80vh]">
            
            {/* Left Side: Content */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-start text-left pt-10 lg:pt-0"
            >
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-red-500' : 'bg-neon-cyan'} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-red-500' : 'bg-neon-cyan'}`}></span>
                    </span>
                    <span className="text-neon-cyan text-xs font-display tracking-widest uppercase">
                        {isLive ? 'Live Voice Active' : 'Powered by Nexus AI'}
                    </span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-[1.1]">
                    O Futuro da <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500">
                        Interatividade
                    </span>
                </h1>

                <p className="text-lg text-gray-400 font-light leading-relaxed max-w-xl mb-10">
                    Comece a criar experiências que evoluem junto com seu público. 
                    Nossos totens e avatares inteligentes transformam espaços físicos em 
                    centros de dados vivos.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <a
                        href="#catalog"
                        className="relative z-50 px-8 py-4 bg-neon-cyan text-dark-bg font-bold rounded-lg hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 group pointer-events-auto"
                        style={{ transform: 'translateZ(0)' }}
                    >
                        Ver Soluções
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                        href="#about"
                        className="relative z-50 px-8 py-4 border border-white/10 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center justify-center pointer-events-auto"
                        style={{ transform: 'translateZ(0)' }}
                    >
                        Como Funciona
                    </a>
                </div>
            </motion.div>

            {/* Right Side: 3D Sphere & Interaction */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center"
            >
                {/* 3D Sphere Container (Reactive) */}
                <div className="absolute inset-0 z-0">
                    <SphereCanvas audioLevelRef={audioLevelRef} />
                </div>

                {/* Floating Center Interaction Button (Toggle) */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleVoice}
                    className={`relative z-50 group flex flex-col items-center justify-center transition-all duration-500 pointer-events-auto`}
                    style={{ transform: 'translateZ(0)' }}
                >
                    <div className={`relative w-28 h-28 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all duration-500 shadow-2xl ${
                        isLive 
                        ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.4)]' 
                        : 'bg-black/50 border-neon-cyan/30 group-hover:border-neon-cyan shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                    }`}>
                        
                        {/* Animated Border Rings */}
                        <div className={`absolute inset-0 rounded-full border-t border-transparent animate-spin duration-[3000ms] ${isLive ? 'border-t-red-500' : 'border-t-neon-cyan'}`}></div>
                        <div className={`absolute inset-2 rounded-full border-b border-transparent animate-spin duration-[2000ms] reverse ${isLive ? 'border-b-red-500/50' : 'border-b-neon-cyan/50'}`}></div>
                        
                        {/* Fingerprint / Active Icon */}
                        {isLive ? (
                            <div className="flex gap-1 items-end h-8">
                                <motion.div animate={{ height: [10, 30, 10] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-2 bg-red-500 rounded-full" />
                                <motion.div animate={{ height: [15, 40, 15] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-2 bg-red-500 rounded-full" />
                                <motion.div animate={{ height: [10, 30, 10] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 bg-red-500 rounded-full" />
                            </div>
                        ) : (
                            <Fingerprint className="w-12 h-12 text-neon-cyan group-hover:scale-110 transition-transform animate-pulse-slow" />
                        )}
                    </div>
                    
                    <div className="mt-4 px-4 py-2 bg-dark-card/80 backdrop-blur border border-white/10 rounded-full flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isLive ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {error ? error : (isLive ? 'Ouvindo...' : 'Toque para Falar')}
                        </span>
                    </div>
                </motion.button>
                
                {/* Glow Effect behind sphere */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] rounded-full pointer-events-none -z-10 transition-colors duration-500 ${isLive ? 'bg-red-500/20' : 'bg-neon-cyan/20'}`}></div>
            </motion.div>

        </div>
      </div>

      {/* Fade inferior (somente rodapé) para ocultar logo sem bloquear interações */}
      <div className="pointer-events-none absolute inset-0 z-30">
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/100 to-transparent"
          style={{ height: '20%' }}
        ></div>
      </div>
    </section>
  );
};

export default Hero;
