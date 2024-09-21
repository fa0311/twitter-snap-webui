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

## Bookmarklet
```javascript
javascript:(function() {
  const url = window.location.href;
  const twitterRegex = /^https:\/\/(twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/;
  const match = url.match(twitterRegex);

  if (match) {
    const tweetId = match[2];
    const newUrl = `https://example.com/api/snap/2024/${tweetId}`;
    window.open(newUrl, '_blank');
  } else {
    alert('Error: The current page is not an individual Twitter tweet page.');
  }
})();
```
