# WPScan

## Aggressive scan: all themes, all plugins, users

```bash
wpscan --url https://target.com --disable-tls-checks --api-token <here> -e at -e ap -e u --enumerate ap --plugins-detection aggressive --force
```

## Enumerate all plugins with known vulnerabilities
```bash
wpscan --url https://target.com -e vp --plugins-detection mixed --api-token <API_TOKEN>
```

## deep scan
```bash
wpscan --url https://target.com -e ap --plugins-detection aggressive
```

## Enumerate all plugins in our database (could take a very long time)
```bash
wpscan --url https://target.com -e ap --plugins-detection mixed --api-token <API_TOKEN>
```

## Enumerate theme
```bash
wpscan --url https://target.com --enumerate t 
```

## Enumerate plugin
```bash
wpscan --url https://target.com --enumerate p
wpscan --url https://target.com --enumerate ap
```

## Enumerating usernames
```bash
wpscan --url https://target.com --enumerate u 
```

## Enumerating a range of usernames
```bash
wpscan --url https://target.com --enumerate u1-100
```

## Enumerate vuln plugin,plugni,theme,user
```bash
wpscan --url https://target.com --enumerate vp,p,t,u
```

## Password brute force attack
```bash
wpscan --url https://target.com -e u --passwords /wordlists/SecLists/password/Common-Credentials/best1050.txt
```

## BruteForce dengan username telah di ketahui

```bash
wpscan --url https://target.com --usernames <username> --passwords /wordlists/SecLists/password/Common-Credentials/best1050.txt
```