$(function() {
	$('#player-js').keyframeAnimation({
		animationDuration: 20000,
		keyframes: {
			// FIXME: 0% and 100% keyframes are required here but not in CSS.
			0: { 'top': '50%' }, // should match non-keyframe styles
			0.02: { 'top': '50%' }, // between hits
			0.10: { 'top': '35%' }, // between hits
			0.15: { 'top': '40%' },
			0.27: { 'top': '75%' }, // between hits
			0.35: { 'top': '30%' },
			0.46: { 'top': '25%' }, // between hits
			0.55: { 'top': '60%' },
			0.75: { 'top': '30%' },
			0.87: { 'top': '55%' }, // between hits
			0.95: { 'top': '70%' },
			1: { 'top': '50%' } // should match non-keyframe styles
		},
		animationIterationCount: 'infinite',
		animationTimingFunction: 'easeInOut'
	});
});
