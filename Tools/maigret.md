# Maigret

**Pemindai Nama Pengguna OSINT Profesional**

Sebuah alat investigasi nama pengguna berkinerja tinggi yang mencari di lebih dari 2000 jejaring sosial dan situs web. Ini adalah port Rust lengkap dari implementasi Go asli, menampilkan estetika CLI yang ditingkatkan, konkurensi asinkron, dan pencatatan log tingkat profesional. 

## ✨ Fitur
  - 🔎 Cakupan Komprehensif : Cari di lebih dari 2000 jejaring sosial dan platform.
  - ⚡ Sangat Cepat : Pemindaian konkuren asinkron dengan kumpulan pekerja yang dapat dikonfigurasi (32 pekerja default)
  - 🎨 CLI yang Indah : Output bergaya OSINT profesional dengan warna, pelacakan kemajuan, dan pencatatan terstruktur.
  - 🔒 Berfokus pada Privasi : Dukungan proxy Tor opsional untuk pemindaian anonim
  - 📸 Tangkapan Layar : Tangkapan layar Chrome otomatis tanpa antarmuka grafis dari profil yang ditemukan
  - 📥 Unduh Konten : Unduh data profil dari situs yang didukung (Instagram, dll.)
  - 🧪 Validasi Situs : Mode pengujian bawaan untuk memverifikasi konfigurasi situs


## Penggunaan

**Basic Scan**

```bash
maigret krishpranav
```

**Scan Multiple Usernames**

```bash
maigret krishpranav blue red
```

**Verbose Output (Show Not Found Sites)**

```bash
maigret user -v
```

**Specific Site Only**

```bash
maigret user --site github
```

**With Tor Proxy**


Requires Tor running on `127.0.0.1:9050`

```bash
maigret user --tor
```

**Capture Screenshots**

```bash
maigret user --screenshot
```

Screenshots will be saved to `screenshots/<username>/`

**Download Content**

```bash
maigret user --download
```

**Update Database**

```bash
maigret user --update
```

**Test Mode (Validate Site Configurations)**

```bash
maigret --test
```

**All Options**

```bash
maigret --help
```

## Recon Mode

**Cari Semua Jejak Username + Domain Terkait**

```bash
maigret username \
  --all-sites \
  --with-domains
```



## Deep Recon Mode

**Cari Username + Variasi Username**

```bash
maigret username \
  --all-sites \
  --with-domains \
  --permute
```



## Author Enumeration

**Enumerasi Author Blog / Karyawan**

```bash
maigret \
  username1 \
  username2 \
  username3 \
  --all-sites
```



## Parse Existing Profile

**Pivot Dari Akun Yang Sudah Ketemu**

```bash
maigret --parse https://github.com/username
```

```bash
maigret --parse https://medium.com/@username
```

```bash
maigret --parse https://bsky.app/profile/username.bsky.social
```



## Maximum Coverage

```bash
maigret username \
  --all-sites \
  --with-domains \
  --permute \
  --print-errors
```



## Generate HTML Report

```bash
maigret username -H
```



## Generate JSON Report

```bash
maigret username -J simple
```



## Generate Semua Report

```bash
maigret username \
  -H \
  -M \
  -J simple
```



## Anonymous Scan

```bash
maigret username \
  --tor-proxy socks5://127.0.0.1:9050
```



## Full Recon Mode

```bash
maigret username \
  --all-sites \
  --with-domains \
  --permute \
  --print-errors \
  -H \
  -M \
  -J simple
```
