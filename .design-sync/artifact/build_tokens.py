"""Build tokens.json twice: B (the clean-up pass: every carried name and value kept,
usage notes and collision-free type styles added) and D (the re-sync to the site's
code at main@4098cbd: measured values, retired junk themes, motion and radius
additions, every font face the site loads, provenance meta)."""
import copy, json, pathlib, re, sys
from usage import COLOR, OTHER_FAMILIES

carried = json.load(open(sys.argv[1]))
resolved = json.load(open('resolved.json'))['default']
out_b, out_d = sys.argv[2], sys.argv[3]

def note(name):
    n = COLOR.get(name) or OTHER_FAMILIES.get(name)
    if not n:
        raise SystemExit(f'no usage note for {name}')
    return n

# ---- type styles: named apart from every class in components/bundle.css ----------
SCALE = [('xs', '0.75rem', '1.333'), ('sm', '0.875rem', '1.429'), ('base', '1rem', '1.5'),
         ('lg', '1.125rem', '1.556'), ('xl', '1.25rem', '1.4'), ('2xl', '1.5rem', '1.333'),
         ('3xl', '1.875rem', '1.2'), ('4xl', '2.25rem', '1.111'), ('5xl', '3rem', '1')]
SCALE_USE = {
    'xs': 'Tailwind `text-xs`: fine print and dense metadata.',
    'sm': 'Tailwind `text-sm`: secondary copy, captions and control text.',
    'base': 'Tailwind `text-base`: the default read.',
    'lg': 'Tailwind `text-lg`: a lede or intro line.',
    'xl': 'Tailwind `text-xl`: a card or panel title.',
    '2xl': 'Tailwind `text-2xl`: a section subhead.',
    '3xl': 'Tailwind `text-3xl`: a section title.',
    '4xl': 'Tailwind `text-4xl`: a page title.',
    '5xl': 'Tailwind `text-5xl`: a hero title.',
}
def type_groups():
    scale = {'name': 'Scale', 'family': 'prose', 'styles': [
        {'name': f'type-{k}', 'fontSize': fs, 'lineHeight': lh, 'fontWeight': 400,
         'usage': SCALE_USE[k] + ' The class name belongs to the site\'s stylesheet, so this style is named apart.'}
        for k, fs, lh in SCALE]}
    scale['styles'][2]['sample'] = 'Pure backspin across the horseshoe. A Magnus force against the fall. This is how the pitch rides.'
    roles = {'name': 'Roles', 'family': 'mono', 'styles': [
        {'name': 'atlas-label', 'family': 'mono', 'fontSize': '11px', 'lineHeight': '1', 'fontWeight': 400,
         'letterSpacing': '0.18em', 'sample': 'Official data',
         'usage': 'The `.mono-label` micro-label: source badges, gauge labels, tier index. Set it uppercase. Named apart from the `.mono-label` class.'},
        {'name': 'atlas-kicker', 'family': 'mono', 'fontSize': '11px', 'fontWeight': 500, 'letterSpacing': '0.2em',
         'sample': 'Filed specimen',
         'usage': 'The section eyebrow (`Kicker`, `.rfx-skick`), uppercase with a 22px leading rule in `kicker` ink.'},
        {'name': 'atlas-title', 'family': 'display', 'fontSize': '30px', 'lineHeight': '1.25', 'fontWeight': 400,
         'letterSpacing': '-0.012em', 'sample': 'Four-seam fastball',
         'usage': 'A section or specimen title in the editorial serif (`.display`). The gallery sets it at clamp(22px, 3vw, 30px); this is its full size.'},
    ]}
    sheet = next(g for g in carried['type']['groups'] if g['name'] == 'From the stylesheet')
    sheet = copy.deepcopy(sheet)
    sheet['styles'] = [s for s in sheet['styles'] if s['name'] != 'mono-label']
    return [scale, roles, sheet]

def with_usage(fam_tokens):
    return [{**t, 'usage': note(t['name'])} for t in fam_tokens]

# ================================ B ==========================================
b = copy.deepcopy(carried)
b['color']['tokens'] = with_usage(b['color']['tokens'])
for fam in ('spacing', 'radius', 'motion', 'lineHeight', 'fontWeight', 'other', 'letterSpacing'):
    b[fam]['tokens'] = with_usage(b[fam]['tokens'])
b['type']['groups'] = type_groups()
json.dump(b, open(out_b, 'w'), indent=2, ensure_ascii=False)

# ================================ D ==========================================
d = copy.deepcopy(b)
# One field: the site has no page-level themes. The four utility selectors the
# migration read as themes carry nothing; scene-coal, rfx-card and rfx-plate are
# component scopes (a plate, a card, a coal section), not ways to theme a page.
d['color']['themes'] = [{'id': 'default', 'name': 'Default'}]

def hexval(raw):
    raw = raw.strip().lower()
    return raw if re.fullmatch(r'#[0-9a-f]{3,8}', raw) else None

changed = []
for t in d['color']['tokens']:
    old = t['value']
    base = old.get('default') if isinstance(old, dict) else old
    raw = resolved[t['name']]['raw']
    if base.startswith('{'):
        t['value'] = base                      # an alias of a token the site also aliases
        continue
    if raw == '':
        t['value'] = base                      # declared only inside a component scope
        continue
    new = hexval(raw)
    if new is None:                            # color-mix(): take the browser's resolved color
        c = resolved[t['name']]['color']
        m = re.match(r'rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)', c)
        if m:
            r, g, bb, a = int(m[1]), int(m[2]), int(m[3]), m[4]
        else:
            m = re.match(r'color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: / ([\d.]+))?\)', c)
            r, g, bb = (round(float(m[i]) * 255) for i in (1, 2, 3))
            a = m[4]
        new = '#%02x%02x%02x' % (r, g, bb) + ('%02x' % round(float(a) * 255) if a and float(a) < 1 else '')
    if new.lower() != base.lower():
        changed.append((t['name'], base, new))
    t['value'] = new

# Motion: the house easing and durations.
PA = [('pa-ease-settle', 'cubic-bezier(.22, 1, .36, 1)'), ('pa-motion-tiny', '120ms'), ('pa-motion-short', '190ms'),
      ('pa-motion-medium', '400ms'), ('pa-motion-slow', '700ms'), ('pa-motion-sweep', '900ms')]
d['motion']['tokens'] += [{'name': n, 'value': v, 'usage': note(n)} for n, v in PA]
# Radius: the base and the pill the site declares at :root.
d['radius']['tokens'] += [{'name': 'radius', 'value': '0.625rem', 'usage': note('radius')},
                          {'name': 'radius-pill', 'value': '999px', 'usage': note('radius-pill')}]
# The foil is 21 stops, longer than a token value can hold; the site's own
# declaration in components/bundle.css is the live one. Keeping the old eight-stop
# value here would repaint every preview in the retired rainbow.
d['other']['tokens'] = [t for t in d['other']['tokens'] if t['name'] != 'foil']
# Fonts: every face the site loads (src/main.tsx), Latin subset, from @fontsource.
FACES = [('Newsreader', 'newsreader', '400', 'normal'), ('Newsreader', 'newsreader', '400', 'italic'),
         ('Newsreader', 'newsreader', '500', 'normal'), ('Newsreader', 'newsreader', '600', 'normal'),
         ('Newsreader', 'newsreader', '600', 'italic'),
         ('Hanken Grotesk', 'hanken-grotesk', '400', 'normal'), ('Hanken Grotesk', 'hanken-grotesk', '400', 'italic'),
         ('Hanken Grotesk', 'hanken-grotesk', '500', 'normal'), ('Hanken Grotesk', 'hanken-grotesk', '600', 'normal'),
         ('Hanken Grotesk', 'hanken-grotesk', '700', 'normal'),
         ('Martian Mono', 'martian-mono', '400', 'normal'), ('Martian Mono', 'martian-mono', '500', 'normal'),
         ('Martian Mono', 'martian-mono', '600', 'normal'), ('Anton', 'anton', '400', 'normal')]
d['type']['fonts'] = [{'family': fam, 'file': f'fonts/{slug}-latin-{w}-{s}.woff2', 'weight': w, 'style': s}
                      for fam, slug, w, s in FACES]
d['meta'] = {
    'source': 'github', 'repo': 'ahump20/Pitch-Atlas', 'ref': 'main@4098cbd',
    'paths': {'tokens': ['src/index.css', 'src/components/sections/family-accent.ts'],
              'fonts': ['src/main.tsx', 'node_modules/@fontsource'],
              'docs': ['docs/design-language.md', 'docs/NORTHSTAR.md', 'src/pages/DesignSystemShowcase.tsx']},
    'components': json.load(open(pathlib.Path(__file__).resolve().parents[2] / '.design-sync/config.json'))['componentSrcMap'],
    'synced': '2026-09-22',
}
json.dump(d, open(out_d, 'w'), indent=2, ensure_ascii=False)
print('value changes vs the page list:', len(changed))
for c in changed: print('  %-22s %-11s -> %s' % c)
