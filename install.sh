#!/bin/bash
#Author: Ricardo Vieira

clear

printf "\n"
echo -e "
    #######################################################
    #                                                     #
    #            MEDIAZONE SERVER INSTALLER               #
    #                                                     #
    #######################################################
"
printf "\n"

echo -e "\e[1;37mCHECKING AND INSTALLING DEPENDENCIES:\e[0m"
sleep 1

sp="/-\|"
sc=0

function spinner() {
  printf "\r\b${sp:sc++:1}  $1"
  sleep .1
  ((sc==${#sp})) && sc=0
}

function on_done_msg {
  echo -e "\r\033[K  \e[1;32m✔\e[0m $1" 
}

function install_torrent_client () {
  command -v transmission-daemon &> /dev/null

  if [ $? -eq 0 ]; then
    echo -e "  \e[1;32m✔\e[0m torrent client installed"
    sleep 2
  else
    while true;do spinner 'Installing transmission-daemon'; done & trap 'kill $!' SIGTERM SIGKILL

    sudo apt-get install -y -qq transmission-daemon &> /dev/null

    kill $!

    on_done_msg "torrent client installed"
    sleep 1
  fi
}

function create_service() {
  nodepath="$(command -v node)"

  echo -e "
    [Unit]
    Description=A UPNP server with automatic torrent downloads

    [Service]
    ExecStart=$nodepath /opt/mediazone/server.js

    Restart=always

    # Restart service after 10 seconds if node service crashes
    RestartSec=10

    # Output to syslog
    StandardOutput=syslog
    StandardError=syslog

    SyslogIdentifier=mediazone-server

    Environment=PORT=8080

    User=$USER

    [Install]
    WantedBy=multi-user.target
  " | sed -e 's/^[ \t]*//' > mediazone.service
  sleep 1
}

function install_service() {
  while true;do spinner 'Installing mediazone service'; done & trap 'kill $!' SIGTERM SIGKILL

  create_service

  sudo mv mediazone.service /etc/systemd/system/

  on_done_msg "service installed"

  kill $!
}

function enable_service(){
  while true;do spinner 'Activating service'; done & trap 'kill $!' SIGTERM SIGKILL

  sudo systemctl enable mediazone.service &> /dev/null

  on_done_msg "service enabled"

  kill $!
}

function download_repo() {
  while true;do spinner 'Download mediazone repository'; done & trap 'kill $!' SIGTERM SIGKILL
  wget -qO - https://github.com/vieiraricardo/mediazone-server/tarball/master | tar xz

  if [[ $? -eq 1 ]]; then 
    echo -e >&2 "\r\033[K  \e[1;37m  error downloading repository, RUN THE SCRIPT AGAIN\e[0m" 
    kill $! 
    exit 1
  fi

  on_done_msg "download repo finished"

  kill $!
  sleep 1
}

function transmissiond_config() {
  CONFIG_FILE="/var/lib/transmission-daemon/.config/transmission-daemon/settings.json"

  echo -e "\e[1;37mSET AUTH CONFIG:\e[0m"

  read -p "set user name: " username

  read -p "set password: " userpass

  while true;do spinner 'Applying settings'; done & trap 'kill $!' SIGTERM SIGKILL

  sudo service transmission-daemon stop

  sudo sed -i -e '/rpc-username/c\    "rpc-username\": \"'"$username"'\",' $CONFIG_FILE

  sudo sed -i -e '/rpc-password/c\    "rpc-password\": \"'"$userpass"'\",' $CONFIG_FILE

  sudo sed -i -e '/rpc-whitelist-enabled/c\    "rpc-whitelist-enabled\": false,' $CONFIG_FILE

  sudo sed -i -e '/rpc-host-whitelist-enabled/c\    "rpc-host-whitelist-enabled\": false,' $CONFIG_FILE

  sudo sed -i -e '/download-dir/c\    "download-dir\": \"/home/pi/mz\",' $CONFIG_FILE

  sudo service mediazone start &> /dev/null  

  echo -e "\r\033[K\e[1;32mALL DONE!!\e[0m"

  kill $!
}

function install() {
  install_torrent_client
  install_service
  
  download_repo
  downloaded_folder="$(ls | awk '{for(i=1;i<=NR;i++){if(match($i, "mediazone")){print $i}}}' 2> /dev/null)"

  while true;do spinner 'Installing MEDIAZONE and downloading npm modules'; done & trap 'kill $!' SIGTERM SIGKILL

  mv $downloaded_folder mediazone
  sudo mv mediazone /opt/

  npm install --prefix /opt/mediazone &> /dev/null
  on_done_msg "instalation completed"

  kill $!

  mkdir "$HOME/mz"
  sudo chown debian-transmission:$USER "$HOME/mz"
  sudo chmod g+wrx $HOME/mz

  enable_service
  transmissiond_config
}

install