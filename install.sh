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

echo "CHECKING AND INSTALLING DEPENDENCIES:"
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
    echo "  \e[1;32m✔\e[0m torrent client installed"
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
  sudo systemctl start mediazone.service &> /dev/null

  on_done_msg "service enabled"

  kill $!
}

function download_repo() {
  while true;do spinner 'Download mediazone repository'; done & trap 'kill $!' SIGTERM SIGKILL
  wget -qO - https://github.com/vieiraricardo/mediazone-server/tarball/master | tar xz

  on_done_msg "download repo finished"

  kill $!
  sleep 1
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
  
  enable_service
}

install

