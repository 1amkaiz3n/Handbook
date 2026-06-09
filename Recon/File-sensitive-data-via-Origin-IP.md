# File Sensitive Data via Origin API

## Shodan

[Shodan](https://www.shodan.io/)

Mencari IP public target degan status 200

```bash
ssl.cert.subject.CN:"target.com" 200
```


## dirsearch

```bash
dirsearch -u https://target.com -e php,cgi,htm,html,shtm,shtml,js,txt,bak,zip,old,conf,log,pl,asp,aspx,jsp,sql,db,sqlite,mdb,tar,gz,7z,rar,json,xml,yml,yaml,ini,java,py,rb,php3,php4,php5 --random-agent --recursive -R 3 -t 20 --exclude-status=404 --follow-redirects --delay=0.1
```

atau

```bash
dirsearch -u https://192.xx.xx.xx
```

## Hunter.how

[Hunter.how](https://hunter.how/)

```bash
cert.subject="*target.com" and header.status_code=="200"
```

## CRT.SH (CERT transparency log pivot)

```bash
https://crt.sh/?q=%25.target.com
```

## Censys

[Censys](https://search.censys.io/)

### Cert-based discovery:

```bash
parsed.names: target.com
```

```bash
names: target.com AND services.http.response.status_code: 200
```

### TLS + exposed host:

```bash
services.tls.certificates.leaf_data.subject.common_name: target.com
```

### API / origin leakage:

```bash
services.http.response.headers.server: nginx
AND services.http.response.status_code: 200
```

### Cari dev infra:

```bash
location.country: "United States"
AND services.http.response.html_title: "*dev*"
```