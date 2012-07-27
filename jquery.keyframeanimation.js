/* 
	An animation framework based on CSS animation/keyframes-like syntax.
	
	Requirements:
		- basic ES5 support (at least Object.keys)
		- jQuery
	
	References:
		- https://developer.mozilla.org/en/CSS/@keyframes
		- http://dev.w3.org/csswg/css3-animations/
	
	Author: Matt Kantor http://mattkantor.com
	
	Version: 0.2.0
*/

// NOTE: "percentage" as used below refers to numbers between 0 and 1
;(function($, window, undefined) {
	
	$.fn.keyframeAnimation = function(settings) {
		// TODO: document settings
		var defaultSettings = {
			keyframes: {},
			delays: [],
			animationDuration: 0,
			animationIterationCount: 1,
			animationTimingFunction: 'ease'
		};
		settings = $.extend({}, defaultSettings, settings);
		
		var elements = this;
		var orderedKeyframePercentages = Object.keys(settings.keyframes).sort();
		var currentIteration = 0;
		
		var animate = function() {
			currentIteration++;
			if(settings.animationIterationCount !== 'infinite' && currentIteration > settings.animationIterationCount) {
				// done animating
				return;
			} else {
				// for each element, iterate over each keyframe and set up 
				// an animation with the appropriate delay (as determined 
				// by the element delay and the keyframe percentage) and 
				// duration (calculated using the difference between 
				// keyframe percentages)
				elements.each(function(elementIndex, element) {
					var elementDelay = settings.delays[elementIndex] || 0;
					
					// set up transitions between each keyframe
					$.each(orderedKeyframePercentages, function(keyframeIndex, percentage) {
						var styles = settings.keyframes[percentage];
						
						// figure out the duration and offset for this 
						// TODO: move this (and probably other stuff) 
						//       outside the loop so it only needs to be 
						//       computed once (or memoize)
						var percentageBetweenKeyframes, keyframeOffset;
						if(percentage != 0) {
							// these should never go out of bounds 
							// because the percentages are ordered and 
							// 0% must always be present/first
							// TODO: document this elsewhere
							
							// percentage of total time that this 
							// particular keyframe transition should 
							// take; the "gap" between this keyframe 
							// and the previous one
							percentageBetweenKeyframes = (percentage - orderedKeyframePercentages[keyframeIndex - 1]);
							
							// offset transition animation start times 
							// based on the percentage of the previous 
							// keyframe
							keyframeOffset = settings.animationDuration * orderedKeyframePercentages[keyframeIndex - 1];
						} else {
							// the 0% keyframe's styles are applied 
							// instantly
							percentageBetweenKeyframes = 0;
							keyframeOffset = 0;
						}
						
						// how long the transition to this keyframe 
						// should last
						var interpolationDuration = settings.animationDuration * percentageBetweenKeyframes;
						
						// delay transition start as needed
						window.setTimeout(function() {
							// is animation necessary?
							if(interpolationDuration === 0) {
								$(element).css(styles);
							} else {
								$(element).animate(styles, {
									duration: interpolationDuration, 
									queue: false,
									easing: makeEasingFunction(settings.animationTimingFunction)
								});
							}
						}, keyframeOffset + elementDelay);
					});
					
					// run the next cycle after settings.animationDuration
					window.setTimeout(animate, settings.animationDuration);
				});
			}
		};
		
		// start the animation cycle (it will repeat itself)
		animate();
		
		// allow chaining
		return this;
	};
	
	
	// see http://www.w3.org/TR/2012/WD-css3-transitions-20120403/#transition-timing-function-property
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
	
	
	// create a $.easing function for an animationTimingFunction and return 
	// its name
	var makeEasingFunction = function(timingFunctionName) {
		// e.g. "cssEaseIn"
		var easingName = 'css' + timingFunctionName.charAt(0).toUpperCase() + timingFunctionName.slice(1);
		
		// $.fn.animate cannot accept easings as functions (lame), instead 
		// they need to be put into $.easing and specified via property names
		if($.easing[easingName] === undefined) {
			// an easing function for this animationTimingFunction doesn't 
			// already exist; create it
			var points = timingFunctionPoints[timingFunctionName];
			$.easing[easingName] = function(percentComplete, millisecondsSince, startValue, endValue, totalDuration) {
				var totalDurationSeconds = totalDuration / 1000;
				return cubicBezierAtTime(percentComplete, points[0].x, points[0].y, points[1].x, points[1].y, totalDurationSeconds);
			};
		}
		
		return easingName;
	};
	
	
	// adapted from Christian Effenberger's public domain implementation of 
	// WebKit algorithms in WebCore/page/animation/AnimationBase.cpp
	// http://trac.webkit.org/browser/trunk/Source/WebCore/page/animation/AnimationBase.cpp
	// http://www.netzgesta.de/dev/cubic-bezier-timing-function.html
	// TODO: more descriptive variable names
	var cubicBezierAtTime = function(t, p1x, p1y, p2x, p2y, duration) {
		var ax = 0, bx = 0, cx = 0, ay = 0, by = 0, cy = 0;
		
		// `ax t^3 + bx t^2 + cx t` expanded using Horner's rule
		var sampleCurveX = function(t) {
			return ((ax * t + bx) * t + cx) * t;
		};
		var sampleCurveY = function(t) {
			return ((ay * t + by) * t + cy) * t;
		};
		var sampleCurveDerivativeX = function(t) {
			return (3.0 * ax * t + 2.0 * bx) * t + cx;
		};
		
		// the epsilon value to pass given that the animation is going to run 
		// over `duration` seconds.
		// the longer the animation, the more precision is needed in the 
		// timing function result to avoid ugly discontinuities.
		var solveEpsilon = function(duration) {
			return 1.0 / (200.0 * duration);
		};
		var solve = function(x, epsilon) {
			return sampleCurveY(solveCurveX(x, epsilon));
		};
		
		// given an x value, find a parametric value it came from
		var solveCurveX = function(x, epsilon) {
			var t0, t1, t2, x2, d2, i;
			
			// first try a few iterations of Newton's method, normally quick
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
			
			// fall back to the bisection method for reliability
			t0 = 0.0;
			t1 = 1.0;
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
			return t2; // failure (FIXME: what does this imply?)
		};
		
		// calculate the polynomial coefficients, implicit first and last 
		// control points are (0,0) and (1,1)
		cx = 3.0 * p1x;
		bx = 3.0 * (p2x - p1x) - cx;
		ax = 1.0 - cx - bx;
		cy = 3.0 * p1y;
		by = 3.0 * (p2y - p1y) - cy;
		ay = 1.0 - cy - by;
		
		// convert from input time to parametric value in curve, then from 
		// that to output time
		return solve(t, solveEpsilon(duration));
	};
	
}(jQuery, window));
