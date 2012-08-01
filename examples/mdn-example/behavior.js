$(function() {
	var animationSettings = {
		animationDuration: 3000,
		keyframes: {
			0: {
				'margin-left': '100%',
				'width': '300%'
			},
			0.75: {
				'font-size': '300%',
				'margin-left': '25%',
				'width': '150%'
			},
			1: {
				'margin-left': '0%',
				'width': '100%'
			}
		}
	};
	
	$('h1.js').keyframeAnimation(animationSettings);
});
