No promises that any of this will actually get implemented; it's just 
brainstorming. Pull requests are obviously very much appreciated.


--------------------------------------------------------------------------------
- provide a setting for `animation-fill-mode`
	- right now behavior is equivalent to "forwards"
	- could implement "backwards" by applying 0% styles right away
	- having to set up initial states in CSS for the JS version is lame
	- at the very least should make the default behavior the same as CSS

--------------------------------------------------------------------------------
- make it so that the 0 and 1 keyframes are not required
	- from the spec (http://www.w3.org/TR/css3-animations/#keyframes):
		- "If a 0% or "from" keyframe is not specified, then the user agent 
		  constructs a 0% keyframe using the computed values of the 
		  properties being animated. If a 100% or "to" keyframe is not 
		  specified, then the user agent constructs a 100% keyframe using 
		  the computed values of the properties being animated."
		- Epiphany 2.30.2 (AppleWebKit/531.2+) and Safari 4.0.3 
		  (AppleWebKit/531.9) do not follow the spec in that the animation 
		  will not work if the 0% and 100% keyframes are missing (they can 
		  have empty definitions though)
	- can use `$.fn.css` to get computed styles before animating (this assumes 
	  that other things won't change the styles during animation)
	- possible fix would be to generate a `defaultKeyframes` object with 0/1
	  keyframes having all computed styles and recursively merge this into 
	  `settings.keyframes`
	- also, individual styles missing from the 0%/100% keyframes have similar 
	  behavior ("get my value from the computed value") no matter what the 
	  value of `animation-fill-mode` is
		- see the MDN example for a testcase
		- this is *different* behavior from what happens when styles are 
		  missing from "inner" keyframes and will have to be handled 
		  separately
		- this behavior is currently unspecified, but seems to be consistent 
		  among several browsers
			- "NOTE: describe what happens if a property is not present in 
			  all keyframes."
				- http://www.w3.org/TR/css3-animations/#keyframes

--------------------------------------------------------------------------------
- determine how this should work for non-sequential animations, e.g.  
  ```
  	0% {
  		width: 100px;
  		height: 100px;
  	}
  	50% {
  		width: 200px;
  	}
  	100% {
  		height: 200px;
  	}
  ```
	- this behavior is currently unspecified, but seems to be consistent 
	  across several browsers:
		- browsers will "tween through" missing properties as if the 
		  intermediate keyframe didn't exist for the purposes of that style
		- "NOTE: describe what happens if a property is not present in 
		  all keyframes."
			- http://www.w3.org/TR/css3-animations/#keyframes
	- see the styles-missing-from-keyframes example for a testcase

--------------------------------------------------------------------------------
- make the `delays` setting less whack
	- support a single number that applies to all elements like other settings
	- rename to "animationDelay"
	- do away with index-based specification
		- need a viable alternative
	- ideally generalize all settings handling so that they can all have 
	  flexible specificity (per element/global/whatever)
		- see the "make settings more CSS-like" TODO for ideas

--------------------------------------------------------------------------------
- make settings more CSS-like
	- animation properties should all be settable with flexible specificity 
	  (the best of both how `delays` works now and the other properties)
		- would need to actually be able to handle using the settings 
		  per-element
			- which properties are valid per-element in CSS?
			- need some testcases for this
			- some (like `animationTimingFunction`) would be easy, but 
			  `animationDuration` would be tricky with the way things 
			  currently work
				- could not worry about this and just have 
				  `animationDuration` (and any other difficult cases) only 
				  work globally for now
		- possible selector-based implementation:  
		  ```
		  	{
		  		animationDelay: {
		  			'some > .selector': 100,
		  			'another + .selector': 200
		  		},
		  		animationDuration: 1000, // non-object values would apply to all elements like they do now
		  		animationTimingFunction: {
		  			'.selector': 'easeOut'
		  		}
		  	}
		  ```
			- all the selector matching required to implement this could 
			  cause a performance hit
	- in CSS `animation-timing-function` is supported inside keyframes
	- properly support the `<time>` data type for `animation-delay` and 
	  `animation-duration`
		- https://developer.mozilla.org/en/CSS/time
		- disallow unitless numbers? (like CSS)
	- support `from` and `to` keywords for keyframes
		- strings with "%" signs too
	- accept dash-separated settings names (like CSS)
		- allowing settings properties to be unquoted is nice, though
			- maybe support both camelCase and dash-delimited
	- support multiple values for properties? (all CSS animation properties 
	  can have multiple values which correspond to different animation-names)
		- see http://dev.w3.org/csswg/css3-animations/#animation-name-property
		- would also need to support passing multiple keyframe sets for this 
		  to be useful
		- this probably isn't worth doing unless this becomes a full-fledged 
		  polyfill

--------------------------------------------------------------------------------
- implement `step-start` and `step-end` timing functions as well as custom 
  function specifications (`steps(...)` and `cubic-bezier(...)`)
	- https://developer.mozilla.org/en/CSS/timing-function
	- http://www.w3.org/TR/2012/WD-css3-transitions-20120403/#transition-timing-function-property

--------------------------------------------------------------------------------
- implement animation events
	- https://developer.mozilla.org/en/CSS/CSS_animations#Using_animation_events

--------------------------------------------------------------------------------
- provide support for non-integer `animation-iteration-count` values
	- http://dev.w3.org/csswg/css3-animations/#animation-iteration-count-property
	  says:
		- "Non-integer numbers will cause the animation to end part-way 
		  through a cycle. Negative values of `animation-iteration-count` 
		  are invalid."

--------------------------------------------------------------------------------
- see https://github.com/KuraFire/runloop for an alternative approach
	- perhaps it has better animation timing handling?
		- if so, could either use it for inspiration or build this plugin on 
		  top of it (but that means another dependency)
	- see also: http://rekapi.com/
	- also look into using `requestAnimationFrame`
		- `$.fn.animate` should probably use `requestAnimationFrame` 
		  internally when possible anyway (it doesn't as of 1.7.2)

--------------------------------------------------------------------------------
- eventually turn this into a polyfill

