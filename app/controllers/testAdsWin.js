const Admob = require('ti.admob');

/* Banner ads */
var bannerAdView = Admob.createView({
	debugEnabled: false,
	height: 200,
	bottom: 0,
	adType: Admob.AD_TYPE_BANNER,
	adUnitId: 'ca-app-pub-3940256099942544/2934735716', // You can get your own at http: //www.admob.com/
	adBackgroundColor: 'black',
	// You can get your device's id for testDevices by looking in the console log after the app launched
	testDevices: ["74AADF66-C4CA-4961-9839-C78815E056EB", Admob.SIMULATOR_ID],
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

bannerAdView.addEventListener('didReceiveAd', function (e) {
	Ti.API.info('BannerAdView - Did receive ad: ' + e.adUnitId + '!');
});
bannerAdView.addEventListener('didFailToReceiveAd', function (e) {
	Ti.API.error('BannerAdView - Failed to receive ad: ' + e.error);
});
/*
bannerAdView.addEventListener('didRecordImpression', function () {
	Ti.API.error('BannerAdView - didRecordImpression');
});
*/
bannerAdView.addEventListener('willPresentScreen', function (e) {
	Ti.API.error('BannerAdView - willPresentScreen');
});
bannerAdView.addEventListener('willDismissScreen', function () {
	Ti.API.info('BannerAdView - willDismissScreen!');
});
bannerAdView.addEventListener('didDismissScreen', function () {
	Ti.API.info('BannerAdView - Dismissed screen!');
});
bannerAdView.addEventListener('didPresentScreen', function (e) {
	Ti.API.info('BannerAdView - Presenting screen!' + e.adUnitId);
});

/* Interstitial Ads */
var interstitialAd = Admob.createView({
	debugEnabled: false, // If enabled, a dummy value for `adUnitId` will be used to test
	adType: Admob.AD_TYPE_INTERSTITIAL,
	adUnitId: 'ca-app-pub-3940256099942544/4411468910', // You can get your own at http: //www.admob.com/
	keywords: ['keyword1', 'keyword2'],
	extras: {
		'version': 1.0,
		'name': 'My App'
	} // Object of additional infos
});
interstitialAd.addEventListener('adloaded', function (e) {
	Ti.API.info('interstitialAd - adloaded: Did receive ad!');
	console.log(e);
	interstitialAd.showInterstitial();
	enableInterstitialButton();
});

interstitialAd.addEventListener('didReceiveAd', function (e) {
	Ti.API.info('interstitialAd - Did receive ad!');
	console.log(e);
	enableInterstitialButton();
});
interstitialAd.addEventListener('didFailToReceiveAd', function (e) {
	Ti.API.error('interstitialAd - Failed to receive ad: ' + e.error);
	enableInterstitialButton();
});
interstitialAd.addEventListener('didPresentScreen', function (e) {
	Ti.API.info('interstitialAd - didPresentScreen: ' + e.adUnitId);
	enableInterstitialButton();
});
interstitialAd.addEventListener('didDismissScreen', function (e) {
	Ti.API.info('interstitialAd - Dismissed screen: ' + e.adUnitId);
	enableInterstitialButton();
});
interstitialAd.addEventListener('willDismissScreen', function (e) {
	Ti.API.info('interstitialAd - willDismissScreen: ' + e.adUnitId);
	enableInterstitialButton();
});
interstitialAd.addEventListener('didRecordImpression', function (e) {
	Ti.API.info('interstitialAd- didRecordImpression');
	console.log(e);
	enableInterstitialButton();
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
	debugEnabled: false,
	adType: Admob.AD_TYPE_REWARDED_VIDEO,
	adUnitId: 'ca-app-pub-3940256099942544/1712485313',
	extras: {
		'version': 1.0,
		'name': 'My App'
	} // Object of additional infos
});

rewardedVideo.addEventListener('adloaded', function () {
	Ti.API.debug('rewardedVideo - Rewarded video loaded!');
	rewardedVideo.showRewardedVideo();
	enableRewardedVideoButton();
});
rewardedVideo.addEventListener('adrewarded', function (reward) {
	Ti.API.debug('rewardedVideo -adrewarded');
	Ti.API.debug(`Received reward! type: ${reward.type}, amount: ${reward.amount}`);
	console.log(reward);
	// pre load next rewarded video
	// rewardedVideo.loadRewardedVideo('ad-unit-id');
	enableRewardedVideoButton();
	alert("Well! Amount earned: " + reward.amount);
});
/*rewardedVideo.addEventListener('adclosed', function () {
	Ti.API.debug('rewardedVideo - adclosed: No gold for you!');
	enableRewardedVideoButton();
});*/
rewardedVideo.addEventListener('adfailedtoload', function (error) {
	Ti.API.debug('rewardedVideo - Rewarded video ad failed to load: ' + error.message);
	enableRewardedVideoButton();
});
rewardedVideo.addEventListener('didReceiveAd', function (e) {
	Ti.API.info('rewardedVideo - Did receive ad!');
	console.log(e);
	enableRewardedVideoButton();
});
rewardedVideo.addEventListener('didFailToReceiveAd', function (e) {
	Ti.API.error('rewardedVideo - Failed to receive ad: ' + e.error);
	enableRewardedVideoButton();
});
rewardedVideo.addEventListener('didPresentScreen', function (e) {
	Ti.API.info('rewardedVideo - didPresentScreen: ' + e.adUnitId);
	enableRewardedVideoButton();
});
rewardedVideo.addEventListener('didDismissScreen', function (e) {
	Ti.API.info('rewardedVideo - Dismissed screen: ' + e.adUnitId);
	enableRewardedVideoButton();
});
rewardedVideo.addEventListener('willDismissScreen', function (e) {
	Ti.API.info('rewardedVideo - willDismissScreen: ' + e.adUnitId);
	enableRewardedVideoButton();
});
rewardedVideo.addEventListener('didRecordImpression', function (e) {
	Ti.API.info('rewardedVideo - didRecordImpression');
	console.log(e);
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