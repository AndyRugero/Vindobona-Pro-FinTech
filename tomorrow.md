# 🗓️ Tomorrow's Agenda: UI Styling, Nginx & Enterprise Documentation

This guide outlines our plan for tomorrow to apply the honeycomb pattern globally, learn CSS image treatments, configure Nginx reverse proxy routing, and professionally document your fintech banking project.

---

## 📋 Tomorrow's Tasks

### 1. Apply Honeycomb Background Globally
*   **Target**: Extend the tech background from the login screen (`AuthScreen`) to the entire dashboard container (`.app-shell` and dashboard views).
*   **CSS Files to modify**: `src/App.css`, `src/Styles/FXConverter.css`, and other layout style sheets.

### 2. Learn CSS Background Techniques
*   Experiment with different ways to stretch, position, color, and overlay background images.

### 3. Nginx Web Server & Reverse Proxy Setup (Lesson 56b)
*   **Goal**: Learn how Nginx acts as a gatekeeper (reverse proxy) to route frontend (`/`) and API backend (`/api`) requests securely on a single port.
*   **Practice**: Configure a local `nginx.conf` file to understand server blocks, proxies, and headers.

### 4. Professional Developer Documentation (Lesson 50b)
*   **Goal**: Write a professional, bank-grade `README.md` and system architecture guide for your CV.
*   **Content**: Document the multi-currency architecture, secure 2FA authentication, Google OAuth setup, Docker containerization, Azure deployment pipeline, and API endpoints.

---

## 🎨 How We Created the Honeycomb Image
The honeycomb background image was **generated on-demand using AI image generation** with the following prompt:
> *"A high-tech dark honeycomb grid pattern, with glowing subtle gold or blue outlines, fading out into solid deep dark slate-blue (#050a18) towards the bottom and sides, premium digital banking aesthetic, minimal, clean, only the background pattern itself."*

It is saved directly in your codebase at:
*   [public/honeycomb.png](file:///c:/Vindobona-Pro-FinTech/public/honeycomb.png)

### Where to find similar patterns online:
*   **Hero Patterns** ([heropatterns.com](https://heropatterns.com/)): A collection of free, customizable SVG background patterns.
*   **Subtle Patterns** ([toptal.com/designers/subtlepatterns/](https://www.toptal.com/designers/subtlepatterns/)): A massive library of clean, tiled background textures.
*   **SVG Backgrounds** ([svgbackgrounds.com](https://www.svgbackgrounds.com/)): Generates modern SVG patterns and gradients.
*   **Unsplash / Freepik**: Search for "dark abstract technology pattern" or "cyberpunk grid background".

---

## 📘 CSS Background Image Cheat-Sheet

Here are the different styling techniques we will study and apply tomorrow:

### 1. Background Sizing (`background-size`)
Controls how the image is scaled to fit the container.
*   `background-size: cover;` *(Recommended)*: Scales the image so it covers the entire container. Some parts of the image might get cropped to maintain the aspect ratio.
*   `background-size: contain;`: Scales the image so it fits completely inside the container without cropping (might leave empty space on the sides).
*   `background-size: 100% 100%;`: Stretches the image to fill the exact width and height (can distort the image).
*   `background-size: auto;`: Renders the image at its original natural size.

### 2. Background Position (`background-position`)
Controls the starting position of the background image.
*   `background-position: center;`: Centers the image horizontally and vertically.
*   `background-position: top center;` / `background-position: bottom right;`: Aligns to specific edges.
*   `background-position: 50% 20%;`: Moves the image using precise percentage offsets.

### 3. Background Repeating (`background-repeat`)
Controls whether the image tiles (repeats) if it is smaller than the container.
*   `background-repeat: no-repeat;` *(Recommended for large backgrounds)*: Shows the image only once.
*   `background-repeat: repeat;`: Tiles the image both horizontally and vertically.
*   `background-repeat: repeat-x;` / `repeat-y;`: Tiles in one direction only.

### 4. Layering Gradients on Top of Images
This is how we make sure background images don't make text unreadable. By layering a semi-transparent radial or linear gradient on top, we darken the image.
```css
background-image: 
    linear-gradient(to bottom, rgba(5, 10, 24, 0.4), rgba(5, 10, 24, 0.95)), 
    url('/honeycomb.png');
```
*Note: The first item in the list is always rendered on top.*

### 5. Parallax Effect (`background-attachment`)
Makes the background image stay fixed in place while the page content scrolls over it.
```css
background-attachment: fixed;
```

### 6. Image Filters (`filter`)
You can apply image adjustments directly in CSS without editing the image file!
```css
/* Examples to apply directly to an image element or overlay */
filter: blur(8px);          /* Blurs the background */
filter: brightness(0.5);   /* Dims the image by 50% */
filter: contrast(1.2);     /* Boosts colors and lines */
filter: grayscale(100%);   /* Removes all color */
```

### 7. Glassmorphism Overlays (`backdrop-filter`)
Makes foreground cards look like frosted glass sitting on top of the honeycomb background.
```css
.auth-card, .dashboard-card {
    background: rgba(10, 15, 30, 0.6); /* Semi-transparent background */
    backdrop-filter: blur(12px);       /* Blurs the honeycomb behind the card */
    -webkit-backdrop-filter: blur(12px); /* Safari support */
    border: 1px solid rgba(255, 255, 255, 0.05);
}
```
