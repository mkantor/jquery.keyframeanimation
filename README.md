jquery.keyframeanimation
========================

An animation framework based on a CSS animations-like syntax.

This project is [hosted on 
GitHub](http://github.com/mkantor/jquery.keyframeanimation). [Annotated 
source code](http://mkantor.github.com/jquery.keyframeanimation/docs) and 
[usage examples](http://mkantor.github.com/jquery.keyframeanimation/examples) 
are available online.

Dependencies
------------
- [jQuery](http://jquery.com) 1.2.3+

References
----------
- [CSS Animations - MDN](http://developer.mozilla.org/en/CSS/CSS_animations)
- [W3C CSS Animations Specification](http://www.w3.org/TR/css3-animations/)

Usage
-----
    $('.animated').keyframeAnimation({
    	animationDuration: 5000,
    	keyframes: {
    		0: { 'font-size': '200%' },
    		0.25: { 'font-size': '500%' },
    		1: { 'font-size': '50%' }
    	},
    	delays: [0, 1000, 2000], // indexes match $('.animated')
    	animationIterationCount: 2,
    	animationTimingFunction: 'easeInOut'
    });

Settings
--------
- `keyframes`  
  An object of the form 
  `{ percentage: { cssProperty: cssValue [, ...] } [, ...] }` similar to 
  the CSS [`@keyframes`](http://developer.mozilla.org/en/CSS/@keyframes) 
  at-rule. Only CSS properties/values supported by 
  [`$.fn.animate`](http://api.jquery.com/animate/) can be animated. 
  Percentages are specified using numbers between 0 and 1 (inclusive). This 
  *must* include properties named `0` and `1` (the starting and ending 
  states of the animation).

- `delays`  
  An array whose effect is analogous to the `animation-delay` CSS property. 
  Delays are are settable per-element by ensuring that indexes in this 
  array correspond to element indexes in the jQuery set. Only unitless 
  numbers (milliseconds) are accepted as array elements.

- `animationDuration`  
  Corresponds to the `animation-duration` CSS property. Only unitless 
  numbers (milliseconds) are accepted.

- `animationIterationCount`  
  Corresponds to the `animation-iteration-count` CSS property.

- `animationTimingFunction`  
  Corresponds to the `animation-timing-function` CSS property. Only the 
  cubic-bezier keyword timing-functions are supported.

Author
------
[Matt Kantor](http://mattkantor.com)
