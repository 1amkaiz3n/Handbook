# Tools clairvoyance

Pada dasarnay tool ini menggunakn wordlist untuk menebak nama kolom.Sistem ini mengirimkn query degan nama field tambahan dan  menganalis Response nya.Seiring waktu,dia menrekonstruksi skema tersebut bahkan tanpa introspeksi.

Pada daasarnay ini membutuhkn waktu tetapi berhasil dan setelah kita mendapatkan skema  tersebut,Anda dapat memuatnya  ke  Tools  **[GraphQL Voyager](https://apis.guru/graphql-voyager/)**

**CONTOH PENGGUNAAN:**

  `clairvoyance  https://graphql.org/graphql/ -o schema.json`

**FITUR:**
- Dapatkan skema API GraphQL meskipun introspeksi dinonaktifkan.