# YourCardJourney Tools

One page, one bookmark: every **live** YourCardJourney tool, each wearing its own app
icon, grouped so nobody has to remember a dozen URLs. Static files, no build step.

Local preview: `python -m http.server 8772 --directory ycj-home` (launch entry `ycj-home`).

## What's on it

| Group | Tools |
|---|---|
| Gold boards | Karat Board, AmazonGold, FlipkartGold, BlinkDeal |
| Deals & rewards | GiftDeals, Reward Switch, WhichBike |
| Apps | Card Vault, Gift Card Vault (Play Store), Desktop apps (store download page) |

Header: the **WhatsApp bell** (deal-alerts channel; rings on arrival and every 30 s)
and the **master padlock**.

Local-only tools (Card Ledger, loaders, RuPay Redeem, Quick
Mailer, Focus Sprint) are deliberately left off: they are not live tools.

## Adding a tool

1. Put its icon in `marks/<id>.svg` (copy the app's own `favicon.svg`).
2. Add one line to `TOOLS` in `app.js` (group, id, name, tagline, url, glow colour).

Keep at most four per group so the page fits one screen without scrolling.

## Master back office

The padlock opens a dark **dock** (Pulse, ReCast, MS Admin, Coupon Watch, Feedback) and
puts a **megaphone** on every board that has an unlisted `/broadcast/` page.

None of those links are in the public files. They live in `tools/backoffice.json`
(gitignored), sealed into `vault.json` with the key in `master.key` (gitignored):

```
node tools/seal.mjs
```

PBKDF2-SHA256 (310k) → AES-GCM. The browser keeps only the derived key, so the master
stays signed in on that device until the padlock is tapped again. Change the key = edit
`master.key`, re-seal, publish; every device is signed out.
