# Bishesh's Portfolio ✌️

Hey! This is the repository for my interactive developer portfolio. 

I wanted to build something that actually reflects what I love doing: bridging the gap between heavy, complex backend systems and creative, highly interactive frontend experiences. Instead of just listing my projects, I tried to build the portfolio itself as a piece of engineering.

![Portfolio Preview](./public/preview.gif) 
*(Note: Drop a quick GIF here of the peace-sign unlock and the gravity mesh!)*

## What's actually going on here?

* **Biometric Gesture Unlock:** The site stays locked behind a mock security terminal until you hold up a peace sign (✌️) to your webcam. It uses MediaPipe's hand landmarker model to track the gesture. (There's a keyboard fallback if you don't have a camera).
* **Interactive Gravity Mesh:** The background isn't just a video or a static image. It's a custom HTML5 Canvas physics engine where particles drift and react to the gravitational pull of your mouse pointer.
* **Simulated OS Modals:** When you click on a project, it doesn't just open a boring text box. It opens an OS-style window that actually simulates the project running—like watching a mock C++ compiler generate an AST, or an N-Body simulation tracking its FPS.

## The Tech Stack

I kept the build process pretty straightforward, relying mostly on vanilla TS and some solid animation libraries:
* **Core:** Vanilla TypeScript + Vite
* **Computer Vision:** `@mediapipe/tasks-vision`
* **Motion & Physics:** GSAP (ScrollTrigger, quickTo) and custom Canvas API logic
* **Scroll:** Lenis (for that buttery smooth scroll hijacking)
* **Styling:** Vanilla CSS (lots of glassmorphism and custom film grain)

## Want to run it locally?

If you want to poke around the code or run it yourself, you just need Node installed.

1. Clone it down:
   ```bash
   git clone [https://github.com/Bishesh-ops/portfolio.git](https://github.com/Bishesh-ops/portfolio.git)
   cd portfolio