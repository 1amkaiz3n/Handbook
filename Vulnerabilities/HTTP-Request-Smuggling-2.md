# HTTP Request Smuggling - 2

## Cara Menguji HTTP Request Smuggling di Burp Suite

Setelah Anda mengidentifikasi target potensial untuk HRS, Burp Suite Repeater adalah alat andalan Anda untuk menguji masalah desinkronisasi secara manual.

**Panduan Langkah demi Langkah:**

### Langkah 1: Atur Protokol ke HTTP/1.1 dan Aktifkan Keep-Alive

  - Di Burp Repeater, pastikan permintaan tersebut menggunakan `HTTP/1.1`
  - Tambahkan header `Connection: keep-alive`

**Mengapa?**
HRS bekerja paling baik jika koneksi TCP yang sama tetap terbuka.
`keep-alive` Memastikan bahwa frontend tidak menutup koneksi setelah satu permintaan. 


### Langkah 2: Merancang Payload Smuggling

Mari kita coba **payload CL.TE** — di mana frontend menggunakan `Content-Length`, tetapi backend menggunakan `Transfer-Encoding`: 

```http
POST / HTTP/1.1
Host: target.com
Content-Length: 49
Transfer-Encoding: chunked
Connection: keep-alive

0

GET /admin HTTP/1.1
Host: target.com
```

Fungsi dari ini:
Anda mengirimkan **dua permintaan sekaligus** :

  - Boneka `POST` meminta
  - Tersembunyi GET /admin yang mungkin menyelinap ke bagian belakang (backend). 


### Langkah 3: Kirim dan Amati dengan Seksama

Setelah mengirimkan muatan yang telah dirancang, periksa adanya anomali :

#### **Hal-hal yang perlu diperhatikan:**

**Delayed response**
➤ Menunjukkan bahwa sistem backend mengalami kebingungan atau sedang menunggu data lebih lanjut.

**Respons ganda atau aneh**
➤ Seperti dua respons 200 OK, atau konten dari endpoint yang salah.

**Status flip-flop**
➤ Respons pertama adalah 400/502, permintaan berikutnya memberikan respons tak terduga 200.

**Tes lanjutan:**
➤ Setelah payload, kirim permintaan normal (misalnya, GET /home).
Jika responsnya terlihat aneh — permintaan selundupan Anda mungkin telah dieksekusi sebelumnya. 


### Tanda Kesuksesan:

  - Respons tertunda atau waktu habis.
  - Permintaan kedua (yang diselundupkan) sedang diproses oleh backend.
  - Respons yang tidak sesuai dengan permintaan awal Anda. 



## Apa yang Dapat Anda Capai dengan HTTP Request Smuggling (Gaya Dunia Nyata)

Anda mungkin bertanya-tanya:

**"Oke, aku bisa menyelundupkan permintaan tersembunyi… tapi apa yang sebenarnya bisa kulakukan dengan permintaan itu?"** 

Mari kita uraikan dengan contoh-contoh nyata, sehingga Anda dapat melihat betapa kuatnya serangan HTTP Request Smuggling di dunia nyata. 


### 1. Melewati Login untuk Mengakses Halaman Tersembunyi

**Bayangkan:**

Sebuah situs web memiliki panel admin di `/admin`, dan hanya pengguna yang sudah login yang dapat mengaksesnya.
Namun dengan menggunakan HRS, Anda menyelundupkan barang tersembunyi.Request  `GET /admin`  tepat setelah permintaan POST percobaan.

Jika backend mempercayai koneksi tersebut (mungkin sudah terautentikasi), maka backend akan memproses permintaan yang diselundupkan **tanpa memeriksa ulang informasi login Anda** .

> **Hasil**: Anda mengakses panel admin tanpa memiliki hak akses admin. 



### 2. Membajak Sesi Pengguna Lain

**Misalnya:**

Pengguna A sedang menjelajahi akun mereka, dan Anda menyelundupkan sebuah Request `GET /profile`  ke **koneksi terbuka mereka** (misalnya, pada CDN bersama).

Jika permintaan Anda masuk tepat sebelum permintaan mereka selesai, permintaan tersebut mungkin akan dijalankan **atas nama mereka** , menggunakan **sesi mereka** .

> **Hasil**: Anda mendapatkan akses ke profil pribadi, pesanan, atau data mereka. 


### 3. Cache Poisoning: Semua Orang Mendapatkan Tanggapan Anda 

**Bayangkan sebuah skenario:**

Sebuah situs menggunakan CloudFront untuk menyimpan respons dalam cache. Anda menyusupkan permintaan berbahaya seperti ini.

```http
GET /?page=home HTTP/1.1
Host: site.com
X-Forwarded-Host: attacker.com
```

Sekarang, backend membangun halaman dengan **header Host Anda** , dan proxy **menyimpan respons tersebut dalam cache** . 


> **Hasil**: Sekarang, setiap orang yang mengunjungi halaman beranda akan melihat halaman yang mengarah ke domain Anda (phishing, pengalihan, login palsu); semuanya mungkin terjadi. 


### 4. WAF Bypass: Sneaking Past the Guards

**Biasanya:**
Anda tidak bisa mengirim `DELETE /users/123` — WAF memblokirnya.

Namun dengan HRS, Anda mengirimkan muatan tersembunyi yang tidak diuraikan dengan benar oleh WAF: 

```http
POST / HTTP/1.1
Content-Length: 6
Transfer-Encoding: chunked

0

DELETE /users/123 HTTP/1.1
```


WAF mengira itu adalah POST biasa. Sistem backend melihat barang selundupan tersebut. `DELETE` dan melaksanakannya.

> **Hasil**: WAF mengatakan "semuanya aman," tetapi backend justru menghapus pengguna. 

### 5. Sentuh Endpoint Internal Saja

Beberapa aplikasi memiliki API pribadi seperti `/internal/config` atau `/debug/status` Mereka memang tidak pernah dirancang untuk dipukul dari luar.

Namun HRS memungkinkan Anda melakukan hal itu dengan menyelundupkan permintaan internal melalui proksi tepercaya.

> **Hasilnya**: Anda memperoleh visibilitas internal atau bahkan kontrol atas konfigurasi yang hanya ditujukan untuk pengembang atau layanan. 