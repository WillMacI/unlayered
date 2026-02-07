import re
from difflib import SequenceMatcher
from typing import Any, Dict, List, Optional


def parse_lrc(lrc: str) -> List[Dict[str, Any]]:
    lines: List[Dict[str, Any]] = []
    timestamp_pattern = re.compile(r"\[(\d+):(\d+(?:\.\d+)?)\]")
    for raw in lrc.splitlines():
        matches = list(timestamp_pattern.finditer(raw))
        if not matches:
            continue
        text = raw[matches[-1].end():].strip()
        for match in matches:
            minutes = int(match.group(1))
            seconds = float(match.group(2))
            lines.append(
                {
                    "start_time": minutes * 60 + seconds,
                    "line": text,
                }
            )
    return lines


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def flatten_dom(node: Any) -> str:
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    text_parts: List[str] = []
    for child in node.get("children", []):
        text_parts.append(flatten_dom(child))
    return "".join(text_parts)


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().lower()


def build_timed_annotations(
    lrc_text: Optional[str],
    lyrics_text: Optional[str],
    fragment_annotations: List[Dict[str, str]],
) -> List[Dict[str, Any]]:
    timed_annotated_lyrics: List[Dict[str, Any]] = []

    if lrc_text and lrc_text.strip():
        lrc_lines = parse_lrc(lrc_text)
        for i, lrc_line in enumerate(lrc_lines):
            text = lrc_line["line"]
            norm_line = normalize(text)
            matched_annotations: List[str] = []

            for item in fragment_annotations:
                fragment = item.get("fragment", "")
                annotation = item.get("annotation", "")
                if not fragment:
                    continue
                if fragment in norm_line:
                    matched_annotations.append(annotation)
                    continue
                if similarity(fragment, norm_line) >= 0.6:
                    matched_annotations.append(annotation)

            # De-duplicate while preserving order
            seen = set()
            deduped = []
            for ann in matched_annotations:
                if ann in seen:
                    continue
                seen.add(ann)
                deduped.append(ann)

            timed_annotated_lyrics.append(
                {
                    "line": text,
                    "start_time": lrc_line["start_time"],
                    "end_time": lrc_lines[i + 1]["start_time"]
                    if i + 1 < len(lrc_lines)
                    else lrc_line["start_time"] + 3,
                    "annotations": deduped,
                    "annotation": "\n\n".join(deduped),
                }
            )

        return timed_annotated_lyrics

    if lyrics_text:
        lyrics_lines = [line.strip() for line in lyrics_text.splitlines() if line.strip()]
        for text in lyrics_lines:
            norm_line = normalize(text)
            matched_annotations: List[str] = []
            for item in fragment_annotations:
                fragment = item.get("fragment", "")
                annotation = item.get("annotation", "")
                if not fragment:
                    continue
                if fragment in norm_line or similarity(fragment, norm_line) >= 0.6:
                    matched_annotations.append(annotation)

            seen = set()
            deduped = []
            for ann in matched_annotations:
                if ann in seen:
                    continue
                seen.add(ann)
                deduped.append(ann)

            timed_annotated_lyrics.append(
                {
                    "line": text,
                    "start_time": None,
                    "end_time": None,
                    "annotations": deduped,
                    "annotation": "\n\n".join(deduped),
                }
            )

    return timed_annotated_lyrics
