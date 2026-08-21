from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path("/home/ubuntu/alpha-compound")
OUT = Path("/home/ubuntu/webdev-static-assets/customer-experience-feature-slides")
OUT.mkdir(parents=True, exist_ok=True)

HOME = ROOT / "e2e/visual-baselines.spec.ts-snapshots/public-home-linux.png"
DETAIL = ROOT / "e2e/visual-baselines.spec.ts-snapshots/customer-quote-detail-linux.png"
MOBILE_DETAIL = ROOT / "e2e/visual-baselines.spec.ts-snapshots/mobile-quote-detail-linux.png"
MOBILE_CHECKOUT = ROOT / "e2e/visual-baselines.spec.ts-snapshots/mobile-checkout-linux.png"

W, H = 1920, 1080
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")
FONT_BOLD = str(FONT_DIR / "DejaVuSans-Bold.ttf")
FONT_REGULAR = str(FONT_DIR / "DejaVuSans.ttf")

SLIDES = [
    {
        "number": "01",
        "eyebrow": "THE FRONT DOOR",
        "title": "Members-only access,\nmade premium.",
        "body": "A controlled-access storefront for HD Labs and BP Pharma, built to feel seamless on desktop and mobile.",
        "desktop": HOME,
        "mobile": MOBILE_CHECKOUT,
        "mobile_crop": (0, 0, 390, 780),
        "tag": "ACCESS",
    },
    {
        "number": "02",
        "eyebrow": "THE QUOTE CART",
        "title": "Browse, build,\nand submit.",
        "body": "Customers browse the catalogue, add products to a quote, and submit delivery details in a few focused steps.",
        "desktop": HOME,
        "mobile": MOBILE_CHECKOUT,
        "mobile_crop": (0, 650, 390, 1500),
        "tag": "QUOTE REQUEST",
    },
    {
        "number": "03",
        "eyebrow": "THE CUSTOMER DASHBOARD",
        "title": "Every order,\nin one clear view.",
        "body": "Quote progress, order history, payment status and customer communication live together in the account experience.",
        "desktop": DETAIL,
        "mobile": MOBILE_DETAIL,
        "mobile_crop": (0, 0, 390, 900),
        "tag": "ORDER PROGRESS",
    },
    {
        "number": "04",
        "eyebrow": "THE PAYMENT MOMENT",
        "title": "Approved. Paid.\nIn seconds.",
        "body": "Once a quote is approved, the customer selects a secure PayFast or Instant EFT route directly inside the order experience.",
        "desktop": DETAIL,
        "mobile": MOBILE_DETAIL,
        "mobile_crop": (0, 2480, 390, 3300),
        "tag": "SECURE PAYMENT",
    },
    {
        "number": "05",
        "eyebrow": "THE DELIVERY EXPERIENCE",
        "title": "Tracking that stays\nwith the customer.",
        "body": "Waybill, courier link, delivery estimate and progress timeline keep customers informed after every status update.",
        "desktop": DETAIL,
        "mobile": MOBILE_DETAIL,
        "mobile_crop": (0, 780, 390, 1680),
        "tag": "DELIVERY TRACKING",
    },
]


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size=size)


def contain(image, size):
    copy = image.copy()
    copy.thumbnail(size, Image.Resampling.LANCZOS)
    return copy


def cover(image, size):
    target_w, target_h = size
    scale = max(target_w / image.width, target_h / image.height)
    resized = image.resize((int(image.width * scale), int(image.height * scale)), Image.Resampling.LANCZOS)
    left = max(0, (resized.width - target_w) // 2)
    top = max(0, (resized.height - target_h) // 2)
    return resized.crop((left, top, left + target_w, top + target_h))


def draw_wrapped(draw, position, text, width, line_height, fill, font_obj):
    words = text.split()
    lines, line = [], ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if draw.textlength(candidate, font=font_obj) <= width:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    x, y = position
    for item in lines:
        draw.text((x, y), item, font=font_obj, fill=fill)
        y += line_height


def panel(canvas, box, radius=30, fill=(7, 11, 17, 238), outline=(38, 81, 111, 255)):
    draw = ImageDraw.Draw(canvas, "RGBA")
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow, "RGBA")
    x1, y1, x2, y2 = box
    shadow_draw.rounded_rectangle((x1 + 10, y1 + 14, x2 + 10, y2 + 14), radius=radius, fill=(0, 0, 0, 110))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(12)))
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2)


def render(slide):
    canvas = Image.new("RGBA", (W, H), (3, 7, 12, 255))
    draw = ImageDraw.Draw(canvas, "RGBA")

    # Brand atmosphere.
    draw.ellipse((1170, -220, 2160, 760), fill=(14, 165, 233, 24))
    draw.ellipse((-500, 720, 820, 1480), fill=(225, 29, 72, 22))
    draw.line((0, 10, 940, 10), fill=(225, 29, 72, 255), width=7)
    draw.line((940, 10, W, 10), fill=(14, 165, 233, 255), width=7)

    # Header.
    draw.rounded_rectangle((86, 68, 170, 124), radius=16, fill=(14, 165, 233, 255))
    draw.text((108, 78), slide["number"], font=font(24, True), fill=(255, 255, 255, 255))
    draw.text((194, 75), "ANABOLICS", font=font(25, True), fill=(255, 255, 255, 255))
    draw.text((385, 75), "AFRICA", font=font(25, True), fill=(56, 189, 248, 255))
    draw.text((1530, 77), "CUSTOMER EXPERIENCE", font=font(18, True), fill=(148, 163, 184, 255))

    draw.text((92, 194), slide["eyebrow"], font=font(18, True), fill=(56, 189, 248, 255))
    title_y = 238
    for line in slide["title"].split("\n"):
        draw.text((90, title_y), line, font=font(48, True), fill=(248, 250, 252, 255))
        title_y += 58
    draw_wrapped(draw, (92, title_y + 14), slide["body"], 590, 31, (203, 213, 225, 255), font(21))
    draw.rounded_rectangle((92, 620, 92 + 244, 668), radius=18, fill=(82, 20, 37, 245), outline=(225, 29, 72, 185), width=1)
    draw.text((116, 634), slide["tag"], font=font(16, True), fill=(253, 164, 175, 255))

    # Desktop mockup.
    desktop_box = (720, 140, 1475, 765)
    panel(canvas, desktop_box, radius=26)
    dx1, dy1, dx2, dy2 = desktop_box
    draw.rounded_rectangle((dx1 + 18, dy1 + 18, dx2 - 18, dy1 + 58), radius=12, fill=(14, 22, 33, 255))
    for offset, colour in [(0, (225, 29, 72, 255)), (20, (245, 158, 11, 255)), (40, (56, 189, 248, 255))]:
        draw.ellipse((dx1 + 34 + offset, dy1 + 32, dx1 + 46 + offset, dy1 + 44), fill=colour)
    desktop = Image.open(slide["desktop"]).convert("RGBA")
    desktop_image = cover(desktop, (dx2 - dx1 - 36, dy2 - dy1 - 86))
    canvas.alpha_composite(desktop_image, (dx1 + 18, dy1 + 66))

    # Mobile mockup.
    phone_box = (1536, 192, 1825, 820)
    draw.rounded_rectangle(phone_box, radius=44, fill=(5, 10, 17, 255), outline=(71, 85, 105, 255), width=3)
    px1, py1, px2, py2 = phone_box
    draw.rounded_rectangle((px1 + 92, py1 + 13, px2 - 92, py1 + 28), radius=8, fill=(30, 41, 59, 255))
    mobile = Image.open(slide["mobile"]).convert("RGBA")
    crop = mobile.crop(slide["mobile_crop"])
    mobile_image = cover(crop, (px2 - px1 - 28, py2 - py1 - 52))
    mask = Image.new("L", mobile_image.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, mobile_image.width, mobile_image.height), radius=28, fill=255)
    canvas.paste(mobile_image, (px1 + 14, py1 + 36), mask)
    draw.rounded_rectangle((px1 + 115, py2 - 20, px2 - 115, py2 - 10), radius=6, fill=(226, 232, 240, 180))

    # Footer feature marker.
    draw.line((90, 904, 1826, 904), fill=(30, 41, 59, 255), width=2)
    draw.text((92, 942), "MEMBERS-ONLY PLATFORM", font=font(16, True), fill=(148, 163, 184, 255))
    draw.text((92, 976), "Built around the customer journey — from quote to delivery.", font=font(25, True), fill=(248, 250, 252, 255))
    draw.text((1535, 950), f"{slide['number']} / 05", font=font(21, True), fill=(56, 189, 248, 255))

    return canvas.convert("RGB")


for slide in SLIDES:
    image = render(slide)
    image.save(OUT / f"anabolics-africa-customer-experience-{slide['number']}.png", quality=95)
    print(OUT / f"anabolics-africa-customer-experience-{slide['number']}.png")
