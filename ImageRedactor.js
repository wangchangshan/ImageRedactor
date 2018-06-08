var EventUtil = {    
    addHandler: function(element, type, handler){
        if(element.addEventListener){ // 是否存在DOM2级方法
            element.addEventListener(type, handler, false);
        }
        else if(element.attachEvent){ // IE8 及以下的方法
            element.attachEvent("on" + type, handler); //此处没有考虑作用域问题
        }
        else{ // DOM0级方法， 现代浏览器应该不会执行到这里
            element["on" + type] = handler;
        }
    },

    removeHandler: function(element, type, handler){
        if (element.removeEventListener){ 
            element.removeEventListener(type, handler, false); 
        } 
        else if (element.detachEvent){ 
            element.detachEvent("on" + type, handler); 
        } 
        else { 
            element["on" + type] = null; 
        }
    },

    getEvent: function(event){
        return event ? event : window.event;
    },

    getTarget: function(event){
        return event.target || event.srcElement;
    },

    preventDefault: function(event){
        if(event.preventDefault){
            event.preventDefault();
        }
        else {
            event.returnValue = false;
        }
    },

    stopPropagation: function(event){
        if(event.stopPropagation){
            event.stopPropagation();
        }
        else{
            event.cancelBubble = true;
        }
    },

    getElementPageX: function(element){
        var pageX = element.offsetLeft;
        var elParent = element.offsetParent;
        while (elParent != null) {
            pageX += elParent.offsetLeft;
            elParent = elParent.offsetParent;
        }
        return pageX;
    },

    getElementPageY: function(element){
        var pageY = element.offsetTop;
        var elParent = element.offsetParent;
        while (elParent != null) {
            pageY += elParent.offsetTop;
            elParent = elParent.offsetParent;
        }
        return pageY;
    }
}

var RectangleUtil = {
    rectWNX: 0,
    rectWNY: 0,
    rectESX: 0,
    rectESY: 0,
    mouseDiffX: 0,
    mouseDiffY: 0,
    dragging: false,
    zIndex: 2000,
    isClick: true
};

var PanelUtil = {
    panelID: "action-area",
    panelPageX: 0,
    panelPageY: 0,
    panelWidth: 0,
    panelHeigth: 0
};

function PanelUtilInit() {
    PanelUtil.panelPageX = EventUtil.getElementPageX(document.getElementById(PanelUtil.panelID));
    PanelUtil.panelPageY = EventUtil.getElementPageY(document.getElementById(PanelUtil.panelID));
    PanelUtil.panelWidth = document.getElementById("myImage").offsetWidth;
    PanelUtil.panelHeigth = document.getElementById("myImage").offsetHeight;
}

var ImageRedactorEvent = function () {
    function handleRectEvent(event) {
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        switch (event.type) {
            case "mousedown":
                if (event.target.className != 'redact-box') {
                    //create rectangle
                    RectangleUtil.rectWNX = event.pageX - PanelUtil.panelPageX;
                    RectangleUtil.rectWNY = event.pageY - PanelUtil.panelPageY;
                    var active_box = document.createElement("div");
                    active_box.id = "active_box";
                    active_box.className = "redact-box";
                    active_box.setAttribute("react_id", "rect_" + Math.random().toString().replace('.',''));
                    active_box.setAttribute("isselected", false);
                    active_box.style.left = RectangleUtil.rectWNX + 'px';
                    active_box.style.top = RectangleUtil.rectWNY + 'px';
                    document.getElementById(PanelUtil.panelID).appendChild(active_box);
                    active_box = null;
                }
                else {
                    // moving rectangle
                    RectangleUtil.dragging = true;
                    if (document.getElementById("moving_box") !== null) {
                        document.getElementById("moving_box").removeAttribute("id");
                    }

                    event.target.id = "moving_box";
                    RectangleUtil.mouseDiffX = event.pageX - EventUtil.getElementPageX(event.target);
                    RectangleUtil.mouseDiffY = event.pageY - EventUtil.getElementPageY(event.target);
                }                
                RectangleUtil.isClick = true;
                EventUtil.stopPropagation(event);
                break;

            case "mousemove":
                if (document.getElementById("active_box") !== null) {
                    //creating rectangle
                    var elBox = document.getElementById("active_box");

                    RectangleUtil.rectESX = event.pageX - PanelUtil.panelPageX;
                    RectangleUtil.rectESY = event.pageY - PanelUtil.panelPageY;

                    //prevent the rectangle cross the image border
                    RectangleUtil.rectESX = RectangleUtil.rectESX >= PanelUtil.panelWidth ? PanelUtil.panelWidth : RectangleUtil.rectESX;
                    RectangleUtil.rectESY = RectangleUtil.rectESY >= PanelUtil.panelHeigth ? PanelUtil.panelHeigth : RectangleUtil.rectESY;

                    elBox.style.width = (RectangleUtil.rectESX - RectangleUtil.rectWNX) + "px";
                    elBox.style.height = (RectangleUtil.rectESY - RectangleUtil.rectWNY) + "px";
                }
                if (document.getElementById("moving_box") && RectangleUtil.dragging) {
                    console.log("moving box");
                    RectangleUtil.isClick = false;
                    // moving rectangle
                    var elBoxMoving = document.getElementById("moving_box");
                    RectangleUtil.rectWNX = event.pageX - PanelUtil.panelPageX - RectangleUtil.mouseDiffX;
                    RectangleUtil.rectWNY = event.pageY - PanelUtil.panelPageY - RectangleUtil.mouseDiffY;

                    elBoxMoving.style.left = RectangleUtil.rectWNX + "px";
                    elBoxMoving.style.top = RectangleUtil.rectWNY + "px";

                    //east border 
                    if (RectangleUtil.rectWNX + elBoxMoving.offsetWidth >= PanelUtil.panelWidth) {
                        elBoxMoving.style.left = PanelUtil.panelWidth - elBoxMoving.offsetWidth + "px";
                    }
                    //south border
                    if (RectangleUtil.rectWNY + elBoxMoving.offsetHeight >= PanelUtil.panelHeigth) {
                        elBoxMoving.style.top = PanelUtil.panelHeigth - elBoxMoving.offsetHeight + "px";
                    }
                    //west border
                    if (RectangleUtil.rectWNX <= 0) {
                        elBoxMoving.style.left = 0 + "px";
                    }
                    //north border
                    if (RectangleUtil.rectWNY <= 0) {
                        elBoxMoving.style.top = 0 + "px";
                    }
                }
                EventUtil.stopPropagation(event);
                break;

            case "mouseup":
                EventUtil.stopPropagation(event);
                RectangleUtil.dragging = false;
                if (document.getElementById("active_box") !== null) {
                    // finish create rectangle
                    var elBox = document.getElementById("active_box");
                    elBox.style.zIndex = ++RectangleUtil.zIndex;
                    elBox.removeAttribute("id");
                    if (elBox.offsetWidth < 8 || elBox.offsetHeight < 8) {
                        document.getElementById(PanelUtil.panelID).removeChild(elBox);
                    }
                    else{
                        EventUtil.addHandler(elBox, "click", function(){
                            var isSelected = this.getAttribute("isselected");
                            var isRedacted = this.getAttribute("isredacted");
                            if(RectangleUtil.isClick && isSelected === 'false' && isRedacted !== 'true'){
                                this.setAttribute("isselected",true);                                
                                this.style.backgroundColor = 'red';
                            }
                            else if(RectangleUtil.isClick && isSelected === 'true' && isRedacted !== 'true'){
                                this.setAttribute("isselected",false);                                
                                this.style.backgroundColor = '';
                            }
                        });
                    }
                }

                if (document.getElementById("moving_box") !== null) {
                    document.getElementById("moving_box").removeAttribute("id");
                }
                break;
        }
    }

    function handleButtonsEvent() {
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);
        switch (target.id) {
            case "btnRedact":
                var elBoxs = [].slice.apply(document.getElementsByClassName("redact-box")),
                    rectangles = [];
                elBoxs.forEach(function (element) {
                    //无后台演示使用
                    element.setAttribute("isselected",false);
                    element.setAttribute("isredacted",true);
                    element.style.backgroundColor = "black";
                    element.style.opacity = 1;
                    element.style.border = 0;

                    var elX = element.style.left,
                        elY = element.style.top,
                        elWidth = element.style.width,
                        elHeight = element.style.height;
                    
                    var info = {
                        "x": elX.substring(0, elX.length -2),
                        "y": elY.substring(0, elY.length -2),
                        "w": elWidth.substring(0, elWidth.length -2),
                        "h": elHeight.substring(0, elHeight.length -2)
                    }
                    rectangles.push(info);
                });

                console.log(JSON.stringify(rectangles));
                EventUtil.stopPropagation(event);
                break;

            case "btnRemoveRect":
                var elBoxs = [].slice.apply(document.getElementsByClassName("redact-box"));
                elBoxs.forEach(function(element){
                    var isSelected = element.getAttribute("isselected");
                    if(isSelected === 'true'){
                        element.parentNode.removeChild(element);
                    }
                });
                EventUtil.stopPropagation(event);
                break;
        }
    }

    return {
        enableRedactor: function () {
            PanelUtilInit();
            EventUtil.addHandler(document.getElementById(PanelUtil.panelID), "mousedown", handleRectEvent);
            EventUtil.addHandler(document, "mousemove", handleRectEvent);
            EventUtil.addHandler(document.getElementById(PanelUtil.panelID), "mouseup", handleRectEvent);
        },

        disableRedactor: function () {
            EventUtil.removeHandler(document.getElementById(PanelUtil.panelID), "mousedown", handleRectEvent);
            EventUtil.removeHandler(document, "mousemove", handleRectEvent);
            EventUtil.removeHandler(document.getElementById(PanelUtil.panelID), "mouseup", handleRectEvent);
        },

        actionEventInit: function () {
            EventUtil.addHandler(document.getElementById("div-button-group"), "click", handleButtonsEvent);
        }
    }
}();