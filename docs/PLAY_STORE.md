# Play Store – Ibadah (guide på svenska)

Den här guiden förklarar vad som redan är gjort i repot och vad **du** (appägaren) behöver göra i Google Play Console. Du behöver inte vara utvecklare för de flesta steg – men för signering/build behövs antingen hjälp från en utvecklare eller Android Studio på en egen dator.

**App-ID (paketnamn):** `com.altaheer.ibadah`  
Det går att byta **innan** första publiceringen. Efter första uppladdningen till Play är paketnamnet låst. Ändra i `capacitor.config.ts` (`appId`) och i `android/app/build.gradle` (`applicationId` / `namespace`) om du vill byta tidigt.

**Appnamn:** `Ibadah`  
**Webbuild-mapp (Vite):** `dist`

---

## 1. Vad vi redan gjort i projektet

- Installerat Capacitor: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`
- Skapat `capacitor.config.ts` med `appId`, `appName`, `webDir: dist`
- Skapat Android-projektet under `android/` (`npx cap add android` + sync)
- Lagt till npm-skript:
  - `npm run cap:sync` – bygger webbappen och synkar till Android
  - `npm run build:android` – debug-APK via Gradle
  - `npm run build:android:bundle` – release AAB (kräver signering)
- Denna guide + utkast till integritetspolicy: `docs/privacy-policy.md`

**OBS:** Nyckellager (keystore) och lösenord ska **aldrig** checkas in i Git.

---

## 2. Vad bara du kan göra i Google Play Console

1. **Skapa utvecklarkonto** – [Google Play Console](https://play.google.com/console) (~25 USD engångsavgift).
2. **Skapa app** – Create app → namn **Ibadah**, språk (t.ex. svenska/engelska), typ *App*, gratis/betald.
3. **Store listing** – kort/lång beskrivning, ikon, skärmdumpar, funktionsgrafik (se avsnitt 6).
4. **Content rating** – fyll i frågeformuläret (IARC). För en lokal vanetracker utan våld/konto är betyget vanligtvis lågt, men svara ärligt.
5. **Privacy policy URL** – publicera `docs/privacy-policy.md` (GitHub Pages, Google Doc “publicera på webben”, eller egen sajt) och klistra in URL:en.
6. **Data safety-formulär** – se nedan.
7. **Ladda upp en AAB** till en testbana (Internal testing rekommenderas först), sedan Production när du är redo.

### Data safety (viktigt för Ibadah)

I den här versionen:

- Data sparas **bara lokalt** (localStorage / enhetens lagring)
- **Inget** användarkonto
- **Ingen** egen server / backend
- **Ingen** analys-SDK inbyggd i appen från vår sida

I formuläret: ange att ni **inte** samlar in användardata till er (eller ange “No” för datainsamling om det stämmer med hur Play frågar). Om Play kräver mer detalj: förklara att data stannar på enheten och inte skickas till er. Uppdatera formuläret om ni senare lägger till konto, synk eller analytics.

---

## 3. Signering (upload key / Play App Signing)

Google rekommenderar **Play App Signing**:

1. Du skapar ett **upload keystore** lokalt (en gång).
2. Du signerar AAB:en med upload-nyckeln.
3. Google om-signerar för användare med sin egen app signing-nyckel.

### Skapa upload-keystore (på din dator)

```bash
keytool -genkey -v -keystore ibadah-upload.keystore -alias ibadah \
  -keyalg RSA -keysize 2048 -validity 10000
```

Spara keystore-filen och lösenorden **offline** (lösenordshanterare). Lägg dem **inte** i Git.

### Gradle-signering (release)

Skapa t.ex. `android/keystore.properties` (gitignorerad) med:

```properties
storeFile=/absolut/sökväg/till/ibadah-upload.keystore
storePassword=...
keyAlias=ibadah
keyPassword=...
```

Koppla sedan `signingConfigs` i `android/app/build.gradle` (en utvecklare kan hjälpa till med exakt snippet). Eller använd **Android Studio → Build → Generate Signed Bundle / APK**.

### Versioner

I `android/app/build.gradle` under `defaultConfig`:

| Fält | Betydelse | Första värden |
|------|-----------|---------------|
| `versionCode` | Heltal som **måste öka** vid varje Play-uppladdning | `1`, sedan `2`, … |
| `versionName` | Synligt versionsnummer för användare | `"1.0"`, `"1.0.1"`, … |

---

## 4. Bygga AAB / APK (kommandon)

Krav på byggdatorn: **JDK 17 eller 21**, Android SDK (platform enligt `compileSdk` i `android/variables.gradle`, just nu API **36**), och Node (Capacitor 8 vill ha **Node ≥ 22**).

```bash
# Från repo-roten
npm install
npm run build
npx cap sync android

# Debug-APK (för egen test, inte Play-produktion)
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk

# Release AAB (det Play vill ha) – kräver signingConfig
cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```

Hjälpskript från roten:

```bash
npm run cap:sync
npm run build:android          # debug APK
npm run build:android:bundle   # release AAB (när signering är på plats)
```

Sätt miljövariabler om Gradle inte hittar SDK:

```bash
export JAVA_HOME=...   # t.ex. JDK 21
export ANDROID_HOME=... # Android SDK-rot
```

Skapa `android/local.properties` (gitignorerad) med:

```properties
sdk.dir=/sökväg/till/Android/Sdk
```

---

## 5. Integritetspolicy

Utkast: [`docs/privacy-policy.md`](./privacy-policy.md)

Publicera den och länka URL:en i Play Console. Policyn beskriver att Ibadah är **localStorage-only** utan konto/server i denna version.

---

## 6. Skärmdumpar och ikon (översikt)

Kraven ändras ibland – kolla alltid Play Consoles checklista. Typiskt:

- **App-ikon:** 512×512 PNG (högupplöst)
- **Telefon-skärmdumpar:** minst 2 (ofta 16:9 eller liknande; Play anger min/max px)
- **Surfplatta** (valfritt men bra): egna skärmdumpar om du stödjer större skärmar
- **Feature graphic:** 1024×500 (butikens toppbanner)

Tips: ta skärmdumpar från en riktig telefon eller Android-emulator med den senaste UI:n (böner, qadha, vanor). Undvik personlig/känslig data i bilderna.

Befintliga PWA-ikoner i `public/` (`pwa-192.png`, `pwa-512.png`) är en start, men Play vill ofta ha en dedikerad butiksikon och snygga skärmdumpar.

---

## 7. Föreslagen ordning för dig som ägare

1. Publicera integritetspolicyn och spara URL:en.
2. Betala/aktivera Play Console-konto och skapa appen **Ibadah** med paketnamn `com.altaheer.ibadah` (måste matcha AAB:en).
3. Fyll i listing, content rating, Data safety.
4. Be om / bygg en **signerad AAB**, ladda upp till **Internal testing**, bjud in dig själv, testa.
5. När allt ser bra ut: rulla ut till Production.

---

## 8. Vanliga fallgropar

- Fel paketnamn i Console vs AAB → uppladdning nekas
- Glömt att öka `versionCode` → uppladdning nekas
- Privacy policy saknas eller är otillgänglig utan inloggning
- Data safety som inte stämmer med appen (uppdatera om ni lägger till nätverk/konto senare)
- Keystore borttappad → svårt att uppdatera appen (Play App Signing mildrar, men upload-nyckeln måste kunnas återställas via Play-process)

Frågor om repot: se GitHub-användaren **altaheer** och branchen/PR för Play Store-prep.
