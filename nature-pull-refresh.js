/**
 * author: "oujizeng",
 * license: "MIT",
 * github: "https://github.com/yangyuji/native-pull-refresh",
 * name: "nature-pull-refresh.js",
 * version: "2.1.0"
 */

(function (root, factory) {
    if (typeof module != 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define == 'function' && define.amd) {
        define(function () {
            return factory();
        });
    } else {
        root['pullDownRefresh'] = factory();
    }
}(this, function () {
    'use strict'

    var util = {
        getEle: function (str, scope) {
            var doc = scope || document;
            return doc.querySelector(str);
        },
        _translate: function (el, attr, val) {
            var vendors = ['', 'webkit', 'ms', 'Moz', 'O'],
                body = document.body || document.documentElement;

            [].forEach.call(vendors, function (vendor) {
                var styleAttr = vendor ? vendor + attr : attr.charAt(0).toLowerCase() + attr.substr(1);
                if (typeof body.style[styleAttr] === 'string') {
                    el.style[styleAttr] = val;
                }
            });
        },
        _transitionEnd: function (el, fun) {
            var vendors = ['webitTransitionEnd', 'transitionend'];
            var handler = function (e) {
                [].forEach.call(vendors, function (vendor) {
                    el.removeEventListener(vendor, handler, false);
                });
                fun.apply(el, arguments);
            };
            [].forEach.call(vendors, function (vendor) {
                el.addEventListener(vendor, handler, false);
            });
        }
    };

    function pullDownRefresh(opt) {
        this.moveCount = opt.moveThreshold || 50;        // 临界值

        // 执行完需要还原的值
        this.dragStart = 0;                              // 开始抓取标志位
        this.translateY = 0;                             // 拖动量的百分比
        this.changeOneTimeFlag = 0;                      // 修改dom只执行1次标志位
        this.joinRefreshFlag = 0;                        // 进入下拉刷新状态标志位
        this.refreshFlag = 0;                            // 下拉刷新执行是控制页面假死标志位

        this.wrapper = util.getEle(opt.wrapper);                  // 主容器
        this.pullIcon = util.getEle('#pullIcon', this.wrapper);   // 下拉loading
        this.pullText = util.getEle('#pullText', this.wrapper);   // 下拉文字
        this.succIcon = util.getEle('#succIcon', this.wrapper);   // 刷新成功icon
        this.pullArrow = util.getEle('#arrowIcon', this.wrapper); // 下拉箭头
        this.pullTop = util.getEle('#pullTop', this.wrapper);     // 拉动的头部

        // 采用事件驱动，不使用回调
        this._events = {};
        this._bindEvents();

        // 刷新成功监听
        this.on('success', function () {
            console.log('refresh success');
            this.pullIcon.classList.add('none');
            this.succIcon.classList.remove('none');
            this.pullText.textContent = '刷新成功';
            this._animateEnd(300);
        });
        // 刷新失败监听
        this.on('fail', function () {
            console.log('refresh fail');
            this.pullIcon.classList.add('none');
            this.pullArrow.classList.remove('none');
            this.pullText.textContent = '刷新失败';
            this._animateEnd(300);
        });
    }

    pullDownRefresh.prototype = {
        version: '2.1.0',
        destroy: function () {
            this._unbindEvents();
            this.off('before-pull');
            this.off('pull-down');
            this.off('refresh');
            this.off('success');
            this.off('fail');
        },
        _start: function (e) {
            if (this.refreshFlag) {
                e.preventDefault();
                return;
            }

            this.dragStart = e.touches[0].pageY;
            util._translate(this.wrapper, 'TransitionDuration', '0ms');

            this.succIcon.classList.add('none');
            this.pullIcon.classList.add('none');
            this.pullArrow.classList.remove('none');
            this.pullArrow.classList.remove('down');
            this.pullArrow.classList.remove('up');
        },
        _move: function (e) {
            if (this.dragStart === null) {
                return;
            }
            if (this.refreshFlag) {
                e.preventDefault();
                return;
            }

            var clientY = e.touches[0].pageY;
            this.translateY = clientY - this.dragStart;

            // 当scrolltop是0且往下滚动
            if (document.documentElement.scrollTop + document.body.scrollTop === 0 && this.translateY > 0) {

                e.preventDefault(); // 必须，微信浏览器出现的bug

                if (!this.changeOneTimeFlag) {
                    this.pullArrow.classList.remove('none');
                    this.emit('before-pull');
                    this.changeOneTimeFlag = 1;
                }
                this.joinRefreshFlag = 1;

                if (Math.abs(this.translateY) > this.moveCount) {
                    this.pullText.textContent = '释放刷新';
                    this.pullArrow.classList.remove('down');
                    this.pullArrow.classList.add('up');
                } else {
                    this.pullText.textContent = '下拉刷新';
                    this.pullArrow.classList.remove('up');
                    this.pullArrow.classList.add('down');
                }

                util._translate(this.wrapper, 'Transform', 'translate3d(0,' + this.translateY + 'px,0)');

                this.emit('pull-down');
            }
        },
        _end: function (e) {
            if (this.translateY === 0) {
                return;
            }
            if (this.refreshFlag) {
                e.preventDefault();
                return;
            }

            // 超过刷新临界值
            if (Math.abs(this.translateY) > this.moveCount && this.joinRefreshFlag) {

                this.pullArrow.classList.add('none');
                this.pullIcon.classList.remove('none');
                this.pullText.textContent = '正在刷新';

                util._translate(this.wrapper, 'TransitionDuration', '300ms');
                util._translate(this.wrapper, 'Transform', 'translate3d(0,' + this.pullTop.offsetHeight + 'px,0)');

                // 进入下拉刷新状态
                this.refreshFlag = 1;
                this.emit('refresh');

            } else {
                // 未超过刷新临界值
                if (this.joinRefreshFlag) {
                    this._animateEnd(0);
                }
            }
            // 恢复初始化状态
            this.changeOneTimeFlag = 0;
            this.joinRefreshFlag = 0;
            this.dragStart = 0;
        },
        _cancel: function () {
            // 恢复初始化状态
            this.changeOneTimeFlag = 0;
            this.joinRefreshFlag = 0;
            this.dragStart = 0;

            this.pullIcon.classList.add('none');
            this.pullArrow.classList.remove('none');
            this.pullText.textContent = '刷新取消';
            this._animateEnd(300);
        },
        _animateEnd: function (timeout) {
            var _this = this;
            setTimeout(function () {
                util._translate(_this.wrapper, 'TransitionDuration', '300ms');
                util._translate(_this.wrapper, 'Transform', 'translate3d(0,0,0)');
                util._transitionEnd(_this.wrapper, function () {
                    _this.refreshFlag = 0;
                });
            }, timeout);
        },
        _bindEvents: function () {
            this.start = this._start.bind(this);
            this.move = this._move.bind(this);
            this.end = this._end.bind(this);
            this.cancel = this._cancel.bind(this);

            this.wrapper.addEventListener('touchstart', this.start, false);
            this.wrapper.addEventListener('touchmove', this.move, false);
            this.wrapper.addEventListener('touchend', this.end, false);
            this.wrapper.addEventListener('touchcancel', this.cancel, false);
        },
        _unbindEvents: function () {
            this.wrapper.removeEventListener('touchstart', this.start, false);
            this.wrapper.removeEventListener('touchmove', this.move, false);
            this.wrapper.removeEventListener('touchend', this.end, false);
            this.wrapper.removeEventListener('touchcancel', this.cancel, false);
        },
        // Event
        emit: function (type) {
            if (!this._events[type]) {
                return;
            }
            var i = 0,
                l = this._events[type].length;
            if (!l) {
                return;
            }
            for (; i < l; i++) {
                this._events[type][i].apply(this, [].slice.call(arguments, 1));
            }
        },
        on: function (type, fn) {
            if (!this._events[type]) {
                this._events[type] = [];
            }
            this._events[type].push(fn);
        },
        off: function (type, fn) {
            if (!this._events[type]) {
                return;
            }
            var index = this._events[type].indexOf(fn);
            if (index > -1) {
                this._events[type].splice(index, 1);
            }
        }
    };

    return pullDownRefresh;
}));