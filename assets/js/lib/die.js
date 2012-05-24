/*!
 * DieVarDump website
 * Javascript main file
 *
 * @author Simon FREMAUX <simon.fremaux@gmail.com>
 */
(function() {
    /**
     * Class implemetation
     * Inspired by the MooTools' and John Resig's Class implementation
     */
    this.Class = function (imp) {
        var klass = implement.call((function() {
            
            // clean instance to not have shared properties between different instances
            // of a same class
            var clean = function(object) {
                for (var key in object){
                    var value = object[key];
                    if (Die.array.is(value)) {
                        object[key] = Die.array.clone(value);
                    } else if (typeof value === 'object') {
                        var F = function(){};
                        F.prototype = value;
                        object[key] = clean(new F);
                    }
                }
                return object;
            };
        
            return function() {
                clean(this);
                if ( !klass.initializing && this.init ) {
                    this.init.apply(this, arguments);
                }
            }
        })(), imp);

       /* klass.prototype = klass;*/
        klass.prototype.constructor = Class;
        
        return klass;
    }   
    
    Class.Mutators = {
        Implements : function(items) {
            for(var i = 0, len = items.length; i<len; i++){
                var instance = new items[i];
                implement.call(this, instance);
            }
        },

        Extends : function(parent) {
            parent.initializing = true;
            var proto = new parent;
            delete parent.initializing;
            this.prototype = proto;
        }
    };
    
    var implement = function(object) {
        var value = null,
            proto = null;
        for(var key in object) {
            value = object[key];
            if (Class.Mutators.hasOwnProperty(key)){
                Class.Mutators[key].call(this, value);
                continue;
            }
            
            proto = this.prototype;
            
            if (typeof value === 'function' 
                && typeof proto[key] == 'function') { // overloading a function ?
                proto[key] = (function(method, parent) {
                    return function() {
                        // save super
                        var tmp = this._super;
                        // make function accessible with this._super()
                        this._super = parent;
                        // make the new function available
                        var res = method.apply(this, arguments);
                        // restore super if exists
                        if (tmp) { 
                            this._super = tmp;
                        }

                        return res;
                    };
                })(value, proto[key]);
            } else if (typeof value === 'function') {
                proto[key] = value;
            } else if (Die.array.is(value) || typeof value === 'object') {
                proto[key] = Die.utils.clone(value);
            } else {
                proto[key] = value;
            }
        }
        return this;
    };
})();

(function(window) {
    
    // prototype messings
    Function.prototype.pluralify = function() {
        var self = this;
        return function() {
            for(var i = 0, l = arguments.length; i<l; i++) {
                self.call(this, arguments[i]);
            }
            return this;
        }
    }
    
    var Die = window.Die = {};
    
    // Selectors
    Die.selector = {
        gid : function(el) {
            return document.getElementById(el);
        }
    };
    
    // Utils
    Die.utils = {};
    Die.utils.clone = function(val) {
        if (Die.array.is(val)){
            return Die.array.clone(val);
        } else {
            return Die.object.clone(val);
        }
    };
    
    // Array
    Die.array = {};
    Die.array.is = function(arg) {
        return arg && Object.prototype.toString.call(arg) === "[object Array]";
    };
    
    Die.array.clone = function(arr) {
        var i = arr.length,
            clone = new Array(i);
        while(i--) clone[i] = arr[i];
        return clone;
    };
    
    // Objects
    Die.object = {};
    Die.object.clone = function(object) {
        var clone = {};
		for (var key in object) {
            clone[key] = (typeof object[key] === 'object') ? Die.object.clone(object[key]) : object[key];
        }
		return clone;
    };
    
    Die.object.merge = (function() {
        var merge = function(merged, key, value) {
            if (typeof value === 'object') {
                if (typeof merged[key] === 'object') {
                    merged[key] = Die.object.merge(merged[key], value);
                } else {
                    merged[key] = Die.object.clone(value);
                }
            } else {
                merged[key] = value;
            }
        };
        
        return function() {
            if (arguments.length == 1) {
                if (typeof arguments[0] === 'undefined') {
                    return {};
                }
                return arguments[0];
            } else if (arguments.length == 0) {
                return {};
            }

            var merged = arguments[0], 
                args = Array.prototype.slice.call(arguments, 1);

            if (args.length == 2 && typeof args[0] === 'string') {
                merge.apply(this, [merged, args[0], args[1]]);
            } else {
                for(var i = args.length, rec = {};i--; ) {
                    rec = Die.object.merge.apply(this, args);
                }

                for(var key in rec) {
                    merge(merged, key, rec[key]);
                }
            }
            return merged;
        }
    })();
    
    Die.object.keyOf = function(object, value) {
		for (var key in object) {
			if (Object.prototype.hasOwnProperty.call(object, key) && object[key] === value) {
                return key;
            }
		}
		return null;
	};
    
    Die.core = {};
    
    // options
    Die.core.options = new Class({
        options : {},
        
        setOptions : function(options) {
            this.options = Die.object.merge(this.options, options);
        }
    });
    
    // chain
    Die.core.chain = new Class({
       $chain : [],
       
       chain : function(arg) {
           this.$chain.push(arg);
           return this;
       }.pluralify(),
       
       callChain : function() {
           return this.$chain.length ? this.$chain.shift().apply(this, arguments) : false;
       }
    });
            
    // animation
    Die.animation = {};
    
    /*
      
     MooTools 1.4.1 Fx.Transitions import
   
    credits:
        - Easing Equations by Robert Penner, <http://www.robertpenner.com/easing/>, modified and optimized to be used with MooTools.

   */
    Die.animation.transitions = {
        Pow: function(p, x){
            return Math.pow(p, x && x[0] || 6);
        },

        Expo: function(p){
            return Math.pow(2, 8 * (p - 1));
        },

        Circ: function(p){
            return 1 - Math.sin(Math.acos(p));
        },

        Sine: function(p){
            return 1 - Math.cos(p * Math.PI / 2);
        },

        Back: function(p, x){
            x = x && x[0] || 1.618;
            return Math.pow(p, 2) * ((x + 1) * p - x);
        },

        Bounce: function(p){
            var value;
            for (var a = 0, b = 1; 1; a += b, b /= 2){
                if (p >= (7 - 4 * a) / 11){
                    value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
                    break;
                }
            }
            return value;
        },

        Elastic: function(p, x){
            return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x && x[0] || 1) / 3);
        }
    };
    
    Die.animation.ease = function(transition, params) {
        params = params ? (Die.array.isArray(params) ? params : [params]) : [];
        return {
            easeIn: function(pos){
                return transition(pos, params);
            },
            easeOut: function(pos){
                return 1 - transition(1 - pos, params);
            },
            easeInOut: function(pos){
                return (pos <= 0.5 ? transition(2 * pos, params) : (2 - transition(2 * (1 - pos), params))) / 2;
            }
        };
    };
    
    ['Quad', 'Cubic', 'Quart', 'Quint'].forEach(function(name, i){
        Die.animation.transitions[name] = Die.animation.ease(function(p) {  
            return Math.pow(p, i + 2);
        });
    });

    Die.animation.tween = new Class({
        
        Implements: [Die.core.options, Die.core.chain],
        
        options : {
            duration : 1000,
            fps : 60,
            transition : function(p){
                return -(Math.cos(Math.PI * p) - 1) / 2;
            }
        },
        
        frame : 0,
        frames : 0,
        time : null,
        interval : 0,
        
        init : function(options) {
            this.setOptions(options);
        },
        
        animate : function(from, to) {
                this.interval = 1000/this.options.fps;
                this.frames = Math.round(this.options.duration/this.interval), 
                this.time = null;

                var that = this;
                this.loopInterval = setInterval(function() {
                    that.iterate.apply(that, [from, to]);
                }, Math.round(1000/this.options.fps));
        },
        
        render : function(from, to, delta) {
            var value = (to - from) * delta + from;
            return value;
        },
        
        iterate : function(from, to) {
            var now = +(new Date), 
                diff = (this.time != null) ? now - this.time : 0,
                currFrames = diff/this.interval;
            this.time = now;
            this.frame += currFrames;

            if (this.frame < this.frames) {
                var delta = this.options.transition(this.frame/this.frames);
                this.render(from, to, delta);
            } else {
                this.render(from, to, 1);
                this.stop();
            }
        },
        
        stop : function() {
            window.clearInterval(this.loopInterval);
            this.callChain();
        }
    }); 
    
    
    // elements
    Die.element = {};
    Die.element.style = {};
    Die.element.style.get = function(elem, prop){
        var result = elem.style[prop];
        if (!result) {
            if (elem.currentStyle) {
                return elem.currentStyle[prop];
            }
            var defaultView = elem.ownerDocument.defaultView,
                computed = defaultView ? defaultView.getComputedStyle(elem, null) : null;
            return (computed) ? computed.getPropertyValue(prop) : null;
        }
        
        return result;
    };
    
    Die.element.style.set = (function() {
        function setOpacity(element, value) {
            
        };
        
        return function(element, prop, value) {
            if (typeof value == 'number') {
                if (prop == 'zIndex') {
                    element.style[prop] = value;
                } else if ( prop == 'opacity') {
                    // manage opacity when needed
                    setOpacity(element, value);
                } else {
                    element.style[prop] = value + 'px';
                }
            }
        };
    })();
    
    Die.element.style.tween = new Class({
        
        Extends : Die.animation.tween,
        
        element : null,
        propertie : null,
        
        init : function(elem, options) {
            this._super(options);
            this.element = elem;
        },
        
        animate : function(prop, from, to) {
            this.propertie = prop;
            if (typeof to === 'undefined') {
                to = from;
                var tFrom = Die.element.style.get(this.element, this.propertie);
                from = tFrom ? parseInt(tFrom, 10) : 0;
            }
            this._super(from, to);
        },
        
        render : function() {
            var value = this._super.apply(this, arguments);
            Die.element.style.set(this.element, this.propertie, value);
        }
    });
    
    // Ajax tool
    Die.core.request = (function() {
        
        var xhr = (function() {
            var xmlhttp = function() {return new XMLHttpRequest();}; 
            var msxml2 = function() {return new ActiveXObject('MSXML2.XMLHTTP');}; 
            var msxml = function() {return new ActiveXObject('Microsoft.XMLHTTP');}; 
            
            try {
                xmlhttp();
                return xmlhttp;
            } catch(e) {
                try {
                    msxml2();
                    return msxml2;
                } catch (e) {
                    msxml();
                    return msxml;
                }
            }
        })();
        
        return new Class({
        
            Implements: [Die.core.options],
            
            xhr : null,
            isrunning : false,
            headers : {},
            
            options : {
                method : 'post',
                url : '',
                datas : { },
                encoding: 'utf-8',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
                }
            },
            
            init : function(options) {
                this.xhr = xhr();
                this.setOptions(options);
                this.headers = this.options.headers;
            }
        });
        
    })();
    
})(window);
