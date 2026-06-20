# Mindset

GOAL → ASSUMPTION → TEST → RESULT

GOAL :
  - Saya sangat yakin, saya bisa mempertahankan akses ke project meskipun sudah diremove oleh pemilik."
  
ASSUMPTION :
  - Asumsi saya, untuk bisa mempertahankan sebuah akses, berarti saya perlu...:
  
TEST :
  - Bagaimana cara membuktikan asumsi ini?
  
RESULT :
  - Bagaimana hasilnya?

Berangkat dari goal saya di awal:

"Saya sangat yakin, saya bisa mempertahankan akses ke project meskipun sudah diremove oleh pemilik."

Saya mulai membangun asumsi dengan hipotesis teknis.

"Asumsi saya, untuk bisa mempertahankan sebuah akses, berarti saya perlu...":

  - "Cari cara mengeksekusi sebuah function dari tempat lain, selain dari dalam project itu sendiri."

Dari asumsi tersebut, saya bisa pecah menjadi sebuah bagian-bagian kecil lagi:

  - "Saya akan coba jalankan sebuah function dan menangkap requestnya (potensi replay attack)"
  - "Saya akan coba menambahkan akun lain ke project saya yang lain, lalu mengubahnya dengan ID project target (potensi IDOR)"
  - "Saya akan memahami bagaimana proses deployment di Google Apps Script bekerja. Siapa tahu, function itu akan menjadi publik (potensi abuse risk)"
  - "Saya akan cek apakah function yang pernah di-deploy masih bisa diakses setelah saya dihapus dari project (potensi stale permission/cache)"
  - "Saya juga akan perhatikan apakah ada mekanisme fallback atau cache/token sisa yang bisa dieksploitasi (potensi persistent access via artifact lama)"

Semua asumsi di atas tidak muncul begitu saja secara kebetulan, untuk mencapai asumsi seperti di atas, lagi-lagi karena saya sudah sangat memahami bagaimana proses, akses kontrol, dan fitur normal dari Google Apps Script bekerja