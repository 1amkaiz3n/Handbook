#!/bin/bash

echo "[1/8] Running subfinder..."
subfinder -silent -dL wildcards | anew domains.txt || true

echo "[2/8] Running assetfinder..."
while read domain; do
  echo "  -> $domain"
  assetfinder --subs-only "$domain"
done < wildcards | anew domains.txt || true

echo "[3/8] Running chaos..."
chaos -dL wildcards -silent | anew domains.txt || true

echo "[4/8] Running github-subdomains..."
while read domain; do
    github-subdomains -d "$domain" -raw -o /dev/stdout
done < wildcards | anew domains.txt || true

echo "[5/8] Running crt.sh..."
while read domain; do
  echo "  -> $domain"
  curl -s "https://crt.sh/?q=%.$domain&output=json" \
  | jq -r '.[].name_value' 2>/dev/null || true
done < wildcards \
| sed 's/\*\.//g' \
| tr ',' '\n' \
| grep -v '^\*' \
| anew domains.txt || true

echo "[6/8] Sorting domains..."
sort -u domains.txt -o domains.txt

echo "[7/8] Resolving domains with dnsx..."
dnsx -l domains.txt -silent -a -cname -resp \
| awk '{print $1}' \
| sort -u \
> resolved.txt

echo "Resolved: $(wc -l < resolved.txt)"

echo "[8/8] Probing with httpx..."
httpx -l resolved.txt -silent -threads 200 \
  -follow-redirects \
  -status-code \
  -title \
  -tech-detect \
  -content-length \
  -web-server \
  -server \
  -ip \
  -cname \
  -location \
| tee live_hosts_info.txt

cat live_hosts_info.txt \
| awk '{print $1}' \
| sort -u \
| anew hosts.txt

echo ""
echo "===== DONE ====="
echo "Domains  : $(wc -l < domains.txt)"
echo "Resolved : $(wc -l < resolved.txt)"
echo "Hosts    : $(wc -l < hosts.txt)"
