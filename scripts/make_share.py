"""i00.si 分享封面套图
- og-image.png     1200x630   Facebook / Telegram / LinkedIn / 微信朋友圈
- x-card.png       1200x628   X (Twitter) summary_large_image
- wechat-share.png 500x500    微信 / QQ 聊天缩略图（1:1）

设计约束：
1) 所有关键信息（头像 / 姓名 / 职位 / 副标题 / 域名）都收在画布中央 **630x630 安全区**内，
   因此微信把封面中心裁成 1:1 时核心内容完整不掉；
2) 只在外侧留装饰性角标（被裁掉也不影响信息）；
3) 含中文字符的行一律用微软雅黑字体，避免等宽字体缺字形出现方块。
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

OUT = r"D:\i00si-site\public"
SRC = r"C:\Users\XIAO2027\.hermes-web-ui\upload\default\7ad975493ae7d7bd.jpeg"
FONTS = r"C:\Windows\Fonts"

INK = (8, 8, 11)
FG1 = (245, 245, 247)
FG2 = (203, 203, 215)
FG3 = (138, 138, 154)
HAIR = (46, 46, 58)
LIME = (200, 255, 61)

CJK = ["msyhbd.ttc", "msyhbd.ttf", "msyh.ttc", "arialbd.ttf"]   # 含中文用
MONO = ["consola.ttf", "cour.ttf", "arial.ttf"]                 # 纯英文用


def font(names, size):
    for n in names:
        p = os.path.join(FONTS, n)
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def backdrop(w, h):
    k = w / 1200.0
    base = Image.new("RGB", (w, h), INK)
    glow = Image.new("RGB", (w, h), INK)
    g = ImageDraw.Draw(glow)
    g.ellipse((-int(360 * k), -int(420 * k), int(620 * k), int(560 * k)), fill=(46, 26, 88))
    g.ellipse((int(700 * k), int(140 * k), int(1600 * k), int(1040 * k)), fill=(14, 52, 58))
    glow = glow.filter(ImageFilter.GaussianBlur(int(150 * k)))
    img = Image.blend(base, glow, 0.9)
    grid = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    step = max(2, int(48 * k))
    for x in range(0, w, step):
        gd.line((x, 0, x, h), fill=(255, 255, 255, 7), width=1)
    for y in range(0, h, step):
        gd.line((0, y, w, y), fill=(255, 255, 255, 7), width=1)
    return Image.alpha_composite(img.convert("RGBA"), grid).convert("RGB")


def avatar(size):
    im = Image.open(SRC).convert("RGB")
    s = min(im.size)
    x0, y0 = (im.size[0] - s) // 2, (im.size[1] - s) // 2
    im = im.crop((x0, y0, x0 + s, y0 + s)).resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(im, (0, 0), mask.resize((size, size), Image.LANCZOS))
    return out


def make_wide(w, h, path, tag):
    k = w / 1200.0
    img = backdrop(w, h)
    cx = w // 2

    av = int(190 * k)
    ring = Image.new("RGBA", (av + 16, av + 16), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((0, 0, av + 15, av + 15), fill=LIME + (255,))
    av_top = int(122 * k)
    img.paste(ring.convert("RGB"), (cx - (av + 16) // 2, av_top - 8), ring.split()[3])
    av_img = avatar(av)
    img.paste(av_img, (cx - av // 2, av_top), av_img)
    d = ImageDraw.Draw(img)

    f_name = font(CJK, int(58 * k))
    f_role = font(MONO, int(20 * k))
    f_desc = font(CJK, int(20 * k))
    f_url = font(MONO, int(20 * k))
    f_corner = font(MONO, int(17 * k))

    # —— 全部关键文字居中，确保落在中央 630x630 安全区 ——
    d.text((cx, int(378 * k)), "Everett", font=f_name, fill=FG1, anchor="mm")
    d.text((cx, int(424 * k)), "AI SYSTEM ARCHITECT · FULL-STACK ENGINEER", font=f_role, fill=LIME, anchor="mm")
    d.text((cx, int(468 * k)), "8 个项目入口 · 多智能体编排 · 自动化流程 · 私有化部署",
           font=f_desc, fill=FG2, anchor="mm")
    d.line((cx - int(220 * k), int(504 * k), cx + int(220 * k), int(504 * k)), fill=HAIR, width=max(1, int(k)))
    d.text((cx, int(538 * k)), "linktr.i00.si", font=f_url, fill=LIME, anchor="mm")

    # —— 外侧装饰角标（被裁掉也不损失信息）——
    d.ellipse((int(96 * k) - int(26 * k), int(60 * k) - int(5 * k),
               int(96 * k) - int(16 * k), int(60 * k) + int(5 * k)), fill=LIME)
    d.text((int(96 * k), int(60 * k)), "i00.si", font=f_corner, fill=FG1, anchor="lm")
    d.text((w - int(96 * k), int(60 * k)), "@reoe_x", font=f_corner, fill=FG3, anchor="rm")
    d.text((int(96 * k), h - int(46 * k)), "SHENZHEN · CN", font=f_corner, fill=FG3, anchor="lm")
    d.text((w - int(96 * k), h - int(46 * k)), "8 PROJECTS · 2026",
           font=f_corner, fill=FG3, anchor="rm")  # 收窄，确保整体落在中心裁切区之外

    img.save(path, "PNG", optimize=True)
    print(f"  {tag:16s} {w}x{h}  {os.path.getsize(path):>7d} B")


def make_square(size, path, tag):
    k = size / 500.0
    img = backdrop(size, size)
    cx = size // 2

    av = int(206 * k)
    ring = Image.new("RGBA", (av + 16, av + 16), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((0, 0, av + 15, av + 15), fill=LIME + (255,))
    av_top = int(70 * k)
    img.paste(ring.convert("RGB"), (cx - (av + 16) // 2, av_top - 8), ring.split()[3])
    av_img = avatar(av)
    img.paste(av_img, (cx - av // 2, av_top), av_img)
    d = ImageDraw.Draw(img)

    f_name = font(CJK, int(54 * k))
    f_role = font(CJK, int(19 * k))
    f_desc = font(CJK, int(18 * k))
    f_url = font(MONO, int(19 * k))

    d.text((cx, int(342 * k)), "Everett", font=f_name, fill=FG1, anchor="mm")
    d.text((cx, int(384 * k)), "AI 系统架构师 / 全栈工程师", font=f_role, fill=LIME, anchor="mm")
    d.text((cx, int(420 * k)), "8 个项目入口 · 多智能体编排", font=f_desc, fill=FG2, anchor="mm")
    d.line((int(78 * k), int(446 * k), size - int(78 * k), int(446 * k)), fill=HAIR, width=max(1, int(k)))
    d.text((cx, int(474 * k)), "linktr.i00.si", font=f_url, fill=LIME, anchor="mm")

    img.save(path, "PNG", optimize=True)
    print(f"  {tag:16s} {size}x{size}  {os.path.getsize(path):>7d} B")


print("生成分享封面：")
make_wide(1200, 630, os.path.join(OUT, "og-image.png"), "og-image")
make_wide(1200, 628, os.path.join(OUT, "x-card.png"), "x-card")
make_square(500, os.path.join(OUT, "wechat-share.png"), "wechat-share")
print("DONE")
