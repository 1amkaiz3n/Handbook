# JSLuice

jsluiceadalah paket Go dan alat baris perintah untuk mengekstrak URL, jalur, rahasia, dan data menarik lainnya dari kode sumber JavaScript. 

## URLs

```bash
jsluice urls fetch.js | jq
```

Atau

```bash
find . -name '*.js' | jsluice urls | jq
```

## Secrets

```bash
jsluice secrets awskey.js | jq
```

Atau

```bash
find . -name '*.js' | jsluice secrets | jq
```

## Custom Secret Patterns

Tool command-line **jsluice** memungkinkan kamu memberikan file JSON menggunakan flag `--patterns` atau `-p` yang berisi daftar **pattern buatan pengguna** untuk mencocokkan secret.

Berikut contoh kecil file pattern:


```json
[
  {
    "name": "base64",
    "value": "(eyJ|YTo|Tzo|PD[89]|rO0)[%a-zA-Z0-9+/]+={0,2}",
    "severity": "low"
  },
  {
    "name": "genericSecret",
    "key": "(secret|private|key)",
    "value": "[%a-zA-Z0-9+/]+"
  }
]
```

Setiap pattern memiliki sebuah **nama** yang akan digunakan pada field `kind` dalam output tool. Ada dua field tambahan: `key` dan `value`.

Field `value` berisi **regular expression dengan format Go** yang akan dijalankan terhadap semua **string literal** di dalam source code JavaScript. Tanda kutip pada string akan dihapus terlebih dahulu, jadi kamu tidak perlu memikirkan karakter `" "` atau `' '`.

Field `key` berisi **regular expression** yang akan dijalankan terhadap nama key pada object JavaScript.

Jika kamu menentukan kedua field (`key` dan `value`), maka **kedua regular expression tersebut harus cocok** agar hasil dapat dikembalikan.

Field `severity` memungkinkan kamu mengkategorikan pattern untuk proses prioritas berikutnya. Karena bagaimanapun, kemungkinan kamu lebih peduli menemukan **API key** dan **secret** dibanding menemukan JSON yang hanya di-encode menggunakan Base64.

Berikut contoh kode yang agak sederhana (dan sedikit konyol) untuk mencoba pattern di atas:

```javascript
function getConfig(){
    let config = {
        randomStr: "abc123xyz256",
        secret: "I quite like PHP",
    }

    return "eyJsb2wiOiAic29tZSBKU09OISIsICJjb3VudCI6IDEyM30K"
}
```

Intinya: jsluice patterns ini dipakai buat bikin **custom secret scanner**. Kamu bisa menentukan:

* `value` → scan isi string
* `key` → scan nama property object
* `severity` → kasih tingkat prioritas hasil

Contoh real hunting:

```js
{
  apiKey:"AIza..."
}
```

Pattern bisa dibuat supaya hanya menangkap:

* key bernama `apiKey`
* value dengan format token tertentu

Jadi tidak cuma dump semua string seperti manusia mencari jarum di tumpukan jerami sambil menambah jeraminya sendiri.



```bash
jsluice secrets -p patterns.json b64.js | jq
```

## Matching Objects

```bash
jsluice secrets -p patterns.json firebase.js | jq
```

## Trees and Queries

```bash
```