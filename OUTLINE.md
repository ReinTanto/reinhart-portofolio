# Rein — Portfolio: Multi-Page Outline

A multi-page portfolio site with:
- **Three.js** for interactive 3D shapes, particles, and scroll-driven camera/scene motion
- **2D transparent PNG images** layered on top with parallax scrolling
- **STL product models** (provided later) loaded as GLTF/STL and showcased in dedicated sections

## Tech Stack

| Layer | Choice |
|---|---|
| 3D | Three.js (via CDN or ES modules) |
| STL loading | `STLLoader` from three.js examples |
| Scroll | `GSAP` + `ScrollTrigger` (or native `IntersectionObserver` fallback) |
| Parallax | CSS `transform: translate3d` driven by scroll, or GSAP |
| Build | None for now — plain HTML/CSS/JS files, easy to deploy on GitHub Pages |

## Pages

### 1. `index.html` — Home
- Full-screen 3D hero: floating geometric shapes (icosahedron, torus knot, particles) that react to scroll
- 2D transparent PNG parallax layers (glowing rings, abstract shapes) drifting at different speeds
- Sections:
  - Hero (3D canvas + parallax title)
  - "What I do" — brief intro with parallax imagery
  - Featured products preview (cards linking to product pages)
  - CTA → About / Projects

### 2. `about.html` — About
- 3D: a rotating low-poly avatar or abstract shape that follows mouse
- Parallax: layered transparent PNGs of workspace/tools
- Sections: bio, skills grid, timeline

### 3. `projects.html` — Projects / Products
- Grid of product cards, each linking to a detail page
- 3D: a floating "gallery" of shapes that reorganize on scroll
- Each card gets a 3D preview (STL model loaded and rotating)

### 4. `project-[slug].html` — Product Detail (template)
- Hero: the STL model loaded via `STLLoader`, auto-rotating, mouse-drag to rotate
- Parallax: transparent PNG callouts pointing at model features
- Sections: overview, specs, gallery, design process

### 5. `contact.html` — Contact
- 3D: subtle particle field background
- Parallax: floating transparent PNGs (envelope, phone icons)
- Form + social links

## Shared

- `css/styles.css` — global styles, parallax utility classes
- `js/three-scene.js` — reusable Three.js scene setup (renderer, camera, lights, resize)
- `js/scroll-parallax.js` — scroll listener that updates parallax layer offsets
- `js/stl-loader.js` — helper to load STL models with proper lighting/material
- `models/` — STL files (added later)
- `img/` — transparent PNG parallax assets

## 3D Scene Design Principles

- **Scroll drives the camera**: as the user scrolls, the camera moves along a path or the scene rotates — gives a "flying through space" feel
- **Objects react to scroll velocity**: shapes scale/pulse based on scroll speed
- **Mouse parallax**: slight camera offset on mouse move for depth
- **Performance**: cap pixel ratio at 2, use `requestAnimationFrame`, pause rendering when tab is hidden

## Parallax Design Principles

- 3–5 layers of transparent PNGs per section
- Each layer moves at a different `speed` factor (e.g. 0.1, 0.3, 0.6, 1.0)
- Use `will-change: transform` and `translate3d` for GPU acceleration
- Layers sit behind/around the 3D canvas with appropriate `z-index`

## File Structure

```
reinhart-portofolio/
├── index.html
├── about.html
├── projects.html
├── project-template.html
├── contact.html
├── css/
│   └── styles.css
├── js/
│   ├── three-scene.js
│   ├── scroll-parallax.js
│   └── stl-loader.js
├── models/          (STL files added later)
├── img/             (transparent PNGs added later)
└── OUTLINE.md
```
