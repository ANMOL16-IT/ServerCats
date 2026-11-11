# LabServer — College Computer Laboratory

React + Vite + Tailwind v4 website that shows the real output of a Linux lab server script.

- Website: runs on macOS, Linux and Windows.
- Server script (`server/collect.sh`): Linux only. It creates real users, so run it inside a Linux VM.

## 1. Requirements

Node.js 18 or newer (check with `node -v`).

| System  | Install Node.js |
| ------- | --------------- |
| macOS   | `brew install node` |
| Ubuntu / Debian | `sudo apt update` then `sudo apt install -y nodejs npm` |
| Windows | `winget install OpenJS.NodeJS.LTS` (PowerShell) |

## 2. Unzip and copy the project

### macOS (zip in Downloads, project at ~/labserver)

    cd ~/Downloads
    unzip -o labserver.zip -d ~/labserver-new
    cp -R ~/labserver-new/labserver/. ~/labserver/
    rm -rf ~/labserver-new

First time (no project folder yet):

    cd ~/Downloads
    unzip -o labserver.zip -d ~
    cd ~/labserver

### Linux

    cd ~/Downloads
    unzip -o labserver.zip -d ~
    cd ~/labserver

If `unzip` is missing: `sudo apt install -y unzip`

### Windows (PowerShell)

    cd $HOME\Downloads
    Expand-Archive -Force labserver.zip -DestinationPath $HOME
    cd $HOME\labserver

To update an existing folder on Windows:

    Expand-Archive -Force labserver.zip -DestinationPath $HOME\labserver-new
    Copy-Item -Recurse -Force $HOME\labserver-new\labserver\* $HOME\labserver\
    Remove-Item -Recurse -Force $HOME\labserver-new

## 3. Run the website (macOS, Linux, Windows)

    cd ~/labserver
    npm install
    npm run dev

Open http://localhost:5173

Windows PowerShell: use `cd $HOME\labserver` for the first line.

Production build:

    npm run build
    npm run preview

## 4. Get real data (Linux VM only)

`server/collect.sh` does the real work: 100 student accounts, department folders with mode 2770,
temp cleanup, tar.gz backup + restore test, CPU/RAM/disk. It prints the health report and writes `data.json`.

Print the report in the terminal and update `server/data.json`:

    cd ~/labserver/server
    chmod +x collect.sh
    sudo ./collect.sh

Also update the website data (`src/data.json`):

    cd ~/labserver
    sudo npm run refresh

Run it every night with cron (`sudo crontab -e`, then add this line):

    0 2 * * *  cd /home/YOUR_USER/labserver && npm run refresh

### Copy the script from your Mac to the VM

    scp ~/labserver/server/collect.sh USER@VM_IP:~/labserver/server/collect.sh

### Copy the new data from the VM back to your Mac

    scp USER@VM_IP:~/labserver/server/data.json ~/labserver/src/data.json
    scp USER@VM_IP:~/labserver/server/data.json ~/labserver/server/data.json

### Windows

`collect.sh` needs Linux. Use WSL (`wsl --install` in an admin PowerShell, then open Ubuntu) or a Linux VM,
and follow the Linux steps above inside it.

### Show the saved output without running the script (any system with Python 3)

    cd ~/labserver/server
    python3 -c "import json; print(json.load(open('data.json'))['report'])"

Windows PowerShell: use `cd $HOME\labserver\server`, and `python` instead of `python3`.

## 5. Notes

- Replace `USER` and `VM_IP` with your VM login and address.
- The FAQ page links to the repo set in `src/lib/lab.ts` (`GITHUB`); change it if your repo name differs.
- Default student password is `Lab@2026`; accounts must change it at first login.
- The landing image and the Storage page video load from the internet.
