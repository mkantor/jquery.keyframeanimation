An animation framework based on a CSS animations-like syntax.

Dependencies
------------
- basic ES5 support (at least `Object.keys`)
- [jQuery](http://jquery.com)

References
----------
- [CSS Animations - MDN](https://developer.mozilla.org/en/CSS/CSS_animations)
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
    	delays: [0, 1000, 2000],
    	animationIterationCount: 2,
    	animationTimingFunction: 'easeInOut'
    });

Settings
--------
- `keyframes`  
  An object of the form `{ percentage: { /* CSS property-value pairs */ }, 
  ... }` similar to the CSS 
  [`@keyframes`](https://developer.mozilla.org/en/CSS/@keyframes) at-rule. 
  Only CSS properties supported by `$.fn.animate` can be animated. 
  Currently percentages are specified using JavaScript numbers between 0 
  and 1 (inclusive). This *must* include properties named `0` and `1` (the 
  starting and ending states of the animation).

- `delays`  
  An array whose effect is analogous to the `animation-delay` CSS property. 
  Delays are are settable per-element by ensuring that indexes in this 
  array correspond to element indexes in the jQuery set. Currently only 
  JavaScript numbers are accepted (milliseconds).

- `animationDuration`  
   Corresponds to the `animation-duration` CSS property. Currently only 
   JavaScript numbers are accepted (milliseconds).

- `animationIterationCount`  
  Corresponds to the `animation-iteration-count` CSS property.

- `animationTimingFunction`  
  Corresponds to the `animation-timing-function` CSS property. Currently 
  only the cubic-bezier keyword timing-functions are supported.

Author
------
[Matt Kantor](http://mattkantor.com)
