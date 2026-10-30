# Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `status`/`apps` time out, but ping works | Another developer session holds the single slot (Tizen Studio `sdb`, an old inspector, a second CLI) | `sdb disconnect TV_IP:26101`, `sdb kill-server`, stop inspector processes; retry |
| `status` can't connect at all | Developer Mode off, wrong Host PC IP, TV not cold-booted since enabling, or different subnet | Re-check Apps → 12345; unplug 60 s; compare IPs |
| `CERTIFICATE_VERIFY_FAILED` after Samsung sign-in | Python without root CAs (macOS python.org) | `SSL_CERT_FILE=/etc/ssl/cert.pem aerotizen … certs --force` |
| `certs` waits forever | Sign-in not finished, or the browser didn't open | User completes sign-in; re-run with `--force`; allow firewall prompt |
| Install fails with a signature/author error | Different certificate than the installed launcher | Use the original cert folder; otherwise restore Home, uninstall, reinstall (loses launcher settings) |
| `can not uninstall app` | Tizen 6+ firmware policy | User deletes on the TV (Apps → gear → Delete); greyed out = protected |
| Home from YouTube/Prime/Spotify doesn't return | Watcher mode limits | Native Home (`home apply`); build helpers if missing |
| Power-on opens Samsung Home / TV Plus / last app | No cold boot yet, or Autorun settings on | Unplug 60 s; Autorun Samsung TV Plus / Last App off; check `home status` |
| `home apply` refuses | Backup missing or values differ from the original | `home backup` first; read the message, don't force; see AeroTizen `docs/home-pc-flow.md` |
| Launcher lags | Animated wallpaper, blur, masks, big shadows | Follow `launcher-design.md` performance rules; still wallpaper |
| Wide app cards show dark bars | Square store artwork in a wide card | Banner/logo for wide cards (in the patch) |
| `aerotizen inspect` times out | Native Home reopened the launcher between stop and debug launch | Retry once; it usually connects on the second attempt |
| Patch doesn't apply on newer AeroTizen | Upstream moved | Build the pinned commit, or port by hand using `launcher-design.md` |

When reporting a problem upstream, include CLI version/commit, TV model, firmware and
the failing command's output, with IPs, device IDs and paths removed.
