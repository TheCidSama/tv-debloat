# LG webOS, Roku and other TVs

Be upfront: on these platforms a third-party app **cannot replace the system home screen**
without rooting, and rooting (webOS exploits, custom firmware) is out of scope for this
skill. What you can still do: install a clean launcher-style app the user opens, tidy the
built-in home, and do the privacy and DNS work in `privacy-and-ads.md`.

## LG webOS

Developer access:

1. The user installs **Developer Mode** from the LG Content Store, signs in with an LG
   developer account (free, created at webostv.developer.lge.com), and turns on
   **Dev Mode Status** and **Key Server**. The TV restarts. The dev session has an expiry
   timer shown in the app; the user extends it there or apps installed this way stop.
2. On the computer (Node.js required):

```sh
npm install -g @webos-tools/cli
ares-setup-device            # add: name tv, IP TV_IP, port 9922, user prisoner
ares-novacom --device tv --getkey   # enter the passphrase shown in the Developer Mode app
ares-device --device tv --system-info
```

3. A web app (HTML/JS, `appinfo.json`) is packaged and installed with
   `ares-package <dir>`, `ares-install --device tv <file>.ipk`, `ares-launch --device tv <id>`.
   The Home key still opens LG's launcher. The glass design in `launcher-design.md` can be
   reused as a web app, but AeroTizen's Tizen APIs (app list, inputs) must be replaced
   with webOS Luna service calls; treat that as a new project and say so.

Cleanup on the TV: store apps are deleted from the launcher bar (hold OK → Delete or the
edit pencil). Preinstalled apps usually can't be removed; hide them from the bar.

## Roku

- Developer mode: on the remote press Home ×3, Up ×2, Right, Left, Right, Left, Right; set a
  password; the TV restarts. One sideloaded "dev channel" (BrightScript, zip upload at
  `http://TV_IP`) is allowed. It cannot replace the Roku home screen.
- Useful instead: Settings → Home screen (hide Movie/TV store, choose what shows),
  Settings → Privacy (below).

## Others (Vizio, Hisense VIDAA, Panasonic, Philips non-Android, Sony pre-Android)

No supported developer route for launchers. Do the menu privacy settings (look for
"Viewing Data", "Smart Interactivity", "ACR", "Content Recommendations",
"Interest-based Ads") and DNS blocking only. Philips and Sony Android/Google TV models:
use `android-fire-tv.md`.

## When the platform is unknown

Ask for the model number and look up the OS before suggesting anything. Don't guess
menu paths: give the menu area ("Privacy" / "Terms & Policies" / "Support") and ask the
user to read the options aloud if needed.
