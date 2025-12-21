# 🍝 Go!Food Menù - Menu Digitale

Menu digitale responsive per Go!Food Menù, accessibile tramite QR code con immagini grandi e appetitose di ogni piatto.

## 🎨 Features

- **📱 Mobile-First Design**: Ottimizzato per smartphone e tablet
- **🌍 Bilingue**: Supporto italiano e inglese con switch istantaneo
- **🖼️ Immagini Dominanti**: Ogni piatto con foto grande e ben visibile (aspect ratio 4:3)
- **⚡ Performance**: Next.js 15 con ottimizzazione automatica delle immagini
- **🎯 Navigazione Intuitiva**: Categorie sticky con scroll smooth
- **♿ Accessibile**: Semantic HTML e contrasti adeguati
- **🏷️ Info Allergeni**: Badge chiari per allergeni comuni

## 🚀 Quick Start

### Installazione

```bash
npm install
```

### Sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

### Build Produzione

```bash
npm run build
npm start
```

## 📁 Struttura Progetto

```
magnaroma-table-menu/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout principale con LanguageProvider
│   │   ├── page.tsx            # Homepage con menu completo
│   │   └── globals.css         # Stili globali
│   ├── components/
│   │   ├── Header.tsx          # Header con logo e language switcher
│   │   ├── CategoryNav.tsx     # Navigazione categorie
│   │   ├── DishCard.tsx        # Card singolo piatto
│   │   ├── LanguageSwitcher.tsx # Toggle IT/EN
│   │   └── ScrollToTop.tsx     # Bottone scroll to top
│   ├── contexts/
│   │   └── LanguageContext.tsx # Context per gestione lingua
│   ├── hooks/
│   │   └── useTranslation.ts   # Hook per traduzioni
│   ├── types/
│   │   └── menu.ts             # TypeScript interfaces
│   └── data/
│       └── menu.json           # Dati del menu
└── public/
    └── images/
        └── dishes/             # Immagini piatti
```

## 🖼️ Gestione Immagini

### Aggiungere le Foto dei Piatti

1. Posiziona le tue foto professionali in `/public/images/dishes/`
2. Nomina i file esattamente come nel `menu.json` (es: `carbonara.jpg`)
3. **Formato consigliato**: WebP o JPEG ottimizzato
4. **Dimensioni**: Max 1200px di larghezza
5. **Aspect Ratio**: 4:3 o 16:9 per risultati ottimali

Vedi `/public/images/dishes/README.md` per la lista completa dei file necessari.

### Ottimizzazione Immagini

Next.js ottimizza automaticamente le immagini con:
- Lazy loading
- Responsive images
- Modern formats (WebP)
- Dimensioni ottimizzate per device

## 📝 Modificare il Menu

Modifica il file `/src/data/menu.json` per:
- Aggiungere/rimuovere piatti
- Modificare prezzi
- Aggiornare descrizioni
- Gestire allergeni

### Struttura Piatto

```json
{
  "id": "carbonara",
  "name": {
    "it": "Carbonara",
    "en": "Carbonara"
  },
  "description": {
    "it": "Descrizione italiana",
    "en": "English description"
  },
  "price": "14.00",
  "image": "/images/dishes/carbonara.jpg",
  "allergens": ["glutine", "uova", "lattosio"]
}
```

### Allergeni Supportati

- `glutine` (Gluten)
- `lattosio` (Lactose)
- `uova` (Eggs)
- `pesce` (Fish)
- `frutta-secca` (Nuts)
- `sedano` (Celery)

## 🎨 Design System

### Colori

- **Rosso Roma**: `#8B0000` (accenti, bottoni)
- **Oro/Ocra**: `#D4AF37` (dettagli, badge prezzi)
- **Bianco/Crema**: `#FFF8E7` (background)
- **Grigio/Nero**: Testi

### Tipografia

- **Headings**: Playfair Display (serif elegante)
- **Body**: Inter (sans-serif leggibile)

## 📱 QR Code

Per generare il QR code:

1. Deploya l'applicazione (Vercel, Netlify, ecc.)
2. Usa il link di produzione per generare un QR code
3. Stampa il QR code e posizionalo sui tavoli

### Servizi QR Code Consigliati

- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode Monkey](https://www.qrcode-monkey.com/)

## 🌐 Deploy

### Vercel (Consigliato)

```bash
npm install -g vercel
vercel
```

### Altre Opzioni

- Netlify
- Railway
- Render
- AWS Amplify

## 🛠️ Stack Tecnologico

- **Framework**: Next.js 15 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **Fonts**: Google Fonts (Inter, Playfair Display)

## 📜 License & Usage

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### ⚠️ Important Notes

- **Code**: Open source and free to use under MIT License
- **Brand Assets**: Go!Food Menù name, logo, and branding are © Go!Food Menù
- **Content**: Menu items, descriptions, and images are © Go!Food Menù
- **Commercial Use**: You can use this code for your restaurant, but not the Go!Food Menù brand

### 🙏 Attribution

If you use this code for your restaurant:
- A link back to this repo is appreciated (but not required)
- Consider starring ⭐ the project
- Share your implementation - we'd love to see it!

### 🤝 Contributing

While this was built for a specific client, improvements and bug fixes are welcome!
Feel free to:
- Open issues for bugs
- Submit PRs for enhancements
- Fork for your own restaurant

**Built with ❤️ for the food industry**

## 🤝 Supporto

Per domande o supporto, contatta il team di sviluppo.

---

**Go!Food Menù** - Il tuo menu digitale 🍝
