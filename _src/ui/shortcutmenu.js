(function () {
    var UI = baidu.editor.ui,
        UIBase = UI.UIBase,
        uiUtils = UI.uiUtils,
        utils = baidu.editor.utils,
        domUtils = baidu.editor.dom.domUtils,

        ShortCutMenu = UI.ShortCutMenu = function ( options ) {
            this.initOptions ( options );
            this.initShortCutMenu ();
        };

    var allMenus = [];
    ShortCutMenu.postHide = hideAllMenu;

    ShortCutMenu.prototype = {
        isHidden : true ,
        initShortCutMenu : function () {
            this.items = this.items || [];
            this.initUIBase ();
            this.initItems ();
            this.initEvent ();
            allMenus.push ( this );
        } ,
        initEvent : function () {
            var me = this,
                doc = me.editor.document;

            domUtils.on ( doc , "mousemove" , function ( e ) {
                if ( me.isHidden === false ) {
                    var flag = true,
                        el = me.getDom (),
                        wt = el.offsetWidth,
                        ht = el.offsetHeight,
                        distanceX = wt / 2 + 50,//距离中心X
                        distanceY = ht / 2 + 50,//距离中心Y
                        x = Math.abs ( e.screenX - me.left ),//离中心距离横坐标
                        y = Math.abs ( e.screenY - me.top );//离中心距离纵坐标

                    if ( y > 0 && y < distanceY ) {
                        me.setOpacity ( el , "1" );
                    } else if ( y > distanceY && y < distanceY + 70 ) {
                        me.setOpacity ( el , "0.5" );
                        flag = false;
                    } else if ( y > distanceY + 70 && y < distanceY + 140 ) {
                        me.hide ();
                    }

                    if ( flag && x > 0 && x < distanceX ) {
                        me.setOpacity ( el , "1" )
                    } else if ( x > distanceX && x < distanceX + 70 ) {
                        me.setOpacity ( el , "0.5" )
                    } else if ( x > distanceX + 70 && x < distanceX + 140 ) {
                        me.hide ();
                    }
                }
            } );
        } ,
        initItems : function () {
            for ( var i = 0, len = this.items.length ; i < len ; i ++ ) {
                var item = this.items[i].toLowerCase ();

                if ( UI[item] ) {
                    this.items[i] = new UI[item] ( this.editor );
                }
            }
        } ,
        setOpacity : function ( el , value ) {
            if ( browser.ie && browser.version < 9 ) {
                el.style.filter = "alpha(opacity = " + parseFloat ( value ) * 100 + ");"
            } else {
                el.style.opacity = value;
            }
        } ,
        show : function ( e ) {
            var el = this.getDom (), offset;

            offset = uiUtils.getViewportOffsetByEvent ( e );
            el.style.cssText = "display:block;left:-9999px";
            offset.top -= el.offsetHeight + 20;
            this.getDom ().style.cssText = "left:" + offset.left + "px;top:" + offset.top + "px;display:block";

            if ( this.editor ) {
                el.style.zIndex = this.editor.container.style.zIndex * 1 + 10;
                uiUtils.getFixedLayer ().style.zIndex = el.style.zIndex - 1;
            }

            this.isHidden = false;
            this.left = e.screenX + el.offsetWidth / 2;
            this.top = e.screenY - (el.offsetHeight / 2) - 20;
        } ,
        hide : function () {
            if ( this.getDom () ) {
                this.getDom ().style.display = "none";
            }
            this.isHidden = true;
        } ,
        postRender : function () {
            for ( var i = 0, item ; item = this.items[i ++] ; ) {
                item.postRender ();
            }
        } ,
        getHtmlTpl : function () {
            var buff = [];
            for ( var i = 0 ; i < this.items.length ; i ++ ) {
                buff[i] = this.items[i].renderHtml ();
            }
            return '<div id="##" class="%% edui-toolbar" onselectstart="return false;" >' +
                buff.join ( '' ) +
                '</div>'
        }
    };
    utils.inherits ( ShortCutMenu , UIBase );

    function hideAllMenu ( e ) {
        var tgt = e.target || e.srcElement,
            cur = domUtils.findParent ( tgt , function ( node ) {
                return domUtils.hasClass ( node , "edui-shortcutmenu" ) || domUtils.hasClass ( node , "edui-popup" );
            } , true );

        if ( ! cur ) {
            for ( var i = 0, menu ; menu = allMenus[i ++] ; ) {
                menu.hide ()
            }
        }
    }

    domUtils.on ( document , 'mousedown' , function ( e ) {
        hideAllMenu ( e );
    } );

    domUtils.on ( window , 'scroll' , function ( e ) {
        hideAllMenu ( e );
    } );

}) ();
