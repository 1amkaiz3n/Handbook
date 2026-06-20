# Mencari Krentanan di GraphQL

## Mencari tahu apa yagn di pakai di web app
kita bis menggunkan tools Graphqw--f untuk mengetahui ap yagn di pakai,apakh Apollo,atau sebagainya

## Mencari Skema

**Skema adalah segalanya dalam GraphQL**,ini memberi tahu **query** apa saja yagn ada,**mutation** yagn dapat kita lakukan dan **field** apa saja yagn tersedia 

Pada dasarnay ini adalah **Map /Peta** untuk seluruh wilayah API

Cara termudah untuk mendaptkna skema adalah dengan melalui **introspeksi** .Introspeksi fitur bawaan GraphQl yagn **memungkinkan kita untuk melakukan query** pada skema itu sendiri.

### Jika introspeksi Aktif

#### Query Introspeksi 

```js
{__schema{types{name,fields{name}}}}
```
Atau kalau di bungkus degna query

```json
{"query":
"{__schema{types{name,fields{name}}}}"}
```

atau juga 

```js
{__schema{queryType{name}mutationType{name}subscriptionType{name}types{...FullType}directives{name description locations args{...InputValue}}}}fragment FullType on __Type{kind name description fields(includeDeprecated:true){name description args{...InputValue}type{...TypeRef}isDeprecated deprecationReason}inputFields{...InputValue}interfaces{...TypeRef}enumValues(includeDeprecated:true){name description isDeprecated deprecationReason}possibleTypes{...TypeRef}}fragment InputValue on __InputValue{name description type{...TypeRef}defaultValue}fragment TypeRef on __Type{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name}}}}}}}}
```

### Jika introspeksi Nonaktif
Jika introspeksi di nonnaktifkan karensa biasnay dengan alasan keamanan,bukn berarti kita tidak bis melihat nya,ada banyk cara untuk mem Bypass nya atau merekonstruksi skema nya.

1. Anda dapat beralih dari POST ke GET,terkadang kontrol keamanan  hany memerikan Post Request 
2. Anda dapat mem Bypass atau degan menambhkan spasi,baris baru,atau komentar dalam query introspeksi untuk menghindari filter dasar .
3. Anda dapat memanfaat kan `message` atau pesan error dengan mengirimkan query yagn tidak valid dan server mungkin membocorkan nam kolom dalam response kesalahan
4. Anda dapat melakukn serangan Brute Force untuk menemukan nama-nama field menggunakan tools [clairvoyance](https://github.com/nikitastupin/clairvoyance) 


## Serangan 

Kategoti kerantanan utam pada GraphQL:

**1. DoS**
 
GraphQL rentan terhadap DoS karena fleksibilitas nya.Anda dapat membuat Query yang sangat kompleks,sangat bertingaknt sehingga  membebani server.

pengguan ini conothny degnan mengirikn banyka query seperti contoh berikut:

```js
query {
    user1:user(id:"1") {name}
    user1:user(id:"1") {name}
    user1:user(id:"1") {name}
    user1:user(id:"1") {name}
    user1:user(id:"1") {name}
    ...
    ...
    ...
}
```

kita kirm ini degan sebnak mungin 

Jik tidak ada batasan dalam Request alisa ini,kita bisa mgnirimkna bnayuk query sekaligus untuk membebani server.


**2. Rate Limiting Bypass**



**3. Authentications & Authorization Issues**

Bug ini sangat uum terjdi di GraphQL,dan maslah yagn paling umum adalah kurangnay otorisasi tinggkat di field 

Mislan saya ada request seperti in

```js
query MyQuery {
  person(personID: "5") {
    id
    name
  }
}
```
dan ektsk say kirin, ini adalha respoinse nya
```json
{
  "data": {
    "person": {
      "id": "cGVvcGxlOjE=",
      "name": "Luke Skywalker"
    }
  }
}
```
ini akan mengembalikan `id`,dan juga `name`,namu ada beberapa field spesifik yang tidka boleh di akses atau tidak boleh di berikan kepada client lain kketika client lain memintanya.Misalnay katakanlah `id`,atau apapun itu yang sensitif dan seharsuany user lain tidak dapat mengaksesnya atau mendapattttkannay.

Jika data yagn di kembalikn ini adalah kerentanan,server seharusnay memerksaa apakha kita berwenagn untk mengakse data sensitif user tersebut.

Dan kita juga memiliki suatu metode seperti Brute Force untuk mendapatkan kredensial.Jadi jika kita ingin melakukn brute force kredensial di GraphQl,kita harus menggunakn Tools seperti **CrackQL**


**4. Information Disclosure**

Information Disclosure di GraphQl terjadi  ketika API membocorkan data yang seharsnay tidak di bocorkan.Itu bis di lakukna melalui,katakanlah tebakan ke field.

Mislkan disni sayaad request seperti ini
```js
query MyQuery {
  person(personID: "1", id: "cGVvcGxlOjE=") {
    id
    name
  }
}
```

Dan alih-alih saya menggunakn `name`,disni saya coab memasukkan degna `nams`,dan ktia mendaptkan respinse seperti ini

```json
{
  "errors": [
    {
      "message": "Cannot query field \"nams\" on type \"Person\". Did you mean \"name\" or \"mass\"?",
      "locations": [
        {
          "line": 4,
          "column": 5
        }
      ]
    }
  ]
}
```

Sisteam akan memberitahu bahwa `nams` yagn di minta tidak di temukan di kolo, query,apakah maksud anda `name`?,,jadi ini di sebut saran kolom,dan pada dasarnay ini terjdi ketika kita menulis sesuatu yagn salah,tetapi sangant mirip dengan apa yang sudah ada,dan server merespon kita dengan filed `name` yang benar.
Jadi ketiak saya mengubhanay ke filed yagn benar,itu akan memberikan kita ap yang kita mau.

Dan terkadang field yang seharusnay di batasi,justru dapat di akses dan Information Disclosure juga bis melalui kesalahan Debug.


**5. CSRF di GraphQL**

Bagaiman kita dapat melakukn CSRF di GraphQL,kita akan tangakp Request dengan Burp suite.

Jadi CSRF di GraphQl di mungkinkan ketika API menerima Request GET atau POST Request menyertakan formulir dan emngandalkna cookie untuk otentikasi.Hal ini bergantuang pada cookie.

Sebagai contoh kataknlah kita memuliki sesuatu seperti Mutation

```js
{
    mutaion{deleteAccount{success}}
 }
```

Jadi mutation ini memiliki sesuatu seperti `deleteAccount` yagn pad dasarnay untk menghapsu akun user.Dan  kita hanay perlu bertanay apakah itu akan berhsil.

Misalkn di Burp suie ktia melihat seperti Request POST ini

```json
{
    "query":"{\n mutaion{\n     deleteAccount{success}\n    }\n }"
}
```
Kita akan mencoab CSRF disini,kita akan mengirimkn degna methos GET seperti ini

```json'
?query={mutaion{deleteAccount{success}}}
```

jadi kita akan mgnirimkn request seperti ini di Burp

```js
GET /graphql/?query={mutaion{deleteAccount{success}}}
```

Dan jikga kita mgnirimknany,dan server membalas,yang berati server GraphQl menerima Request GET.Jadi degan Request sederhana seperti itu kita dapat langsung melakukn serangan CSRF untuk menghapsu akun korban manapun.

Sekarang Attacker dapat memicu itu dengan tautan link,jika korban sedang login dna mengklik tautan itu,akun mereka akam terhapus.

Anda juga bisa mencoab mengubah `Content-Type` menjadi sesuat seperti `WWW-form-url-encoded`,dan lihat apakah sever masih memperoses naya.Jadi pada dasarnay ini adalah kategori serangan utama dalam GraphQL .Masing-masing memanffaatkan aspek yang berbeda dari cara kerja GraphQL.