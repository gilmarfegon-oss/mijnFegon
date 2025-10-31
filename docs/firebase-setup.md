# Firebase configuratie handleiding

Deze applicatie verwacht een geldige Firebase configuratie. Als één van de waarden ontbreekt of een placeholder bevat, krijg je bij het inloggen de melding `API key not valid`. Volg onderstaande stappen om de configuratie correct in te stellen.

## 1. Haal de projectgegevens op
1. Ga in de [Firebase Console](https://console.firebase.google.com/) naar je project **MijnFegon** (of het project dat je zelf gebruikt).
2. Navigeer naar **Projectinstellingen → Algemeen → Je apps → Web-app**.
3. Noteer de volgende waardes uit het `firebaseConfig` object:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## 2. Vul de omgevingsvariabelen in
1. Kopieer het bestand `.env.example` naar `.env.local` (dit wordt automatisch door Vite geladen).
2. Vul elke variabele met de waarde uit stap 1. Laat geen placeholders of woorden als `undefined`/`null` staan.

```bash
cp .env.example .env.local
# Bewerkt vervolgens .env.local
```

Voorbeeld:

```ini
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=mijnfegon.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mijnfegon
VITE_FIREBASE_STORAGE_BUCKET=mijnfegon.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=415529097955
VITE_FIREBASE_APP_ID=1:415529097955:web:da03af79ae2888a58a83d6
```

> ⚠️ Laat je een waarde leeg of vul je `undefined` in, dan valt de applicatie terug op de standaardconfiguratie uit `src/firebase.js`. Als ook die niet klopt, verschijnt opnieuw de foutmelding over een ongeldige API key.

## 3. Voeg de ontwikkel- en productie-domeinen toe
1. Ga naar **Authentication → Instellingen → Geautoriseerde domeinen**.
2. Controleer dat `localhost` en de domeinen waar je de app host (bijvoorbeeld `mijnfegon.web.app`) in de lijst staan. Voeg ze anders toe.

## 4. Activeer de gebruikte inlogmethodes
1. Ga naar **Authentication → Sign-in method**.
2. Schakel **Email/Password** en **Google** in.
3. Voeg eventueel je e-mailadres toe aan de lijst met geautoriseerde Google gebruikers als er beperkingen gelden.

## 5. Start de app opnieuw
Sla je `.env.local` op en herstart de ontwikkelserver.

```bash
npm install
npm run dev
```

Je kunt nu opnieuw inloggen of registreren zonder de `API key not valid` melding.
