# Skenario cari XSS atau cari HTML Injection

Di kasus ini saya menemukn HTML Injection,kira-kira seprti ini yagn saya lakukan

hasil Wappalyzer


CMS
  - HubSpot CMS Hub
Miscellaneous
  - HTTP/3
CDN
  - Cloudflare
Marketing automation
  - HubSpot


saya menemukna searhbar kaya gin

```bash
/hs-search-results?q=TEST123&language=de
```

## 1 — Cari SOURCE (siapa ambil input)

Buka Sources.

Cari:

```js
searchParams.get('q')
```

atau:

```js
URLSearchParams
```

Yang mau ditemukan:

```js
this.query =
searchParams.get('q')
```

Berarti:

```text
URL
↓
query
```


# 2 — Cari QUERY DIPAKAI DIMANA

Sekarang cari:

```js
this.query
```

Yang mau ditemukan:

Contoh:

```js
title =
`found results for ${this.query}`
```

atau:

```js
.replace(
'[[query]]',
this.query
)
```

Kalau ketemu:

```text
query
↓
dibentuk jadi string
```

mulai menarik.

---

# 3 — Cari SINK (bagian paling penting)

Sekarang cari apakah string itu masuk ke DOM.

Yang dicari:

```js
innerHTML
```

atau:

```js
insertAdjacentHTML
```

atau:

```js
outerHTML
```

atau:

```js
render(...)
```

---

Dan LU TADI SUDAH NEMU.

Lu kirim ini:

```js
<p>
${ this.texts.noResults }
"${ this.query }"
</p>
```

dan:

```js
this.parent.innerHTML = ...
```

Nah itu sink.

Mirip pola render template HTML yang memang dipakai modul search HubSpot. Modul default HubSpot juga punya render hasil pencarian dengan `innerHTML` untuk membentuk tampilan hasil/no-result. ([HubSpot Developer Documentation][2])

Jadi sebelum inject, checklist lu:

```text
[✓] Input dari URL?
[✓] Masuk variabel?
[✓] Variabel dipakai bikin HTML?
[✓] HTML masuk innerHTML?
```

Kalau semua ✓ → baru layak uji.

Contoh flow final:

```text
?q=
↓
searchParams.get('q')
↓
this.query
↓
`<p>${this.query}</p>`
↓
innerHTML
↓
Browser parse
↓
HTML Injection
```

Kalau ternyata terakhirnya:

```js
textContent=
```

atau:

```js
setAttribute('value')
```

biasanya jangan buang waktu buat HTML injection.

Jadi yang lu cari di JS bukan payload — tapi **source → transform → sink**. Itu pola yang dipakai terus buat DOM bug lain juga.

[1]: https://developers.hubspot.com/docs/guides/cms/content/content-search?utm_source=chatgpt.com "Content Search - HubSpot docs"
[2]: https://hubspot.mintlify.io/cms/reference/modules/default-module-versioning?utm_source=chatgpt.com "Default module versioning - HubSpot docs"
