export interface PresensiRecord {
  tanggal: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  waktu: string;
}

export interface NilaiRecord {
  id: string;
  mapel: string;
  jenis: 'Tugas' | 'Kuis' | 'UTS' | 'UAS';
  nilai: number;
  tanggal: string;
  keterangan?: string;
}

export interface Student {
  id: string; // NIS
  nama: string;
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  avatarColor: string;
  statusHariIni: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Belum Presensi';
  presensi: PresensiRecord[];
  nilai: NilaiRecord[];
}

export interface SubjectSchedule {
  id: string;
  mapel: string;
  jamMulai: string;
  jamSelesai: string;
  guru: string;
  ruangan: string;
}

export interface DaySchedule {
  hari: string; // Senin, Selasa, Rabu, Kamis, Jumat
  list: SubjectSchedule[];
}

export interface NotificationLog {
  id: string;
  studentId: string;
  studentName: string;
  tipe: 'presensi' | 'nilai';
  pesan: string;
  channel: 'WhatsApp' | 'SMS' | 'Email';
  status: 'Terkirim' | 'Gagal';
  waktu: string;
}
