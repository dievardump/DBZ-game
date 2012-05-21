
		window.onload = function(){
			var game = document.getElementById('game');
			var fps  = document.getElementById('fps');
			var canv = document.getElementsByTagName('canvas')[0];
			var clearAll = document.getElementById('full-bg-clear');
			var ctx  = canv.getContext('2d');
			var size = { w:44, h:70, frames:8 }
			var bg   = new Image;
			bg.onload = function(){
				var sprite = new Image;
				var w = bg.width, h = bg.height;
				canv.width = w;
				canv.height = h;
				game.style.width = w+"px";
				ctx.drawImage(bg,0,0);
				sprite.onload = function(){
					var padding = 200;
					var sprites = [];
					for (var i=0;i<20;++i){
						var s = sprites[i] = {
							x : Math.random() * (w-padding) + padding/2,
							y : Math.random() * (h-padding) + padding/2,
							f : Math.round( Math.random() * 3 )
						};
					}

					var avgDelay = 0, lastDraw = new Date;
					var drawFrame = function(){
						if (clearAll.checked){
							ctx.drawImage(bg,0,0);
						}else{
							// Clear sprite locations
							for (var i=0,len=sprites.length;i<len;++i){
								var s = sprites[i];
								ctx.drawImage( bg, s.x, s.y, size.w, size.h, s.x, s.y, size.w, size.h );
							}
						}
						
						// Draw sprites
						for (var i=0,len=sprites.length;i<len;++i){
							var s = sprites[i];
							s.x += Math.random() * 4 - 2;
							s.y += Math.random() * 4 - 2;
							if (s.x+size.w >= w) s.x -= 10;
							if (s.y+size.h >= h) s.y -= 10;
							var offset = (s.f++ % size.frames)*size.w;
							ctx.drawImage(sprite, offset, 0, size.w, size.h, s.x, s.y, size.w, size.h );
						}
						var now = new Date;
						var delay = now - lastDraw;
						avgDelay += (delay - avgDelay) / 10;
						lastDraw = now;
						setTimeout(drawFrame,0);
					};
					drawFrame();
					setInterval(function(){
						fps.innerHTML = (1000/avgDelay).toFixed(1) + " fps";
					},2000);
					
				};
				sprite.src = 'walking-girl2.png';
			};
			bg.src = 'http://phrogz.net/images/other/deskpics/ColdColdVolcano.jpg';
		};
	