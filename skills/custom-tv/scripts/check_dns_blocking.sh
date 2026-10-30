#!/usr/bin/env bash
# Resolve each domain of a blocklist through a DNS server and report blocked vs resolved.
# Read-only. Usage: check_dns_blocking.sh <dns-server-ip> <list-file> [extra-domain ...]
# The list is one domain per line; '#' comments are ignored (AeroTizen dns/*.txt format).
set -euo pipefail
SERVER="${1:?usage: check_dns_blocking.sh <dns-server-ip> <list-file> [domain ...]}"
LIST="${2:?list file required}"; shift 2
command -v dig >/dev/null || { echo "dig is required (macOS built-in; Linux: dnsutils/bind-utils)"; exit 1; }

check() {
  local answer
  answer="$(dig +short +time=3 +tries=1 @"$SERVER" "$1" A | tail -1)"
  case "$answer" in
    ""|0.0.0.0|127.0.0.1|::) printf 'BLOCKED   %s\n' "$1" ;;
    *) printf 'resolves  %s -> %s\n' "$1" "$answer" ;;
  esac
}

grep -v '^\s*#' "$LIST" | grep -v '^\s*$' | while read -r domain; do check "$domain"; done
# Services that must keep working (pass more as extra arguments).
for domain in www.youtube.com www.netflix.com lcprd1.samsungcloudsolution.net "$@"; do check "$domain"; done
