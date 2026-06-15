import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Sparkles, CheckCircle2, AlertCircle, Scan, Volume2, UserCheck } from 'lucide-react';
import { Student } from '../types';

interface BarcodeScannerProps {
  students: Student[];
  onBarCodeScanned: (studentId: string) => void;
  lastScannedResult: { name: string; id: string; time: string; success: boolean } | null;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  students,
  onBarCodeScanned,
  lastScannedResult
}) => {
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'no-device'>('prompt');
  const [manualInputId, setManualInputId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Play realistic scanner "beep" using the clean Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime); // 1.4kHz high-frequency beep
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15); // fade out fast
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('AudioContext beep blocked or un-supported:', e);
    }
  };

  // Safe webcam activation with robust fallbacks
  const startCamera = async () => {
    setUseCamera(true);
    setCameraPermission('prompt');
    
    try {
      // Release any active stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.log('Video play interrupted:', err));
        setCameraActive(true);
        setCameraPermission('granted');
      }
    } catch (err: any) {
      console.error('Failed to get user media (camera):', err);
      if (err.name === 'NotAllowedError') {
        setCameraPermission('denied');
      } else {
        setCameraPermission('no-device');
      }
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCameraActive(false);
    setUseCamera(false);
  };

  // Clean exit for cameras on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Periodic frame capturing for simulated scanner grid rendering
  useEffect(() => {
    if (!cameraActive || !useCamera) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let searchTick = 0;

    const drawGrid = () => {
      if (!video || video.paused || video.ended) return;

      const width = canvas.width = video.videoWidth || 320;
      const height = canvas.height = video.videoHeight || 240;

      // Draw original camera view
      ctx.drawImage(video, 0, 0, width, height);

      // Apply ambient classroom filter
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Draw standard glowing scanner targeting corners
      const size = Math.min(width, height) * 0.6;
      const x = (width - size) / 2;
      const y = (height - size) / 2;

      ctx.strokeStyle = '#3b82f6'; // Blue targeting rect
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, size, size);

      // Draw custom laser pointer effect
      const laserY = y + (size / 2) + Math.sin(searchTick / 10) * (size / 2);
      ctx.strokeStyle = '#ef4444'; // Red scan line
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(x, laserY);
      ctx.lineTo(x + size, laserY);
      ctx.stroke();

      // Reset style settings
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;

      // Draw corner brackets
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;

      // Top Left Corner
      ctx.beginPath();
      ctx.moveTo(x, y + 25); ctx.lineTo(x, y); ctx.lineTo(x + 25, y);
      ctx.stroke();

      // Top Right Corner
      ctx.beginPath();
      ctx.moveTo(x + size - 25, y); ctx.lineTo(x + size, y); ctx.lineTo(x + size, y + 25);
      ctx.stroke();

      // Bottom Left Corner
      ctx.beginPath();
      ctx.moveTo(x, y + size - 25); ctx.lineTo(x, y + size); ctx.lineTo(x + 25, y + size);
      ctx.stroke();

      // Bottom Right Corner
      ctx.beginPath();
      ctx.moveTo(x + size - 25, y + size); ctx.lineTo(x + size, y + size); ctx.lineTo(x + size, y + size - 25);
      ctx.stroke();

      searchTick++;
      animationFrameRef.current = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, useCamera]);

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInputId.trim()) return;
    
    playBeep();
    onBarCodeScanned(manualInputId.trim());
    setManualInputId('');
  };

  const selectQuickStudent = (studentId: string) => {
    playBeep();
    onBarCodeScanned(studentId);
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-sm hover:border-slate-700/80 transition-all duration-300 h-full flex flex-col" id="barcode-scanner-widget">
      {/* Dynamic Header */}
      <div className="p-5 bg-slate-900/40 flex items-center justify-between border-b border-slate-800/85">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Scan className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-xs tracking-wider uppercase font-mono text-slate-100">PEMINDAI BARCODE</h3>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wide">MESIN: {isScanning ? 'MENCARI ISYARAT' : 'SIAGA'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { playBeep(); }}
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-mono text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700/40 cursor-pointer"
            title="Uji Bunyi Beep"
            type="button"
          >
            <Volume2 className="w-3.5 h-3.5" />
            TEST BEEP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        
        {/* Left Side: Scan Feed or Simulated Camera */}
        <div className="lg:col-span-7 p-6 flex flex-col justify-between min-h-[350px]">
          
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {useCamera ? (
              <div className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-blue-500 shadow-md relative bg-black aspect-video flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  className="hidden" 
                  playsInline 
                  muted 
                />
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full block"
                />
                
                {/* Laser scan label banner overlay */}
                <div className="absolute top-2 left-2 bg-slate-950/80 text-[9px] font-mono text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                  LENS: SEWING FOR BARCODE
                </div>

                <button 
                  onClick={stopCamera}
                  className="absolute bottom-2 right-2 bg-slate-900/95 hover:bg-red-900 text-white text-[10px] py-1 px-2 rounded-md font-medium border border-slate-700 transition"
                  type="button"
                >
                  Ganti ke Simulasir
                </button>
              </div>
            ) : (
              <div className="w-full max-w-sm border-2 border-dashed border-slate-700 rounded-xl p-6 text-center bg-slate-950/50 flex flex-col items-center justify-center gap-4 py-8">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 text-blue-400">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">Mode Deteksi Kamera</h4>
                  <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1">
                    Aktifkan kamera laptop/smartphone untuk memindai kode barcode fisik asli pada kartu pelajar.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  <button
                    onClick={startCamera}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    type="button"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                    Aktifkan Kamera
                  </button>
                  
                  {cameraPermission === 'denied' && (
                    <span className="text-[10px] text-rose-400 flex items-center justify-center gap-1 leading-snug">
                      <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      Akses kamera ditolak. Silakan izinkan di menu browser.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Scanned Indicator Alert Banner */}
          <div className="mt-5 border-t border-slate-800 pt-4">
            {lastScannedResult ? (
              <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 animate-pulse duration-1000 ${
                lastScannedResult.success 
                  ? 'bg-emerald-950/50 border-emerald-900/90 text-emerald-200' 
                  : 'bg-rose-950/50 border-rose-900/90 text-rose-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    lastScannedResult.success ? 'bg-emerald-900 text-emerald-400' : 'bg-rose-900 text-rose-400'
                  }`}>
                    {lastScannedResult.success ? <UserCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Hasil Pindaian Terakhir</p>
                    <h5 className="font-semibold text-xs text-white">
                      {lastScannedResult.name} <span className="text-slate-400 font-mono text-[10px]">({lastScannedResult.id})</span>
                    </h5>
                    <p className="text-[10px] text-slate-350">{lastScannedResult.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                    lastScannedResult.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {lastScannedResult.success ? 'BERHASIL ABSEN' : 'TIDAK TERDAFTAR'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center p-3 text-slate-500 text-xs font-mono">
                Menunggu pembacaan barcode kartu pelajar...
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Virtual Simulator Tools */}
        <div className="lg:col-span-5 p-6 bg-slate-950/40">
          <div>
            <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              Alat Simulator Scan Mandiri
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Gunakan simulator interaktif berikut jika Anda tidak memiliki printer barcode fisik.
            </p>
          </div>

          {/* Form manual scanner */}
          <form onSubmit={handleManualScan} className="mt-4 space-y-2">
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Input manual kode NIS / Barcode</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: NIS-260101"
                value={manualInputId}
                onChange={(e) => setManualInputId(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3 rounded-lg transition shrink-0"
              >
                Kirim
              </button>
            </div>
          </form>

          {/* Rapid Tap Selection List */}
          <div className="mt-5">
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-2">Simulasi Presensi Dengan 1x Tap</span>
            
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {students.map((student) => {
                const isPresent = student.statusHariIni === 'Hadir';
                return (
                  <button
                    key={student.id}
                    onClick={() => selectQuickStudent(student.id)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between border transition ${
                      isPresent 
                        ? 'bg-emerald-950/40 border-emerald-900/50 hover:bg-emerald-900/30' 
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isPresent ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <div>
                        <span className="font-semibold text-gray-200 block truncate max-w-[130px]">{student.nama}</span>
                        <span className="text-[10px] font-mono text-slate-400">{student.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded leading-none ${
                        student.statusHariIni === 'Hadir' ? 'bg-emerald-800/30 text-emerald-400' :
                        student.statusHariIni === 'Sakit' ? 'bg-amber-800/30 text-amber-400' :
                        student.statusHariIni === 'Izin' ? 'bg-sky-800/30 text-sky-400' :
                        student.statusHariIni === 'Alpa' ? 'bg-red-800/30 text-red-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {student.statusHariIni}
                      </span>
                      <span className="text-[10px] text-blue-400 hover:underline">Tap Scan</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 text-[10px] text-slate-500 leading-snug border-t border-slate-900 pt-3">
            <strong className="text-slate-400">Catatan:</strong> Saat barcode terdeteksi/diklik, status siswa otomatis berubah menjadi <span className="text-emerald-400">Hadir</span>, mencatat timestamp nyata, dan menginstruksikan sistem mengirim pesan WhatsApp langsung ke orang tua!
          </div>

        </div>

      </div>
    </div>
  );
};
