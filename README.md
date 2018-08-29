# native-pull-refresh

a light &amp; tiny pull down refresh script with no dependancy.

## use like this:
```html
<div class="pull-wrapper">
    <div id="pullTop" class="pull-top">
        <div id="arrowIcon" class="arrow"></div>
        <div id="pullIcon" class="pointer none"></div>
        <div id="succIcon" class="success none"></div>
        <span id="pullText">刷新成功</span>
    </div>
    <div class="content-list">
        list here
    </div>
</div>
```
```javascript
var pull = new pullDownRefresh({
        container: '.pull-wrapper'
    });
    pull.on('before-pull', function () {
        console.log('beforePull');
    });
    pull.on('refresh', function () {
        console.log('refresh begin');
        getData();
    });
...
// callback success
pull.emit('success');
// callback fail
pull.emit('fail');
```

## preview
> * [click here](https://yangyuji.github.io/native-pull-refresh/demo.html)
> * ![qrcode](https://github.com/yangyuji/native-pull-refresh/blob/master/qrcode.png)

## License
> * copyright(c) 2018 oujizeng Licensed under MIT license.
