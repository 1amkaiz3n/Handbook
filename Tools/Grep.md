# Grep

`Grep` adalah singkatan dari “global regular expression print”,`grep` ini merupakan pertintah di terminal linux yang di gunakan untuk mencari kata/text berdasarkan pola (pattern) tertentu.

Opsi :
  - `-i` = Mengabaikna perbedaan huruf besar dan kecil,dengan kata lain akan mengembalikan teks /kata yang di cari baik huruf kecil,besar,maupun campuran.
  - `-v` = Untuk menemukan baris yang tidak mengandugn pola.
  - `-n` = Untuk menampilkan nomor baris.
  - `^` = Anchor,berguna untuk mencari yang kata sesuai di awal baris (`grep "^GNU" GPL-3`).
  - `$` = Berguna untuk mencari yang kata sesuai di akhir baris (`grep "and$" GPL-3`).
  - `.` = Untuk mencocokan karakter apapun,misalkan mencari (`grep "..cept" GPL-3`).
  - `[]` = Untuk mencocokan satu karakter dari pilihan,`[abc]`,akan mencari yang mengndung kata "a","b","c".
  - `[a-z]` = Untuk mencari kata yang mengadung huruf "a" sampai "z".
  - `[^a-z]` = Untuk mencocokan apa saja selain huruf "a" sampai "z".
  - `^[A-Z]` = Untuk mencari/mencocokan kata yang menadnung awalan huruf "A" sampai "Z",atau lebih akurat lagi dengan POSIX `^[[:upper:]]`
  - `[^c]ode` Untuk mencari/mencocokan kata yang mengandung huruf "code" dan juga "ode". 
  - `*` = Untuk mengulagi karakter 0 kali atau lebih. (`grep "([A-Za-z ]*)" GPL-3`).
  - `\` = Untuk menghindari karekter
  - `^[A-Z].*\.$` = Untuk menemukan baris apa pun yang diawali dengan huruf kapital dan diakhiri dengan titik (`grep "^[A-Z].*\.$" GPL-3`).
  - `-E` = Untuk pengelompokan (`grep -E "(GPL|General Public License)" GPL-3`).
  - `-P` = membuka kunci Ekspresi Reguler yang Kompatibel dengan Perl (PCRE), yang mendukung fitur-fitur canggih seperti pencocokan tunda dan pencarian.
  - `-o` = Hanya menampilkan bagian baris yang cocok. (`grep -P -o "<.*?>" tags.html`)



## Portability and grep Variations

`zgrep "ERROR" /var/log/syslog.2.gz`

Perintah ini mencari “ERROR” di dalam file terkompresi. syslog.2.gzMengekstraksi file tanpa membuat file sementara yang belum dikompresi. 

## Studi Kasus Praktis 

### Memvalidasi kolom CSV

Untuk memvalidasi kolom CSV, Anda dapat menggunakan grepdengan ekspresi reguler untuk memeriksa pola atau format tertentu. Misalnya, untuk memeriksa apakah semua baris dalam file CSV memiliki tepat 5 kolom yang dipisahkan koma, Anda dapat menggunakan perintah berikut: 

```bash
grep -E "^[^,]+,[^,]+,[^,]+,[^,]+,[^,]+$" yourfile.csv
```

Perintah ini hanya akan mencetak baris yang sesuai dengan pola yang ditentukan, yang menunjukkan kolom CSV yang valid. 

### Mencocokkan URL atau alamat email dalam teks 

Misalnya, untuk menemukan semua baris dalam file yang berisi URL, Anda dapat menggunakan perintah berikut: 

```bash
grep -E "https?://[^ ]+" yourfile.txt
```

### NLP preprocessing: menyaring baris yang mengandung kata-kata penghenti (stopwords). 

Misalnya, untuk menyaring baris yang berisi kata-kata penghenti "the", "and", atau "a", Anda dapat menggunakan perintah berikut: 

```bash
grep -vE "the|and|a" yourfile.txt
```

