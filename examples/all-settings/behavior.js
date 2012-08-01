$(function() {
	$('.animated').keyframeAnimation({
		animationDuration: 5000,
		keyframes: {
			0.25: { 'font-size': '500%' },
			0: { 'font-size': '200%' },
			1: { 'font-size': '50%' }
		},
		delays: [0, 1000, 2000],
		animationIterationCount: 2,
		animationTimingFunction: 'easeInOut'
	});
});
