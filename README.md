# Honor the Skeptic: class website

Live at **https://honortheskeptic.stlctrufant.com**. This is the companion site for the *Doubters Welcome* class at St. Thomas Lutheran Church, Trufant.

Each lesson is written once, in a simple text file. The website page, the PDF handout and the Word handout are all generated from that file, so they always match.

## Folders

| Folder | What it is |
|---|---|
| `content/site.yml` | Class-wide settings: name, meeting times, church info, "About" text |
| `content/lessons/week-N.yml` | One file per lesson (the only thing you edit week to week) |
| `public/` | The finished website. **Cloudflare Pages serves this folder.** Don't hand-edit the pages inside it; they are rebuilt. |
| `public/files/` | Extra files you want people to download (put them here, then list them under `downloads:`) |
| `preview/` | Private preview that includes drafts. Never uploaded (listed in `.gitignore`). |
| `tools/` | The build script and page templates |

## Lesson status

Every lesson file has `status:`

- `planned`: shows on the home page as "Coming Wednesday, October 21" (title and subtitle only)
- `draft`: visible only in `preview/`, never on the live site
- `published`: on the live site with its handouts

## Weekly publishing (Wednesday afternoon, before 7:00)

1. Set the lesson's `status: published` (and its `date:`).
2. Rebuild: `python3 tools/build.py` (Claude does this for you).
3. In GitHub Desktop: **Commit to main**, then **Push origin**.
4. Cloudflare Pages deploys automatically in about a minute. Check the site.

## Lesson file format

```yaml
week: 1
title: "Who They Are"
subtitle: "One line under the title"
date: 2026-10-14          # the Wednesday class date
status: draft             # planned | draft | published
summary: "Used for link previews"
big_idea: "One or two sentences. Shown in a highlighted box."
handout_notes_lines: 3    # blank Notes lines at the end of the handout (optional)
downloads:                # optional extra files, stored in public/files/
  - label: "Discussion guide"
    file: files/week-1/guide.pdf

sections:                 # shown in this order; each becomes one "slide" in Present mode
  - type: question        # one big question
    kicker: "Opening"     # small red label (optional, any section)
    heading: "Someone you know"
    text: "The question itself"
    note_lines: 2         # writing lines on the handout (optional)

  - type: clip            # YouTube clip; plays in a large pop-up, starting and stopping at the right times
    heading: "This isn't a game"
    title: "Video title"
    channel: "Channel name"
    speaker: "Who's talking"
    year: 2023
    youtube: skuBFLns8WA  # the ID from the YouTube URL
    start: "1:54"
    end: "3:04"
    setup: "What's happening just before the clip."
    listen_for: ["Thing to notice", "Another thing"]
    ties_to: ["James 3:1", "2 Timothy 2:24-25"]

  - type: scripture       # list of passages; each reference links to BibleGateway
    heading: "Made in God's image"
    body: "Optional intro paragraph"
    passages:
      - ref: "Genesis 1:26–27"
        note: "One-line summary"
        text: "Optional: paste the verse text to show it in full"

  - type: questions       # numbered discussion questions (click one in class to spotlight it)
    heading: "Talk it over"
    items: ["Question one", "Question two"]
    note_lines: 0

  - type: quote
    text: "The quotation"
    source: "Who said it, where"

  - type: text            # ordinary paragraphs (Markdown: *italic*, **bold**, [link](url))
    heading: "One guardrail"
    body: |
      Paragraph text.

  - type: activity
    heading: "Practice"
    body: "Optional intro"
    steps: ["Step one", "Step two"]

  - type: image
    src: files/week-1/chart.png
    alt: "Description"
    caption: "Optional caption"
```

Add `handout: false` to any section to keep it off the handout (website only).

Hebrew or Greek: wrap it as `<span lang="he">...</span>` or `<span lang="grc">...</span>`. Hebrew displays large so the vowel points are readable.

## In class

- **Present** button (or press `P`): full-screen, one section at a time. Arrow keys, Space, Page Up/Down and presentation clickers move between sections. `V` plays the clip on the current slide. `Esc` exits.
- **AA** button (or `+` / `-`): bigger text for the back row.
- Moon button: light or dark display.
- Click a discussion question to spotlight it.

## One-time setup (already done unless noted)

1. GitHub repo `aaroncfrey/HonorTheSkeptic` (published from this folder with GitHub Desktop).
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → `HonorTheSkeptic`.
   Framework preset: **None**. Build command: *(leave empty)*. Build output directory: **public**.
3. Pages project → Custom domains → `honortheskeptic.stlctrufant.com`. (stlctrufant.com's DNS is already on this Cloudflare account, so the record is added automatically.)

## Building (for Claude)

Requires Python 3 with PyYAML, Jinja2, Markdown, segno, python-docx, and Playwright + Chromium for PDFs.

```
python3 tools/build.py              # live site into public/ (published lessons + handouts)
python3 tools/build.py --preview    # includes drafts, into preview/
python3 tools/build.py --no-handouts
```
