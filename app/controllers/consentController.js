/**
 * consentController.js
 * ------------------------------------------------------------
 * Universal controller for managing AdMob Consent (UMP)
 * Compatible with both iOS and Android using unified logic.
 *
 * Main Features:
 *  - Displays an introductory view before the UMP consent form
 *  - Handles App Tracking Transparency (ATT) on iOS
 *  - Manages UMP Consent Form & Privacy Options (GDPR / US States)
 *  - Shows alert/info view when ads cannot be shown
 *  - Returns final result via callback onDone(result)
 * ------------------------------------------------------------
 */

var args = $.args || {};
var Admob, debugGeography;

// ------------------------------------------------------------
//  Initialize AdMob module
// ------------------------------------------------------------
if (OS_IOS) {
    Admob = require("ti.admob");
} else {
    Admob = require("ti.android.admob");

    // Set test device ID (visible in Android logcat)
    if ((ENV_DEV || ENV_TEST) && OS_ANDROID) {
        Admob.setTestDeviceId(Alloy.Globals.admobTestDeviceID);
    }
}

// ------------------------------------------------------------
//  Initialize localized messages for UI labels
// ------------------------------------------------------------
$.consentMsg1Lbl.text = L('consentMsg1Lbl', "This app stays free thanks to ads");
$.consentMsg2Lbl.text = L('consentMsg2Lbl', "Next, you’ll see the consent request for ads. \n\nAds help us keep the app free and continue improving it.");

$.ATTMsg1Lbl.text = L("tracking_msg_1", "This app stays free thanks to ads. \n\nOn the next screen, you can allow tracking so that ads are more relevant to your interests. Otherwise, non-personalized ads will be shown.");
$.ATTMsg2Lbl.text = L("tracking_msg_2", "You can change this choice at any time in the app settings.");

// Apply default style classes to main views
[$.consentView, $.AttView].forEach(view => {
    view.applyProperties($.createStyle({ classes: ["viewContainer"] }));
});

// ------------------------------------------------------------
//  Internal state variables
// ------------------------------------------------------------
let callbackDone = function () {};
let androidListenersRegistered = false;
let flowMode = "init"; // Either "init" (startup) or "manual" (user opens from settings)

/**
 * ============================================================
 * INIT (called at app startup)
 * ============================================================
 */
exports.init = function (params) {
    callbackDone = params.onDone || function () {};
    args = params || {};
    debugGeography = args.debugGeography || null;
    flowMode = "init";

    let isGDPR = Admob.isGDPR();
    console.debug("[consentController] init", params);
    console.debug("[consentController] init - isGDPR?:", Admob.isGDPR());

    // At first launch, isGDPR might be undefined -> verify via IP
    if (args.showIntroView && !isGDPR) {
        testUserGeography(info => {
            console.debug("[consentController] testUserGeography ->", info);
            isGDPR = info.geography === "GEOGRAPHY_EEA";
            initAfterGeoCheck(isGDPR);
        });
    } else {
        initAfterGeoCheck(isGDPR);
    }

    function initAfterGeoCheck(isGDPR) {
        if (OS_IOS) {
            // ✅ Handle ATT first, then optionally show intro view before UMP
            checkTrackingAuthorizationStatus(() => {
                if (isGDPR && args.showIntroView) {
                    showIntroView();
                } else {
                    continueBtnClick();
                }
            });
        } else {
            // Android flow
            if (isGDPR && args.showIntroView) {
                showIntroView();
            } else {
                continueBtnClick();
            }
        }
    }
};

/**
 * ============================================================
 * OPEN PRIVACY OPTIONS (manual call from info/settings window)
 * ============================================================
 */
exports.openPrivacyOptions = function (params) {
    callbackDone = params?.onDone || function () {};
    args = params || {};
    debugGeography = args.debugGeography || null;
    flowMode = "manual";

    console.debug("[consentController] openPrivacyOptions called (manual)");
    $.win.open();

    if (Admob.isGDPR() && args.showIntroView) {
        showIntroView();
    } else {
        continueBtnClick();
    }
};

/**
 * ============================================================
 * RESET CONSENT (testing helper)
 * ============================================================
 */
exports.resetConsentForTest = function () {
    console.debug("[consentController] resetConsentForTest");
    try {
        if (OS_IOS && typeof Admob.resetConsent === "function") {
            Admob.resetConsent();
            console.debug("[consentController] called Admob.resetConsent()");
        } else if (!OS_IOS && typeof Admob.resetConsentForm === "function") {
            Admob.resetConsentForm();
            console.debug("[consentController] called Admob.resetConsentForm()");
        } else {
            console.debug("[consentController] resetConsent not available on this module");
        }
    } catch (ex) {
        console.warn("[consentController] resetConsentForTest exception:", ex);
    }
};

/**
 * ============================================================
 * SHOW INTRODUCTORY VIEW (before UMP form)
 * ============================================================
 */
function showIntroView() {
    console.debug("[consentController] showIntroView - flowMode:", flowMode);
    showView($.consentView);
}

/**
 * ============================================================
 * HANDLER: “Continue” button from intro view
 * ============================================================
 */
function continueBtnClick() {
    console.debug("[consentController] continueBtnClick - flowMode:", flowMode);
    hideView($.consentView);

    if (OS_ANDROID) registerAndroidListeners();

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
function checkTrackingAuthorizationStatus(nextStep) {
    console.debug("[consentController] checkTrackingAuthorizationStatus");
    const iOSVersion = parseInt(Ti.Platform.version.split(".")[0]);

    if (iOSVersion >= 14 &&
        Admob.trackingAuthorizationStatus === Admob.TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED) {

        console.debug("[consentController] ATT authorization required");
        hideView($.consentView);
        showView($.AttView);

        $.ATTContinueBtn.addEventListener("click", function onATTContinue() {
            $.ATTContinueBtn.removeEventListener("click", onATTContinue);
            hideView($.AttView);

            Admob.requestTrackingAuthorization({
                callback: e => {
                    console.debug("[consentController] ATT status:", e.status);
                    if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED) {
                        Admob.setInMobi_updateGDPRConsent(true);
                        Admob.setAdvertiserTrackingEnabled(true);
                    }
                    if (typeof nextStep === "function") nextStep();
                }
            });
        });
    } else {
        // ATT already handled or not required
        if (typeof nextStep === "function") nextStep();
    }
}

/**
 * ============================================================
 * UMP CONSENT REQUEST (Android/iOS)
 * ============================================================
 */
function loadConsentForm() {
    console.debug("[consentController] loadConsentForm - debugGeography:", debugGeography);

    if (OS_IOS) {
        Admob.requestConsentInfoUpdateWithParameters({
            testDeviceIdentifiers: [$.args.admobTestDeviceID],
            geography: debugGeography,
            tagForUnderAgeOfConsent: false,
            callback: e => {
                console.debug("[consentController] iOS consent info update callback", e);
                if (e.success && e.status === Admob.CONSENT_FORM_STATUS_AVAILABLE) {
                    loadForm();
                } else {
                    if (Admob.isPrivacyOptionsRequired()) {
                        checkPrivacyOptions();
                    } else {
                        finishFlow({
                            adsAllowed: true,
                            consentStatus: "not_required"
                        });
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
 * iOS - Load UMP form
 * ============================================================
 */
function loadForm() {
    console.debug("[consentController] loadForm");

    Admob.loadForm({
        callback: e => {
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
 * ANDROID - Register and manage event listeners
 * ============================================================
 */
function registerAndroidListeners() {
    if (androidListenersRegistered) return;
    androidListenersRegistered = true;

    console.debug("[consentController] registerAndroidListeners");

    Admob.addEventListener(Admob.CONSENT_REQUIRED, onConsentRequired);
    Admob.addEventListener(Admob.CONSENT_NOT_REQUIRED, onConsentNotRequired);
    Admob.addEventListener(Admob.CONSENT_FORM_LOADED, onConsentLoaded);
    Admob.addEventListener(Admob.CONSENT_FORM_DISMISSED, onConsentDismissed);
    Admob.addEventListener(Admob.CONSENT_FORM_NOT_AVAILABLE, onConsentNotAvailable);
    Admob.addEventListener(Admob.CONSENT_ERROR, onConsentError);
}

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

// --- Android Event Handlers ---
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
 * PRIVACY OPTIONS
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
 * FINAL CHECK - CAN SHOW ADS?
 * ============================================================
 */
function checkCanShowAds() {
    console.debug("[consentController] checkCanShowAds - isGDPR?:", Admob.isGDPR());

    if (Admob.isGDPR()) {
        console.debug("[consentController] User in EEA (GDPR)");

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
 * NO CONSENT VIEW (user denied ad permissions)
 * ============================================================
 */
function showNoConsentView() {
    console.debug("[consentController] showNoConsentView");

    $.consentMsg2Lbl.text = args.msgIfAdsNotAllowed || L('consentMsg3Lbl', "You haven’t given consent for ads yet.\n\nYou can allow ads to use the app for free, or purchase the ad-free version.");
    $.purchaseBtn.visible = true;
    flowMode = "manual";
    showIntroView();
}

/**
 * ============================================================
 * GEOLOCATION (ipinfo + region detection)
 * ============================================================
 */
function ipinfo(callback) {
    const xhr = Ti.Network.createHTTPClient({ enableKeepAlive: false, timeout: 5000 });
    xhr.onload = function () {
        try {
            callback({ success: true, data: JSON.parse(this.responseText) });
        } catch {
            callback({ success: false });
        }
    };
    xhr.onerror = () => callback({ success: false });
    xhr.open("GET", "https://ipinfo.io/json");
    xhr.setRequestHeader("User-Agent", "Mozilla/5.0");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();
}

function testUserGeography(cb) {
    const REGULATED_US_STATES = new Set([
        "California", "Colorado", "Connecticut", "Delaware", "Florida", "Iowa", "Maryland",
        "Minnesota", "Montana", "Nebraska", "New Hampshire", "New Jersey", "Oregon",
        "Tennessee", "Texas", "Utah", "Virginia"
    ]);
    const IAB_GDPR_COUNTRIES = new Set([
        "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IS","IE","IT",
        "LV","LI","LT","LU","MT","NL","NO","PL","PT","RO","SK","SI","ES","SE","GB","CH"
    ]);

    ipinfo(response => {
        console.debug("[consentController] testUserGeography -> ipinfo:", response);

        if (debugGeography) {
            let geography = "GEOGRAPHY_OTHER";
            switch (debugGeography) {
                case Admob.DEBUG_GEOGRAPHY_EEA: geography = "GEOGRAPHY_EEA"; break;
                case Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE: geography = "GEOGRAPHY_REGULATED_US_STATE"; break;
                case Admob.DEBUG_GEOGRAPHY_OTHER: geography = "GEOGRAPHY_OTHER"; break;
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
 * FAKE PURCHASE (for demo)
 * ============================================================
 */
function purchase() {
    alert("No ADS version purchased!");
    finishFlow({ adsAllowed: false, consentStatus: "not_required" });
}

/**
 * ============================================================
 * FINAL CALLBACK
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
    $.win.close({
        activityExitAnimation: OS_ANDROID ? Ti.App.Android.R.anim.slide_out_right : ""
    });
}

/**
 * ============================================================
 * UI HELPERS
 * ============================================================
 */
function showView(viewToShow) {
    viewToShow.visible = true;
    viewToShow.opacity = 0;
    viewToShow.animate({ opacity: 1, duration: 300 });
}

function hideView(viewToHide) {
    viewToHide.animate({ opacity: 0, duration: 200 }, () => {
        viewToHide.visible = false;
    });
}

// Disable Android back button
function onAndroidback() {
    console.debug("[consentController] You cannot close this window before giving consent");
}
