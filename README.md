# twitter-snap-webui

```s
pnpm i
```

```.env
WEBDAV_URL="https://example.com/remote.php/dav/files/yuki/"
WEBDAV_USERNAME="user"
WEBDAV_PASSWORD="******************"
WEBDAV_OUTPUT_DIR="shere/snap"
PORT=3640
```
```sh
systemctl link ./twitter-snap-webui.service
systemctl enable twitter-snap-webui.service
```
