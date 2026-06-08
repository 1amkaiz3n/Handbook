# 📥 1 - Pengumpulan URL JavaScript

Methodology untuk mengumpulkan semua URL JS dari target.

---

## 🛠 Persiapan Awal

```bash
mkdir js
```

---

## 🌐 Ambil URL file JS dari web langsung

**Ada dua opsi:**

### Opsi 1 - Dari web langsung

```bash
katana -u https://targt.com -d 5 -jc | grep '\.js$' | tee -a js/alljs.txt
```

```bash
echo "https://targt.com" | waybackurls | grep '\.js$' | sort -u | anew js/alljs.txt
```

```bash
curl -s "https://targt.com/checkout/addresses" \
| grep -Eo '(https?:)?//[^"]+\.js[^"]*' \
| sort -u > js/jscdx.txt
```

### Opsi 2 - Dari list URLs hasil crawling

```bash
grep -E "\.js(\?|$)" urls.txt | anew js/alljs.txt
```

> Bisa pakai salah satu, atau keduanya

---

## 🎯 Grab JS dari live subdomains

```bash
cat hosts.txt | subjs | sort -u > live_subjs_js.txt
```

```bash
cat hosts.txt | getJS | sort -u > live_getjs_js.txt
```

```bash
katana -list hosts.txt -d 2 -jc -silent | grep -E '\.js([?#].*)?$' | sort -u > live_katana_js.txt
```

```bash
linkfinder -i https://www.example.com -d -o cli | sort -u | tee linkfinder_raw.txt
```

```bash
# Ekstrak hanya URL untuk domain target kita 
grep -Eo 'https?://[^ )"]+example\.com[^ )"]*' linkfinder_raw.txt | sort -u > linkfinder_urls.txt 
```

```bash
# Filter URL yang mengarah ke file JS 
grep -E '\.js([?#].*)?$' linkfinder_urls.txt | sort -u > live_linkfinder_js.txt
```

---

## 📦 Ambil JavaScript dari URL yang diarsipkan

```bash
gau --subs < domains.txt | grep -E '\.js([?#].*)?$' | sort -u > archive_gau_js.txt 
```

```bash
waybackurls < domains.txt | grep -E '\.js([?#].*)?$' | sort -u > archive_wayback_js.txt
```

```bash
cat archive_gau_js.txt archive_wayback_js.txt | subjs | sort -u > archive_subjs_js.txt
```

```bash
cat archive_gau_js.txt archive_wayback_js.txt | getJS | sort -u > archive_getjs_js.txt
```

---

## 🔗 Menggabungkan dan membersihkan file JS

```bash
sort -u live_*js.txt archive_*js.txt > all_js_files.txt
```

```bash
# Opsional: Filter berdasarkan domain atau kata kunci 
grep -E '\.example\.com' all_js_files.txt > all_js_example.txt
```

---

## 🎯 Live URLS (filter status 200)

```bash
cat js/alljs.txt | uro | sort -u | httpx -mc 200 -o js/live-js
```

---

## 📥 Download semua file JS untuk analisis offline



```bash
mkdir -p js-download

cat js/alljs | xargs -P8 -I{} sh -c '
url="{}"
filename=$(echo "$url" | md5sum | cut -d" " -f1).js

curl -s -L --max-time 20 --retry 2 --retry-delay 1 \
  "$url" -o "js-download/$filename"
'
```

---

## 🎨 Beautify downloaded files

```bash
for file in js-download/*.js; do js-beautify "$file" -o beautified/$(basename "$file"); done
```

Atau:

```bash
find . -name "*.js" -exec js-beautify {} -o {}.beautified \;
```
