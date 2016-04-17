(function($){
	$.wx.draw = {};
	
	$.wx.draw.ini = {
		master : null,		//父容器
		maxSpeed : 10,		//最大滚动速度
		speedTime : 1,		//时间速度
		slowestTime : 10,	//最慢时间速度 降速时候使用
		speed : 1,			//当前速度
		rate : 0.01,		//加速减速速率
		rateMin : 0.01,		//开始减速的时候 减速效率
		maxRunTime : 10000,	//最大执行时间 ms
		handle : [],		//执行句柄
		runType : 0,		//执行类型 0停止 1加速 -1 减速
		isRun : false,		//当前是否在运行
		docker : [],		//容器
		callback : null,	//回调函数
		complete : true,	//是否全部完成
	};
	$.wx.draw.config = {};
	
	//初始化容器对象
	$.wx.draw.init = function() {
		var config = this.config;
		config.master.find(".d2").each(function(key) {
			$(this).html() == "" && $(this).html($(this).siblings(".d1").html());
			config.docker[key] = $.extend({}, {
				maxSpeed : config.maxSpeed,		//最大速度
				speedTime : config.speedTime,	//时间速度
				slowestTime : config.slowestTime, //降速时最慢速度
				speed : config.speed,			//当前速度
				handle : 0,						//执行句柄
				runType : 0,					//执行类型 0停止 1加速 -1减速
				isRun : false,					//当然是否在执行
				complete : false,				//执行完成
				selected : 2,					//选中第几个 从0开始 0代表第一个
			});
		});
		
		this.start();
	}
	$.wx.draw.start = function() {
		var config = this.config
		config.master.find(".draw").each(function(key) {
			var $this = $(this)
			setTimeout(function(){
				config.docker[key].runType = 1;
				config.docker[key].isRun = true;
				config.docker[key].handle = setInterval(function() {
					if (config.docker[key].runType == 1) {
						$.wx.draw.run($this)
					}
				}, config.docker[key].speedTime);
			}, Math.random() * 1000);
		});
	}
	
	$.wx.draw.stop = function(runParam) {
		var $this = $.wx.draw;
		for (var i = 0; i < $this.config.docker.length; i++) {
			$this.readySlow(i);
		}
	}
	
	$.wx.draw.readySlow = function(_i) {
		setTimeout(function(){
			$.wx.draw.slowDown(_i);
		}, Math.random() * 3000);
	}
	
	//开始减速
	$.wx.draw.slowDown = function(_i) {
		var $this = $.wx.draw;
		var docker = $this.config.docker[_i]
		if (docker.speedTime > docker.slowestTime) {
			$this.prize(_i);
			return true;
		}
		docker.runType = -1;
		$this.run($this.config.master.find(".draw").eq(_i), true)
		docker.speedTime += $this.config.rateMin

		setTimeout(function(){
			$this.slowDown(_i)
		}, docker.speedTime)
	}
	
	$.wx.draw.run = function(drawSlide) {
		var $this = $.wx.draw;
		var docker = $this.config.docker[drawSlide.index()];
		switch (docker.runType) {
			case 1:
				if (docker.speed < docker.maxSpeed) {
					docker.speed += $this.config.rate
				}
				break;
			case -1:
				if (docker.speed > 1) {
					docker.speed -= $this.config.rate
				}
				if (docker.speed < 1) {
					docker.speed = 1;
				}
				break;
			default:
				return false;
		}
		
		if (drawSlide.find(".d2")[0].offsetTop - drawSlide[0].scrollTop <= 0) {
			drawSlide[0].scrollTop -= drawSlide.find(".d1")[0].offsetHeight;
		} else {
			drawSlide[0].scrollTop += docker.speed
		}
	}
	
	//设置中奖位置
	$.wx.draw.prize = function(_i) {
		var $this = $.wx.draw;
		var $config = $this.config;
		var height = $config.master.find(".d1").find("div").height();
		var scrollTop = $config.master.find(".draw").eq(_i)[0].scrollTop;
		
		var setDis = $config.docker[_i].selected * height;
		var distance = Math.abs(scrollTop - setDis);
		
		$config.docker[_i].speed = 1;
		
		if (distance < 1) {
			$config.docker[_i].complete = true;
			$config.docker[_i].isRun = false;
			$config.complete = true;
			for (var i = 0; i < $config.docker.length; i++) {
				if (!$config.docker[i].complete) {
					$config.complete = false;
				}
			}
			if ($config.complete && typeof $config.callback == "function") {
				$config.callback();
			}
			
			return true;
		}
		
		//大于1个像素的矫正
		setTimeout(function(){
			$this.run($config.master.find(".draw").eq(_i));
			$this.prize(_i)
		}, $config.docker[_i].speedTime);
	}

	$.wx.draw.setPrize = function(prize) {
		var $docker = $.wx.draw.config.docker;
		for (var i = 0; i < prize.length; i++) {
			$docker[i].selected = prize[i];
		}
	}
})(Zepto);


$.fn.draw = function(config, func) {
	if (typeof config == "function") {
		func = config;
		config = {};
	}
	
	$.wx.draw.ini = $.extend($.wx.draw.ini, config)
	$.wx.draw.config = $.extend({}, $.wx.draw.ini);
	$.wx.draw.config.master = this;
	$.wx.draw.config.callback = func;
	
	$.wx.draw.init();
	$.wx.draw.start();
	
	setTimeout($.wx.draw.stop, 13000)
}
