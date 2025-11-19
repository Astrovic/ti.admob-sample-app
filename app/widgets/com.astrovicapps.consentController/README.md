# Titanium AdMob Consent Controller (UMP)

![Titanium SDK](https://img.shields.io/badge/Titanium%20SDK-13.0.0.GA-blue.svg)
![Alloy](https://img.shields.io/badge/Alloy-1.0%2B-lightgrey.svg)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green.svg)
![Version](https://img.shields.io/badge/Version-1.1.0-orange.svg)
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
       "com.astrovicapps.consentController": "1.1.0"
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

4. (Optional but recommended) Use the provided [`tiapp.xml`](https://github.com/Astrovic/ti.admob-sample-app/blob/master/tiapp.xml)
 as a reference for a ready-to-build sample configuration. 

---

## ⚙️ Basic Usage

### 📄 index.xml
```xml
<Alloy>
  <Widget id="consent" src="com.astrovicapps.consentController"/>
  <Window id="mainWin"/>
</Alloy>
```

---

### 📜 index.js
```javascript
$.consent.init({
  admobTestDeviceID: "YOUR-TEST-ID",
  debugGeography: Admob.DEBUG_GEOGRAPHY_EEA,
  showIntroView: true,
  onDone(res) {
    Ti.API.info("Consent result:", res);
  }
});

```

---

## 🧠 Widget API Reference

**Methods:** 

| Method | Description |
|---------|-------------|
| `init(params)` | Initializes and shows the consent flow. |
| `openPrivacyOptions(params)` | Opens the UMP privacy options manually. |
| `resetConsentForTest()` | Clears all consent data (for debug/testing). |

**Parameters:** 

| Parameter | Type | Description |
|------|------|-------------|
| `admobTestDeviceID` | string | Test device ID |
| `debugGeography` | int | `Admob.DEBUG_GEOGRAPHY_EEA` <br>`Admob.DEBUG_GEOGRAPHY_REGULATED_US_STATE` <br>`Admob.DEBUG_GEOGRAPHY_OTHER` |
| `showIntroView` | bool | Show intro screen before consent form |
| `onDone` | function | Callback with result object `{ adsAllowed, geography, status, trackingAuthorizationStatus }` |

**onDone callback result object:** 

| Name | Type | Description |
|------|------|-------------|
| `adsAllowed` | bool | Ads allowed or not allowed |
| `geography` | string | `GEOGRAPHY_EEA` <br> `GEOGRAPHY_REGULATED_US_STATE` <br> `GEOGRAPHY_OTHER` |
| `consentStatus` | string | `granted` <br> `not_required` <br> `error` |
| `trackingAuthorizationStatus` | int | ATT response (🍏 iOS only): <br>`0` - Not determined <br>`1` - Restricted  <br>`2` - Denied <br>`3` - Authorized |

onDone callback example:

```json
{
  "adsAllowed": true,
  "consentStatus": "granted",
  "geography": "GEOGRAPHY_EEA",
  "trackingAuthorizationStatus": 3
}
```

---

# 🍏 iOS ATT Behavior

This widget implements **best practices**:

1. UMP always runs **first**
2. If the final result is:
   - `adsAllowed === true`
   - ATT status is `NOT_DETERMINED`
3. Then:
   - The widget shows its own ATT intro view  
   - Then calls `requestTrackingAuthorization()`

### Why this order?
Showing ATT *before UMP* can violate **[Apple 5.1.1](https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage)** because tracking cannot be requested until the user accepts the UMP terms.

This widget ensures **fully compliant sequencing**.

---

# ⚠️ IMPORTANT — AdMob ATT Pre-Prompt Behavior

If inside your **AdMob account → Privacy & messaging** you create and enable your *[Identifier for Advertisers explainer](https://admob.google.com/v2/privacymessaging/idfa)*, then:

- Google will automatically show its own ATT-pre prompt  
- Google will also automatically call `requestTrackingAuthorization()`  
- The platform ATT status will **NOT** be `NOT_DETERMINED` anymore  
- Therefore **the widget's own ATT view will NOT be shown**  
- This is expected and correct

Your ATT flow may therefore work **without ever seeing the widget’s `.AttView`**.

This is not a bug — it means Google handled ATT automatically.

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

🌐 **Astrovic** [https://github.com/Astrovic](https://github.com/Astrovic)<br>
Optimized & documented with the help of ChatGPT

---

## 📜 License

MIT License © 2025 **AstrovicApps**