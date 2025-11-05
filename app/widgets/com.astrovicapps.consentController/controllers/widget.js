/**
 * ============================================================
 *  AdMob Consent Controller (UMP)
 *  Universal widget for managing consent forms and ATT
 *  Compatible with iOS + Android (GDPR / US States)
 * ============================================================
 *
 *  Features:
 *   - Shows introductory explanation view (before UMP or ATT)
 *   - Manages iOS ATT (App Tracking Transparency)
 *   - Manages UMP Consent Form and Privacy Options
 *   - Handles both automatic flow (init) and manual review
 *   - Returns a unified result via callback `onDone(result)`
 *
 *  Author: Your Name
 *  License: MIT
 *  Version: 1.0.0
 */

var args = $.args || {};
var Admob, debugGeography;
if (OS_IOS) {
	Admob = require("ti.admob");
} else {
	Admob = require("ti.android.admob");
	if ((ENV_DEV || ENV_TEST) && OS_ANDROID) {
		Admob.setTestDeviceId(Alloy.Globals.admobTestDeviceID);
	}
}

$.consentMsg1Lbl.text = L('consentMsg1Lbl');
$.consentMsg2Lbl.text = L('consentMsg2Lbl');
$.ATTMsg1Lbl.text = L('tracking_msg_1');
$.ATTMsg2Lbl.text = L('tracking_msg_2');

// Apply generic style for views
[$.consentView, $.AttView].forEach(view => {
	view.applyProperties($.createStyle({ classes: ["viewContainer"] }));
});

// Global callback reference
let callbackDone = function () {};

// Android listeners flag
let androidListenersRegistered = false;

// Flow mode: "init" or "manual"
let flowMode = "init";

/**
 * ============================================================
 * INIT (called at app startup)
 * ============================================================
 */
exports.init = function (params) {
	$.consentMsg2Lbl.text = L('consentMsg2Lbl');
	$.purchaseBtn.visible = false;
	$.win.open({
		activityEnterAnimation: OS_ANDROID ? Ti.App.Android.R.anim.slide_in_right : ""
	});
	// Add a small delay to avoid showing the UMP form before view loads
	setTimeout(() => {
		callbackDone = params.onDone || function () { };
		args = params || {};
		debugGeography = args.debugGeography || null;
		flowMode = "init";

		let isGDPR = Admob.isGDPR();

		console.debug("[consentController] init", params);
		console.debug("[consentController] init - isGDPR?:", Admob.isGDPR());

		if (args.showIntroView && !isGDPR) {
			testUserGeography(function (info) {
				console.debug("[consentController] testUserGeography ->", info);
				isGDPR = info.geography === "GEOGRAPHY_EEA";
				startInit();
			});
		} else {
			startInit();
		}

		function startInit() {
			if (isGDPR) {
				if (args.showIntroView) {
					showIntroView();
				} else {
					continueBtnClick();
				}
			} else {
				continueBtnClick();
			}
		}
	}, 1000);
};

/**
 * ============================================================
 * OPEN PRIVACY OPTIONS (called manually from infoWin)
 * ============================================================
 */

exports.openPrivacyOptions = function (params) {
	callbackDone = params?.onDone || function () { };
	args = params || {};
	debugGeography = args.debugGeography || null;
	flowMode = "manual";
	$.consentMsg2Lbl.text = L('consentMsg2Lbl');
	$.purchaseBtn.visible = false;

	console.debug("[consentController] openPrivacyOptions called (manual)");
	$.win.open({
		activityEnterAnimation: OS_ANDROID ? Ti.App.Android.R.anim.slide_in_right : ""
	});

	// Add a small delay to avoid showing the UMP form before view loads
	setTimeout(() => {
		if (Admob.isGDPR() && args.showIntroView) {
			showIntroView();
		} else {
			continueBtnClick();
		}
	}, 1000);
};

/**
 * ============================================================
 * Reset Consent (for testing)
 * ============================================================
 */
exports.resetConsentForTest = function () {
	console.debug("[consentController] resetConsentForTest");
	try {
		if (OS_IOS && typeof Admob.resetConsent === "function") {
			Admob.resetConsent();
			console.debug("[consentController] Admob.resetConsent() called");
		} else if (!OS_IOS && typeof Admob.resetConsentForm === "function") {
			Admob.resetConsentForm();
			console.debug("[consentController] Admob.resetConsentForm() called");
		} else {
			console.debug("[consentController] resetConsent not available on this module");
		}
	} catch (ex) {
		console.warn("[consentController] resetConsentForTest exception:", ex);
	}
};

/**
 * ============================================================
 * Show Introductory View
 * ============================================================
 */
function showIntroView() {
	console.debug("[consentController] showIntroView - flowMode:", flowMode);
	showView($.consentView);
}

/**
 * ============================================================
 * Handler: “Continue” button from intro view
 * ============================================================
 */
function continueBtnClick() {
	console.debug("[consentController] continueBtnClick - flowMode:", flowMode);
	hideView($.consentView);

	if (OS_ANDROID) {
		registerAndroidListeners();
	}

	if (flowMode === "manual") {
		checkPrivacyOptions();
	} else {
		if (OS_IOS) {
			checkTrackingAuthorizationStatus(() => {
				loadConsentForm();
			});
		} else {
			loadConsentForm();
		}
	}
}

/**
 * ============================================================
 * iOS - App Tracking Transparency (ATT)
 * ============================================================
 */
function checkTrackingAuthorizationStatus(callback) {
	console.debug("[consentController] checkTrackingAuthorizationStatus");

	if (
		parseInt(Ti.Platform.version.split(".")[0]) >= 14 &&
		Admob.trackingAuthorizationStatus === Admob.TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED
	) {
		hideView($.consentView);
		showView($.AttView);

		$.ATTContinueBtn.addEventListener("click", function () {
			hideView($.AttView);

			Admob.requestTrackingAuthorization({
				callback: e => {
					console.debug("[consentController] ATT status:", e.status);
					console.debug("[consentController] Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED ==> enable personalized ads in ads mediation too");

					if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED) {
						Admob.setInMobi_updateGDPRConsent(true);
						Admob.setAdvertiserTrackingEnabled(true);
					}

					if (callback) callback();
				}
			});
		});
	} else {
		if (callback) callback();
	}
}

/**
 * ============================================================
 * UMP - Consent Request
 * ============================================================
 */
function loadConsentForm() {
	console.debug("[consentController] loadConsentForm - debugGeography:", debugGeography);

	if (OS_IOS) {
		Admob.requestConsentInfoUpdateWithParameters({
			testDeviceIdentifiers: [$.args.admobTestDeviceID],
            geography: debugGeography,
			tagForUnderAgeOfConsent: false,
			callback: function (e) {
				console.debug("[consentController] iOS consent info update callback", e);
				if (e.success && e.status === Admob.CONSENT_FORM_STATUS_AVAILABLE) {
					loadForm();
				} else {
					if (Admob.isPrivacyOptionsRequired()) {
						checkPrivacyOptions();
					} else {
						finishFlow({ adsAllowed: true, consentStatus: "not_required" });
					}
				}
			}
		});
	} else {
		console.debug("[consentController] Android requestConsentForm with debug:", debugGeography);
		Admob.requestConsentForm(debugGeography);
	}
}

/**
 * ============================================================
 * iOS - Load Consent Form
 * ============================================================
 */
function loadForm() {
	console.debug("[consentController] loadForm");

	Admob.loadForm({
		callback: function (e) {
			console.debug("[consentController] loadForm callback", e);

			if (e.loadError || e.dismissError) {
				alert(e.dismissError || e.loadError);
				finishFlow({ adsAllowed: false, consentStatus: "error" });
				return;
			}

			if ([Admob.CONSENT_STATUS_OBTAINED, Admob.CONSENT_STATUS_NOT_REQUIRED].includes(e.status)) {
				console.debug("[consentController] loadForm -> CONSENT_STATUS_OBTAINED/NOT_REQUIRED");
				checkCanShowAds();
			} else {
				console.debug("[consentController] loadForm -> show privacy options/form");
				checkPrivacyOptions();
			}
		}
	});
}

/**
 * ============================================================
 * Android Listeners
 * ============================================================
 */
function registerAndroidListeners() {
	if (androidListenersRegistered) return;
	androidListenersRegistered = true;

	console.debug("[consentController] registerAndroidListeners");

	Admob.addEventListener(Admob.CONSENT_REQUIRED, onConsentRequired);
	Admob.addEventListener(Admob.CONSENT_NOT_REQUIRED, onConsentNotRequired);
	Admob.addEventListener(Admob.CONSENT_FORM_DISMISSED, onConsentDismissed);
	Admob.addEventListener(Admob.CONSENT_FORM_LOADED, onConsentLoaded);
	Admob.addEventListener(Admob.CONSENT_FORM_NOT_AVAILABLE, onConsentNotAvailable);
	Admob.addEventListener(Admob.CONSENT_ERROR, onConsentError);
}

/**
 * ============================================================
 * Android Listener Handlers
 * ============================================================
 */
function onConsentRequired() {
	console.debug("[consentController] CONSENT_REQUIRED");
}

function onConsentNotRequired() {
	console.debug("[consentController] CONSENT_NOT_REQUIRED");
	checkCanShowAds();
}

function onConsentDismissed() {
	console.debug("[consentController] CONSENT_FORM_DISMISSED");
	checkCanShowAds();
}

function onConsentLoaded() {
	console.debug("[consentController] CONSENT_FORM_LOADED -> waiting 2s -> showConsentForm()");
	setTimeout(() => {
		console.debug("[consentController] CONSENT_FORM_LOADED -> showConsentForm()");
		Admob.showConsentForm();
	}, 2000);
}

function onConsentNotAvailable() {
	console.debug("[consentController] CONSENT_FORM_NOT_AVAILABLE");
	checkCanShowAds();
}

function onConsentError(e) {
	console.error("[consentController] CONSENT_ERROR", e.message);
	finishFlow({ adsAllowed: false, consentStatus: "error" });
}

/**
 * ============================================================
 * Privacy Options
 * ============================================================
 */
function checkPrivacyOptions() {
	console.debug("[consentController] checkPrivacyOptions");

	if (Admob.isPrivacyOptionsRequired()) {
		console.debug("[consentController] Privacy options required");
		if (OS_IOS) {
			Admob.presentPrivacyOptionsForm({
				callback: function (e) {
					if (e.error) {
						console.error("[consentController] privacy options error", e.error);
						loadForm();
					} else {
						checkCanShowAds();
					}
				}
			});
		} else {
			Admob.showConsentForm();
		}
	} else {
		console.debug("[consentController] Privacy options not required");
		checkCanShowAds();
	}
}

/**
 * ============================================================
 * Final Ad Permission Check
 * ============================================================
 */
function checkCanShowAds() {
	console.debug("[consentController] checkCanShowAds - isGDPR?:", Admob.isGDPR());

	if (Admob.isGDPR()) {
		console.debug("[consentController] User is in EEA (GDPR)");

		if (Admob.canShowPersonalizedAds() || Admob.canShowAds()) {
			finishFlow({
				adsAllowed: true,
				consentStatus: "granted",
				geography: "GEOGRAPHY_EEA"
			});
		} else {
			showNoConsentView();
		}
	} else {
		testUserGeography(function (info) {
			console.debug("[consentController] testUserGeography ->", info);
			console.debug("[consentController] canShowPersonalizedAds:", Admob.canShowPersonalizedAds(), " canShowAds:", Admob.canShowAds());
			finishFlow({
				adsAllowed: true,
				consentStatus: "not_required",
				geography: info.geography
			});
		});
	}
}

/**
 * ============================================================
 * View: No Consent (blocking message)
 * ============================================================
 */
function showNoConsentView() {
	console.debug("[consentController] showNoConsentView");
	$.consentMsg2Lbl.text = args.msgIfAdsNotAllowed || L('consentMsg3Lbl');
	$.purchaseBtn.visible = true;
	flowMode = "manual";
	showIntroView();
}

/**
 * ============================================================
 * Utility: IP Info + Geography Test
 * ============================================================
 */
function ipinfo(callback) {
	var xhr = Ti.Network.createHTTPClient({
		enableKeepAlive: false,
		timeout: 5000
	});
	xhr.onload = function () {
		try {
			callback({ success: true, data: JSON.parse(this.responseText) });
		} catch (e) {
			callback({ success: false });
		}
	};
	xhr.onerror = function () {
		callback({ success: false });
	};
	xhr.open("GET", "https://ipinfo.io/json");
	xhr.setRequestHeader("User-Agent", "Mozilla/5.0");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.send();
}

/**
 * ============================================================
 * Determine User Geography (EEA / US State / Other)
 * ============================================================
 */
function testUserGeography(cb) {
	const REGULATED_US_STATES = new Set([
		"California", "Colorado", "Connecticut", "Delaware", "Florida", "Iowa",
		"Maryland", "Minnesota", "Montana", "Nebraska", "New Hampshire", "New Jersey",
		"Oregon", "Tennessee", "Texas", "Utah", "Virginia"
	]);

	const IAB_GDPR_COUNTRIES = new Set([
		"AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
		"IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO",
		"SK", "SI", "ES", "SE", "GB", "CH"
	]);

	ipinfo(function (response) {
		console.debug("[consentController] testUserGeography -> ipinfo:", response);

		if (debugGeography) {
			let geography = "GEOGRAPHY_OTHER";

			switch (debugGeography) {
				case Admob.DEBUG_GEOGRAPHY_EEA:
					geography = "GEOGRAPHY_EEA";
					break;
				case Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE:
					geography = "GEOGRAPHY_REGULATED_US_STATE";
					break;
				case Admob.DEBUG_GEOGRAPHY_OTHER:
					geography = "GEOGRAPHY_OTHER";
					break;
			}

			cb({ geography });
		} else if (response.success && response.data) {
			const { country, region } = response.data;
			let geography = "GEOGRAPHY_OTHER";

			if (country === "US" && REGULATED_US_STATES.has(region?.trim())) {
				geography = "GEOGRAPHY_REGULATED_US_STATE";
			} else if (IAB_GDPR_COUNTRIES.has(country)) {
				geography = "GEOGRAPHY_EEA";
			}

			cb({ geography });
		} else {
			cb({ geography: "GEOGRAPHY_OTHER" });
		}
	});
}

/**
 * ============================================================
 * Fake Purchase Flow (optional)
 * ============================================================
 */
function purchase() {
	alert("No ADS version purchased!");
	finishFlow({
		adsAllowed: false,
		consentStatus: "not_required"
	});
}

/**
 * ============================================================
 * Final Flow and Callback
 * ============================================================
 */
function finishFlow(result) {
	console.debug("[consentController] finishFlow", result);

	if (OS_ANDROID) removeAndroidListeners();
	if (OS_IOS) result.trackingAuthorizationStatus = Admob.trackingAuthorizationStatus;

	// Update mediation SDKs
	if (OS_IOS) {
		Admob.setInMobi_updateGDPRConsent(result.adsAllowed);
		Admob.setAdvertiserTrackingEnabled(result.adsAllowed);
	} else {
		try {
			Admob.setInMobiGDPRConsent({ enabled: result.adsAllowed });
			Admob.setAppLovinGDPRConsent({ enabled: result.adsAllowed });
		} catch (error) {
			console.error(error);
		}
	}

	if (callbackDone) callbackDone(result);

	setTimeout(() => {
		$.win.close({
			activityExitAnimation: OS_ANDROID ? Ti.App.Android.R.anim.slide_out_right : ""
		});
	}, 200);
}

/**
 * ============================================================
 * UI Helpers
 * ============================================================
 */
function showView(viewToShow) {
	viewToShow.visible = true;
	viewToShow.opacity = 0;
	viewToShow.animate({
		opacity: 1,
		duration: 300,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
	});
}

function hideView(viewToHide) {
	viewToHide.animate(
		{
			opacity: 0,
			duration: 200,
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
		},
		() => { viewToHide.visible = false; }
	);
}

/**
 * ============================================================
 * Android Back Button Override
 * ============================================================
 */
function onAndroidback() {
	console.debug("[consentController] You cannot close this window before giving consent");
}

/**
 * ============================================================
 * Remove Android Listeners
 * ============================================================
 */
function removeAndroidListeners() {
	if (!androidListenersRegistered) {
		console.debug("[consentController] Android listeners not registered -> skip remove");
		return;
	}

	console.debug("[consentController] removeAndroidListeners");
	try {
		Admob.removeEventListener(Admob.CONSENT_REQUIRED, onConsentRequired);
		Admob.removeEventListener(Admob.CONSENT_NOT_REQUIRED, onConsentNotRequired);
		Admob.removeEventListener(Admob.CONSENT_FORM_LOADED, onConsentLoaded);
		Admob.removeEventListener(Admob.CONSENT_FORM_DISMISSED, onConsentDismissed);
		Admob.removeEventListener(Admob.CONSENT_FORM_NOT_AVAILABLE, onConsentNotAvailable);
		Admob.removeEventListener(Admob.CONSENT_ERROR, onConsentError);
	} catch (ex) {
		console.warn("[consentController] removeAndroidListeners exception:", ex);
	} finally {
		androidListenersRegistered = false;
	}
}
