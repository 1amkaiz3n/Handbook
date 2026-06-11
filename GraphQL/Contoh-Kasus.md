# Introspection Query Payload

## 1. Mengakses postingan GraphQL pribadi
**LAB** : https://portswigger.net/web-security/graphql/lab-graphql-reading-private-posts



Seperti yang sudah kita bahas, hal pertama yang harus dilakukan adalah menemukan endpoint GraphQL. Dengan hanya menyegarkan halaman, kita akan melihat permintaan POST untuk `/graphql/v1` untuk mendapatkan semua postingan. Kita juga melihat bahwa nama query untuk melakukan hal tersebut adalah **getBlogPosts**.

dan dsini kita mendapktan serpt iini

```js
{"query":"\nquery getBlogSummaries {\n    getAllBlogPosts {\n        image\n        title\n        summary\n        id\n    }\n}","operationName":"getBlogSummaries"}
```

sekarang mari kita coba mendapatkan skema basis data. Kita dapat melakukannya dengan mengirimkan kueri introspeksi.


**Untuk Menemukn Skema**
```json
{"query":
"{__schema{types{name,fields{name}}}}"}
```

atau
```js
{ __schema { types { name fields { name } } } }
```

Di sini kita melihat nama: “Blog Posts” dan kita melihat semua field di dalamnya, dan field **postPassword** memang berada di dalam Blog Posts. Saat kita melakukan enumerasi aplikasi web di awal, kita melihat ada semua id BlogPosts kecuali id ​​yang sama dengan 3. Jadi itulah postingan target kita!

Sekarang yang tersisa hanyalah melakukan query getBlogPost untuk postingan dengan id 3 (perhatikan bahwa kata sandi akan berbeda untuk Anda).

```json
{"query":
"{getBlogPost(id:3){getBlogPost}}"}
```

dan kita mendaptkan respon seperti ini

```json
{
  "data": {
    "getBlogPost": {
      "postPassword": "g5abtnk7aj3iy9puuv4vupfggeftvbja"
    }
  }
}
```



## 2.Accidental exposure of private GraphQL fields / Paparan tak sengaja terhadap field GraphQL privat

**LAB** : https://portswigger.net/web-security/graphql/lab-graphql-accidental-field-exposure

Kita perlu mengidentifikasi endpoint yang sama seperti pada lab sebelumnya — permintaan POST yang dibuat ke /graphql/v1.

Kemudian kita dapat menggunakan introspeksi untuk menemukan informasi skema.

Disni untuk requestnay seperti ini

```json
{"query":"\nquery getBlogSummaries {\n    getAllBlogPosts {\n        image\n        title\n        summary\n        id\n    }\n}","operationName":"getBlogSummaries"}
```

Dari sini kita melihat ada `getUser` kueri yang mengembalikan nama pengguna dan kata sandi pengguna.

Pada dasarnya kita ingin mendapatkan kata sandi pengguna administrator agar kita dapat melakukan otentikasi sebagai admin dan menghapus pengguna Carlos. Kita dapat menyusun kueri berdasarkan ID pengguna. 

Saya berasumsi bahwa ID administrator adalah 1, 

Jadi disni say mengirimkan paylaod seprti ini:

```json
{"query":{"getUser(id:1){username}"}}
```
dan saya benar.
