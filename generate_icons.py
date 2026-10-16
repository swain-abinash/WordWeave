import os
from PIL import Image, ImageDraw

def render_wordweave_icon_hires(target_size, is_round=False):
    # Render at 4x supersampling for ultra-crisp antialiasing
    scale = 4
    W = target_size * scale
    H = target_size * scale
    
    c1 = (146, 119, 255)  # #9277FF
    c2 = (90, 59, 230)    # #5A3BE6
    
    pad = int(W * 0.04)
    icon_w = W - 2 * pad
    icon_h = H - 2 * pad
    
    # 1. Gradient
    data = bytearray(icon_w * icon_h * 4)
    idx = 0
    for y in range(icon_h):
        ty = y / max(1, icon_h - 1)
        for x in range(icon_w):
            tx = x / max(1, icon_w - 1)
            t = (tx + ty) / 2.0
            data[idx] = int(c1[0] + (c2[0] - c1[0]) * t)
            data[idx+1] = int(c1[1] + (c2[1] - c1[1]) * t)
            data[idx+2] = int(c1[2] + (c2[2] - c1[2]) * t)
            data[idx+3] = 255
            idx += 4
    grad_img = Image.frombytes('RGBA', (icon_w, icon_h), bytes(data))
    
    # 2. Mask
    mask = Image.new('L', (icon_w, icon_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    if is_round:
        mask_draw.ellipse([0, 0, icon_w, icon_h], fill=255)
    else:
        radius = int(icon_w * (6.5 / 24.0))
        mask_draw.rounded_rectangle([0, 0, icon_w, icon_h], radius=radius, fill=255)
        
    grad_img.putalpha(mask)
    
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    canvas.paste(grad_img, (pad, pad), grad_img)
    draw = ImageDraw.Draw(canvas)
    
    # 3. Brand Mark
    def to_canvas(vx, vy):
        cx = pad + (vx / 24.0) * icon_w
        cy = pad + (vy / 24.0) * icon_h
        return cx, cy

    v_points = [(6, 6), (6, 18), (12, 18), (12, 6), (18, 6), (18, 18)]
    canvas_points = [to_canvas(vx, vy) for vx, vy in v_points]
    
    stroke_w = int(icon_w * (2.4 / 24.0))
    
    # Draw path
    for i in range(len(canvas_points) - 1):
        p1 = canvas_points[i]
        p2 = canvas_points[i+1]
        draw.line([p1, p2], fill=(255, 255, 255, 255), width=stroke_w)
    
    for pt in canvas_points:
        r_joint = stroke_w / 2.0
        draw.ellipse([pt[0] - r_joint, pt[1] - r_joint, pt[0] + r_joint, pt[1] + r_joint], fill=(255, 255, 255, 255))
        
    # 9 nodes
    r_node = icon_w * (1.9 / 24.0)
    for vx in [6, 12, 18]:
        for vy in [6, 12, 18]:
            cx, cy = to_canvas(vx, vy)
            draw.ellipse([cx - r_node, cy - r_node, cx + r_node, cy + r_node], fill=(255, 255, 255, 255))
            
    # Golden node at (18, 18)
    r_gold = icon_w * (2.6 / 24.0)
    gx, gy = to_canvas(18, 18)
    draw.ellipse([gx - r_gold, gy - r_gold, gx + r_gold, gy + r_gold], fill=(255, 201, 74, 255))
    
    # Downsample with Lanczos to final target size
    return canvas.resize((target_size, target_size), Image.Resampling.LANCZOS)

DENSITIES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

BASE_RES_DIR = os.path.join('android', 'app', 'src', 'main', 'res')

for folder, size in DENSITIES.items():
    target_dir = os.path.join(BASE_RES_DIR, folder)
    os.makedirs(target_dir, exist_ok=True)
    
    # Render square icon
    sq = render_wordweave_icon_hires(size, is_round=False)
    sq_path = os.path.join(target_dir, 'ic_launcher.png')
    sq.save(sq_path, 'PNG')
    
    # Render round icon
    rd = render_wordweave_icon_hires(size, is_round=True)
    rd_path = os.path.join(target_dir, 'ic_launcher_round.png')
    rd.save(rd_path, 'PNG')
    
    print(f"Generated {folder}: {size}x{size} (square & round)")

# Play Store web icon (512x512)
web_icon = render_wordweave_icon_hires(512, is_round=False)
web_icon.save(os.path.join(BASE_RES_DIR, 'ic_launcher-web.png'), 'PNG')
print("Generated Play Store 512x512 ic_launcher-web.png")
