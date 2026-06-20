# CSRF Bypass Using Domain Confusion Leads To ATO



## Analisa awal

Target:

```
account.example.com
```

Ditemukan:

* Endpoint sensitif pakai JSON:

```
POST /phone.json
```

* Request:

```
Content-Type: application/json
```

* Tidak ada CSRF token

Awalnya kelihatan aman karena browser sulit kirim JSON cross-origin. Tapi manusia kadang terlalu percaya aturan browser, padahal bug suka nongol dari celah kecil.

---

## Cek CSRF

Cari endpoint yang impact besar:

Contoh:

* ubah nomor HP
* ubah username
* tambah API key
* aktifkan MFA

Test:

Apakah server benar-benar validasi:

```
Content-Type: application/json
```

Hasil:
Server tetap menerima body JSON dari request lain.

---

## Bypass JSON CSRF

Gunakan:

```
enctype="text/plain"
```

Agar browser bisa POST cross-origin.

Payload dibuat supaya body menjadi JSON valid:

```json
{
"phone":"attacker_number",
"a":""
}
```

Server menerima request walau bukan dari origin asli.

---

## Masalah terakhir

Exploit masih gagal karena server cek:

```
Referer
```

Harus berasal dari:

```
account.example.com
```

---

## Temuan: Domain confusion

Test berbagai format:

Gagal:

```
evil.com/account.example.com
evil.com#account.example.com
account.exampleevil.com
```

Berhasil:

```
https://evil.com/test@example.com
```

Kenapa?

Karena parser URL menganggap:

```
username@domain
```

Bagian setelah `@` dianggap domain asli.

Aplikasi salah membaca URL dan mengira:

```
test@example.com
```

adalah domain trusted.

---

## Final exploit flow

1. Host exploit di attacker domain
2. Manipulasi URL agar Referer terlihat trusted
3. Kirim CSRF POST
4. Server menerima request
5. Ubah data akun korban

---

## Impact

Karena endpoint sensitif ikut kena:

* Ubah nomor HP → takeover akun
* Ubah username
* Tambah API key full permission
* Hubungkan akun eksternal
* Aktifkan MFA attacker

---

## Root Cause

Gabungan:

```
Tidak ada CSRF protection
        +
Server percaya Content-Type
        +
Validasi domain/referer salah
        =
CSRF → ATO
```

---

Fokus hunting:

* Endpoint JSON sensitif
* Tidak ada CSRF token
* Cek apakah request bisa dibuat dari HTML form
* Cek validasi Origin/Referer pakai parser yang salah

Bug-nya bukan di CSRF doang, tapi di **trust terhadap domain**.
