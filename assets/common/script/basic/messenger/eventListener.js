//eventListener 为全局变量 1对多的时间注册机制

window.eventListener = {};

var oneToMultiListener = {};

oneToMultiListener.on = function(eventName, handler, target) {
    var handlerList = this.handlers[eventName];
    if (!handlerList) {
        handlerList = [];
        this.handlers[eventName] = handlerList;
    }

    for (var i = 0; i < handlerList.length; i++) {
        if (!handlerList[i]) {
            handlerList[i].handler = handler;
            handlerList[i].target = target;
            return i;
        }
    }

    handlerList.push({handler: handler, target: target});
    return handlerList.length;
};

oneToMultiListener.dispatch = function(eventName, data) {
    var handlerList = this.handlers[eventName];
    if (!handlerList) {
        return;
    }

    var len = handlerList.length;
    for (var i = 0; i < len; i++) {
        var handler = handlerList[i].handler;
        var target = handlerList[i].target;
        if (handler) {
            try {
                if (target) {
                    handler.call(target, data); //call为function的方法,可以用来调用函数.可以用来实现集成和改变this,第一个为this之后为调用参数
                } else {
                    handler(data);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
};

oneToMultiListener.off = function(eventName, handler, target) {
    var handlerList = this.handlers[eventName];
    if (!handlerList) {
        return;
    }

    for (var i = 0; i < handlerList.length; i++) {
        var oldHandler = handlerList[i].handler;
        var oldTarget = handlerList[i].target;
        if (oldHandler === handler && oldTarget === target) {
            handlerList.splice(i, 1); //从数组handlerList的i处删除1个元素
            break;
        }
    }
};
oneToMultiListener.clear = function(target) {
    for (var eventName in this.handlers) {
        var handlerList = this.handlers[eventName];
        for (var i = 0; i < handlerList.length; i++) {
            var oldTarget = handlerList[i].target;
            if (oldTarget === target) {
                handlerList.splice(i, 1);
            }
        }
    }
};

eventListener.create = function() {
    var newEventListener = Object.create(oneToMultiListener); //es5中创建对象的方法 oneToMultiListener充当继承的原型
    newEventListener.handlers = {};
    return newEventListener;
};