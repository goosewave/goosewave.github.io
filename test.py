import tkinter as tk

# ------------------------------
# Lab -> XYZ -> sRGB conversion
# ------------------------------
def lab_to_xyz(L, a, b):
    """Converts CIE Lab to XYZ (D65)."""
    # Scale L*, a*, b*
    y = (L + 16) / 116
    x = a / 500 + y
    z = y - b / 200

    # Helper
    def f_inv(t):
        delta = 6 / 29
        if t > delta:
            return t**3
        return 3 * (delta**2) * (t - 4/29)

    x = 0.95047 * f_inv(x)  # D65 reference white
    y = 1.00000 * f_inv(y)
    z = 1.08883 * f_inv(z)
    return (x, y, z)

def xyz_to_srgb(x, y, z):
    """Converts XYZ to gamma-corrected sRGB in [0..1]."""
    # XYZ -> Linear RGB
    r_lin =  3.2406 * x - 1.5372 * y - 0.4986 * z
    g_lin = -0.9689 * x + 1.8758 * y + 0.0415 * z
    b_lin =  0.0557 * x - 0.2040 * y + 1.0570 * z

    # Linear -> Gamma-corrected (sRGB)
    def gamma_correct(c):
        return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1/2.4)) - 0.055

    r = gamma_correct(r_lin)
    g = gamma_correct(g_lin)
    b = gamma_correct(b_lin)

    # Clamp to [0..1]
    return (max(0, min(1, r)),
            max(0, min(1, g)),
            max(0, min(1, b)))

def lab_to_srgb(L, a, b):
    x, y, z = lab_to_xyz(L, a, b)
    return xyz_to_srgb(x, y, z)

# ------------------------------
# Convert (u,v,w) -> Lab -> sRGB
# ------------------------------
def get_skin_tone(u, v, w):
    """
    Map [0..1] x 3 -> L*, a*, b* using an expanded region
    to capture both light and very dark skin tones.
    """
    # Expanded bounding region for a broader set of undertones:
    #   L in [10..90]  (darker to lighter)
    #   a in [0..30]   (greenish to reddish)
    #   b in [10..40]  (bluish to yellowish)
    L_min, L_max = 10, 90
    a_min, a_max =  0, 30
    b_min, b_max = 10, 40

    L = L_min + u * (L_max - L_min)
    A = a_min + v * (a_max - a_min)
    B = b_min + w * (b_max - b_min)

    r, g, b = lab_to_srgb(L, A, B)
    # Convert floats [0..1] to #RRGGBB
    return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"

# ------------------------------
# Tkinter App
# ------------------------------
class SkinToneApp:
    def __init__(self, master):
        self.master = master
        master.title("3D Skin Tone Demo")

        # Slider 1 (u): Lightness
        self.slider_u = tk.Scale(
            master, from_=0, to=100, orient=tk.HORIZONTAL,
            label="Dark <---------> Light (L*)",
            command=self.update_color
        )
        self.slider_u.pack()

        # Slider 2 (v): Undertone, roughly green <-> red
        self.slider_v = tk.Scale(
            master, from_=0, to=100, orient=tk.HORIZONTAL,
            label="Cool/Pink <-> Warm/Red (a*)",
            command=self.update_color
        )
        self.slider_v.pack()

        # Slider 3 (w): Undertone, roughly blue <-> yellow
        self.slider_w = tk.Scale(
            master, from_=0, to=100, orient=tk.HORIZONTAL,
            label="More Blue <-> More Yellow (b*)",
            command=self.update_color
        )
        self.slider_w.pack()

        # A small box or canvas for preview
        self.preview = tk.Label(master, text="Color Preview", width=20, height=2)
        self.preview.pack(pady=10)

        # Initialize sliders to midpoints
        self.slider_u.set(50)
        self.slider_v.set(50)
        self.slider_w.set(50)
        self.update_color(None)

    def update_color(self, event):
        u = self.slider_u.get() / 100.0
        v = self.slider_v.get() / 100.0
        w = self.slider_w.get() / 100.0

        color_hex = get_skin_tone(u, v, w)
        self.preview.config(bg=color_hex)

if __name__ == "__main__":
    root = tk.Tk()
    app = SkinToneApp(root)
    root.mainloop()
