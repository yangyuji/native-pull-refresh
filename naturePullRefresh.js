/*
* author: "oujizeng",
* license: "MIT",
* name: "naturePullRefresh.js",
* version: "1.1.0"
*/

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return (root.returnExportsGlobal = factory());
        });
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root['NaturePullRefresh'] = factory();
    }
}(this, function () {

    var getEle = function (id) {
        return document.getElementById(id);
    }, elementDisplay = {};

    var util = {
        show: function (dom) {
            dom.style.display == "none" && (dom.style.display = '')
            if (getComputedStyle(dom, '').getPropertyValue("display") == "none")
                dom.style.display = this.defaultDisplay(dom.nodeName)
        },
        hide: function (dom) {
            dom.style.display = "none";
        },
        defaultDisplay: function (nodeName) {
            var element, display
            if (!elementDisplay[nodeName]) {
                element = document.createElement(nodeName)
                document.body.appendChild(element)
                display = getComputedStyle(element, '').getPropertyValue("display")
                element.parentNode.removeChild(element)
                display == "none" && (display = "block")
                elementDisplay[nodeName] = display
            }
            return elementDisplay[nodeName]
        },
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

            var dragThreshold = opt.dragThreshold || 0.3,   // 临界值
                moveCount = opt.moveCount || 200,           // 位移系数
                dragStart = null,                           // 开始抓取标志位
                percentage = 0,                             // 拖动量的百分比
                changeOneTimeFlag = 0,                      // 修改dom只执行1次标志位
                joinRefreshFlag = null,                     // 进入下拉刷新状态标志位
                refreshFlag = 0;                            // 下拉刷新执行是控制页面假死标志位

            var pullIcon = getEle('pullIcon'),              // 下拉loading
                pullText = getEle('pullText'),              // 下拉文字
                pullArrow = getEle('arrowIcon'),            // 下拉箭头
                pullTop = getEle('pullTop'),                // 拉动的头部
                dom = getEle(opt.container);                // 主容器

            dom.addEventListener('touchstart', function (event) {
                if (refreshFlag) {
                    event.preventDefault();
                    return;
                }

                event = event.touches[0];
                dragStart = event.clientY;
                dom.style.transition = 'none';

                util.hide(pullIcon);
                util.removeClass(pullArrow, 'down');
                util.removeClass(pullArrow, 'up');
            });

            dom.addEventListener('touchmove', function (event) {
                if (dragStart === null) {
                    return;
                }
                if (refreshFlag) {
                    event.preventDefault();
                    return;
                }
                var target = event.touches[0];
                percentage = (dragStart - target.clientY) / window.screen.height;

                // 当scrolltop是0且往下滚动
                if (dom.scrollTop === 0) {
                    if (percentage < 0) {

                        event.preventDefault();

                        if (!changeOneTimeFlag) {
                            util.show(pullArrow);
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

                        if (percentage > 0) {
                            dom.style.transform = 'translate3d(0,' + translateX + 'px,0)';
                        } else {
                            dom.style.transform = 'translate3d(0,' + translateX + 'px,0)';
                        }
                    } else {
                        if (joinRefreshFlag === null) {
                            joinRefreshFlag = false;
                        }
                    }
                } else {
                    if (joinRefreshFlag === null) {
                        joinRefreshFlag = false;
                    }
                }
            });

            dom.addEventListener('touchend', function(event){

                if (percentage === 0) {
                    return;
                }

                if (refreshFlag) {
                    event.preventDefault();
                    return;
                }

                if (Math.abs(percentage) > dragThreshold && joinRefreshFlag) {

                    opt.onRefresh && opt.onRefresh();

                    util.hide(pullArrow);
                    dom.style.transition = '330ms';
                    util.show(pullIcon);
                    pullText.textContent = '正在刷新..';
                    // dom.style.overflow = 'inherit';
                    dom.style.transform = 'translate3d(0,' + pullTop.clientHeight + 'px,0)';

                    // 进入下拉刷新状态
                    refreshFlag = 1;
                    setTimeout(function () {

                        pullText.textContent = '刷新成功';
                        dom.style.transform = 'translate3d(0,0,0)';
                        util.hide(pullIcon);

                        setTimeout(function(){
                            opt.afterPull && opt.afterPull();
                            refreshFlag = 0;
                        }, 300);

                    }, 700);

                } else {
                    if (joinRefreshFlag) {
                        refreshFlag = 1;

                        dom.style.transition = '330ms';
                        dom.style.transform = 'translate3d(0,0,0)';

                        setTimeout(function () {
                            opt.afterPull && opt.afterPull();
                            refreshFlag = 0;
                        }, 300);
                    }
                }
                // 恢复初始化状态
                changeOneTimeFlag = 0;
                joinRefreshFlag = null;
                dragStart = null;
                percentage = 0;
            });
        }
    };

    return NaturePullRefresh;
}));