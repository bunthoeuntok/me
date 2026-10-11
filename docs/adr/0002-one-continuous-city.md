# One continuous City instead of a scene per section

The first version put each profile section in its own Phaser scene, joined by a fade-to-black at the screen edge. We moved to a single continuous City (one scene, a camera that follows the Hero, parallax, physics) with each section as a District along the street, because the fades felt like a slideshow and blocked swinging/momentum across section boundaries. A District map gives the instant jump that separate scenes used to give for free.
