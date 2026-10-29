"""provenance.py writes data/public/*.json in the shape test/data/provenance.test.ts checks."""

import json

import pytest

from provenance import Figure, write_public

GOOD = dict(
    id="city_total",
    label="Fixture total",
    value=123450000,
    unit="USD",
    url="https://example.org/budget.pdf",
    locator="p. 12",
    downloaded="2026-10-29",
    raw_file="data/raw/public/budget.pdf",
)


def test_writes_the_public_envelope(tmp_path):
    path = write_public("fixture", "data/pipeline/fixture.py", [Figure(**GOOD)], out_dir=tmp_path)
    data = json.loads(path.read_text())
    assert path.name == "fixture.json"
    assert data == {
        "dataset": "fixture",
        "script": "data/pipeline/fixture.py",
        "figures": [
            {
                "id": "city_total",
                "label": "Fixture total",
                "value": 123450000,
                "unit": "USD",
                "source": {
                    "url": "https://example.org/budget.pdf",
                    "locator": "p. 12",
                    "downloaded": "2026-10-29",
                    "raw_file": "data/raw/public/budget.pdf",
                },
            }
        ],
    }


def test_same_input_gives_byte_identical_output(tmp_path):
    a = write_public("fixture", "data/pipeline/fixture.py", [Figure(**GOOD)], out_dir=tmp_path / "a")
    b = write_public("fixture", "data/pipeline/fixture.py", [Figure(**GOOD)], out_dir=tmp_path / "b")
    assert a.read_bytes() == b.read_bytes()


@pytest.mark.parametrize(
    "field, bad, message",
    [
        ("downloaded", "Oct 29", "downloaded"),
        ("url", "", "url"),
        ("locator", "", "locator"),
        ("raw_file", "Downloads/budget.pdf", "raw_file"),
        ("unit", "dollars", "unit"),
        ("value", float("nan"), "value"),
    ],
)
def test_rejects_a_figure_missing_its_provenance(field, bad, message):
    with pytest.raises(ValueError, match=message):
        Figure(**{**GOOD, field: bad})


def test_rejects_a_script_outside_the_pipeline(tmp_path):
    with pytest.raises(ValueError, match="script"):
        write_public("fixture", "scripts/elsewhere.py", [Figure(**GOOD)], out_dir=tmp_path)


def test_rejects_duplicate_figure_ids(tmp_path):
    with pytest.raises(ValueError, match="duplicate"):
        write_public("fixture", "data/pipeline/fixture.py", [Figure(**GOOD), Figure(**GOOD)], out_dir=tmp_path)
