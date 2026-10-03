# Kaiser Hacks · GitHub Pages Deployment

> ⚡ **100% Free Hosting with Unlimited Bandwidth & Zero Credit Caps**

---

## 🚀 Quick Setup for GitHub Pages

### 1. Enable GitHub Pages
1. Go to repository **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Branch**:
   - Choose `main` branch.
   - Folder: `/ (root)`.
3. Click **Save**.
4. Your website will be live at:
   `https://<your-username>.github.io/<repo-name>/`

---

## 📦 How to Upload the Release ZIP (Unlimited Free Downloads)

1. Go to the **Releases** tab on the right side of this repository.
2. Click **Draft a new release**.
3. Tag: `v2.0` (Create tag `v2.0` on main).
4. Title: `Kaiser Aim Assist v2.0 (Clean Patch)`.
5. Drag and drop `KaiserAimAssist-v2.0.zip` into the **Attach binaries** box.
6. Click **Publish release**.
7. Copy the download link and paste it into [`drops-config.js`](drops-config.js) under `githubReleaseUrl`.

---

## 🛡️ "Failed - Virus detected" Explanation (Chrome / Edge)

If Chrome or Windows Defender flags the download:
- **Why**: Windows Attachment Manager queries Microsoft Defender Cloud Heuristics on incoming `.sys` kernel filter drivers from new builds (`Trojan:Win32/Wacatac` false positive).
- **Chrome Fix**: Press `Ctrl + J` (`chrome://downloads`) -> Click **"Download suspicious file"** / **"Keep anyway"**.
- **Windows Defender Fix**: Open **Windows Security** -> **Virus & threat protection** -> **Protection history** -> Click the item -> **Actions** -> **"Allow on device"**.
