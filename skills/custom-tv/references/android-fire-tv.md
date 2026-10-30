# Android TV, Google TV, Chromecast and Fire TV

These use `adb`. A tested, MIT-licensed implementation for Android TV / Google TV is
[tv-detox](https://github.com/Ansub/tv-detox) (tiny launcher APK, `install.sh`, `undo.sh`,
`candidates.sh`, and a careful debloat guide). Prefer it over writing a launcher from
scratch, and read its `docs/debloat.md` before disabling anything.

Install `adb`: macOS `brew install android-platform-tools`; Linux
`sudo apt install adb` (or the distro's `android-tools`); Windows: Google's
"SDK Platform-Tools" zip, then use `adb.exe` from that folder.

## 1. Developer access (the user does this on the TV)

- **Android TV:** Settings → Device Preferences → About → select **Build** 7 times. Then
  Developer options → **USB debugging** On (on many TVs this also allows network adb).
- **Google TV / Chromecast with Google TV:** Settings → System → About → select
  **Android TV OS build** 7 times. Then Developer options → **USB debugging**, or
  **Wireless debugging** → Pair device with pairing code.
- **Fire TV:** Settings → My Fire TV → About → select the device name 7 times. Then
  Developer options → **ADB debugging** On.

Connect:

```sh
adb connect TV_IP:5555                 # classic network adb
adb pair TV_IP:PAIR_PORT               # wireless debugging: enter the code from the TV
adb connect TV_IP:PORT                 # the port shown on the Wireless debugging screen
adb devices                            # the TV must say "device", not "unauthorized"
```

The TV shows an "Allow USB debugging?" prompt the first time: the user accepts it.

## 2. Read-only survey

```sh
adb shell getprop ro.product.model; adb shell getprop ro.build.version.release
adb shell pm list packages            # all
adb shell pm list packages -s         # system
adb shell pm list packages -d         # already disabled
adb shell cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.HOME
```

Save the outputs locally before changing anything; the disabled list is the undo record.

## 3. Home screen

- Install a launcher APK: `adb install launcher.apk`.
- The safest way to make it Home **leaves the stock launcher enabled** and catches the Home
  button with the launcher's own accessibility service (tv-detox's approach since v1.4.1).
- Disabling the stock launcher makes the new one the only Home, but it is the step that
  bricks devices: **never disable `com.google.android.apps.tv.launcherx` on Google TV /
  Chromecast** (reported to need a factory reset), and don't disable a launcher before the
  replacement has been opened and works.
- Fire TV: recent Fire OS blocks replacing or disabling `com.amazon.tv.launcher`, and
  Amazon has repeatedly broken Home-button remapping. Install the launcher as an app the
  user opens, tell them that Home will still go to Amazon's screen, and don't try to
  defeat the block.

## 4. Debloat

Prefer disabling (fully reversible) to uninstalling for the user:

```sh
adb shell pm disable-user --user 0 PKG       # undo: adb shell pm enable PKG
adb shell pm uninstall -k --user 0 PKG       # undo: adb shell cmd package install-existing PKG
```

Change one package at a time, test the TV still works (Home, inputs, Wi-Fi, remote), then
continue. **Never disable:** Google Play services (`com.google.android.gms`), Play Store,
Settings, System UI, setup apps, the keyboard, Bluetooth, the TV input / tuner framework
and HDMI services. Brand traps: TCL `com.tcl.tv` (HDMI breaks), MediaTek
`com.mediatek.*`, OnePlus `com.heytap.tv.livetv`. Disabling the app that saved the Wi-Fi
network (often a setup app) can make the TV forget Wi-Fi.

## 5. Speed

```sh
adb shell settings put global window_animation_scale 0.5
adb shell settings put global transition_animation_scale 0.5
adb shell settings put global animator_duration_scale 0.5
```

Keep the screensaver on for OLED panels (burn-in).

## 6. Recovery (boot loop / stuck at logo)

```sh
adb connect TV_IP:5555
adb wait-for-device
for p in $(adb shell pm list packages -d | tr -d '\r' | sed 's/package://'); do adb shell pm enable "$p"; done
```

Afterwards the user turns USB / wireless debugging **off**: otherwise other devices on
the network can ask for control.
