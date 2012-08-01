$(function() {
	$('.animated.js').keyframeAnimation({
		animationDuration: 5000,
		keyframes: {
			0: {
				width: '100px',
				height: '100px'
			},
			0.5: {
				width: '200px'
			},
			1: {
				height: '200px'
			}
		},
		animationIterationCount: 'infinite',
		animationTimingFunction: 'linear',
		delays: [2000]
	});
});
