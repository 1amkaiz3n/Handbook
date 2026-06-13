## Apa Itu GraphQL?
Mari kita bayangkan skenario ini:

Di **GraphQL**, alih-alih melakukan request ke endpoint umum seperti `POST /graphql`, kita bisa mengeksekusi query tertentu dengan menyertakan parameter seperti:

```json
{
  "operationName": "CMSIndexedSitesList",
  "query": "...",
  "variables": {}
}
```

Dengan cara ini, server akan mengeksekusi query `"CMSIndexedSitesList"` dan mengembalikan daftar situs yang diminta. Kita juga bisa menggunakan **POST** untuk memanipulasi data, misalnya membuat daftar situs baru atau menambahkan item ke dalamnya.

Selain itu, ada **PUT**, yang biasanya berbeda dengan POST. Jika **POST** digunakan untuk memperbarui data yang ada, **PUT** umumnya digunakan untuk menambahkan data baru ke dalam daftar atau mengganti seluruh resource.

Sebagai perbandingan, di **REST API**, setiap aksi biasanya memiliki endpoint berbeda sesuai resource dan metode HTTP:

* **GET /sites** → Mengambil daftar situs
* **POST /sites** → Membuat situs baru
* **PUT /sites/{id}** → Memperbarui situs tertentu
* **DELETE /sites/{id}** → Menghapus situs tertentu

Jadi perbedaan utama:

* **GraphQL** → Satu endpoint (`/graphql`) untuk query dan mutasi, request lebih fleksibel, bisa memilih field spesifik.
* **REST API** → Banyak endpoint, setiap resource punya URL sendiri, metode HTTP menentukan aksi yang dilakukan.

Contoh dalam konteks testing: di GraphQL, jika server tidak memvalidasi `operationName` atau `variables` dengan benar, kita bisa mendapatkan atau memodifikasi data yang seharusnya tidak bisa diakses—mirip kasus **IDOR / exfiltration**.



### GraphQL vs REST API – Penjelasan Sederhana

Bayangkan **REST API** itu seperti **restoran ala carte**. Setiap menu (resource) punya alamat sendiri:

* Kamu ingin menu “situs” → pergi ke `/sites`
* Tambah situs baru → kirim pesanan ke `/sites` dengan metode POST
* Update situs tertentu → kirim pesanan ke `/sites/{id}` dengan metode PUT
* Hapus situs → kirim pesanan ke `/sites/{id}` dengan DELETE

Setiap aksi jelas: GET untuk ambil data, POST untuk buat data, PUT untuk update, DELETE untuk hapus.

Sekarang, **GraphQL** itu seperti **buffet**: ada satu tempat (`/graphql`) tapi kamu bisa pilih menu apa saja yang kamu mau di piringmu. Misal kamu hanya ingin “nama situs” dan “URL situs”, cukup tulis query untuk itu, server hanya mengembalikan data tersebut.

Contoh query GraphQL sederhana:

```json
{
  "operationName": "CMSIndexedSitesList",
  "query": "query CMSIndexedSitesList { sites { id name url } }",
  "variables": {}
}
```

* Server membaca `operationName` → mengeksekusi query yang diminta.
* Bisa **GET** atau **POST** tergantung konfigurasi.
* Bisa juga melakukan mutasi (ubah atau tambah data) lewat GraphQL dengan format serupa, hanya berbeda jenis operasi (`mutation`).

Misal kasus testing:

* **GET /CMSIndexedSitesList** → mengembalikan daftar situs.
* **POST /graphql** dengan mutation `AddSite` → menambahkan situs baru.
* Kalau server tidak memvalidasi `operationName` atau akses user dengan benar, kita bisa **melihat atau memodifikasi data yang seharusnya tidak boleh diakses** → ini potensial untuk **IDOR / exfiltration**.

**Perbandingan singkat:**

| Aspek             | REST API                                   | GraphQL                                                               |
| ----------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| Endpoint          | Banyak, tiap resource punya URL sendiri    | Satu endpoint untuk semua query & mutation                            |
| Flexibilitas data | Data yang dikembalikan fix sesuai endpoint | Bisa pilih field spesifik yang mau dikembalikan                       |
| Mutasi / update   | PUT / POST / DELETE tiap endpoint          | Mutation di satu endpoint                                             |
| Potensi bug akses | Tergantung validasi tiap endpoint          | Bisa lebih tricky karena satu endpoint, field-level check harus ketat |

**Analogi singkat:**
REST = restoran ala carte, GraphQL = buffet. Di buffet, kalau server tidak cek hak akses tiap jenis makanan, kamu bisa mengambil “menu” yang seharusnya tidak boleh kamu ambil.

