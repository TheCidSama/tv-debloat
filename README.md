# customTV

An AI-agent skill that turns a smart TV into a fast, ad-free TV with **your own home
screen**, from a computer on the same Wi-Fi. It walks the agent (Claude Code, CCode,
Codex, or any agent that reads `SKILL.md` skills) through it step by step:
read-only checks first, a backup before every change, and an undo for everything.

![Home](docs/screenshots/home.png)

| Focused app with its colour halo | Inputs, one press below |
|---|---|
| ![Focus halo](docs/screenshots/focus-halo.png) | ![Inputs](docs/screenshots/inputs.png) |
| **All apps** | **Settings: themes and accent colours** |
| ![All apps](docs/screenshots/all-apps.png) | ![Settings](docs/screenshots/settings.png) |

Screenshots are from a 2025 Samsung QLED (Tizen 9) running the launcher this skill builds.

## What it does

- **Samsung (2020+, Tizen):** turns on Developer Mode and installs the
  [AeroTizen](https://github.com/helalaou/AeroTizen) launcher, then sets it as the Home
  button and the app the TV opens at power-on. It can also apply this repo's redesign:
  - Glass, Frost, Crystal and Classic themes, and accent colours
  - a big clock, a row of apps along the bottom, and a halo in the focused app's colour
  - inputs one press below the screen, and tabs that switch as soon as you move onto them
  - a layout built to stay smooth on TV hardware
- **Android TV / Google TV / Fire TV:** connects over `adb` and installs a launcher APK.
  Debloating is reversible: it disables apps instead of deleting them, and keeps a list
  of packages it must never touch.
- **LG webOS, Roku and others:** says clearly what isn't possible without rooting (it
  won't root anything) and does the cleanup that is.
- **Bloatware, tracking and ads:** removes the apps the TV allows. It switches off
  tracking (ACR / "Viewing Information") in the TV menus and blocks ads and telemetry
  with DNS. A script checks which domains a DNS server actually blocks.
- **Your computer:** macOS, Linux or Windows.

## Install the skill

Copy `skills/custom-tv` into your agent's skills folder, for example:

```sh
git clone <this repository's URL> customTV
cp -r customTV/skills/custom-tv ~/.claude/skills/      # Claude Code
cp -r customTV/skills/custom-tv ~/.ccode/skills/       # CCode
```

Then ask your agent something like:

> My Samsung TV is at 192.168.1.50, model QE55Q7FAAUXXU. Give it a clean home screen
> that opens at power-on, remove the bloatware and turn off the tracking.

The agent will ask before every change. A few steps happen on the TV (Developer Mode, a
Samsung sign-in for the signing certificate, unplugging the TV once), and it tells you
exactly where to go for each.

## Build the Samsung launcher yourself

```sh
skills/custom-tv/scripts/build_launcher.sh ./work      # needs git and Node 20.19+/22.12+
aerotizen --tv TV_IP install ./work/AeroTizen/dist/launcher
```

The redesign is `skills/custom-tv/patches/aerotizen-glass-tv-layout.patch`, applied to
AeroTizen commit `6457422`. The script applies the patch, builds, and runs AeroTizen's
lint, unit and browser tests. The design and its performance rules are written up in
[`references/launcher-design.md`](skills/custom-tv/references/launcher-design.md).

## Layout

```
skills/custom-tv/
  SKILL.md                      the workflow and safety rules
  references/                   per-platform guides, design spec, privacy, troubleshooting
  scripts/build_launcher.sh     clone, patch, build and test the Samsung launcher
  scripts/tv_screenshots.mjs    capture the launcher on the TV (hides the weather location)
  scripts/check_dns_blocking.sh test which ad/tracking domains a DNS server blocks
  patches/                      the AeroTizen redesign
docs/screenshots/
```

## Safety

- It only uses the manufacturer's own developer features: no root, no exploits, no
  firmware changes. When the TV refuses something (Samsung's `can not uninstall app`),
  the agent stops and tells you how to do it on the TV instead.
- It backs up the TV's Home settings before changing them, and restoring them is one
  command.
- Signing certificates and backups stay on your computer. Keep them, and never commit
  them.
- Use at your own risk: none of this is supported by the TV makers.

## Credits

- [AeroTizen](https://github.com/helalaou/AeroTizen) (MIT) does the Samsung work: the CLI,
  the launcher, native Home and the DNS lists. The patch here is a derivative of it under
  the same license.

## License

MIT. See [LICENSE](LICENSE).
