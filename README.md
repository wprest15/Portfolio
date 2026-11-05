# WaltonOS 26.05

Walton Prest's portfolio. One page, plain HTML, CSS and JavaScript, with no frameworks and no build step.

## Run it

Double-click `index.html`, or serve it locally with the .NET SDK:

```bash
dotnet run .claude/serve.cs
```

Then open http://localhost:5173.

## Change the content

Nearly everything lives in [`js/content.js`](js/content.js): projects, experience, education, skills, contact links and the taglines on the monitor. The README window in the intro is in [`index.html`](index.html).

### Add a project screenshot

1. Put the image in `assets/projects/`.
2. Set `image` on the matching flow step in `js/content.js`:

```js
{ title: "Admin review", caption: "...", image: "assets/projects/wildfire-admin.png", alt: "The admin review queue" }
```

Steps with `image: null` show the NO SIGNAL screen. Add, remove or rename steps freely and the viewer adjusts.

### Add a project

Add an entry to `projects` in `js/content.js`. The floppy disk, directory listing and project window are generated from it. Use `banner: "fire"` or `"awning"` and `widget: "migration"` or `"receipt"`, or leave `widget` out.

## Files

| Path | What it does |
| --- | --- |
| `js/content.js` | All the words |
| `js/render.js` | Builds the project windows, git graph, log and circuit board |
| `js/fx.js` | Canvas effects: pixel name, wildfire, TV static |
| `js/terminal.js` | The working terminal and Snake |
| `js/main.js` | Boot screen, menus, display settings, screensaver, crash and power |
| `css/style.css` | Styles |

## Things to find

Type `help` in the terminal. Press the turbo button. Turn the knob. Try the Display and Special menus. Enter the Konami code. Leave the page alone for 90 seconds.
