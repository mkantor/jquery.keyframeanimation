$(function() {
	var animationSettings = {
		animationDuration: 32000,
		keyframes: {
			0: { opacity: 0 },
			0.03: { opacity: 1 },
			0.22: { opacity: 1 },
			0.25: { opacity: 0 },
			1: { opacity: 0 }
		},
		delays: [0, 8000, 16000, 24000],
		animationIterationCount: 'infinite'
	};
	
	if(Modernizr.cssanimations) {
		$('.slideshow.fallback').before('<p>Using CSS animation.</p>');
	} else {
		$('.slideshow.fallback').before('<p>This browser lacks CSS animation support; falling back to JavaScript animation.</p>');
		$('.slideshow.fallback > *').keyframeAnimation(animationSettings);
	}
	
	$('.slideshow.js > *').keyframeAnimation(animationSettings);
});
