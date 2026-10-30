---
name: custom-tv
description: Give a smart TV a fast, ad-free custom home screen and clean it up from a computer on the same network, safely and reversibly. Covers Samsung Tizen (2020+, Developer Mode, the AeroTizen launcher with an optional glass "TV layout" redesign, native Home and power-on startup), Android TV / Google TV, Fire TV, LG webOS and Roku, from macOS, Linux or Windows. Also covers removing bloatware, turning off tracking (ACR / viewing information) and blocking TV ads with DNS. Use this whenever the user wants a custom launcher or home screen on their TV, wants to debloat or speed up a TV, mentions Tizen, Developer Mode, sdb, adb on a TV, AeroTizen, TV ads or TV tracking, or wants to restyle a TV launcher they already installed, even if they don't name the skill.
---

# Custom TV home screen and cleanup

The user wants their own TV to boot into a clean home screen, with less junk and less
tracking. You work from their computer over the local network. The TV is a device people
rely on daily and that can't easily be reflashed, so the guiding rule is: **read first,
back up before every write, change one thing at a time, and keep a way back.**

## 0. Ground rules

- Only touch a TV the user owns, on their own network, through the manufacturer's
  developer features. Never use root exploits, firmware patching, or anything that
  bypasses a "can not uninstall" or permission refusal. When the TV refuses, report it
  and give the on-TV route instead.
- Ask before each class of change (install, Home/boot assignment, removing or disabling
  apps, network settings). Approval for one doesn't cover the next.
- Keep personal data out of anything you write to files, commits, screenshots or issues:
  TV IP, Samsung/Google/LG account e-mails, certificate or device IDs (DUID, serial),
  the computer's user name, home-directory paths, and weather location. Use placeholders
  such as `TV_IP` and `~/`.
- Developer connections are single-seat on several TVs (Samsung allows one `sdb` client).
  Close sessions you open (`sdb disconnect`, `sdb kill-server`, stop inspectors) before
  using another tool, or the next one times out.
- Things the user does on the TV (sign-ins, menu settings, unplugging) are theirs. Say
  exactly where the menu is, then wait for them.

## 1. Identify the TV and the computer (read-only)

Ask for, or detect: brand, model number, year, OS (Tizen / Android TV / Google TV /
Fire OS / webOS / Roku OS) and the TV's IP. Then detect the host: `uname -sm` (or
PowerShell `$PSVersionTable` / `systeminfo`), Python and Node versions, and whether the
computer's LAN IP is in the same subnet as the TV.

Then read the platform reference and follow it:

| TV | Reference |
|---|---|
| Samsung (Tizen 5.5+, 2020+) | `references/samsung-tizen.md` |
| Android TV, Google TV, Chromecast, Fire TV | `references/android-fire-tv.md` |
| LG webOS, Roku, others | `references/other-platforms.md` |

Host-specific setup (Python/Node/.NET, the macOS certificate error, Windows paths) is in
`references/host-setup.md`. Read it when a tool is missing or a command fails on the host.

## 2. The usual sequence

1. **Status, read-only.** Confirm developer access works and list installed apps.
   Save the app list locally (outside any repo) so you can compare later.
2. **Back up** anything you will change (Samsung: `aerotizen home backup`; Android:
   the list of disabled packages and the current default launcher).
3. **Install the home screen.** Stock first, check it opens, then customise.
4. **Make it Home and the power-on app** where the platform allows, and verify by
   pressing Home from inside an app (Netflix/YouTube) and by a full power cycle
   (unplug 60 s; a remote power-off is not a cold boot).
5. **Debloat** only after the launcher works. Classify apps (keep / never touch /
   candidate) and remove or disable only what the user picks. Prefer *disable* over
   *uninstall* where both exist, because disable is trivially reversible.
6. **Privacy and ads:** TV menu settings plus DNS blocking — see
   `references/privacy-and-ads.md`.
7. **Report** what changed, what was refused and why, and the exact undo commands.

## 3. Customising the launcher (Samsung / AeroTizen)

The skill ships a tested redesign for AeroTizen: glass themes (Glass, Frost, Crystal,
Classic), accent colours, a TV-style layout (big clock top-left, one row of app banners
along the bottom, the focused app's name under it, inputs one press below the screen),
a halo in the focused app's colour, Home / All apps that switch on focus, and Settings
split into category tabs. Screenshots are in the repository's `docs/screenshots/`.

- Build it with `scripts/build_launcher.sh` (clones AeroTizen at the pinned commit,
  applies `patches/aerotizen-glass-tv-layout.patch`, runs the build and tests). Install
  the result with `aerotizen install <dir>/dist/launcher`. It keeps the app ID
  `DclHome001.Home`, so native Home and boot settings stay valid across updates.
- If the patch no longer applies to a newer AeroTizen, don't force it: build the pinned
  commit, or port the changes using `references/launcher-design.md`, which describes
  every part of the design, why each choice was made, and the pitfalls already hit.
- For a different look, change the design through the same principles. TVs have weak
  GPUs and little RAM: the first version of this design lagged badly until backdrop
  blur, full-screen masks, large shadows and animated wallpapers were removed.
  `references/launcher-design.md` lists the performance rules — follow them.
- Verify changes in a desktop browser at 1920×1080 before installing (the build output
  is a static site; serve `dist/launcher` and drive it with arrow keys). Run the
  project's lint, unit and browser tests; when you change a default or a layout, update
  the tests that pinned the old behaviour and say so.
- To see the real TV, `scripts/tv_screenshots.mjs` captures the running launcher over
  its debug inspector (`aerotizen inspect launcher`). It hides the weather location by
  default; check every image before sharing it.

## 4. What usually goes wrong

Read `references/troubleshooting.md` when something fails. The frequent ones:

- `SSL: CERTIFICATE_VERIFY_FAILED` during `aerotizen certs` on macOS: python.org Python
  without root certificates. Run the command with `SSL_CERT_FILE=/etc/ssl/cert.pem`
  (or run Python's "Install Certificates.command").
- Developer commands time out: another `sdb`/inspector session holds the single slot.
- `can not uninstall app` on Samsung Tizen 6+: the firmware forbids it over the developer
  connection. The user deletes from **Home → Apps → gear → app → Delete**; greyed-out
  Delete means a protected system app.
- Power-on still opens Samsung Home after `home apply --boot`: needs a cold boot
  (unplug 60 s), and **Autorun Samsung TV Plus / Autorun Last App** must be off.
- Native Home needs two small helpers built with the .NET 6 SDK when the CLI came from
  pip/git instead of a release archive; see `references/samsung-tizen.md`.

## 5. Undo

Always hand the user the way back, with the real command for their platform, e.g. on
Samsung: `aerotizen --tv TV_IP home restore --yes`, cold boot, then
`aerotizen --tv TV_IP uninstall launcher`. Restore Home **before** uninstalling a
launcher that Home or startup still points to.
