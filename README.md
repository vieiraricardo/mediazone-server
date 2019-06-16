# MediaZone Server

> Mediazone Server is a lightweight UPNP server that downloads your favorite movies and series through torrents. It can be managed by an android app or a tizen app for samsung smart tvs. (All Plex power with automatic downloads).

## Note

Mediazone is developed for linux, especially to be used with RaspberryPi, but you can run on any linux machine.

## Installing

Start by updating the package lists:
```bash
sudo apt-get update
```
and run this command to install:
```bash
wget -q https://github.com/vieiraricardo/mediazone-server/raw/master/install.sh && sudo chmod +x install.sh && ./install.sh
```
this script automates the entire installation, including installing the daemon and the project dependencies
