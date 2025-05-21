var Admob;
if (OS_IOS) {
    Admob = require('ti.admob');
} else {
    Admob = require("ti.android.admob");
    Admob.setTestDeviceId("75D3684B4D6F191FCDBD9CC319FFD373"); //USE YOUR DEVICE ID HERE
}

$.debugRegionOptionBar.labels = ['EEA', 'REGULATED_US_STATE', 'OTHER', ];

let DEBUG_GEOGRAPHY = Titanium.App.Properties.getInt("DEBUG_GEOGRAPHY", Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE);

if (DEBUG_GEOGRAPHY === Admob.DEBUG_GEOGRAPHY_EEA) {
    $.debugRegionOptionBar.index = 0;
} else if (DEBUG_GEOGRAPHY === Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE) {
    $.debugRegionOptionBar.index = 1;
} else {
    $.debugRegionOptionBar.index = 2;
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
    console.log("Reset consent done!");    
    if (OS_IOS) {
        Admob.resetConsent();
    } else {
        Admob.resetConsentForm();
    }
    checkPrivacyOptionsButtonDisabled();
    resetConsentButtonDisabled();
    testAdsButtonDisabled();
}

function loadConsentForm(e) {
    requestConsent();
}


// checks trackingAuthorizationStatus on iOS >= 14
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
    console.debug("request consent for debug region: ", DEBUG_GEOGRAPHY);
    if (OS_IOS) {
        console.debug("request consent for iOS");;
        Admob.requestConsentInfoUpdateWithParameters({
            testDeviceIdentifiers: ['8BC2F615-0845-4B6B-BAC1-1DBB74000625'],
            geography: DEBUG_GEOGRAPHY, //Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE,
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
                    loadForm();
                } else {
                    console.debug("No consent form is available");                    
                    testAdsButtonEnabled();
                    checkPrivacyOptionsButtonDisabled();
                    resetConsentButtonEnabled();
                }
            }
        });

    } else {
        console.debug("requestConsentForm for Android");
        Admob.requestConsentForm(DEBUG_GEOGRAPHY); // Android specific
    }
};

function loadForm() {
    if (OS_IOS) {
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
                    testAdsButtonDisabled();
                    checkPrivacyOptionsButtonDisabled();
                    resetConsentButtonEnabled();
                    return;
                }
                // If the status is "obtained" (freshly granted) or not required (already granted) continue
                if ([Admob.CONSENT_STATUS_NOT_REQUIRED, Admob.CONSENT_STATUS_OBTAINED].includes(e.status)) {                
                    checkCanShowAds();
                    return;                
                } else {
                    console.warn('Not ready to show ads! Status = ' + e.status + ", check privacy options");
                    checkPrivacyOptions();
                }
            }
        });
    } else {
        // android does not have loadForm
    }
}

// checks if privacy options are required and presents them
function checkPrivacyOptions() {
    if (Admob.isPrivacyOptionsRequired()) {
        console.log("Privacy options required!");
        setTimeout(() => {
            console.log("presentPrivacyOptionsForm");
            if (OS_IOS) {
                Admob.presentPrivacyOptionsForm({
                    callback: function (e) {
                        console.debug(e);
                        if (e.error) {
                            console.error("Error presenting privacy options:", e.error);
                            // Try loading consent form again
                            loadForm();
                        } else {
                            console.log("Privacy options form presented successfully.");
                            checkCanShowAds();
                        }
                    }
                });
            } else {
                Admob.showConsentForm();
            }            
        }, 1000);

    } else {
        console.log("Opzioni sulla privacy non richieste.");
        checkCanShowAds();
    }
}

function checkCanShowAds() {
    console.debug("checkCanShowAds");
    console.debug("Admob.isGDPR():", Admob.isGDPR());
    if (Admob.isGDPR()) {
        if (Admob.canShowPersonalizedAds()) {
            console.debug("Admob.canShowPersonalizedAds()");
            testAdsButtonEnabled();
        } else if (Admob.canShowAds()) {
            console.debug("Admob.canShowAds()");
            testAdsButtonEnabled();
        } else {
            alert('You have not granted at least the minimum requirements to show ads!\n' +
                'No fear! You can buy an in-app purchase to use the app without ads :)');
            testAdsButtonDisabled();            
        }
        checkPrivacyOptionsButtonEnabled();
        resetConsentButtonEnabled();
    } else {
        testIfUsa(function (is_usa_data) {
            console.debug("testIfUsa callback:");
            console.debug(is_usa_data);
            if (is_usa_data.is_us_form) {
                console.debug("User is from REGULATED_US_STATE and has chosen privacy options.");
                checkPrivacyOptionsButtonEnabled();
            } else {
                console.debug("User is not from REGULATED_US_STATE nor EEA and has not chosen privacy options.");
                checkPrivacyOptionsButtonDisabled();
            }
            resetConsentButtonEnabled();
            testAdsButtonEnabled();
        });
    }
}

function onOpen() {
    if (OS_IOS) {
        checkTrackingAuthorizationStatus();
    }
}

if (OS_ANDROID) {
    var consentRequired = false;
    Admob.addEventListener(Admob.CONSENT_REQUIRED, function () {
        console.debug("Admod.CONSENT_REQUIRED");
        consentRequired = true;
    });
    Admob.addEventListener(Admob.CONSENT_NOT_REQUIRED, function () {
        console.debug("Admod.CONSENT_NOT_REQUIRED");
        consentRequired = false;
        checkCanShowAds() 
    });
    Admob.addEventListener(Admob.CONSENT_READY, function () {
        console.debug("Admod.CONSENT_READY");
    });

    Admob.addEventListener(Admob.CONSENT_INFO_UPDATE_FAILURE, function () {
        console.debug("Admod.CONSENT_INFO_UPDATE_FAILURE");
    });

    Admob.addEventListener(Admob.CONSENT_FORM_DISMISSED, function () {
        console.debug("Admod.CONSENT_FORM_DISMISSED");        
        checkCanShowAds();
    });

    Admob.addEventListener(Admob.CONSENT_FORM_LOADED, function () {
        console.debug("Admod.CONSENT_FORM_LOADED");
        if (consentRequired) {
            setTimeout(() => {
                Admob.showConsentForm();
            }, 1000);            
        }
    });

    Admob.addEventListener(Admob.CONSENT_ERROR, function (e) {
        console.debug("Admod.CONSENT_ERROR");
        console.debug(e.message);
    });

    Admob.addEventListener(Admob.CONSENT_FORM_NOT_AVAILABLE, function (e) {
        console.debug("Admod.CONSENT_FORM_NOT_AVAILABLE");
        console.debug(e.message);
        checkCanShowAds();
    });
}

function ipinfo(callback) {
    const xhr = Ti.Network.createHTTPClient({
        enableKeepAlive: false,
        timeout: 5000
    });

    xhr.onload = () => {
        try {
            const data = JSON.parse(xhr.responseText);
            callback({
                success: true,
                data
            });
        } catch (error) {
            callback({
                success: false,
                error: "Invalid JSON response",
                data: null
            });
        }
    };

    xhr.onerror = (e) => {
        callback({
            success: false,
            error: e.error || "Request failed",
            data: null
        });
    };

    const url = "https://ipinfo.io/json";

    xhr.open("GET", url);
    xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    xhr.setRequestHeader("Accept", "application/json, text/javascript, /; q=0.01");
    xhr.setRequestHeader("Referer", "https://www.google.com/");
    xhr.setRequestHeader("Connection", "keep-alive");

    xhr.send();
}

const testIfUsa = (callback) => {
    const USA_REGULATED_STATES = new Set([
        "California", "Colorado", "Connecticut", "Delaware", "Iowa",
        "Montana", "Nebraska", "New Hampshire", "New Jersey",
        "Oregon", "Texas", "Utah", "Virginia"
    ]);

    ipinfo((response) => {
        if (response.success && response.data) {
            const {
                country,
                region
            } = response.data;
            callback({
                country,
                region,
                is_us_form: (country === "US" && USA_REGULATED_STATES.has(region)) ||
                            DEBUG_GEOGRAPHY === Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE
            });
        } else {
            callback({
                error: true,
                is_us_form: false
            });
        }
    });
};

function chooseDebugRegion(e) {    
    resetConsent();
    switch (e.index) {
        case 0:
            DEBUG_GEOGRAPHY = Admob.DEBUG_GEOGRAPHY_EEA;
            break;
        case 1:
            DEBUG_GEOGRAPHY = Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE            
            break;
        default:
            DEBUG_GEOGRAPHY = Admob.DEBUG_GEOGRAPHY_OTHER;            
            break;
    }
    Titanium.App.Properties.setInt("DEBUG_GEOGRAPHY", DEBUG_GEOGRAPHY);
    console.log("chooseDebugRegion: " + DEBUG_GEOGRAPHY);
}
function checkPrivacyOptionsButtonEnabled() {
    $.checkPrivacyOptionsButton.enabled = true;
    $.checkPrivacyOptionsButton.backgroundColor = "green";
}

function checkPrivacyOptionsButtonDisabled() {
    $.checkPrivacyOptionsButton.enabled = false;
    $.checkPrivacyOptionsButton.backgroundColor = "red";
}

function resetConsentButtonEnabled() {
    $.resetConsentButton.enabled = true;
    $.resetConsentButton.backgroundColor = "green";
}

function resetConsentButtonDisabled() {
    $.resetConsentButton.enabled = false;
    $.resetConsentButton.backgroundColor = "red";
}

function testAdsButtonEnabled() {
    $.testAdsWinButton.enabled = true;
    $.testAdsWinButton.backgroundColor = "green";
}

function testAdsButtonDisabled() {
    $.testAdsWinButton.enabled = false;
    $.testAdsWinButton.backgroundColor = "red";
}

function openTestAdsWin() {
    Alloy.createController("testAdsWin").getView().open();
}

function manualCheckCanShowAds() {
    if (Alloy.Globals.debug_mode) {
        console.debug("index.js: manualCheckCanShowAds()");
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
                tagForChildDirectedTreatment: false, // https://developers.google.com/admob/ios/targeting#child-directed_setting for more infos
                tagForUnderAgeOfConsent: false, //https://developers.google.com/admob/ios/targeting#users_under_the_age_of_consent for more infos
                maxAdContentRating: Admob.MAX_AD_CONTENT_RATING_GENERAL, // https://developers.google.com/admob/ios/targeting#ad_content_filtering for more infos
            });
            $.index.add(bannerAdView);
            bannerAdView.addEventListener('didReceiveAd', function (e) {
                bannerAdView.removeEventListener('didReceiveAd', arguments.callee);
                $.index.remove(bannerAdView);
                bannerAdView = null;
                console.debug('bannerAdView - Did receive ad: ' + e.adUnitId);
                testAdsButtonEnabled();
                resetConsentButtonEnabled();
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
                    testAdsButtonEnabled();
                    resetConsentButtonEnabled();
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