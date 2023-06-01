let Admob;
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
	let bannerAdView = Admob.createView({
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
		console.debug('BannerAdView - Did receive ad: ' + e.adUnitId);
		console.debug(e)
	});
	bannerAdView.addEventListener('didFailToReceiveAd', function (e) {
		console.error('BannerAdView - Failed to receive ad: ' + e.error);
	});
	bannerAdView.addEventListener('didRecordImpression', function (e) {
		console.debug('BannerAdView - didRecordImpression: ' + e.adUnitId);
	});
	bannerAdView.addEventListener('didRecordClick', function (e) {
		console.debug('BannerAdView - didRecordClick: ' + e.adUnitId);
	});
	bannerAdView.addEventListener('willPresentScreen', function (e) {
		console.error('BannerAdView - willPresentScreen: ' + e.adUnitId);
	});
	bannerAdView.addEventListener('willDismissScreen', function (e) {
		console.debug('BannerAdView - willDismissScreen: ' + e.adUnitId);
	});
	bannerAdView.addEventListener('didDismissScreen', function (e) {
		console.debug('BannerAdView - Dismissed screen: ' + e.adUnitId);
	});	
} else {
	let v = Ti.UI.createView({
		bottom: 0,
		height: 100
	})
	let bannerAd = Admob.createBanner({
		bottom: 0,
		width: "100%",
		height: 100,
		viewType: Admob.TYPE_ADS,
		// You can use the supported adView sizes: BANNER, LARGE_BANNER, SMART_BANNER, MEDIUM_RECTANGLE, FULLBANNER, LEADERBOARD
		//adSizeType: Admob.BANNER,
		// OR a custom size, like this:
		customAdSize: {
		    height: 100,
		    width: parseInt(Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor)
		},
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
let interstitialAd;
if (OS_IOS) {
	interstitialAd = Admob.createView({
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
	interstitialAd.addEventListener('didReceiveAd', function (e) {
		console.debug('interstitialAd - didReceiveAd: Did receive ad: ' + e.adUnitId);
		console.debug(e);
		$.interstitialButton.title = "Show interstitial Ad";
	});	
	interstitialAd.addEventListener('didFailToReceiveAd', function (e) {
		console.error('interstitialAd - Failed to receive ad: ' + e.error);
		$.interstitialButton.title = "Load interstitial Ad";
		$.testAdsWin.remove(interstitialAd);
	});
	interstitialAd.addEventListener('didRecordClick', function (e) {
		console.debug('interstitialAd - didRecordClick: ' + e.adUnitId);
	});
	interstitialAd.addEventListener('didDismissScreen', function (e) {
		console.debug('interstitialAd - Dismissed screen: ' + e.adUnitId);
		$.testAdsWin.remove(interstitialAd);
	});
	interstitialAd.addEventListener('willPresentScreen', function (e) {
		console.debug('interstitialAd - willPresentScreen: ' + e.adUnitId);
	});
	interstitialAd.addEventListener('willDismissScreen', function (e) {
		console.debug('interstitialAd - willDismissScreen: ' + e.adUnitId);
	});
	interstitialAd.addEventListener('didRecordImpression', function (e) {
		console.debug('interstitialAd- didRecordImpression: ' + e.adUnitId);
	});
} else {	
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
let rewardedVideo, rewarded;
if (OS_IOS) {
	rewardedVideo = Admob.createView({
		debugEnabled: false,
		adType: Admob.AD_TYPE_REWARDED_VIDEO,
		adUnitId: 'ca-app-pub-3940256099942544/1712485313',
		extras: {
			'version': 1.0,
			'name': 'My App'
		} // Object of additional infos
	});	
	
	rewardedVideo.addEventListener('didRewardUser', function (reward) {
		console.debug('rewardedVideo - didRewardUser');
		console.debug(`Received reward! type: ${reward.type}, amount: ${reward.amount}`);
		console.debug(reward);
		disableRewardedVideoButton();
		alert("Well! Amount earned: " + reward.amount);
	});
	rewardedVideo.addEventListener('adclosed', function () {
		console.debug('rewardedVideo - adclosed: No gold for you!');
		enableRewardedVideoButton();
	});	
	rewardedVideo.addEventListener('didReceiveAd', function (e) {
		console.debug('rewardedVideo - Did receive ad: ' + e.adUnitId);
		console.debug(e);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didFailToReceiveAd', function (e) {
		console.error('rewardedVideo - Failed to receive ad: ' + e.error);
		disableRewardedVideoButton();
	});	
	rewardedVideo.addEventListener('didDismissScreen', function (e) {
		console.debug('rewardedVideo - Dismissed screen: ' + e.adUnitId);
		disableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('willPresentScreen', function (e) {
		console.debug('rewardedVideo - willPresentScreen: ' + e.adUnitId);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('willDismissScreen', function (e) {
		console.debug('rewardedVideo - willDismissScreen: ' + e.adUnitId);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener('didRecordImpression', function (e) {
		console.debug('rewardedVideo - didRecordImpression: ' + e.adUnitId);
		disableRewardedVideoButton();
	});
} else {	
	let androidRewardedLoaded = false;
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

/* OpenApp Ad */
let appOpenAd;
function loadOpenAd() {
	const reload_max_tries_case_error = 4;
	let reload_max_tries = 0;

	function reloadAppOpenAd() {
		if (reload_max_tries < reload_max_tries_case_error) {
			setTimeout(() => {
				if (OS_IOS) {
					appOpenAd.requestAppOpenAd();
				} else {
					appOpenAd.load();
				}
			}, 10000);
		}
		reload_max_tries += 1;
	}

	if (OS_IOS) {
		appOpenAd = Admob.createView({
			debugEnabled: false,
			adType: Admob.AD_TYPE_APP_OPEN,
			adUnitId: 'ca-app-pub-3940256099942544/5662855259', // You can get your own at http: //www.admob.com/
			extras: {
				'version': 1.0,
				'name': 'My App'
			} // Object of additional infos
		});		
		
		// appOpenAd custom events
		appOpenAd.addEventListener('didReceiveAd', function (e) {
			console.debug('appOpenAd - didReceiveAd: Did receive ad: ' + e.adUnitId);
			console.debug(e);
			reload_max_tries = 0;
			Titanium.App.Properties.setDouble('appOpenAdLoadTime', (new Date().getTime()));
		});		
		appOpenAd.addEventListener('didFailToShowAd', function (e) {
			console.error('appOpenAd - Failed to show: ' + e.error);
			reloadAppOpenAd();
		});

		// appOpenAd AdMob avents
		appOpenAd.addEventListener('didRecordClick', function (e) {
			console.debug('appOpenAd - didRecordClick: ' + e.adUnitId);
		});
		appOpenAd.addEventListener('didFailToReceiveAd', function (e) {
			console.error('appOpenAd - Failed to receive ad: ' + e.error);
			reloadAppOpenAd();
		});		
		appOpenAd.addEventListener('didDismissScreen', function (e) {
			console.debug('appOpenAd - Dismissed screen: ' + e.adUnitId);
			Titanium.App.Properties.setDouble('lastTimeAppOpenAdWasShown', (new Date().getTime()));
			appOpenAd.requestAppOpenAd();
		});
		appOpenAd.addEventListener('willPresentScreen', function (e) {
			console.debug('appOpenAd - willPresentScreen: ' + e.adUnitId);
		});
		appOpenAd.addEventListener('willDismissScreen', function (e) {
			console.debug('appOpenAd - willDismissScreen: ' + e.adUnitId);
		});
		appOpenAd.addEventListener('didRecordImpression', function (e) {
			console.debug('appOpenAd- didRecordImpression: ' + e.adUnitId);
		});

		console.log("appOpenAd.receive();")
		appOpenAd.receive();
	} else {
		appOpenAd = Admob.createAppOpenAd({
			adUnitId: "ca-app-pub-3940256099942544/3419835294", //USE YOUR AD_UNIT
		});

		appOpenAd.addEventListener(Admob.AD_FAILED_TO_SHOW, function (e) {
			Titanium.API.error("======================== AppOpenAd - Failed to show ads ========================");
			Titanium.API.warn({
				"message": e.message,
				"cause": e.cause,
				"code": e.code
			});
			reloadAppOpenAd();
		});

		appOpenAd.addEventListener(Admob.AD_SHOWED_FULLSCREEN_CONTENT, function () {
			Titanium.API.info("======================== AppOpenAd - showed ads successfully ========================");
		});

		appOpenAd.addEventListener(Admob.AD_FAILED_TO_LOAD, function (e) {
			Titanium.API.error("======================== AppOpenAd - failed to load ads ========================");
			Titanium.API.warn({
				"message": e.message,
				"reason": e.reason,
				"cause": e.cause,
				"code": e.code
			});
			reloadAppOpenAd();
		});

		appOpenAd.addEventListener(Admob.AD_LOADED, function (e) {
			Titanium.API.warn("======================== AppOpenAd - Ads Loaded and ready ========================");
			reload_max_tries = 0;
			Titanium.App.Properties.setDouble('appOpenAdLoadTime', (new Date().getTime()));
		});

		appOpenAd.addEventListener(Admob.AD_CLOSED, function (e) {
			Titanium.API.warn("======================== AppOpenAd ad - CLOSED ========================");
			Titanium.App.Properties.setDouble('lastTimeAppOpenAdWasShown', (new Date().getTime()));
			appOpenAd.load();
		});

		appOpenAd.addEventListener(Admob.AD_NOT_READY, function (e) {
			Titanium.API.warn("======================== AppOpenAd ad - AD_NOT_READY ========================");
			Titanium.API.warn(e.message);
		});
	}
	
}

function resumeOpenAd() {
	let currentTime = (new Date().getTime());
	let loadTime = Titanium.App.Properties.getDouble('appOpenAdLoadTime', currentTime);
	let lastTimeAppOpenAdWasShown = Titanium.App.Properties.getDouble('lastTimeAppOpenAdWasShown', 1);

	if ((currentTime - loadTime) < 14400000) { // then less than 4 hours elapsed.
		if ((currentTime - lastTimeAppOpenAdWasShown) > 600000) { // then more than 10 minutes elapsed after the last Ad showed.
			if (OS_IOS) {
				console.log("appOpenAd.showAppOpenAd()!")
				setTimeout(() => {
					try {
						appOpenAd.showAppOpenAd();
					} catch (error) {
						console.error(error);
						Titanium.App.removeEventListener('resume', resumeOpenAd);
						setTimeout(() => {
							loadOpenAd();
							Titanium.App.addEventListener('resume', resumeOpenAd);
						}, 500);
					}					
				}, 500);				
			} else if (OS_ANDROID) {
				appOpenAd.show();
			}
			
		} else {
			Titanium.API.warn("You have showned an AppOpenAd less than 10 minutes ago. You should wait!");
		}
	} else {
		Titanium.API.warn("The AppOpenAd was requested more than 4 hours ago and has expired! You should load another one.");
		Titanium.App.removeEventListener('resume', resumeOpenAd);
		setTimeout(() => {
			loadOpenAd();
			Titanium.App.addEventListener('resume', resumeOpenAd);
		}, 500);
	}
}

loadOpenAd();
Titanium.App.addEventListener('resume', resumeOpenAd);

function closeWin() {
	Titanium.App.removeEventListener('resume', resumeOpenAd);
	$.testAdsWin.close();
}