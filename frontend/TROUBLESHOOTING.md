# Troubleshooting Guide - Unlayered Frontend

## Common Issues and Solutions

### 🐛 Build/Compilation Issues

#### Error: "cargo: command not found"
**Problem**: Rust is not installed (required for Tauri)

**Solution**:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -y
source "$HOME/.cargo/env"

# Verify installation
cargo --version
```

#### Error: "tailwindcss PostCSS plugin"
**Problem**: Old Tailwind PostCSS configuration

**Solution**: Already fixed! If you see this:
```bash
npm install -D @tailwindcss/postcss
```

Then ensure `postcss.config.js` has:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

#### Error: "Module not found: wavesurfer.js"
**Problem**: Missing dependencies

**Solution**:
```bash
cd frontend
npm install
```

---

### 🖥️ Runtime Issues

#### Blank white screen in browser
**Possible causes**:
1. JavaScript errors in console
2. CSS not loading
3. Build issue

**Solutions**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
4. Clear cache and restart dev server:
   ```bash
   npm run dev
   ```

#### Waveforms not displaying
**Problem**: Canvas rendering issue

**Check**:
1. Browser supports Canvas API (all modern browsers do)
2. No console errors
3. Mock data is loading correctly

**Solution**:
```bash
# Restart dev server
npm run dev
```

#### Playback not working
**Expected behavior**: This is normal for MVP!
- Playback is **simulated** (timer moves, playhead moves)
- No actual audio plays yet
- This is intentional - audio playback requires Web Audio API integration

---

### 🚀 Tauri-Specific Issues

#### First Tauri build is very slow
**This is normal!**
- First build: 5-10 minutes (compiling 394 Rust packages)
- Subsequent builds: 10-30 seconds
- Be patient on first run

#### Tauri window doesn't open
**Solutions**:
1. Check terminal for error messages
2. Ensure Vite dev server is running (http://localhost:5173)
3. Try:
   ```bash
   # Kill any existing processes
   pkill -f tauri

   # Restart
   npm run tauri:dev
   ```

#### Error: "failed to run 'cargo metadata'"
**Problem**: Rust not in PATH

**Solution**:
```bash
source "$HOME/.cargo/env"
npm run tauri:dev
```

---

### 🎨 Styling Issues

#### Tailwind classes not working
**Problem**: Tailwind not compiling

**Solutions**:
1. Check `postcss.config.js` exists
2. Verify `tailwind.config.js` exists
3. Ensure `index.css` has Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
4. Restart dev server

#### Colors look wrong
**Check**: `tailwind.config.js` has custom colors:
```javascript
colors: {
  'waveform': {
    'vocals': '#4ade80',
    'guitar': '#f97316',
    'drums': '#3b82f6',
    'bass': '#a855f7',
    'other': '#64748b',
    'combined': '#06b6d4',
  }
}
```

---

### 📦 Dependency Issues

#### npm install fails
**Solutions**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node version:
   ```bash
   node --version
   # Should be 20.17+ (warnings are OK)
   ```

#### Version conflicts
**Solution**: Delete and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### 🔧 Development Issues

#### Hot reload not working
**Solutions**:
1. Save the file again
2. Restart dev server: `npm run dev`
3. Hard refresh browser: `Cmd+Shift+R`

#### Port 5173 already in use
**Solution**:
```bash
# Find and kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

#### Changes not reflecting
**Solutions**:
1. Clear browser cache
2. Check if you're editing the right file
3. Restart dev server
4. Check for TypeScript errors in terminal

---

### 🎵 Feature-Specific Issues

#### "Click to traverse song" not working
**Expected behavior**:
- Should work on all waveforms
- Clicking sets playback position
- If not working, check browser console for errors

**Debug**:
```typescript
// In WaveformDisplay.tsx, add console.log:
const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
  console.log('Clicked at', e.clientX, e.clientY);
  // ... rest of function
};
```

#### Stems not reordering when muted
**Check**:
1. Is the stem actually muted? (button should be red)
2. Check browser console for errors
3. Verify `sortedStems` in App.tsx is working

**Debug**:
```typescript
// In App.tsx, add:
console.log('Sorted stems:', sortedStems.map(s =>
  ({ label: s.label, muted: s.isMuted, order: sortedStems.indexOf(s) })
));
```

#### AI insights not showing
**Check**:
1. `mockAIInsight` is imported in App.tsx
2. Verify AIInsights component is rendered
3. Check props are passed correctly

---

### 🧪 Testing Issues

#### Mock data not loading
**Solution**:
```bash
# Verify mock data exists
ls src/utils/mockData.ts

# Check imports in App.tsx
grep "mockData" src/App.tsx
```

#### Want to test file upload screen?
**How**:
```typescript
// In App.tsx, line ~15, change:
const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
// Instead of:
const [audioFile, setAudioFile] = useState<AudioFile | null>(mockAudioFile);
```

---

### 🖱️ Interaction Issues

#### Sliders not responding
**Check**:
1. Is the stem muted? (volume slider disabled when muted)
2. Browser console for errors
3. Try another slider

#### Solo button not working
**Expected behavior**:
- Click solo on Stem A → All others muted
- Click solo again → All unmuted
- Only one stem can be solo at a time

**Debug**: Check `handleToggleSolo` in App.tsx

---

### 💻 Performance Issues

#### Slow rendering
**Solutions**:
1. Check CPU usage in Activity Monitor
2. Try fewer waveform data points:
   ```typescript
   // In mockData.ts
   generateWaveformData(500) // Instead of 1000
   ```
3. Close other tabs/applications

#### Choppy animations
**Check**:
1. GPU acceleration enabled in browser
2. No heavy background processes
3. Try Chrome (best Canvas performance)

---

### 🌐 Browser Compatibility

#### Works best in:
- ✅ Chrome 100+
- ✅ Edge 100+
- ✅ Safari 15+
- ✅ Firefox 100+

#### Known issues:
- Older browsers: Canvas performance may be slower
- Internet Explorer: Not supported (use modern browser)

---

### 📱 Desktop App Issues

#### Tauri window is too small/large
**Solution**: Edit `src-tauri/tauri.conf.json`:
```json
{
  "tauri": {
    "windows": [{
      "width": 1400,
      "height": 900,
      "minWidth": 1200,
      "minHeight": 700
    }]
  }
}
```

#### App won't close properly
**Solution**:
```bash
pkill -f "app" # or your app name
```

---

### 🔍 Debugging Tips

#### Enable verbose logging
```bash
# Tauri
RUST_LOG=debug npm run tauri:dev

# Vite
npm run dev -- --debug
```

#### Check browser console
1. Open DevTools: `F12` or `Cmd+Option+I`
2. Look for red errors
3. Check Network tab for failed requests

#### Common console errors and fixes:

**"Cannot find module './components/XYZ'"**
→ Check file exists and import path is correct

**"undefined is not a function"**
→ Check component is exported correctly

**"Maximum update depth exceeded"**
→ Check useEffect dependencies, avoid infinite loops

---

### 🆘 Still Stuck?

1. **Check browser console** for error messages
2. **Restart dev server**: `npm run dev`
3. **Clear cache**: Delete `node_modules`, `npm install`
4. **Check this doc**: Most issues are covered here
5. **Read FRONTEND_GUIDE.md**: More detailed info
6. **Ask the team**:
   - UI issues → Frontend developer
   - Audio playback → Fullstack developer
   - Backend → Evan (but he shouldn't need to!)

---

## Quick Fixes Checklist

Before asking for help, try:
- [ ] Restart dev server
- [ ] Hard refresh browser (Cmd+Shift+R)
- [ ] Check browser console for errors
- [ ] Verify all dependencies installed (`npm install`)
- [ ] Check you're on correct branch
- [ ] Try `rm -rf node_modules && npm install`
- [ ] Read error message carefully
- [ ] Check this troubleshooting guide

---

## Environment Info

To report an issue, include:
```bash
node --version
npm --version
cargo --version  # If using Tauri
rustc --version  # If using Tauri

# OS
uname -a

# Browser
# (e.g., Chrome 120, Safari 17, etc.)
```

---

**Most issues have simple fixes - don't panic!** 🎉

The app is solid and well-tested. If something isn't working, it's usually a missing dependency or simple configuration issue.

**Happy debugging!** 🐛→✨
