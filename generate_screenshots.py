import os
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\HP\.gemini\antigravity-ide\brain\294ec609-88f4-4bbe-9a94-9fa7e7ee09d1"
OUTPUT_DIR = os.path.join("store_assets", "screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Google Play phone screenshot standard: 1080 x 2400
W, H = 1080, 2400

font_title = ImageFont.truetype("arialbd.ttf", 64) if os.path.exists("C:/Windows/Fonts/arialbd.ttf") else ImageFont.load_default()
font_sub = ImageFont.truetype("arial.ttf", 38) if os.path.exists("C:/Windows/Fonts/arial.ttf") else ImageFont.load_default()

CARDS = [
    {
        "filename": "screenshot_1_home.png",
        "raw_source": "phone_screen_wordweave.png",
        "title": "WEAVE THE PATH",
        "subtitle": "Connect letters & find all hidden words",
        "bg_top": (130, 95, 255),
        "bg_bottom": (70, 35, 190),
        "app_bg": (245, 243, 255),
    },
    {
        "filename": "screenshot_2_gameplay.png",
        "raw_source": "phone_screen_board.png",
        "title": "200 HANDCRAFTED BOARDS",
        "subtitle": "Mindful word puzzles designed for pure zen",
        "bg_top": (14, 165, 233),
        "bg_bottom": (30, 58, 138),
        "app_bg": (240, 249, 255),
    },
    {
        "filename": "screenshot_3_rules.png",
        "raw_source": "phone_screen_level1.png",
        "title": "SIMPLE & SATISFYING",
        "subtitle": "Trace touching letters to solve the board",
        "bg_top": (16, 185, 129),
        "bg_bottom": (6, 78, 59),
        "app_bg": (255, 255, 255),
    },
    {
        "filename": "screenshot_4_levels.png",
        "raw_source": "phone_screen_clean.png",
        "title": "EARN STARS & TRACK STATS",
        "subtitle": "Instant local auto-save & smooth progression",
        "bg_top": (236, 72, 153),
        "bg_bottom": (131, 24, 67),
        "app_bg": (253, 242, 248),
    },
    {
        "filename": "screenshot_5_offline.png",
        "raw_source": "phone_screen_levels_list.png",
        "title": "100% OFFLINE READY",
        "subtitle": "Play anywhere, anytime · No WiFi required",
        "bg_top": (168, 85, 247),
        "bg_bottom": (88, 28, 135),
        "app_bg": (250, 245, 255),
    },
]

def make_screenshot(card):
    src_path = os.path.join(ARTIFACT_DIR, card["raw_source"])
    if not os.path.exists(src_path):
        print("Missing raw screenshot:", src_path)
        return

    raw_img = Image.open(src_path)
    rw, rh = raw_img.size
    
    # Crop phone status bar and bottom android nav buttons
    crop_top = int(rh * 0.045)
    crop_bottom = int(rh * 0.942)
    app_cropped = raw_img.crop((0, crop_top, rw, crop_bottom))
    
    # 1. Background gradient
    c1 = card["bg_top"]
    c2 = card["bg_bottom"]
    bg_data = bytearray(W * H * 3)
    idx = 0
    for y in range(H):
        t = y / (H - 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        for x in range(W):
            bg_data[idx] = r
            bg_data[idx+1] = g
            bg_data[idx+2] = b
            idx += 3
    canvas = Image.frombytes("RGB", (W, H), bytes(bg_data))
    draw = ImageDraw.Draw(canvas)
    
    # Subtle background pattern
    for gx in range(40, W, 80):
        draw.line([(gx, 0), (gx, H)], fill=(255, 255, 255, 10), width=1)
    for gy in range(25, H, 60):
        draw.line([(0, gy), (W, gy)], fill=(255, 255, 255, 10), width=1)

    # 2. Top Title & Subtitle
    t_text = card["title"]
    s_text = card["subtitle"]
    
    bbox_t = font_title.getbbox(t_text)
    tw = bbox_t[2] - bbox_t[0]
    draw.text(((W - tw) / 2, 130), t_text, fill=(255, 255, 255), font=font_title)
    
    bbox_s = font_sub.getbbox(s_text)
    sw = bbox_s[2] - bbox_s[0]
    draw.text(((W - sw) / 2, 220), s_text, fill=(240, 235, 255), font=font_sub)
    
    # 3. Card Phone presentation
    target_app_w = 920
    ratio = target_app_w / app_cropped.width
    target_app_h = int(app_cropped.height * ratio)
    app_resized = app_cropped.resize((target_app_w, target_app_h), Image.Resampling.LANCZOS)
    
    app_x = (W - target_app_w) // 2
    app_y = 330
    bezel_radius = 44
    
    # Elegant card backing with app's matching bottom color
    app_bg = card.get("app_bg", (248, 250, 252))
    draw.rounded_rectangle([app_x - 10, app_y - 10, app_x + target_app_w + 10, H + 60], radius=bezel_radius + 8, fill=(0, 0, 0, 50))
    draw.rounded_rectangle([app_x - 4, app_y - 4, app_x + target_app_w + 4, H + 50], radius=bezel_radius + 4, fill=(255, 255, 255, 180))
    draw.rounded_rectangle([app_x, app_y, app_x + target_app_w, H + 50], radius=bezel_radius, fill=app_bg)
    
    # Mask & paste app screenshot
    app_mask = Image.new("L", (target_app_w, target_app_h), 0)
    mask_draw = ImageDraw.Draw(app_mask)
    mask_draw.rounded_rectangle([0, 0, target_app_w, target_app_h], radius=bezel_radius, fill=255)
    
    canvas.paste(app_resized.convert("RGB"), (app_x, app_y), app_mask)
    
    out_file = os.path.join(OUTPUT_DIR, card["filename"])
    canvas.save(out_file, "PNG")
    print("Generated screenshot:", out_file)

if __name__ == '__main__':
    for card in CARDS:
        make_screenshot(card)
    print("All Play Store screenshots polished successfully!")
