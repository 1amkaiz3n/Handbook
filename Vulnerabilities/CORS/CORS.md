# CORS

## API endpoints Mining

Kumpulkan semau API Endpoints dari urls.txt hasil crawl katana,wayback,dll
```bash
echo "📡 Finding API endpoints..."
cat urls.txt | \
  grep -iE "/api/|/v1/|/v2/" | \
  cut -d'?' -f1 | \
  grep -vE "\.js|\.css|\.png|\.jpg|\.jpeg|\.svg|\.gif|\.woff|\.ttf|\.html|/v1/[a-zA-Z]{1,3}$|/v1/$" | \
  grep -vE "/v1/ar|/v1/en|/v1/fr|/v1/[a-z]{2}(-[a-z]{2})?$" | \
  uro | sort -u > api_endpoints.txt
```

## Live endpoints

Filter live urls

```bash
cat api_endpoints.txt 2>/dev/null | \
  sort -u | \
  httpx -silent -mc 200 -follow-redirects -timeout 10 -threads 50 > live_apis.txt

echo "✅ Live: $(wc -l < live_apis.txt 2>/dev/null || echo 0)"
```

## CORS check karo

```bash
echo "🔍 Checking CORS (UPGRADED)..."

while read url; do

  for origin in \
    "https://evil.com" \
    "https://target.com.evil.com" \
    "null"
  do

    response=$(curl -s -i \
      -H "Origin: $origin" \
      -H "Cookie: test=test" \
      "$url" 2>/dev/null)

    acao=$(echo "$response" | grep -i "access-control-allow-origin" | head -1)
    acac=$(echo "$response" | grep -i "access-control-allow-credentials" | head -1)

    # detect wildcard / reflection / null bypass
    if echo "$acao" | grep -Eqi "$origin|\\*|null|evil"; then

      if echo "$acac" | grep -qi "true"; then

        echo "🔴 CRITICAL CORS: $url ($origin)" >> cors_vulnerable.txt
        echo "$acao" >> cors_vulnerable.txt
        echo "$acac" >> cors_vulnerable.txt
        echo "----" >> cors_vulnerable.txt

      else

        echo "🟡 CORS (no creds): $url ($origin)" >> cors_partial.txt

      fi
    fi

  done

done < live_apis.txt
```


## cors_hunter.sh (FULL AUTO TOOL)

```bash
#!/bin/bash

OUTDIR="cors_results"
mkdir -p "$OUTDIR"

INPUT="$1"

if [ -z "$INPUT" ]; then
  echo "Usage:"
  echo "  cat urls.txt | $0"
  echo "  $0 urls.txt"
  echo "  $0 https://target.com/api"
  exit 1
fi

echo "=================================="
echo "🚀 CORS AUTO HUNTER v3"
echo "=================================="

#####################################
# INPUT HANDLING (FLEXIBLE PIPELINE)
#####################################

if [[ "$INPUT" == http* ]]; then
  echo "$INPUT" > "$OUTDIR/input.txt"

elif [ -f "$INPUT" ]; then
  cat "$INPUT" | tr -d '\r' | sort -u > "$OUTDIR/input.txt"

else
  cat - | tr -d '\r' | sort -u > "$OUTDIR/input.txt"
fi

#####################################
# STEP 1 - API FILTERING
#####################################
echo "📡 [1/3] Extracting API endpoints..."

cat "$OUTDIR/input.txt" | \
  grep -iE "/api/|/v1/|/v2/|/auth|/login|/user|/config|/graphql|/chat|/token|/session" | \
  grep -viE "\.(js|css|png|jpg|jpeg|svg|gif|woff|ttf|html|json|map)$" | \
  sort -u > "$OUTDIR/apis.txt"

echo "[+] APIs: $(wc -l < "$OUTDIR/apis.txt")"

#####################################
# STEP 2 - LIVE CHECK (FAST)
#####################################
echo "🌐 [2/3] Live filtering..."

cat "$OUTDIR/apis.txt" | \
  httpx -silent -status-code -follow-redirects -threads 50 \
  > "$OUTDIR/live.txt"

echo "[+] Live: $(wc -l < "$OUTDIR/live.txt")"

#####################################
# STEP 3 - CORS ENGINE (REAL CHECK)
#####################################
echo "🔍 [3/3] CORS testing..."

rm -f "$OUTDIR/vuln.txt" "$OUTDIR/info.txt"

ORIGINS=(
  "https://evil.com"
  "https://a.evil.com"
  "null"
  "https://localhost"
  "https://sub.target.com.evil.com"
)

cat "$OUTDIR/live.txt" | cut -d' ' -f1 | \
xargs -P40 -I{} bash -c '
url="{}"

for origin in "${ORIGINS[@]}"; do

  resp=$(curl -sk -D - -o /dev/null \
    -H "Origin: $origin" \
    -H "User-Agent: Mozilla/5.0" \
    "$url")

  acao=$(echo "$resp" | grep -i "access-control-allow-origin")
  acac=$(echo "$resp" | grep -i "access-control-allow-credentials")

  if echo "$acao" | grep -Eqi "\*|null|evil|localhost|evil.com|sub\.target"; then

    if echo "$acac" | grep -qi "true"; then
      echo "[VULN] $url | $origin | $acao | $acac" >> cors_results/vuln.txt
    else
      echo "[INFO] $url | $origin | $acao" >> cors_results/info.txt
    fi

  fi

done
'

#####################################
# REPORT
#####################################
echo "=================================="
echo "📊 RESULT"
echo "=================================="

echo "APIs      : $(wc -l < "$OUTDIR/apis.txt")"
echo "LIVE      : $(wc -l < "$OUTDIR/live.txt")"
echo "VULN CORS : $(wc -l < "$OUTDIR/vuln.txt")"
echo "INFO CORS : $(wc -l < "$OUTDIR/info.txt")"

echo "=================================="
echo "📁 $OUTDIR/"
echo "=================================="
```