(function($){
	$.wx.draw = {};
	
	$.wx.draw.ini = {
		master : null,		//父容器
		objectNumber : 0,	//当前滚动对象数量
		maxSpeed : 10,		//最大滚动速度
		speedTime : 1,		//时间速度
		slowestTime : 10,	//最慢时间速度 降速时候使用
		speed : 1,			//当前速度
		rate : 0.01,		//加速减速速率
		rateMin : 0.01,		//开始减速的时候 减速效率
		maxRunTime : 10000,	//最大执行时间 ms
		handle : null,		//执行句柄
		runType : 0,		//执行类型 0停止 1加速 -1 减速
		isRun : false,		//当前是否在运行
		docker : [],		//容器
	};
	$.wx.draw.config = {};
	$.wx.draw.init = function() {
		this.config.objectNumber = this.config.master.find(".draw").length;
	}
	$.wx.draw.start = function() {
		var config = this.config
		config.master.find(".d2").each(function(){
			$(this).html() == "" && $(this).html($(this).siblings(".d1").html());
		});
		config.runType = 1;
		//config.handle = setInterval(this.run, config.speedTime);
		
/*		for (var i = 0; i < config.objectNumber; i++) {
			setTimeout(function(){
				setInterval(function(){
					$.wx.draw.run(config.master.find(".draw").eq(1))
				}, config.speedTime);
			}, Math.random() * 1000);
		}
		*/
		config.master.find(".draw").each(function(key) {
			var $this = $(this)
			setTimeout(function(){
				config.docker[key] = setInterval(function(){
					$.wx.draw.run($this)
				}, config.speedTime);
			}, Math.random() * 1000);
		});
	}
	
	$.wx.draw.stop = function() {
		var $this = $.wx.draw;
		if ($this.config.handle != null) {
			clearInterval($this.config.handle);
		}
		
		for (var i = 0; i < $this.config.docker.length; i++) {
			setTimeout(function(_i){
				clearInterval($this.config.docker[_i])
			}(i), Math.random() * 2000);
		}
		return;
		//完全停止
		if ($this.config.speedTime > $this.config.slowestTime) {
			return false;
		}
		$this.config.runType = -1;
		$this.run()
		
		$this.config.speedTime += $this.config.rateMin
		setTimeout($this.stop, $this.config.speedTime)
	}
	
	$.wx.draw.run = function(drawSlide) {
		var $this = $.wx.draw;
		
		switch ($this.config.runType) {
			case 1:
				if ($this.config.speed < $this.config.maxSpeed) {
					$this.config.speed += $this.config.rate
				}
				break;
			case -1:
				if ($this.config.speed > 1) {
					$this.config.speed -= $this.config.rate
				}
				break;
			default:
				return false;
		}
		
		if (drawSlide.find(".d2")[0].offsetTop - drawSlide[0].scrollTop <= 0) {
			drawSlide[0].scrollTop -= drawSlide.find(".d1")[0].offsetHeight;
		} else {
			drawSlide[0].scrollTop += $this.config.speed
		}
		//})
	}
	
})(Zepto);


$.fn.draw = function(config) {
	$.wx.draw.ini = $.extend($.wx.draw.ini, config)
	$.wx.draw.config = $.extend({}, $.wx.draw.ini);
	$.wx.draw.config.master = this;
	$.wx.draw.init();
	$.wx.draw.start();
	
	setTimeout($.wx.draw.stop, 3000)
}