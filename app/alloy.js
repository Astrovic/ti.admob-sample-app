// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//

Alloy.Globals = {
    debug_mode : true
};

// Require the Firebase Core module
Ti.API.info("testttttt");
//var FirebaseCore = require('firebase.core');
Ti.API.info("doneeeee");
/*
// Configure your Firebase API's (only required once for all)

FirebaseCore.configure(); // default google-services.json/GoogleService-Info.plist will be used

// alternative way:

FirebaseCore.configure({
    APIKey: "AIYasZBtfJh..........",
    projectID: "test-12345",
    storageBucket: "test-12345.appspot.com",
    applicationID: "1:12345678890:android:abc123efg456"
});

// alternative way:
FirebaseCore.configure({
    file: "filename.json"
});
*/


setTimeout(() => {
    return;
    Ti.API.info("OKKKKK");
    var win = Ti.UI.createWindow({
        backgroundColor: "#aabbcc"
    });
    var Admob = require('ti.android.admob');
    //Admob.setTestDeviceId("3F8313FOIASD123712EDB393DD17E1CED");
    var activityIndicator = Titanium.UI.Android.createProgressIndicator({
        message: L('loading'),
        cancelable: true
    });
    let consent_status_values = {
        0: "ConsentStatus.UNKNOWN",
        1: "ConsentStatus.REQUIRED",
        2: "ConsentStatus.NOT_REQUIRED",
        3: "ConsentStatus.OBTAINED",
    }
    Admob.addEventListener(Admob.CONSENT_FORM_READY, function () {
        console.log("Admod.CONSENT_FORM_READY");
    });
    Admob.addEventListener(Admob.CONSENT_FORM_NOT_AVAILABLE, function () {
        console.log("Admod.CONSENT_FORM_NOT_AVAILABLE");
        activityIndicator.hide();
    });
    Admob.addEventListener(Admob.CONSENT_INFO_UPDATE_FAILURE, function () {
        console.log("Admod.CONSENT_INFO_UPDATE_FAILURE");
    });
    Admob.addEventListener(Admob.CONSENT_NOT_REQUIRED, function () {
        console.log("Admod.CONSENT_NOT_REQUIRED. It is " + consent_status_values[Admob.getConsentStatus()]);
        activityIndicator.hide();
        if (Admob.getConsentStatus() == 2 || Admob.getConsentStatus() == 0) {
            //Not required. Move on
        } else if (Admob.getConsentStatus() == 3) {
            //Already obtained
        } else {
            activityIndicator.show();
            //Required! Do something about it.
        }
    });
    Admob.addEventListener(Admob.CONSENT_REQUIRED, function () {
        console.warn("Admod.CONSENT_REQUIRED");
        Admob.showConsentForm();
    });
    Admob.addEventListener(Admob.CONSENT_FORM_DISMISSED, function () {
        console.log("Admod.CONSENT_FORM_DISMISSED");
        if (Admob.getConsentStatus() == Admob.CONSENT_STATUS_OBTAINED) {
            activityIndicator.show();
            var adMobBannerView = Admob.createView({
                viewType: Admob.TYPE_ADS,
                adUnitId: "ca-app-pub-883352342342342343483081",
                publisherId: "ca-app-pub-88335732423423423417080",
                testDeviceId: "3F8D812312312312312317E1CED",
                adSizeType: Admob.ADAPTATIVE_BANNER,
                zIndex: 1000
            });
            win.add(adMobBannerView);
            adMobBannerView.addEventListener(Admob.AD_RECEIVED, function (e) {
                activityIndicator.hide();
                Titanium.API.info("Check Ads - received");
            });
            adMobBannerView.addEventListener(Admob.AD_NOT_RECEIVED, function (error) {
                Titanium.API.info("AD_NOT_RECEIVED - Failed to load ads");
                console.log("Reseting consent...");
                Admob.resetConsentForm();
                activityIndicator.hide();
                win.remove(adMobBannerView);
                adMobBannerView = null;
                /*FirebaseAnalytics.log("banner_error", {
                    "cause": error.cause || "not defined",
                    "code": error.code,
                    "message": error.message
                });*/
                if (error.code == 3 && error.message == "No ad config.") {
                    /*FirebaseAnalytics.log("banner_error", {
                        "cause": "user did not consent to ump",
                        "code": error.code,
                        "message": error.message
                    });*/
                    var paywallAlert = Titanium.UI.createAlertDialog({
                        title: L("allowTracking"),
                        message: L("paywallAlert"),
                        buttonNames: [L("removeAds"), L("allow")],
                        ok: 1
                    });
                    paywallAlert.addEventListener("click", function (a) {
                        if (a.index == 0) {
                            //win.purchaseRemoveAds();
                        } else if (a.index == 1) {
                            activityIndicator.show();
                            Admob.requestConsentForm();
                        }
                    });
                    paywallAlert.show();
                } else {
                    /*FirebaseAnalytics.log("banner_error", {
                        "code": error.code,
                        "message": error.message
                    });*/
                }
            });
        }
    });
    Admob.addEventListener(Admob.CONSENT_FORM_LOADED, function () {
        console.log("Admod.CONSENT_FORM_LOADED");
        activityIndicator.hide();
    });
    Admob.addEventListener(Admob.CONSENT_ERROR, function (e) {
        console.log("Admod.CONSENT_ERROR");
        alert(e.message);
        activityIndicator.hide();
    });
    win.add(activityIndicator);
    win.open();
    //Admob.requestConsentForm();
}, 5000);