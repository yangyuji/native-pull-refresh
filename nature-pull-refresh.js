/*
* author: "oujizeng",
* license: "MIT",
* name: "nature-pull-refresh.js",
* version: "1.2.5"
*/

(function (root, factory) {
    if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define == 'function' && define.amd) {
        define( function () { return factory(); } );
    } else {
        root['pullDownRefresh'] = factory();
    }
}(this, function () {
    'use strict'

    var _css = function (el, attr, val) {
        var vendors = ['', 'webkit', 'ms', 'Moz', 'O'],
            body = document.body || document.documentElement;

        [].forEach.call(vendors, function (vendor) {
            var styleAttr = vendor ? vendor + attr : attr.charAt(0).toLowerCase() + attr.substr(1);
            if (typeof body.style[styleAttr] === 'string') {
                el.style[styleAttr] = val;
            }
        });
    }

    var pullDownRefresh = {

        init: function(opt) {

            var dragThreshold = opt.dragThreshold || 0.2,   // 临界值
                moveCount = opt.moveCount || 200,            // 位移系数

                // 执行完需要还原的值
                dragStart = null,                           // 开始抓取标志位
                percentage = 0,                             // 拖动量的百分比
                changeOneTimeFlag = 0,                      // 修改dom只执行1次标志位
                joinRefreshFlag = false,                    // 进入下拉刷新状态标志位
                refreshFlag = 0;                            // 下拉刷新执行是控制页面假死标志位

            var getEle = function (str) {
                return document.querySelector(str);
            };

            var pullIcon = getEle('#pullIcon'),              // 下拉loading
                pullText = getEle('#pullText'),              // 下拉文字
                succIcon = getEle('#succIcon'),              // 刷新成功icon
                pullArrow = getEle('#arrowIcon'),            // 下拉箭头
                pullTop = getEle('#pullTop'),                // 拉动的头部
                container = getEle(opt.container),           // 主容器
                scroll = container.children[1];

            container.addEventListener('touchstart', function (e) {
                if (refreshFlag) {
                    e.preventDefault();
                    return;
                }

                dragStart = e.touches[0].pageY;
                _css(scroll, 'TransitionDuration', '0ms');

                succIcon.classList.add('none');
                pullIcon.classList.add('none');
                pullArrow.classList.remove('none');
                pullArrow.classList.remove('down');
                pullArrow.classList.remove('up');
            });

            container.addEventListener('touchmove', function (e) {
                if (dragStart === null) {
                    return;
                }
                if (refreshFlag) {
                    e.preventDefault();
                    return;
                }

                var startY = e.touches[0].pageY,
                    height = window.screen.availHeight || window.screen.height;
                percentage = (dragStart - startY) / height;

                // 当scrolltop是0且往下滚动
                if (container.scrollTop === 0 && percentage < 0) {
                    if (!e.defaultPrevented) {
                        e.preventDefault();
                    }

                    if (!changeOneTimeFlag) {
                        pullArrow.classList.remove('none');
                        opt.beforePull && opt.beforePull();
                        changeOneTimeFlag = 1;
                    }

                    var translateX = -percentage * moveCount;
                    joinRefreshFlag = true;

                    if (Math.abs(percentage) > dragThreshold) {
                        pullText.textContent = '释放刷新';
                        pullArrow.classList.remove('down');
                        pullArrow.classList.add('up');
                    } else {
                        pullText.textContent = '下拉刷新';
                        pullArrow.classList.remove('up');
                        pullArrow.classList.add('down');
                    }

                    _css(scroll, 'Transform', 'translate3d(0,' + translateX + 'px,0)');
                }
            });

            container.addEventListener('touchend', function(e){

                if (percentage === 0) {
                    return;
                }

                if (refreshFlag) {
                    e.preventDefault();
                    return;
                }

                // 超过刷新临界值
                if (Math.abs(percentage) > dragThreshold && joinRefreshFlag) {

                    opt.onRefresh && opt.onRefresh();

                    pullArrow.classList.add('none');
                    pullIcon.classList.remove('none');
                    pullText.textContent = '正在刷新';

                    _css(scroll, 'TransitionDuration', '300ms');
                    _css(scroll, 'Transform', 'translate3d(0,' + pullTop.clientHeight + 'px,0)');

                    // 进入下拉刷新状态
                    refreshFlag = 1;
                    setTimeout(function () {
                        pullIcon.classList.add('none');
                        succIcon.classList.remove('none');
                        pullText.textContent = '刷新成功';

                        setTimeout(function () {
                            opt.afterPull && opt.afterPull();
                            refreshFlag = 0;
                            _css(scroll, 'TransitionDuration', '300ms');
                            _css(scroll, 'Transform', 'translate3d(0,0,0)');
                        }, 300);
                    }, 300);

                } else {
                    if (joinRefreshFlag) {
                        _css(scroll, 'TransitionDuration', '300ms');
                        _css(scroll, 'Transform', 'translate3d(0,0,0)');
                    }
                }
                // 恢复初始化状态
                changeOneTimeFlag = 0;
                joinRefreshFlag = false;
                dragStart = null;
                percentage = 0;
                refreshFlag = 0;
            });
        }
    };

    return pullDownRefresh;
}));