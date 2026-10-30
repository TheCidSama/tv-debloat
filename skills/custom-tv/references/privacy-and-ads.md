# Tracking (ACR) and ads

Two layers: switch off tracking in the TV's own menus (this is what stops the data being
collected), then block ad and telemetry servers with DNS (catches the rest). These are TV
menu settings: the user changes them; you give exact paths and explain each option.

## 1. TV menu settings

**Samsung** (2024–2025 Tizen; names shift between years):
`Settings → All Settings → General & Privacy → Terms & Privacy` (some menus: **Privacy
Choices**; older: `Settings → Support → Terms & Privacy`). Turn off:

- **Viewing Information Services**: ACR, identifies what is on screen, including HDMI.
- **Interest-Based Advertisements**.
- **Voice Recognition Services**, unless they use voice.
- Anything called **Personalized Content**, **Customization Service**, **Recommendations**.

Also `General & Privacy → Start Screen Option`: **Autorun Samsung TV Plus** and
**Autorun Last App** off (also needed for a custom launcher at power-on).

**LG webOS:** Settings → General → System → Additional Settings (or Support → Privacy &
Terms) → **Live Plus** off (LG's ACR), **Viewing Information** / **Interest-Based
Recommendation** / **Ad personalisation** off; User Agreements: decline optional ones.

**Android TV / Google TV:** Settings → Privacy → Ads → **Delete advertising ID** / opt out
of personalisation; Usage & diagnostics off; on Google TV turn on **Apps only mode**
(Settings → Accounts & Sign In → your profile) if the user doesn't want recommendations.
Brand ACR settings also exist (Sony "Samba Interactive TV", TCL/Hisense "Viewing data").

**Roku:** Settings → Privacy → Smart TV experience → **Use info from TV inputs** off;
Settings → Privacy → Advertising → **Limit ad tracking** on.

**Fire TV:** Settings → Preferences → Privacy Settings → **Device Usage Data**,
**Collect App Usage Data**, **Interest-based Ads** off.

## 2. DNS blocking

Simplest (no account, free): set the TV's DNS manually to AdGuard DNS `94.140.14.14`
(secondary `94.140.15.15`). Samsung path: `Settings → All Settings → Connection → Network →
Network Status → IP Settings → DNS Setting: Enter manually`. Undo: **Obtain automatically**.

Stronger: Pi-hole, AdGuard Home or NextDNS on the router/network with a Samsung list
(AeroTizen ships `dns/samsung-ads.txt`, a "safe" tier that keeps the store, logins, updates
and casting working, and `dns/samsung-aggressive.txt`, which can break firmware updates,
app downloads and Samsung account features; only add it if the user accepts that).

Test before recommending a resolver: `scripts/check_dns_blocking.sh 94.140.14.14
<list>` resolves each domain through that server and shows blocked (`0.0.0.0` / no answer)
vs. resolved. Results observed for AdGuard public DNS in October 2026 against the safe
list: `samsungads.com` (+ ads/events/config), `samsungacr.com` (+ log-1/2/3,
log-config), `tvx.adgrx.com` blocked; `samsungrm.net`, `acr0.samsungcloudsolution.com`
and `gpm.samsungqbe.com` still resolved. YouTube, Netflix and the Samsung store
(`lcprd1.samsungcloudsolution.net`) resolved. Re-run the check: lists change. Tell the
user which domains stay open and that the menu settings above cover ACR either way.

Caveats to state: apps with built-in DNS-over-HTTPS or hard-coded resolvers bypass TV DNS;
YouTube ads are served from the same domains as videos and can't be DNS-blocked; a custom
launcher already removes the ads on Samsung's own home screen.
