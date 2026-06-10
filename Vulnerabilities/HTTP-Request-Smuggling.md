# HTTP Request Smuggling

## Cara Mendeteksi Permukaan Serangan 

Sama seperti Anda mencari kolom input saat menguji XSS, berikut adalah beberapa tanda dan perilaku nyata dalam aplikasi web yang seharusnya membuat Anda berpikir:

**“ Tunggu, ini mungkin layak diuji untuk penyelundupan permintaan HTTP! ”**

Berikut garis besar singkat untuk membantu Anda mengidentifikasi area serangan: 

### Keberadaan Reverse Proxy atau Load Balancer

Jika aplikasi menggunakan layanan seperti **Cloudflare**, **Akamai**, **HAProxy**, **NGINX** , atau **AWS ELB** , ada kemungkinan besar bahwa reverse proxy berada di depan server backend — kondisi yang sempurna untuk terjadinya desinkronisasi. 

### Beberapa Permintaan Ditangani Melalui Satu Koneksi 

Jika server mendukung **HTTP/1.1 dengan koneksi keep-alive** , server tersebut mungkin memungkinkan Anda untuk mengirim beberapa permintaan HTTP dalam satu koneksi TCP — sebuah persyaratan penting untuk penyelundupan permintaan (request smuggling). 

### Perilaku yang Tidak Konsisten dalam Penanganan Permintaan

Jika beberapa permintaan Anda macet, mengalami batas waktu, atau mengembalikan respons yang tidak terduga, itu merupakan petunjuk kuat bahwa frontend dan backend mungkin tidak sepakat tentang di mana permintaan dimulai atau berakhir.

### Penggunaan Header Transfer-Encoding atau Content-Length

Jika Anda melihat judul seperti `Transfer-Encoding: chunked` atau `Content-Length`, atau keduanya diterima dalam permintaan — ujilah. Penyelundupan terjadi karena kebingungan antara kedua hal ini.

### Header Khusus Proksi

Judul seperti `X-Forwarded-For`, `Via`, atau `X-Real-IP` Dalam permintaan HTTP, sarankan penggunaan proxy di jalur tersebut. Ini sering menunjukkan pemisahan antara logika parsing frontend dan backend — sangat cocok untuk pengujian desinkronisasi.

### Aplikasi yang Berjalan di Platform Cloud

Aplikasi yang berada di balik **CDN** (Content Delivery Network) atau **arsitektur microservices** (misalnya, aplikasi yang dihosting di Heroku, AWS, GCP, dll.) seringkali melibatkan proxy berantai atau gateway API — pengaturan ini lebih rentan terhadap bug desinkronisasi.

**Setelah membahas teorinya, mari kita beralih ke petunjuk di dunia nyata — jenis petunjuk yang seharusnya langsung membuat Anda berpikir:**

> “Ini mungkin layak diuji untuk penyelundupan permintaan HTTP!” 


## Jadi, di mana Anda bisa mencoba HTTP Request Smuggling?

Mulailah dengan memperhatikan header respons HTTP . Ini dapat secara diam-diam mengungkapkan bahwa permintaan Anda telah melewati beberapa lapisan, sebuah petunjuk kuat tentang potensi pengaturan HRS.

### Carilah header-header berikut dalam respons:

  - `X-Cache: HIT / MISS`
    Menunjukkan perilaku caching, biasanya dari proxy atau CDN seperti Varnish atau CloudFront.
  - `X-Served-By: varnish / cache-xyz`
    Secara langsung mengungkapkan bahwa lapisan caching (seperti Varnish) terlibat.
  - `Via: 1.1 varnish`
    Ini menunjukkan bahwa permintaan tersebut dialihkan melalui proxy perantara — persis seperti yang kita inginkan.
  - `X-Forwarded-For: ...`
    Menunjukkan permintaan Anda melewati proxy yang melacak IP asli. Tanda yang jelas lainnya. 


Saat Anda melihat header seperti ini, itu adalah lampu hijau untuk memulai pengujian. Header tersebut menandakan arsitektur berlapis di mana **frontend dan backend mungkin mengurai permintaan Anda secara berbeda** — pengaturan yang sempurna untuk HTTP Request Smuggling. 


### Target Berisiko Tinggi untuk HTTP Request Smuggling

**Aplikasi yang didukung CDN**

Aplikasi yang berjalan di balik **CDN** (Content Delivery Network) **seringkali** memiliki banyak komponen (CDN edge → proxy → origin) — sebuah pengaturan yang sempurna untuk penyelundupan.

Waspadai platform seperti **Akamai**, **AWS CloudFront**, **Fastly**, **Cloudflare** (jarang dapat dieksploitasi karena adanya mitigasi).

Ketidaksesuaian antara penguraian CDN dan server asal dapat menyebabkan kerentanan ini. 


**Aplikasi yang Menerima Pengkodean Chunked**

Coba kirimkan header ini: 

```http
Transfer-Encoding: chunked
```

Jika server menerimanya (yaitu, tidak mengembalikan **400 Bad Request** ), berarti Anda berada di jalur yang benar. Pengkodean chunked adalah **titik masuk umum** untuk penyelundupan permintaan, terutama jika dipasangkan dengan `Content-Length` header atau manipulasi kasus khusus lainnya. 

## Membuat Payload HTTP Request Smuggling 

Sekarang setelah Anda tahu ke mana harus mencari, mari kita bahas **"bagaimana cara menguji HTTP Request Smuggling"**.

**Tujuan:**

Buat dan kirim permintaan HTTP yang tampak lengkap di sisi frontend (seperti proxy atau CDN), tetapi masih diuraikan lebih lanjut oleh backend sehingga memungkinkan permintaan 'selundupan' tersembunyi untuk lolos.

Untuk benar-benar memahami dan memanfaatkan HTTP Request Smuggling, Anda perlu memahami cara kerja HTTP Request Smuggling di balik layar. Mari kita uraikan langkah demi langkah dengan contoh praktis dan penjelasan yang jelas. 

### Langkah 1: Merancang Permintaan yang Berbahaya 

Penyerang mengirimkan permintaan HTTP yang berisi header yang saling bertentangan , seperti `Content-Length` Dan `Transfer-Encoding: chunked`. 

Contoh Muatan (Payload): 

```http
POST / HTTP/1.1
Host: example.com
Content-Length: 13
Transfer-Encoding: chunked

0

GET /secret HTTP/1.1
Host: example.com
```

**Apa yang Sedang Terjadi:**

  - `Content-Length: 13` Perintah ini memberi tahu proxy frontend untuk membaca **tepat 13 byte** dari isi permintaan — lalu berhenti.
  - `Transfer-Encoding: chunked` memberi tahu **backend** untuk mengabaikan `Content-Length` dan sebagai gantinya **menguraikan isi dalam potongan-potongan** , di mana setiap potongan dimulai dengan **ukuran heksadesimalnya** , dan ujungnya ditandai dengan potongan berukuran `0`. 

### Langkah 2: Interpretasi Proxy Front-End 

Proxy frontend (seperti CDN, load balancer, atau reverse proxy) memprioritaskan `Content-Length` Header tersebut membaca tepat 13 byte.

Perilaku Proxy:

  - Hal itu mungkin **mengabaikan atau salah** menangani `Transfer-Encoding` Header.
  - Ini hanya terbaca `13` byte (yaitu, `0\n\nGET /private`) dan meneruskan ini sebagai permintaan lengkap ke server backend. 

### Langkah 3: Interpretasi Server Back-End 

backend **server** Di sisi lain, menghormati `Transfer-Encoding` header dan memproses isi sebagai bagian-bagian yang terpisah.

**Perilaku Backend:**

  - Membaca bagian body yang telah dipecah hingga bagian akhirnya. `0`.
  - Lalu melihat `GET /secret HTTP/1.1` sebagai **permintaan baru yang terpisah** — dikirim dalam koneksi yang sama. 


### Langkah 4: Eksploitasi 

Server backend sekarang **memproses permintaan kedua** ( G`ET /secret`) seolah-olah pesan itu datang langsung dari klien.

**Mengapa Ini Berhasil:**

  - **Session Carryover**: Backend mungkin masih mengaitkan permintaan yang diselundupkan dengan sesi pengguna yang sama.
  - **No Revalidation**: Backend menganggap **proxy telah memvalidasi permintaan, dan melewati pemeriksaan keamanan**.
  - **Trust Boundary Bypass**: Ketidakselarasan antara frontend dan backend memungkinkan permintaan yang tidak sah untuk melewati mekanisme validasi dan diproses tanpa pemeriksaan yang semestinya. 


## Teknik Deteksi Manual 

Sebelum beralih ke otomatisasi, penting untuk memahami cara **menguji HTTP Request Smuggling secara manual** . Berikut adalah pendekatan langkah demi langkah untuk mendeteksinya dengan cara klasik — yaitu dengan mengamati bagaimana server berperilaku ketika dihadapkan dengan permintaan yang dirancang khusus. 

### Langkah 1: Coba Uji Payload  (CL.TE atau TE.CL) 


Mari kita mulai dengan teknik yang paling umum — **CL.TE** , di mana server frontend menggunakan `Content-Length` dan backend menggunakan `Transfer-Encoding`.

**Contoh CL.TE :**

```htttp
POST / HTTP/1.1
Host: target.com
Content-Length: 44
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: target.com
```

**Apa yang Sedang Terjadi:**

  - Bagian depan (**frontend**) melihat `Content-Length: 44` dan percaya bahwa itu adalah akhir dari permintaan tersebut.
  - Bagian **backend** melihat `Transfer-Encoding: chunked` dan menguraikan `0` sebagai akhir dari body, memperlakukan segala sesuatu setelahnya sebagai permintaan baru.
  - Hal ini **membagi permintaan** menjadi dua — berhasil menyelundupkan yang kedua. Request `GET /admin`. 

> Jika backend memproses keduanya, Anda telah berhasil memicu penyelundupan permintaan (request smuggling). 


### Langkah 2: Amati Perilakunya 

Setelah Anda mengirimkan payload HTTP Request Smuggling yang telah dirancang, langkah selanjutnya adalah **mengamati dengan cermat bagaimana server berperilaku** .

Anda tidak akan mendapatkan pesan sukses yang jelas; sebaliknya, Anda perlu mencari **petunjuk** halus yang menunjukkan ketidak sinkronan antara frontend (proxy) dan server backend.

Berikut hal-hal yang perlu diperhatikan: 

#### 1. Delayed or Duplicate Responses

  - Server membutuhkan** waktu lebih lama dari biasanya** untuk merespons.
  - Atau mengirimkan **respons dua kali** untuk satu permintaan. 

**Mengapa ini penting:**

Ketidak sinkronan antara proxy dan backend dapat menyebabkan proxy mempertahankan **koneksi tetap terbuka** , menunggu backend merespons — atau **memutar ulang respons** jika melihat permintaan tak terduga kedua. 

#### 2. Kode Status yang Berubah-ubah Secara Tak Terduga 

Anda mungkin melihat sesuatu seperti ini:

  - **Respons pertama** (apa yang dikembalikan server setelah muatan selundupan Anda): 404, 400, atau 502
  -** Respons kedua** (yang Anda dapatkan saat mengirim permintaan tindak lanjut normal, tetapi sebenarnya mungkin merupakan **respons tertunda terhadap permintaan selundupan Anda** ): 200 OK 

Mari kita uraikan dengan sebuah contoh.

Anda mengirimkan payload berikut di **Burp Suite Repeater** : 

```http
POST / HTTP/1.1
Host: target.com
Content-Length: 6
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: target.com
```

Meskipun terlihat seperti satu permintaan tunggal, sebenarnya Anda telah menggabungkan dua permintaan menjadi satu :

  - Permintaan POST palsu /**tidak lengkap** yang berakhir dengan cepat.
  - Permintaan **GET tersembunyi** ke `/admin` — ini adalah permintaan selundupan Anda . 

**Apa yang Terjadi di Sisi Server?**

  - Frontend (**proxy**) hanya melihat permintaan pertama (karena ia mempercayainya) `Content-Length: 6` dan meneruskan hal itu saja.
  - Backend (**origin server**) menggunakan `Transfer-Encoding: chunked`, dan menganalisis lebih lanjut — sampai pada **permintaan kedua Anda yang diselundupkan** ( `GET /admin`). 

Permintaan yang diselundupkan ini **diproses secara diam-diam** oleh backend, tetapi **Anda tidak akan langsung melihat responsnya** karena frontend tidak pernah mengharapkannya.

**Jadi, apa yang dimaksud dengan “Respons Kedua”?**

Setelah mengirimkan muatan penyelundupan, Anda kemudian mengirimkan **permintaan normal** , seperti: 


```http
GET /home HTTP/1.1
Host: target.com
```


Dan **permintaan baru ini memicu respons yang aneh** , seperti:

  - `200 OK` dengan konten yang tidak Anda duga (mungkin dari `/admin`)
  - Halaman yang sangat pendek atau rusak
  - Waktu habis atau balasan tertunda 

**Itulah** yang kita sebut sebagai **"respons kedua"** .

Ini sebenarnya bukan respons terhadap permintaan kedua Anda — ini sebenarnya **respons dari backend terhadap permintaan yang diselundupkan** , yang dikirimkan **ketika Anda membuat permintaan lain** .



**Mengapa Hal Itu Terjadi**

Karena frontend dan backend **tidak sinkron** , backend mungkin akan:

  - Tahan respons yang diselundupkan di antrian koneksi.
  - Kirimkan **saat Anda membuat permintaan berikutnya**.
  - Campur aduk batasan permintaan-respons 

Inilah yang dimanfaatkan oleh para penyerang — ketidaksejajaran tersebut.

**Artinya:**

Bagian **pertama** dari muatan selundupan Anda (seperti POST / dengan data sampah) ditolak, sehingga muncul kesalahan.

Namun **bagian kedua** (misalnya, GET /admin) lolos dan **diproses secara diam-diam** oleh backend.

Kemudian, saat Anda mengirim permintaan reguler, backend mungkin merespons dengan cara yang aneh (karena tidak **sinkron** atau masih menyimpan permintaan yang diselundupkan sebelumnya). 

ini **Perubahan perilaku yang tiba-tiba** , yang diikuti oleh kesalahan dan keberhasilan, merupakan **pertanda kuat** bahwa muatan penyelundupan Anda **berhasil** dan **menegaskan** bahwa frontend dan backend **tidak selaras** dalam cara mereka mengurai permintaan — persis seperti yang dieksploitasi oleh HRS.


Setelah Anda memvalidasi perilaku tersebut secara manual, Anda dapat melanjutkan ke pembuatan dan otomatisasi muatan yang lebih canggih. 


## Alat yang Bisa Anda Coba 

Setelah Anda memahami dasar-dasar dan teknik manual, saatnya untuk mempercepat prosesnya dengan beberapa alat canggih yang membantu mendeteksi dan mengeksploitasi kerentanan HTTP Request Smuggling secara lebih efisien

1. Ekstensi HTTP Request Smuggler di Burp Suite

  - Mengotomatiskan pengujian untuk **CL.TE** , **TE.CL** , dan **CL.CL**. teknik penyelundupan
  - Menyoroti perilaku desinkronisasi, respons terpisah, dan anomali waktu.
  - Sangat cocok untuk pengujian black-box dan semi-transparan. 

2. Turbo Intruder

  - Mesin permintaan HTTP berkinerja tinggi untuk kustom pengujian fuzzing desinkronisasi dalam **skala besar** .
  - Ideal untuk membuat muatan data yang tidak biasa atau kasus khusus (misalnya, ukuran chunk yang salah bentuk, trik spasi, akhiran baris ganda).
  - Mendukung pembuatan skrip dalam Python untuk logika pengujian tingkat lanjut.


## Teknik Umum yang Bisa Dicoba 

Saat melakukan pengujian untuk HTTP Request Smuggling, tujuan Anda adalah untuk **membingungkan frontend dan backend** sehingga mereka menafsirkan permintaan HTTP secara berbeda.

Berikut adalah **3 teknik yang paling umum** , beserta contoh sederhana untuk masing-masing teknik. 



### 1. CL.TE (Content-Length + Transfer-Encoding)

  - **Kepercayaan frontend** : `Content-Length`
  - **Kepercayaan backend** : `Transfer-Encoding: chunked`

**Tujuan** : Frontend membaca permintaan berdasarkan `Content-Length` Namun, backend terus membaca menggunakan pengkodean chunked — dan akhirnya memproses permintaan kedua yang tersembunyi. 


**Contoh Muatan (Payload):**

```http
POST / HTTP/1.1
Host: target.com
Content-Length: 6
Transfer-Encoding: chunked
Connection: keep-alive

0

GET /admin HTTP/1.1
Host: target.com
```

**Apa yang terjadi :**

  - Frontend melihat 6 byte dan mengira prosesnya sudah selesai.
  - Backend melihat `Transfer-Encoding: chunked`, menyelesaikan bagian tersebut (`0`), dan memproses `GET /admin` sebagai **permintaan kedua** . 


### 2. TE.CL (Transfer-Encoding + Content-Length)

  - **Kepercayaan backend** : `Transfer-Encoding: chunked`
  - **Kepercayaan frontend** : `Content-Length`


**Tujuan** : Frontend menguraikan permintaan sebagai bagian-bagian yang dipecah (chunked), tetapi backend menggunakan panjang konten — sehingga dapat memperlakukan bagian akhir dari isi permintaan yang dipecah sebagai bagian dari permintaan berikutnya. 


**Contoh Muatan (Payload):**

```http
POST / HTTP/1.1
Host: target.com
Transfer-Encoding: chunked
Content-Length: 50
Connection: keep-alive

0

GET /admin HTTP/1.1
Host: target.com
```

**Apa yang terjadi :**

  - Frontend menghormati pengkodean chunked dan berhenti di `0`.
  - Backend mengabaikan chunking, mempercayai `Content-Length: 50`, dan akhirnya salah menafsirkan barang selundupan Anda `GET /admin`. 


### 3. TE.TE (Transfer-Encoding pada keduanya, tetapi diuraikan secara berbeda) 

  - Baik **frontend** maupun **backend** menggunakan : `Transfer-Encoding: chunked`
  - Namun mereka **menanganinya secara berbeda** karena bug pada parser, keanehan spasi, atau ukuran chunk yang salah. 

**Tujuan** : Kedua belah pihak mengira mereka sedang memproses data yang telah dipecah-pecah, tetapi perbedaan format kecil membingungkan salah satu pihak — sehingga permintaan kedua Anda lolos.
Contoh Muatan (Payload): 


```http
POST / HTTP/1.1
Host: target.com
Transfer-Encoding: chunked
Connection: keep-alive

5

Hello

0

GET /admin HTTP/1.1
Host: target.com
```


**Apa yang terjadi :**

  - Frontend mungkin melihat data yang telah dibagi menjadi beberapa bagian dan berhenti di `0`.
  - Backend mungkin salah menangani pemecahan data dan melihat `GET /admin` sebagai bagian dari permintaan baru. 


## Pengingat:

Tidak peduli teknik mana yang Anda coba:

  - Selalu gunakan `HTTP/1.1`
  - Tambahkan header `Connection: keep-alive`
  - Kirim **permintaan tindak lanjut** setelah payload Anda untuk memeriksa perilaku yang tidak biasa. 

