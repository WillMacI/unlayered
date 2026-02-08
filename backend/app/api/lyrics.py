from typing import Any, Dict, List, Optional

import requests
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

import lyricsgenius

from app.config import settings
from app.utils.lyrics import flatten_dom, normalize, build_timed_annotations

import logging


router = APIRouter(prefix="/api/lyrics", tags=["lyrics"])
logger = logging.getLogger(__name__)


class SearchResult(BaseModel):
    id: int
    title: str
    artist: str
    album_name: Optional[str] = None
    song_art_image_url: Optional[str] = None
    header_image_url: Optional[str] = None


def _get_genius_headers() -> Dict[str, str]:
    if not settings.genius_token:
        raise HTTPException(status_code=500, detail="GENIUS_TOKEN is not configured")
    return {"Authorization": f"Bearer {settings.genius_token}"}


@router.get("/search", response_model=List[SearchResult])
def search_songs(q: str = Query(..., min_length=1, max_length=200)):
    headers = _get_genius_headers()
    try:
        r = requests.get(
            "https://api.genius.com/search",
            headers=headers,
            params={"q": q},
            timeout=15,
        )
        r.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Genius search failed: {exc}")

    hits = r.json().get("response", {}).get("hits", [])[:5]
    results: List[SearchResult] = []
    for hit in hits:
        result = hit.get("result", {})
        primary_artist = result.get("primary_artist", {}) or {}
        album = result.get("album") or {}
        results.append(
            SearchResult(
                id=result.get("id"),
                title=result.get("title"),
                artist=primary_artist.get("name"),
                album_name=album.get("name"),
                song_art_image_url=result.get("song_art_image_url"),
                header_image_url=result.get("header_image_url"),
            )
        )
    return results


@router.get("/song/{song_id}")
def resolve_song(song_id: int) -> Dict[str, Any]:
    headers = _get_genius_headers()

    try:
        r = requests.get(
            f"https://api.genius.com/songs/{song_id}",
            headers=headers,
            timeout=15,
        )
        r.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Genius song fetch failed: {exc}")

    song = r.json().get("response", {}).get("song")
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    mapped_song: Dict[str, Any] = {
        "annotation_count": song.get("annotation_count"),
        "title": song.get("title"),
        "id": song.get("id"),
        "album_name": (song.get("album") or {}).get("name"),
        "artists": [artist.get("name") for artist in song.get("primary_artists", [])],
        "artist_id": (song.get("primary_artist") or {}).get("id"),
        "album_thumbnail": song.get("header_image_url"),
        "primary_colour": song.get("song_art_primary_color"),
        "secondary_colour": song.get("song_art_secondary_color"),
        "song_art_image_url": song.get("song_art_image_url"),
    }

    description_dom = (song.get("description") or {}).get("dom")
    if description_dom:
        bio_text = flatten_dom(description_dom)
        bio_text = bio_text.replace("\\n", " ").replace("\\u00a0", " ")
        bio_text = " ".join(bio_text.split())
    else:
        bio_text = ""
    mapped_song["bio"] = bio_text

    # Lyrics via lyricsgenius (scrapes Genius page)
    genius = lyricsgenius.Genius(settings.genius_token)
    genius.remove_section_headers = False
    
    # Set User-Agent to avoid 403 Forbidden
    genius._session.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'

    lyrics_text: Optional[str] = None
    try:
        song_url = song.get("url")
        logger.info(f"Fetching lyrics from Genius URL: {song_url}")
        if song_url:
            # Must use keyword argument for song_url to avoid it being interpreted as song_id
            lyrics_text = genius.lyrics(song_url=song_url)
            logger.info(f"Fetched lyrics length: {len(lyrics_text) if lyrics_text else 'None'}")
            if lyrics_text:
                logger.info(f"First 100 chars: {lyrics_text[:100]}")
    except Exception as e:
        logger.error(f"Failed to fetch lyrics from Genius: {e}")
        lyrics_text = None

    mapped_song["lyrics"] = lyrics_text

    # Artist image
    artist_image_url: Optional[str] = None
    artist_id = mapped_song.get("artist_id")
    if artist_id:
        try:
            artist_resp = requests.get(
                f"https://api.genius.com/artists/{artist_id}",
                headers=headers,
                timeout=15,
            )
            artist_resp.raise_for_status()
            artist = artist_resp.json().get("response", {}).get("artist", {}) or {}
            artist_image_url = artist.get("image_url")
        except requests.RequestException:
            artist_image_url = None
    mapped_song["artist_image_url"] = artist_image_url

    # Annotations
    fragment_annotations: List[Dict[str, str]] = []
    try:
        ref_resp = requests.get(
            "https://api.genius.com/referents",
            headers=headers,
            params={"song_id": mapped_song["id"], "per_page": 50},
            timeout=15,
        )
        ref_resp.raise_for_status()
        referents = ref_resp.json().get("response", {}).get("referents", [])
        for ref in referents:
            fragment = ref.get("fragment")
            for ann in ref.get("annotations", []):
                if ann.get("votes_total", 0) < 3:
                    continue
                dom = (ann.get("body") or {}).get("dom")
                if not dom:
                    continue
                annotation_text = flatten_dom(dom).strip()
                if annotation_text:
                    fragment_annotations.append(
                        {
                            "fragment": normalize(fragment or ""),
                            "annotation": annotation_text,
                        }
                    )
    except requests.RequestException:
        fragment_annotations = []

    # LRC via lrclib
    lrc_text: Optional[str] = None
    try:
        query_terms = " ".join([mapped_song.get("title") or "", mapped_song["artists"][0] if mapped_song["artists"] else ""]).strip()
        lrc_resp = requests.get(
            "https://lrclib.net/api/search",
            params={"q": query_terms or mapped_song.get("title")},
            timeout=15,
        )
        lrc_resp.raise_for_status()
        lrc_data = lrc_resp.json()
        if lrc_data:
            lrc_text = lrc_data[0].get("syncedLyrics")
    except requests.RequestException:
        lrc_text = None

    timed_annotated_lyrics = build_timed_annotations(lrc_text, lyrics_text, fragment_annotations)

    try:
        lrc_len = len(lrc_text.splitlines()) if lrc_text else 0
    except Exception:
        lrc_len = 0
    logger.info(
        "[lyrics] song_id=%s lrc_lines=%s lyrics_text=%s fragments=%s timed=%s",
        mapped_song.get("id"),
        lrc_len,
        "yes" if lyrics_text else "no",
        len(fragment_annotations),
        len(timed_annotated_lyrics),
    )

    return {
        "song": mapped_song,
        "lyrics": lyrics_text,
        "lrc": lrc_text,
        "timed_lyrics": timed_annotated_lyrics,
    }
