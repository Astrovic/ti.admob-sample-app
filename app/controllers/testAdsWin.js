const Admob = require('ti.admob');

/* Banner ads */
var bannerAdView = Admob.createView({
	height: 50,
	width: "100%",
	bottom: 30,
	debugEnabled: true, // If enabled, a dummy value for `adUnitId` will be used to test
	adType: Admob.AD_TYPE_BANNER,
	adUnitId: 'ca-app-pub-3940256099942544/2934735716', // You can get your own at http: //www.admob.com/
	adBackgroundColor: 'black',
	// You can get your device's id for testDevices by looking in the console log after the app launched
	testDevices: ["74AADF66-C4CA-4961-9839-C78815E056EB",Admob.SIMULATOR_ID],
	contentURL: 'https://admob.com', // URL string for a webpage whose content matches the app content.
	requestAgent: 'Titanium Mobile App', // String that identifies the ad request's origin.
	extras: {
		'version': 1.0,
		'name': 'My App'
	}, // Object of additional infos
	tagForChildDirectedTreatment: false, // http:///business.ftc.gov/privacy-and-security/childrens-privacy for more infos
	keywords: ['keyword1', 'keyword2']
});
$.testAdsWin.add(bannerAdView);

bannerAdView.addEventListener('didRecordImpression', function (e) {
	Ti.API.info('Banner: Ad impression recorded!');
});
bannerAdView.addEventListener('didReceiveAd', function (e) {
	Ti.API.info('Banner: Did receive ad: ' + e.adUnitId + '!');
});
bannerAdView.addEventListener('didFailToReceiveAd', function (e) {
	Ti.API.error('Banner: Failed to receive ad: ' + e.error);
});
bannerAdView.addEventListener('didPresentScreen', function () {
	Ti.API.info('Banner: Presenting screen!');
});
bannerAdView.addEventListener('willDismissScreen', function () {
	Ti.API.info('Banner: Dismissing screen!');
});
bannerAdView.addEventListener('didDismissScreen', function () {
	Ti.API.info('Banner: Dismissed screen!');
});

/* Interstitial Ads */
var interstitialAd = Admob.createView({
	debugEnabled: true, // If enabled, a dummy value for `adUnitId` will be used to test
	adType: Admob.AD_TYPE_INTERSTITIAL,
	adUnitId: 'ca-app-pub-3940256099942544/4411468910', // You can get your own at http: //www.admob.com/
	keywords: ['keyword1', 'keyword2']
});
interstitialAd.addEventListener('didRecordImpression', function (e) {
	enableInterstitialButton();
	Ti.API.info('Interstitial: Ad impression recorded!');
});
interstitialAd.addEventListener('didFailToReceiveAd', function (e) {
	enableInterstitialButton();
	Ti.API.error('Failed to receive ad: ' + e.error);
});

function showInterstitial() {
	console.log("showInterstitial");
	disableInterstitialButton();
	interstitialAd.receive();
};

function disableInterstitialButton() {
	$.interstitialButton.enabled = false;
}
function enableInterstitialButton() {
	$.interstitialButton.enabled = true;
}

/* Rewarded Video Ads */
var rewardedVideo = Admob.createView({
	debugEnabled: true,
	adType: Admob.AD_TYPE_REWARDED_VIDEO,
	adUnitId: 'ca-app-pub-3940256099942544/1712485313'
});
rewardedVideo.addEventListener('didRecordImpression', function (reward) {
	Ti.API.debug(`Rewarded: Received reward! type: ${reward.type}, amount: ${reward.amount}`);
	enableRewardedVideoButton();
});
rewardedVideo.addEventListener('didDismissScreen', function () {
	Ti.API.debug('Rewarded: Ad closed!');
	enableRewardedVideoButton();
});
rewardedVideo.addEventListener('adfailedtoload', function (error) {
	Ti.API.debug('Rewarded: Rewarded video ad failed to load: ' + error.message);
	$.rewardedVideoButton.title = 'Rewarded video ad failed to load :(';
	enableRewardedVideoButton();
});

function showRewarded() {
	console.log("showRewarded");
	disableRewardedVideoButton();
	$.rewardedVideoButton.title = 'Loading Rewarded Video ...';
	rewardedVideo.receive();
};

function disableRewardedVideoButton() {
	$.rewardedVideoButton.enabled = false;
}
function enableRewardedVideoButton() {
	$.rewardedVideoButton.enabled = true;
	setTimeout(() => {
		$.rewardedVideoButton.title = 'Show Rewarded Video Ad';
	}, 2000);
}

function closeWin() {
	$.testAdsWin.close();
}