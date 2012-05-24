(function() {	

        var FPSDebugger = new Class({
            Implements : [Die.core.options],
            
            options : {
                fpsFilter : 50,
                refresh : 1000
            },
            
            fps : 0,
            now : 0,
            lastUpdate : (new Date)*1 - 1,
            
            init : function(output, options) {
                this.setOptions(options);
                
                if (!output) {return ;}
               
                this.output = output;
                
                var self = this;
                setInterval(function(){
                    self.output.innerHTML = self.fps.toFixed(1) + "fps";
                }, this.options.refresh); 
            },
            
            update : function() {
                var thisFrameFPS = 1000 / ((this.now=new Date) - this.lastUpdate);
                this.fps += (thisFrameFPS - this.fps) / this.options.fpsFilter;
                this.lastUpdate = this.now;
            }
        });
        
        var oFPS = new FPSDebugger(document.getElementById('fps-output'));


		// configuration
		var config = {};
		(function(config) {
            // keys configuration - could be saved for each profil if accounts come
            config.key = {
                'up' : 'up',
                'right' : 'right',
                'left' : 'left',
                'punch' : 'a',
                'kick' : 'z',
                'highkick' : 'e',
                'fireball' : 'q',
                'block' : 's'
            };

            config.keyCode = { };
            config.keyCode.codes = {
                '38': 'up', '40': 'down', '37': 'left', '39': 'right',
                '27': 'esc', '32': 'space', '8': 'backspace', '9': 'tab',
                '46': 'delete', '13': 'enter'
            };

            config.keyCode.getKey = function(key) {
                return config.keyCode.codes[key] ? config.keyCode.codes[key] : String.fromCharCode(key).toLowerCase();
            }

            // sprites configuration
            config.sprites = {
                wait : {
                    x : 82,
                    y : 0
                },
                forward : {
                    x : 164,
                    y : 0
                },
                backward : {
                    x : 246,
                    y : 0
                },
                up : {
                    x : 328,
                    y : 0
                },
                punch : {
                    x : 0,
                    y : 102
                },
                kick : {
                    x : 82,
                    y : 102
                },
                highkick : {
                    x : 164,
                    y : 102
                },
                punchvert : {
                    x : 246,
                    y : 102
                },
                highkickvert : {
                    x : 328,
                    y : 102
                },
                kickvert : {
                    x : 328,
                    y : 102
                },
                fireball : {
                    x : 246,
                    y : 306
                },
                block : {
                    x : 328,
                    y : 204
                },
                special : {
                    fireball : {
                        blue : {
                            x : 0,
                            y : 258
                        },
                        purple : {
                            x : 32,
                            y : 258
                        }
                    },
                    shadow : {
                        x : 228,
                        y : 258
                    }
                    
                }

            };

            // fps
            config.fps = 1000/30;

            // power used by actions
            config.power = {
                fireball : 25
            };

            // times
            config.times = {
                action : 200,
                jump : 600,
                moveaction : 400,
                fireballaction : 100,
                fireballmovement : 1000
            };

            // if we use canvas to render or not
            config.canvas = true;

            // images used
            config.images = {
                data : {
                    special : {
                        src : 'assets/img/sprites/special.png',
                        width : 328,
                        height : 282
                    },
                    goku : {
                        src : 'assets/img/sprites/characters/goku.png',
                        width : 410,
                        height : 408
                    },
                    a18 : {
                        src : 'assets/img/sprites/characters/a18.png',
                        width : 410,
                        height : 408
                    }
                },
                element : {}
            };

            //config sizes
            config.size = {
                character : {
                    x : 82,
                    y : 102
                },
                shadow : {
                    x : 80,
                    y : 10
                },
                fireball : {
                    x : 32,
                    y : 24
                }
            }

            // blocking action
            config.block = {
                block : true
            }

            /*for(var key in config.images.data) {
                (function(key) {
                    var img = new Image();
                    img.onload = function() {
                        config.images.element[key] = img;
                    }
                    img.src = config.images.data[key].src;
                })(key);
            }*/
        })(config);
        
        
	/**
     * DrawManager class
     * Used to manage the drawing iterations
     **/
	var DrawManager = new Class({
		init : function(canvas, ctx) {

			// shapes to draw
			this.shapes = [];

			this.shapeslength = 0;

			this.canvas = canvas;
			this.ctx = ctx;
		},


		start : function() {
			this.iterate();
		},


		/**
         * Function called at every iteration
         */
		iterate : function() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			var shapes = [], remove = [];
			for(var i=0, l = this.shapeslength; i < l; i++) {
				shapes = this.shapes[i];
				if (!shapes) {continue;}

				for(var j = 0, length = shapes.length; j < length; j++) {
					shapes[j].iterate();
                    if (shapes[j].ephemeral && shapes[j].endOfLife()) {
                        remove.push({shape : shapes[j], deep : i});
                    }
				}
			}
			
            var self = this;
            remove.forEach(function(object) {
                self.remove(object.shape, object.deep);
            });
            
			//Debug fps
			oFPS.update();

			var that = this;
			window.setTimeout(function() { that.iterate(); }, 10);
		},

		/**
         * Function to add a shape to draw
         * @param shape (Object) - Shape to add
         * @param deep (integer) - deep of the shape (used when drawing)
         */
		add : function(shape, deep) {
			if (!deep) {
				deep = 1;
			}
			
			if (!this.shapes[deep]) {
				this.shapes[deep] = [];
			}

			if (!~this.shapes[deep].indexOf(shape)) {
				this.shapes[deep].push(shape);
			}

			this.shapeslength = this.shapes.length;
			return this;

		},

		/**
         * Function to remove a shape to draw
         * @param shape (Object) - Shape to add
         * @param deep (integer) - deep of the shape (used when drawing)
         */  
		remove : function(shape, deep) {
			if (!deep) {
				deep = 1;
			}
			if (!this.shapes[deep]) {
				return this;
			}

			var index = this.shapes[deep].indexOf(shape);
			if (~index) {
				this.shapes[deep].splice(index, 1);
			}

			this.shapeslength = this.shapes.length;
			return this;
		}

	});
	
	
	/**
     * Vector representation
     **/
	var Vector = (function() {
		function norm(value) {
			return value > 0 ? 1 : value < 0 ? -1 : 0;
		};

		return new Class({
			init : function(x, y) {
				this.x = x;
				this.y = y;
			},

			add: function(other) {
				return new Vector(this.x1 + other.x1, this.x2 + other.x2);
			},
			scale: function(by) {
				return new Vector(this.x1 * by, this.x2 * by);
			},
			normalize: function() {
				return new Vector(norm(this.x1), norm(this.x2));
			}
		});
	})();

	/**
     * DBZ Game class
     * Manage the characters and the drawing
     */
	var DBZ = new Class({
        Implements : [Die.core.options],
        
		currentPlayer : null,
		characters : [],
        factories : {
            special : null
        },
		
		init : function(inject, options) {
			
			this.drawer = inject.drawer;
			this.stage = inject.stage;
			this.players = inject.players;
            this.factories = inject.factories;
			this.currentPlayer = inject.currentPlayer;
			
			this.setOptions(options);
			
			this.createCharacters();
            
			this.drawer.start();
		},
		
		createCharacters : function() {
			// create the characters according to the players specifications
			var i = 0,
				len = this.players.length,
				oCharacter = null,
				oPlayer = null,
				inject = {},
				options = {},
				iStageSize = this.stage.width,
				iQuart = iStageSize/4;
            
			while(i < len) {
				
				oPlayer = this.players[i];
				
				inject = {
					drawer : this.drawer,
                    factories : {
                        special : this.factories.special
                    }
				};
				
				options = {
					img : oPlayer.options.img,
					move : {
						max : {
							x : iStageSize - config.size.character.x
						}
					}
				};

				if ( i == 1 ) {
					options.move.from = {
						x : 3*iQuart - config.size.character.x / 2
					};
				} else {
					options.move.from = {
						x : iQuart - config.size.character.x / 2
					};
				}
				
				options.move.from.y = this.stage.height - config.size.character.y - 25;
				options.move.to = {y : options.move.from.y - 140};
				
				// create the character
				oCharacter = new DBZCharacter(inject, options);
				if ( i == 1 ) {
					oCharacter.changePosition();
				}
				
				// add the character to the current character collection
				this.characters.push(oCharacter);
				this.drawer.add(oCharacter);
				
				// if it's the current player character, add listeners
				if (oPlayer.id === this.currentPlayer.id) {
					this.listenTo(oCharacter);
				}
				
				i++;
			}
				
		},
		
		/**
         * Add listeners to a character
         * use to listen on specific actions, movements...
         */
		listenTo : function(oCharacter) {
			//@TODO : Add listeners on the current player character
			//@TODO : Send handled events to the Server Game Process
			// Keyboard events handler
			var keyhandler = window,
				keypressed = {};
				
			oCharacter.keypressed = keypressed;

			// if IE add an invisible layer to handle key events instead of handle it on window
			/*if ( Browser.ie )
			{
				keyhandler = new Element('input', {'id' : 'keyhandler'});
				$$('body').grab(keyhandler);
				stage.addEvent('click', function() {keyhandler.focus();});
				stage.fireEvent("click");
			}*/

			// when a key is up
			keyhandler.addEventListener('keyup',
				function(e) {
                    
					var key = Die.object.keyOf(config.key, config.keyCode.getKey(e.keyCode));
					// if this key was registered as pressed
					if ( key != null && typeof keypressed[key] !== 'undefined')
					{
                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }
						// unregister key pressed
						keypressed[key] = null;
						delete keypressed[key];

						// if there is timers associated to this key on the current character
						if ( oCharacter.timers.keyUp[key] )
						{
							// clear the timer
							if ( oCharacter.timers.keyUp[key].timer ) {
								clearTimeout(oCharacter.timers.keyUp[key].timer);
							}
							// if a stop function is associated to this timer key
							if ( typeof oCharacter.timers.keyUp[key].stop === 'function' ) {
								oCharacter.timers.keyUp[key].stop();
							}

							oCharacter.timers.keyUp[key] = null;
							delete oCharacter.timers.keyUp[key];
                            
						}
                        return false;
					}
				}, true
			);
            
            
            
            
			// handle keydown events
			keyhandler.addEventListener('keydown',
				function(e) {
					var key = Die.object.keyOf(config.key, config.keyCode.getKey(e.keyCode));
					// if this is a key we listen
					if ( key != null ) {
                        if (e.stopPropagation) {
                            e.stopPropagation();
                        }
						// register as pressed key
						keypressed[key] = true;
						switch(key)
						{
							case 'up': // special case because you also can go upleft and upright
								if ( keypressed['left'] ) { // check if you already go left
									oCharacter.process('upleft'); // process upleft
								} else if ( keypressed['right'] ) { // check if you already go right
									oCharacter.process('upright'); // process upright
								} else { // if it's only up
									oCharacter.process(key); // process up
								}
								break;
							case 'right': // special case because you also can go upright
								if ( keypressed['up'] ) { // check if you already go right
									oCharacter.process('upright');
								} else {
									oCharacter.process(key);
								}
								break;
							case 'left': // special case because you also can go upleft
								if ( keypressed['up'] ) { // check if you already go left
									oCharacter.process('upleft');
								} else {
									oCharacter.process(key);
								}
								break;
							case 'punch':
								oCharacter.process(key);
								break;
							case 'kick':
								oCharacter.process(key);
								break;
							case 'highkick':
								oCharacter.process(key);
								break;
							case 'fireball':
								oCharacter.process(key);
								break;
							case 'block':
								oCharacter.process(key);
								break;
						}
                        return false;
					}
				}, true
			);
		}
	});
	
	
	
    /**
     * Sprite Class
     *
     */
    var Sprite = new Class({
        Implements : [Die.core.options],
        
        img : {
            
        },
        
        buffer : {
            
        },
        
        mirror : false,
         
        init : function(options) {
            this.setOptions(options);
            
            this.buffer.canvas = window.document.createElement('canvas');
            
			this.buffer.canvas.width = this.options.img.width;
			this.buffer.canvas.height = this.options.img.height;
            
            
			this.buffer.context = this.buffer.canvas.getContext('2d');
            
		  // window.document.body.appendChild(this.buffer.canvas);
			var img = this.img = new Image(), 
                self = this;
			this.img.onload = function() {
                self.drawSprite();
			};
			this.img.src = this.options.img.src;
            
        },
        
        drawSprite : function(way) {
            
            this.buffer.context.clearRect(0, 0,this.buffer.canvas.width, this.buffer.canvas.height) ;
            
            this.buffer.context.save();
            if (this.mirror) {
                // mirror effect on buffer
                this.buffer.context.translate(this.buffer.canvas.width, 0);
                this.buffer.context.scale(-1, 1);
            }
            this.buffer.context.drawImage(this.img, 0, 0);
            this.buffer.context.restore();
        },
        
        reflect : function() {
            this.mirror = !this.mirror;
        }
        
    });
    
    
	/**
     * DBZ Characters class
     * Respresent a Character on the stage
     */
	var DBZCharacter = new Class({
        
        Extends : Sprite,
        
		ctx : null,
		drawer : null,
		
		options : {
			move : {
				to : {
					x : 10,
					y : 140
				},
				from : {
					x : 0,
					y : 1,
					stage : 'left'
				}
			},
			fps : 1000/50,
			color : 'blue'
		},
		
		// timers which can be cleared with some actions
		timers : {
			keyUp : {}
		},

		// my sprite position
		image : {
			x : -1,
			y : -1
		},

		// differents sizes and positions ( layer, character... )
		sizes : {},
		positions : {},


		// my current direction
		dir : {
			x : 0,
			y : 0
		},

		// my current position
		pos : {
			x : 0,
			y : 0
		},

		// my power
		power : 1000,

		// my current action
		action : '',
		
		init : function(inject, options) {
            
			this.drawer = inject.drawer;
			this.ctx = this.drawer.ctx;
			
			this.factories = inject.factories;
			this._super(options);
			
			
			this.sizes.stage = {
				x : this.drawer.canvas.width,
				y : this.drawer.canvas.height
			};
			this.pos = Die.object.clone(this.options.move.from);
            
            this.initShadow();
            
           // document.body.appendChild(this.buffer.canvas);
		},
		
		iterate : function() {
            
             if ( 
                (this.pos.x > this.options.move.max.x/2 && this.pos.stage == 'left')
                || (this.pos.x < this.options.move.max.x/2 && this.pos.stage == 'right')
            ) {

                this.changePosition();
            }
                            
			this.draw();
		},
		
		draw : function() {
			
			// get current image on the sprite coords
			var pos = this.getSpritePosition();
			this.image = pos;
			
		   // this.ctx.save();
			// draw buffer image at the current image sprite place onto global context
			this.ctx.drawImage(this.buffer.canvas, this.image.x, this.image.y, config.size.character.x, config.size.character.y, this.pos.x, this.pos.y, config.size.character.x, config.size.character.y);
		   // this.ctx.restore();
		},
		
		getSpritePosition : function() {
			// waiting is the default action
			var pos = config.sprites.wait;
			
			if ( this.dir.y != 0 ) { // if we are jumping
				pos = config.sprites.up;
			} else if ( this.dir.x > 0 ) { // if we are moving to the right of the stage
				if ( this.pos.stage == 'right' ) { // if we are the left character, we are moving backward
					pos = config.sprites.backward;
				} else { // else we are moving forward
					pos = config.sprites.forward;
				}
			} else if ( this.dir.x < 0 ) {// if we are moving to the left of the stage
				if ( this.pos.stage == 'right' ) {// if we are the right character, we are moving forward
					pos = config.sprites.forward;
				} else {// if we are the right character, we are moving backward
					pos = config.sprites.backward;
				}
			}
			
			if ( this.action != '' ) { // if we have a current action performing (kick or block)
				var sAction = this.action;
				if ( this.dir.y != 0 && config.sprites[sAction + 'vert']) { // if we are moving up, it's a vertical action
					sAction = sAction + 'vert';
				}
				
				// if the current action has a sprite, set current position
				if ( config.sprites[sAction] ) {
					pos = config.sprites[sAction];
				}
			}
			
			// clone values in order to not modify the config.sprite
			var res = {x : pos.x, y : pos.y};
			if (this.pos.stage == 'right') {
				res.x = this.buffer.canvas.width - (res.x + config.size.character.x);
			}
			return res;
		},
		
		changePosition : function() {
			if ( this.pos.stage == 'right') {
				this.pos.stage = 'left';
			} else {
				this.pos.stage = 'right';
			}
            
            this.reflect();
            this.drawSprite();
		},
		
		process : function() {
			if ( arguments.length ) {
				var args = Array.prototype.slice.call(arguments, 1);
				if ( !args.length ) {
					args = [];
				}
				if ( DBZCharacter.Tweeners[arguments[0]] ) {
					DBZCharacter.Tweeners[arguments[0]].apply(this, args);
				}
			}
		},
        
        getFireball : function() {
            var oFireBall = this.factories.special.getFireball(this);
            this.drawer.add(oFireBall, 2);
            return oFireBall;
        },
        
        initShadow : function() {
            var oShadow = this.factories.special.getShadow(this);
            this.drawer.add(oShadow, 1);
        }
	});

    /**
     * Special Sprite representation
     * Instance will be injected in every object that use the special sprite
     * (DBZFireBall, DBZCharacterShadow...)
     */
    var DBZSpecial = new Class({
        
        Extends : Sprite,
        
        init : function(options) {
            this._super(options);
        }
    });
    
    
    /**
     * DBZSpecialFactory
     * Used to create object using the Special sprites
     */
    var DBZSpecialFactory = new Class({
        
        sprite : null,
        
        init : function(inject) {
            this.sprite = inject.sprite;
        },
        
        getFireball : function(character) {
            
            var inject = {
                sprite : this.sprite,
                character : character
            };
            
            return new DBZFireball(inject);
        },
        
        getShadow : function(character) {
            var inject = {
                sprite : this.sprite,
                character : character
            };
            return new DBZCharacterShadow(inject);
        }
    });
    
    
    /**
     * DBZFireBall 
     * Fireball representation
     */
    var DBZFireball = new Class({
        
        sprite : null,
        character : null,
        color : '',
        ephemeral : true,
        
        pos : {
            x : 0,
            y : 0
        },
        
        init : function(inject) {
            this.character = inject.character;
            this.sprite = inject.sprite;
            
            this.drawer = this.character.drawer;
			this.ctx = this.drawer.ctx;
            
            
            this.color = this.character.options.color;
            this.position = this.character.pos.stage;
            
            // set position
            this.pos.x = this.character.pos.x;
            if (this.position == 'left') {
                this.pos.x += config.size.character.x;
            } else {
                this.pos.x -= config.size.fireball.x;
            }
            
            this.pos.y = this.character.pos.y;
            this.pos.y += config.size.character.y/3;

//                this.sprite.buffer.context.translate(this.sprite.buffer.canvas.width, 0);
//                this.sprite.buffer.context.scale(-1, 1);
        },
        
        endOfLife : function() {
            return (this.pos.x > this.drawer.canvas.width || this.pos.x < 0);
        },
        
        iterate : function() {
            
            if ( this.position == 'right') {
                this.sprite.reflect(); // reflect
                this.sprite.drawSprite();
                this.draw();
                this.sprite.reflect(); // undo reflect
                this.sprite.drawSprite();
			} else {
                this.draw();
            }
        },
        
        draw : function() {
			
			// get current image on the sprite coords
			var pos = this.getSpritePosition();
			
			// draw buffer image at the current image sprite place onto global context
			this.ctx.drawImage(this.sprite.buffer.canvas, pos.x, pos.y, config.size.fireball.x, config.size.fireball.y, this.pos.x, this.pos.y, config.size.fireball.x, config.size.fireball.y);
		},
        
        getSpritePosition : function() {
			var res =  {
                x : config.sprites.special.fireball[this.color].x,
				y : config.sprites.special.fireball[this.color].y
            };
            
            if (this.position == 'right') {
				res.x = this.sprite.buffer.canvas.width - (res.x+config.size.fireball.x);
			}
            
            return res;
		}
    });
    
    
    /**
     * DBZCharacterShadow
     * Character Shadow representation
     */
    var DBZCharacterShadow = new Class({
        
        sprite : null,
        character : null,
        
        pos : {
            x : 0,
            y : 0
        },
        
        init : function(inject) {
            this.sprite = inject.sprite;
            this.character = inject.character;
            
            this.drawer = this.character.drawer;
			this.ctx = this.drawer.ctx;
            
            
            this.color = this.character.options.color;
            
            // set position
            this.pos.x = this.character.pos.x;
            this.pos.y = this.character.pos.y + config.size.character.y - 10;

        },
        
        iterate : function() {
            this.pos.x = this.character.pos.x;
            this.draw();
        },
        
        draw : function() {
			
			// get current image on the sprite coords
			var pos = this.getSpritePosition();
			
            this.ctx.globalAlpha = 0.3;
			// draw buffer image at the current image sprite place onto global context
			this.ctx.drawImage(this.sprite.buffer.canvas, pos.x, pos.y, config.size.shadow.x, config.size.shadow.y, this.pos.x, this.pos.y, config.size.shadow.x, config.size.shadow.y);
            this.ctx.globalAlpha = 1;
		   // this.ctx.restore();
		},
        getSpritePosition : function() {
			return {
                x : config.sprites.special.shadow.x,
				y : config.sprites.special.shadow.y
            }
		}
    });
    
	var ShapeTween = new Class({
        Implements : [Die.animation.tween],
        
        init : function(element, options) {
            this.element = element;
            this.setOptions(options);
        },
        
        animate : function(prop, from, to) {
            this.property = prop;
            if (typeof to === 'undefined') {
                to = from;
                from = this.element.pos[this.property];
            }
            this._super(from, to);
        },
        
        render : function() {
            var value = this._super.apply(this, arguments);
            this.element.pos[this.property] = value;
        }
    });
    
	DBZCharacter.Tweeners = {
		up : function() {
			var self = this;
			if ( !self.dir.y && !self.dir.x && !config.block[self.action]) {
				self.dir.y = 1;
				
                var oTweenUp = new ShapeTween(self, {duration : config.times.jump/2});
                oTweenUp.chain(function() { // when jump is done, get down
                    
                    self.dir.y = -1;
                    
                    var oTweenDown = new ShapeTween(self, {duration : config.times.jump/2});
                    oTweenDown.chain(function() { // when get back to the floor
                        
                        self.dir.y = 0;
                        self.action = '';
                        
                    }).animate('y', self.options.move.from.y); // down
                }).animate('y', self.options.move.to.y); // jump
			}
		},
		left : function(to) {
			var self = this;
			if ( !self.dir.x && !self.dir.y && !config.block[self.action]) {
				self.dir.x = -1;
               
				//move
				var fMove = function() {
					if ( self.keypressed['left'] ) {
						if ( self.pos.x > 0 ) {
							if ( !to ) {
								to = self.pos.x - self.options.move.to.x;
							}
							if ( to < 0 ) {
								to = 0;
							}

							self.pos.x = to;
							to = 0;
						}
						// @TODO : tell stage we try to move to left
						self.timers.keyUp['left'] = {
							timer : setTimeout(arguments.callee, self.options.fps),
							stop : fStopMove
						};
					}
					else {
						clearTimeout(self.timers.keyUp['left'].timer);
						self.timers.keyUp['left'].stop();
						delete self.timers.keyUp['left'];
					}
				};
				var fStopMove = function() {
					self.dir.x = 0;
				};
                
				fMove();
			}
		},

		right : function(to) {
			var self = this;
			if ( !self.dir.x && !self.dir.y && !config.block[self.action]) {
				self.dir.x = 1;
                
				var fMove = function() {
					if ( self.keypressed['right'] ) {
						if ( self.pos.x < self.options.move.max.x ) {
							if ( !to ) {
								to = self.pos.x + self.options.move.to.x;
                            }
							if ( to > self.options.move.max.x ) {
								to = self.options.move.max.x;
                            }

							self.pos.x = to;
							to = 0;
						}
						// @TODO : tell stage we try to move to right
						self.timers.keyUp['right'] = {
							timer : setTimeout(arguments.callee, self.options.fps),
							stop : fStopMove
						};
					}
					else {
						clearTimeout(self.timers.keyUp['right'].timer);
						self.timers.keyUp['right'].stop();
						delete self.timers.keyUp['right'];
					}
				};
				var fStopMove = function() {
					self.dir.x = 0;
				};
				fMove();
			}
		},
		upleft : function() {
			this.process('updir', -this.options.move.to.x);
		},
		upright : function() {
			this.process('updir', +this.options.move.to.x);
		},
		updir : function(to) {
			var self = this;
			if ( !self.dir.y && !config.block[self.action]) {
				var sDir = 'right';
				if ( to < 0 )
					sDir = 'left';

				// clear left/right movement
				if ( this.timers.keyUp[sDir] ) {
					if ( this.timers.keyUp[sDir].timer ) {
						clearTimeout(this.timers.keyUp[sDir].timer);
                    }
					if ( this.timers.keyUp[sDir].stop ) {
						this.timers.keyUp[sDir].stop();
                    }
					delete this.timers.keyUp[sDir];
				}

				// morph element
				self.process('up');
				if ( to > 0 ) {
					self.dir.x = 1;
                } else {
					self.dir.x = -1;
                }

				to = to * 15 + self.pos.x;
				if ( to < 0 ) {
					to = 0;
                } else if ( to > self.options.move.max.x ) {
					to = self.options.move.max.x;
                }
				
                new ShapeTween(self, {
                    duration : config.times.jump,
                    transition : Die.animation.transitions.Sine
                }).chain(function() { 
                    self.dir.x = 0;
                    self.pos.x = to;
                }).animate('x', to);
			}
		},
        
		punch : function() {
			if ( this.action == '' ) {
				var self = this;
				this.action = 'punch';
				var iTime = config.times.action;
				if ( this.dir.y != 0 )
					iTime = config.times.moveaction;
				setTimeout(function() {
                    self.action = '';
                }, iTime);
			}
		},
		kick : function() {
			if ( this.action == '' ) {
				var self = this;
				this.action = 'kick';
				var iTime = config.times.action;
				if ( this.dir.y != 0 ) {
					iTime = config.times.moveaction;
                }
				setTimeout(function() {
                    self.action = '';
                }, iTime);
			}
		},
		highkick : function() {
			if ( this.action == '' ) {
				var self = this;
				self.action = 'highkick';
				var iTime = config.times.action;
				if ( self.dir.y != 0 ) {
					iTime = config.times.moveaction;
                }
				setTimeout(function() {
                    self.action = '';
                }, iTime);
			}
		},
		fireball : function() {
			if ( this.action == '' ) {
				if ( this.power >= config.power.fireball ) {
					this.power -= config.power.fireball;
					this.action = 'fireball';

					// create fireball element
					var iTime = config.times.fireballaction,
						sPos = this.pos.stage,
						iTo = this.sizes.stage.x + config.size.fireball.x,
                        oFireBall = this.getFireball();
                        
					// change fireball destination
					if ( sPos == 'right')
						iTo *= -1;

					// tween fireball
                    new ShapeTween(oFireBall, {
                        duration : config.times.fireballmovement,
                        transition : Die.animation.transitions.Quad.easeOut
                    }).animate('x', this.pos.x + iTo);
				}

				// draw
				var self=this;
				setTimeout(function() {
                    self.action = '';
                }, iTime);
			}
		},
		block : function() {
			if ( this.action == '' && this.dir.y == 0 && this.dir.x == 0) {
				var self = this;
				self.action = 'block';
				var iTime = config.times.action;
				var checkBlock = function() {
					if ( !self.keypressed['block'] ) {
						setTimeout(
							function() {
                                self.action = '';
							}, iTime
						);
					}
					else
						setTimeout(arguments.callee, config.fps);
				}
				checkBlock();
			}
		}
	};
	
	
	/**
     * Player class
     */
	var Player = new Class({
        
        Implements: [Die.core.options],
        
		id : null,
		
		init : function(id, options) {
			this.id = id;
			this.setOptions(options);
		}
	});
    
	// initialize game
	var canvas = document.getElementById('dbz'),
		context = canvas.getContext('2d'),
    
		oCurrentPlayer = new Player('dievardump_id', {img : config.images.data.goku}),
		oOtherPlayer = new Player('otherplayer_id', {img : config.images.data.a18}),
		drawer = new DrawManager(canvas, context),
        
        oSpecial = new DBZSpecial({img : config.images.data.special}),
        
        oSpecialFactory = new DBZSpecialFactory({sprite : oSpecial}),
        
		inject = {
			//players : [oCurrentPlayer],
			players : [oCurrentPlayer, oOtherPlayer],
			currentPlayer : oOtherPlayer,
			drawer : drawer,
			stage : canvas,
            factories : {
                special : oSpecialFactory
            }
		},
		options = {
			
		};
        
	var oGame = new DBZ(inject, options);
    
   })();