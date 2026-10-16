import os
from PIL import Image, ImageDraw, ImageFont

def generate_feature_graphic():
    W, H = 1024, 500
    
    # 1. Background gradient
    c1 = (130, 95, 255)   # #825FFF
    c2 = (60, 30, 190)    # #3C1EBE
    
    data = bytearray(W * H * 4)
    idx = 0
    for y in range(H):
        ty = y / (H - 1)
        for x in range(W):
            tx = x / (W - 1)
            t = (tx * 0.35 + ty * 0.65)
            r = int(c1[0] + (c2[0] - c1[0]) * t)
            g = int(c1[1] + (c2[1] - c1[1]) * t)
            b = int(c1[2] + (c2[2] - c1[2]) * t)
            data[idx] = r
            data[idx+1] = g
            data[idx+2] = b
            data[idx+3] = 255
            idx += 4
    base = Image.frombytes('RGBA', (W, H), bytes(data))
    
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # 2. Decorative grid lines
    for gx in range(40, W, 70):
        draw.line([(gx, 0), (gx, H)], fill=(255, 255, 255, 14), width=1)
    for gy in range(25, H, 45):
        draw.line([(0, gy), (W, gy)], fill=(255, 255, 255, 14), width=1)
        
    # 3. Brand Mark on Left
    mark_size = 290
    mx = 70
    my = 105
    card_r = 34
    
    # Glow / shadow behind mark
    draw.rounded_rectangle([mx - 8, my - 8, mx + mark_size + 8, my + mark_size + 8], radius=card_r + 4, fill=(0, 0, 0, 50))
    draw.rounded_rectangle([mx, my, mx + mark_size, my + mark_size], radius=card_r, fill=(90, 55, 230, 255), outline=(255, 255, 255, 140), width=3)
    
    def to_mark(vx, vy):
        cx = mx + (vx / 24.0) * mark_size
        cy = my + (vy / 24.0) * mark_size
        return cx, cy

    v_points = [(6, 6), (6, 18), (12, 18), (12, 6), (18, 6), (18, 18)]
    pts = [to_mark(vx, vy) for vx, vy in v_points]
    s_width = int(mark_size * (2.4 / 24.0))
    for i in range(len(pts) - 1):
        draw.line([pts[i], pts[i+1]], fill=(255, 255, 255, 255), width=s_width)
    for pt in pts:
        rj = s_width / 2.0
        draw.ellipse([pt[0] - rj, pt[1] - rj, pt[0] + rj, pt[1] + rj], fill=(255, 255, 255, 255))
        
    rn = mark_size * (1.9 / 24.0)
    for vx in [6, 12, 18]:
        for vy in [6, 12, 18]:
            cx, cy = to_mark(vx, vy)
            draw.ellipse([cx - rn, cy - rn, cx + rn, cy + rn], fill=(255, 255, 255, 255))
            
    rg = mark_size * (2.6 / 24.0)
    gx, gy = to_mark(18, 18)
    draw.ellipse([gx - rg, gy - rg, gx + rg, gy + rg], fill=(255, 201, 74, 255))

    # 4. Right Side: Word Tiles
    font_tile = ImageFont.truetype("arialbd.ttf", 34) if os.path.exists("C:/Windows/Fonts/arialbd.ttf") else ImageFont.load_default()
    font_head = ImageFont.truetype("arialbd.ttf", 26) if os.path.exists("C:/Windows/Fonts/arialbd.ttf") else ImageFont.load_default()
    font_sub = ImageFont.truetype("arial.ttf", 19) if os.path.exists("C:/Windows/Fonts/arial.ttf") else ImageFont.load_default()
    font_badge = ImageFont.truetype("arialbd.ttf", 15) if os.path.exists("C:/Windows/Fonts/arialbd.ttf") else ImageFont.load_default()

    start_x = 425
    tile_w, tile_h = 60, 60
    
    # ROW 1: [W] [O] [R] [D]
    tiles1 = [
        ('W', (239, 68, 68)),   # Red
        ('O', (14, 165, 233)),  # Sky
        ('R', (16, 185, 129)),  # Green
        ('D', (245, 158, 11)),  # Amber
    ]
    for i, (letter, color) in enumerate(tiles1):
        tx = start_x + i * (tile_w + 14)
        ty = 85
        draw.rounded_rectangle([tx, ty + 4, tx + tile_w, ty + tile_h + 4], radius=13, fill=(0, 0, 0, 70))
        draw.rounded_rectangle([tx, ty, tx + tile_w, ty + tile_h], radius=13, fill=color, outline=(255, 255, 255, 160), width=2)
        bbox = font_tile.getbbox(letter)
        lw = bbox[2] - bbox[0]
        lh = bbox[3] - bbox[1]
        draw.text((tx + (tile_w - lw)/2, ty + (tile_h - lh)/2 - 3), letter, fill=(255, 255, 255, 255), font=font_tile)

    # ROW 2: [W] [E] [A] [V] [E]
    tiles2 = [
        ('W', (139, 92, 246)),  # Purple
        ('E', (236, 72, 153)),  # Pink
        ('A', (20, 184, 166)),  # Teal
        ('V', (249, 115, 22)),  # Orange
        ('E', (244, 63, 94)),   # Rose
    ]
    for i, (letter, color) in enumerate(tiles2):
        tx = start_x + i * (tile_w + 14)
        ty = 160
        draw.rounded_rectangle([tx, ty + 4, tx + tile_w, ty + tile_h + 4], radius=13, fill=(0, 0, 0, 70))
        draw.rounded_rectangle([tx, ty, tx + tile_w, ty + tile_h], radius=13, fill=color, outline=(255, 255, 255, 160), width=2)
        bbox = font_tile.getbbox(letter)
        lw = bbox[2] - bbox[0]
        lh = bbox[3] - bbox[1]
        draw.text((tx + (tile_w - lw)/2, ty + (tile_h - lh)/2 - 3), letter, fill=(255, 255, 255, 255), font=font_tile)

    # 5. Taglines
    draw.text((start_x, 245), "Weave The Path · Connect All Letters", fill=(255, 255, 255, 255), font=font_head)
    draw.text((start_x, 285), "200 Handcrafted Boards · Mindful Word Puzzles", fill=(225, 215, 255, 230), font=font_sub)

    # 6. Feature badges
    badges = [
        ("200 Levels", (59, 130, 246)),
        ("Offline Ready", (16, 185, 129)),
        ("Auto Save", (139, 92, 246)),
        ("100% Family Safe", (244, 63, 94)),
    ]
    bx = start_x
    by = 335
    for text, border_col in badges:
        bbox = font_badge.getbbox(text)
        bw = bbox[2] - bbox[0] + 24
        draw.rounded_rectangle([bx, by, bx + bw, by + 36], radius=18, fill=(20, 15, 45, 180), outline=(*border_col, 200), width=2)
        draw.text((bx + 12, by + 9), text, fill=(255, 255, 255, 255), font=font_badge)
        bx += bw + 12

    final_img = Image.alpha_composite(base, overlay)
    
    os.makedirs('store_assets', exist_ok=True)
    out_path = os.path.join('store_assets', 'feature_graphic.png')
    final_img.convert('RGB').save(out_path, 'PNG')
    print("Updated Feature Graphic saved to:", out_path)

if __name__ == '__main__':
    generate_feature_graphic()
