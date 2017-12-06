/*
* author: "oujizeng",
* license: "MIT",
* name: "naturePullRefresh.js",
* version: "1.2.3"
*/

(function (root, factory) {
    if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root['NaturePullRefresh'] = factory();
    }
}(this, function () {

    var getEle = function (str) {
        return document.querySelector(str);
    };

    var util = {
        hasClass: function (e, c) {
            var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
            return re.test(e.className);
        },
        addClass: function (e, c) {
            if ( this.hasClass(e, c) ) {
                return;
            }
            var newclass = e.className.split(' ');
            newclass.push(c);
            e.className = newclass.join(' ');
        },
        removeClass: function (e, c) {
            if ( !this.hasClass(e, c) ) {
                return;
            }
            var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
            e.className = e.className.replace(re, '');
        }
    };

    var NaturePullRefresh = {

        init: function(opt){

            var dragThreshold = opt.dragThreshold || 0.18,   // 临界值
                moveCount = opt.moveCount || 200,            // 位移系数

                // 执行完需要还原的值
                dragStart = null,                           // 开始抓取标志位
                percentage = 0,                             // 拖动量的百分比
                changeOneTimeFlag = 0,                      // 修改dom只执行1次标志位
                joinRefreshFlag = false,                    // 进入下拉刷新状态标志位
                refreshFlag = 0;                            // 下拉刷新执行是控制页面假死标志位

            var pullIcon = getEle('#pullIcon'),              // 下拉loading
                pullText = getEle('#pullText'),              // 下拉文字
                succIcon = getEle('#succIcon'),              // 刷新成功icon
                pullArrow = getEle('#arrowIcon'),            // 下拉箭头
                pullTop = getEle('#pullTop'),                // 拉动的头部
                container = getEle(opt.container),           // 主容器
                scroll = container.children[1];

            container.addEventListener('touchstart', function (event) {
                if (refreshFlag) {
                    event.preventDefault();
                    return;
                }

                dragStart = event.touches[0].pageY;
                scroll.style.webkitTransitionDuration = '0ms';
                scroll.style.transitionDuration = '0ms';

                util.addClass(succIcon, 'none');
                util.addClass(pullIcon, 'none');
                util.removeClass(pullArrow, 'none');
                util.removeClass(pullArrow, 'down');
                util.removeClass(pullArrow, 'up');
            });

            container.addEventListener('touchmove', function (event) {
                if (dragStart === null) {
                    return;
                }
                if (refreshFlag) {
                    event.preventDefault();
                    return;
                }

                var startY = event.touches[0].pageY;
                percentage = (dragStart - startY) / window.screen.height;

                // 当scrolltop是0且往下滚动
                if (container.scrollTop === 0 ) {
                    if (percentage < 0) {

                        event.preventDefault();

                        if (!changeOneTimeFlag) {
                            util.removeClass(pullArrow, 'none');
                            opt.beforePull && opt.beforePull();
                            changeOneTimeFlag = 1;
                        }

                        var translateX = -percentage * moveCount;
                        joinRefreshFlag = true;

                        if (Math.abs(percentage) > dragThreshold) {
                            pullText.textContent = '释放刷新';
                            util.removeClass(pullArrow, 'down');
                            util.addClass(pullArrow, 'up');
                        } else {
                            pullText.textContent = '下拉刷新';
                            util.removeClass(pullArrow, 'up');
                            util.addClass(pullArrow, 'down');
                        }

                        scroll.style.webkitTransform = 'translate3d(0,' + translateX + 'px,0)';
                        scroll.style.transform = 'translate3d(0,' + translateX + 'px,0)';
                    }
                }
            });

            container.addEventListener('touchend', function(event){

                if (percentage === 0) {
                    return;
                }

                if (refreshFlag) {
                    event.preventDefault();
                    return;
                }

                // 超过刷新临界值
                if (Math.abs(percentage) > dragThreshold && joinRefreshFlag) {

                    opt.onRefresh && opt.onRefresh();

                    util.addClass(pullArrow, 'none');
                    util.removeClass(pullIcon, 'none');
                    pullText.textContent = '正在刷新';

                    scroll.style.webkitTransitionDuration = '300ms';
                    scroll.style.transitionDuration = '300ms';
                    scroll.style.webkitTransform = 'translate3d(0,' + pullTop.clientHeight + 'px,0)';
                    scroll.style.transform = 'translate3d(0,' + pullTop.clientHeight + 'px,0)';

                    // 进入下拉刷新状态
                    refreshFlag = 1;
                    setTimeout(function () {
                        util.addClass(pullIcon, 'none');
                        util.removeClass(succIcon, 'none');
                        pullText.textContent = '刷新成功';

                        setTimeout(function () {
                            opt.afterPull && opt.afterPull();
                            refreshFlag = 0;
                            scroll.style.webkitTransitionDuration = '300ms';
                            scroll.style.transitionDuration = '300ms';
                            scroll.style.webkitTransform = 'translate3d(0,0,0)';
                            scroll.style.transform = 'translate3d(0,0,0)';
                        }, 300);
                    }, 300);

                } else {
                    if (joinRefreshFlag) {
                        scroll.style.webkitTransitionDuration = '300ms';
                        scroll.style.transitionDuration = '300ms';
                        scroll.style.webkitTransform = 'translate3d(0,0,0)';
                        scroll.style.transform = 'translate3d(0,0,0)';
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

    return NaturePullRefresh;
}));