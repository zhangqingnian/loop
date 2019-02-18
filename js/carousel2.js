/**
 * Created by luochao on 2016/11/18.
 */
(function ($) {
    function Carousel(options){
        this.options= $.extend({
            autoPlay: true,
            supportNextPre: true,
            supportDrag: true,
            autoSpeed: 4000
        },options);
        this._init();
        this._createBottomBtn();
        if(this.options.autoPlay){
            this._autoPlay();
            this._containerOver();
            this._containerOut();
        }
        if(this.options.supportNextPre){
            this._createCursor();
        }
        if(this.options.supportBottomBtn){
            this._createBottomBtn();
        }
        if(this.options.supportDrag){
            this._drag();
        }
    }
    Carousel.prototype={
        _init: function () {
            this.iNow=0;
            this.$box=this.options.container;
            this.oUl=this.$box.find('>ul>li');
            this.oOl=null;
            this.liWidth=this.$box.find('ul').width();
            this.flag=true;
            this.timer=null;
            this.timer2=null;
            this.$leftCursor=null;
            this.$rightCursor=null;
            this.leftClickFlag=true;
            this.rightClickFlag=true;
            var self=this;
            this.oUl.slice(1).each(function(index, el) {
                $(this).css('left',self.liWidth);
            });
            if(this.options.autoSpeed<2000){
                this.options.autoSpeed=2000;
            }else if(this.options.autoSpeed>6000){
                this.options.autoSpeed=6000;
            }
        },
        _createBottomBtn: function () {
            var $Div=$('<div></div>');
            var $Ol=$('<ol></ol>');
            $Div.attr('class','nav');
            for(var i=0;i<this.oUl.length;i++){
                var $Li=$('<li></li>');
                if(i==0){
                    $Li.attr('class','active');
                }
                $Li.html(i+1);  //索引值是从0开始的，所以对应页面上的序号要加1
                $Ol.append($Li);
            }
            $Div.append($Ol);
            this.$box.append($Div);
            this.oOl=this.$box.find('ol>li');
            this._olClick();
        },

        _createCursor: function () {
            var $LeftCursor=$('<a><</a>');
            var $RightCursor=$('<a>></a>');
            var leftCursorTop=null;
            var rightCursorTop=null;
            //var ooNav=$('<div id="nav"><ol><li class="active">1</li><li>2</li><li>3</li><li>4</li><li>5</li></ol></div>');
            $LeftCursor.attr('class','leftCursor');
            $RightCursor.attr('class','rightCursor');
            leftCursorTop=(this.$box.height()-$LeftCursor.height())/2+'px'; //让左边的轮播箭头垂直居中
            rightCursorTop=(this.$box.height()-$RightCursor.height())/2+'px'; //让右边的轮播箭头垂直居中
            $LeftCursor.css('top',leftCursorTop);
            $RightCursor.css('top',rightCursorTop);
            this.$box.append($LeftCursor);
            this.$box.append($RightCursor);
            this.$leftCursor=$('.leftCursor');
            this.$rightCursor=$('.rightCursor');
            this._leftCursorClick();
            this._rightCursorClick();
        },
        _olClick: function () {
            var self=this;
            this.oOl.click(function(){
                clearInterval(self.timer);
                clearTimeout(self.timer2);
                if(self.flag){
                    self.flag=!self.flag;
                    var iNext=$(this).index();
                    self.oOl.attr('class','');
                    $(this).attr('class','active');
                    if(iNext>self.iNow){
                        self.oUl.eq(iNext).css('left',self.liWidth);  //让图片都向一个方向走
                        self.oUl.eq(self.iNow).animate({'left': -self.liWidth},500);
                        self.oUl.eq(iNext).animate({'left':0},500,function(){
                            self.flag=!self.flag;
                            self.oUl.eq(self.iNow).css('left',self.liWidth);
                            self.iNow=iNext;
                        });
                    }else if(iNext<self.iNow){
                        self.oUl.eq(iNext).css('left',-self.liWidth); //让图片都向一个方向走
                        self.oUl.eq(self.iNow).animate({'left': self.liWidth},500);
                        self.oUl.eq(iNext).animate({'left':0},500,function(){
                            self.flag=!self.flag;
                            self.oUl.eq(self.iNow).css('left',self.liWidth);
                            self.iNow=iNext;
                        });
                    }else{
                        self.flag=true;   //在当前显示的图片对应的li上连续触发onmouseover事件时，必须将flag改为true，
                    }	//不然在其他li上触发onmouseover事件时由于flag是false，导致if(false){}里面的代码不能执行
                }
            })
        },

        _containerOver: function () {
            var self=this;
            this.$box.mouseover(function () {  //鼠标移入轮播时，清除自动轮播的定时器
                clearInterval(self.timer);
                clearTimeout(self.timer2);
            });
        },

        _containerOut: function () {
            var self=this;
            this.$box.mouseout(function () { //鼠标移除轮播时，开启自动轮播的定时器
                clearTimeout(self.timer2);
                self.timer2=setTimeout(function(){
                    self._autoPlay();
                },3000);
            });
        },

        _leftCursorClick: function () {
            var self=this;
            this.$leftCursor.click(function () { //点击左侧箭头的效果
                if(self.leftClickFlag){
                    self.leftClickFlag=!self.leftClickFlag;
                    clearInterval(self.timer);
                    clearTimeout(self.timer2);
                    self._doMove({status:2});
                }

            });
        },
        _rightCursorClick: function () {
            var self=this;
            this.$rightCursor.click(function () { //点击右侧箭头的效果
                if(self.rightClickFlag){
                    self.rightClickFlag=!self.rightClickFlag;
                    clearInterval(self.timer);
                    clearTimeout(self.timer2);
                    self._doMove({status:1});
                }
            });
        },
        _autoPlay: function () {
            var self=this;
            clearInterval(this.timer);
            this.timer=setInterval(function () {
                self._doMove({status:0});
            },self.options.autoSpeed);
        },

        _doMove: function (obj) {
            //status为0时，表示自动轮播的情况
            //status为1时，表示点击右侧箭头的情况
            //status为2时，表示点击左侧箭头的情况
            var self=this;
            var cNextNode;  //下一个要显示的图片节点
            var cNext;  //下一个要显示的图片节点的索引
            var oNowNode=self.oUl.eq(self.iNow);  //当前显示的图片节点
            if(obj.status==0||obj.status==1){  //自动轮播的拖拉方向和点击右边的箭头的拖拉方向是一致的：都是向左边运动
                cNext=self.iNow+1;  //下一个图片节点的索引为当前显示图片索引值加1
                if(cNext>self.oUl.length-1){ //判断索引边界情况
                    cNext=0;
                }
            }else if(obj.status==2){   //点击左边的的箭头时轮播的运动方向向右
                cNext=self.iNow-1; //下一个图片节点的索引为当前显示图片索引值减1
                if(cNext<0){  //判断索引边界情况
                    cNext=self.oUl.length-1;
                }
            }
            cNextNode=self.oUl.eq(cNext); //根据下一个图片的索引值获取下一个要显示的图片节点
            self.oOl.attr('class','');
            self.oOl.eq(cNext).attr('class','active');
            if(obj.status==0||obj.status==1){
                oNowNode.animate({'left': -self.liWidth},500);
            }else if(obj.status==2){
                oNowNode.animate({'left': self.liWidth},500);
                cNextNode.css('left',-self.liWidth);
            }
            cNextNode.animate({'left':0},500,function(){
                if(obj.status==1){
                    self.rightClickFlag=!self.rightClickFlag;
                }else if(obj.status==2){
                    self.leftClickFlag=!self.leftClickFlag;
                }
                oNowNode.css('left',self.liWidth);
                self.iNow=cNext;
            });
        },

        _drag: function () {
            var self=this;
            this.oUl.mousedown(function(ev) {
                /* Act on the event */
                var ev=ev || window.event;
                ev.preventDefault();
                ev.stopPropagation();
                var oNowNode=$(this);
                //console.log(oNowNode.attr('index'));
                var oLeft=$(this).position().left;
                //console.log('oLeft:',oLeft);
                var cPre=$(this).index()-1;
                var cNext=$(this).index()+1;
                if(cPre<0){
                    cPre=self.oUl.length-1;
                }
                if(cNext>self.oUl.length-1){
                    cNext=0;
                }
                //console.log('cPre:',cPre);
                //console.log('cNext:',cNext);
                var cPreNode=self.oUl.eq(cPre);
                var cNextNode=self.oUl.eq(cNext);
                var eX=ev.clientX;
                cPreNode.css('left',-self.liWidth);
                cNextNode.css('left',self.liWidth);

                $(document).mousemove(function(ev) {
                    /* Act on the event */
                    var ev=ev || window.event;
                    var eX2=ev.clientX;
                    var disX=eX2-eX;
                    var left=oLeft+disX;
                    var pleft=-self.liWidth+disX;
                    var nleft=self.liWidth+disX;
                    if(disX>self.liWidth){
                        move(ev);
                    }else if(disX<-self.liWidth){
                        move(ev);
                    }
                    oNowNode.css('left',left);
                    cPreNode.css('left',pleft);
                    cNextNode.css('left',nleft);
                });
                $(document).mouseup(function(ev){
                    var ev=ev || window.event;
                    move(ev);
                });
                function move(ev){
                    $(document).unbind(); //移除所有事件
                    var eX3=ev.clientX;
                    var disX=eX3-eX;
                    if(disX>0){  //右移
                        self.oOl.attr('class','');
                        self.oOl.eq(cPre).attr('class','active');
                        oNowNode.animate({'left': self.liWidth},500);
                        cPreNode.animate({'left': 0},500,function(){
                            oNowNode.css('left',self.liWidth);
                            cNextNode.css('left',self.liWidth);
                            self.iNow=cPre;
                        });
                    }else if(disX<0){ //左移
                        self.oOl.attr('class','');
                        self.oOl.eq(cNext).attr('class','active');
                        oNowNode.animate({'left': -self.liWidth},500);
                        cNextNode.animate({'left': 0},500,function(){
                            oNowNode.css('left',self.liWidth);
                            cPreNode.css('left',self.liWidth);
                            self.iNow=cNext;
                        });
                    }
                }

            });
        }


    };

    Carousel.constructor=Carousel; //修正Carousel函数的构造器指向
    $.fn.carousel= function (options) {
        this.each(function (index,element) {
            var params = $.extend({},options,{container: $(this)});
            return new Carousel(params);
        });

    }
})(jQuery);
