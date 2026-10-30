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
- Nothing changes on the TV or the network without the user's explicit yes, given for
  that change (see "Asking the user" below). Read-only commands need no approval.
- Nothing changes without a backup you have checked exists (see "Backups" below).
- Keep personal data out of anything you write to files, commits, screenshots or issues:
  TV IP, Samsung/Google/LG account e-mails, certificate or device IDs (DUID, serial),
  the computer's user name, home-directory paths, and weather location. Use placeholders
  such as `TV_IP` and `~/`.
- Developer connections are single-seat on several TVs (Samsung allows one `sdb` client).
  Close sessions you open (`sdb disconnect`, `sdb kill-server`, stop inspectors) before
  using another tool, or the next one times out.
- Things the user does on the TV (sign-ins, menu settings, unplugging) are theirs. Say
  exactly where the menu is, then wait for them.

## Before anything else: the risk talk

Before the first change of the session (read-only checks may come first), tell the user
in plain words, then ask whether they want to go ahead:

- This uses developer features the TV maker doesn't support. It can turn off or remove
  apps and change what the TV opens at Home and at power-on.
- A few TVs have got stuck at the logo or kept restarting after changes like these.
- You are an AI and can make mistakes, which is why you ask before every change and keep
  backups and an undo list.
- How to undo, for their platform, in one or two lines (e.g. `aerotizen home restore` and
  re-enabling apps on the TV; `pm enable` for every disabled package on Android).
- They are responsible for their own TV.

Start only after a clear yes. If they hesitate, offer the read-only survey and the menu
privacy settings, which change nothing risky.

## Asking the user

A TV is shared, used daily and hard to recover, and the agent can be wrong about which
package is which. So the user approves every write, knowing what it does.

Before each change, stop and ask in this shape, then wait for the answer:

```
Next change: <what, in plain words>
Command: <the exact command>
Risk: <what could go wrong; "low" only if it really is>
Backup: <where the backup is, or why none is needed>
Undo: <the exact command or menu path that reverses it>
Go ahead? (yes / no / skip)
```

- One change per question. Batch only identical, low-risk actions the user has listed
  themselves (e.g. "disable these 5 packages"), and still show the full list first.
- Approval covers that change only. A new install, a Home/boot assignment, each app
  removal or disable, DNS or network settings, and every launcher reinstall are separate.
- Silence, "ok" to an explanation, or a goal statement ("remove the bloatware") is not
  approval for a specific command; turn it into a list and ask.
- Never guess which apps are bloat. List every app in plain words, in three groups:
  **needed by the TV** (never touch), **apps you use** (the user's, keep unless told), and
  **safe to turn off** (candidates, with one line on what each does). Let the user pick;
  streaming apps are always the user's choice. If you're not sure what a package does,
  it goes in "needed by the TV" and stays on.
- If a result surprises you (an app you didn't expect, a refusal, a warning about
  backups or compatibility), stop and tell the user before doing anything else.
- Ask before installing anything on the computer outside the working folder (SDKs,
  global npm packages, Homebrew formulas).
- Steps only the user can do (sign-ins, Developer Mode, TV menus, unplugging): give the
  exact menu path, then wait for them to say it's done; check the result read-only.

## Backups

Take the backup, confirm it exists and is readable, tell the user where it is, and only
then make the change.

| Before | Back up | How to confirm |
|---|---|---|
| Any change | App list and device status | `aerotizen … apps` / `adb shell pm list packages` saved to a dated file |
| Samsung Home / boot assignment | Original Home values | `aerotizen … home backup`, then `home status` shows the backup path |
| Samsung launcher reinstall | The cert folder `~/.config/aerotizen/certs/` | Folder exists; same cert used for install |
| Android disable / uninstall | `pm list packages -d` and the current Home activity | Saved to a dated file before the first change |
| Launcher code changes | The working tree (git) | Commit or copy before editing; the build output is separate |
| TV DNS change | The current DNS values | User reads them out or screenshots the IP Settings screen |

- Keep backups outside any repository, and never delete or overwrite one: AeroTizen keeps
  the *original* Home values on purpose. New backups go next to old ones with a date.
- Tell the user to keep the certificate and backup folders; say what is lost without them.
- If a backup step fails or refuses, don't proceed with the change.

### The change log

Keep a running log for the session in a dated file outside any repository (e.g.
`~/customtv/changes-YYYY-MM-DD.md`). Add a line right after each change succeeds:

```
| time | change | command | result | undo |
```

Record refusals and skipped steps too. Show the log at the end; it is the user's undo
list if anything goes wrong later, so tell them where it is.

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
   Save the app list locally (outside any repo) so you can compare later. Note free
   memory where the platform shows it (Android: `adb shell cat /proc/meminfo`, MemAvailable);
   Samsung's developer shell doesn't expose it, so skip it there and say so.
   Ask whether the panel is OLED if the model name doesn't make it obvious.
2. **The risk talk**, then a yes (see above).
3. **Back up** anything you will change, and confirm it (see "Backups").
4. **Install the home screen** (ask first). Stock first, check it opens, then customise.
5. **Make it Home and the power-on app** (ask first) where the platform allows, and verify by
   pressing Home from inside an app (Netflix/YouTube) and by a full power cycle
   (unplug 60 s; a remote power-off is not a cold boot).
6. **Debloat** only after the launcher works. Classify apps (keep / never touch /
   candidate) and remove or disable only what the user picks, one confirmed change at a
   time. Prefer *disable* over *uninstall* where both exist, because disable is trivially
   reversible. Check the TV still works (Home, inputs, Wi-Fi, remote) after each.
7. **Privacy and ads:** TV menu settings plus DNS blocking — see
   `references/privacy-and-ads.md`.
8. **Optional speed and power settings** (ask first): shorter animations on Android/Fire TV,
   an auto-sleep timer the user picks. On OLED panels keep the screensaver on; never
   turn it off unless the user says the panel isn't OLED.
9. **Prove it before saying done.** About 30 seconds after the last change, restart the TV
   once (Android: `adb reboot`, with a yes; Samsung: the user unplugs it for 60 s). Check
   it starts normally, lands on the new home screen, and Home, inputs, Wi-Fi and the remote
   work. Show free memory before and after where available. If it doesn't start
   normally, go straight to the undo steps in the change log.
10. **Report** what changed, what was refused and why, where the backups and change log
    are, and the exact undo commands. Then remind the user to turn off USB / network /
    wireless debugging on Android and Fire TV (left on, other devices on the network can
    ask to control the TV; turn it on again only to undo or update), and to keep the
    certificate and backup folders on Samsung.

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
