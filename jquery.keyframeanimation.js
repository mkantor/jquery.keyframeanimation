// An animation framework based on a CSS animations-like syntax.

// __Requirements:__
// 
// * basic ES5 support (at least `Object.keys`)
// * [jQuery](http://jquery.com)

// __References:__
// 
// * [CSS Animations - MDN](https://developer.mozilla.org/en/CSS/CSS_animations)
// * [W3C CSS Animations Specification](http://www.w3.org/TR/css3-animations/)

// __Author:__ [Matt Kantor](http://mattkantor.com)

// __Version:__ 0.3.2

// -----------------------------------------------------------------------------

// When "percentage" is used in this plugin it refers to numbers between 0 and 
// 1 (inclusive).
;(function($, window, undefined) {
	
	// Public Interface
	// ------------------------------------------------------------------------
	
	
	// Call the specified method (passing along subsequent arguments) or 
	// default to the `initialize` method (passing along all arguments).
	$.fn.keyframeAnimation = function(methodOrSettings/* [, ...] */) {
		if($.fn.keyframeAnimation[methodOrSettings]) {
			return $.fn.keyframeAnimation[methodOrSettings].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return $.fn.keyframeAnimation.initialize.apply(this, arguments);
		}
	};
	
	
	// Begin the animation cycle for the jQuery element set (`this`). 
	// Animation particulars are specified with a `settings` object (see 
	// `defaultSettings` for more information).
	$.fn.keyframeAnimation.initialize = function(settings) {
		// Every setting has a default value which corresponds as closely as 
		// possible to the CSS defaults, though the animation won't do 
		// anything if some of these are left at their default values.
		var defaultSettings = {
			// An object of the form `{ percentage: { /* map of CSS 
			// property-value pairs */ }, ... }` similar to the CSS 
			// [`@keyframes`](https://developer.mozilla.org/en/CSS/@keyframes)
			// at-rule. This *must* include properties for the indexes `0` 
			// and `1` (the starting and ending states of the animation).
			keyframes: {},
		
			// The animation delays for elements in the jQuery set, 
			// specified using an array whose indexes corresponds to 
			// element indexes.
			delays: [],
		
			// Corresponds to the `animation-duration` CSS property.
			animationDuration: 0,
		
			// Corresponds to the `animation-iteration-count` CSS property.
			animationIterationCount: 1,
		
			// Corresponds to the `animation-timing-function` CSS property.
			animationTimingFunction: 'ease'
		};
		settings = $.extend({}, defaultSettings, settings);
		
		var elements = this;
		var orderedKeyframePercentages = Object.keys(settings.keyframes).sort();
		
		// Create a namespace for element-associated data owned by this 
		// plugin.
		if(elements.data('keyframeAnimation') === undefined) {
			elements.data('keyframeAnimation', {});
		}
		
		var currentIteration = 0;
		// This function will be repeatedly called to perform the animation 
		// cycle.
		var iterateAnimation = function() {
			currentIteration++;
			
			// If there are more animation iterations:
			if(settings.animationIterationCount === 'infinite' || currentIteration <= settings.animationIterationCount) {
				elements.data('keyframeAnimation').timeouts = [];
				
				// Animate each element and tell the next iteration to run 
				// after the delay specified by `animationDuration`.
				elements.each(animateElement);
				elements.data('keyframeAnimation').timeouts.push(window.setTimeout(iterateAnimation, settings.animationDuration));
			} else {
				// Otherwise, animation iteration is complete.  Do some 
				// cleanup.
				delete elements.data('keyframeAnimation').timeouts;
			}
		};
		
		// To animate a single element, iterate over each keyframe and set up 
		// an animation with the appropriate delay (as determined by the 
		// element's delay and the keyframe percentage) and duration 
		// (calculated using the difference between keyframe percentages).
		var animateElement = function(elementIndex, element) {
			var elementDelay = settings.delays[elementIndex] || 0;
			
			// Set up transitions between each keyframe.
			$.each(orderedKeyframePercentages, function(keyframeIndex, percentage) {
				var styles = settings.keyframes[percentage];
				
				// Figure out the duration and offset for this keyframe.
				/* TODO: Move this (and possibly other stuff) outside the 
				loop so it only needs to be computed once (or memoize). */
				var percentageBetweenKeyframes, keyframeOffset;
				if(percentage != 0) {
					// These `orderedKeyframePercentages` indexes should 
					// never go out of bounds because the percentages are 
					// ordered and 0% must always be present/first.
					
					// Percentage of total time that this particular 
					// keyframe transition should take; the interval 
					// between this keyframe and the previous one.
					percentageBetweenKeyframes = (percentage - orderedKeyframePercentages[keyframeIndex - 1]);
					
					// Offset transition animation start times based on 
					// the percentage of the previous keyframe.
					keyframeOffset = settings.animationDuration * orderedKeyframePercentages[keyframeIndex - 1];
				} else {
					// The initial keyframe's styles are applied instantly.
					percentageBetweenKeyframes = 0;
					keyframeOffset = 0;
				}
				
				// How long the transition to this keyframe should last.
				var interpolationDuration = settings.animationDuration * percentageBetweenKeyframes;
				
				// Delay transition start as needed.
				elements.data('keyframeAnimation').timeouts.push(window.setTimeout(function() {
					// Is animation necessary?
					if(interpolationDuration === 0) {
						$(element).css(styles);
					} else {
						$(element).animate(styles, {
							duration: interpolationDuration, 
							queue: false,
							easing: makeEasingFunction(settings.animationTimingFunction)
						});
					}
				}, keyframeOffset + elementDelay));
			});
		};
		
		// Start the animation cycle (it will repeat itself).
		iterateAnimation();
		
		// Allow chaining.
		return this;
	};
	
	
	// Immediately clear all animation timers; note that in-progress 
	// `$(...).animate()` transitions will not be halted.
	$.fn.keyframeAnimation.abort = function() {
		if(this.data('keyframeAnimation').timeouts) {
			$.each(this.data('keyframeAnimation').timeouts, function(index, timeoutID) {
				window.clearTimeout(timeoutID);
			});
			delete this.data('keyframeAnimation').timeouts;
		}
		
		// Allow chaining.
		return this;
	};
	
	
	// Private Helpers/Variables
	// ------------------------------------------------------------------------
	
	
	// See [the W3C timing-function 
	// specification](http://www.w3.org/TR/2012/WD-css3-transitions-20120403/#transition-timing-function-property).
	// Currently, only the cubic-bezier keyword timing-functions are supported.
	var timingFunctionPoints = {
		ease: [
			{ x: 0.25, y: 0.1 },
			{ x: 0.25, y: 1 }
		],
		linear: [
			{ x: 0, y: 0 },
			{ x: 1, y: 1 }
		],
		easeIn: [
			{ x: 0.42, y: 0 },
			{ x: 1, y: 1 }
		],
		easeOut: [
			{ x: 0, y: 0 },
			{ x: 0.58, y: 1 }
		],
		easeInOut: [
			{ x: 0.42, y: 0 },
			{ x: 0.58, y: 1 }
		]
	};
	
	
	// `$.fn.animate` cannot accept easings as functions (lame), instead they 
	// need to be put into `$.easing` and specified via property names. This 
	// function creates a new `$.easing` method based on a property in 
	// `timingFunctionPoints` (if needed) and returns its name.
	/* FIXME? Is the extra complexity of creating these on-the-fly worth the 
	small performance savings and the smaller `$.easing` namespace footprint? 
	Since `$.easing` is externally-visible, will it be confusing to not always 
	have all css* easing functions present? Something like this would 
	definitely still be necessary for custom timing functions (e.g. 
	'cubic-bezier(x1, y1, x2, y2)'). */
	var makeEasingFunction = function(timingFunctionName) {
		// The `$.easing` property name, e.g. "cssEaseIn".
		var easingName = 'css' + timingFunctionName.charAt(0).toUpperCase() + timingFunctionName.slice(1);
		
		if($.easing[easingName] === undefined) {
			// Create a new `$.easing` method.
			var points = timingFunctionPoints[timingFunctionName];
			$.easing[easingName] = function(percentComplete, millisecondsSince, startValue, endValue, totalDuration) {
				var totalDurationSeconds = totalDuration / 1000;
				return cubicBezierAtTime(percentComplete, points[0].x, points[0].y, points[1].x, points[1].y, totalDurationSeconds);
			};
		}
		
		return easingName;
	};
	
	
	// Used to create cubic bezier timing functions. This code is adapted from 
	// Christian Effenberger's public domain implementation of WebKit 
	// algorithms in WebCore/page/animation/AnimationBase.cpp.
	// 
	// * [WebKit's AnimationBase.cpp](http://trac.webkit.org/browser/trunk/Source/WebCore/page/animation/AnimationBase.cpp)
	// * [Christian Effenberger's Implementation](http://www.netzgesta.de/dev/cubic-bezier-timing-function.html)
	/* TODO: more descriptive variable names. */
	var cubicBezierAtTime = function(t, p1x, p1y, p2x, p2y, duration) {
		// Calculate the polynomial coefficients, implicit first and last 
		// control points are (0,0) and (1,1).
		var cx = 3 * p1x;
		var bx = 3 * (p2x - p1x) - cx;
		var ax = 1 - cx - bx;
		var cy = 3 * p1y;
		var by = 3 * (p2y - p1y) - cy;
		var ay = 1 - cy - by;
		
		// 'ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
		var sampleCurveX = function(t) {
			return ((ax * t + bx) * t + cx) * t;
		};
		var sampleCurveY = function(t) {
			return ((ay * t + by) * t + cy) * t;
		};
		var sampleCurveDerivativeX = function(t) {
			return (3 * ax * t + 2 * bx) * t + cx;
		};
		
		// Given an x value, find a parametric value it came from.
		var solveCurveX = function(x, epsilon) {
			var t0, t1, t2, x2, d2, i;
			
			// First try a few iterations of Newton's method, which is 
			// normally very quick.
			for(t2 = x, i = 0; i < 8; i++) {
				x2 = sampleCurveX(t2) - x;
				if(Math.abs(x2) < epsilon) {
					return t2;
				}
				d2 = sampleCurveDerivativeX(t2);
				if(Math.abs(d2) < 1e-6) {
					break;
				}
				t2 = t2 - x2 / d2;
			}
			
			// Fall back to the bisection method for reliability.
			t0 = 0;
			t1 = 1;
			t2 = x;
			if(t2 < t0) {
				return t0;
			}
			if(t2 > t1) {
				return t1;
			}
			while(t0 < t1) {
				x2 = sampleCurveX(t2);
				if(Math.abs(x2 - x) < epsilon) {
					return t2;
				}
				if(x > x2) {
					t0 = t2;
				} else {
					t1 = t2;
				}
				t2 = (t1 - t0) * 0.5 + t0;
			}
			return t2; // Failure. /* FIXME: What does this imply? */
		};
		
		// The epsilon value to pass given that the animation is going to 
		// run over `duration` seconds. The longer the animation, the more 
		// precision is needed in the timing function result to avoid ugly 
		// discontinuities.
		var epsilon = 1 / (200 * duration);
		
		// Convert from input time to parametric value in curve, then from 
		// that to output time.
		return sampleCurveY(solveCurveX(t, epsilon));
	};
	
}(jQuery, window));
