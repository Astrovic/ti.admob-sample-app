const Admob = require('ti.admob');

if (OS_IOS) {
	Admob.setDebugIdentifiers(["74AADF66-C4CA-4961-9839-C78815E056EB", Admob.SIMULATOR_ID]);

	console.log(
		`
		debugIdentifiers: ${Admob.debugIdentifiers};
		debugGeography: ${Admob.debugGeography};
		Admob.CONSENT_FORM_STATUS_UNKNOWN: ${Admob.CONSENT_FORM_STATUS_UNKNOWN};
		Admob.CONSENT_FORM_STATUS_AVAILABLE: ${Admob.CONSENT_FORM_STATUS_AVAILABLE};
		Admob.CONSENT_FORM_STATUS_UNAVAILABLE: ${Admob.CONSENT_FORM_STATUS_UNAVAILABLE};
		Admob.CONSENT_STATUS_UNKNOWN: ${Admob.CONSENT_STATUS_UNKNOWN};
		Admob.CONSENT_STATUS_REQUIRED: ${Admob.CONSENT_STATUS_REQUIRED};
		Admob.CONSENT_STATUS_NOT_REQUIRED: ${Admob.CONSENT_STATUS_NOT_REQUIRED};
		Admob.CONSENT_STATUS_OBTAINED: ${Admob.CONSENT_STATUS_OBTAINED};
		Admob.isTaggedForUnderAgeOfConsent: ${Admob.isTaggedForUnderAgeOfConsent()};	
		`
	);
}

function resetConsent() {
	Admob.resetConsent();
	alert("Reset consent done!");
}

function loadConsentForm(e) {	
	if (OS_IOS) {		
		requestConsent();		
	} else {		
		Admob.initialize("ca-app-pub-3940256099942544~3347511713");
		Ti.API.info("************");
		Admob.setInMobi_updateGDPRConsent(true);
		Ti.API.info("************");
		var adMobView;
		var extras = {
			adBackgroundColor : "red",
			npa : "1",
			rdp : "1"
		}
		// then create an adMob view
		adMobView = Admob.createBannerView({
			adUnitId: "ca-app-pub-3940256099942544/6300978111",
			testing: true, // default is false
			bottom: 50, // optional
			width: "100%",
			height: 200,
			adBackgroundColor: "black",
			//visible: true,
			adSize: Admob.AD_SIZE_BANNER,
			extras : extras
			//testDevices : "59FE7007404217A942F01AC03DDD9F56"
		});
		setTimeout(function () {
			$.index.add(adMobView);
		}, 1000);

		//listener for adReceived
		function didReceiveAd() {
			Ti.API.info(': ad received');
		}
		adMobView.addEventListener('load', didReceiveAd);

		//listener for adNotReceived
		function didFailToReceiveAd() {
			//alert("ad not received");
			Ti.API.info(": ad not received");
		}
		adMobView.addEventListener('fail', didFailToReceiveAd);

		function openLeftApp() {
			Ti.API.info(': open/leftapp!');			
		}
		//adMobView.addEventListener('open', openLeftApp);
		adMobView.addEventListener('leftapp', openLeftApp);
	}
}


// check trackingAuthorizationStatus on iOS >= 14
function checkTrackingAuthorizationStatus() {	
	if (Alloy.Globals.debug_mode) {
		Ti.API.info("Admob.trackingAuthorizationStatus", Admob.trackingAuthorizationStatus);
		Ti.API.info(Admob.trackingAuthorizationStatus === Admob.TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED);
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
		Ti.API.info("Current trackingAuthorizationStatus: --> ", Admob.trackingAuthorizationStatus);
		getStatus({
			status: Admob.trackingAuthorizationStatus
		});
	}

	function getStatus(e) {
		console.log(e);
		if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED) {
			console.log('TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED');
		} else if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_RESTRICTED) {
			console.log('TRACKING_AUTHORIZATION_STATUS_RESTRICTED');
		} else if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_DENIED) {
			console.log('TRACKING_AUTHORIZATION_STATUS_DENIED');
		} else if (e.status === Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED) {
			console.log('TRACKING_AUTHORIZATION_STATUS_AUTHORIZED');
		} else {
			console.log('TRACKING_AUTHORIZATION_STATUS_NOT_DETERMINED');
		}
	}	
	Admob.requestTrackingAuthorization({
		callback: e => {
			if (Alloy.Globals.debug_mode) {
				Ti.API.info("Admob.requestTrackingAuthorization callback(): ");
				getStatus(e);
				Admob.setAdvertiserTrackingEnabled(e.status === Admob.TRACKING_AUTHORIZATION_STATUS_AUTHORIZED); // Consenso Facebook Admob Mediation
			}
			requestConsent();
		}
	});
};

function requestConsent() {
	console.log("request consent");	
	Admob.requestConsentInfoUpdateWithParameters({
		publisherIdentifiers: OS_IOS ? "pub-3940256099942544" : "pub-3940256099942544",
		tagForUnderAgeOfConsent: false,
		callback: function (e) {
			console.log("requestConsentInfoUpdateWithParameters callback");
			console.log(e);
			console.log(
				`
				debugIdentifiers: ${Admob.debugIdentifiers};
				debugGeography: ${Admob.debugGeography};
				Admob.CONSENT_FORM_STATUS_UNKNOWN: ${Admob.CONSENT_FORM_STATUS_UNKNOWN};
				Admob.CONSENT_FORM_STATUS_AVAILABLE: ${Admob.CONSENT_FORM_STATUS_AVAILABLE};
				Admob.CONSENT_FORM_STATUS_UNAVAILABLE: ${Admob.CONSENT_FORM_STATUS_UNAVAILABLE};
				Admob.CONSENT_STATUS_UNKNOWN: ${Admob.CONSENT_STATUS_UNKNOWN};
				Admob.CONSENT_STATUS_REQUIRED: ${Admob.CONSENT_STATUS_REQUIRED};
				Admob.CONSENT_STATUS_NOT_REQUIRED: ${Admob.CONSENT_STATUS_NOT_REQUIRED};
				Admob.CONSENT_STATUS_OBTAINED: ${Admob.CONSENT_STATUS_OBTAINED};
				`
			);
			if (Alloy.Globals.debug_mode) {
				Ti.API.info('Consent info requested successfully: ' + e.success);
				Ti.API.info('adProviders : --->', Admob.adProviders);
			}
			if (Admob.adProviders) {
				if (Admob.adProviders.length > 0) {
					if (Admob.adProviders[0].privacyPolicyURL) {
						Ti.API.info('adProviders.length:', adProviders.length);
						Ti.API.info('adProviders[0].privacyPolicyUR');
						//adProviders = Admob.adProviders;
					};
				};
			};
			if (e.success) {				
				Admob.loadForm({					
					callback: (e) => {
						console.log("Admob.loadConsentForm callback:");
						console.log(e);
						// If the status is "obtained" (freshly granted) or not required (already granted) continue
						if ([Admob.CONSENT_STATUS_NOT_REQUIRED, Admob.CONSENT_STATUS_OBTAINED].includes(e.status)) {
							openTestAdsWin();
						} else {
							alert('Not ready to show ads! Status = ' + e.status);
						}
					}
				})				
			}
		}
	});
	/*
	Admob.requestConsentInfoUpdateForPublisherIdentifiers({
		publisherIdentifiers: OS_IOS ? "pub-3940256099942544" : "pub-3940256099942544",
		callback: function (e) {
			console.log("qui nooooooo");
			if (Alloy.Globals.debug_mode) {
				Ti.API.info('Consent info requested successfully: ' + e.success);
				Ti.API.info('adProviders : --->', Admob.adProviders);
			}
			if (Admob.adProviders) {
				if (Admob.adProviders.length > 0) {
					if (Admob.adProviders[0].privacyPolicyURL) {						
						Ti.API.info('adProviders.length:', adProviders.length);
						Ti.API.info('adProviders[0].privacyPolicyUR');
						//adProviders = Admob.adProviders;
					};
				};
			};
			//Ti.App.Properties.setObject("adProviders", adProviders);
			//createAdProvidersList();
		}
	});
	*/
};

function onOpen() {
	if(OS_IOS) {
		checkTrackingAuthorizationStatus();
		Ti.API.info("************");
		setTimeout(() => {
			Admob.setInMobi_updateGDPRConsent(false);
			//Admob.setAdvertiserTrackingEnabled("ue");
			Ti.API.info("************");
		}, 1000);		
	} else {
		

	}	
}

function openTestAdsWin() {
	Alloy.createController("testAdsWin").getView().open();
}

$.index.open();
