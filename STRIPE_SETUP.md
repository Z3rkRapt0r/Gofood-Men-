# Guida Configurazione Stripe

Ecco i passaggi necessari per configurare il tuo account Stripe e renderlo operativo con il menu digitale.

## 1. Crea Piani di Abbonamento (Prodotti)
Devi creare il prodotto che gli utenti acquisteranno.

1.  Vai nella **Dashboard Stripe** > **Prodotti** > **Aggiungi Prodotto**.
2.  Nome: "Menu Premium" (o quello che preferisci).
3.  Prezzo: Inserisci l'importo (es. 15,00€).
4.  Tipo: **Ricorrente** (Mensile o Annuale).
5.  Salva.
6.  Copia il **Price ID** (inizia con `price_...`).
    *   Incollalo nel file `.env.local` alla voce `STRIPE_PRICE_ID`.

## 2. Recupera le Chiavi API
1.  Vai su **Sviluppatori** > **Chiavi API**.
2.  Copia la **Chiave Pubblica** (`pk_test_...` o `pk_live_...`).
    *   Incollalo in `.env.local` come `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3.  Copia la **Chiave Segreta** (`sk_test_...` o `sk_live_...`).
    *   Incollalo in `.env.local` come `STRIPE_SECRET_KEY`.

## 3. Configura il Webhook (Fondamentale)
Il Webhook serve a Stripe per avvisare la tua app quando avviene un pagamento, attivando così l'abbonamento.

### Per Sviluppo Locale (Test)
Se stai lavorando sul tuo computer:
1.  Scarica la Stripe CLI.
2.  Esegui nel terminale: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
3.  Copia il "Webhook Signing Secret" che appare nel terminale (`whsec_...`).
    *   Incollalo in `.env.local` come `STRIPE_WEBHOOK_SECRET`.

### Per Produzione (Quando vai online)
1.  Vai su **Sviluppatori** > **Webhook** > **Aggiungi endpoint**.
2.  URL Endpoint: `https://il-tuo-dominio.com/api/stripe/webhook`
3.  Seleziona gli eventi da ascoltare:
    *   `checkout.session.completed` (Attiva abbonamento/cambia slug).
    *   `customer.subscription.updated` (Gestisce rinnovi/mancati pagamenti).
    *   `customer.subscription.deleted` (Disattiva account se abbonamento cancellato).
4.  Salva e rivela la **Firma del segreto** (`whsec_...`).
    *   Inseriscila nelle variabili d'ambiente del tuo hosting (es. Vercel, Railway) come `STRIPE_WEBHOOK_SECRET`.

## Riepilogo Variabili d'Ambiente (.env.local)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```
