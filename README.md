# Titanium AdMob Sample App + Consent Controller Widget (UMP + ATT)

![Titanium SDK](https://img.shields.io/badge/Titanium%20SDK-13.0.0.GA-blue.svg)
![Alloy](https://img.shields.io/badge/Alloy-1.0%2B-lightgrey.svg)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

This repository contains:

1. A **full Titanium demo app** showing how to integrate AdMob by using [ti.admob (iOS)](https://github.com/Astrovic/ti.admob) and [ti.android.admob (Android)](https://github.com/deckameron/Ti.Android.Admob) modules.
2. A standalone **Alloy widget** implementing the complete  
   **User Messaging Platform (UMP)** + **App Tracking Transparency (ATT)** flow

The widget is reusable in any Titanium project and supports:
GDPR (EEA), US state regulations, ATT, intro view, privacy options, and test utilities.

---

## 📌 Repository Structure

- [`/app/`](app/)  
  Full Titanium demo application

- [`/app/widgets/com.astrovicapps.consentController/`](app/widgets/com.astrovicapps.consentController/)  
  Standalone **AdMob Consent Controller widget**

- [`app/widgets/com.astrovicapps.consentController/CHANGELOG.md`](app/widgets/com.astrovicapps.consentController/CHANGELOG.md)  
  Version history of the widget

- [`/README.md`](README.md)  
  This file

---

## 📘 ConsentController Widget Documentation

The Consent Controller widget has its own documentation:

➡ **Widget README**  
[`app/widgets/com.astrovicapps.consentController/README.md`](app/widgets/com.astrovicapps.consentController/README.md)

➡ **Widget Changelog**  
[`app/widgets/com.astrovicapps.consentController/CHANGELOG.md`](app/widgets/com.astrovicapps.consentController/CHANGELOG.md)

---

## 📦 Demo Features

The demo app includes:

- Sample UI for testing UMP + ATT
- Region override (EEA / US State / Other)
- Privacy options reopening
- Test Ad windows (banner / interstitial / rewarded / app open)
- Consent reset utility

Useful as a reference implementation for production apps.

---

## ▶️ Running the Demo

1. Install required AdMob modules in `tiapp.xml`  
2. Insert your **AdMob App ID** (iOS + Android)  
3. Build and run on a real device:

```
ti build -p ios
ti build -p android
```

You can use test device IDs for safe validation.

---

## 📷 Screenshots

<img src="https://github.com/user-attachments/assets/69ab519d-5965-4b75-add2-aba80c36d52a" alt="intro-view" style="width:400px;"/>
<img src="https://github.com/user-attachments/assets/f6605b7e-36c0-4a18-ac8e-a28a640dd104" alt="no-consent-view" style="width:400px;"/>

<img src="https://github.com/user-attachments/assets/b2a7b466-4e41-4fd0-b965-0f116a6b5444" alt="EEA-form" style="width:400px;"/>
<img src="https://github.com/user-attachments/assets/51df78c3-cdda-4274-bcfc-0f1eeb13a2bd" alt="US-form" style="width:400px;"/>

<img src="https://github.com/user-attachments/assets/d6e789d8-2c4a-4541-a105-a44aa70b295f" alt="test-ads-win" style="width:400px;"/>

---

## 👨‍💻 Author

**AstrovicApps**  
GitHub: https://github.com/Astrovic

Optimized, refactored and documented with the help of ChatGPT

---

## 📜 License

MIT License © 2025 AstrovicApps