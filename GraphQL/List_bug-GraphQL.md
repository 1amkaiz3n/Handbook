# 📚 List Report & Postingan Bug GraphQL (Lengkap + Konteks Target)

## 🔴 GraphQL Data Exposure & Information Disclosure

* [Facebook – GraphQL Leak Email Admin Page ($15K) | Data Exposure](https://medium.com/@vivekps143/how-a-simple-graphql-query-exposed-facebook-page-admins-and-their-personal-emails-a-15-000-bug-e76f2ff8fd5e)

* [Generic API – GraphQL Introspection Masih Aktif ($1000) | Schema Disclosure](https://infosecwriteups.com/1000-bug-using-simple-graphql-introspection-query-b68da8260877)

---

## 🟠 GraphQL IDOR & Object Manipulation

* [Generic App – GraphQL IDOR via Object ID Manipulation ($350)](https://medium.com/@dexblood.reza/graphql-idor-vulnerability-report-350-by-dexblood-740ca2a18f94)

* [Meta (Facebook) – IDOR pada Create Function (GraphQL Mutation)](https://sancyty.medium.com/meta-bug-bounty-idor-create-efd7cb81cd91)

* [Facebook Business – IDOR Share Link Campaign Planner ($5375)](https://sancyty.medium.com/5375-bounty-idor-creating-a-share-link-for-any-campaign-planner-in-facebook-business-03f0994d4d16)

---

## 🟡 Broken Access Control & Authorization Issues

* [Meta (Facebook) – Broken Access Control (BAC) via GraphQL](https://sancyty.medium.com/meta-bug-bounty-bac-4c71c3c2c5fa)

* [Shopify – GraphQL Pivot Bisa Akses Data Tanpa Permission ($1500) | BAC](https://hackerone.com/reports/423388)

* [Shopify – GraphQL Authorization Bypass (BAC / Privilege Bypass)](https://hackerone.com/reports/927567)

* [Cloverleaf App – Multiple Bug termasuk BAC di GraphQL](https://medium.com/@maakthon/bug-bounty-findings-10-major-vulnerabilities-exposed-in-cloverleafs-application-bac-in-graphql-0ae1ee0eb4d5)

---

## 🔵 Advanced Attack (XS-Leak, Side Channel, dll)

* [Meta (Facebook) – XS-Leak Bisa Dapat User ID Tanpa Akses](https://sancyty.medium.com/meta-bug-bounty-program-cross-site-leak-xs-leak-being-able-to-query-the-user-id-of-the-current-b449014c37f1)

* [HackerOne – Sensitive Feature Exposure (vpn_suspended) via GraphQL](https://hackerone.com/reports/717716)

* [HackerOne – Sensitive Feature Exposure via GraphQL Field (Case Lain)](https://hackerone.com/reports/715192)

---

## 🟣 Resource Abuse / DoS

* [Facebook / Meta – Excessive Memory Usage (DoS) via Rendering Bug ($500)](https://sancyty.medium.com/500-bounty-excessive-memory-usage-in-messenger-and-facebook-app-when-rendering-invalid-gifs-b1f1bf15ba18)

---

## 🟢 API & Authentication Issues (Non-GraphQL tapi Penting)

* [Starbucks – Full API Access Tanpa Login (Broken Auth + BAC)](https://hackerone.com/reports/232650)
  👉 Target: API backend Starbucks
  👉 Issue: pakai **token statis (Basic Auth)** → bisa akses semua endpoint
  👉 Impact: ambil data user lain + full API access tanpa login

* [Starbucks – CSRF Bisa Post Comment atas Nama User](https://hackerone.com/reports/198470)
  👉 Target: blogs.starbucks.com
  👉 Issue: tidak ada CSRF protection
  👉 Impact: attacker bisa kirim komentar sebagai korban

---

## ⚪ Learning & General Guide

* [Hunting GraphQL Gold – Cara Cari Bug di GraphQL (Guide)](https://infosecwriteups.com/hunting-graphql-gold-uncovering-hidden-vulnerabilities-in-modern-apis-ae3c3dbf462d)

* [GraphQL for Bug Bounty – Fundamental & Attack Surface](https://medium.com/dsc-sastra-deemed-to-be-university/graphql-for-bug-bounty-48e669963d90)

---

[hack-dex](https://hack-dex.com/)

[](https://medium.com/@tinopreter/1-500-pii-leak-via-graphql-field-level-permission-bypass-1e7ea2d1a019)



[Authorization bypass due to cache misconfiguration](https://rikeshbaniya.medium.com/authorization-bypass-due-to-cache-misconfiguration-fde8b2332d2d)

[Exploiting Broken Authentication Control In GraphQL](https://www.praetorian.com/blog/exploiting-broken-authentication-control-graphql/)

[account via IDOR in GraphQL](https://medium.com/@mukundbhuva/accessing-the-data-sources-of-any-facebook-business-account-via-idor-in-graphql-1fc963ad3ecd)
[Exposing Users Table From a Leaky GraphQL Query](https://rashahacks.com/exposing-users-table-from-a-leaky-graphql-query/)

[Unauthenticated GraphQL Introspection and API calls](https://medium.com/@osamaavvan/unauthenticated-graphql-introspection-and-api-calls-92f1d9d86bcf)
[[GraphQL IDOR] Leaking credit card information of 1000s of users [External Audit]](https://infosecwriteups.com/graphql-idor-leaking-credit-card-information-of-1000s-of-users-d07eec732979)

[SQL Injection in GraphQL](https://0xgad.medium.com/sql-injection-in-graphql-2859c96547a8)

[[Tokopedia] CSRF di Seluruh Situs Melalui Permintaan Graphql ](https://yeraisci.com/tokopedia-site-wide-csrf-through-graphql-request)

[How I was able to get account takeover via IDOR form JWT](https://medium.com/@AlQa3Qa3_M0X0101/how-i-was-able-to-get-account-takeover-via-idor-form-jwt-caaf7ea58aa)

## 🔥 Insight Penting (Biar Kepake Beneran)

Dari semua report ini, pola yang harus lo tangkap:

* 🔴 **Data Exposure**

  * email, user_id, apiKey, internal data

* 🟠 **IDOR**

  * manipulasi `id`, `gid`, `uuid`

* 🟡 **Broken Access Control (PALING PENTING)**

  * akses lintas role (Admin vs Member vs Dev)
  * pivot antar resource (user → billing → api)

* 🔵 **Side-channel / XS-Leak**

  * infer data dari field (true/false/null)

* 🟣 **DoS / Resource Abuse**

  * abuse query / rendering

* 🟢 **Auth Issue**

  * token reuse
  * hardcoded credential
  * missing validation

---

## ⚡ Cara Pakai List Ini (biar gak cuma jadi bacaan)

Setiap buka target GraphQL:

1. Cari **ID-based query**
2. Cari **mutation penting (publish, create, update)**
3. Test **role beda**
4. Lihat apakah bisa:

   * ambil data lain
   * atau lakukan aksi tanpa izin



