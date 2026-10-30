# Computer setup: macOS, Linux, Windows

Requirements for the Samsung path:

| Tool | Needed for | Version |
|---|---|---|
| AeroTizen CLI | everything | release archive (bundles Python) or Python ≥ 3.10 |
| Node.js + npm | building the redesigned launcher | `^20.19` or `≥ 22.12` |
| git | cloning AeroTizen, applying the patch | any recent |
| .NET 6 SDK | native-Home helpers, only with a pip/git CLI | 6.0, can be installed in a temp folder |
| dig / Resolve-DnsName | DNS check | system tool |

The computer must be on the same LAN as the TV, and its IP must match the TV's Developer
Mode "Host PC IP". Find it: macOS `ipconfig getifaddr en0`; Linux `ip -4 addr`; Windows
`ipconfig`. Suggest a DHCP reservation so it doesn't change.

## macOS

- Homebrew is the easiest source: `brew install node git`.
- **`SSL: CERTIFICATE_VERIFY_FAILED`** from Python (python.org builds ship without root
  certificates): run `/Applications/Python 3.x/Install Certificates.command`, or prefix the
  AeroTizen command with `SSL_CERT_FILE=/etc/ssl/cert.pem`. Don't disable verification.
- The first `aerotizen certs` run may trigger a firewall prompt for the localhost callback.
- If Tizen Studio is also installed, its `sdb` server can hold the TV's only developer slot:
  `~/tizen-studio/tools/sdb kill-server`.

## Linux

- `sudo apt install python3-venv git nodejs npm dnsutils` (Debian/Ubuntu; distro Node may
  be too old: use NodeSource or `nvm` for Node 20+/22+).
- The release archive is x64; on ARM use the pip install.

## Windows

- Use PowerShell. The release CLI is `.\aerotizen.exe`. A venv's CLI is
  `.venv\Scripts\aerotizen.exe`; Python is `py -3`.
- `scripts/build_launcher.sh` is bash: run it from Git Bash or WSL, or do its steps by hand
  (`git clone`, `git checkout <commit>`, `git apply <patch>`, `npm ci`, `npm run build`).
- DNS check: `Resolve-DnsName -Server 94.140.14.14 samsungads.com`.
- Allow the Windows Defender Firewall prompt for Python/AeroTizen on private networks, or
  the TV can't be reached and the sign-in callback fails.

## Keep these, never commit them

- `~/.config/aerotizen/certs/` (signing certificates; needed for every update).
- `~/.config/aerotizen/backups/` (original Home values; needed to restore).
- The saved app lists (they include the TV's identity).
