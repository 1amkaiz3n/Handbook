# Nuclei

## Basic

### Single target scan

```bash
nuclei -target https://example.com
```

### Scanning multiple targets

```bash
nuclei -list urls.txt
```

### Network scan

```bash
nuclei -target 192.168.1.0/24
```

### Scanning with your custom template

```bash
nuclei -u https://example.com -t /path/to/your-template.yaml
```

### Connect Nuclei to ProjectDiscovery

```bash
nuclei -target https://example.com -dashboard
```

### Automatic Selection

Opsi ini mencoba mengidentifikasi tumpukan teknologi dan komponen yang digunakan pada target, kemudian memilih templat yang telah diberi tag dengan kata kunci tumpukan teknologi tersebut. Contoh:

```bash
nuclei -u https:// my.target.site -as
```

### Select Templates By Severity

```bash
nuclei -u https://jira.targetdomain.site -s critical,high,medium,low,info
```

## Sensitive Discovery

```bash
nuclei -l urls.txt -t ~/nuclei-templates/ -s low,medium,high,critical
```