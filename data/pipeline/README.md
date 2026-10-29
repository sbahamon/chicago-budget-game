# data/pipeline — public data scripts

Scripts that turn public downloads into `data/public/*.json` (REVAMP §4, §12).
A uv project: run everything with `uv run`.

```bash
cd data/pipeline
uv run pytest              # pipeline tests
uv run some_script.py      # build one data/public/*.json file
```

## Rules for every script

- Save the raw download under `data/raw/public/` and commit it.
- Write output only through `provenance.write_public(...)`. Each `Figure` records
  its link, dataset or PDF page (`locator`), download date and raw file, and the
  file records the script that made it.
- Give the same result every time it runs: no timestamps, no network calls when
  the raw file is already committed.
- Have a test that checks a total against the source document (for example, the
  per-district TIF amounts add up to the city total the Clerk reports).

If a site blocks downloads from the web environment, commit the file to
`data/raw/public/` by hand and point the script at it.

`test/data/provenance.test.ts` (TypeScript) re-checks every `data/public/*.json`
file, and the "no made-up numbers" scan only accepts a figure on screen once it is
registered in one of the three number sources.
