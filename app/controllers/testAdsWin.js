var Admob;
if (OS_IOS) {
	Admob = require('ti.admob');
	if (Admob.trackingAuthorizationStatus === Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED) {
		console.debug("Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED, enable personalized ads in ads mediation too")
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
		console.debug("Add banner!")
		$.testAdsWin.add(bannerAdView);
	}, 2000);


	bannerAdView.addEventListener('didReceiveAd', function (e) {
		console.debug(e)
		console.debug('BannerAdView - Did receive ad: ' + e.adUnitId + '!');
	});
	bannerAdView.addEventListener('didFailToReceiveAd', function (e) {
		console.error('BannerAdView - Failed to receive ad: ' + e.error);
	});
	bannerAdView.addEventListener('willPresentScreen', function (e) {
		console.error('BannerAdView - willPresentScreen');
	});
	bannerAdView.addEventListener('willDismissScreen', function () {
		console.debug('BannerAdView - willDismissScreen!');
	});
	bannerAdView.addEventListener('didDismissScreen', function () {
		console.debug('BannerAdView - Dismissed screen!');
	});
	bannerAdView.addEventListener('didPresentScreen', function (e) {
		console.debug('BannerAdView - Presenting screen!' + e.adUnitId);
	});
} else {
	var v = Ti.UI.createView({
		bottom: 0,
		height: 100
	})
	var bannerAd = Admob.createAdaptiveBanner({
		bottom: 0,
		width: "100%",
		height: 100,
		viewType: Admob.TYPE_ADS,
		adSizeType: Admob.BANNER, // LARGE_BANNER, SMART_BANNER, MEDIUM_RECTANGLE, FULLBANNER, LEADERBOARD
		adUnitId: 'ca-app-pub-3940256099942544/9214589741',
		extras: {
			'npa': 1
		},
		testDeviceId: "4E9D70AA851097F0E3F3D0486FDBF60B", //USE YOUR DEVICE ID HERE
	});
	v.add(bannerAd);
	setTimeout(() => {
		console.debug("Add banner!")
		$.testAdsWin.add(v);
	}, 2000);	

	bannerAd.addEventListener(Admob.AD_LOADED, function (e) {
		console.debug("Banner Ad loaded");
	});
	bannerAd.addEventListener(Admob.AD_FAILED_TO_LOAD, function (e) {
		console.debug("Banner Ad failed to load");
		console.error(JSON.stringify(e));
	});
	bannerAd.addEventListener(Admob.AD_DESTROYED, function (e) {
		console.debug("Banner Ad destroied");
	});
	bannerAd.addEventListener(Admob.AD_OPENED, function (e) {
		console.debug("Banner Ad opened");
	});
	bannerAd.addEventListener(Admob.AD_CLICKED, function (e) {
		console.debug("Banner Ad ckicked");
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
		console.debug('interstitialAd - adloaded: Did receive ad!');
		console.debug(e);
		$.interstitialButton.title = "Show interstitial Ad";
	});

	interstitialAd.addEventListener('didReceiveAd', function (e) {
		console.debug('interstitialAd - Did receive ad!');
		$.interstitialButton.title = "Show interstitial Ad";
		console.debug(e);
	});
	interstitialAd.addEventListener('didFailToReceiveAd', function (e) {
		console.error('interstitialAd - Failed to receive ad: ' + e.error);
		$.interstitialButton.title = "Load interstitial Ad";
		$.testAdsWin.remove(interstitialAd);
	});
	interstitialAd.addEventListener('didPresentScreen', function (e) {
		console.debug('interstitialAd - didPresentScreen: ' + e.adUnitId);
	});
	interstitialAd.addEventListener('didDismissScreen', function (e) {
		console.debug('interstitialAd - Dismissed screen: ' + e.adUnitId);
		$.testAdsWin.remove(interstitialAd);
	});
	interstitialAd.addEventListener('willDismissScreen', function (e) {
		console.debug('interstitialAd - willDismissScreen: ' + e.adUnitId);
	});
	interstitialAd.addEventListener('didRecordImpression', function (e) {
		console.debug('interstitialAd- didRecordImpression');
		console.debug(e);
	});
} else {
	var interstitialAd;
	setTimeout(() => {
		interstitialAd = Admob.createInterstitial({
			viewType: Admob.TYPE_ADS,
			adSizeType: Admob.INTERSTITIAL,
			testDeviceId: "AD119416FA7E9487D4E1EDDE07856B7D", //USE YOUR DEVICE ID HERE
			adUnitId: 'ca-app-pub-3940256099942544/1033173712', //USE YOUR AD_UNIT ID HERE
		});

		interstitialAd.addEventListener(Admob.AD_LOADED, function (e) {
			console.debug("Interstital Ad loaded");
			$.interstitialButton.title = "Show interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_FAILED_TO_LOAD, function (e) {
			console.error("Interstital Ad failed to load");
			console.debug(JSON.stringify(e));
			$.interstitialButton.title = "Load interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_DESTROYED, function (e) {
			console.error("Interstital Ad destroyed");
			$.interstitialButton.title = "Load interstitial Ad";
		});	
		interstitialAd.addEventListener(Admob.AD_CLOSED, function (e) {
			console.debug("Interstital ad close successfully. RIP!");
			$.interstitialButton.title = "Load interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_FAILED_TO_SHOW, function (e) {
			console.error("Fullscreen Failed to show ads - Loading Screen");
			$.interstitialButton.title = "Load interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_SHOWED_FULLSCREEN_CONTENT, function (e) {
			console.debug("Fullscreen showed ads successfully - Loading Screen");
		});
		interstitialAd.addEventListener(Admob.AD_CLICKED, function (e) {
			console.debug("Interstital Ad ckicked");
		});
		
	}, 2000);
}

function showInterstitial() {
	if ($.interstitialButton.title === "Load interstitial Ad") {
		console.debug("showInterstitial --> LOAD");
		if (OS_IOS) {
			$.testAdsWin.add(interstitialAd);
		} else {
			interstitialAd.load();
		}		
	} else {
		console.debug("showInterstitial --> SHOW");
		if (OS_IOS) {
			interstitialAd.showInterstitial()
		} else {
			interstitialAd.show();
		}
		$.interstitialButton.title = "Load interstitial Ad";
	}
};

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
		console.debug('rewardedVideo - Rewarded video loaded!');
		console.debug(e);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('adrewarded', function (reward) {
		console.debug('rewardedVideo -adrewarded');
		console.debug(`Received reward! type: ${reward.type}, amount: ${reward.amount}`);
		console.debug(reward);
		disableRewardedVideoButton();
		alert("Well! Amount earned: " + reward.amount);
	});
	rewardedVideo.addEventListener('adclosed', function () {
		console.debug('rewardedVideo - adclosed: No gold for you!');
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('adfailedtoload', function (error) {
		console.debug('rewardedVideo - Rewarded video ad failed to load: ' + error.message);
		disableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didReceiveAd', function (e) {
		console.debug('rewardedVideo - Did receive ad!');
		console.debug(e);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didFailToReceiveAd', function (e) {
		console.error('rewardedVideo - Failed to receive ad: ' + e.error);
		disableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didPresentScreen', function (e) {
		console.debug('rewardedVideo - didPresentScreen: ' + e.adUnitId);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didDismissScreen', function (e) {
		console.debug('rewardedVideo - Dismissed screen: ' + e.adUnitId);
		disableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('willDismissScreen', function (e) {
		console.debug('rewardedVideo - willDismissScreen: ' + e.adUnitId);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didRecordImpression', function (e) {
		console.debug('rewardedVideo - didRecordImpression');
		console.debug(e);
		disableRewardedVideoButton();
	});
} else {
	var rewarded;
	var androidRewardedLoaded = false;
	setTimeout(() => {
		rewarded = Admob.createRewarded({
			viewType: Admob.TYPE_ADS,
			adSizeType: Admob.REWARDED, // or Admob.REWARDED_INTERSTITIAL
			//testDeviceId: "AD119416FA7E9487D4E1EDDE07856B7D", //USE YOUR DEVICE ID HERE
			adUnitId: 'ca-app-pub-3940256099942544/5224354917', //USE YOUR AD_UNIT ID HERE
			extras: {}
		});

		function AD_LOADED(e) {
			console.debug("Rewarded Ad AD_LOADED");
			enableRewardedVideoButton();
			androidRewardedLoaded = true;
		};
		function AD_FAILED_TO_LOAD(e) {
			console.debug("Rewarded Ad AD_FAILED_TO_LOAD");
			disableRewardedVideoButton();
		};
		function AD_DESTROYED(e) {
			console.debug("Rewarded Ad AD_DESTROYED");
			disableRewardedVideoButton();
		};		
		function AD_CLOSED(e) {
			console.debug("Rewarded Ad AD_CLOSED");
			disableRewardedVideoButton();
		};
		function AD_REWARDED(e) {
			console.debug("Rewarded Ad AD_REWARDED");
			console.debug("Yay! You can give the user his reward now!");
			console.debug(JSON.stringify(e));
			alert("Well! Amount earned: " + e.amount);
			disableRewardedVideoButton();
		};
		function AD_FAILED_TO_SHOW(e) {
			console.debug("Rewarded Ad AD_FAILED_TO_SHOW");
			disableRewardedVideoButton();
		};
		function AD_SHOWED_FULLSCREEN_CONTENT(e) {
			console.debug("Rewarded Ad AD_SHOWED_FULLSCREEN_CONTENT");			
		};

		function addAdEventListeners() {			
			rewarded.addEventListener(Admob.AD_LOADED, AD_LOADED);
			rewarded.addEventListener(Admob.AD_FAILED_TO_LOAD, AD_FAILED_TO_LOAD);
			rewarded.addEventListener(Admob.AD_DESTROYED, AD_DESTROYED);
			rewarded.addEventListener(Admob.AD_CLOSED, AD_CLOSED);
			rewarded.addEventListener(Admob.AD_REWARDED, AD_REWARDED);
			rewarded.addEventListener(Admob.AD_FAILED_TO_SHOW, AD_FAILED_TO_SHOW);
			rewarded.addEventListener(Admob.AD_SHOWED_FULLSCREEN_CONTENT, AD_SHOWED_FULLSCREEN_CONTENT);
		}
		addAdEventListeners();

	}, 4000);
}

function showRewarded() {
	if ($.rewardedVideoButton.title === "Load Rewarded Video Ad") {
		console.debug("showRewarded --> LOAD");
		if (OS_ANDROID) {
			if (androidRewardedLoaded) {
				console.debug("requestNewRewardedAd()");
				rewarded.load();
			} else {
				rewarded.load();
				androidRewardedLoaded = true;
			}
		} else {
			rewardedVideo.receive();
		}
	} else {
		console.debug("showRewarded --> SHOW");
		$.rewardedVideoButton.title = "Load Rewarded Video Ad";
		if (OS_ANDROID) {
			rewarded.show();
		} else {
			rewardedVideo.showRewardedVideo();
		}
	}
};

function showMediationTestSuite() {
	if (OS_ANDROID) {
		console.log("showMediationTestSuite!!!");		
		Admob.showMediationTestSuite();
	}
}

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