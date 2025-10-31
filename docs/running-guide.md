# MijnFegon draaien: lokaal vs. via GitHub

De applicatie is een Vite/React single-page app die rechtstreeks met Firebase verbindt. Hieronder staan de twee manieren om de site te draaien.

## 1. Lokaal draaien (aanbevolen tijdens ontwikkeling)
1. Installeer Node.js 18 of hoger.
2. Kopieer `.env.example` naar `.env.local` en controleer dat alle Firebase waarden correct zijn ingevuld.
3. Installeer dependencies:
   ```bash
   npm install
   ```
4. Start de ontwikkelserver:
   ```bash
   npm run dev
   ```
   Vite toont de lokale URL (meestal `http://localhost:5173`). Je kunt wijzigingen rechtstreeks zien en Firebase gebruikt de sleutels uit `.env.local`.

## 2. Host via GitHub (bijv. GitHub Pages)
Omdat de app statisch bouwt, kun je deze ook vanaf GitHub Pages of een andere static host serveren:
1. Commit en push de code naar GitHub.
2. Build de productieversie:
   ```bash
   npm run build
   ```
   Dit maakt een `dist/` map.
3. Publiceer de inhoud van `dist/` naar GitHub Pages of een andere hosting provider. Voor GitHub Pages kun je bijvoorbeeld de `gh-pages` branch gebruiken of een GitHub Action inzetten.
4. Voeg in de Firebase Console het GitHub Pages domein toe aan **Authentication → Settings → Authorized domains**, zodat gebruikers kunnen inloggen.
5. Voor GitHub Pages heb je geen `.env.local`, maar wel runtime configuratie nodig. Plaats daarom de productie-sleutels in `firebaseConfigDefaults` in `src/firebase.js`, of gebruik een build pipeline die de Vite env variabelen injecteert.

## Welke optie kies je?
- **Lokale omgeving**: ideaal om te ontwikkelen en testen; je hebt volledige controle over de Firebase credentials in `.env.local`.
- **GitHub hosting**: handig om de app te delen of live te zetten. Zorg er dan voor dat de build gehost wordt en dat de Firebase configuratie overeenkomt met het gedeployde domein.

In beide gevallen moet de Firebase authenticatie de gebruikte domeinen toestaan, anders krijgen gebruikers een foutmelding bij het inloggen.
