# -*- coding: utf-8 -*-
"""Gera a imagem de compartilhamento (og.png, 1200x630)."""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
BASE = os.path.dirname(os.path.abspath(__file__))
RED = (254, 0, 0)

img = Image.new("RGB", (W, H), (10, 10, 10))
d = ImageDraw.Draw(img, "RGBA")

# brilho vermelho
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
for i in range(70, 0, -1):
    gd.ellipse([W - 420 - i * 7, -260 - i * 5, W + 120 + i * 7, 400 + i * 5],
               fill=(254, 0, 0, 2))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
d = ImageDraw.Draw(img, "RGBA")

# listras diagonais
for x in range(-H, W + H, 46):
    d.line([(x, H), (x + H, 0)], fill=(255, 255, 255, 12), width=2)


def escudo(cx, cy, w):
    """Desenha o escudo SPFC centrado em (cx, cy) com largura w."""
    s = w / 200.0
    def P(pts):
        return [(cx - w / 2 + px * s, cy - (224 * s) / 2 + py * s) for px, py in pts]

    outer = P([(8, 6), (192, 6), (192, 116), (168, 152), (130, 186), (100, 208),
               (70, 186), (32, 152), (8, 116)])
    mid = P([(15, 13), (185, 13), (185, 116), (162, 148), (127, 180), (100, 200),
             (73, 180), (38, 148), (15, 116)])
    inner = P([(21, 19), (179, 19), (179, 116), (157, 145), (124, 175), (100, 194),
               (76, 175), (43, 145), (21, 116)])

    d.polygon(outer, fill=(255, 255, 255))
    d.polygon(mid, fill=(0, 0, 0))
    d.polygon(inner, fill=(255, 255, 255))

    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon(inner, fill=255)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.polygon(P([(10, 86), (96, 86), (84, 240), (-12, 240)]), fill=RED)
    ld.polygon(P([(104, 86), (190, 86), (212, 240), (116, 240)]), fill=(0, 0, 0))
    ld.rectangle(P([(8, 10), (192, 79)])[0] + P([(8, 10), (192, 79)])[1], fill=(0, 0, 0))
    img.paste(layer, (0, 0), Image.composite(layer.split()[3], Image.new("L", img.size, 0), mask))

    try:
        f = ImageFont.truetype("impact.ttf", int(w * 0.30))
    except Exception:
        f = ImageFont.load_default()
    tx, ty = P([(100, 22)])[0]
    d.text((tx, ty), "SPFC", font=f, fill=(255, 255, 255), anchor="ma")


def fonte(nome, tam):
    for n in nome:
        try:
            return ImageFont.truetype(n, tam)
        except Exception:
            pass
    return ImageFont.load_default()


escudo(1010, 292, 268)

f_eyebrow = fonte(["arialbd.ttf"], 26)
f_big = fonte(["impact.ttf", "arialbd.ttf"], 74)
f_sub = fonte(["arial.ttf"], 30)

d.rectangle([70, 96, 118, 102], fill=RED)
d.text((132, 84), "ESCOLA OFICIAL DO SÃO PAULO FC", font=f_eyebrow, fill=RED)

d.text((70, 152), "AULA EXPERIMENTAL", font=f_big, fill=(255, 255, 255))
d.text((70, 232), "GRÁTIS EM GUARULHOS", font=f_big, fill=RED)

d.text((70, 352), "Turmas de 4 a 15 anos · Metodologia Made in Cotia", font=f_sub, fill=(190, 190, 190))
d.text((70, 394), "Agende o primeiro treino em 1 minuto.", font=f_sub, fill=(190, 190, 190))

# faixa tricolor no rodapé
d.rectangle([0, H - 14, W // 3, H], fill=RED)
d.rectangle([W // 3, H - 14, 2 * W // 3, H], fill=(255, 255, 255))
d.rectangle([2 * W // 3, H - 14, W, H], fill=(0, 0, 0))

img.save(os.path.join(BASE, "og.png"), optimize=True)
print("og.png gerado")
