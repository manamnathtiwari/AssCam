<div align="center">

<!-- Animated Typing Header -->
<a href="#">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=800&size=46&pause=1000&color=6B9DFF&center=true&vCenter=true&width=800&height=120&lines=ASSCAM+Studio;AI-Driven+ASCII+Camera;60FPS+WebWorker+Engine;Built+by+Manamnath+Tiwari" alt="ASSCAM Typing Animation" />
</a>

<p align="center">
  <em>Not just a camera. A fully interactive, AI-driven, real-time ASCII engine built beautifully for the browser.</em>
</p>

<!-- Animated Tech Stack Shields -->
<p align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="Tensorflow" />
  <img src="https://img.shields.io/badge/Web_Workers-02040A?style=for-the-badge&logo=webassembly&logoColor=white" alt="Web Workers" />
</p>

<br>

<!-- ✨ MASSIVE VIRAL ASSET: A GIF placeholder. GitHub renders this perfectly. ✨ -->
<a href="#">
  <img src="https://live.staticflickr.com/65535/53415132204_0b73c4c995_o.gif" width="700" alt="App Animation Example Placeholder" onerror="this.style.display='none'"/>
</a>

> **🔥 Quick Tip for Manamnath:** *Record a 5-second screen recording GIF of yourself using the app (with the Matrix rain and Smart Auto flashing) and replace the image link above with `./preview.gif`. A sick GIF is the secret to 1,000+ GitHub stars!*

<br>

<div align="center">
  <a href="#the-engineering"><img src="https://img.shields.io/badge/💡_How_it_Works-0052CC?style=for-the-badge" height="40"/></a>
  &nbsp;&nbsp;
  <a href="#hire-the-developer"><img src="https://img.shields.io/badge/🤝_Work_With_Me-3FB950?style=for-the-badge" height="40"/></a>
</div>

</div>

---

<br/>

What happens when you combine **Web Workers**, **TensorFlow.js edge-AI**, and **React** into a single, aggressively optimized camera app? You get **ASSCAM**. 

ASSCAM is a "Floating Glass Studio" that instantly converts your live webcam feed into gorgeous, stylized typography art. There's no backend processing, no privacy-invading cloud APIs. Everything—from the neural-net face detection to the real-time contrast heuristics—runs instantly on your local GPU via WebGL.

<br/>

## ✨ The Features That Matter

- 🧠 **Smart Auto-Tune (TensorFlow.js Edge AI)**: Stop playing with sliders. ASSCAM runs Google's BlazeFace neural network and custom luminance heuristics entirely in the background. It detects if you're taking a portrait, sitting in a dark room, or looking at a flat wall, and instantly recalibrates the exposure, character set, and contrast in real time.
- ⚡ **Zero-Lag Web Worker Engine**: Rendering 15,000 text characters at 60fps usually destroys the main thread. ASSCAM dumps the heavy lifting (grayscale conversion, Sobel edge-detection, string mapping) into an asynchronous Web Worker, leaving the UI completely buttery smooth.
- 💎 **Floating Glassmorphic Studio UI**: Built entirely with incredibly polished custom CSS. Dynamic ambient background blobs, Apple-grade frosted glass, intuitive chunky sliders, and segmented tab ribbons. A masterclass in frontend obsession.
- 🎨 **10+ Studio Render Modes**: Classic Hacker Green, Duotone, Glitch, Neon, Heatmap, or pure Threshold. Adjust weights, typography, fonts, and kerning dynamically.

<br/>

## 🛠️ The Engineering (For the Nerds)

If you're reading this, you probably care about how things are built. I built ASSCAM to flex a critical concept: **The browser is an operating system.**

* **Tech Stack**: React 18, Vite, raw CSS (for ultimate customization), and `@tensorflow-models/blazeface`. 
* **The Frame Pipeline**: 
  1. `<video>` tag captures the camera feed secretly in the background.
  2. Every animation frame, the video is drawn to an offscreen Canvas.
  3. The `ImageData` buffer is transferred asynchronously to a `worker.js` thread.
  4. The worker applies a custom Matrix multiplication to find luminance, passes a Sobel filter convolution for edge density, maps values to ASCII ramps, and returns a raw string grid. 
  5. React paints the strings perfectly into the DOM.
* **The AI Layer**: The `useAutoTune` hook reads frames on a delayed loop. If it detects a face with >90% confidence using TF.js, it overrides user controls with the optimal studio lighting preset. 

<br/>

## 👋 Meet the Mind Behind It

Hi, I'm **Manamnath Tiwari**. 

I’m a relentless software engineer and creative technologist who believes that code shouldn't just "function"—it should perform beautifully under the hood, and look breathtaking on the screen. 

ASSCAM is just a glimpse of how I approach problem-solving: aggressively modern tech stacks, unapologetic performance optimization, and an absolute obsession with user experience. 

**I don't just write apps. I build experiences.**

If you are building something ambitious, attempting to solve a heavy computational problem on the frontend, or looking for an engineer who gives a damn about the details—we should talk.

### 📬 Let's Connect

- **Email me**: [manamnathtiwari@gmail.com] (manamnathtiwari@gmail.com)
- **LinkedIn**: [Connect with Manamnath](www.linkedin.com/in/manamnathtiwari)
- **GitHub**: [github.com/manamnathtiwari](https://github.com/manamnathtiwari)

<br/>

---

<div align="center">
  
**Built with 💻 and lots of ☕ by Manamnath Tiwari.**

</div>
