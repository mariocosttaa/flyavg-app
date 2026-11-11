#!/usr/bin/env python3
"""Gera as páginas a partir de tools/templates, embutindo os logótipos do kit de marca.

Os logótipos têm de estar no HTML (e não num <img>) para se animarem: as letras sobem,
a linha de voo desenha-se e o avião descola. Os paths e as cores são os originais;
só se remove o retângulo de fundo dos negativos e se corta a margem do viewBox.

Uso, a partir da raiz do repositório:
    python3 tools/build.py ../brand-design
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRAND = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT.parent / "brand-design").resolve()

PATH_RE = re.compile(r'<path d="([^"]+)" fill="(#[0-9A-Fa-f]+)"( fill-rule="evenodd")?\s*/>')


def path_el(p, extra=""):
    rule = ' fill-rule="evenodd"' if p[2] else ""
    return f'<path{extra} d="{p[0]}" fill="{p[1]}"{rule}/>'


def logo(svg_file, *, letters, flight, tagline, viewbox, wipe, plane_separate, label):
    """letters/flight/tagline: cores dos paths no ficheiro original."""
    paths = PATH_RE.findall((BRAND / svg_file).read_text())
    let = [p for p in paths if p[1].upper() == letters]
    fl = [p for p in paths if p[1].upper() == flight]
    tg = [p for p in paths if p[1].upper() == tagline]
    assert let and fl and tg, f"{svg_file}: estrutura inesperada"
    x, y, w, h = wipe
    out = [
        f'<svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" role="img" aria-label="{label}">',
        f'<defs><clipPath id="flight-clip" clipPathUnits="userSpaceOnUse">'
        f'<rect class="flight-wipe" x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath></defs>',
    ]
    out += [path_el(p, f' class="l" style="--i:{i}"') for i, p in enumerate(let)]
    if plane_separate:
        # A linha desenha-se e o avião descola no fim.
        out.append(f'<g clip-path="url(#flight-clip)">{path_el(fl[0])}</g>')
        out.append(path_el(fl[1], ' class="plane"'))
    else:
        # Linha e avião são um só path: a linha desenha-se e leva o avião no fim.
        out.append(f'<g clip-path="url(#flight-clip)">{"".join(path_el(p) for p in fl)}</g>')
    out += [path_el(p, ' class="tg"') for p in tg]
    out.append("</svg>")
    return "\n".join(out)


def mark(svg_file):
    """Ícone para o fundo: paths sem cor, para o CSS os pintar em tom baixo."""
    s = (BRAND / svg_file).read_text()
    s = re.sub(r"^<svg[^>]*>", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" '
               'aria-hidden="true" focusable="false">', s)
    return re.sub(r' fill="#[0-9A-Fa-f]+"', "", s)


PAGES = [
    {
        "template": "index.html",
        "out": "index.html",
        "logo": dict(svg_file="01-AVAGroup/logo/marca-horizontal-negativo.svg",
                     letters="#FAF6EE", flight="#F2A93B", tagline="#9AA3B2",
                     viewbox="-1180 -360 6520 1560", wipe=(-1180, -40, 3060, 700),
                     plane_separate=True, label="AVAGroup, Angola Virtual Airliners Group"),
        "mark": "01-AVAGroup/icone/marca-icone-branco.svg",
    },
    {
        "template": "taag-virtual.html",
        "out": "taag-virtual/index.html",
        "logo": dict(svg_file="02-TAAG-Virtual/taag-virtual-horizontal.svg",
                     letters="#0F1B2D", flight="#E10600", tagline="#5E6673",
                     viewbox="-1180 -360 7210 1560", wipe=(-1180, -40, 3720, 700),
                     plane_separate=True, label="TAAG Virtual, an AVAGroup airline"),
        "mark": None,
    },
    {
        "template": "world-virtual.html",
        "out": "world-virtual/index.html",
        "logo": dict(svg_file="03-World-Virtual/world-virtual-horizontal-negativo.svg",
                     letters="#FAF6EE", flight="#F2A93B", tagline="#9AB0D0",
                     viewbox="-20 -360 6205 1560", wipe=(1100, -360, 2160, 1000),
                     plane_separate=False, label="World Virtual, an AVAGroup airline"),
        "mark": "03-World-Virtual/world-virtual-icone.svg",
    },
]

for page in PAGES:
    html = (ROOT / "tools/templates" / page["template"]).read_text()
    html = html.replace("<!--LOGO-->", logo(**page["logo"]))
    if page["mark"]:
        html = html.replace("<!--MARK-->", mark(page["mark"]))
    assert "<!--LOGO-->" not in html and "<!--MARK-->" not in html, page["out"]
    target = ROOT / page["out"]
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html)
    print(f"ok  {page['out']}  ({len(html) // 1024} KB)")
