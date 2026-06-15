import React, { useState } from 'react';
import { NotificationLog } from '../types';
import { Bell, Smartphone, Send, ShieldAlert, CheckCheck, Trash2, Filter, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

interface NotificationFeedProps {
  notifications: NotificationLog[];
  onClearLogs: () => void;
  autoSendPresensi: boolean;
  setAutoSendPresensi: (val: boolean) => void;
  autoSendNilai: boolean;
  setAutoSendNilai: (val: boolean) => void;
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({
  notifications,
  onClearLogs,
  autoSendPresensi,
  setAutoSendPresensi,
  autoSendNilai,
  setAutoSendNilai
}) => {
  const [activeChannelFilter, setActiveChannelFilter] = useState<'Semua' | 'WhatsApp' | 'SMS' | 'Email'>('Semua');

  const filteredLogs = notifications.filter(log => {
    if (activeChannelFilter === 'Semua') return true;
    return log.channel === activeChannelFilter;
  });

  // Take the very latest notification to display on our mock smartphone screen
  const latestNotification = notifications[0] || null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="notification-parents-hub">
      
      {/* Left Columns - Notification logs panel */}
      <div className="xl:col-span-8 bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-slate-350 transition-all duration-300 flex flex-col justify-between">
        <div>
          {/* Section title & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500 shrink-0" />
                Log Transmisi Notifikasi Orang Tua
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pemantauan real-time status pengiriman pesan otomatis (SMS/WhatsApp/Email) ke nomor kontak wali murid.
              </p>
            </div>
            
            {notifications.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 py-1 px-2.5 rounded-lg border border-rose-100 flex items-center gap-1.5 transition-colors shrink-0"
                type="button"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Semua Log
              </button>
            )}
          </div>

          {/* Trigger rules controllers */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                <Settings className="w-4 h-4 text-indigo-600" />
                Konfigurasi Syarat Trigger Pesan
              </h4>
              <p className="text-[11px] text-slate-500">
                Pilih aksi yang memicu transmisi notifikasi secara langsung ke telepon genggam orang tua.
              </p>
            </div>
            <div className="space-y-2.5 flex flex-col justify-center">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Absensi Barcode 👉 WhatsApp Orang Tua
                </span>
                <button
                  onClick={() => setAutoSendPresensi(!autoSendPresensi)}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                  type="button"
                >
                  {autoSendPresensi ? (
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      ON <ToggleRight className="w-6 h-6 shrink-0" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-slate-400">
                      OFF <ToggleLeft className="w-6 h-6 shrink-0" />
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Rilis Laporan Nilai Baru 👉 Email & SMS
                </span>
                <button
                  onClick={() => setAutoSendNilai(!autoSendNilai)}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                  type="button"
                >
                  {autoSendNilai ? (
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      ON <ToggleRight className="w-6 h-6 shrink-0" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-slate-400">
                      OFF <ToggleLeft className="w-6 h-6 shrink-0" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filters for logs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            <span className="text-slate-400 text-xs flex items-center gap-1 font-mono uppercase bg-slate-105 mr-1 py-0.5 px-2 rounded font-bold">
              <Filter className="w-3 h-3 text-slate-500" />
              Kontak
            </span>
            {(['Semua', 'WhatsApp', 'SMS', 'Email'] as const).map(channel => (
              <button
                key={channel}
                onClick={() => setActiveChannelFilter(channel)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                  activeChannelFilter === channel
                    ? 'bg-indigo-600 text-white border-transparent'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                type="button"
              >
                {channel}
              </button>
            ))}
          </div>

          {/* Log List View */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const getChannelStyles = (chan: typeof log.channel) => {
                  switch (chan) {
                    case 'WhatsApp': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    case 'SMS': return 'bg-amber-50 text-amber-700 border-amber-200';
                    case 'Email': return 'bg-blue-55 text-blue-700 border-blue-200 bg-blue-50';
                  }
                };

                return (
                  <div 
                    key={log.id} 
                    className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-100/60 transition-all flex flex-col md:flex-row md:items-start md:justify-between gap-3"
                    id={`notif-item-${log.id}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${getChannelStyles(log.channel)}`}>
                          {log.channel}
                        </span>
                        
                        <span className="text-xs font-semibold text-slate-800">
                          {log.studentName}
                        </span>
                        <span className="text-slate-300 text-xs">|</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {log.waktu}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                        {log.pesan}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center md:flex-col md:items-end gap-1 px-1">
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-650" />
                        Tembus Orang Tua
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-mono">Belum ada aktivitas transimi log notifikasi saat ini.</p>
                <p className="text-slate-400 text-[10px] mt-1">Ubah atau pndai presensi barcode siswa untuk memicu pesan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Warning Alert */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-450 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span>Sistem sinkronisasi notifikasi real-time aktif menggunakan submodul webhook sekolah lokal.</span>
        </div>
      </div>

      {/* Right Column - Parental Mobile Phone UI Simulator */}
      <div className="xl:col-span-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-slate-350 transition-all duration-300 flex flex-col items-center justify-between" id="parents-mobile-simulator">
        <div className="w-full text-center pb-4 mb-4 border-b border-slate-100">
          <h4 className="font-bold text-slate-800 text-xs tracking-wider uppercase font-mono bg-slate-50 py-2 px-4 rounded-xl border border-slate-200 inline-flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-slate-500 font-bold" />
            SIMULATOR HP WALI
          </h4>
        </div>
        <div className="w-full flex justify-center flex-1 flex-col items-center py-2">
        <div className="w-full max-w-[280px] bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-700 relative">
          
          {/* Speaker, camera notch */}
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-10 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-slate-850 rounded-full" />
            <span className="w-10 h-1 bg-slate-800 rounded-full" />
          </div>

          {/* Screen Content */}
          <div className="bg-slate-950 aspect-[9/18] w-full rounded-[28px] overflow-hidden p-3.5 pt-7 flex flex-col justify-between relative text-white bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.85), rgba(71,85,105,0.7)), url("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300")' }}>
            
            {/* Status Bar */}
            <div className="flex justify-between items-center text-[10px] font-mono font-medium px-1 text-slate-200 select-none">
              <span>07:22</span>
              <div className="flex items-center gap-1">
                <span>LTE</span>
                <span className="w-4 h-2 border border-slate-300 rounded-sm flex items-center px-0.5">
                  <span className="w-2 h-1 bg-emerald-400 rounded-2xs" />
                </span>
              </div>
            </div>

            {/* Notification App Bubble Container */}
            <div className="mt-4 flex-1 flex flex-col justify-start space-y-3 overflow-y-auto max-h-[300px] scrollbar-none">
              
              {latestNotification ? (
                <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-3 shadow-lg text-[11px] text-slate-100 animate-bounce duration-500">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-slate-400">
                    <span className="font-semibold flex items-center gap-1">
                      <Send className="w-3 h-3 text-emerald-400 shrink-0" />
                      {latestNotification.channel} Wali
                    </span>
                    <span className="text-[9px]">Baru saja</span>
                  </div>
                  <div>
                    <h6 className="font-bold text-slate-200">{latestNotification.studentName}</h6>
                    <p className="text-slate-350 mt-0.5 leading-tight">{latestNotification.pesan}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-12 text-[10px]">
                  <p>Mencoba mensimulasikan layar ponsel cerdas orang tua.</p>
                  <p className="text-slate-500 mt-2">Belum ada notifikasi baru untuk ditampilkan.</p>
                </div>
              )}
              
              {/* Fake secondary app placeholder */}
              <div className="bg-slate-900/60 rounded-xl p-2.5 text-[10px] text-slate-400 border border-slate-800/20">
                <div className="flex items-center justify-between pb-1 text-slate-405">
                  <span className="font-semibold">Kalender Sekolah</span>
                  <span>1j yang lalu</span>
                </div>
                <p className="text-slate-350 line-clamp-1">Rapat komite orang tua murid dijadwalkan...</p>
              </div>

            </div>

            {/* Lockscreen footer icons */}
            <div className="flex justify-between items-center px-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-800/40 backdrop-blur-sm flex items-center justify-center text-slate-300 transform scale-90">
                📞
              </div>
              <div className="h-1 w-24 bg-slate-500/80 rounded-full" />
              <div className="w-8 h-8 rounded-full bg-slate-800/40 backdrop-blur-sm flex items-center justify-center text-slate-300 transform scale-90">
                📷
              </div>
            </div>

          </div>
        </div>
      </div>
        
        <p className="text-[11px] text-slate-450 font-medium mt-4 text-center max-w-[240px] font-mono uppercase tracking-wide">
          HP WALI SISWA: <strong>{latestNotification?.studentName || "SIAGA"}</strong>
        </p>
      </div>

    </div>
  );
};
