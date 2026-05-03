# Context — Master Index

This folder is the project's persistent memory, organised as a **context
tree** (fractal book metaphor):

```
context/
├── MASTER.md   ← the contents page (you are here)
└── *.md        ← chapter files (one per topic / learning)
```

`MASTER.md` is the table of contents. Every chapter on the shelf gets a
row here with a one-line summary. Each chapter is its own markdown file
that goes deep on a single topic.

---

## How it works

### Reading (recall)
1. Open `MASTER.md` (this file).
2. Scan the chapter table for the topic you need.
3. Open the corresponding chapter file for the full detail.

### Writing (a new learning)
1. Decide which topic the new knowledge belongs to.
2. Either:
   - **Existing topic** → open the chapter file and add to it. Update
     the chapter's one-line summary in `MASTER.md` if it shifted.
   - **New topic** → create a new file `chapter-name.md` in this folder
     AND add a new row to the chapter table below.
3. Keep the table sorted by chapter number; pick the next free number.

### Naming
- Use lowercase-kebab-case for chapter filenames
  (`repo-layout.md`, `agency-vision.md`).
- One topic per chapter. If a chapter grows past ~300 lines or starts
  covering two distinct things, split it into two chapters and add a
  new row.

### Granularity rules of thumb
- A chapter is the right size when one paragraph in `MASTER.md` can't
  capture what's in it.
- If the same fact would be useful from two chapters, prefer to put it
  in the more specific chapter and cross-link from the other with
  `→ see chapter-name.md`.

---

## Chapters

| # | Title | File | One-line summary |
|---|-------|------|------------------|
| — | (empty) | — | First chapter gets added when the next session learns something worth keeping. |

---

## Discipline

- Update this index **before** you finish any task. If a session ends
  without a chapter row, the learning is lost.
- Don't write speculative chapters — only write what's been verified
  in the codebase or confirmed by the user.
- When a chapter goes stale, mark its row with `(stale — superseded by #NN)`
  rather than deleting. The history of decisions matters.
