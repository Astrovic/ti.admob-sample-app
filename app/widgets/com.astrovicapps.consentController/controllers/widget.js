/**
 * ============================================================
 *  AdMob Consent Controller (UMP + ATT)
 *  Universal widget for managing consent forms & tracking
 *  Compatible with both iOS and Android (GDPR / US States)
 * ============================================================
 *
 * Main features:
 *  - Shows an introductory view before UMP consent form
 *  - Handles App Tracking Transparency (ATT) on iOS
 *  - Manages UMP consent form and Privacy Options (GDPR / US States)
 *  - Displays info or alert view when ads cannot be shown
 *  - Returns the final result via onDone(result) callback
 * 
 *  FLOW (INIT):
 *    1. Show intro (optional)
 *    2. Run UMP consent → requestConsentInfoUpdate
 *    3. Show UMP form / privacy options if required
 *    4. Determine adsAllowed via UMP
 *    5. ONLY IF:
 *          - iOS
 *          - adsAllowed === true
 *       THEN request ATT permission (App Tracking Transparency)
 *
 *  FLOW (MANUAL REVIEW):
 *    - Only opens privacy options form (UMP)
 *
 * ============================================================
 * Author: Astrovic (https: //github.com/Astrovic)
 *  License: MIT
 *  Version: 1.1.0
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

// Text localization
$.consentMsg1Lbl.text = L("consentMsg1Lbl");
$.consentMsg2Lbl.text = L("consentMsg2Lbl");
$.ATTMsg1Lbl.text = L("tracking_msg_1");
$.ATTMsg2Lbl.text = L("tracking_msg_2");

// Style views
[$.consentView, $.AttView].forEach(view => {
    view.applyProperties($.createStyle({ classes: ["viewContainer"] }));
});

// Global callback
let callbackDone = function () {};

// Android listeners
let androidListenersRegistered = false;

// Flow mode: "init" or "manual"
let flowMode = "init";

/**
 * ============================================================
 * INIT FLOW (APP STARTUP)
 * ============================================================
 */
exports.init = function (params) {
    $.consentMsg2Lbl.text = L("consentMsg2Lbl");
    $.purchaseBtn.visible = false;

    $.win.open({
        activityEnterAnimation: OS_ANDROID ? Ti.App.Android.R.anim.slide_in_right : ""
    });
	// Add a small delay to avoid showing the UMP form before view loads
    setTimeout(() => {
        callbackDone = params?.onDone || function () { };
        args = params || {};
        debugGeography = args.debugGeography || null;
        flowMode = "init";

        let isGDPR = Admob.isGDPR();

        console.debug("[consentController] init", params);
        console.debug("[consentController] init - isGDPR?:", isGDPR);

        if (args.showIntroView && !isGDPR) {
            testUserGeography(info => {
				console.debug("[consentController] testUserGeography ->", info);
                isGDPR = info.geography === "GEOGRAPHY_EEA";
                startInit();
            });
        } else {
            startInit();
        }

        function startInit() {
            if (isGDPR) {
                if (args.showIntroView) showIntroView();
                else continueBtnClick();
            } else {
                continueBtnClick();
            }
        }
    }, 1000);
};

/**
 * ============================================================
 * MANUAL FLOW — OPEN PRIVACY OPTIONS
 * ============================================================
 */
exports.openPrivacyOptions = function (params) {
    callbackDone = params?.onDone || function () { };
    args = params || {};
    debugGeography = args.debugGeography || null;
    flowMode = "manual";

    $.consentMsg2Lbl.text = L("consentMsg2Lbl");
    $.purchaseBtn.visible = false;

    console.debug("[consentController] openPrivacyOptions called (manual)");

    $.win.open({
        activityEnterAnimation: OS_ANDROID ? Ti.App.Android.R.anim.slide_in_right : ""
    });

    // Add a small delay to avoid showing the UMP form before view loads
	setTimeout(() => {
        if (Admob.isGDPR() && args.showIntroView) showIntroView();
        else continueBtnClick();
    }, 1000);
};

/**
 * ============================================================
 * Reset Consent (testing)
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
 * Intro screen
 * ============================================================
 */
function showIntroView() {
    console.debug("[consentController] showIntroView - flowMode:", flowMode);
    showView($.consentView);
}

/**
 * ============================================================
 * Continue button
 * ============================================================
 */
function continueBtnClick() {
    console.debug("[consentController] continueBtnClick - flowMode:", flowMode);

    hideView($.consentView);

    if (OS_ANDROID) registerAndroidListeners();

    if (flowMode === "manual") {
        checkPrivacyOptions();
    } else {
        loadConsentForm(); // ALWAYS UMP FIRST
    }
}

/**
 * ============================================================
 * UMP — Consent Info Request
 * ============================================================
 */
function loadConsentForm() {
    console.debug("[consentController] loadConsentForm - debugGeography:", debugGeography);

    if (OS_IOS) {
        Admob.requestConsentInfoUpdateWithParameters({
            testDeviceIdentifiers: [args.admobTestDeviceID],
            geography: debugGeography,
            tagForUnderAgeOfConsent: false,
            callback: e => {
                console.debug("[consentController] iOS requestConsentInfoUpdateWithParameters callback", e);

                if (e.success && e.status === Admob.CONSENT_FORM_STATUS_AVAILABLE) {
                    loadUMPForm();
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
 * iOS — Load UMP form
 * ============================================================
 */
function loadUMPForm() {
    console.debug("[consentController] loadUMPForm");

    Admob.loadForm({
        callback: e => {
            console.debug("[consentController] loadUMPForm callback", e);

            if (e.loadError || e.dismissError) {
                alert(e.dismissError || e.loadError);
                finishFlow({ adsAllowed: false, consentStatus: "error" });
                return;
            }

            if ([Admob.CONSENT_STATUS_OBTAINED, Admob.CONSENT_STATUS_NOT_REQUIRED].includes(e.status)) {
				console.debug("[consentController] loadUMPForm -> CONSENT_STATUS_OBTAINED/NOT_REQUIRED");
                checkCanShowAds();
            } else {
				console.debug("[consentController] loadUMPForm -> show privacy options/form");
                checkPrivacyOptions();
            }
        }
    });
}

/**
 * ============================================================
 * Android — Register Listeners
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
                callback: e => {
                    if (e.error) {
                        console.error("[consentController] privacy options error", e.error);
                        loadUMPForm();
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
 * Determine if ads allowed
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
        testUserGeography(info => {
			console.debug("[consentController] Non-GDPR region - adsAllowed = true by default");
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
 * Show "no consent" purchase screen
 * ============================================================
 */
function showNoConsentView() {
    console.debug("[consentController] showNoConsentView");

    $.consentMsg2Lbl.text = args.msgIfAdsNotAllowed || L("consentMsg3Lbl");
    $.purchaseBtn.visible = true;
    flowMode = "manual";

    showIntroView();
}

/**
 * ============================================================
 * IP Info — Geo Detection
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
 * Determine User Geography(EEA / US State / Other)
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

    ipinfo(response => {
        console.debug("[consentController] testUserGeography -> ipinfo:", response);

        if (debugGeography) {
            switch (debugGeography) {
                case Admob.DEBUG_GEOGRAPHY_EEA: return cb({ geography: "GEOGRAPHY_EEA" });
                case Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE: return cb({ geography: "GEOGRAPHY_REGULATED_US_STATE" });
                default: return cb({ geography: "GEOGRAPHY_OTHER" });
            }
        }

        if (response.success && response.data) {
            const { country, region } = response.data;

            if (country === "US" && REGULATED_US_STATES.has(region?.trim())) {
                return cb({ geography: "GEOGRAPHY_REGULATED_US_STATE" });
            }

            if (IAB_GDPR_COUNTRIES.has(country)) {
                return cb({ geography: "GEOGRAPHY_EEA" });
            }
        }

        cb({ geography: "GEOGRAPHY_OTHER" });
    });
}

/**
 * ============================================================
 * Fake Purchase Flow(optional)
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
 * FINAL FLOW + AUTOMATIC ATT (only if adsAllowed)
 * ============================================================
 */
function finishFlow(result) {
    console.debug("[consentController] finishFlow", result);

    if (OS_ANDROID) removeAndroidListeners();

    // Add ATT status for iOS
    if (OS_IOS) result.trackingAuthorizationStatus = Admob.trackingAuthorizationStatus;

    //
    // Only in init flow, only iOS, only if adsAllowed
    //
    if (
        OS_IOS &&
        //flowMode === "init" &&
        result.adsAllowed === true &&
        parseInt(Ti.Platform.version.split(".")[0]) >= 14 &&
        Admob.trackingAuthorizationStatus === Admob.TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED
    ) {
        console.debug("[consentController] Requesting ATT AFTER UMP");

        showATTAndFinish(result);
        return;
    }

    applyMediationSettings(result);
    closeWithCallback(result);
}

/**
 * ============================================================
 * Show ATT view (AFTER UMP)
 * ============================================================
 */
function showATTAndFinish(result) {
    console.debug("[consentController] showATTAndFinish");

    showView($.AttView);

    $.ATTContinueBtn.addEventListener("click", function handler() {
        $.ATTContinueBtn.removeEventListener("click", handler);
        hideView($.AttView);

        Admob.requestTrackingAuthorization({
            callback: e => {
                console.debug("[consentController] ATT status:", e.status);

                if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED) {
                    Admob.setInMobi_updateGDPRConsent(true);
                    Admob.setAdvertiserTrackingEnabled(true);
                }

                result.trackingAuthorizationStatus = e.status;
                applyMediationSettings(result);
                closeWithCallback(result);
            }
        });
    });
}

/**
 * ============================================================
 * Apply mediation GDPR flags
 * ============================================================
 */
function applyMediationSettings(result) {
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
}

/**
 * ============================================================
 * Close window + callback
 * ============================================================
 */
function closeWithCallback(result) {
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
    viewToHide.animate({
        opacity: 0,
        duration: 200,
        curve: Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
    }, () => {
        viewToHide.visible = false;
    });
}

/**
 * ============================================================
 * Android Back
 * ============================================================
 */
function onAndroidback() {
    console.debug("[consentController] You cannot close this window before giving consent");
}

/**
 * ============================================================
 * Remove Android listeners
 * ============================================================
 */
function removeAndroidListeners() {
    if (!androidListenersRegistered) {
        return console.debug("[consentController] Android listeners not registered -> skip remove");
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
