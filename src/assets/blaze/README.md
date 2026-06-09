# Blaze Asset Notes

Blaze is derived from Austin Humphrey's existing Codex pet package:

- Source package: `/Users/AustinHumphrey/.codex/pets/blaze/`
- Source file: `spritesheet.webp`
- Source metadata: `pet.json`

The files in this folder are the source reference copy and metadata, plus a code manifest that maps animation states to sheet rows and columns. The source sheet is 1536 by 1872 with 8 columns and 9 rows. Each frame cell is 192 by 208.

The web app ships the compact `blaze-*.webp` pose strips in this folder instead of bundling the full source sheet. Do not replace these with stock art, a generated mascot, or a new dog concept. If a pose needs repair, repair the source pet pose first, then re-derive only the affected app strip.

The baseball, helmet, collar tag, dirt base, route props, rail, paw prints, and simple seam marks are product UI graphics, not part of the Blaze likeness source. They are code-native overlays so the pet likeness can stay faithful while the app styling remains editable.
