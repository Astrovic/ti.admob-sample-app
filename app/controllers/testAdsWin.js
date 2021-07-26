let Admob;
if (OS_IOS) {
	Admob = require('ti.admob')
} else {
	Admob = require("ti.android.admob");
	Admob.setTestDeviceId("AD119416FA7E9487D4E1EDDE07856B7D");
}

if (OS_IOS) {
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
} else {	

	var bannerAd = Admob.createView({
		bottom: 0,
		//width: "100%",
		//height: 200,
		viewType: Admob.TYPE_ADS,
		adSizeType: Admob.ADAPTATIVE_BANNER,
		//testing: true,
		//borderColor: "red",
		adUnitId: 'ca-app-pub-3940256099942544/6300978111',
		extras: {'npa':1},
		testDeviceId: "G9CCEHKYF95FFR8152FX50D059DC8336", //USE YOUR DEVICE ID HERE
	});
	/*var bannerAd = Admob.createBannerView({
		adUnitId: 'ca-app-pub-3940256099942544/6300978111',
		testing: false, // default is false
		top: 0, // optional
		//bottom: _assets.android.bottom,
		width: "100%",
		height: 200,
		//adBackgroundColor: "transparent",
		visible: true,
		adSize: Admob.AD_SIZE_SMART_BANNER, //Admob.AD_SIZE_BANNER,
		extras: {npa:1}, // Object of additional infos. NOTE: npa=1 disables personalized ads (!)
		//testDevices : "CBB9E9CAA4291A71E510627CEFC530AA"
	});*/
	$.testAdsWin.add(bannerAd);

	bannerAd.addEventListener('ad_received', function (e) {
		Titanium.API.info("Banner Ad received");
	});

	bannerAd.addEventListener('ad_not_received', function (e) {
		Titanium.API.info("Banner Ad failed");
		Ti.API.error(JSON.stringify(e));
	});

	bannerAd.addEventListener('load', function (e) {
		Titanium.API.info("Banner Ad load");
	});

	bannerAd.addEventListener('fail', function (e) {
		Titanium.API.info("Banner Ad fail");
		Ti.API.error(JSON.stringify(e));
	});
}

/* interstitial Ads */
if(OS_IOS) {
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
} else {
	var interstitialAd = Admob.createView({
		viewType: Admob.TYPE_ADS,
		adSizeType: Admob.INTERSTITIAL,
		testDeviceId: "AD119416FA7E9487D4E1EDDE07856B7D", //USE YOUR DEVICE ID HERE
		adUnitId: 'ca-app-pub-3940256099942544/1033173712', //USE YOUR AD_UNIT ID HERE
	});
	//$.testAdsWin.add(interstitialAd);

	interstitialAd.addEventListener(Admob.AD_LOADED, function (e) {
		Titanium.API.warn("Interstital Ad Loaded");
		//interstitialAd.showInterstitialAd();
		$.interstitialButton.title = "Show interstitial Ad";
	});

	interstitialAd.addEventListener(Admob.AD_RECEIVED, function (e) {
		Titanium.API.warn("Interstital Ad Received");
		$.interstitialButton.title = "Show interstitial Ad";
		//interstitialAd.showInterstitialAd();
	});

	interstitialAd.addEventListener(Admob.AD_NOT_RECEIVED, function (e) {
		Titanium.API.error("Interstital Ad failed");
		console.log(JSON.stringify(e));
		$.interstitialButton.title = "Load interstitial Ad";
		$.testAdsWin.add(interstitialAd);
	});

	interstitialAd.addEventListener(Admob.AD_CLOSED, function (e) {
		Titanium.API.warn("Interstital ad close successfully. RIP!");
		$.interstitialButton.title = "Load interstitial Ad";
	});
}

function showInterstitial() {
	if ($.interstitialButton.title === "Load interstitial Ad") {
		console.log("showInterstitial --> LOAD");
		$.testAdsWin.add(interstitialAd);
	} else {
		console.log("showInterstitial --> SHOW");
		interstitialAd.showInterstitialAd();
		$.interstitialButton.title = "Load interstitial Ad";
		$.testAdsWin.remove(interstitialAd);
	}	
	return;
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
if (OS_IOS) {
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
} else {
	var rewarded = Admob.createView({
		viewType: Admob.TYPE_ADS,
		adSizeType: Admob.REWARDED, // or Admob.REWARDED_INTERSTITIAL
		//testDeviceId: "AD119416FA7E9487D4E1EDDE07856B7D", //USE YOUR DEVICE ID HERE
		adUnitId: 'ca-app-pub-3940256099942544/5224354917', //USE YOUR AD_UNIT ID HERE
		extras: {}
	});	
	/*setTimeout(() => {		
		Ti.API.info("AGGIUNGI REWARDDDDD");
		$.testAdsWin.add(rewarded);
		addAdEventListeners();
	}, 0);*/

	rewarded.addEventListener(Admob.AD_LOADED, function (e) {
		Titanium.API.info("Rewarded Ad AD_LOADED");
		enableRewardedVideoButton();
		//rewarded.showRewardedAd();
	});

	rewarded.addEventListener(Admob.AD_REWARDED, function (e) {
		Titanium.API.info("Rewarded Ad AD_REWARDED");
		Titanium.API.info("Yay! You can give the user his reward now!");
		Titanium.API.info(JSON.stringify(e));
		disableRewardedVideoButton();
		//rewarded.requestNewRewardedAd();
	});

	rewarded.addEventListener(Admob.AD_OPENED, function (e) {
		Titanium.API.info("Rewarded Ad AD_OPENED");
		ùdisableRewardedVideoButton();
	});

	rewarded.addEventListener(Admob.AD_FAILED_TO_SHOW, function (e) {
		Titanium.API.info("Rewarded Ad AD_FAILED_TO_SHOW");
		disableRewardedVideoButton();
	});

	rewarded.addEventListener(Admob.AD_CLOSED, function (e) {
		Titanium.API.info("Rewarded Ad AD_CLOSED");
		disableRewardedVideoButton();
	});
	/*
	function addAdEventListeners() {
		rewarded.addEventListener(Admob.AD_RECEIVED, ()=>{alert("AD_RECEIVED")});
		rewarded.addEventListener(Admob.AD_LOADED, ()=>{alert("AD_LOADED")});
		rewarded.addEventListener(Admob.AD_REWARDED, ()=>{alert("AD_REWARDED")});
		rewarded.addEventListener(Admob.AD_CLOSED, ()=>{alert("AD_CLOSED")});
		rewarded.addEventListener(Admob.AD_NOT_RECEIVED, ()=>{alert("AD_NOT_RECEIVED")});
	};
	*/
}

function showRewarded() {
	if ($.rewardedVideoButton.title === "Load Rewarded Video Ad") {
		console.log("showRewarded --> LOAD");
		$.testAdsWin.add(rewarded);
	} else {
		console.log("showRewarded --> SHOW");
		$.rewardedVideoButton.title = "Load Rewarded Video Ad";
		rewarded.showRewardedAd();
		$.testAdsWin.remove(rewarded);
	}
	//console.log("showRewarded");
	//$.testAdsWin.add(rewarded);
	//rewarded.showRewardedAd();
	//rewarded.requestNewRewardedAd();	
	//return;
	//disableRewardedVideoButton();
	//$.rewardedVideoButton.title = "Load Rewarded Video Ad";
	//rewardedVideo.receive();
};

function disableRewardedVideoButton() {
	//$.rewardedVideoButton.enabled = false;	
	setTimeout(() => {
		$.rewardedVideoButton.title = "Load Rewarded Video Ad";
	}, 10);
}
function enableRewardedVideoButton() {
	//$.rewardedVideoButton.enabled = true;
	setTimeout(() => {
		$.rewardedVideoButton.title = 'Show Rewarded Video Ad';
	}, 10);
}

function closeWin() {
	$.testAdsWin.close();
}

/*
var ad, adUnitId;
var adAddedToWin = false;
var AdmobRewarded = require("ti.android.admob");
setTimeout(function () {
	loadRewardedVideo();
}, 2000);

function loadRewardedVideo() {
	Ti.API.debug('loadRewardedVideo');
	if (adAddedToWin) {
		removeAdEventListeners();
		$.testAdsWin.remove(ad);
		ad = null;
	}
	setTimeout(function () {
		adUnitId = 'ca-app-pub-3940256099942544/5224354917';
		ad = AdmobRewarded.createView({
			viewType: AdmobRewarded.TYPE_ADS,
			adSizeType: AdmobRewarded.REWARDED,
			//testDeviceId : "CBB9E9CAA4291A71E510627CEFC530AA", //USE YOUR DEVICE ID HERE
			adUnitId: adUnitId, //USE YOUR AD_UNIT ID HERE
			extras: {}
		});
		$.testAdsWin.add(ad);
		adAddedToWin = true;		
		addAdEventListeners();
		//ad.requestNewRewardedAd(); // lo carica in automatico con $.testAdsWin.add(ad);
	}, 1000);
}

function AD_RECEIVED() {
	Ti.API.debug('Did receive rewarded ad!');
	//Ti.API.debug(adUnitId);
	//Alloy.Globals.adMob.config.rewarded.loaded = true;
}

function AD_LOADED() {
	Ti.API.debug('Rewarded Ad AD_LOADED');
	//Ti.API.debug(adUnitId);
	//Alloy.Globals.adMob.config.rewarded.loaded = true;
	ad.showRewardedAd();
}

function AD_REWARDED(reward) {
	Ti.API.debug(`Received reward! type: ${reward.type}, amount: ${reward.amount}`);
	//Ti.API.debug('Reward:' + JSON.stringify(reward));
	
	Ti.UI.createAlertDialog({
		title: L('big_days'),
		message: String.format(L('eventi_guadagnati'), reward.amount.toString()),
		buttonNames: ['OK']
	}).show();

	// pre load next rewarded video
	loadRewardedVideo();
}

function AD_CLOSED() {
	Ti.API.debug('No gold for you!');
	loadRewardedVideo();
}

function AD_NOT_RECEIVED(error) {
	Ti.API.error('Rewarded video ad failed to load: ' + error.message);
	//Ti.API.debug(adUnitId);
	loadRewardedVideo();
}

function addAdEventListeners() {
	ad.addEventListener(AdmobRewarded.AD_RECEIVED, AD_RECEIVED);
	ad.addEventListener(AdmobRewarded.AD_LOADED, AD_LOADED);
	ad.addEventListener(AdmobRewarded.AD_REWARDED, AD_REWARDED);
	ad.addEventListener(AdmobRewarded.AD_CLOSED, AD_CLOSED);
	ad.addEventListener(AdmobRewarded.AD_NOT_RECEIVED, AD_NOT_RECEIVED);
}

function removeAdEventListeners() {
	ad.removeEventListener(AdmobRewarded.AD_RECEIVED, AD_RECEIVED);
	ad.removeEventListener(AdmobRewarded.AD_LOADED, AD_LOADED);
	ad.removeEventListener(AdmobRewarded.AD_REWARDED, AD_REWARDED);
	ad.removeEventListener(AdmobRewarded.AD_CLOSED, AD_CLOSED);
	ad.removeEventListener(AdmobRewarded.AD_NOT_RECEIVED, AD_NOT_RECEIVED);
}
*/