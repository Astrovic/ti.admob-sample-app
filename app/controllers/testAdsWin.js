/**
 * testAdsWin.js
 * ------------------------------------------------------------
 * Test window for displaying AdMob ad formats:
 *  - Banner Ads
 *  - Interstitial Ads
 *  - Rewarded Video Ads
 *  - App Open Ads
 *
 * This file demonstrates how to integrate and test multiple
 * ad types using the ti.admob / ti.android.admob modules.
 * ------------------------------------------------------------
 */

let Admob;

// ------------------------------------------------------------
//  Initialize AdMob module and test device ID
// ------------------------------------------------------------
if (OS_IOS) {
	Admob = require("ti.admob");

	if (Admob.trackingAuthorizationStatus === Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED) {
		console.debug("Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED, enable personalized ads in ads mediation too");
		Admob.setInMobi_updateGDPRConsent(true);
		Admob.setAdvertiserTrackingEnabled(true);
	}
} else {
	Admob = require("ti.android.admob");
	Admob.setTestDeviceId(Alloy.Globals.admobTestDeviceID); // Use test ID from Alloy.Globals
}

// ============================================================
//  BANNER ADS
// ============================================================
if (OS_IOS) {
	const bannerAdView = Admob.createView({
		debugEnabled: false,
		height: 100,
		bottom: 50,
		adType: Admob.AD_TYPE_BANNER,
		adUnitId: "ca-app-pub-3940256099942544/2934735716", // Test ad unit ID
		adBackgroundColor: "black",
		contentURL: "https://admob.com",
		requestAgent: "Titanium Mobile App",
		extras: {
			version: 1.0,
			name: "My App"
		},
		tagForChildDirectedTreatment: false,
		tagForUnderAgeOfConsent: false,
		maxAdContentRating: Admob.MAX_AD_CONTENT_RATING_GENERAL,
		keywords: ["keyword1", "keyword2"]
	});

	setTimeout(() => {
		console.debug("Add banner!");
		$.bannerContainerView.add(bannerAdView);
	}, 2000);

	// Event listeners
	bannerAdView.addEventListener("didReceiveAd", e => {
		console.debug("BannerAdView - Did receive ad: " + e.adUnitId);
		console.debug(e);
	});
	bannerAdView.addEventListener("didFailToReceiveAd", e => {
		console.error("BannerAdView - Failed to receive ad: " + e.error);
	});
	bannerAdView.addEventListener("didRecordImpression", e => {
		console.debug("BannerAdView - didRecordImpression: " + e.adUnitId);
	});
	bannerAdView.addEventListener("didRecordClick", e => {
		console.debug("BannerAdView - didRecordClick: " + e.adUnitId);
	});
	bannerAdView.addEventListener("willPresentScreen", e => {
		console.error("BannerAdView - willPresentScreen: " + e.adUnitId);
	});
	bannerAdView.addEventListener("willDismissScreen", e => {
		console.debug("BannerAdView - willDismissScreen: " + e.adUnitId);
	});
	bannerAdView.addEventListener("didDismissScreen", e => {
		console.debug("BannerAdView - Dismissed screen: " + e.adUnitId);
	});
} else {
	const bannerAd = Admob.createBanner({
		bottom: 0,
		width: "100%",
		height: 100,
		viewType: Admob.TYPE_ADS,
		customAdSize: {
			height: 100,
			width: parseInt(Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor)
		},
		adUnitId: "ca-app-pub-3940256099942544/9214589741", // Test ad unit ID
		extras: {
			npa: 1
		},
		testDeviceId: Alloy.Globals.admobTestDeviceID
	});
	
	setTimeout(() => {
		console.debug("Add banner!");
		$.bannerContainerView.add(bannerAd);
	}, 2000);

	// Event listeners
	bannerAd.addEventListener(Admob.AD_LOADED, () => console.debug("Banner Ad loaded"));
	bannerAd.addEventListener(Admob.AD_FAILED_TO_LOAD, e => {
		console.debug("Banner Ad failed to load");
		console.error(JSON.stringify(e));
	});
	bannerAd.addEventListener(Admob.AD_DESTROYED, () => console.debug("Banner Ad destroyed"));
	bannerAd.addEventListener(Admob.AD_OPENED, () => console.debug("Banner Ad opened"));
	bannerAd.addEventListener(Admob.AD_CLICKED, () => console.debug("Banner Ad clicked"));
}

// ============================================================
//  INTERSTITIAL ADS
// ============================================================
let interstitialAd;

if (OS_IOS) {
	interstitialAd = Admob.createView({
		debugEnabled: false,
		adType: Admob.AD_TYPE_INTERSTITIAL,
		adUnitId: "ca-app-pub-3940256099942544/4411468910",
		keywords: ["keyword1", "keyword2"],
		extras: {
			version: 1.0,
			name: "My App"
		},
		visible: false,
		tagForChildDirectedTreatment: false,
		tagForUnderAgeOfConsent: false,
		maxAdContentRating: Admob.MAX_AD_CONTENT_RATING_GENERAL
	});

	interstitialAd.addEventListener("didReceiveAd", e => {
		console.debug("interstitialAd - didReceiveAd: " + e.adUnitId);
		console.debug(e);
		$.interstitialButton.title = "Show interstitial Ad";
	});
	interstitialAd.addEventListener("didFailToReceiveAd", e => {
		console.error("interstitialAd - Failed to receive ad: " + e.error);
		$.interstitialButton.title = "Load interstitial Ad";
		$.testAdsWin.remove(interstitialAd);
	});
	interstitialAd.addEventListener("didRecordClick", e => {
		console.debug("interstitialAd - didRecordClick: " + e.adUnitId);
	});
	interstitialAd.addEventListener("didDismissScreen", e => {
		console.debug("interstitialAd - Dismissed screen: " + e.adUnitId);
		$.testAdsWin.remove(interstitialAd);
	});
	interstitialAd.addEventListener("willPresentScreen", e => {
		console.debug("interstitialAd - willPresentScreen: " + e.adUnitId);
	});
	interstitialAd.addEventListener("willDismissScreen", e => {
		console.debug("interstitialAd - willDismissScreen: " + e.adUnitId);
	});
	interstitialAd.addEventListener("didRecordImpression", e => {
		console.debug("interstitialAd - didRecordImpression: " + e.adUnitId);
	});
} else {
	setTimeout(() => {
		interstitialAd = Admob.createInterstitial({
			viewType: Admob.TYPE_ADS,
			adSizeType: Admob.INTERSTITIAL,
			testDeviceId: Alloy.Globals.admobTestDeviceID,
			adUnitId: "ca-app-pub-3940256099942544/1033173712"
		});

		interstitialAd.addEventListener(Admob.AD_LOADED, () => {
			console.debug("Interstitial Ad loaded");
			$.interstitialButton.title = "Show interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_FAILED_TO_LOAD, e => {
			console.error("Interstitial Ad failed to load");
			console.debug(JSON.stringify(e));
			$.interstitialButton.title = "Load interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_DESTROYED, () => {
			console.error("Interstitial Ad destroyed");
			$.interstitialButton.title = "Load interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_CLOSED, () => {
			console.debug("Interstitial Ad closed successfully");
			$.interstitialButton.title = "Load interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_FAILED_TO_SHOW, () => {
			console.error("Interstitial Ad failed to show");
			$.interstitialButton.title = "Load interstitial Ad";
		});
		interstitialAd.addEventListener(Admob.AD_SHOWED_FULLSCREEN_CONTENT, () => {
			console.debug("Interstitial Ad showed successfully");
		});
		interstitialAd.addEventListener(Admob.AD_CLICKED, () => {
			console.debug("Interstitial Ad clicked");
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
			interstitialAd.showInterstitial();
		} else {
			interstitialAd.show();
		}
		$.interstitialButton.title = "Load interstitial Ad";
	}
}

// ============================================================
//  REWARDED VIDEO ADS
// ============================================================
let rewardedVideo, rewarded, androidRewardedLoaded;

if (OS_IOS) {
	rewardedVideo = Admob.createView({
		debugEnabled: false,
		adType: Admob.AD_TYPE_REWARDED_VIDEO,
		adUnitId: "ca-app-pub-3940256099942544/1712485313",
		extras: {
			version: 1.0,
			name: "My App"
		},
		tagForChildDirectedTreatment: false,
		tagForUnderAgeOfConsent: false,
		maxAdContentRating: Admob.MAX_AD_CONTENT_RATING_GENERAL
	});

	rewardedVideo.addEventListener("didRewardUser", reward => {
		console.debug("rewardedVideo - didRewardUser");
		console.debug(`Received reward! type: ${reward.type}, amount: ${reward.amount}`);
		disableRewardedVideoButton();
		alert("Congrats! Amount earned: " + reward.amount);
	});
	rewardedVideo.addEventListener("adclosed", () => {
		console.debug("rewardedVideo - adclosed: No reward this time.");
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener("didReceiveAd", e => {
		console.debug("rewardedVideo - Did receive ad: " + e.adUnitId);
		console.debug(e);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener("didFailToReceiveAd", e => {
		console.error("rewardedVideo - Failed to receive ad: " + e.error);
		disableRewardedVideoButton();
	});
	rewardedVideo.addEventListener("didDismissScreen", e => {
		console.debug("rewardedVideo - Dismissed screen: " + e.adUnitId);
		disableRewardedVideoButton();
	});
	rewardedVideo.addEventListener("willPresentScreen", e => {
		console.debug("rewardedVideo - willPresentScreen: " + e.adUnitId);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener("willDismissScreen", e => {
		console.debug("rewardedVideo - willDismissScreen: " + e.adUnitId);
		enableRewardedVideoButton();
	});
	rewardedVideo.addEventListener("didRecordImpression", e => {
		console.debug("rewardedVideo - didRecordImpression: " + e.adUnitId);
		disableRewardedVideoButton();
	});
} else {
	androidRewardedLoaded = false;

	setTimeout(() => {
		rewarded = Admob.createRewarded({
			viewType: Admob.TYPE_ADS,
			adSizeType: Admob.REWARDED,
			adUnitId: "ca-app-pub-3940256099942544/5224354917",
			extras: {}
		});

		function AD_LOADED() {
			console.debug("Rewarded Ad AD_LOADED");
			enableRewardedVideoButton();
			androidRewardedLoaded = true;
		}

		function AD_FAILED_TO_LOAD() {
			console.debug("Rewarded Ad AD_FAILED_TO_LOAD");
			disableRewardedVideoButton();
		}

		function AD_DESTROYED() {
			console.debug("Rewarded Ad AD_DESTROYED");
			disableRewardedVideoButton();
		}

		function AD_CLOSED() {
			console.debug("Rewarded Ad AD_CLOSED");
			disableRewardedVideoButton();
		}

		function AD_REWARDED(e) {
			console.debug("Rewarded Ad AD_REWARDED");
			console.debug("Yay! Reward the user now!");
			console.debug(JSON.stringify(e));
			alert("Congrats! Amount earned: " + e.amount);
			disableRewardedVideoButton();
		}

		function AD_FAILED_TO_SHOW() {
			console.debug("Rewarded Ad AD_FAILED_TO_SHOW");
			disableRewardedVideoButton();
		}

		function AD_SHOWED_FULLSCREEN_CONTENT() {
			console.debug("Rewarded Ad AD_SHOWED_FULLSCREEN_CONTENT");
		}

		rewarded.addEventListener(Admob.AD_LOADED, AD_LOADED);
		rewarded.addEventListener(Admob.AD_FAILED_TO_LOAD, AD_FAILED_TO_LOAD);
		rewarded.addEventListener(Admob.AD_DESTROYED, AD_DESTROYED);
		rewarded.addEventListener(Admob.AD_CLOSED, AD_CLOSED);
		rewarded.addEventListener(Admob.AD_REWARDED, AD_REWARDED);
		rewarded.addEventListener(Admob.AD_FAILED_TO_SHOW, AD_FAILED_TO_SHOW);
		rewarded.addEventListener(Admob.AD_SHOWED_FULLSCREEN_CONTENT, AD_SHOWED_FULLSCREEN_CONTENT);
	}, 4000);
}

function showRewarded() {
	if ($.rewardedVideoButton.title === "Load Rewarded Video Ad") {
		console.debug("showRewarded --> LOAD");
		if (OS_ANDROID) {
			rewarded.load();
			androidRewardedLoaded = true;
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
}

function disableRewardedVideoButton() {
	setTimeout(() => {
		$.rewardedVideoButton.title = "Load Rewarded Video Ad";
	}, 10);
}

function enableRewardedVideoButton() {
	setTimeout(() => {
		$.rewardedVideoButton.title = "Show Rewarded Video Ad";
	}, 10);
}

// ============================================================
//  APP OPEN ADS
// ============================================================
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
			adUnitId: "ca-app-pub-3940256099942544/5575463023",
			extras: {
				version: 1.0,
				name: "My App"
			},
			tagForChildDirectedTreatment: false,
			tagForUnderAgeOfConsent: false,
			maxAdContentRating: Admob.MAX_AD_CONTENT_RATING_GENERAL
		});

		appOpenAd.addEventListener("didReceiveAd", e => {
			console.debug("appOpenAd - didReceiveAd: " + e.adUnitId);
			console.debug(e);
			reload_max_tries = 0;
			Titanium.App.Properties.setDouble("appOpenAdLoadTime", new Date().getTime());
		});
		appOpenAd.addEventListener("didFailToShowAd", e => {
			console.error("appOpenAd - Failed to show: " + e.error);
			reloadAppOpenAd();
		});
		appOpenAd.addEventListener("didRecordClick", e => {
			console.debug("appOpenAd - didRecordClick: " + e.adUnitId);
		});
		appOpenAd.addEventListener("didFailToReceiveAd", e => {
			console.error("appOpenAd - Failed to receive ad: " + e.error);
			reloadAppOpenAd();
		});
		appOpenAd.addEventListener("didDismissScreen", e => {
			console.debug("appOpenAd - Dismissed screen: " + e.adUnitId);
			Titanium.App.Properties.setDouble("lastTimeAppOpenAdWasShown", new Date().getTime());
			appOpenAd.requestAppOpenAd();
		});
		appOpenAd.addEventListener("willPresentScreen", e => {
			console.debug("appOpenAd - willPresentScreen: " + e.adUnitId);
		});
		appOpenAd.addEventListener("willDismissScreen", e => {
			console.debug("appOpenAd - willDismissScreen: " + e.adUnitId);
		});
		appOpenAd.addEventListener("didRecordImpression", e => {
			console.debug("appOpenAd - didRecordImpression: " + e.adUnitId);
		});

		console.log("appOpenAd.receive();");
		appOpenAd.receive();
	} else {
		appOpenAd = Admob.createAppOpenAd({
			adUnitId: "ca-app-pub-3940256099942544/9257395921"
		});

		appOpenAd.addEventListener(Admob.AD_FAILED_TO_SHOW, e => {
			Titanium.API.error("===== AppOpenAd - Failed to show =====");
			Titanium.API.warn(e);
			reloadAppOpenAd();
		});
		appOpenAd.addEventListener(Admob.AD_SHOWED_FULLSCREEN_CONTENT, () => {
			Titanium.API.info("===== AppOpenAd - showed successfully =====");
		});
		appOpenAd.addEventListener(Admob.AD_FAILED_TO_LOAD, e => {
			Titanium.API.error("===== AppOpenAd - failed to load =====");
			Titanium.API.warn(e);
			reloadAppOpenAd();
		});
		appOpenAd.addEventListener(Admob.AD_LOADED, () => {
			Titanium.API.warn("===== AppOpenAd - Ads Loaded and ready =====");
			reload_max_tries = 0;
			Titanium.App.Properties.setDouble("appOpenAdLoadTime", new Date().getTime());
		});
		appOpenAd.addEventListener(Admob.AD_CLOSED, () => {
			Titanium.API.warn("===== AppOpenAd - CLOSED =====");
			Titanium.App.Properties.setDouble("lastTimeAppOpenAdWasShown", new Date().getTime());
			appOpenAd.load();
		});
		appOpenAd.addEventListener(Admob.AD_NOT_READY, e => {
			Titanium.API.warn("===== AppOpenAd - AD_NOT_READY =====");
			Titanium.API.warn(e.message);
		});
	}
}

// ------------------------------------------------------------
//  Resume handler for App Open Ads
// ------------------------------------------------------------
function resumeOpenAd() {
	const currentTime = new Date().getTime();
	const loadTime = Titanium.App.Properties.getDouble("appOpenAdLoadTime", currentTime);
	const lastShown = Titanium.App.Properties.getDouble("lastTimeAppOpenAdWasShown", 1);

	if (currentTime - loadTime < 14400000) {
		// Less than 4 hours since loaded
		if (currentTime - lastShown > 600000) {
			// More than 10 minutes since last shown
			if (OS_IOS) {
				console.log("appOpenAd.showAppOpenAd()");
				setTimeout(() => {
					try {
						appOpenAd.showAppOpenAd();
					} catch (error) {
						console.error(error);
						Titanium.App.removeEventListener("resume", resumeOpenAd);
						setTimeout(() => {
							loadOpenAd();
							Titanium.App.addEventListener("resume", resumeOpenAd);
						}, 500);
					}
				}, 500);
			} else if (OS_ANDROID) {
				appOpenAd.show();
			}
		} else {
			Titanium.API.warn("AppOpenAd shown less than 10 minutes ago. Please wait!");
		}
	} else {
		Titanium.API.warn("AppOpenAd expired (4h). Reloading...");
		Titanium.App.removeEventListener("resume", resumeOpenAd);
		setTimeout(() => {
			loadOpenAd();
			Titanium.App.addEventListener("resume", resumeOpenAd);
		}, 500);
	}
}

// Initialize App Open Ad flow
loadOpenAd();
Titanium.App.addEventListener("resume", resumeOpenAd);

// ------------------------------------------------------------
//  Close Window
// ------------------------------------------------------------
function closeWin() {
	Titanium.App.removeEventListener("resume", resumeOpenAd);
	$.testAdsWin.close();
}
