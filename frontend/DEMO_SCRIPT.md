# 🎬 Unlayered Demo Script

## How to Show Off Your Music Stem Separator MVP

This script will help you give an impressive demo of the Unlayered frontend to your team, stakeholders, or investors.

---

## 🚀 Pre-Demo Setup (5 minutes)

### 1. Start the App
```bash
cd frontend
npm run dev
```

Wait for: "ready in XXX ms" message
Open: http://localhost:5173

### 2. Verify Everything Loads
✅ Should see: Song name "Midnight Dreams"
✅ Should see: 5 colored waveforms
✅ Should see: AI Insights panel on right
✅ No red errors in console (F12)

### 3. Reset to Default State
If you've been testing, refresh the page to reset everything:
- Press `Cmd+R` (Mac) or `Ctrl+R` (Windows)
- All stems should be unmuted
- Playback should be at 00:00:00

---

## 🎭 Demo Script (5-7 minutes)

### Part 1: Introduction (30 seconds)

**Say**:
> "This is Unlayered - a new way to listen to music. It's a desktop app that separates any song into individual stems - vocals, instruments, drums, bass - and lets you control each one independently."

**Show**:
- Point to the screen
- Gesture toward the waveforms
- Highlight the colorful interface

---

### Part 2: The Interface (1 minute)

**Say**:
> "Here's the main interface. At the top we have our playback controls and the song info."

**Show**:
- Point to Play button
- Point to "Midnight Dreams by The Synthwave Collective"
- Point to the timer (00:00:00)

**Say**:
> "Below that is the combined waveform showing the full stereo mix of the song."

**Show**:
- Hover over the cyan combined waveform
- Point out "Both mixes in one waveform" label

**Say**:
> "And here are the individual stems, each with their own waveform visualization."

**Show**:
- Point to each stem (Vocals, Guitar, Drums, Bass, Other)
- Note the color coding: Green vocals, orange guitar, blue drums, purple bass

**Say**:
> "On the right, we have AI-generated insights about the song - genre, mood, tempo, and a description."

**Show**:
- Scroll through AI panel
- Read a snippet: "A dreamy synthwave track..."

---

### Part 3: Playback (1 minute)

**Say**:
> "Let's play the song and watch the magic happen."

**Do**:
1. Click the **Play button** (▶️)

**Show**:
- Timer starts counting: 00:00:01, 00:00:02...
- Red playhead line moves across ALL waveforms
- Waveforms light up as they're "played"

**Say**:
> "Notice how the playhead syncs across all stems, and you can see which parts of the song are currently playing."

**Do**:
2. Let it play for 5-10 seconds
3. Click **Pause** (⏸️)

---

### Part 4: Stem Control (2 minutes)

#### Mute Demonstration

**Say**:
> "Here's where it gets interesting. Let's mute the vocals."

**Do**:
1. Click the **Mute button** on Vocals (should turn red with an X icon)

**Show**:
- Vocals track slides smoothly to the bottom
- Other tracks stay in place
- Volume slider grays out

**Say**:
> "The track automatically reorders itself - muted tracks sink to the bottom. This keeps your active stems at the top where you can easily control them."

**Do**:
2. Unmute Vocals (click Mute button again)

**Show**:
- Vocals slides back up to the top
- Smooth animation

#### Volume Control

**Say**:
> "Each stem has independent volume control."

**Do**:
1. Drag the **Guitar volume slider** down to ~30%
2. Drag it back up to ~70%

**Show**:
- Number changes: 70 → 30 → 70
- Smooth slider movement

#### Pan Control

**Say**:
> "And you can position each stem in the stereo field - left, center, or right."

**Do**:
1. Drag **Bass pan slider** left (shows "L5" or similar)
2. Center it again (shows "C")
3. Drag right (shows "R5")

**Show**:
- Label changes: C → L5 → R5

#### Solo Feature

**Say**:
> "The Solo button lets you isolate a single stem to hear it alone."

**Do**:
1. Click **Solo button** on Drums (should turn yellow)

**Show**:
- All other stems automatically muted
- Drums is the only active track

**Do**:
2. Click Solo again to unsolo

**Show**:
- All tracks return to active state

---

### Part 5: Interactive Waveforms (1 minute)

**Say**:
> "The waveforms aren't just for show - they're fully interactive."

**Do**:
1. **Hover** over the combined waveform
2. See the message: "Click to traverse song"

**Say**:
> "You can click anywhere on a waveform to jump to that point in the song."

**Do**:
1. Click near the **middle** of the combined waveform

**Show**:
- Playhead jumps immediately
- Timer updates (e.g., 00:02:15)
- All waveforms update in sync

**Do**:
2. Click the **Play button** to continue from that point
3. Let it play for a few seconds

---

### Part 6: Peak Detection (30 seconds)

**Say**:
> "The app even detects the loudest parts of the song."

**Do**:
1. Scrub to around **30 seconds** (click on waveform)
2. Play and watch carefully

**Show**:
- If you hit a peak, there's a brief **yellow flash** across the waveform
- This indicates a particularly loud or impactful moment

**Note**: Peaks occur every ~30 seconds in the mock data. If you miss it, scrub ahead and try again.

---

### Part 7: Dynamic Ordering Demo (1 minute)

**Say**:
> "Let me show you something cool about the automatic track ordering."

**Do**:
1. **Mute** Bass
2. **Mute** Guitar
3. **Mute** Other

**Show**:
- All three muted tracks slide to the bottom
- Vocals and Drums stay at top
- Smooth, staggered animation

**Say**:
> "The app automatically keeps your active tracks at the top, so you don't have to manually reorganize."

**Do**:
4. Unmute everything

**Show**:
- Tracks slide back up
- Resume original order

---

### Part 8: AI Insights (30 seconds)

**Say**:
> "The AI analysis gives you instant insights about any song."

**Show**:
- Point to right panel
- Read key details:
  - Genre: "Synthwave / Electronic"
  - Mood: "Nostalgic, Dreamy"
  - Tempo: "118 BPM"
  - Key: "A Minor"

**Say**:
> "This is generated automatically and helps you understand the song's characteristics at a glance."

**Read the footer**:
> "And yes, that note at the bottom says 'Evan gets to figure this out' - that's our backend developer's job!"

*(laugh)*

---

### Part 9: File Upload (30 seconds)

**Say**:
> "Of course, this is just demo data. The real app will let you upload any audio file."

**Do**:
1. Open DevTools Console (F12)
2. In console, type:
   ```javascript
   // Show upload screen by clearing audio file
   // (or just explain verbally)
   ```

**Say**:
> "You'll drag and drop any MP3, WAV, or FLAC file, and the backend will separate it using Demucs - a state-of-the-art AI model."

**Note**: Don't actually break the current demo - just describe this verbally.

---

### Part 10: Wrap-up (30 seconds)

**Say**:
> "So that's Unlayered - a music stem separator that gives you complete control over every element of a song."

**Recap**:
- Automatic stem separation
- Individual volume and pan control
- Interactive waveforms
- AI-powered insights
- Clean, professional interface

**Say**:
> "This is our MVP frontend. The backend integration is next, and once that's done, you'll be able to upload real songs and hear actual separated stems through your speakers."

---

## 🎯 Key Talking Points

### What to Emphasize:
1. ✅ **Professional UI** - Looks like a real audio production tool
2. ✅ **Interactive** - Everything responds in real-time
3. ✅ **Smart** - Automatic track reordering, AI insights
4. ✅ **Visual** - Beautiful waveform visualization
5. ✅ **Intuitive** - No learning curve, just click and play

### What to Downplay:
- ❌ "This is just mock data" - Say it once, move on
- ❌ "The audio doesn't actually play" - Mention briefly
- ❌ "Still needs backend" - Yes, but focus on what WORKS

### Pro Tips:
- **Be confident** - The UI is genuinely impressive
- **Show, don't tell** - Let the animations speak for themselves
- **Interact naturally** - Don't rush, let transitions complete
- **Handle questions** - "Great question! Let me show you..."

---

## 🎤 Handling Common Questions

**Q: "Does it actually separate the music?"**
A: "Not yet - this is the frontend MVP. The backend uses Demucs, which is the same AI model used by professional tools like LALAL.AI. We're integrating that next."

**Q: "Can I upload my own songs?"**
A: "Absolutely - once we connect the backend. The UI is ready, we just need to wire up the file processing pipeline."

**Q: "Why can't I hear the audio?"**
A: "Good eye! The actual audio playback requires Web Audio API integration - that's our fullstack developer's next task. Right now we're showing the UI and controls working perfectly."

**Q: "How long does separation take?"**
A: "Depends on the song length and your hardware. Typically 30 seconds to 2 minutes for a 3-minute song. We'll show a progress bar during processing."

**Q: "What formats does it support?"**
A: "MP3, WAV, FLAC, and most common audio formats. The file upload component checks this automatically."

**Q: "Can I export the separated stems?"**
A: "That feature is planned for the next phase, but yes - you'll be able to download each stem as a separate file."

---

## 🎬 Demo Variations

### Quick Demo (2 minutes)
1. Show interface (15s)
2. Play/pause (15s)
3. Mute one stem → watch it reorder (30s)
4. Adjust volume slider (15s)
5. Click waveform to scrub (15s)
6. Show AI insights (30s)

### Full Demo (5-7 minutes)
Use the full script above

### Technical Demo (10 minutes)
Full script + dive into:
- Component architecture
- State management
- Canvas rendering
- TypeScript types
- Backend integration points

---

## 📸 Screenshot Opportunities

Take screenshots of:
1. **Full interface** - Overview shot
2. **Playing state** - Playhead moving
3. **Muted track** - At bottom with red button
4. **AI insights** - Close-up of panel
5. **Solo mode** - One track active
6. **Volume adjustments** - Sliders in different positions

Use for:
- Project documentation
- Team presentations
- Investor pitches
- Portfolio pieces

---

## 🎉 Closing Lines

**Confident Close**:
> "And that's Unlayered. A completely new way to experience music, built with modern web technologies and ready for production."

**Call to Action**:
> "Next steps are backend integration and audio playback. We're on track to have a fully functional demo by [date]."

**Humble Close**:
> "This is just the beginning - there's a lot more we can do with this foundation."

**Pick what fits your audience!**

---

## ✅ Pre-Demo Checklist

Before you present:
- [ ] Dev server running (npm run dev)
- [ ] No console errors (check F12)
- [ ] Browser is full screen or large window
- [ ] Close distracting tabs/apps
- [ ] Zoom is at 100% (Cmd+0)
- [ ] Practice the demo once
- [ ] Have a backup plan if internet fails
- [ ] Know your talking points
- [ ] Smile! 😊

---

**You're ready to wow your audience!** 🎵✨

Remember: The UI is genuinely impressive. Let it speak for itself, be confident, and have fun showing off your work!

**Break a leg!** 🎬
