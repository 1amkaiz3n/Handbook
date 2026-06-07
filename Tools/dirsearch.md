# Dirsearch

```bash
dirsearch -u https://target.com --full-url --deep-recursive -r
```

```bash
dirsearch -u https://target.com -e php,cgi,htm,html,shtm,shtml,js,txt,bak,zip,old,conf,log,pl,asp,aspx,jsp,sql,db,sqlite,mdb,tar,gz,7z,rar,json,xml,yml,yaml,ini,java,py,rb,php3,php4,php5 --random-agent --recursive -R 3 -t 20 --exclude-status=404 --follow-redirects --delay=0.1
```

```bash
dirsearch -u https://developer.target.com -f -F -x 403 -t 15 
```

## Wordlist

```bash
dirsearch -u https://developer.target.com -w /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt -f -x 403 -t 15 
```