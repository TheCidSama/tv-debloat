# Samsung Tizen (2020 and later)

Built on [AeroTizen](https://github.com/helalaou/AeroTizen) (MIT): a Python CLI that
speaks Samsung's developer protocol (`sdb`) directly, plus a web-app launcher. No Tizen
Studio is needed. Check AeroTizen's README "Tested on" table for the user's model and
year; 2023–2026 models on Tizen 9 are the best covered. Known model issues are linked
there (for example cold-boot and native-Home issues on some 2020–2022 models).

Read-only here: `status`, `apps`, `home status`, `home apply` without `--yes`, `launch`.
Everything else (`certs`, `install`, `home backup`, `home apply --yes`, `home restore
--yes`, `debloat --remove`, `uninstall`) is a change: back it up and ask first, using the
format in SKILL.md "Asking the user".

Replace `TV_IP` with the TV's address in every command. Examples use `aerotizen`; with a
release archive it is `./aerotizen` (macOS/Linux) or `.\aerotizen.exe` (Windows).

## 1. Install the CLI

Prefer the **CLI release archive** for the user's OS from AeroTizen's Releases page: it
bundles Python and the native-Home helpers. Alternative with Python 3.10+:

```sh
python3 -m venv .venv
.venv/bin/pip install git+https://github.com/helalaou/AeroTizen
```

A git/pip install lacks the native-Home helpers; see §6 to build them.

## 2. Developer Mode (the user does this on the TV)

1. Open **Apps**, type `12345` on the remote (some firmware: **Apps → App Settings**, then
   `12345`). Switch Developer mode **On** and set **Host PC IP** to the computer's LAN IP.
   Check all four numbers; the first field often keeps its old value.
2. Unplug the TV for 60 seconds (a remote power-off doesn't apply it).
3. Check: `aerotizen --tv TV_IP status` shows `developerMode=1` / a Tizen version.

Only the computer whose IP is set can connect. If the computer's IP changes (DHCP),
Developer Mode must be updated.

## 3. Read-only survey

```sh
aerotizen --tv TV_IP status
aerotizen --tv TV_IP apps          # classified list; also saved under ~/.config/aerotizen/
```

`apps` marks likely bloat. On this kind of TV it typically flags SmartThings, User Guide
(`*emanual*`), BixbyPromotion, SecurityCenter. Streaming apps (Netflix, Prime Video,
YouTube, …) are user choices, never "bloat" by default.

## 4. Certificates (the user signs in)

```sh
aerotizen --tv TV_IP certs
```

Opens Samsung's sign-in in the browser and waits on `localhost` for the callback; the
user signs in with their Samsung account and approves the certificate. Certificates are
saved under `~/.config/aerotizen/certs/<id>/`. Tell the user to keep that folder: updates
of the launcher must be signed with the same certificate, and losing it means uninstalling
and reinstalling (which resets launcher settings). Never copy it into a repository.

If it fails with `CERTIFICATE_VERIFY_FAILED` after sign-in, re-run with
`SSL_CERT_FILE=/etc/ssl/cert.pem` on macOS (see `host-setup.md`).

## 5. Install the launcher

Stock: `aerotizen --tv TV_IP install launcher`.

Redesigned (this skill): run `scripts/build_launcher.sh <workdir>`, then
`aerotizen --tv TV_IP install <workdir>/AeroTizen/dist/launcher`. The CLI signs, installs
and verifies (`Installed: DclHome001.Home (version … verified)`). Open it with
`aerotizen --tv TV_IP launch DclHome001.Home`.

Reinstalling over an existing install keeps the launcher's saved settings.

## 6. Home button and power-on

Two modes:

- **Watcher (default after install):** the launcher reopens itself when Samsung Home
  opens. Works from Samsung Home and some apps, but not from YouTube, Prime Video,
  Spotify or HbbTV apps on many models. Good enough to start.
- **Native Home (recommended when it works on the model):** the TV's own Home key and
  startup point at the launcher.

```sh
aerotizen --tv TV_IP home status          # read-only; shows home_appid / startup_appid
aerotizen --tv TV_IP home backup          # saves the ORIGINAL values once; keep the folder
aerotizen --tv TV_IP home apply --boot    # preview only
aerotizen --tv TV_IP home apply --boot --yes
```

If `home status` reports a missing helper (git/pip install), build the two .NET helpers
from an AeroTizen checkout (needs the .NET 6 SDK; it can live in a temporary folder):

```sh
curl -sSL https://dot.net/v1/dotnet-install.sh -o dotnet-install.sh
bash dotnet-install.sh --channel 6.0 --install-dir ./dotnet
DOTNET_ROOT=$PWD/dotnet python3 AeroTizen/tools/build_home_query.py --dotnet ./dotnet/dotnet
DOTNET_ROOT=$PWD/dotnet python3 AeroTizen/tools/build_home_control.py --dotnet ./dotnet/dotnet
pip install --force-reinstall --no-deps ./AeroTizen     # into the same venv as the CLI
```

After apply: the user unplugs the TV for 60 s, then tests (a) Home from inside YouTube and
Netflix, (b) power-on lands on the launcher. Expect up to ~30 s of black at cold boot.
`startup_appid` may still read Samsung's value until that cold boot. If power-on still
opens something else, the user turns off **Settings → General & Privacy → Start Screen
Option → Autorun Samsung TV Plus / Autorun Last App** (names vary by year; 2025 models moved
some under Advanced Features).

Undo: `aerotizen --tv TV_IP home restore --yes`, cold boot.

## 7. Bloatware

```sh
aerotizen --tv TV_IP debloat                      # interactive
aerotizen --tv TV_IP debloat --remove PKGID --yes # after the user picked it
```

On Tizen 6 and newer the firmware usually answers `can not uninstall app` for store and
preinstalled apps. That is a hard refusal: don't look for workarounds. The supported route
is on the TV: **Home → Apps → gear (top right) → select app → Delete**. A greyed-out Delete
(User Guide, TV Plus, Gaming Hub) means it can only be disabled or hidden. Samsung TV Plus:
on Samsung Home highlight it, press Down (or hold OK) → Disable. The launcher already hides
these from its own screens, so the clutter is gone even when the app stays installed.

Never try to remove system services, the TV's input/tuner apps, or Samsung account
components.

## 8. Uninstall everything

```sh
aerotizen --tv TV_IP home restore --yes   # first, while the launcher is still installed
# cold boot, check Samsung Home returns
aerotizen --tv TV_IP uninstall launcher
```

Then the user can switch Developer Mode off (Apps → 12345 → Off, unplug).
