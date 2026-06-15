import { Student, DaySchedule, NotificationLog } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "NIS-260101",
    nama: "Muhammad Fadhil",
    gender: "L",
    parentName: "Bapak Rahmad",
    parentPhone: "0812-3456-7890",
    parentEmail: "rahmad.fadhil@gmail.com",
    avatarColor: "bg-blue-500",
    statusHariIni: "Hadir",
    presensi: [
      { tanggal: "2026-06-12", status: "Hadir", waktu: "06:58" },
      { tanggal: "2026-06-13", status: "Hadir", waktu: "07:11" },
      { tanggal: "2026-06-14", status: "Hadir", waktu: "07:02" }
    ],
    nilai: [
      { id: "v1", mapel: "Matematika", jenis: "Tugas", nilai: 88, tanggal: "2026-06-10", keterangan: "Prisma & Limas" },
      { id: "v2", mapel: "Informatika", jenis: "Tugas", nilai: 95, tanggal: "2026-06-11", keterangan: "Struktur Data" },
      { id: "v3", mapel: "Bahasa Indonesia", jenis: "Kuis", nilai: 80, tanggal: "2026-06-12", keterangan: "Resensi Buku" },
      { id: "v4", mapel: "Matematika", jenis: "UTS", nilai: 85, tanggal: "2026-06-14", keterangan: "Ujian Tengah Semester" }
    ]
  },
  {
    id: "NIS-260102",
    nama: "Sania Putri Utami",
    gender: "P",
    parentName: "Ibu Indah",
    parentPhone: "0856-9876-5432",
    parentEmail: "indah.utami@yahoo.com",
    avatarColor: "bg-pink-500",
    statusHariIni: "Belum Presensi",
    presensi: [
      { tanggal: "2026-06-12", status: "Hadir", waktu: "07:15" },
      { tanggal: "2026-06-13", status: "Izin", waktu: "--:--" },
      { tanggal: "2026-06-14", status: "Hadir", waktu: "07:05" }
    ],
    nilai: [
      { id: "v5", mapel: "Matematika", jenis: "Tugas", nilai: 92, tanggal: "2026-06-10", keterangan: "Prisma & Limas" },
      { id: "v6", mapel: "Informatika", jenis: "Tugas", nilai: 90, tanggal: "2026-06-11", keterangan: "Struktur Data" },
      { id: "v7", mapel: "Bahasa Indonesia", jenis: "Kuis", nilai: 88, tanggal: "2026-06-12", keterangan: "Resensi Buku" },
      { id: "v8", mapel: "Matematika", jenis: "UTS", nilai: 90, tanggal: "2026-06-14", keterangan: "Ujian Tengah Semester" }
    ]
  },
  {
    id: "NIS-260103",
    nama: "Andi Wijaya Saputra",
    gender: "L",
    parentName: "Bapak Wijaya",
    parentPhone: "0821-2233-4455",
    parentEmail: "wijayabs@hotmail.com",
    avatarColor: "bg-emerald-500",
    statusHariIni: "Sakit",
    presensi: [
      { tanggal: "2026-06-12", status: "Alpa", waktu: "--:--" },
      { tanggal: "2026-06-13", status: "Hadir", waktu: "07:01" },
      { tanggal: "2026-06-14", status: "Sakit", waktu: "--:--" }
    ],
    nilai: [
      { id: "v9", mapel: "Matematika", jenis: "Tugas", nilai: 70, tanggal: "2026-06-10", keterangan: "Prisma & Limas" },
      { id: "v10", mapel: "Informatika", jenis: "Tugas", nilai: 84, tanggal: "2026-06-11", keterangan: "Struktur Data" },
      { id: "v11", mapel: "Bahasa Indonesia", jenis: "Kuis", nilai: 75, tanggal: "2026-06-12", keterangan: "Resensi Buku" },
      { id: "v12", mapel: "Matematika", jenis: "UTS", nilai: 78, tanggal: "2026-06-14", keterangan: "Ujian Tengah Semester" }
    ]
  },
  {
    id: "NIS-260104",
    nama: "Zahra Aulia Rahma",
    gender: "P",
    parentName: "Ibu Hartati",
    parentPhone: "0877-4455-8899",
    parentEmail: "hartati.zahra@outlook.com",
    avatarColor: "bg-purple-500",
    statusHariIni: "Hadir",
    presensi: [
      { tanggal: "2026-06-12", status: "Hadir", waktu: "06:45" },
      { tanggal: "2026-06-13", status: "Hadir", waktu: "06:50" },
      { tanggal: "2026-06-14", status: "Hadir", waktu: "06:48" }
    ],
    nilai: [
      { id: "v13", mapel: "Matematika", jenis: "Tugas", nilai: 98, tanggal: "2026-06-10", keterangan: "Prisma & Limas" },
      { id: "v14", mapel: "Informatika", jenis: "Tugas", nilai: 100, tanggal: "2026-06-11", keterangan: "Struktur Data" },
      { id: "v15", mapel: "Bahasa Indonesia", jenis: "Kuis", nilai: 92, tanggal: "2026-06-12", keterangan: "Resensi Buku" },
      { id: "v16", mapel: "Matematika", jenis: "UTS", nilai: 95, tanggal: "2026-06-14", keterangan: "Ujian Tengah Semester" }
    ]
  },
  {
    id: "NIS-260105",
    nama: "Rian Hidayatullah",
    gender: "L",
    parentName: "Bapak Hidayat",
    parentPhone: "0813-8899-1122",
    parentEmail: "hidayat_rian26@gmail.com",
    avatarColor: "bg-amber-500",
    statusHariIni: "Belum Presensi",
    presensi: [
      { tanggal: "2026-06-12", status: "Hadir", waktu: "07:05" },
      { tanggal: "2026-06-13", status: "Hadir", waktu: "07:03" },
      { tanggal: "2026-06-14", status: "Hadir", waktu: "06:59" }
    ],
    nilai: [
      { id: "v17", mapel: "Matematika", jenis: "Tugas", nilai: 82, tanggal: "2026-06-10", keterangan: "Prisma & Limas" },
      { id: "v18", mapel: "Informatika", jenis: "Tugas", nilai: 88, tanggal: "2026-06-11", keterangan: "Struktur Data" },
      { id: "v19", mapel: "Bahasa Indonesia", jenis: "Kuis", nilai: 85, tanggal: "2026-06-12", keterangan: "Resensi Buku" },
      { id: "v20", mapel: "Matematika", jenis: "UTS", nilai: 82, tanggal: "2026-06-14", keterangan: "Ujian Tengah Semester" }
    ]
  },
  {
    id: "NIS-260106",
    nama: "Siti Nurhaliza Basri",
    gender: "P",
    parentName: "Ibu Khotimah",
    parentPhone: "0819-5566-7788",
    parentEmail: "khotimah_siti@edu.id",
    avatarColor: "bg-cyan-500",
    statusHariIni: "Hadir",
    presensi: [
      { tanggal: "2026-06-12", status: "Hadir", waktu: "07:00" },
      { tanggal: "2026-06-13", status: "Hadir", waktu: "06:55" },
      { tanggal: "2026-06-14", status: "Hadir", waktu: "06:57" }
    ],
    nilai: [
      { id: "v21", mapel: "Matematika", jenis: "Tugas", nilai: 90, tanggal: "2026-06-10", keterangan: "Prisma & Limas" },
      { id: "v22", mapel: "Informatika", jenis: "Tugas", nilai: 92, tanggal: "2026-06-11", keterangan: "Struktur Data" },
      { id: "v23", mapel: "Bahasa Indonesia", jenis: "Kuis", nilai: 80, tanggal: "2026-06-12", keterangan: "Resensi Buku" },
      { id: "v24", mapel: "Matematika", jenis: "UTS", nilai: 88, tanggal: "2026-06-14", keterangan: "Ujian Tengah Semester" }
    ]
  }
];

export const INITIAL_SCHEDULES: DaySchedule[] = [
  {
    hari: "Senin",
    list: [
      { id: "s1", mapel: "Upacara Bendera", jamMulai: "07:00", jamSelesai: "07:45", guru: "Kepala Sekolah", ruangan: "Lapangan Utama" },
      { id: "s2", mapel: "Matematika Wajib", jamMulai: "07:45", jamSelesai: "09:15", guru: "Bu Sri Wahyuni, M.Pd", ruangan: "Ruang Kelas XI" },
      { id: "s3", mapel: "Bahasa Indonesia", jamMulai: "09:30", jamSelesai: "11:00", guru: "Pak Joko Sutrisno, S.Pd", ruangan: "Ruang Kelas XI" },
      { id: "s4", mapel: "Informatika (RPL)", jamMulai: "11:00", jamSelesai: "12:30", guru: "Pak Ridwan, S.Kom", ruangan: "Lab Komputer 2" }
    ]
  },
  {
    hari: "Selasa",
    list: [
      { id: "s5", mapel: "Pendidikan Agama", jamMulai: "07:00", jamSelesai: "08:30", guru: "Ustadz Mansur, S.PdI", ruangan: "Masjid Sekolah" },
      { id: "s6", mapel: "Bahasa Inggris", jamMulai: "08:30", jamSelesai: "10:00", guru: "Miss Kartika, M.A", ruangan: "Ruang Kelas XI" },
      { id: "s7", mapel: "Fisika", jamMulai: "10:15", jamSelesai: "11:45", guru: "Pak Bambang, M.Si", ruangan: "Lab IPA" }
    ]
  },
  {
    hari: "Rabu",
    list: [
      { id: "s8", mapel: "Informatika (RPL)", jamMulai: "07:00", jamSelesai: "09:15", guru: "Pak Ridwan, S.Kom", ruangan: "Lab Komputer 2" },
      { id: "s9", mapel: "Kimia", jamMulai: "09:30", jamSelesai: "11:00", guru: "Bu Maria, S.Si", ruangan: "Lab IPA" },
      { id: "s10", mapel: "Sejarah Indonesia", jamMulai: "11:00", jamSelesai: "12:30", guru: "Pak Heri, S.Pd", ruangan: "Ruang Kelas XI" }
    ]
  },
  {
    hari: "Kamis",
    list: [
      { id: "s11", mapel: "Penjaskes (Olahraga)", jamMulai: "07:00", jamSelesai: "08:30", guru: "Pak Ahmad Yani, S.Pd", ruangan: "Lapangan Olahraga" },
      { id: "s12", mapel: "Pendidikan Pancasila", jamMulai: "08:30", jamSelesai: "10:00", guru: "Pak Hendro, S.H", ruangan: "Ruang Kelas XI" },
      { id: "s13", mapel: "Matematika Peminatan", jamMulai: "10:15", jamSelesai: "12:30", guru: "Bu Sri Wahyuni, M.Pd", ruangan: "Ruang Kelas XI" }
    ]
  },
  {
    hari: "Jumat",
    list: [
      { id: "s14", mapel: "Imtaq & Senam", jamMulai: "07:00", jamSelesai: "08:00", guru: "Pak Ahmad & Ustadz Mansur", ruangan: "Lapangan Utama" },
      { id: "s15", mapel: "Seni Budaya", jamMulai: "08:00", jamSelesai: "09:30", guru: "Bu Endang, S.Sn", ruangan: "Studio Seni" },
      { id: "s16", mapel: "Bimbingan Konseling", jamMulai: "09:45", jamSelesai: "11:00", guru: "Ibu Rina, S.Psi", ruangan: "Ruang BK" }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: "log-1",
    studentId: "NIS-260101",
    studentName: "Muhammad Fadhil",
    tipe: "presensi",
    pesan: "PRESENSI ONLINE: Siswa Muhammad Fadhil telah hadir di kelas tepat waktu pukul 06:58 pada tanggal 2026-06-12.",
    channel: "WhatsApp",
    status: "Terkirim",
    waktu: "12/06/2026 06:59"
  },
  {
    id: "log-2",
    studentId: "NIS-260103",
    studentName: "Andi Wijaya Saputra",
    tipe: "presensi",
    pesan: "NOTIFIKASI ABSENSI: Andi Wijaya Saputra terkonfirmasi SAKIT hari ini tanggal 2026-06-14. Surat keterangan telah diunggah guru.",
    channel: "WhatsApp",
    status: "Terkirim",
    waktu: "14/06/2026 07:15"
  },
  {
    id: "log-3",
    studentId: "NIS-260104",
    studentName: "Zahra Aulia Rahma",
    tipe: "nilai",
    pesan: "LAPORAN NILAI: Zahra Aulia Rahma mendapat Nilai 100 pada tugas Informatika (Materi: Struktur Data). Pertahankan prestasinya!",
    channel: "WhatsApp",
    status: "Terkirim",
    waktu: "11/06/2026 14:10"
  }
];
