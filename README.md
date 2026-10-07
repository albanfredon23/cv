# Alban Fredon · CV 3D

**FR** · CV interactif en 3D. Une version « mignonne » de moi tape sur un vieil ordinateur façon BBC Micro. Clique sur l'écran pour lire mon parcours dans un terminal rétro ; quand tu as fini, je me retourne et je te donne mes coordonnées. Le site existe en français et en anglais.

**EN** · Interactive 3D resume. A cute version of me types on a BBC Micro–style computer. Click the screen to read my background in a retro terminal; when you're done, I swivel round and hand you my contact details. Available in French and English.

## Lancer en local / Run locally

Les modules ES doivent être servis en HTTP (pas en `file://`). / ES modules must be served over HTTP.

```bash
python3 -m http.server 8000
# puis / then open http://localhost:8000
```

## Structure

```
index.html            page shell (markup only)
css/style.css         styles (scene chrome, CRT terminal, contact card, boot screen)
js/main.js            renderer, lights, state machine (idle → screen → terminal → contact), main loop
js/data/cv.js         resume content, FR + EN  ← edit this to update the CV
js/i18n.js            current language (saved in localStorage)
js/camera-rig.js      camera shots and eased transitions
js/audio.js           synthesized sounds (keys, CRT power-on, room tone)
js/scene/room.js      walls, floor, painting, shelf
js/scene/desk.js      desk, BBC Micro keyboard, CRT monitor, lamp, props
js/scene/screen.js    the monitor's live canvas texture
js/scene/avatar.js    the avatar and its animation
js/scene/helpers.js   small Three.js helpers
js/ui/terminal.js     teletext-style terminal
js/ui/contact.js      contact card
```

## Clavier / Keyboard

`1`–`5` dossiers / files · `Entrée` suivant / next · `M` menu · `0` contact · `L` FR/EN · `Échap` / `Esc` retour / back

## Tech

Three.js 0.170 (CDN import map), WebGL, Web Audio. No build step.
