# Sluicing Script

Sebagian besar website berjalan di Javascript,dan tampilanya agak rumit dengan tanda kurung `()` dan tanda kutip `""` dimana-mana,umumnya sedikit berantakan dan memiliki reputasi seprti itu.Terkadang kita dapat menemukan beberapa hal menarik yang terkubur jauh di dalam Javascript,seperti **Secret**,**API KEY**,atau **header HTTP Authorization Basic**,yang mungkin memungkinkan kita mengakses sesuatu yang menarik.Kita juga dapat menemukan hal-hal yang jauh kurang menarik tetapi sangat berguna,seperti **parameter** yang mungkin tidak kita ketahui sebelumnya,seperti parameter `showDiagnostic=true`,atau juga seperti **path**.

## Ekstrak Path

Contoh :

```js
//Path are useful foo
let meta ={
  {tite:"Blog",page:'/blog'},
  {tite:"This Secret",page:'/secret'},
  {tite:"Admin",page:'/secret'},
  {tite:"Log In",page:'/login'},
  {tite:"Log Out",page:'/logout'}
}
```

Kita akan mengekstrak path dari contoh kode ini.

```bash
grep -Eo "'[^']+'" path.js | sed -r "s/'//g"
```

**Output :**

```
/blog
/secret
/secret
/login
/logout
```

## Ekstrak String

Contoh :

```js
function hello(){
  console.log("Hello World :)")
}
```

```bash
jsluice query -q '(string) @str' hello.js
```


Atau


```js
var one =  "The first"
var two =  "The second"
var three = "The third"
```


Kita mungkmin menulis query seprti ini untuk mencari situasi spesifik tersebut 

```js
(
  (identifier)@id
  (string)@val
  (#eq?@id "two")
)
```

```bash
jsluice query -q '((identifier) @id (string) @eval (#eq? @id "two"))' three-strings.js | jq 
```

**Output :**

```json
{
  "eval": "The second",
  "id": "two"
}
```

## Not valid json

```js
var config ={
  host:'example.com',
  path:[
    '/api/user',
    '/api/pages',
    '/api/logs'
  ],
  timeout:30,
  debug:false
}
```

```bash
jsluice query -q '(object) @o' objects.js | jq
```

**Output :**

```json
{
  "debug": false,
  "host": "example.com",
  "paths": [
    "/api/user",
    "/api/pages",
    "/api/logs"
  ],
  "timeout": 30
}
```

Atau lebih simple 

```bash
jsluice query -q '(object) @o' objects.js | jq -r '.paths[]'
```

**Output :**

```json
/api/user
/api/pages
/api/logs
```

## Komentar

```js
// comments can be interisting too
window.addEventListener("load",e=> {
  //fetch('/api/v1')
  //fetch('/api/v2?debug=true')
  fetch('/api/v2')
  .then(r =>r.json())
  .then(d =>{
    output.innerHTML = d.body
  })
})
```

```bash
jsluice query -q '(comment) @c' comments.js
```

Atau

```bash
jsluice query -q '(comment) @c' comments.js | jq -r | sed -r 's|//||' | jsluice --raw-input query -q  '(string) @s'  jq
```


## Mengambil Object Key

```js
//We want these object keys
fetch("/api/v1/cart",{
  method:"POST",
  body:JSON.stringify({
    userId:uid,
    action:a,
    cartItems:items
  })
})
```

```bash
jsluice query -q '(pair key:(_) @k)' object-keys.js
```

## Javascript di HTML

```html
<!DOCTYPE html>
<html>
  <head><title>Inline Script</title></head>
  <body>
    <script>
      var msgs=[
        "jsluice automatically",
        "extract iline js",
        "from HTML"
      ]
      </script>
    </body>
  </html>
```

```bash
jsluice query -q '(string) @str' inline.html
```