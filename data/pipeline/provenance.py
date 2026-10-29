"""Write data/public/*.json with the provenance every public number must carry (REVAMP §4).

Every figure records its link, the dataset or PDF page it was read from, the date the
raw file was downloaded, and where that raw file is kept (under data/raw/public/).
Each output file names the data/pipeline/*.py script that made it. Output is
deterministic (no timestamps, fixed key order) so re-running a script on the same
raw files gives a byte-identical file. test/data/provenance.test.ts checks the same rules.
"""

from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_PUBLIC = REPO_ROOT / "data" / "public"
RAW_PUBLIC = "data/raw/public/"
UNITS = {"USD", "percent", "share", "count", "any"}


@dataclass(frozen=True)
class Figure:
    id: str
    label: str
    value: float
    unit: str
    url: str
    locator: str
    downloaded: str
    raw_file: str

    def __post_init__(self) -> None:
        if not self.id.strip():
            raise ValueError("figure id is missing")
        if not self.label.strip():
            raise ValueError(f"{self.id}: label is missing")
        if not isinstance(self.value, (int, float)) or not math.isfinite(self.value):
            raise ValueError(f"{self.id}: value must be a finite number")
        if self.unit not in UNITS:
            raise ValueError(f"{self.id}: unit must be one of {sorted(UNITS)}")
        if not re.match(r"^https?://\S+$", self.url):
            raise ValueError(f"{self.id}: url must be an http(s) link")
        if not self.locator.strip():
            raise ValueError(f"{self.id}: locator (dataset or PDF page) is missing")
        try:
            date.fromisoformat(self.downloaded)
        except ValueError:
            raise ValueError(f"{self.id}: downloaded must be a YYYY-MM-DD date") from None
        if not self.raw_file.startswith(RAW_PUBLIC):
            raise ValueError(f"{self.id}: raw_file must be kept under {RAW_PUBLIC}")

    def to_json(self) -> dict:
        return {
            "id": self.id,
            "label": self.label,
            "value": self.value,
            "unit": self.unit,
            "source": {
                "url": self.url,
                "locator": self.locator,
                "downloaded": self.downloaded,
                "raw_file": self.raw_file,
            },
        }


def write_public(dataset: str, script: str, figures: list[Figure], out_dir: Path = DATA_PUBLIC) -> Path:
    """Write <out_dir>/<dataset>.json and return its path."""
    if not re.match(r"^data/pipeline/[\w/-]+\.py$", script):
        raise ValueError("script must be a data/pipeline/*.py path")
    ids = [f.id for f in figures]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        raise ValueError(f"duplicate figure ids: {dupes}")
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{dataset}.json"
    body = {"dataset": dataset, "script": script, "figures": [f.to_json() for f in figures]}
    path.write_text(json.dumps(body, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path
