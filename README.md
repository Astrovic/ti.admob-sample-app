# Titanium AdMob Consent Controller (UMP)

![Titanium SDK](https://img.shields.io/badge/Titanium%20SDK-13.0.0.GA-blue.svg)
![Alloy](https://img.shields.io/badge/Alloy-1.0%2B-lightgrey.svg)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

> A **universal Titanium Alloy widget** for managing **AdMob User Messaging Platform (UMP)** consent flow on both Android and iOS.  
> Handles GDPR (EEA), US state regulations, and Apple’s ATT (App Tracking Transparency) with a unified interface.

---

## 🚀 Features
✅ Compatible with **Android** and **iOS**  
✅ Supports **GDPR (EEA)** and **US State** consent forms  
✅ Integrates **AdMob UMP** and **ATT** requests  
✅ Optional **intro screen** before showing consent form  
✅ Manual reopening of privacy options (`openPrivacyOptions()`)  
✅ Fully customizable **TSS + XML UI**  
✅ Works both as a **standalone controller** or an **Alloy widget**

---

## 📷 Screenshots
<img src="https://github.com/user-attachments/assets/69ab519d-5965-4b75-add2-aba80c36d52a" alt="intro-view" style="width:400px;"/>
<img src="https://github.com/user-attachments/assets/f6605b7e-36c0-4a18-ac8e-a28a640dd104" alt="no-consent-view" style="width:400px;"/>

<img src="https://github.com/user-attachments/assets/b2a7b466-4e41-4fd0-b965-0f116a6b5444" alt="EEA-form" style="width:400px;"/>
<img src="https://github.com/user-attachments/assets/51df78c3-cdda-4274-bcfc-0f1eeb13a2bd" alt="US-form" style="width:400px;"/>

<img src="https://github.com/user-attachments/assets/d6e789d8-2c4a-4541-a105-a44aa70b295f" alt="test-ads-win" style="width:400px;"/>

---

## 🧩 Requirements

| Component | Minimum Version | Notes |
|------------|-----------------|-------|
| [Titanium SDK](https://github.com/tidev/titanium-sdk) | **13.0.0.GA** | Required for modern Android/iOS support |
| [ti.admob (iOS)](https://github.com/Astrovic/ti.admob) | **8.1.0** | AdMob module for iOS |
| [ti.android.admob (Android)](https://github.com/deckameron/Ti.Android.Admob) | **11.1.0** | AdMob module for Android |

---

## 📦 Installation

1. Copy the widget folder to your Titanium project:
   ```
   app/widgets/com.astrovicapps.consentController/
   ```

2. Add the widget dependency to your `app/config.json`:
   ```json
   {
     "dependencies": {
       "com.astrovicapps.consentController": "1.0.0"
     }
   }
   ```

3. Add the AdMob modules to your `tiapp.xml`:
   ```xml
   <modules>
     <module platform="android" version="11.1.0">ti.android.admob</module>
     <module platform="iphone" version="8.1.0">ti.admob</module>
   </modules>
   ```

4. (Optional but recommended) Use the provided `tiapp.xml` as a reference for a ready-to-build sample configuration.

---

## ⚙️ Usage Example

### 📄 index.xml
```xml
<Alloy>
  <!-- Import the widget -->
  <Widget id="consentWidget" src="com.astrovicapps.consentController" />

  <Window class="container" layout="vertical">
    <Label top="40" text="Demo consentController" font.fontSize="20" font.fontWeight="bold" />
    <OptionBar top="20" id="debugRegionOptionBar" onClick="chooseDebugRegion" />
    <Button id="btnStart" top="20" onClick="startAppSim" backgroundColor="green">Simulate App Launch (init)</Button>
    <Button id="btnPrivacy" top="20" onClick="openPrivacyOptionsSim" enabled="false" backgroundColor="red">Open Privacy Options</Button>
    <Button id="btnReset" top="20" onClick="resetForTest" enabled="false" backgroundColor="red">Reset Consent (test)</Button>
    <Button top="20" id="testAdsWinButton" onClick="openTestAdsWin" enabled="false" backgroundColor="red">Open Test Ads</Button>
    <Label id="status" text="" top="40" color="#333" width="90%" textAlign="center" />
  </Window>
</Alloy>
```

---

### 📜 index.js
```javascript
/**
 * index.js
 * ------------------------------------------------------------
 * Demo launcher for com.astrovicapps.consentController
 * ------------------------------------------------------------
 */

Ti.API.info("Running demo for com.astrovicapps.consentController v1.0.0");

var Admob = OS_IOS ? require("ti.admob") : require("ti.android.admob");

// Set test device ID
Alloy.Globals.admobTestDeviceID = "USE YOUR TEST DEVICE ID";
if (OS_ANDROID) {
    Admob.setTestDeviceId(Alloy.Globals.admobTestDeviceID);
}

// Configure Debug Region Selector
$.debugRegionOptionBar.labels = ["EEA", "US_STATE", "OTHER"];
let DEBUG_GEOGRAPHY = Titanium.App.Properties.getInt(
    "DEBUG_GEOGRAPHY",
    Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE
);

$.debugRegionOptionBar.index = [Admob.DEBUG_GEOGRAPHY_EEA, Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE, Admob.DEBUG_GEOGRAPHY_OTHER]
    .indexOf(DEBUG_GEOGRAPHY) || 0;

// ============================================================
//  STARTUP SIMULATION (INIT FLOW)
// ============================================================
function startAppSim() {
    console.log("startAppSim - create consentController");

    $.consentWidget.init({
        admobTestDeviceID: Alloy.Globals.admobTestDeviceID,
        debugGeography: DEBUG_GEOGRAPHY,
        showIntroView: true,
        onDone: function (result) {
            console.debug("index.js - consent result:", result);
            btnStartDisabled();
            btnResetEnabled();

            if (result.geography === "GEOGRAPHY_OTHER") btnPrivacyDisabled();
            else btnPrivacyEnabled();

            if (result.adsAllowed) {
                $.testAdsWinButton.enabled = true;
                $.testAdsWinButton.backgroundColor = "green";
                $.status.text = "✅ Ads allowed:\n" + JSON.stringify(result, null, 2);
            } else {
                $.testAdsWinButton.enabled = false;
                $.testAdsWinButton.backgroundColor = "red";
                $.status.text = "🚫 Ads not allowed:\n" + JSON.stringify(result, null, 2);
            }
        }
    });
}

// ============================================================
//  MANUAL PRIVACY OPTIONS
// ============================================================
function openPrivacyOptionsSim() {
    console.log("openPrivacyOptionsSim - manual mode");

    setTimeout(() => {
        $.consentWidget.openPrivacyOptions({
            debugGeography: DEBUG_GEOGRAPHY,
            showIntroView: true,
            onDone: function (result) {
                console.log("→ CALLBACK openPrivacyOptions() onDone()", result);
                $.status.text = result.adsAllowed
                    ? "✅ Consent updated:\n" + JSON.stringify(result, null, 2)
                    : "⚠️ Consent denied:\n" + JSON.stringify(result, null, 2);
            }
        });
    }, 800);
}

// ============================================================
//  RESET CONSENT
// ============================================================
function resetForTest() {
    console.log("resetForTest - reset consent");
    $.consentWidget.resetConsentForTest();

    $.status.text = "";
    btnStartEnabled();
    btnPrivacyDisabled();
    btnResetDisabled();

    alert("Consent reset completed!");
}

// ============================================================
//  CHANGE DEBUG REGION
// ============================================================
function chooseDebugRegion(e) {
    resetForTest();
    DEBUG_GEOGRAPHY = [Admob.DEBUG_GEOGRAPHY_EEA, Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE, Admob.DEBUG_GEOGRAPHY_OTHER][e.index];
    Titanium.App.Properties.setInt("DEBUG_GEOGRAPHY", DEBUG_GEOGRAPHY);
    console.log("chooseDebugRegion: " + DEBUG_GEOGRAPHY);
}

// ============================================================
//  TEST WINDOW - SAMPLE ADS
// ============================================================
function openTestAdsWin() {
    Alloy.createController("testAdsWin").getView().open();
}

// ============================================================
//  BUTTON HELPERS
// ============================================================
function btnStartEnabled() { $.btnStart.enabled = true; $.btnStart.backgroundColor = "green"; }
function btnStartDisabled() { $.btnStart.enabled = false; $.btnStart.backgroundColor = "red"; }
function btnPrivacyEnabled() { $.btnPrivacy.enabled = true; $.btnPrivacy.backgroundColor = "green"; }
function btnPrivacyDisabled() { $.btnPrivacy.enabled = false; $.btnPrivacy.backgroundColor = "red"; }
function btnResetEnabled() { $.btnReset.enabled = true; $.btnReset.backgroundColor = "green"; }
function btnResetDisabled() { $.btnReset.enabled = false; $.btnReset.backgroundColor = "red"; }

$.index.open();
```

---

## 🧠 Widget API Reference

| Method | Description |
|---------|-------------|
| `init(params)` | Initializes and shows the consent flow. |
| `openPrivacyOptions(params)` | Opens the UMP privacy options manually. |
| `resetConsentForTest()` | Clears all consent data (for debug/testing). |

**Common parameters:** 

| Name | Type | Description |
|------|------|-------------|
| `admobTestDeviceID` | string | Test device ID |
| `debugGeography` | int | `Admob.DEBUG_GEOGRAPHY_EEA` / `Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE` / `Admob.DEBUG_GEOGRAPHY_OTHER` |
| `showIntroView` | bool | Show intro screen before consent form |
| `onDone` | function | Callback fired with `{ adsAllowed, geography, status }` |

---

## 🧩 tiapp.xml Example (included in this repo)

Includes:
- `ti.admob` (iOS)
- `ti.android.admob` (Android)
- Predefined SKAdNetwork identifiers (iOS)
- AdMob Test APPLICATION_ID
- GDPR & ATT ready configuration (iOS)

---

## ⚠️ Troubleshooting

| Issue | Possible Cause | Solution |
|--------|----------------|-----------|
| The widget doesn’t show any screen | `<Widget>` tag placed inside `<Window>` | Move `<Widget>` **outside** the main window. |
| UMP form never appears | `debugGeography` set to `OTHER` | Use `Admob.DEBUG_GEOGRAPHY_EEA` or `REGULATED_US_STATE`. |
| ATT dialog not shown on iOS | Missing `NSUserTrackingUsageDescription` | Add it in `tiapp.xml` under `<plist>`. |
| Ads not showing in test mode | Missing test device ID | Use `admobTestDeviceID` with your own device ID. |

---

## 👨‍💻 Author

**Astrovic** 
🌐 [https://github.com/Astrovic](https://github.com/Astrovic)

---

## 📜 License

MIT License © 2025 **AstrovicApps**
