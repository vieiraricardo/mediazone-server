# MediaZone Server

> Media Zone Server is a lightweight UPNP server that downloads your favorite movies and series through torrents. It can be managed by an android app or a tizen app for samsung smart tvs. (All Plex power with automatic downloads).

## Note

MediaZone server is developed for linux, especially to be used with RaspberryPi and so we use the `transmission-daemon` to download our movies and series 

## First Step

Enter the command below into your terminal to install transmission-daemon:
```bash
sudo apt install transmission-daemon
```
once installed, when our server is running it will make sure the daemon is running and if it is not, it will start automatically
