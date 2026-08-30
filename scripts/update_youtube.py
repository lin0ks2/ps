#!/usr/bin/env python3
"""Refresh latest MOYAMOVA YouTube videos from YouTube's public Atom feeds."""
from __future__ import annotations

import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

CHANNELS = {
    "uk": "UCo_Srxy3jqF4PbuxgldLpWA",
    "ru": "UChUFZoc6nnrzqPCsKQx5xmw",
}
LIMIT = 3
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "data" / "youtube.json"

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}


def fetch_channel(channel_id: str) -> list[dict]:
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    request = urllib.request.Request(url, headers={"User-Agent": "MOYAMOVA-Landing/1.0"})
    with urllib.request.urlopen(request, timeout=25) as response:
        root = ET.fromstring(response.read())

    videos = []
    for entry in root.findall("atom:entry", NS)[:LIMIT]:
        video_id = (entry.findtext("yt:videoId", default="", namespaces=NS) or "").strip()
        if not video_id:
            continue
        title = (entry.findtext("atom:title", default="MOYAMOVA", namespaces=NS) or "MOYAMOVA").strip()
        published = (entry.findtext("atom:published", default="", namespaces=NS) or "").strip()
        thumbnail = entry.find("media:group/media:thumbnail", NS)
        thumb_url = thumbnail.get("url") if thumbnail is not None else f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        videos.append({
            "id": video_id,
            "title": title,
            "published": published,
            "thumbnail": thumb_url,
        })
    return videos


def main() -> None:
    previous = {}
    if OUTPUT.exists():
        try:
            previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
        except Exception:
            previous = {}

    result = {"updatedAt": datetime.now(timezone.utc).isoformat(), "channels": {}}
    for code, channel_id in CHANNELS.items():
        try:
            result["channels"][code] = fetch_channel(channel_id)
            print(f"{code}: {len(result['channels'][code])} videos")
        except Exception as exc:
            # Do not wipe working data when YouTube has a temporary outage.
            result["channels"][code] = previous.get("channels", {}).get(code, [])
            print(f"{code}: update failed: {exc}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
