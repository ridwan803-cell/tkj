import React, { useState } from 'react';
import { Student, DaySchedule, NilaiRecord, SubjectSchedule } from '../types';
import { 
  Users, Calendar, GraduationCap, Plus, Save, Search, 
  Trash2, Edit, AlertCircle, Sparkles, Filter, Check, 
  MapPin, Clock, BookOpen, Clock3, Award, TrendingUp, HelpCircle
} from 'lucide-react';
import { BarcodeSVG } from './StudentCard';

interface TeacherDashboardProps {
  students: Student[];
  schedules: DaySchedule[];
  onUpdateAttendance: (studentId: string, status: Student['statusHariIni']) => void;
  onAddGrade: (studentId: string, mapel: string, jenis: NilaiRecord['jenis'], score: number, desc: string) => void;
  onAddStudent: (studentData: Omit<Student, 'presensi' | 'nilai' | 'statusHariIni'>) => void;
  onUpdateSchedules: (schedules: DaySchedule[]) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  schedules,
  onUpdateAttendance,
  onAddGrade,
  onAddStudent,
  onUpdateSchedules,
  onDeleteStudent
}) => {
  const [activeTab, setActiveTab] = useState<'presensi' | 'nilai' | 'jadwal' | 'siswa'>('presensi');
  
  // Search states
  const [studentSearch, setStudentSearch] = useState<string>('');
  
  // Grade Form State
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<string>('');
  const [gradeSubject, setGradeSubject] = useState<string>('Informatika');
  const [gradeType, setGradeType] = useState<NilaiRecord['jenis']>('Tugas');
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeDesc, setGradeDesc] = useState<string>('');
  const [gradeSuccessMsg, setGradeSuccessMsg] = useState<string>('');

  // Register Student Form State
  const [newStudentNIS, setNewStudentNIS] = useState<string>('');
  const [newStudentNama, setNewStudentNama] = useState<string>('');
  const [newStudentGender, setNewStudentGender] = useState<'L' | 'P'>('L');
  const [newStudentParent, setNewStudentParent] = useState<string>('');
  const [newStudentPhone, setNewStudentPhone] = useState<string>('');
  const [newStudentEmail, setNewStudentEmail] = useState<string>('');
  const [studentSuccessMsg, setStudentSuccessMsg] = useState<string>('');

  // Schedule Active State
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [newScheduleMapel, setNewScheduleMapel] = useState<string>('');
  const [newScheduleStart, setNewScheduleStart] = useState<string>('07:00');
  const [newScheduleEnd, setNewScheduleEnd] = useState<string>('08:30');
  const [newScheduleGuru, setNewScheduleGuru] = useState<string>('');
  const [newScheduleRoom, setNewScheduleRoom] = useState<string>('');

  // Auto Generate NIS suggestion on mounting student tab
  const suggestNIS = () => {
    const randomNisNum = Math.floor(100000 + Math.random() * 900000);
    setNewStudentNIS(`NIS-26${randomNisNum.toString().slice(0,4)}`);
  };

  // Stats Counters
  const totalStudents = students.length;
  const presentCount = students.filter(s => s.statusHariIni === 'Hadir').length;
  const sickCount = students.filter(s => s.statusHariIni === 'Sakit').length;
  const permittedCount = students.filter(s => s.statusHariIni === 'Izin').length;
  const absentCount = students.filter(s => s.statusHariIni === 'Alpa').length;
  const pendingCount = students.filter(s => s.statusHariIni === 'Belum Presensi').length;

  const attendanceRate = totalStudents > 0 
    ? Math.round((presentCount / totalStudents) * 100) 
    : 0;

  // Grade Reports Calculations
  const classGradeRecords = students.flatMap(s => s.nilai);
  const overallAvgGrade = classGradeRecords.length > 0
    ? Math.round(classGradeRecords.reduce((acc, curr) => acc + curr.nilai, 0) / classGradeRecords.length)
    : 0;

  const subjectsList = Array.from(new Set(classGradeRecords.map(r => r.mapel)));

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForGrade) {
      alert("Silakan pilih siswa terlebih dahulu!");
      return;
    }
    onAddGrade(selectedStudentForGrade, gradeSubject, gradeType, gradeScore, gradeDesc);
    setGradeSuccessMsg(`Nilai ${gradeType} ${gradeSubject} berhasil ditambahkan!`);
    setGradeDesc('');
    setTimeout(() => setGradeSuccessMsg(''), 4000);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentNIS || !newStudentNama || !newStudentParent || !newStudentPhone) {
      alert("Mohon lengkapi seluruh kolom wajib pendaftaran!");
      return;
    }

    // Check duplicate ID
    if (students.some(s => s.id === newStudentNIS)) {
      alert("Siswa dengan NIS ini sudah terdaftar!");
      return;
    }

    const availableColors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-cyan-500'];
    const randomBgColor = availableColors[Math.floor(Math.random() * availableColors.length)];

    onAddStudent({
      id: newStudentNIS,
      nama: newStudentNama,
      gender: newStudentGender,
      parentName: newStudentParent,
      parentPhone: newStudentPhone,
      parentEmail: newStudentEmail || `${newStudentNama.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      avatarColor: randomBgColor
    });

    setStudentSuccessMsg(`Siswa ${newStudentNama} berhasil didaftarkan! Barcode siswa otomatis terbuat.`);
    setNewStudentNama('');
    setNewStudentNIS('');
    setNewStudentParent('');
    setNewStudentPhone('');
    setNewStudentEmail('');
    setTimeout(() => setStudentSuccessMsg(''), 4000);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleMapel || !newScheduleGuru || !newScheduleRoom) {
      alert("Mohon lengkapi semua data jadwal!");
      return;
    }

    const revisedSchedules = schedules.map(daySch => {
      if (daySch.hari === selectedDay) {
        const payload: SubjectSchedule = {
          id: `sch-${Date.now()}`,
          mapel: newScheduleMapel,
          jamMulai: newScheduleStart,
          jamSelesai: newScheduleEnd,
          guru: newScheduleGuru,
          ruangan: newScheduleRoom
        };
        return {
          ...daySch,
          list: [...daySch.list, payload].sort((a, b) => a.jamMulai.localeCompare(b.jamMulai))
        };
      }
      return daySch;
    });

    onUpdateSchedules(revisedSchedules);
    setNewScheduleMapel('');
    setNewScheduleGuru('');
    setNewScheduleRoom('');
  };

  const handleDeleteSchedule = (day: string, schId: string) => {
    const revisedSchedules = schedules.map(daySch => {
      if (daySch.hari === day) {
        return {
          ...daySch,
          list: daySch.list.filter(s => s.id !== schId)
        };
      }
      return daySch;
    });
    onUpdateSchedules(revisedSchedules);
  };

  // Filter students by search term
  const filteredStudents = students.filter(s => 
    s.nama.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs rounded-3xl overflow-hidden" id="teacher-school-dashboard">
      
      {/* Tab Navigation Controls */}
      <div className="flex border-b border-slate-200/85 overflow-x-auto bg-slate-50/70 select-none">
        <button
          onClick={() => setActiveTab('presensi')}
          className={`flex-1 min-w-[130px] font-bold text-xs py-4 px-4 text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'presensi'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
          type="button"
        >
          <Users className="w-4 h-4 shrink-0" />
          MANAJEMEN PRESENSI
        </button>
        <button
          onClick={() => setActiveTab('nilai')}
          className={`flex-1 min-w-[130px] font-bold text-xs py-4 px-4 text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'nilai'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
          type="button"
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          LAPORAN NILAI ({overallAvgGrade})
        </button>
        <button
          onClick={() => setActiveTab('jadwal')}
          className={`flex-1 min-w-[130px] font-bold text-xs py-4 px-4 text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'jadwal'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
          type="button"
        >
          <Calendar className="w-4 h-4 shrink-0" />
          JADWAL PELAJARAN
        </button>
        <button
          onClick={() => { setActiveTab('siswa'); suggestNIS(); }}
          className={`flex-1 min-w-[130px] font-bold text-xs py-4 px-4 text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'siswa'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
          type="button"
        >
          <Plus className="w-4 h-4 shrink-0" />
          REGISTRASI SISWA
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="p-6">

        {/* TAB 1: MANAJEMEN PRESENSI */}
        {activeTab === 'presensi' && (
          <div className="space-y-6">
            
            {/* Header statistics section */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-indigo-50/30 border border-indigo-100/80 rounded-2xl p-4 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Presentase Hadir</span>
                <p className="font-bold text-xl text-indigo-700 mt-1">{attendanceRate}%</p>
                <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
                  <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
                </div>
              </div>
              <div className="bg-emerald-50/30 border border-emerald-100/80 rounded-2xl p-4 text-center">
                <span className="text-[9px] uppercase font-bold text-emerald-500 font-mono">Hadir Hari Ini</span>
                <p className="font-bold text-xl text-emerald-700 mt-1">{presentCount} <span className="text-xs font-normal text-slate-400">Siswa</span></p>
              </div>
              <div className="bg-amber-50/10 border border-amber-200/50 rounded-2xl p-4 text-center">
                <span className="text-[9px] uppercase font-bold text-amber-500 font-mono">Sakit</span>
                <p className="font-bold text-xl text-amber-700 mt-1">{sickCount} <span className="text-xs font-normal text-slate-400">Siswa</span></p>
              </div>
              <div className="bg-sky-50/30 border border-sky-100/80 rounded-2xl p-4 text-center">
                <span className="text-[9px] uppercase font-bold text-sky-500 font-mono">Izin</span>
                <p className="font-bold text-xl text-sky-700 mt-1">{permittedCount} <span className="text-xs font-normal text-slate-400">Siswa</span></p>
              </div>
              <div className="bg-rose-50/30 border border-rose-100/80 rounded-2xl p-4 col-span-2 md:col-span-1 text-center">
                <span className="text-[9px] uppercase font-bold text-rose-500 font-mono">Alpa / Belum</span>
                <p className="font-bold text-xl text-rose-700 mt-1">{absentCount + pendingCount} <span className="text-xs font-normal text-slate-400">Siswa</span></p>
              </div>
            </div>

            {/* Attendance Spreadsheet table */}
            <div className="bg-white border border-slate-150 rounded-xl overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari siswa dengan nama / NIS..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 text-xs rounded-lg placeholder:text-slate-400 bg-white focus:outline-none focus:border-blue-600 text-slate-800"
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                  Anda dapat mengubah data kehadiran langsung menggunakan tombol aksi cepat.
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase font-mono tracking-wider">
                    <tr>
                      <th className="p-4">Identitas Siswa</th>
                      <th className="p-4">Status Absensi Hari Ini</th>
                      <th className="p-4 text-center">Perbarui Manual</th>
                      <th className="p-4 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${student.avatarColor} text-white flex items-center justify-center font-bold text-xs`}>
                                {student.nama.charAt(0)}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-800 block leading-tight">{student.nama}</span>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{student.id} | Wali: {student.parentName}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] border ${
                              student.statusHariIni === 'Hadir' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              student.statusHariIni === 'Sakit' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              student.statusHariIni === 'Izin' ? 'bg-sky-50 text-sky-700 border-sky-300' :
                              student.statusHariIni === 'Alpa' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {student.statusHariIni}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1">
                              {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as const).map(status => (
                                <button
                                  key={status}
                                  onClick={() => onUpdateAttendance(student.id, status)}
                                  className={`px-2 py-1 rounded text-[10px] font-semibold border transition ${
                                    student.statusHariIni === status
                                      ? status === 'Hadir' ? 'bg-emerald-600 text-white border-emerald-600' :
                                        status === 'Sakit' ? 'bg-amber-500 text-white border-amber-500' :
                                        status === 'Izin' ? 'bg-sky-500 text-white border-sky-500' :
                                        'bg-rose-600 text-white border-rose-600'
                                      : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-650'
                                  }`}
                                  type="button"
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus data siswa ${student.nama}?`)) {
                                  onDeleteStudent(student.id);
                                }
                              }}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg border border-transparent hover:border-rose-100 transition-all inline-flex items-center gap-1 text-[11px]"
                              title="Hapus Siswa Permantent"
                              type="button"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Hapus
                            </button>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
                          Siswa tidak ditemukan. Silakan tambahkan siswa baru di tab Registrasi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}


        {/* TAB 2: LAPORAN NILAI */}
        {activeTab === 'nilai' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Block: Input New Grade point & Class analytics */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Analytics metric */}
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute right-3 bottom-0 text-slate-800 transform rotate-12 scale-[1.7]">
                  <GraduationCap className="w-20 h-20" />
                </div>
                <div className="relative">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-blue-400">Rataan Akademik Kelas</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-3xl font-extrabold">{overallAvgGrade}</h4>
                    <span className="text-xs text-slate-400">/ 100 poin (Akm)</span>
                  </div>
                  <p className="text-[11px] text-slate-350 mt-2">
                    Berdasarkan {classGradeRecords.length} total entri nilai yang tercatat pada subjek: <strong>{subjectsList.join(', ') || 'Informatika'}</strong>.
                  </p>
                </div>
              </div>

              {/* Form Input Score */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                  <Plus className="w-4 h-4 text-blue-600 shrink-0" />
                  Tambah Transkrip Nilai Real-time
                </h4>

                {gradeSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold mb-4 leading-normal flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-650" />
                    {gradeSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs">
                  
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Pilih Siswa Penerima</label>
                    <select
                      value={selectedStudentForGrade}
                      onChange={(e) => setSelectedStudentForGrade(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                      required
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.nama} ({s.id})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Mata Pelajaran</label>
                      <select
                        value={gradeSubject}
                        onChange={(e) => setGradeSubject(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none"
                      >
                        <option value="Informatika">Informatika</option>
                        <option value="Matematika">Matematika</option>
                        <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                        <option value="Bahasa Inggris">Bahasa Inggris</option>
                        <option value="Fisika">Fisika</option>
                        <option value="Kimia">Kimia</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Jenis Penilaian</label>
                      <select
                        value={gradeType}
                        onChange={(e) => setGradeType(e.target.value as NilaiRecord['jenis'])}
                        className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-none"
                      >
                        <option value="Tugas">Tugas Mandiri</option>
                        <option value="Kuis">Kuis Harian</option>
                        <option value="UTS">UTS (Semester)</option>
                        <option value="UAS">UAS (Semester)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Perolehan Nilai (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Keterangan Singkat</label>
                      <input
                        type="text"
                        placeholder="Contoh: Bab Algoritma"
                        value={gradeDesc}
                        onChange={(e) => setGradeDesc(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
                  >
                    <Save className="w-4 h-4" />
                    Simpan & Kirim Notifikasi Wali
                  </button>

                </form>
              </div>

            </div>

            {/* Right Block: Live Scoreboard Database */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Log Nilai Siswa Real-time
                </h4>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter nama siswa..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="border border-slate-200 pl-7 pr-2.5 py-1 text-[11px] rounded bg-slate-50 w-44"
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {students
                  .filter(s => s.nama.toLowerCase().includes(studentSearch.toLowerCase()))
                  .map(student => (
                    <div key={student.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-55 hover:bg-slate-50 transition border-l-4 border-l-indigo-500">
                      
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100/70">
                        <div>
                          <h5 className="font-semibold text-xs text-slate-800">{student.nama}</h5>
                          <span className="text-[10px] text-slate-440 font-mono italic">{student.id}</span>
                        </div>
                        <span className="text-[10px] text-indigo-700 font-bold font-mono uppercase bg-indigo-50 border border-indigo-100 px-2 rounded-full">
                          Kalkulasi Rata-rata: {student.nilai.length > 0 
                            ? Math.round(student.nilai.reduce((tot, item) => tot + item.nilai, 0) / student.nilai.length)
                            : '--'}
                        </span>
                      </div>

                      {student.nilai.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {student.nilai.map((grade) => (
                            <div key={grade.id} className="bg-white border border-slate-150 rounded-lg p-2 flex justify-between items-center relative">
                              <div>
                                <span className="font-semibold block text-slate-700 truncate max-w-[120px]">{grade.mapel}</span>
                                <span className="text-[9px] text-slate-400 font-mono uppercase block">{grade.jenis} • {grade.tanggal}</span>
                                {grade.keterangan && <span className="text-[9px] text-slate-500 line-clamp-1 italic">"{grade.keterangan}"</span>}
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                grade.nilai >= 85 ? 'bg-emerald-50 text-emerald-700 font-mono':
                                grade.nilai >= 75 ? 'bg-indigo-50 text-indigo-700 font-mono':
                                'bg-rose-50 text-rose-700 font-mono'
                              }`}>
                                {grade.nilai}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 block font-mono">Belum memiliki transkrip nilai terunggah.</span>
                      )}

                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}


        {/* TAB 3: JADWAL PELAJARAN */}
        {activeTab === 'jadwal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Timetable schedule editor bar */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2.5 border-b border-slate-100 mb-4">
                <Plus className="w-4 h-4 text-blue-600" />
                Tambah Sesi Mata Pelajaran
              </h4>

              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Hari Pembelajaran</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full border border-slate-200 rounded-md p-2 bg-white text-slate-800"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran / Rapat</label>
                  <input
                    type="text"
                    placeholder="Contoh: Matematika Wajib"
                    value={newScheduleMapel}
                    onChange={(e) => setNewScheduleMapel(e.target.value)}
                    className="w-full border border-slate-200 rounded-md p-2 text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jam Mulai</label>
                    <input
                      type="text"
                      placeholder="Contoh: 07:15"
                      value={newScheduleStart}
                      onChange={(e) => setNewScheduleStart(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-slate-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jam Selesai</label>
                    <input
                      type="text"
                      placeholder="Contoh: 09:15"
                      value={newScheduleEnd}
                      onChange={(e) => setNewScheduleEnd(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-slate-800 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Guru Pengajar</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bu Sri Wahyuni, M.Pd"
                    value={newScheduleGuru}
                    onChange={(e) => setNewScheduleGuru(e.target.value)}
                    className="w-full border border-slate-200 rounded-md p-2 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ruangan / Lab</label>
                  <input
                    type="text"
                    placeholder="Contoh: Lab Komputer 2"
                    value={newScheduleRoom}
                    onChange={(e) => setNewScheduleRoom(e.target.value)}
                    className="w-full border border-slate-200 rounded-md p-2 text-slate-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Tambahkan Sesi Pelajaran
                </button>

              </form>
            </div>

            {/* Timetable schedule visual viewer panel */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 flex-wrap gap-2">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Jadwal Mata Pelajaran Aktif Kelas XI
                </h4>
                
                {/* Horizontal day tab filtering */}
                <div className="flex gap-1">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(d => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition ${
                        selectedDay === d
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      type="button"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daywise Schedule List */}
              <div className="space-y-3">
                {schedules.find(s => s.hari === selectedDay)?.list && (schedules.find(s => s.hari === selectedDay)?.list.length || 0) > 0 ? (
                  schedules.find(s => s.hari === selectedDay)?.list.map((session, index) => (
                    <div 
                      key={session.id} 
                      className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between hover:bg-slate-100/60 transition gap-4"
                      id={`schedule-session-${session.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center font-bold text-indigo-600 text-xs shrink-0 mt-0.5 select-none">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-xs text-slate-800 leading-tight">
                            {session.mapel}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Guru: <strong className="text-slate-655 font-medium">{session.guru}</strong>
                          </p>
                          <div className="flex items-center gap-3.5 text-[10px] text-slate-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-0.5 text-indigo-600 font-mono">
                              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              {session.jamMulai} - {session.jamSelesai}
                            </span>
                            <span className="flex items-center gap-0.5 text-slate-600 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {session.ruangan}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSchedule(selectedDay, session.id)}
                        className="text-rose-455 text-[10px] hover:text-white p-1 hover:bg-rose-500 border border-transparent rounded hover:border-rose-600 transition text-rose-500 shrink-0"
                        title="Hapus Sesi Pelajaran"
                        type="button"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
                    <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs font-mono">Belum ada sesi pelajaran terdaftar untuk hari {selectedDay}.</p>
                    <p className="text-slate-400 text-[10px] mt-1">Gunakan formulir disamping untuk mendaftarkan mata pelajaran kelas ini.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}


        {/* TAB 4: REGISTRASI SISWA BARU */}
        {activeTab === 'siswa' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Pendaftaran Siswa */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Formulir Registrasi Siswa & Wali Murid
                </h4>
                <button
                  onClick={suggestNIS}
                  className="text-[10px] text-blue-600 hover:underline font-mono"
                  type="button"
                >
                  Acak NIS Alternatif
                </button>
              </div>

              {studentSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-lg text-xs font-semibold mb-4 flex items-center gap-1.5 leading-snug">
                  <Check className="w-4 h-4 text-emerald-650 shrink-0" />
                  {studentSuccessMsg}
                </div>
              )}

              <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Nomor Induk Siswa (NIS) *</label>
                    <input
                      type="text"
                      placeholder="Contoh: NIS-260126"
                      value={newStudentNIS}
                      onChange={(e) => setNewStudentNIS(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-slate-800 font-mono uppercase bg-slate-50/50"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1.5">Nama Lengkap Siswa *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Rian Pratama Adi"
                      value={newStudentNama}
                      onChange={(e) => setNewStudentNama(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5 font-mono">Jenis Kelamin *</label>
                    <div className="flex gap-4 p-1.5 border border-slate-150 rounded bg-slate-50/50">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={newStudentGender === 'L'}
                          onChange={() => setNewStudentGender('L')}
                          className="text-blue-650"
                        />
                        Laki-laki (L)
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={newStudentGender === 'P'}
                          onChange={() => setNewStudentGender('P')}
                          className="text-pink-650"
                        />
                        Perempuan (P)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Nama Orang Tua / Wali Murid *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bapak Wijaya Raharjo"
                      value={newStudentParent}
                      onChange={(e) => setNewStudentParent(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-slate-800 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">No. Handphone Orang Tua (WhatsApp) *</label>
                    <input
                      type="tel"
                      placeholder="Contoh: 0812-xxxx-xxxx"
                      value={newStudentPhone}
                      onChange={(e) => setNewStudentPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-slate-800 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Email Orang Tua</label>
                    <input
                      type="email"
                      placeholder="Contoh: parent@gmail.com"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-820 leading-relaxed">
                  <strong>Pemberitahuan:</strong> Seluruh data ini terenkripsi di dalam server internal sekolah. Barcode siswa akan dimuat ke database sekolah saat data diatas disimpan, sehingga kartu pelajar siap untuk dicetak dan digunakan di mesin presensi barcode kelas.
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors shadow-sm"
                  >
                    Simpan & Daftarkan Siswa
                  </button>
                </div>

              </form>
            </div>

            {/* Visual preview of generated card */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 mb-3">
                Preview Barcode Baru
              </h4>
              
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-center space-y-4">
                <span className="text-[10px] text-slate-400 block font-mono">ESTIMASI KARTU PELAJAR BARU</span>
                
                <div className="w-full bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-blue-650 text-white flex items-center justify-center font-bold text-[11px]">
                      {newStudentNama ? newStudentNama.charAt(0) : '?'}
                    </div>
                    <div className="text-left">
                      <strong className="block text-slate-800 line-clamp-1">{newStudentNama || "Nama Lengkap Siswa"}</strong>
                      <span className="text-[9px] font-mono text-slate-400">{newStudentNIS || "ID_BARCODE_NIS"}</span>
                    </div>
                  </div>
                  
                  <div className="py-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-center">
                    <BarcodeSVG value={newStudentNIS || "NIS-PENDING"} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
