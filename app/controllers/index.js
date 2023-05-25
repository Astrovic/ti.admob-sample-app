var Admob;
if (OS_IOS) {
    Admob = require('ti.admob');
} else {
    Admob = require("ti.android.admob");
    Admob.setTestDeviceId("4E9D70AA851097F0E3F3D0486FDBF60B"); //USE YOUR DEVICE ID HERE
}

if (OS_IOS) {
    console.debug(
        `		
		Admob.CONSENT_FORM_STATUS_UNKNOWN: ${Admob.CONSENT_FORM_STATUS_UNKNOWN};
		Admob.CONSENT_FORM_STATUS_AVAILABLE: ${Admob.CONSENT_FORM_STATUS_AVAILABLE};
		Admob.CONSENT_FORM_STATUS_UNAVAILABLE: ${Admob.CONSENT_FORM_STATUS_UNAVAILABLE};
		Admob.CONSENT_STATUS_UNKNOWN: ${Admob.CONSENT_STATUS_UNKNOWN};
		Admob.CONSENT_STATUS_REQUIRED: ${Admob.CONSENT_STATUS_REQUIRED};
		Admob.CONSENT_STATUS_NOT_REQUIRED: ${Admob.CONSENT_STATUS_NOT_REQUIRED};
		Admob.CONSENT_STATUS_OBTAINED: ${Admob.CONSENT_STATUS_OBTAINED};
		`
    );
}

function resetConsent() {
    alert("Reset consent done!");
    if (OS_IOS) {
        Admob.resetConsent();
    } else {
        Admob.resetConsentForm();
    }
}

function loadConsentForm(e) {
    if (OS_IOS) {
        requestConsent();
    } else {
        requestConsent();
    }
}


// check trackingAuthorizationStatus on iOS >= 14
function checkTrackingAuthorizationStatus() {
    if (Alloy.Globals.debug_mode) {
        console.debug("Admob.trackingAuthorizationStatus", Admob.trackingAuthorizationStatus);
        console.debug(Admob.trackingAuthorizationStatus === Admob.TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED);
    }
    if (parseInt(Ti.Platform.version.split(".")[0]) >= 14 &&
        Admob.trackingAuthorizationStatus === Admob.TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED
    ) {
        requestTrackingAuthorization();
    } else {
        requestConsent();
    }
}

function requestTrackingAuthorization() {
    if (Alloy.Globals.debug_mode) {
        console.debug("Current trackingAuthorizationStatus: --> ", Admob.trackingAuthorizationStatus);
        getStatus({
            status: Admob.trackingAuthorizationStatus
        });
    }

    function getStatus(e) {
        console.debug(e);
        if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED) {
            console.debug('TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED');
        } else if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_RESTRICTED) {
            console.debug('TRACKING_AUTHORIZATION_STATUS_RESTRICTED');
        } else if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_DENIED) {
            console.debug('TRACKING_AUTHORIZATION_STATUS_DENIED');
        } else if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED) {
            console.debug('TRACKING_AUTHORIZATION_STATUS_AUTHORIZED');
        } else {
            console.debug('TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED');
        }
    }
    Admob.requestTrackingAuthorization({
        callback: e => {
            getStatus(e);
            if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED) {
                console.debug("Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED, enable personalized ads in ads mediation too")
                Admob.setInMobi_updateGDPRConsent(true);
                Admob.setAdvertiserTrackingEnabled(true);
            }
            requestConsent();
        }
    });
};

function requestConsent() {
    console.debug("request consent");
    if (OS_IOS) {
        console.debug("request consent");
        Admob.requestConsentInfoUpdateWithParameters({
            testDeviceIdentifiers: [Admob.SIMULATOR_ID, '74AADF66-C4CA-4961-9839-C78815E056EB'],
            geography: Admob.DEBUG_GEOGRAPHY_EEA,
            tagForUnderAgeOfConsent: false,
            callback: function (e) {
                console.debug("requestConsentInfoUpdateWithParameters callback");
                console.debug(
                    `
                    Admob.CONSENT_FORM_STATUS_UNKNOWN: ${Admob.CONSENT_FORM_STATUS_UNKNOWN};
                    Admob.CONSENT_FORM_STATUS_AVAILABLE: ${Admob.CONSENT_FORM_STATUS_AVAILABLE};
                    Admob.CONSENT_FORM_STATUS_UNAVAILABLE: ${Admob.CONSENT_FORM_STATUS_UNAVAILABLE};                   
                    `
                );
                console.debug(e);
                if (e.success && e.status === Admob.CONSENT_FORM_STATUS_AVAILABLE) {
                    console.debug("Consent form is available, load it!");
                    Admob.loadForm({
                        callback: (e) => {
                            console.debug("Admob.loadConsentForm callback:");
                            console.debug(
                                `
                                Admob.CONSENT_STATUS_UNKNOWN: ${Admob.CONSENT_STATUS_UNKNOWN};
                                Admob.CONSENT_STATUS_REQUIRED: ${Admob.CONSENT_STATUS_REQUIRED};
                                Admob.CONSENT_STATUS_NOT_REQUIRED: ${Admob.CONSENT_STATUS_NOT_REQUIRED};
                                Admob.CONSENT_STATUS_OBTAINED: ${Admob.CONSENT_STATUS_OBTAINED};
                                `
                            )
                            console.debug(e);
                            if (e.dismissError || e.loadError) {
                                alert(e.dismissError || e.loadError);
                                return;
                            }
                            // If the status is "obtained" (freshly granted) or not required (already granted) continue
                            if ([Admob.CONSENT_STATUS_NOT_REQUIRED, Admob.CONSENT_STATUS_OBTAINED].includes(e.status)) {
                                checkConsent();
                            } else {
                                alert('Not ready to show ads! Status = ' + e.status);
                            }
                        }
                    })
                } else {
                    console.debug("No consent form is available");
                    checkConsent();
                }
            }
        });

    } else {

        Admob.requestConsentForm();
    }
};

function onOpen() {
    if (OS_IOS) {
        checkTrackingAuthorizationStatus();
    } else {


    }
}

function openTestAdsWin() {
    Alloy.createController("testAdsWin").getView().open();
}

if (OS_ANDROID) {
    Admob.addEventListener(Admob.CONSENT_REQUIRED, function () {
        console.debug("Admod.CONSENT_REQUIRED");
        Admob.showConsentForm();
    });
    Admob.addEventListener(Admob.CONSENT_NOT_REQUIRED, function () {
        console.debug("Admod.CONSENT_NOT_REQUIRED");
        //openTestAdsWin();
        checkConsent();
    });
    Admob.addEventListener(Admob.CONSENT_READY, function () {
        console.debug("Admod.CONSENT_READY");
    });

    Admob.addEventListener(Admob.CONSENT_INFO_UPDATE_FAILURE, function () {
        console.debug("Admod.CONSENT_INFO_UPDATE_FAILURE");
    });

    Admob.addEventListener(Admob.CONSENT_FORM_DISMISSED, function () {
        console.debug("Admod.CONSENT_FORM_DISMISSED");
    });

    Admob.addEventListener(Admob.CONSENT_FORM_LOADED, function () {
        console.debug("Admod.CONSENT_FORM_LOADED");
    });

    Admob.addEventListener(Admob.CONSENT_ERROR, function (e) {
        console.debug("Admod.CONSENT_ERROR");
        console.debug(e.message);
    });

    Admob.addEventListener(Admob.CONSENT_FORM_NOT_AVAILABLE, function (e) {
        console.debug("Admod.CONSENT_FORM_NOT_AVAILABLE");
        console.debug(e.message);
        checkConsent();
    });
}

function checkConsent() {
    if (Alloy.Globals.debug_mode) {
        console.debug("index.js: checkConsent()");
    }

    setTimeout(() => {
        // To check if I have consented to the ADS, I try to load the test ad banner
        // If I receive an error, I reset the consents and show the request form again
        /* Banner Ads */
        var adUnitId = OS_IOS ? 'ca-app-pub-3940256099942544/2934735716' : 'ca-app-pub-3940256099942544/6300978111';
        if (Alloy.Globals.debug_mode) {
            console.debug("test adUnitId:", adUnitId);
        }
        if (OS_IOS) {
            var bannerAdView = Admob.createView({
                debugEnabled: false,
                height: 50,
                bottom: 0,
                adType: Admob.AD_TYPE_BANNER,
                adUnitId: adUnitId, //'ca-app-pub-3940256099942544/2934735716', // You can get your own at http: //www.admob.com/
                adBackgroundColor: 'transparent',
                contentURL: 'https://admob.com', // URL string for a webpage whose content matches the app content.
                requestAgent: 'Titanium Mobile App', // String that identifies the ad request's origin.
                extras: {}, // Object of additional infos
                tagForChildDirectedTreatment: false // http:///business.ftc.gov/privacy-and-security/childrens-privacy for more infos								
            });
            $.index.add(bannerAdView);
            bannerAdView.addEventListener('didReceiveAd', function (e) {
                bannerAdView.removeEventListener('didReceiveAd', arguments.callee);
                $.index.remove(bannerAdView);
                bannerAdView = null;
                console.debug('bannerAdView - Did receive ad!');
                openTestAdsWin();
            });
            bannerAdView.addEventListener('didFailToReceiveAd', function (e) {
                bannerAdView.removeEventListener('didReceiveAd', arguments.callee);
                $.index.remove(bannerAdView);
                bannerAdView = null;
                console.error('bannerAdView - Failed to receive ad: ' + e.error);                
                Admob.resetConsent(); // reset permissions to show UMP form again
                alert("Authorization not granted! Decide what to do ...");                     
            });
        } else {
            var adView = Admob.createAdaptiveBanner({
                bottom: 0,
                //keyword : "titanium",
                //contentUrl : "www.myur.com",
                extras: {
                    //'npa': '1' //Disable personalized ads
                },
                viewType: Admob.TYPE_ADS,
                //adSizeType: Admob.BANNER,
                adaptiveType: Admob.ADAPTIVE_INLINE, // or Admob.ADAPTIVE_ANCHORED
                maxHeight: 50, // ONLY IF adaptiveType is Admob.ADAPTIVE_INLINE, maxHeight must be set. Default value is 50
                testDeviceId: "4E9D70AA851097F0E3F3D0486FDBF60B", //USE YOUR DEVICE ID HERE
                adUnitId: 'ca-app-pub-3940256099942544/6300978111', //USE YOUR AD_UNIT ID HERE               
            });
            $.index.add(adView);

            adView.addEventListener(Admob.AD_LOADED, function (e) {
                Titanium.API.info("Ad loaded");
                console.debug(e);
                setTimeout(() => {
                    $.index.remove(adView);
                    adView = null;
                    openTestAdsWin();
                }, 2000);
            });

            adView.addEventListener(Admob.AD_FAILED_TO_LOAD, function (e) {
                Titanium.API.info("Ad failed to load");
                console.error(e);
                $.index.remove(adView);
                adView = null;
                console.error('bannerAdView - Failed to receive ad: ' + e.error);
                Admob.resetConsentForm(); // reset permissions to show UMP form again
                alert("Authorization not granted! Decide what to do ...");
            });
        }

    }, 500);
}

$.index.open();