;(function($){
	//alert(1);
	var LightBox = function(settings){
		var self = this;
		this.settings={
			speed:500
		}
		//没传过来的话，就给一个空对象
		$.extend(this.settings,settings || {})
		//创建遮罩和弹出框
		this.popupMask = $('<div id="G-lightbox-mask">')
		this.popupWin = $('<div id="G-lightbox-poppup">')
		//保存body
		this.bodyNode = $(document.body)

		//渲染剩余的DOM，并且插入到BODY
		this.renderDOM();

		//渲染剩余的DOM，并且插入到BODY 将groupData中得到的数据在来操作此处
		this.renderDOM();
		this.picViewArea = this.popupWin.find("div.lightbox-pic-view")//图片预览区域
		this.popupPic = this.popupWin.find("img.lightbox-image")//图片
		this.picCaptionArea = this.popupWin.find("div.lightbox-pic-caption")//图片描述区域
		this.nextBtn = this.popupWin.find("span.lightbox-next-btn");
		this.prevBtn = this.popupWin.find("span.lightbox-prev-btn");
		this.captionText = this.popupWin.find("p.lightbox-pic-desc")
		this.currentIndex = this.popupWin.find("span.lightbox-of-index")
		this.closeBtn = this.popupWin.find("span.lightbox-close-btn")

		//准备开发事件委托，获取组数据
		this.groupName = null;
		this.groupData = [];

		this.bodyNode.delegate("*[data-role=lightbox]","click",function(e){
			//阻止事件冒泡
			e.stopPropagation();
			var currentGroupName = $(this).attr('data-group');
			if(currentGroupName != self.groupName){
				self.groupName = currentGroupName;
				//根据当前组名获取同一组数据
				self.getGroup();
				//alert(currentGroupName);
			}

			//初始化弹出部分
			self.initPopup($(this));	
		})
		//关闭弹出
		this.popupMask.click(function(){
			$(this).fadeOut();
			self.popupWin.fadeOut()
			self.clear = false;	
		})
		this.closeBtn.click(function(){
			self.popupMask.fadeOut()
			self.popupWin.fadeOut()
			self.clear = false;	
		})

		//绑定上下切换按钮
		//定义标识
		var flag = true;
		this.nextBtn.hover(function(){
			if(!$(this).hasClass("disabled") && self.groupData.length>1){
				console.log("next")
				$(this).addClass("lightbox-next-btn-show")
			}
		},function(){
			console.log($(this).hasClass("disabled"));
			if(!$(this).hasClass("disabled") && self.groupData.length>1){
				$(this).removeClass("lightbox-next-btn-show")
			}
		}).click(function(e){
			console.log("bs"+this.index);
			if(!$(this).hasClass("disabled") && self.flag){
				self.flag = false;
				e.stopPropagation()
				self.goto("next")
			}
		})

		this.prevBtn.hover(function(){
			if(!$(this).hasClass("disabled") && self.groupData.length>1){
				$(this).addClass("lightbox-prev-btn-show")

			}
		},function(){

			if(!$(this).hasClass("disabled") && self.groupData.length>1){

				$(this).removeClass("lightbox-prev-btn-show")

			}
		}).click(function(e){
			if(!$(this).hasClass("disabled") && self.flag){
				self.flag = false;
				e.stopPropagation()
				self.goto("prev")
			}
		})
		//绑定窗口调整事件
		var timer = null;
		//要把它设置在this上，否则弹框出来后会找不到这个变量
		this.clear = false;
		$(window).resize(function(){
			window.clearTimeout(timer)
			if(self.clear){
				timer=window.setTimeout(function(){
					self.loadPicSize(self.groupData[self.index].src)
				},500);	
			}	
		})
	};

	LightBox.prototype={
		goto:function(dir){
			if(dir === "next"){
				this.index++
				if(this.index >= this.groupData.length-1){
					//当小标等于3时会触发，但是为什么一定鼠标离开弹出框的区域后再次进入，会自己去掉disable类名呢
					console.log("next"+this.index);
					console.log("next2"+(this.groupData.length-1));
					this.nextBtn.addClass("disabled").removeClass("lightbox-next-btn-show")
					

				}

				if(this.index != 0 && this.index != this.groupData.length-1){
					this.nextBtn.removeClass("disabled")
				}
				var src = this.groupData[this.index].src;
				this.loadPicSize(src);
			}
			if(dir === "prev"){
				this.index--
				if(this.index <= 0){
					this.prevBtn.addClass("disabled").removeClass("lightbox-prev-btn-show")
				}
				if(this.index != this.groupData[this.index].length-1){
					this.nextBtn.removeClass("disabled")
				}
				var src = this.groupData[this.index].src
				this.loadPicSize(src)
			}
		},
		initPopup:function(currentObj){
			var self = this,
				sourceSrc = currentObj.attr("data-source"),
				currentId = currentObj.attr("data-id")
			this.showMaskAndPopup(sourceSrc,currentId);
		},
		showMaskAndPopup:function(sourceSrc,currentId){
			//console.log(sourceSrc)
			var self = this;
			this.popupPic.hide();
			this.picCaptionArea.hide()
			this.popupMask.fadeIn();

			var winWidth = $(window).width()
			var winHeight = $(window).height()

			this.picViewArea.css({
				width:winWidth/2,
				height:winHeight/2
			})
			this.popupWin.fadeIn()
			var viewHeight = winHeight/2 + 10;
			this.popupWin.css({
				width:winWidth/2 + 10,
				height:winHeight/2 + 10,
				marginLeft:-(winWidth/2+10)/2,
				top:-viewHeight
			}).animate({
				top:winHeight-viewHeight
			},self.settings.speed,function(){
				//加载图片
				self.loadPicSize(sourceSrc);
			})
			//根据当前点击的元素ID获取在当前组别里面的索引
			this.index = this.getIndexOf(currentId);
			//console.log(this.index);
			var groupDataLength = this.groupData.length;
			if(groupDataLength>1){
				if(this.index === 0){
					this.prevBtn.addClass("disabled");
					this.nextBtn.removeClass("disabled");
				}else if(this.index === groupDataLength-1){
					this.prevBtn.removeClass("disabled");
					this.nextBtn.addClass("disabled");
				}else{
					this.prevBtn.removeClass("disabled");
					this.nextBtn.removeClass("disabled");
				}
			}

		},
		loadPicSize:function(sourceSrc){
			//console.log(sourceSrc)
			var self=this;
			self.popupPic.css({width:"auto",height:"auto"}).hide()
			self.picCaptionArea.hide()
			this.preLoadImg(sourceSrc,function(){
				self.popupPic.attr("src",sourceSrc) 
				var picWidth = self.popupPic.width(),
					picHeight = self.popupPic.height()
					//console.log(picWidth+':'+picHeight)
					self.changePic(picWidth,picHeight)

			})
		},
		changePic:function(width,height){
			var self = this,
				winWidth = $(window).width(),
				winHeight = $(window).height();
				console.log("winHeight"+winHeight)
			//如图片的宽高大于浏览器视口的宽高比例，我就看一下是否有益处
			var scale = Math.min(winWidth/(width+10),winHeight/(height+10),1);
			console.log("scale"+scale)
			width = width*scale;
			height = height*scale;

			this.picViewArea.animate({
				width:width-10,
				height:height-10
			},self.settings.speed);
			this.popupWin.animate({
					width:width,
					height:height,
					marginLeft:-(width/2),
					top:(winHeight-height)/2
			},self.settings.speed,function(){
				self.popupPic.css({
					width:width-10,
					height:height-10
				}).fadeIn();
				self.picCaptionArea.fadeIn();
				self.flag = true;
				self.clear=true;
			})	

			//设置描述文字和当前索引
			console.log(this.index);
			//groupData
			this.captionText.text(this.groupData[this.index].caption);
			this.currentIndex.text("当前索引:"+(this.index+1)+"of"+this.groupData.length)
		},
		preLoadImg:function(src,callback){
			var img = new Image();
			if(!!window.ActiveXObject){
				img.onreadystatechange = function(){
					if(this.readyState == "complete"){
						callback();
					}
				}
			}else{
				img.onload=function(){
					callback();
				}
			}
			img.src = src;
		},
		getIndexOf:function(currentId){
			var index = 0;
			$(this.groupData).each(function(i){
				console.log(i);
				index=i;
				if(this.id === currentId){
					return false;
				}
			})
			return index;
		},
		getGroup:function(){
			var self = this;
			//根据当前的组别名称获取页面中所有相同自别的对象
			var groupList = this.bodyNode.find("*[data-group="+this.groupName+"]")
			//console.log(groupList)
			//清空数组数据
			self.groupData.length=0;
			groupList.each(function(){

				self.groupData.push({
					src:$(this).attr("data-source"),
					id:$(this).attr("data-id"),
					caption:$(this).attr("data-caption")
				})

			})
			console.log(self.groupData)
			
		},
		renderDOM:function(){
			var strDom = '<div class="lightbox-pic-view">'+
							'<span class="lightbox-btn lightbox-prev-btn"></span>'+
							'<img class="lightbox-image" src="img/1.jpg">'+
							'<span class="lightbox-btn lightbox-next-btn"></span>'+
						 '</div>'+
						 '<div class="lightbox-pic-caption">'+
							'<div class="lightbox-caption-area">'+
								'<p class="lightbox-pic-desc"></p>'+
								'<span class="lightbox-of-index">index：0 of 0</span>'+
							'</div>'+
							'<span class="lightbox-close-btn"></span>'+
						 '</div>';
			//插入到this.popupWin
			this.popupWin.html(strDom);		
			//把遮罩和弹出框插入到body
			this.bodyNode.append(this.popupMask,this.popupWin);	 
		
		}
		

	};
	window["LightBox"] = LightBox;

})(jQuery)
