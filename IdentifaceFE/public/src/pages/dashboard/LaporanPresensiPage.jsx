import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { FiRefreshCw, FiSearch, FiX } from 'react-icons/fi'

// ─── CONFIG ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include", 
  });

  if (res.status === 401) {
    localStorage.removeItem("user");
    window.location.href = "/";
    return null;
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Request gagal.");
  return json;
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function LaporanPresensiPage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState('mahasiswa')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // State Data
  const [mahasiswaData, setMahasiswaData] = useState([])
  const [mataKuliahData, setMataKuliahData] = useState([])

  // State Pagination (Paginasi Standar)
  const limitPerPage = 10; // Ditampilkan per 10 data
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State Filter
  const [filters, setFilters] = useState({
    search: '',
    prodi: '',
    angkatan: '',
    tanggal: '',
    status: ''
  })

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)
  const [formData, setFormData] = useState({ statusBaru: 'hadir', alasan: '' })

  // ─── FETCH DATA ──────────────────────────────────────────────────────────
  const fetchLaporan = useCallback(async (currentFilters = filters, currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'mahasiswa') {
        const query = new URLSearchParams();
        query.append('limit', limitPerPage);
        query.append('page', currentPage);
        
        if (currentFilters.search) query.append('search', currentFilters.search);
        if (currentFilters.prodi) query.append('prodi', currentFilters.prodi);
        if (currentFilters.angkatan) query.append('angkatan', currentFilters.angkatan);
        if (currentFilters.status) query.append('status', currentFilters.status);
        if (currentFilters.tanggal) {
          query.append('from_date', currentFilters.tanggal);
          query.append('to_date', currentFilters.tanggal);
        }

        const res = await apiFetch(`/admin/attendance/report?${query.toString()}`);
        const fetchedData = Array.isArray(res.data?.data) ? res.data.data : [];
        const totalDataInDB = res.data?.total || 0;

        // Ganti data lama dengan data halaman baru (bukan di-append)
        setMahasiswaData(fetchedData);
        setTotalPages(Math.ceil(totalDataInDB / limitPerPage) || 1);

      } else {
        const res = await apiFetch('/admin/attendance/summary');
        setMataKuliahData(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Fetch pertama kali halaman atau tab dimuat
  useEffect(() => {
    setPage(1);
    fetchLaporan(filters, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); 

  // ─── HANDLERS ────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" }); } catch (e) {}
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSearch = () => {
    setPage(1);
    fetchLaporan(filters, 1);
  };

  const handleResetFilter = () => {
    const emptyFilters = { search: '', prodi: '', angkatan: '', tanggal: '', status: '' };
    setFilters(emptyFilters);
    setPage(1);
    fetchLaporan(emptyFilters, 1); 
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLaporan(filters, nextPage);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchLaporan(filters, prevPage);
    }
  };

  const openModal = (action, row) => {
    setModalAction(action)
    setSelectedRow(row)
    setFormData({ statusBaru: row.status ? row.status.toLowerCase() : 'hadir', alasan: '' })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalAction('')
    setSelectedRow(null)
  }

  const handleSaveModal = async () => {
    if (!selectedRow) return;
    setIsSaving(true);
    try {
      const payload = {
        id_presensi: selectedRow.id_presensi, 
        id_sesi: selectedRow.id_sesi,         
        nim: selectedRow.nim,                 
        status: formData.statusBaru,
        alasan: formData.alasan 
      };

      const res = await fetch(`${API_BASE}/admin/attendance/update-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Gagal memperbarui presensi.");

      setToast("Status presensi berhasil diperbarui!");
      setTimeout(() => setToast(null), 3000);
      
      // Update UI secara lokal
      setMahasiswaData(prev => prev.map(item => 
        ((item.id_presensi && item.id_presensi === selectedRow.id_presensi) || 
        (item.nim === selectedRow.nim && item.id_sesi === selectedRow.id_sesi))
          ? { ...item, status: formData.statusBaru, id_presensi: json.data?.id_presensi || item.id_presensi } 
          : item
      ));

      closeModal();
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // ─── UTILS ───────────────────────────────────────────────────────────────
  const statusClass = {
    hadir: 'bg-green-200 text-green-800',
    terlambat: 'bg-yellow-200 text-yellow-800',
    izin: 'bg-blue-200 text-blue-800',
    sakit: 'bg-blue-200 text-blue-800',
    alfa: 'bg-red-200 text-red-800',
    'tidak hadir': 'bg-red-200 text-red-800',
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ECE7DF] relative">
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-[#123B5D] text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-5">
        <img src={logo} alt="IdentiFace Logo" className="w-40 h-auto object-contain" />
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{user?.nama || "Administrator"}</h2>
          <div className="w-12 h-12 rounded-full border-4 border-[#123B5D] bg-[#6BAAAF] flex items-center justify-center text-white font-bold text-lg">
            {user?.nama ? user.nama.charAt(0).toUpperCase() : "A"}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-10 pb-10 flex gap-8">
        <aside className="w-64 bg-[#6BAAAF] rounded-lg shadow-md px-5 py-7 flex flex-col">
          <h2 className="text-center text-xl font-bold mb-6 text-white">Menu Admin</h2>
          <nav className="space-y-3">
            <button className="w-full h-10 rounded bg-[#123B5D] text-white font-semibold shadow-inner">
              Laporan Presensi
            </button>
            <button onClick={() => navigate('/admin/data-wajah')} className="w-full h-10 rounded border border-white text-black bg-white font-semibold hover:bg-gray-100 transition-colors">
              Data Wajah
            </button>
          </nav>
          <button onClick={handleLogout} className="mt-auto w-full h-10 rounded bg-[#B82410] text-white font-semibold hover:bg-[#9a1d0d] transition-colors">
            Keluar
          </button>
        </aside>

        <section className="flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Laporan Presensi</h1>
              <p className="text-sm text-gray-600">Kelola dan monitor kehadiran mahasiswa & sesi perkuliahan</p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex justify-center mb-4">
            <div className="w-[420px] border border-[#123B5D] rounded-full overflow-hidden flex bg-[#EFE6D3]">
              <button
                onClick={() => setActiveTab('mahasiswa')}
                className={`w-1/2 py-1.5 text-sm font-bold transition-colors ${activeTab === 'mahasiswa' ? 'bg-[#6BAAAF] text-white' : 'text-[#123B5D] hover:bg-[#6BAAAF]/20'}`}
              >
                Data Mahasiswa
              </button>
              <button
                onClick={() => setActiveTab('matakuliah')}
                className={`w-1/2 py-1.5 text-sm font-bold transition-colors ${activeTab === 'matakuliah' ? 'bg-[#6BAAAF] text-white' : 'text-[#123B5D] hover:bg-[#6BAAAF]/20'}`}
              >
                Data Mata Kuliah
              </button>
            </div>
          </div>

          {/* FILTER BARS */}
          {activeTab === 'mahasiswa' && (
            <div className="bg-[#EFE6D3] border border-[#123B5D] rounded-lg shadow-sm p-4 mb-5">
              <div className="grid grid-cols-6 gap-3">
                <input 
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Cari nama atau NIM..." 
                  className="h-10 rounded-md px-3 text-sm border border-gray-300 focus:outline-none focus:border-[#6BAAAF] col-span-2" 
                />
                
                <select 
                  value={filters.prodi}
                  onChange={(e) => setFilters({ ...filters, prodi: e.target.value })}
                  className="h-10 rounded-md px-3 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#6BAAAF]"
                >
                  <option value="">Semua Prodi</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                </select>

                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="h-10 rounded-md px-3 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#6BAAAF]"
                >
                  <option value="">Semua Status</option>
                  <option value="hadir">Hadir</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alpha">Alpha</option>
                </select>

                <input 
                  type="date"
                  value={filters.tanggal}
                  onChange={(e) => setFilters({ ...filters, tanggal: e.target.value })}
                  className="h-10 rounded-md px-3 text-sm border border-gray-300 bg-white focus:outline-none focus:border-[#6BAAAF]"
                />

                <div className="flex gap-2">
                  <button 
                    onClick={handleSearch}
                    className="flex-1 bg-[#123B5D] hover:bg-[#0d2a3f] text-white rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <FiSearch /> Cari
                  </button>
                  <button 
                    onClick={handleResetFilter}
                    title="Reset Filter"
                    className="w-10 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 rounded-md flex items-center justify-center transition-colors"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TABLE DATA */}
          <div className="bg-[#EFE6D3] border border-[#6BAAAF] rounded-xl shadow-md overflow-hidden flex-1 flex flex-col">
            <div className="bg-[#123B5D] text-white px-5 py-3 font-semibold flex justify-between items-center">
              <span>{activeTab === 'mahasiswa' ? 'Timeline Kehadiran Mahasiswa' : 'Rekapitulasi Mata Kuliah'}</span>
              {activeTab === 'mahasiswa' && (
                <span className="text-xs font-normal opacity-80">
                  {mahasiswaData.length} data di Halaman {page}
                </span>
              )}
            </div>
            
            <div className="overflow-x-auto flex-1 relative">
              {error && <div className="p-5 text-red-500 font-medium text-center">Gagal memuat data: {error}</div>}
              
              {activeTab === 'mahasiswa' ? (
                <>
                  <table className="w-full bg-white min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-[#6BAAAF]">
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Nama</th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">NIM</th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Prodi</th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Mata Kuliah</th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Tanggal</th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Status</th>
                        <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="7" className="text-center py-10 text-gray-400 font-medium">Memuat data timeline...</td></tr>
                      ) : mahasiswaData.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-10 text-gray-400">Tidak ada riwayat presensi yang cocok dengan filter.</td></tr>
                      ) : (
                        mahasiswaData.map((row, index) => (
                          <tr key={`${row.nim}-${row.id_sesi}-${index}`} className={`border-b transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-[#f0f9fa]`}>
                            <td className="px-4 py-3 text-sm font-bold text-gray-800">{row.nama_lengkap || row.nama}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.nim}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{row.prodi || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">{row.nama_mk}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {row.tanggal || row.waktu_scan ? new Date(row.tanggal || row.waktu_scan).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric'}) : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`${statusClass[row.status?.toLowerCase()] || 'bg-gray-200 text-gray-800'} px-3 py-1 rounded-full text-xs font-bold capitalize`}>
                                {row.status || 'Alpha'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => openModal('lihat', row)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                                  Detail
                                </button>
                                <button onClick={() => openModal('ubah', row)} className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                                  Ubah
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Navigasi Halaman Sebelumnya & Selanjutnya */}
                  {!loading && totalPages > 1 && (
                    <div className="py-4 bg-white border-t border-gray-200 flex justify-between items-center px-6">
                      <button 
                        onClick={handlePrevPage} 
                        disabled={page === 1}
                        className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold rounded-lg transition-all disabled:opacity-40"
                      >
                        Sebelumnya
                      </button>
                      <span className="text-sm font-semibold text-gray-600">
                        Halaman {page} dari {totalPages}
                      </span>
                      <button 
                        onClick={handleNextPage} 
                        disabled={page === totalPages}
                        className="px-5 py-2 bg-[#6BAAAF] hover:bg-[#5a9499] text-white text-sm font-bold rounded-lg transition-all disabled:opacity-40"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <table className="w-full bg-white min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-[#6BAAAF]">
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">No</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Mata Kuliah</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 text-center">SKS</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Kelas</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-600">Dosen Pengampu</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 text-center">Sesi Terlaksana</th>
                      <th className="text-left px-4 py-3 text-sm font-bold text-gray-600 text-center">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                       <tr><td colSpan="7" className="text-center py-10 text-gray-400 font-medium">Memuat rekapitulasi...</td></tr>
                    ) : mataKuliahData.length === 0 ? (
                       <tr><td colSpan="7" className="text-center py-10 text-gray-400">Tidak ada rekapitulasi mata kuliah.</td></tr>
                    ) : (
                      mataKuliahData.map((row, index) => (
                        <tr key={index} className={`border-b align-top transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-[#f0f9fa]`}>
                          <td className="px-4 py-4 text-sm text-gray-600 font-bold">{index + 1}</td>
                          <td className="px-4 py-4 text-sm font-bold text-gray-800">{row.nama_mk}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 text-center">{row.sks}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 font-medium">{row.kelas}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 max-w-[280px]">{row.nama_dosen}</td>
                          <td className="px-4 py-4 text-sm font-bold text-gray-600 text-center">{row.pertemuan_terlaksana || 0}</td>
                          <td className="px-4 py-4 text-center">
                            <button onClick={() => openModal('lihat', row)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                              Detail Kelas
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* MODAL UPDATE & DETAIL */}
      {isModalOpen && selectedRow && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-[#EFE6D3] w-full max-w-[540px] rounded-2xl border-2 border-[#123B5D] shadow-2xl p-7 relative">
            <h2 className="text-2xl font-bold text-[#123B5D] mb-1">
              {modalAction === 'lihat' ? (activeTab === 'mahasiswa' ? 'Detail Presensi' : 'Detail Mata Kuliah') : 'Update Status Presensi'}
            </h2>

            <p className="text-sm font-semibold text-gray-600 mb-5 pb-3 border-b border-gray-300">
              {activeTab === 'mahasiswa'
                ? `${selectedRow.nama_lengkap || selectedRow.nama} — ${selectedRow.nama_mk}`
                : `${selectedRow.nama_mk} (${selectedRow.kelas})`}
            </p>

            {/* KONTEN MODAL MAHASISWA */}
            {activeTab === 'mahasiswa' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Status Kehadiran</label>
                  <select
                    value={formData.statusBaru}
                    onChange={(e) => setFormData({ ...formData, statusBaru: e.target.value })}
                    disabled={modalAction === 'lihat' || isSaving}
                    className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#123B5D]/30 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="hadir">Hadir</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="alfa">Alfa (Tidak Hadir)</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Keterangan / Alasan</label>
                  <textarea
                    value={formData.alasan}
                    onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                    disabled={modalAction === 'lihat' || isSaving}
                    placeholder={modalAction === 'lihat' ? (selectedRow.alasan || 'Tidak ada keterangan khusus') : "Tuliskan alasan perubahan kehadiran..."}
                    className="w-full h-24 border border-gray-300 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#123B5D]/30 disabled:bg-gray-100"
                  />
                </div>
              </>
            )}

            {/* KONTEN MODAL MATA KULIAH */}
            {activeTab === 'matakuliah' && (
              <div className="space-y-3 text-sm bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">SKS</span><span className="font-bold">{selectedRow.sks} SKS</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Program Studi</span><span className="font-bold">{selectedRow.prodi || "-"}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Dosen Pengampu</span><span className="font-bold text-right w-1/2">{selectedRow.nama_dosen}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Sesi/Pertemuan Aktif</span><span className="font-bold text-[#123B5D]">{selectedRow.pertemuan_terlaksana} Sesi</span></div>
              </div>
            )}

            {/* FOOTER MODAL */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                disabled={isSaving}
                onClick={closeModal}
                className="px-6 py-2.5 rounded-lg border border-gray-400 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {modalAction === 'lihat' ? 'Tutup' : 'Batal'}
              </button>

              {modalAction !== 'lihat' && (
                <button
                  disabled={isSaving}
                  onClick={handleSaveModal}
                  className="px-6 py-2.5 rounded-lg bg-[#123B5D] hover:bg-[#0d2a3f] text-white text-sm font-bold transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <FiRefreshCw size={14} className="animate-spin" />}
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#74B5BD] py-5 text-center mt-auto">
        <div className="flex justify-center items-center gap-2 mb-2">
          <img src={logo} alt="IdentiFace Logo" className="w-24 h-auto object-contain" />
        </div>
        <p className="font-semibold text-[#123B5D]">Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  )
}