import React, { useState, useEffect } from 'react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_SCHEDULES, 
  INITIAL_NOTIFICATIONS 
} from './mockData';
import { Student, DaySchedule, NotificationLog, NilaiRecord } from './types';
import { StudentCard } from './components/StudentCard';
import { BarcodeScanner } from './components/BarcodeScanner';
import { NotificationFeed } from './components/NotificationFeed';
import { TeacherDashboard } from './components/TeacherDashboard';
import { 
  School, Sliders, Smartphone, Calendar, Award, 
  Bell, Volume2, Sparkles, HelpCircle, CheckCircle, 
  BookOpen, Users, LogIn
} from 'lucide-react';

export default function App() {
  // Load persistent datasets from localStorage on mount, or fallback to mock template
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('manajemen_kelas_siswa');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [schedules, setSchedules] = useState<DaySchedule[]>(() => {
    const saved = localStorage.getItem('manajemen_kelas_jadwal');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('manajemen_kelas_notif');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Navigation personas:
  // - 'all': Developer hybrid workspace (displays scanner, smartphone, and dashboard side-by-side for instant simulation)
  // - 'absen': Front-office check-in console
  // - 'guru': Teacher administration desktop
  const [appPerspective, setAppPerspective] = useState<'all' | 'absen' | 'guru'>('all');
  
  // Real-time notification banners
  const [activeBanner, setActiveBanner] = useState<{ message: string; channel: string } | null>(null);

  // Auto notification triggers
  const [autoSendPresensi, setAutoSendPresensi] = useState<boolean>(true);
  const [autoSendNilai, setAutoSendNilai] = useState<boolean>(true);

  // Last scanned barcode item status representation
  const [lastScanResult, setLastScanResult] = useState<{ name: string; id: string; time: string; success: boolean } | null>(null);
  
  // Help instructions drawer visibility
  const [showHelp, setShowHelp] = useState<boolean>(true);

  // Synchronize localStorage with up-to-date state
  useEffect(() => {
    localStorage.setItem('manajemen_kelas_siswa', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('manajemen_kelas_jadwal', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('manajemen_kelas_notif', JSON.stringify(notifications));
  }, [notifications]);

  // Audio success notification tone using Web Audio API
  const playBeepTone = (frequency: number = 800, length: number = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + length);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + length);
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  };

  // Trigger automated parent notifications
  const triggerParentNotification = (
    student: Student, 
    type: 'presensi' | 'nilai', 
    message: string, 
    channel: 'WhatsApp' | 'SMS' | 'Email'
  ) => {
    const timestamp = new Date();
    const formattedTime = timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = timestamp.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    const isAllowed = type === 'presensi' ? autoSendPresensi : autoSendNilai;

    if (isAllowed) {
      const newLog: NotificationLog = {
        id: `notif-${Date.now()}`,
        studentId: student.id,
        studentName: student.nama,
        tipe: type,
        pesan: message,
        channel: channel,
        status: 'Terkirim',
        waktu: `${formattedDate} ${formattedTime}`
      };

      setNotifications(prev => [newLog, ...prev]);

      // Highlight with toast banner
      setActiveBanner({
        message: `Kirim Notifikasi ${channel} Ke Orang Tua: "${message}"`,
        channel: channel
      });

      // Clear banner after delay
      setTimeout(() => {
        setActiveBanner(null);
      }, 5000);
    }
  };

  // Handler for student Barcode scan
  const handleBarcodeScanned = (studentId: string) => {
    const originalStudent = students.find(s => s.id === studentId);
    
    if (!originalStudent) {
      playBeepTone(400, 0.3); // low error beep
      setLastScanResult({
        name: 'ID Tidak Terdaftar',
        id: studentId,
        time: new Date().toLocaleTimeString('id-ID'),
        success: false
      });
      return;
    }

    // Success code check-in
    playBeepTone(1100, 0.1); 
    setTimeout(() => playBeepTone(1400, 0.15), 80); // cheerful double beep

    const timestamp = new Date();
    const formattedTime = timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = timestamp.toISOString().split('T')[0];

    // Update attendance state
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        // Prevent duplicate logs for same calendar date
        const hasHistoryToday = s.presensi.some(p => p.tanggal === formattedDate);
        const updatedPresensi = hasHistoryToday 
          ? s.presensi.map(p => p.tanggal === formattedDate ? { ...p, status: 'Hadir' as const, waktu: formattedTime } : p)
          : [...s.presensi, { tanggal: formattedDate, status: 'Hadir' as const, waktu: formattedTime }];

        return {
          ...s,
          statusHariIni: 'Hadir' as const,
          presensi: updatedPresensi
        };
      }
      return s;
    }));

    setLastScanResult({
      name: originalStudent.nama,
      id: studentId,
      time: formattedTime,
      success: true
    });

    // Auto Dispatch Notification to parent (specifically WhatsApp for presence check in)
    const customMessage = `PRESENSI HARIAN: Siswa ${originalStudent.nama} (${originalStudent.id}) dikonfirmasi HADIR di kelas pada pukul ${formattedTime}. Tetap semangat belajar!`;
    triggerParentNotification(originalStudent, 'presensi', customMessage, 'WhatsApp');
  };

  // Handler for manually changing student presence on grid
  const handleUpdateAttendanceManual = (studentId: string, status: Student['statusHariIni']) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const formattedDate = new Date().toISOString().split('T')[0];
    const formattedTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const hasHistoryToday = s.presensi.some(p => p.tanggal === formattedDate);
        let updatedHistory = [...s.presensi];
        
        if (status !== 'Belum Presensi') {
          if (hasHistoryToday) {
            updatedHistory = s.presensi.map(p => p.tanggal === formattedDate ? { ...p, status: status, waktu: formattedTime } : p);
          } else {
            updatedHistory.push({ tanggal: formattedDate, status: status, waktu: formattedTime });
          }
        } else {
          updatedHistory = s.presensi.filter(p => p.tanggal !== formattedDate);
        }

        return {
          ...s,
          statusHariIni: status,
          presensi: updatedHistory
        };
      }
      return s;
    }));

    // Trigger parent warning alert based on updated state
    let messageText = '';
    let channelSelect: 'WhatsApp' | 'SMS' | 'Email' = 'WhatsApp';

    if (status === 'Hadir') {
      messageText = `PRESENSI ONLINE: Siswa ${student.nama} dikonfirmasi HADIR di kelas pukul ${formattedTime}.`;
    } else if (status === 'Sakit') {
      messageText = `PERIZINAN SAKIT: Orang tua siswa ${student.nama} mengonfirmasi kondisi siswa SAKIT hari ini. Semoga lekas sembuh.`;
      channelSelect = 'WhatsApp';
    } else if (status === 'Izin') {
      messageText = `SURAT IZIN: Siswa ${student.nama} terkonfirmasi IZIN untuk urusan mendesak keluarga hari ini.`;
      channelSelect = 'SMS';
    } else if (status === 'Alpa') {
       messageText = `ALERTI KETIDAKHADIRAN (ALPA): Kelas dimulai pukul 07:00, namun siswa ${student.nama} belum terpindai di absensi barcode kelas tanpa ada keterangan wali.`;
       channelSelect = 'SMS';
    }

    if (messageText) {
      triggerParentNotification(student, 'presensi', messageText, channelSelect);
    }
  };

  // Handler for appending grade point in database
  const handleAddNewGrade = (
    studentId: string, 
    mapel: string, 
    jenis: NilaiRecord['jenis'], 
    score: number, 
    desc: string
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const formattedDate = new Date().toISOString().split('T')[0];
    const newGrade: NilaiRecord = {
      id: `gl-${Date.now()}`,
      mapel,
      jenis,
      nilai: score,
      tanggal: formattedDate,
      keterangan: desc
    };

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          nilai: [newGrade, ...s.nilai]
        };
      }
      return s;
    }));

    // Dynamic congratulation messages when posting a transcript
    const congratsText = score >= 88 ? 'Sangat Memuaskan! 🎉' : score >= 75 ? 'Baik.' : 'Perlu Pendampingan Tambahan.';
    const notificationMessage = `LAPORAN AKADEMIK REAL-TIME: Siswa ${student.nama} memperoleh nilai ${score} pada ${jenis} [Mata Pelajaran: ${mapel}${desc ? ` - Materi: ${desc}` : ''}]. Perkembangan: ${congratsText}`;
    
    // Auto-fire notification using email/sms channels
    triggerParentNotification(student, 'nilai', notificationMessage, 'Email');
  };

  // Registrar register student
  const handleAddStudent = (studentData: Omit<Student, 'presensi' | 'nilai' | 'statusHariIni'>) => {
    const defaultStudent: Student = {
      ...studentData,
      statusHariIni: 'Belum Presensi',
      presensi: [],
      nilai: []
    };
    setStudents(prev => [...prev, defaultStudent]);
  };

  // Delete student profile Completely
  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  // Reset entire application database
  const handleResetApplicationData = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data aplikasi Manajemen Kelas kembali ke setelan pabrik? Tindakan ini tidak dapat dibatalkan.')) {
      localStorage.removeItem('manajemen_kelas_siswa');
      localStorage.removeItem('manajemen_kelas_jadwal');
      localStorage.removeItem('manajemen_kelas_notif');
      setStudents(INITIAL_STUDENTS);
      setSchedules(INITIAL_SCHEDULES);
      setNotifications(INITIAL_NOTIFICATIONS);
      setLastScanResult(null);
      alert('Data aplikasi berhasil disetel ulang sepenuhnya.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] text-slate-800 font-sans" id="application-classroom-layout">
      
      {/* Top Automated parents WhatsApp/SMS Webhook Overlay Toast banner */}
      {activeBanner && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-emerald-500/30 animate-bounce duration-1000">
          <div className="flex items-center gap-2 mb-1.5 justify-between">
            <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-950/40">
              ⚡ Webhook Transmitted
            </span>
            <span className="text-[10px] text-slate-400">Hub Terkirim</span>
          </div>
          <p className="text-xs text-slate-200 leading-snug">{activeBanner.message}</p>
        </div>
      )}

      {/* Main Header School Card */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
          {/* Subtle grid background for header card */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-550/20 flex items-center justify-center text-white shrink-0 shadow-lg">
                <School className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-semibold text-indigo-350 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900/40">
                    Sistem Manajemen Kelas
                  </span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span className="text-[10px] font-mono text-slate-400">Konek Webhook Aktif</span>
                </div>
                <h1 className="font-extrabold text-xl md:text-2xl tracking-tight text-white mt-1.5 flex items-center gap-2">
                  CLASSLINK <span className="text-xs text-slate-400 font-mono font-normal">v2.8.1</span>
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  SMK Negeri 1 Belajar • Wali Kelas: <strong className="text-white">Pak Ridwan, S.Kom</strong> (<span className="font-mono text-indigo-300 text-[11px]">ridwan803@guru.smk.belajar.id</span>)
                </p>
              </div>
            </div>

            {/* Perspective View Controllers */}
            <div className="flex bg-slate-950/80 border border-slate-800 rounded-2xl p-1 shrink-0 select-none backdrop-blur-md">
              <button
                onClick={() => setAppPerspective('all')}
                className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  appPerspective === 'all'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                type="button"
              >
                <Sliders className="w-3.5 h-3.5" />
                Semua Workspace
              </button>
              <button
                onClick={() => setAppPerspective('absen')}
                className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  appPerspective === 'absen'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                type="button"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Terminal Absen
              </button>
              <button
                onClick={() => setAppPerspective('guru')}
                className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  appPerspective === 'guru'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                type="button"
              >
                <School className="w-3.5 h-3.5" />
                Dasbor Guru
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Work Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Interactive Step-by-Step Help Guide Block */}
        {showHelp && (
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-start gap-4 justify-between relative overflow-hidden" id="guide-alert-system">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-indigo-55/80 border border-indigo-100 flex items-center justify-center text-indigo-600 bg-indigo-50 shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5 text-indigo-600 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-1.5 font-sans">
                  Alur Pengujian Guru & Wali Murid (Live Demo Guide)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
                  Sistem ini dirancang untuk menunjukkan integrasi real-time antara <strong className="text-slate-700">Presensi Barcode Siswa</strong>, <strong className="text-slate-700">Laporan Nilai Akademik</strong>, dan <strong className="text-slate-700">Notifikasi Terotomatisasi</strong> ke nomor WhatsApp orang tua. Coba langkah berikut:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  <p className="p-3 bg-slate-50 rounded-2xl border border-slate-100"><strong className="text-slate-850 block mb-1">1️⃣ Pindai / Absen:</strong> Klik "Pindai / Absen" di kartu siswa di bawah, atau ketikkan ID NIS di mesin pemindai barcode di sebelah kanan.</p>
                  <p className="p-3 bg-slate-50 rounded-2xl border border-slate-100"><strong className="text-slate-850 block mb-1">2️⃣ Notifikasi Wali:</strong> Lihat layar simulasi smartphone orang tua menyala secara live menerima pesan WhatsApp kehadiran detik itu juga.</p>
                  <p className="p-3 bg-slate-50 rounded-2xl border border-slate-100"><strong className="text-slate-850 block mb-1">3️⃣ Laporan Nilai:</strong> Tukar menu ke Dasbor Guru untuk mengunggah poin nilai kuis - secara instan nilai rata-rata akan terhitung dan mengirim notifikasi email.</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowHelp(false)}
              className="text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 font-mono py-1 px-3 rounded-lg shrink-0 border border-slate-200 transition-all z-10 cursor-pointer"
              type="button"
            >
              Sembunyikan
            </button>
          </div>
        )}

        {/* PERSPECTIVE SWITCH: SCANNERS & PARENTS HUB VIEW */}
        {(appPerspective === 'all' || appPerspective === 'absen') && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="font-extrabold text-slate-800 text-base md:text-lg flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-650" />
                Terminal Mesin Presensi Barcode & Notifikasi Orang Tua
              </h2>
              {appPerspective === 'absen' && (
                <span className="text-xs font-semibold text-slate-550 font-mono bg-slate-100 px-2 py-0.5 rounded border">Absensi Kios Mode</span>
              )}
            </div>

            {/* Layout Scanner widget on Left + Smartphone feed on Right side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Absen Scanning Device hardware display emulator */}
              <div className="lg:col-span-6 xl:col-span-5 h-full">
                <BarcodeScanner
                  students={students}
                  onBarCodeScanned={handleBarcodeScanned}
                  lastScannedResult={lastScanResult}
                />
              </div>

              {/* Parents Communication smartphone widget tracker */}
              <div className="lg:col-span-6 xl:col-span-7 h-full">
                <NotificationFeed
                  notifications={notifications}
                  onClearLogs={() => setNotifications([])}
                  autoSendPresensi={autoSendPresensi}
                  setAutoSendPresensi={setAutoSendPresensi}
                  autoSendNilai={autoSendNilai}
                  setAutoSendNilai={setAutoSendNilai}
                />
              </div>

            </div>

            {/* Grid list of student Cards to easily "Print/Simulate Scan" click */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Daftar Kartu Pelajar Siswa (Barcode Tersemat)
                  </h3>
                  <p className="text-[11px] text-slate-450">Setiap siswa memiliki barcode NIS unik secara visual. Gunakan tombol "Pindai / Absen" untuk mensimulasikan sorotan laser kamera fisik.</p>
                </div>
                <div className="text-xs font-semibold text-slate-500 font-mono">
                  Siswa Terdaftar: <strong className="text-slate-800">{students.length} Orang</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onScan={handleBarcodeScanned}
                    onSelect={(st) => {
                      setAppPerspective('guru');
                    }}
                    isActive={lastScanResult?.id === student.id}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* PERSPECTIVE SWITCH: TEACHER DASHBOARD CONTROL CENTER */}
        {(appPerspective === 'all' || appPerspective === 'guru') && (
          <div className="space-y-6 pt-6 border-t-2 border-dashed border-slate-200/50">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="font-extrabold text-slate-800 text-base md:text-lg flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-650 animate-pulse" />
                Area Administrasi & Dasbor Evaluasi Guru Kelas
              </h2>
              {appPerspective === 'guru' && (
                <span className="text-xs font-semibold text-indigo-650 font-mono bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">Guru Desktop Mode</span>
              )}
            </div>

            <TeacherDashboard
              students={students}
              schedules={schedules}
              onUpdateAttendance={handleUpdateAttendanceManual}
              onAddGrade={handleAddNewGrade}
              onAddStudent={handleAddStudent}
              onUpdateSchedules={setSchedules}
              onDeleteStudent={handleDeleteStudent}
            />

          </div>
        )}

      </main>

      {/* Footer System Credits */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-200 text-sm tracking-wide">SMK Negeri 1 Belajar</h5>
            <p className="text-slate-500 pr-4 max-w-sm">Aplikasi Manajemen Kelas Siswa terintegrasi sub-sistem presensi barcode harian, pangkalan penilaian semesteran, dan notifikasi orang tua.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-[11px] font-mono">
            <button
              onClick={handleResetApplicationData}
              className="text-rose-400 hover:text-rose-300 hover:underline hover:bg-rose-950/20 py-1 px-2 rounded-md border border-rose-900/45 transition"
              type="button"
            >
              Reset Data Pabrik
            </button>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span>Versi Stabil v2.8.1-Production</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
