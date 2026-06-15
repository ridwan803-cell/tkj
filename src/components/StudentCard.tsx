import React from 'react';
import { Student } from '../types';
import { Eye, Check, Calendar, Award, Phone } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onScan: (studentId: string) => void;
  onSelect: (student: Student) => void;
  isActive: boolean;
}

// Custom dynamic functional Barcode rendering (Code 128 style representation)
// Maps string characters to custom line widths in SVG format
export const BarcodeSVG: React.FC<{ value: string; height?: number; width?: number }> = ({ 
  value, 
  height = 42, 
  width = 180 
}) => {
  // Simple deterministic generation of bar widths based on characters in input
  const getBars = (str: string) => {
    let result = '';
    const cleanStr = str.replace(/[^A-Z0-9-]/g, '');
    for (let i = 0; i < cleanStr.length; i++) {
      const charCode = cleanStr.charCodeAt(i);
      // Produce a sequence of 1s (thick/thin bars) and 0s (gaps)
      const pattern = (charCode * 9876543) % 10000;
      const bin = pattern.toString(2).padStart(12, '0');
      result += bin;
    }
    // Make sure we end with a solid bar sequence
    result += '110011';
    return result;
  };

  const bars = getBars(value);
  const totalBars = bars.length;
  const barWidth = width / totalBars;

  return (
    <div className="flex flex-col items-center select-none" id={`barcode-${value}`}>
      <svg width={width} height={height} className="overflow-visible" style={{ shapeRendering: 'crispEdges' }}>
        <g fill="currentColor">
          {bars.split('').map((bit, index) => {
            if (bit === '1') {
              return (
                <rect
                  key={index}
                  x={index * barWidth}
                  y={0}
                  width={barWidth * 1.1} // overlap slightly to prevent pixel gap artifacts
                  height={height}
                />
              );
            }
            return null;
          })}
        </g>
      </svg>
      <span className="text-[10px] tracking-widest font-mono text-gray-500 mt-1 uppercase">
        {value}
      </span>
    </div>
  );
};

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onScan,
  onSelect,
  isActive
}) => {
  const getStatusStyle = (status: Student['statusHariIni']) => {
    switch (status) {
      case 'Hadir': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Sakit': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Izin': return 'bg-sky-50 text-sky-700 border-sky-300';
      case 'Alpa': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div 
      className={`relative flex flex-col bg-white/90 backdrop-blur-md border overflow-hidden transition-all duration-300 rounded-3xl ${
        isActive 
          ? 'ring-2 ring-indigo-500 border-transparent shadow-md transform scale-[1.01]' 
          : 'border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs'
      }`}
      id={`student-card-${student.id}`}
    >
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Identity Row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl ${student.avatarColor} text-white flex items-center justify-center font-bold text-lg shadow-sm border border-black/5 shrink-0`}>
                {student.nama.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 leading-snug text-sm tracking-tight line-clamp-1">
                  {student.nama}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">{student.id}</p>
              </div>
            </div>
            
            <span className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-xl border ${getStatusStyle(student.statusHariIni)}`}>
              {student.statusHariIni}
            </span>
          </div>

          {/* Quick info badges */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center text-xs text-slate-600 gap-2">
              <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1"><strong className="text-slate-700 font-semibold">Orang Tua:</strong> {student.parentName}</span>
            </div>
            <div className="flex items-center text-xs text-slate-600 gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-slate-550">{student.parentPhone}</span>
            </div>
            <div className="flex items-center text-xs text-slate-600 gap-2 mt-3 pt-3 border-t border-slate-100 font-mono">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Hadir: <strong className="text-indigo-600">{student.presensi.filter(p => p.status === 'Hadir').length}x</strong></span>
              <span className="text-slate-300">•</span>
              <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Avg: <strong className="text-emerald-600">
                {student.nilai.length > 0 
                  ? Math.round(student.nilai.reduce((acc, curr) => acc + curr.nilai, 0) / student.nilai.length)
                  : '--'}
              </strong></span>
            </div>
          </div>
        </div>

        {/* Real-time Dynamic Student Card Barcode Block */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center">
          <BarcodeSVG value={student.id} />
          
          <div className="mt-4 w-full flex gap-2 pt-1">
            <button
              onClick={() => onScan(student.id)}
              className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 cursor-pointer"
              id={`btn-scan-${student.id}`}
              type="button"
            >
              <Check className="w-3.5 h-3.5" />
              Pindai / Absen
            </button>
            
            <button
              onClick={() => onSelect(student)}
              className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-xs font-bold flex items-center justify-center transition-all border border-slate-200 cursor-pointer"
              title="Lihat Detail & Laporan Nilai"
              type="button"
            >
              Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
