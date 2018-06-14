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
    rectWidth: 0,
    rectHeight: 0,
    mouseDiffX: 0,
    mouseDiffY: 0,
    zIndex: 2000,
    isClick: true,
    dragging: false,
    innerHtml:'<div class="ui-resizable-handle box-e-resizable"></div><div class="ui-resizable-handle box-s-resizable"></div><div class="ui-resizable-handle box-es-resizable ui-icon ui-icon-gripsmall-diagonal-se"></div>'
};

var PanelUtil = {
    panelID: "action-area",
    panelPageX: 0,
    panelPageY: 0,
    panelWidth: 0,
    panelHeigth: 0,
    allowDraw: false
};

var MousePosition = {
    startPageX: 0,
    startPageY: 0
}

function PanelUtilInit() {
    PanelUtil.panelPageX = EventUtil.getElementPageX(document.getElementById(PanelUtil.panelID));
    PanelUtil.panelPageY = EventUtil.getElementPageY(document.getElementById(PanelUtil.panelID));
    // PanelUtil.panelWidth = document.getElementById("myImage").offsetWidth;
    // PanelUtil.panelHeigth = document.getElementById("myImage").offsetHeight;
    PanelUtil.panelWidth = document.getElementById("myImage").getBoundingClientRect().width; //精确到小数
    PanelUtil.panelHeigth = document.getElementById("myImage").getBoundingClientRect().height;

    document.getElementById("divCover").style.width = PanelUtil.panelWidth + "px";
    document.getElementById("divCover").style.height = PanelUtil.panelHeigth + "px";
    document.getElementById("divCover").style.cursor = "crosshair";
}

var ImageRedactorEvent = function () {
    function handleRectEvent(event) {
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);

        switch (event.type) {
            case "mousedown":
                var targetClassName = target.className;
                if(targetClassName.indexOf('box-e-resizable') > -1){
                    console.log('box-e-resizable');
                    var eBox = target.parentNode;
                    eBox.id = "e_resize_box";
                    RectangleUtil.rectESX = parseInt(eBox.style.left.replace('px','')) + eBox.offsetWidth;
                    RectangleUtil.rectWidth = eBox.offsetWidth;
                    MousePosition.startPageX = event.pageX;
                }
                else if(targetClassName.indexOf('box-s-resizable') > -1){
                    console.log('box-s-resizable');
                    var sBox = target.parentNode;
                    sBox.id = "s_resize_box";
                    RectangleUtil.rectESY = parseInt(sBox.style.top.replace('px','')) + sBox.offsetHeight;
                    RectangleUtil.rectHeight = sBox.offsetHeight;
                    MousePosition.startPageY = event.pageY;
                }
                else if(targetClassName.indexOf('box-es-resizable') > -1){
                    console.log('box-es-resizable');
                    var esBox = target.parentNode;
                    esBox.id = "es_resize_box";
                    RectangleUtil.rectESX = parseInt(esBox.style.left.replace('px','')) + esBox.offsetWidth;
                    RectangleUtil.rectESY = parseInt(esBox.style.top.replace('px','')) + esBox.offsetHeight;
                    RectangleUtil.rectWidth = esBox.offsetWidth;
                    RectangleUtil.rectHeight = esBox.offsetHeight;
                    MousePosition.startPageX = event.pageX;
                    MousePosition.startPageY = event.pageY;
                }
                else if (targetClassName != 'redact-box') {
                    //create rectangle
                    RectangleUtil.rectWNX = event.pageX - PanelUtil.panelPageX;
                    RectangleUtil.rectWNY = event.pageY - PanelUtil.panelPageY;                    
                    console.log("mousedown: create rectangle. RectangleUtil.rectWNX ："+  RectangleUtil.rectWNX + "RectangleUtil.rectWNY ："+ RectangleUtil.rectWNY)
                    var active_box = document.createElement("div");
                    active_box.id = "active_box";
                    active_box.className = "redact-box";
                    active_box.setAttribute("react_id", "rect_" + Math.random().toString().replace('.',''));
                    active_box.setAttribute("isselected", false);
                    active_box.style.left = RectangleUtil.rectWNX + 'px';
                    active_box.style.top = RectangleUtil.rectWNY + 'px';
                    active_box.innerHTML = RectangleUtil.innerHtml;
                    document.getElementById(PanelUtil.panelID).appendChild(active_box);
                    active_box = null;
                }
                else {
                    // moving rectangle
                    console.log("mousedown: moving rectangle")
                    RectangleUtil.dragging = true;
                    if (document.getElementById("moving_box") !== null) {
                        document.getElementById("moving_box").removeAttribute("id");
                    }

                    target.id = "moving_box";
                    RectangleUtil.mouseDiffX = event.pageX - EventUtil.getElementPageX(target);
                    RectangleUtil.mouseDiffY = event.pageY - EventUtil.getElementPageY(target);
                }                
                RectangleUtil.isClick = true;
                EventUtil.stopPropagation(event);
                break;

            case "mousemove":
                if(document.getElementById("e_resize_box") !== null){
                    RectangleUtil.isClick = false;
                    var eResizeBox = document.getElementById("e_resize_box");
                    var xDistance = event.pageX - MousePosition.startPageX;                    
                    
                    //east border 
                    if (RectangleUtil.rectESX + xDistance >= PanelUtil.panelWidth) {
                        //console.log("RectangleUtil.rectESX: "+ RectangleUtil.rectESX+" PanelUtil.panelWidth："+ PanelUtil.panelWidth)
                        eResizeBox.style.width = PanelUtil.panelWidth - RectangleUtil.rectESX + RectangleUtil.rectWidth - 4 + "px";
                    }
                    else{
                        eResizeBox.style.width = RectangleUtil.rectWidth + xDistance + "px";
                    }
                }
                else if(document.getElementById("s_resize_box") !== null){
                    RectangleUtil.isClick = false;
                    var sResizeBox = document.getElementById("s_resize_box");
                    var yDistance = event.pageY - MousePosition.startPageY;                                       
                    
                    //south border 
                    if (RectangleUtil.rectESY + yDistance >= PanelUtil.panelHeigth) {
                        sResizeBox.style.height = PanelUtil.panelHeigth - RectangleUtil.rectESY + RectangleUtil.rectHeight - 4 + "px";
                    }
                    else{
                        sResizeBox.style.height = RectangleUtil.rectHeight + yDistance + "px";
                    }
                }
                else if(document.getElementById("es_resize_box") !== null){
                    console.log("resizing es_resize_box")
                    RectangleUtil.isClick = false;
                    var esResizeBox = document.getElementById("es_resize_box");
                    var xDistance = event.pageX - MousePosition.startPageX;    
                    var yDistance = event.pageY - MousePosition.startPageY;                                       
                    
                    //east border 
                    if (RectangleUtil.rectESX + xDistance >= PanelUtil.panelWidth) {
                        //console.log("RectangleUtil.rectESX: "+ RectangleUtil.rectESX+" PanelUtil.panelWidth："+ PanelUtil.panelWidth)
                        esResizeBox.style.width = PanelUtil.panelWidth - RectangleUtil.rectESX + RectangleUtil.rectWidth - 4 + "px";
                    }
                    else{
                        esResizeBox.style.width = RectangleUtil.rectWidth + xDistance + "px";
                    }

                    //south border 
                    if (RectangleUtil.rectESY + yDistance >= PanelUtil.panelHeigth) {
                        esResizeBox.style.height = PanelUtil.panelHeigth - RectangleUtil.rectESY + RectangleUtil.rectHeight - 4 + "px";
                    }
                    else{
                        esResizeBox.style.height = RectangleUtil.rectHeight + yDistance + "px";
                    }
                }
                else if (document.getElementById("active_box") !== null) {
                    //creating rectangle
                    console.log("mousemove: creating rectangle")
                    var elBox = document.getElementById("active_box");

                    RectangleUtil.rectESX = event.pageX - PanelUtil.panelPageX;
                    RectangleUtil.rectESY = event.pageY - PanelUtil.panelPageY;

                    //prevent the rectangle cross the image border（4 is two border width）
                    RectangleUtil.rectESX = RectangleUtil.rectESX - 4 >= PanelUtil.panelWidth ? PanelUtil.panelWidth - 4 : RectangleUtil.rectESX;
                    RectangleUtil.rectESY = RectangleUtil.rectESY - 4 >= PanelUtil.panelHeigth ? PanelUtil.panelHeigth - 4 : RectangleUtil.rectESY;

                    elBox.style.width = (RectangleUtil.rectESX - RectangleUtil.rectWNX) + "px";
                    elBox.style.height = (RectangleUtil.rectESY - RectangleUtil.rectWNY) + "px";
                }
                else if (document.getElementById("moving_box") && RectangleUtil.dragging) {
                    console.log("mousemove: moving rectangle")
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
                    console.log("mouseup: finish create rectangle")
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
                if (document.getElementById("e_resize_box") !== null) {
                    document.getElementById("e_resize_box").removeAttribute("id");
                }
                if (document.getElementById("s_resize_box") !== null) {
                    document.getElementById("s_resize_box").removeAttribute("id");
                }
                if (document.getElementById("es_resize_box") !== null) {
                    document.getElementById("es_resize_box").removeAttribute("id");
                }
                break;
        }
    }

    function handleButtonsEvent(event) {
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);
        switch (target.id) {
            case "btnAddRectangle":
                if(PanelUtil.allowDraw){
                    ImageRedactorEvent.disableRedactor(); 
                    PanelUtil.allowDraw = false;  
                    target.value="Enable Draw";
                }
                else{
                    ImageRedactorEvent.enableRedactor();
                    PanelUtil.allowDraw = true;
                    target.value="Disable Draw";
                }
                break;
            case "btnRedact":
                var elBoxs = [].slice.apply(document.getElementsByClassName("redact-box")),
                    rectangles = [];
                elBoxs.forEach(function (element) {
                    //无后台演示使用
                    element.setAttribute("isselected",false);
                    element.setAttribute("isredacted",true);
                    element.style.backgroundColor = "black";
                    element.style.borderColor = "black";
                    element.style.opacity = 1;
                    //element.style.border = 0;

                    var elX = element.style.left,
                        elY = element.style.top,
                        elWidth = element.style.width,
                        elHeight = element.style.height;
                    
                    var info = {
                        "x": elX.substring(0, elX.length -2), 
                        "y": elY.substring(0, elY.length -2),
                        "w": parseInt(elWidth.substring(0, elWidth.length -2)) + 2,//border width
                        "h": parseInt(elHeight.substring(0, elHeight.length -2)) + 2
                    }
                    rectangles.push(info);
                });

                console.log(JSON.stringify(rectangles));
                EventUtil.stopPropagation(event);
                EventUtil.preventDefault(event);
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
                EventUtil.preventDefault(event);
                break;
        }
    }

    return {
        enableRedactor: function () {
            PanelUtilInit();
            EventUtil.addHandler(document.getElementById(PanelUtil.panelID), "mousedown", handleRectEvent);
            EventUtil.addHandler(document, "mousemove", handleRectEvent);
            EventUtil.addHandler(document, "mouseup", handleRectEvent);
        },

        disableRedactor: function () {
            EventUtil.removeHandler(document.getElementById(PanelUtil.panelID), "mousedown", handleRectEvent);
            EventUtil.removeHandler(document, "mousemove", handleRectEvent);
            EventUtil.removeHandler(document.getElementById(PanelUtil.panelID), "mouseup", handleRectEvent);

            document.getElementById("divCover").style.cursor = "default";
        },

        actionEventInit: function () {
            EventUtil.addHandler(document.getElementById("div-button-group"), "click", handleButtonsEvent);

            EventUtil.addHandler(document, "keyup", function(event){ 
                event = EventUtil.getEvent(event); 
                if(event.keyCode === 46){
                    document.getElementById("btnRemoveRect").click();
                }
            });
        }
    }
}();