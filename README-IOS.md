# Neon Pong on your iPhone (sideload, no Mac needed)

This branch (`ios-build`) wraps the web game as a real iPhone app. Codemagic builds it on a free cloud Mac, and **Sideloadly** installs it from your Windows PC. The web game itself is unchanged, apart from two small fixes: proper mobile page tags, and an audio fallback for older iPhones.

## 1. Build the app on Codemagic (about 10 min the first time)

1. Go to **codemagic.io** and sign up with your GitHub account (the free personal plan is enough).
2. **Add application**, pick GitHub, then choose `neonpong-play`. When it asks, pick **codemagic.yaml** as the configuration.
3. **Start new build**. Set the branch to `ios-build` and the workflow to **iOS sideload build**.
4. Wait about 5–10 minutes. When it's green, download **`NeonPong-unsigned.ipa`** from the build's Artifacts.

## 2. Install it with Sideloadly (Windows)

1. Install **iTunes** and **iCloud** from Apple's website, *not* the Microsoft Store versions. Sideloadly needs them to talk to the iPhone.
2. Install **Sideloadly** from sideloadly.io.
3. Plug in your iPhone with a cable, unlock it, and tap **Trust This Computer**.
4. Drag `NeonPong-unsigned.ipa` into Sideloadly, type your Apple ID email, and click **Start**. It signs the app with your Apple ID.
5. On the iPhone:
   - Go to **Settings → Privacy & Security → Developer Mode**, turn it on, and restart.
   - Then go to **Settings → General → VPN & Device Management**, tap your Apple ID, and tap **Trust**.
6. Open **Neon Pong** from your home screen.

## Good to know

- **7-day limit:** with a free Apple ID the app stops opening after 7 days. Plug in and hit Start in Sideloadly again (about a minute), or use **AltStore**, which refreshes it automatically over Wi-Fi. Your save data survives re-installs as long as you don't delete the app.
- **3-app limit:** a free Apple ID can have only 3 sideloaded apps at a time.
- **No sound?** Check the silent switch on the side of the phone. The app respects silent mode, like most games.
- **Rebuilding after changes:** push to `ios-build` (or merge `main` into it), then start a new Codemagic build. Each build uses about 5–10 of your 500 free minutes a month.
- **No expiry:** the $99/yr Apple Developer Program lets you use TestFlight instead (builds last 90 days, installed wirelessly). That needs code signing added to `codemagic.yaml`.
