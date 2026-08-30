#!/usr/bin/env python3
"""Refresh MOYAMOVA YouTube videos and public playlists without an API key."""
from __future__ import annotations

import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

CHANNELS = {
    "uk": "UCo_Srxy3jqF4PbuxgldLpWA",
    "ru": "UChUFZoc6nnrzqPCsKQx5xmw",
}
VIDEO_LIMIT = 3
PLAYLIST_LIMIT = 30
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "data" / "youtube.json"

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def request_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()


def fetch_videos(channel_id: str) -> list[dict]:
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    root = ET.fromstring(request_bytes(url))
    videos: list[dict] = []
    for entry in root.findall("atom:entry", NS)[:VIDEO_LIMIT]:
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


def extract_initial_data(page: str) -> dict:
    patterns = [
        r"var ytInitialData = ({.*?});</script>",
        r'window\["ytInitialData"\]\s*=\s*({.*?});</script>',
        r"ytInitialData\s*=\s*({.*?});</script>",
    ]
    for pattern in patterns:
        match = re.search(pattern, page, flags=re.S)
        if match:
            return json.loads(match.group(1))
    raise RuntimeError("ytInitialData not found")


def text_value(value: Any) -> str:
    if not isinstance(value, dict):
        return ""
    if isinstance(value.get("simpleText"), str):
        return value["simpleText"].strip()
    runs = value.get("runs")
    if isinstance(runs, list):
        return "".join(str(run.get("text", "")) for run in runs if isinstance(run, dict)).strip()
    return ""


def thumbnail_value(value: Any) -> str:
    if not isinstance(value, dict):
        return ""
    thumbs = value.get("thumbnails")
    if not isinstance(thumbs, list) or not thumbs:
        return ""
    valid = [t for t in thumbs if isinstance(t, dict) and t.get("url")]
    if not valid:
        return ""
    valid.sort(key=lambda t: int(t.get("width") or 0) * int(t.get("height") or 0))
    return html.unescape(str(valid[-1]["url"]))


def parse_count(text: str) -> int | None:
    if not text:
        return None
    digits = re.sub(r"\D+", "", text)
    return int(digits) if digits else None


def walk(value: Any):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk(child)


def fetch_playlists(channel_id: str) -> list[dict]:
    url = f"https://www.youtube.com/channel/{channel_id}/playlists"
    page = request_bytes(url).decode("utf-8", errors="replace")
    data = extract_initial_data(page)

    found: dict[str, dict] = {}
    renderer_keys = ("gridPlaylistRenderer", "playlistRenderer", "lockupViewModel")
    for node in walk(data):
        renderer = None
        renderer_kind = ""
        for key in renderer_keys:
            if isinstance(node.get(key), dict):
                renderer = node[key]
                renderer_kind = key
                break
        if not renderer:
            continue

        playlist_id = str(renderer.get("playlistId") or "").strip()
        title = ""
        thumb = ""
        count = None

        if renderer_kind in ("gridPlaylistRenderer", "playlistRenderer"):
            title = text_value(renderer.get("title"))
            thumb = thumbnail_value(renderer.get("thumbnail"))
            count = parse_count(text_value(renderer.get("videoCountText")))
        else:
            # Newer YouTube lockup model.
            content_id = renderer.get("contentId")
            if isinstance(content_id, str):
                playlist_id = content_id.strip()
            metadata = renderer.get("metadata", {}).get("lockupMetadataViewModel", {})
            title = text_value(metadata.get("title"))
            thumb = thumbnail_value(
                renderer.get("contentImage", {})
                .get("collectionThumbnailViewModel", {})
                .get("primaryThumbnail", {})
                .get("thumbnailViewModel", {})
                .get("image", {})
                .get("sources") and {"thumbnails": renderer["contentImage"]["collectionThumbnailViewModel"]["primaryThumbnail"]["thumbnailViewModel"]["image"]["sources"]}
            )

        if not playlist_id or not title or playlist_id in found:
            continue
        found[playlist_id] = {
            "id": playlist_id,
            "title": title,
            "thumbnail": thumb,
            "videoCount": count,
            "url": f"https://www.youtube.com/playlist?list={playlist_id}",
        }
        if len(found) >= PLAYLIST_LIMIT:
            break

    return list(found.values())


def previous_channel(previous: dict, code: str) -> dict:
    value = previous.get("channels", {}).get(code, {})
    if isinstance(value, list):
        return {"videos": value, "playlists": []}
    if isinstance(value, dict):
        return {
            "videos": value.get("videos", []) if isinstance(value.get("videos"), list) else [],
            "playlists": value.get("playlists", []) if isinstance(value.get("playlists"), list) else [],
        }
    return {"videos": [], "playlists": []}


def main() -> None:
    previous: dict = {}
    if OUTPUT.exists():
        try:
            previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
        except Exception:
            previous = {}

    result = {"updatedAt": datetime.now(timezone.utc).isoformat(), "channels": {}}

    for code, channel_id in CHANNELS.items():
        old = previous_channel(previous, code)
        channel = {"videos": old["videos"], "playlists": old["playlists"]}

        try:
            channel["videos"] = fetch_videos(channel_id)
            print(f"{code}: {len(channel['videos'])} videos")
        except Exception as exc:
            print(f"{code}: video update failed: {exc}")

        try:
            playlists = fetch_playlists(channel_id)
            if playlists:
                channel["playlists"] = playlists
            print(f"{code}: {len(channel['playlists'])} playlists")
        except Exception as exc:
            print(f"{code}: playlist update failed: {exc}")

        result["channels"][code] = channel

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
