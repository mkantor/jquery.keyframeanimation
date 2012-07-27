/* 
	An animation framework based on CSS animation/keyframes-like syntax.
	
	Requirements:
		- basic ES5 support (at least Object.keys)
		- jQuery
	
	References:
		- https://developer.mozilla.org/en/CSS/@keyframes
		- http://dev.w3.org/csswg/css3-animations/
	
	Author: Matt Kantor http://mattkantor.com
	
	Version: 0.1.4
*/

;(function($, window, undefined) {
	
	// NOTE: "percentage" as used below refers to numbers between 0 and 1
	$.fn.keyframeAnimation = function(settings) {
		// TODO: document settings
		var defaultSettings = {
			keyframes: {},
			delays: [],
			animationDuration: 0,
			animationIterationCount: 1
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
									queue: false
								});
							}
						}, keyframeOffset + elementDelay);
					});
					
					// run the next cycle after settings.animationDuration
					window.setTimeout(animate, settings.animationDuration);
				});
			}
		}
		
		// start the animation cycle (it will repeat itself)
		animate();
		
		// allow chaining
		return this;
	};
	
}(jQuery, window));
