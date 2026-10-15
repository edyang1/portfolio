"""Stamp a fresh ?v= on every CSS, JS and icon-sprite link in the site's pages.

GitHub Pages caches each file for 10 minutes on its own, so after a deploy a browser can
pair a new page with an old stylesheet or script. Versioned URLs keep each page with the
files it was written for. Run this before pushing any change to css/ or js/:

    python tools/bump-assets.py
"""
import pathlib
import re
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERSION = time.strftime("%Y%m%d%H%M")
LINK = re.compile(r'((?:href|src)="[^"]*?(?:css/main\.css|js/[a-z]+\.js|images/icons\.svg))(?:\?v=\w+)?((?:#[^"]*)?")')

changed = 0
for page in sorted([*ROOT.glob("*.html"), *ROOT.glob("*/*.html")]):
    text = page.read_text(encoding="utf-8")
    updated = LINK.sub(lambda m: f"{m.group(1)}?v={VERSION}{m.group(2)}", text)
    if updated != text:
        with page.open("w", encoding="utf-8", newline="\n") as f:
            f.write(updated)
        changed += 1

print(f"{changed} pages now load assets with ?v={VERSION}")
