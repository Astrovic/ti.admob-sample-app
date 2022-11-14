var Admob;
if (OS_IOS) {
	Admob = require('ti.admob');
	if (Admob.trackingAuthorizationStatus === Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED) {
		Ti.API.info("Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED, enable personalized ads in ads mediation too")
		Admob.setInMobi_updateGDPRConsent(true);
		Admob.setAdvertiserTrackingEnabled(true);
	}
} else {
	Admob = require("ti.android.admob");
	Admob.setTestDeviceId("4E9D70AA851097F0E3F3D0486FDBF60B"); //USE YOUR DEVICE ID HERE
}

if (OS_IOS) {
	/* Banner ads */
	var bannerAdView = Admob.createView({
		debugEnabled: false,
		height: 100,
		bottom: 50,
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
	setTimeout(() => {
		console.log("Add banner!")
		$.testAdsWin.add(bannerAdView);
	}, 2000);


	bannerAdView.addEventListener('didReceiveAd', function (e) {
		console.log(e)
		Ti.API.info('BannerAdView - Did receive ad: ' + e.adUnitId + '!');
	});
	bannerAdView.addEventListener('didFailToReceiveAd', function (e) {
		Ti.API.error('BannerAdView - Failed to receive ad: ' + e.error);
	});
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
	var v = Ti.UI.createView({
		bottom: 0,
		height: 100
	})
	var bannerAd = Admob.createView({
		bottom: 0,
		width: "100%",
		height: 100,
		viewType: Admob.TYPE_ADS,
		adSizeType: Admob.ADAPTATIVE_BANNER, // ADAPTATIVE_BANNER, LARGE_BANNER, SMART_BANNER, FULLBANNER, LEADERBOARD, FLUID, WIDE_SKYSCRAPER		
		adUnitId: 'ca-app-pub-3940256099942544/6300978111',
		extras: {
			'npa': 1
		},
		testDeviceId: "4E9D70AA851097F0E3F3D0486FDBF60B", //USE YOUR DEVICE ID HERE		
	});
	v.add(bannerAd);
	setTimeout(() => {
		console.log("Add banner!")
		$.testAdsWin.add(v);
	}, 2000);	

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
if (OS_IOS) {
	var interstitialAd = Admob.createView({
		debugEnabled: false, // If enabled, a dummy value for `adUnitId` will be used to test
		adType: Admob.AD_TYPE_INTERSTITIAL,
		adUnitId: 'ca-app-pub-3940256099942544/4411468910', // You can get your own at http: //www.admob.com/
		keywords: ['keyword1', 'keyword2'],
		extras: {
			'version': 1.0,
			'name': 'My App'
		}, // Object of additional infos
		visible: false // If true, covers the win when added and can't tap nothing
	});
	interstitialAd.addEventListener('adloaded', function (e) {
		Ti.API.info('interstitialAd - adloaded: Did receive ad!');
		console.log(e);
		//interstitialAd.showInterstitial();
		$.interstitialButton.title = "Show interstitial Ad";
		enableInterstitialButton();
	});

	interstitialAd.addEventListener('didReceiveAd', function (e) {
		Ti.API.info('interstitialAd - Did receive ad!');
		$.interstitialButton.title = "Show interstitial Ad";
		console.log(e);
		enableInterstitialButton();
	});
	interstitialAd.addEventListener('didFailToReceiveAd', function (e) {
		Ti.API.error('interstitialAd - Failed to receive ad: ' + e.error);
		$.interstitialButton.title = "Load interstitial Ad";
		$.testAdsWin.remove(interstitialAd);
		enableInterstitialButton();
	});
	interstitialAd.addEventListener('didPresentScreen', function (e) {
		Ti.API.info('interstitialAd - didPresentScreen: ' + e.adUnitId);
		enableInterstitialButton();
	});
	interstitialAd.addEventListener('didDismissScreen', function (e) {
		Ti.API.info('interstitialAd - Dismissed screen: ' + e.adUnitId);
		$.testAdsWin.remove(interstitialAd);
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
	var interstitialAd;
	setTimeout(() => {
		interstitialAd = Admob.createView({
			viewType: Admob.TYPE_ADS,
			adSizeType: Admob.INTERSTITIAL,
			testDeviceId: "AD119416FA7E9487D4E1EDDE07856B7D", //USE YOUR DEVICE ID HERE
			adUnitId: 'ca-app-pub-3940256099942544/1033173712', //USE YOUR AD_UNIT ID HERE
		});

		interstitialAd.addEventListener(Admob.AD_LOADED, function (e) {
			Titanium.API.warn("Interstital Ad Loaded");
			$.interstitialButton.title = "Show interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_RECEIVED, function (e) {
			Titanium.API.warn("Interstital Ad Received");
			$.interstitialButton.title = "Show interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_NOT_RECEIVED, function (e) {
			Titanium.API.error("Interstital Ad failed");
			console.log(JSON.stringify(e));
		});
		interstitialAd.addEventListener(Admob.AD_CLOSED, function (e) {
			Titanium.API.warn("Interstital ad close successfully. RIP!");
			$.interstitialButton.title = "Load interstitial Ad";
			$.testAdsWin.remove(interstitialAd);
		});
	}, 2000);
}

function showInterstitial() {
	if ($.interstitialButton.title === "Load interstitial Ad") {
		console.log("showInterstitial --> LOAD");
		$.testAdsWin.add(interstitialAd);
	} else {
		console.log("showInterstitial --> SHOW");
		if (OS_IOS) {
			interstitialAd.showInterstitial()
		} else {
			interstitialAd.showInterstitialAd();
		}
		$.interstitialButton.title = "Load interstitial Ad";
	}
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

	rewardedVideo.addEventListener('adloaded', function (e) {
		Ti.API.debug('rewardedVideo - Rewarded video loaded!');
		console.log(e);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('adrewarded', function (reward) {
		Ti.API.debug('rewardedVideo -adrewarded');
		Ti.API.debug(`Received reward! type: ${reward.type}, amount: ${reward.amount}`);
		console.log(reward);
		disableRewardedVideoButton();
		alert("Well! Amount earned: " + reward.amount);
	});
	rewardedVideo.addEventListener('adclosed', function () {
		Ti.API.debug('rewardedVideo - adclosed: No gold for you!');
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('adfailedtoload', function (error) {
		Ti.API.debug('rewardedVideo - Rewarded video ad failed to load: ' + error.message);
		//enableRewardedVideoButton();
		disableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didReceiveAd', function (e) {
		Ti.API.info('rewardedVideo - Did receive ad!');
		console.log(e);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didFailToReceiveAd', function (e) {
		Ti.API.error('rewardedVideo - Failed to receive ad: ' + e.error);
		//enableRewardedVideoButton();
		disableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didPresentScreen', function (e) {
		Ti.API.info('rewardedVideo - didPresentScreen: ' + e.adUnitId);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didDismissScreen', function (e) {
		Ti.API.info('rewardedVideo - Dismissed screen: ' + e.adUnitId);
		//enableRewardedVideoButton();
		disableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('willDismissScreen', function (e) {
		Ti.API.info('rewardedVideo - willDismissScreen: ' + e.adUnitId);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didRecordImpression', function (e) {
		Ti.API.info('rewardedVideo - didRecordImpression');
		console.log(e);
		disableRewardedVideoButton();
	});
} else {
	var rewarded;
	var androidRewardedAddedToWin = false;
	setTimeout(() => {
		rewarded = Admob.createView({
			viewType: Admob.TYPE_ADS,
			adSizeType: Admob.REWARDED, // or Admob.REWARDED_INTERSTITIAL
			//testDeviceId: "AD119416FA7E9487D4E1EDDE07856B7D", //USE YOUR DEVICE ID HERE
			adUnitId: 'ca-app-pub-3940256099942544/5224354917', //USE YOUR AD_UNIT ID HERE
			extras: {}
		});

		function AD_LOADED(e) {
			Titanium.API.info("Rewarded Ad AD_LOADED");
			enableRewardedVideoButton();
		};

		function AD_REWARDED(e) {
			Titanium.API.info("Rewarded Ad AD_REWARDED");
			Titanium.API.info("Yay! You can give the user his reward now!");
			Titanium.API.info(JSON.stringify(e));
			alert("Well! Amount earned: " + e.amount);
			disableRewardedVideoButton();
		};

		function AD_NOT_RECEIVED(e) {
			Titanium.API.info("Rewarded Ad AD_NOT_RECEIVED");
			disableRewardedVideoButton();
		};

		function AD_CLOSED(e) {
			Titanium.API.info("Rewarded Ad AD_CLOSED, no gold for you!");
			disableRewardedVideoButton();
		};

		function addAdEventListeners() {
			rewarded.addEventListener(Admob.AD_LOADED, AD_LOADED);
			rewarded.addEventListener(Admob.AD_REWARDED, AD_REWARDED);
			rewarded.addEventListener(Admob.AD_CLOSED, AD_CLOSED);
			rewarded.addEventListener(Admob.AD_NOT_RECEIVED, AD_NOT_RECEIVED);
		}
		addAdEventListeners();

	}, 4000);
}

function showRewarded() {
	if ($.rewardedVideoButton.title === "Load Rewarded Video Ad") {
		console.log("showRewarded --> LOAD");
		if (OS_ANDROID) {
			if (androidRewardedAddedToWin) {
				console.log("requestNewRewardedAd()");
				rewarded.requestNewRewardedAd();
			} else {
				$.testAdsWin.add(rewarded);
				androidRewardedAddedToWin = true;
			}
		} else {
			rewardedVideo.receive();
		}
	} else {
		console.log("showRewarded --> SHOW");
		$.rewardedVideoButton.title = "Load Rewarded Video Ad";
		if (OS_ANDROID) {
			rewarded.showRewardedAd();
		} else {
			rewardedVideo.showRewardedVideo();
		}
	}
};

function disableRewardedVideoButton() {
	setTimeout(() => {
		$.rewardedVideoButton.title = "Load Rewarded Video Ad";
	}, 10);
}

function enableRewardedVideoButton() {
	setTimeout(() => {
		$.rewardedVideoButton.title = 'Show Rewarded Video Ad';
	}, 10);
}

function closeWin() {
	$.testAdsWin.close();
}