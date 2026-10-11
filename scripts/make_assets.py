"""i00.si 品牌资产 v2：统一裁切（完整头部 + 留白），修复小尺寸图标被切的问题
- 检测：肤色包围盒(脸) ∪ 暗色像素(头发) = 头部整体范围，含头顶与双耳
- 图标 16/32/48/ico/180/192/512/maskable 全部来自同一「头部完整」裁切，尺寸间构图一致
- Hero 头像用更宽的裁切，保证圆形遮罩不切到头发
- OG 1200x630
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance
import os

SRC = r"C:\Users\XIAO2027\.hermes-web-ui\upload\default\7ad975493ae7d7bd.jpeg"
OUT = r"D:\i00si-site\public"
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
W, H = im.size
px = im.load()
lum = im.convert("L").load()

# ---------- 1) 脸：肤色包围盒 ----------
xs, ys = [], []
for y in range(0, H, 2):
    for x in range(0, W, 2):
        r, g, b = px[x, y]
        if r > 190 and g > 120 and b > 95 and (r - b) > 45 and 12 < (r - g) < 95:
            xs.append(x); ys.append(y)
fx0, fx1, fy0, fy1 = min(xs), max(xs), min(ys), max(ys)

# ---------- 2) 头发：上半幅的暗像素（黑发带紫光泽）；限制在上半幅避免吃到领口/阴影 ----------
hx, hy = [], []
for y in range(0, int(H * 0.55), 2):
    for x in range(0, W, 2):
        if lum[x, y] < 96:
            hx.append(x); hy.append(y)
hx0, hx1, hy0 = min(hx), max(hx), min(hy)

# ---------- 3) 头部整体：宽度取头发最宽处，高度按头部比例推算（下巴≈发顶+1.13×头宽）----------
head_w = hx1 - hx0
top = hy0
bot = top + int(head_w * 1.13)          # 下巴
ccx = (hx0 + hx1) // 2
ccy = (top + bot) // 2
left, right = hx0, hx1
head_h = bot - top
print(f"face bbox : {fx0},{fy0} -> {fx1},{fy1}")
print(f"hair bbox : {hx0},{hy0} -> {hx1},{max(hy)}")
print(f"HEAD      : {left},{top} -> {right},{bot}   w={head_w} h={head_h} center={ccx},{ccy}")

# ---------- 4) 裁切：完整头部 + 14% 留白（不会切到头发/耳朵/下巴）----------
side = int(max(head_w, head_h) * 1.24)
side = min(side, W, H)
x0 = max(0, min(W - side, ccx - side // 2))
y0 = max(0, min(H - side, ccy - side // 2))
print(f"ICON crop : x0={x0} y0={y0} side={side}   (head{'-' if y0>top else '+'} 上下留白 {top-y0}px / {y0+side-bot}px)")

head = im.crop((x0, y0, x0 + side, y0 + side))
head = ImageEnhance.Contrast(head).enhance(1.10)
head = ImageEnhance.Color(head).enhance(1.10)
head = head.filter(ImageFilter.UnsharpMask(radius=2.0, percent=120, threshold=3))

# Hero 头像：用整幅原图（自带玻璃泡泡外框，圆形遮罩下头发四角不会被切）
wside = min(W, H)
wx0 = (W - wside) // 2
wy0 = (H - wside) // 2
wide = im.crop((wx0, wy0, wx0 + wside, wy0 + wside)).resize((1080, 1080), Image.LANCZOS)
print(f"AVATAR crop: x0={wx0} y0={wy0} side={wside}")


def save(img, name, size, **kw):
    p = os.path.join(OUT, name)
    img.resize((size, size), Image.LANCZOS).save(p, **kw)
    print(f"  {name:32s} {size}x{size}  {os.path.getsize(p):>7d} B")


# 小尺寸额外提对比：16/32px 下更容易读出「深发 + 眼镜」的剪影
small = ImageEnhance.Contrast(head).enhance(1.26)
small = ImageEnhance.Color(small).enhance(1.16)
for s in (16, 32):
    save(small, f"favicon-{s}.png", s, optimize=True)
# 顶栏 logo（角色头像即品牌 logo），提供 1x/2x
for s in (64, 128):
    save(head, f"logo-{s}.png", s, optimize=True)
save(head, "favicon-48.png", 48, optimize=True)
head.resize((48, 48), Image.LANCZOS).save(
    os.path.join(OUT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
print(f"  {'favicon.ico':32s} 16/32/48")

for n, s in (("apple-touch-icon.png", 180), ("android-chrome-192x192.png", 192),
             ("android-chrome-512x512.png", 512)):
    save(head, n, s, optimize=True)

# maskable：内容 78% 居中，四周用图像底色延展（满足安全区）
M = 512
inner = int(M * 0.78)
edge = Image.new("RGB", (64, 64))
ep = edge.load()
for y in range(64):
    for x in range(64):
        ep[x, y] = head.getpixel((min(side - 1, 3 + x * (side - 6) // 63),
                                  min(side - 1, 3 + y * (side - 6) // 63)))
bg = edge.resize((M, M), Image.LANCZOS).filter(ImageFilter.GaussianBlur(30))
bg.paste(head.resize((inner, inner), Image.LANCZOS), ((M - inner) // 2, (M - inner) // 2))
bg.save(os.path.join(OUT, "maskable-512x512.png"), optimize=True)
print(f"  {'maskable-512x512.png':32s} 512x512  {os.path.getsize(os.path.join(OUT,'maskable-512x512.png')):>7d} B")

av = wide.resize((640, 640), Image.LANCZOS)
av.save(os.path.join(OUT, "avatar.webp"), "WEBP", quality=90, method=6)
av.save(os.path.join(OUT, "avatar.jpg"), "JPEG", quality=88, optimize=True, progressive=True)
print("  avatar.webp / avatar.jpg      640x640")

# ---------- OG 1200x630 ----------
OW, OH = 1200, 630
base = Image.new("RGB", (OW, OH), (8, 8, 11))
glow = Image.new("RGB", (OW, OH), (8, 8, 11))
gd = ImageDraw.Draw(glow)
gd.ellipse((-300, -340, 640, 600), fill=(52, 30, 96))
gd.ellipse((760, 160, 1520, 920), fill=(16, 58, 62))
glow = glow.filter(ImageFilter.GaussianBlur(130))
og = Image.blend(base, glow, 0.94)
d = ImageDraw.Draw(og)

F = r"C:\Windows\Fonts"


def font(names, size):
    for n in names:
        p = os.path.join(F, n)
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


f_name = font(["msyhbd.ttc", "msyhbd.ttf", "msyh.ttc"], 96)
f_role = font(["consola.ttf", "cour.ttf"], 23)
f_desc = font(["msyh.ttc", "arial.ttf"], 27)
f_dom = font(["msyhbd.ttc", "msyh.ttc"], 44)
f_url = font(["consola.ttf", "cour.ttf"], 24)

AV = 232
ax, ay = 104, 118
ring = Image.new("RGBA", (AV + 14, AV + 14), (0, 0, 0, 0))
ImageDraw.Draw(ring).ellipse((0, 0, AV + 13, AV + 13), fill=(200, 255, 61, 255))
og.paste(ring.convert("RGB"), (ax - 7, ay - 7), ring.split()[3])
mask = Image.new("L", (AV * 4, AV * 4), 0)
ImageDraw.Draw(mask).ellipse((0, 0, AV * 4 - 1, AV * 4 - 1), fill=255)
og.paste(wide.resize((AV, AV), Image.LANCZOS), (ax, ay), mask.resize((AV, AV), Image.LANCZOS))
d.text((ax + 2, 452), "i00.si", font=f_dom, fill=(245, 245, 247))

tx = 430
d.text((tx, 132), "Everett", font=f_name, fill=(245, 245, 247))
d.text((tx, 258), "AI SYSTEM ARCHITECT / FULL-STACK ENGINEER", font=f_role, fill=(200, 255, 61))
d.line((tx, 306, OW - 96, 306), fill=(48, 48, 58), width=2)
d.text((tx, 340), "AIOS · OpenClaw · ENXX 等 8 个项目入口", font=f_desc, fill=(214, 214, 224))
d.text((tx, 388), "多智能体编排 · 自动化流程 · 私有化部署", font=f_desc, fill=(230, 230, 238))
d.text((tx, 458), "linktr.i00.si", font=f_url, fill=(200, 255, 61))
d.ellipse((OW - 122, 462, OW - 110, 474), fill=(200, 255, 61))

og.save(os.path.join(OUT, "og-image.png"), "PNG", optimize=True)
print(f"  {'og-image.png':32s} 1200x630  {os.path.getsize(os.path.join(OUT,'og-image.png')):>7d} B")
print("DONE")
