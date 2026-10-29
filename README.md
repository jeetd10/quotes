# The Anthology of Devotion & Longing
### 100 Original Literary Prose Passages on Love (~70–80 Words Each)

A curated, elegant, editorial-grade web application containing **100 multi-sentence literary passages** exploring the depths of connection, patience, tender silence, and building a lifetime together.

---

## ✦ Key Highlights & Integrity Note
* **100 Original Literary Passages**: Every passage is a longer multi-sentence meditation (averaging **70–80 words** each), avoiding hollow one-liners.
* **Honest Attribution**: All 100 passages are original literary-style writing and are clearly labelled as original literary prose rather than being falsely attributed to classic authors.
* **6 Curated Core Themes**:
  1. **Devotion** (17 passages) — Unwavering loyalty, quiet sanctuary, and intentional daily presence.
  2. **Longing & Distance** (17 passages) — The geometry of separation, unwritten letters, and the sweetest proof of home.
  3. **Soulmates & Serendipity** (17 passages) — Ancient familiarity, parallel rivers converging, and quiet destiny.
  4. **Tenderness & Quiet Moments** (17 passages) — Morning light, steaming tea, shared umbrellas, and gentle silence.
  5. **Commitment & Enduring Love** (16 passages) — Weathered oak, bedrock beneath shifting moods, and lifelong covenants.
  6. **Building a Future Together** (16 passages) — Blueprints of tomorrow, planting trees for old age, and unwritten libraries.

---

## 🛠 Features Included
- 🔍 **Instant Real-Time Search**: Search through titles, body prose, and emotional keywords with zero lag.
- 🏷 **Thematic Filtering**: Quick pill tabs for each of the 6 categories, plus live counts.
- ♥ **Saved Favourites**: Star your favorite passages; saved instantly to browser `localStorage`.
- ✎ **Personal Reflections & Notes**: Write your own private thoughts, memories, or reflections under each passage with live auto-save.
- 📂 **Passages with Notes Filter**: Instantly isolate only the passages you have journaled on.
- 🎲 **Random Passage Spotlight Modal**: Dimmed backdrop spotlight card with one-click "Another Random" shuffle.
- 📋 **One-Click Copy**: Cleanly copies the passage, title, and attribution with toast feedback.
- 🖼 **Aesthetic Quote Card Image Generator**: Uses native offline HTML5 Canvas to render a gorgeous high-resolution 1200×900 postcard PNG ready to save or share.
- ♫ **Procedural Ambient Chimes**: Built with the native Web Audio API to play gentle, soothing pentatonic chimes in the background (no heavy external audio files needed).
- 🌓 **Warm Linen & Midnight Velvet Modes**: Seamless toggle between warm editorial parchment and dark velvet theme.
- 📥 **Export Reflections**: Download all your personal notes and starred quotes as a clean Markdown (`.md`) journal.

---

## 🚀 How to Open in VS Code on Mac & Run on Localhost

### 1. Unzip the Project
- If downloaded as a ZIP file, simply double-click `love-quotes-website.zip` in Finder to extract it.
- Or open your Mac **Terminal** and run:
  ```bash
  unzip love-quotes-website.zip
  cd love-quotes-website
  ```

### 2. Open in VS Code
- Open VS Code, select **File > Open Folder...**, and select the `love-quotes-website` folder.
- Or from Terminal inside the folder:
  ```bash
  code .
  ```

### 3. Run on Localhost (Choose any method below):

#### **Method A: Python 3 (Fastest, built into macOS)**
Every Mac comes with Python. Open the Terminal inside VS Code (press `` Ctrl + ` `` or go to **Terminal > New Terminal**) and run:
```bash
python3 -m http.server 8000
```
Then open your browser and visit:
👉 **`http://localhost:8000`**

#### **Method B: VS Code Live Server Extension**
1. In VS Code, go to the Extensions tab (`Cmd + Shift + X`).
2. Search for **Live Server** (by Ritwick Dey) and click **Install**.
3. Right-click on `index.html` in the file explorer and select **Open with Live Server**.
4. It will immediately launch on `http://127.0.0.1:5500/index.html` with auto-reload!

#### **Method C: Direct Browser Open (Offline)**
Because this website uses pure vanilla HTML, modern CSS, and JavaScript with zero external build steps or dependencies, you can also simply double-click `index.html` directly to open it in Safari or Chrome!

---

## 📁 File Structure
```text
love-quotes-website/
├── index.html         # Semantic, accessible HTML5 layout
├── css/
│   └── style.css      # Editorial styling, typography, dark/light themes, animations
├── js/
│   ├── data.js        # 100 complete original passages (~70-80 words each)
│   └── app.js         # Search, filters, notes, favorites, audio & canvas export
└── README.md          # Guide & documentation
```

Enjoy reading, reflecting, and journaling!
