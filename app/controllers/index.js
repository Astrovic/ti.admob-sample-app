/**
 * index.js
 * ------------------------------------------------------------
 * Demo launcher for consentController.js
 * 
 * This file simulates app startup and manual privacy options
 * using Titanium Alloy controllers.
 *
 * Features:
 *  - Demonstrates consentController init() flow
 *  - Demonstrates openPrivacyOptions() flow
 *  - Provides reset and test ad preview buttons
 * ------------------------------------------------------------
 */

var Admob;

// ------------------------------------------------------------
//  Initialize AdMob module and test device ID
// ------------------------------------------------------------
Alloy.Globals.admobTestDeviceID = "USE YOUR TEST DEVICE ID";
if (OS_IOS) {
    Admob = require("ti.admob");
} else {
    Admob = require("ti.android.admob");
    // Set test device ID to appear in Android logcat
    Admob.setTestDeviceId(Alloy.Globals.admobTestDeviceID);
}

// ------------------------------------------------------------
//  Initialize Debug Geography OptionBar
// ------------------------------------------------------------
$.debugRegionOptionBar.labels = ["EEA", "US_STATE", "OTHER"];

let DEBUG_GEOGRAPHY = Titanium.App.Properties.getInt(
    "DEBUG_GEOGRAPHY",
    Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE
);

if (DEBUG_GEOGRAPHY === Admob.DEBUG_GEOGRAPHY_EEA) {
    $.debugRegionOptionBar.index = 0;
} else if (DEBUG_GEOGRAPHY === Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE) {
    $.debugRegionOptionBar.index = 1;
} else {
    $.debugRegionOptionBar.index = 2;
}

// ============================================================
//  APP SIMULATION (INIT FLOW)
// ============================================================
function startAppSim() {
    console.log("startAppSim - create consentController");    

    $.consentWidget.init({
        admobTestDeviceID: Alloy.Globals.admobTestDeviceID,
        debugGeography: DEBUG_GEOGRAPHY, // Admob.DEBUG_GEOGRAPHY_EEA (1), REGULATED_US_STATE (3), or OTHER (4)
        showIntroView: true, // show intro screen (only in EEA)
        onDone: function (result) {
            console.debug("index.js - consent result:", result);
            btnStartDisabled();
            btnResetEnabled();

            // Enable privacy button only if GDPR or US state applies
            if (result.geography === "GEOGRAPHY_OTHER") {
                btnPrivacyDisabled();
            } else {
                btnPrivacyEnabled();
            }

            // Ads allowed?
            if (result.adsAllowed) {
                $.testAdsWinButton.backgroundColor = "green";
                $.testAdsWinButton.enabled = true;
                $.status.text =
                    "✅ Ads allowed:\n" + JSON.stringify(result, null, 2);
                testAdsWinButtonEnabled();
            } else {
                alert("Ads not allowed (demo).");
                $.testAdsWinButton.backgroundColor = "red";
                $.testAdsWinButton.enabled = false;
                $.status.text =
                    "🚫 Ads not allowed:\n" + JSON.stringify(result, null, 2);
                testAdsWinButtonDisabled();
            }
        }
    });
}

// ============================================================
//  OPEN PRIVACY OPTIONS (MANUAL FLOW)
// ============================================================
function openPrivacyOptionsSim() {
    console.log("openPrivacyOptionsSim - create consentController (manual)");   
    
    $.consentWidget.openPrivacyOptions({
        debugGeography: DEBUG_GEOGRAPHY,
        showIntroView: true, // show intro screen (only in EEA)
        onDone: function (result) {
            console.log("→ CALLBACK openPrivacyOptions() onDone()", result);

            if (result.adsAllowed) {
                $.status.text =
                    "✅ Consent updated:\n" +
                    JSON.stringify(result, null, 2);
                testAdsWinButtonEnabled();
            } else {
                $.status.text =
                    "⚠️ Consent denied or error:\n" +
                    JSON.stringify(result, null, 2);
                testAdsWinButtonDisabled();
            }
        }
        });
}

// ============================================================
//  RESET CONSENT (TEST HELPER)
// ============================================================
function resetForTest() {
    console.log("resetForTest - create controller and reset");

    $.consentWidget.resetConsentForTest();

    $.status.text = "";
    btnStartEnabled();
    btnPrivacyDisabled();
    btnResetDisabled();
    testAdsWinButtonDisabled();

    alert("Consent reset completed!");
}

// ============================================================
//  CHANGE DEBUG REGION
// ============================================================
function chooseDebugRegion(e) {
    resetForTest();

    switch (e.index) {
        case 0:
            DEBUG_GEOGRAPHY = Admob.DEBUG_GEOGRAPHY_EEA;
            break;
        case 1:
            DEBUG_GEOGRAPHY = Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE;
            break;
        default:
            DEBUG_GEOGRAPHY = Admob.DEBUG_GEOGRAPHY_OTHER;
            break;
    }

    Titanium.App.Properties.setInt("DEBUG_GEOGRAPHY", DEBUG_GEOGRAPHY);
    console.log("chooseDebugRegion: " + DEBUG_GEOGRAPHY);
}

// ============================================================
//  TEST WINDOW - SHOW SAMPLE ADS
// ============================================================
function openTestAdsWin() {
    Alloy.createController("testAdsWin").getView().open();
}

// ============================================================
//  BUTTON STATE HELPERS
// ============================================================
function btnStartEnabled() {
    $.btnStart.enabled = true;
    $.btnStart.backgroundColor = "green";
}

function btnStartDisabled() {
    $.btnStart.enabled = false;
    $.btnStart.backgroundColor = "red";
}

function btnPrivacyEnabled() {
    $.btnPrivacy.enabled = true;
    $.btnPrivacy.backgroundColor = "green";
}

function btnPrivacyDisabled() {
    $.btnPrivacy.enabled = false;
    $.btnPrivacy.backgroundColor = "red";
}

function btnResetEnabled() {
    $.btnReset.enabled = true;
    $.btnReset.backgroundColor = "green";
}

function btnResetDisabled() {
    $.btnReset.enabled = false;
    $.btnReset.backgroundColor = "red";
}

function testAdsWinButtonEnabled() {
    $.testAdsWinButton.enabled = true;
    $.testAdsWinButton.backgroundColor = "green";
}

function testAdsWinButtonDisabled() {
    $.testAdsWinButton.enabled = false;
    $.testAdsWinButton.backgroundColor = "red";
}

// ============================================================
//  OPEN MAIN WINDOW
// ============================================================
$.index.open();
