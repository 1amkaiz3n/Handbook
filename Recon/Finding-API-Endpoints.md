# Finding API Endpoints: Scrape the Data Source, Not the Website 

Menemukan API adalah senjata rahasia para scraper profesional. Mari saya tunjukkan caranya. 

## Mengapa API Lebih Baik Daripada Mengambil Data HTML Secara Manual?

**Mengambil data HTML:**
  - Lambat (unduh + parsing)
  - Rapuh (patah saat desain berubah)
  - Berantakan (tag bersarang, struktur tidak konsisten)
  - JavaScript diperlukan (bahkan lebih lambat)

**API pengikis data:**
  - Cepat (cukup unduh JSON)
  - Stabil (API lebih jarang berubah dibandingkan situs web)
  - Bersih (data JSON terstruktur)
  - Tidak perlu rendering.

**Perbandingan kecepatan:**
  - Pengambilan data HTML: 10-20 halaman/detik
  - Pengambilan data API: 100-500 halaman/detik

Itu 10-50 kali lebih cepat! 

## Cara Menemukan Endpoint API

### Langkah 1: Buka Alat Pengembang

**Chrome/Edge:**

- Tekan F12 atau Ctrl+Shift+I
- Klik tab "Networks"

**Firefox:**

- Tekan F12
- Klik tab "Networks"

### Langkah 2: Saring berdasarkan XHR/Fetch

Klik tombol "XHR" atau "Ambil" di tab Networks. Ini hanya menampilkan permintaan API.

### Langkah 3: Segarkan Halaman

Tekan Ctrl+R untuk memuat ulang. Request pemantauan muncul di tab Networks.

### Langkah 4: Cari Respons JSON

Klik permintaan satu per satu. Cari:

- URL yang berisi `/api/`
- Respons dengan data JSON
- Request dengan data target Anda

### Step 5: Inspect the Request

**Klik pada permintaan yang menarik  → Check:**

1. **URL** (Request URL at top)
2. **Method** (GET, POST, etc.)
3. **Headers** (Authorization, cookies, etc.)
4. **Payload** (if POST request)
5. **Response** (the JSON data)

---

## Contoh Nyata: Daftar Produk 

Misalnya, Anda sedang mengambil data produk dari sebuah toko. 

### Apa yang Anda Lihat di Tab Networks 

```js
Request URL: https://api.example.com/v1/products?page=1&limit=20&sort=popular
Method: GET
Status: 200

Response:
{
  "products": [
    {
      "id": 123,
      "name": "Widget Pro",
      "price": 29.99,
      "stock": 50
    },
    {
      "id": 124,
      "name": "Gadget Plus",
      "price": 49.99,
      "stock": 30
    }
  ],
  "total": 1523,
  "page": 1,
  "pages": 77
}
```

Sempurna! Anda telah menemukan API-nya. 

### Your Scrapy Spider 

```python
import scrapy
import json

class ApiSpider(scrapy.Spider):
    name = 'products'

    def start_requests(self):
        url = 'https://api.example.com/v1/products?page=1&limit=20&sort=popular'
        yield scrapy.Request(url, callback=self.parse)

    def parse(self, response):
        data = json.loads(response.text)

        # Extract products
        for product in data['products']:
            yield {
                'id': product['id'],
                'name': product['name'],
                'price': product['price'],
                'stock': product['stock']
            }

        # Pagination
        current_page = data['page']
        total_pages = data['pages']

        if current_page < total_pages:
            next_page = current_page + 1
            next_url = f'https://api.example.com/v1/products?page={next_page}&limit=20&sort=popular'
            yield scrapy.Request(next_url, callback=self.parse)
```

Selesai! Bersih, cepat, dan andal. 

## Menemukan API Tersembunyi (Tingkat Lanjut)

Beberapa API tidak mudah ditemukan. Berikut cara menemukannya.

### Teknik 1: Cari "api" di Tab Networks

Ketik "api" di kotak filter. Hanya menampilkan URL yang mengandung "api".

### Teknik 2: Cari GraphQL

Situs web modern menggunakan GraphQL. Carilah:

- URL: `https://example.com/graphql`
- Metode: POST
- Muatan berisi "query"

Contoh permintaan GraphQL:

```json
{
  "query": "{ products(limit: 20) { id name price } }"
}
```

### Teknik 3: Memeriksa Koneksi WebSocket

Beberapa situs menggunakan WebSocket untuk pembaruan waktu nyata.

Di tab Networks:

- Filter berdasarkan "WS" (WebSocket)
- Klik pada koneksi
- Lihat pesan

### Teknik 4: Perhatikan Tag Skrip

Terkadang URL API disematkan dalam JavaScript:

```python
def parse(self, response):
    # Cari URL API di tag script
    scripts = response.css('script::text').getall()

    for script in scripts:
        if 'api.example.com' in script:
            # Ekstrak URL API dari JavaScript
            import re
            urls = re.findall(r'https://api\.example\.com/[^"\']+', script)
            for url in urls:
                yield scrapy.Request(url, callback=self.parse_api)
```


## Menangani Otentikasi API

Banyak API memerlukan otentikasi.

### Tipe 1: Kunci API di URL

```
https://api.example.com/products?api_key=abc123def456
```

**Cara menemukannya:**

- Periksa URL permintaan di tab Networks.
- Mencari `api_key`, `key`, `token` parameter

**spider Anda:**

```python
def start_requests(self):
    api_key = 'abc123def456'
    url = f'https://api.example.com/products?api_key={api_key}'
    yield scrapy.Request(url)
```

### Tipe 2: Token Pembawa di Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cara menemukannya:**

- Tab Networks → Klik permintaan
- Tab Header → Cari "Otorisasi"

**spider Anda:**

```python
def start_requests(self):
    url = 'https://api.example.com/products'
    headers = {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    }
    yield scrapy.Request(url, headers=headers)
```

### Tipe 3: Cookie Sesi

Beberapa API menggunakan cookie untuk otentikasi.

**Cara menemukannya:**

- Tab Networks → Klik permintaan
- Tab Header → Cari "Cookie"

**spider Anda:**

```python
def start_requests(self):
    url = 'https://api.example.com/products'
    cookies = {
        'session_id': 'abc123',
        'user_token': 'xyz789'
    }
    yield scrapy.Request(url, cookies=cookies)
```

### Tipe 4: Header Kustom

```
X-Api-Key: abc123
X-Client-Id: def456
```

**spider Anda:**

```python
def start_requests(self):
    headers = {
        'X-Api-Key': 'abc123',
        'X-Client-Id': 'def456'
    }
    yield scrapy.Request(url, headers=headers)
```

## Menangani Request POST

Beberapa API menggunakan metode POST, bukan GET.

### Menemukan Data POST

**Tab Networks:**

- Klik permintaan POST
- Tab "Muatan"
- Lihat data yang dikirim

Contoh:

```json
{
  "filters": {
    "category": "electronics",
    "price_max": 1000
  },
  "page": 1,
  "limit": 20
}
```

### spider Anda

```python
import scrapy
import json

class PostSpider(scrapy.Spider):
    name = 'post'

    def start_requests(self):
        url = 'https://api.example.com/search'

        payload = {
            'filters': {
                'category': 'electronics',
                'price_max': 1000
            },
            'page': 1,
            'limit': 20
        }

        yield scrapy.Request(
            url,
            method='POST',
            body=json.dumps(payload),
            headers={'Content-Type': 'application/json'},
            callback=self.parse
        )

    def parse(self, response):
        data = json.loads(response.text)
        for item in data['results']:
            yield item
```

---

## Menangani Paginasi dalam API

API memiliki gaya paginasi yang berbeda.

### Gaya 1: Nomor Halaman

```
/products?page=1
/products?page=2
/products?page=3
```

**spider:**

```python
def parse(self, response):
    data = json.loads(response.text)

    for item in data['items']:
        yield item

    # Halaman berikutnya
    current_page = int(response.url.split('page=')[1])
    if data['has_next']:
        next_page = current_page + 1
        next_url = f'https://api.example.com/products?page={next_page}'
        yield scrapy.Request(next_url, callback=self.parse)
```

### Gaya 2: Offset/Limit

```
/products?offset=0&limit=20
/products?offset=20&limit=20
/products?offset=40&limit=20
```

**spider:**

```python
def parse(self, response):
    data = json.loads(response.text)

    for item in data['items']:
        yield item

    # Offset berikutnya
    total = data['total']
    offset = int(response.url.split('offset=')[1].split('&')[0])
    limit = 20

    if offset + limit < total:
        next_offset = offset + limit
        next_url = f'https://api.example.com/products?offset={next_offset}&limit={limit}'
        yield scrapy.Request(next_url, callback=self.parse)
```

### Gaya 3: Berbasis Kursor

```
/products?cursor=abc123
/products?cursor=def456
```

**spider:**

```python
def parse(self, response):
    data = json.loads(response.text)

    for item in data['items']:
        yield item

    # Kursor berikutnya
    if data['next_cursor']:
        next_url = f"https://api.example.com/products?cursor={data['next_cursor']}"
        yield scrapy.Request(next_url, callback=self.parse)
```

## API GraphQL

GraphQL adalah bahasa kueri API modern.

### Mencari Endpoint GraphQL

Mencari:

- URL: `/graphql`
- Metode: POST
- Tipe Konten: `application/json`
- Tubuh berisi `"query"`

### Contoh Kueri GraphQL

```json
{
  "query": "query { products(limit: 20) { id name price description } }"
}
```

### Scrapy Spider untuk GraphQL

```python
import scrapy
import json

class GraphQLSpider(scrapy.Spider):
    name = 'graphql'

    def start_requests(self):
        url = 'https://example.com/graphql'

        query = '''
        query {
          products(limit: 20, offset: 0) {
            id
            name
            price
            description
          }
        }
        '''

        payload = {'query': query}

        yield scrapy.Request(
            url,
            method='POST',
            body=json.dumps(payload),
            headers={'Content-Type': 'application/json'},
            callback=self.parse
        )

    def parse(self, response):
        data = json.loads(response.text)

        for product in data['data']['products']:
            yield product
```

### Paginasi GraphQL

```python
def start_requests(self):
    for offset in range(0, 1000, 20):  # 0, 20, 40, ...
        query = f'''
        query {{
          products(limit: 20, offset: {offset}) {{
            id
            name
            price
          }}
        }}
        '''

        payload = {'query': query}
        yield scrapy.Request(
            'https://example.com/graphql',
            method='POST',
            body=json.dumps(payload),
            headers={'Content-Type': 'application/json'},
            callback=self.parse
        )
```

---

## Rate Limits  dengan API

API sering kali memiliki batas laju.

### Mendeteksi Rate Limits 

**Tanda-tanda:**

- Kode status 429 (Terlalu Banyak Request)
- Pesan kesalahan tentang pembatasan laju
- Header: `X-RateLimit-Remaining: 0`

### Menangani Rate Limits 

```python
# settings.py

# Perlambat
DOWNLOAD_DELAY = 2
CONCURRENT_REQUESTS = 4

# Throttle otomatis
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10
```

###  Respecting Header Rate Limits 

```python
def parse(self, response):
    # Periksa header batas laju
    remaining = response.headers.get('X-RateLimit-Remaining')
    if remaining and int(remaining) < 10:
        self.logger.warning('Mendekati batas laju, memperlambat')
        # Perlambat atau jeda

    # Lanjutkan parsing
    data = json.loads(response.text)
    for item in data:
        yield item
```

## Reverse Engineering Parameter API

Terkadang URL API memiliki parameter yang misterius.

### Parameter Umum yang Dapat Dicoba

```
# Paginasi
?page=1
?offset=0&limit=20
?cursor=abc

# Pengurutan
?sort=price
?sort=price_asc
?order_by=name

# Pemfilteran
?category=electronics
?price_min=10&price_max=100
?in_stock=true

# Pencarian
?q=laptop
?search=laptop
?query=laptop

# Format
?format=json
?output=json
```

### Menguji Parameter

```python
def start_requests(self):
    base_url = 'https://api.example.com/products'

    # Coba parameter yang berbeda
    for page in range(1, 11):
        url = f'{base_url}?page={page}&limit=50&sort=price'
        yield scrapy.Request(url, callback=self.parse)
```

---

## Ketika API Tidak Ada

Jika Anda tidak dapat menemukan API:

**Opsi 1:** Gunakan Scrapy-Playwright (render JavaScript)

**Opsi 2:** Cari lebih keras

- Terkadang API ada tetapi tersembunyi
- Periksa lalu lintas aplikasi seluler (aplikasi sering menggunakan API)
- Lihat versi situs yang lebih lama

**Opsi 3:** Scrape HTML

- Upaya terakhir
- Lebih lambat tetapi berhasil

---

## Contoh Dunia Nyata Lengkap

Mari kita scrape API produk:

```python
import scrapy
import json
from urllib.parse import urlencode

class ProductApiSpider(scrapy.Spider):
    name = 'product_api'

    # Base URL API (ditemukan di tab Networks)
    api_base = 'https://api.example.com/v2/products'

    # Header (disalin dari tab Networks)
    headers = {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        'User-Agent': 'Mozilla/5.0...',
        'Accept': 'application/json'
    }

    def start_requests(self):
        # Mulai dengan halaman 1
        params = {
            'page': 1,
            'limit': 50,
            'category': 'electronics',
            'sort': 'popularity'
        }

        url = f'{self.api_base}?{urlencode(params)}'
        yield scrapy.Request(url, headers=self.headers, callback=self.parse)

    def parse(self, response):
        # Parse respons JSON
        try:
            data = json.loads(response.text)
        except json.JSONDecodeError:
            self.logger.error(f'JSON tidak valid dari {response.url}')
            return

        # Ekstrak produk
        for product in data.get('products', []):
            yield {
                'id': product.get('id'),
                'name': product.get('name'),
                'price': product.get('price'),
                'currency': product.get('currency'),
                'stock': product.get('in_stock'),
                'rating': product.get('rating'),
                'reviews': product.get('review_count'),
                'url': product.get('product_url')
            }

        # Paginasi
        current_page = data.get('current_page', 1)
        total_pages = data.get('total_pages', 1)

        if current_page < total_pages:
            next_page = current_page + 1

            params = {
                'page': next_page,
                'limit': 50,
                'category': 'electronics',
                'sort': 'popularity'
            }

            next_url = f'{self.api_base}?{urlencode(params)}'
            yield scrapy.Request(next_url, headers=self.headers, callback=self.parse)
        else:
            self.logger.info(f'Selesai scraping {total_pages} halaman')
```


## Quick Checklist 

**Menemukan API:**

- [ ] Buka Alat Pengembang (F12)
- [ ] Klik tab Networks
- [ ] Saring berdasarkan XHR/Fetch
- [ ] Segarkan halaman
- [ ] Klik pada permintaan dengan respons JSON
- [ ] Catat URL, metode, header, muatan

**Menguji API:**

- [ ] Salin URL permintaan
- [ ] Uji di Scrapy shell
- [ ] Periksa persyaratan otentikasi
- [ ] Uji paginasi
- [ ] Uji parameter yang berbeda

**Membangun Spider:**

- [ ] Mulai dengan satu halaman
- [ ] Parse respons JSON
- [ ] Tambahkan paginasi
- [ ] Tambahkan otentikasi jika diperlukan
- [ ] Hormati batas laju

---

## Ringkasan

**Mengapa mencari API:**

- 10-50x lebih cepat daripada scraping HTML
- Data JSON yang bersih
- Lebih stabil/andal
- Tidak perlu rendering JavaScript

**Cara menemukannya:**

- Tab Networks → filter XHR/Fetch
- Cari respons JSON
- Catat URL, header, muatan

**Pola umum:**

- GET dengan parameter URL
- POST dengan body JSON
- Otentikasi melalui header atau cookie
- Paginasi melalui page/offset/cursor

**Praktik terbaik:**

- Uji API di Scrapy shell terlebih dahulu
- Salin header persis dari browser
- Hormati batas laju
- Tangani kesalahan dengan baik

**Ingat:**

- Selalu coba cari API terlebih dahulu
- API > Playwright > Selenium > scraping HTML
- 10 menit mencari API menghemat waktu berjam-jam scraping

Mulailah dengan membuka tab Networks di situs mana pun yang ingin Anda scrape. Anda akan terkejut betapa banyak yang menggunakan API!

Selamat scraping! 🕷️
