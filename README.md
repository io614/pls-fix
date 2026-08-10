# pls fix

A corporate alignment simulator.

Badly positioned rectangles arrive with a message attached. You move them until
everything lines up. Someone says "Thanks." Another message arrives.

```bash
npm install
npm run dev
```

No backend, no accounts, no network calls. Your progress is stored in `localStorage`,
which is to say it is stored locally, which is to say it is not really stored at all.

---

## The job

Ten tasks. They arrive from four colleagues who have never met each other and never
will:

- **Marcus**, Managing Director. Communicates in fragments. Usually just "pls fix".
- **Sarah**, VP Strategy. Everything is a quick one. Nothing is a quick one.
- **Priya**, PMO. Believes formatting is measurable and has built a dashboard to prove it.
- **Alex**, Design. Occasionally the only person making sense.
- **David**, Transformation Lead. Speaks exclusively in nouns that used to be adjectives.

| # | Task | What it teaches you |
|---|------|---------------------|
| 01 | pls fix | That you can drag things |
| 02 | Looks slightly off | That finishing is not the same as being finished |
| 03 | Can we center this? | The difference between centred and *centred* |
| 04 | Pixel perfect | That the grid was there the whole time |
| 05 | Consistency | Equal spacing, and who decides where the margin is |
| 06 | Senior management | That a countdown is mostly atmosphere |
| 07 | Final_v2 | Resizing, and what Legal wants |
| 08 | Stakeholder feedback | Version control |
| 09 | Board deck | Everything at once, at 22:14 |
| 10 | Performance Review | — |

## Controls

| Input | Effect |
|---|---|
| Drag | Move a shape. Mouse, touch, or pen |
| Arrow keys | Nudge 1px |
| Shift + Arrow | Nudge 10px |
| Alt + Arrow | Resize, where resizing is permitted |
| `[` / `]` | Rotate, where rotation is permitted |
| Tab | Cycle shapes |
| `H` | Request guidance |
| Escape | Deselect, or leave the pause menu |

Shapes snap when they get close, and snapping lands them **exactly** on the solution —
a completed level is genuinely aligned, not approximately aligned. This matters more
than it sounds like it should.

**Request guidance** flashes a dashed outline wherever each unfinished shape belongs.
It is not free: each request costs you eleven points of Ownership. The organisation
notices these things.

---

## How it actually works

```
src/
├── game/        pure logic, no React
│   ├── types.ts       shapes, constraints, levels, twists
│   ├── alignment.ts   objective evaluation, distribute maths, progress
│   ├── snapping.ts    snap candidates, smart guides, gap badges
│   ├── engine.ts      instantiate / solve / hint / validate
│   └── scoring.ts     the KPIs nobody audits
├── levels/      ten declarative level files
├── hooks/       useDrag, useGameState, useSound
├── components/  the fake enterprise application
└── styles/
```

`game/` has no React dependency and is where the tests point. Levels are plain data —
adding one requires no engine changes, which is the only reason there are ten of them.

### Objectives

A level is complete when every objective passes. There are two kinds:

- **Shape targets** — `target: { x, y, width, height, rotation }`, any subset. Axes left
  out are unconstrained.
- **Relational constraints** — `alignLeft`, `alignCenterY`, `equalSpacingX`, `equalWidth`
  and friends, declared over a list of shape ids.

Both feed snapping *and* completion. A shape's own target always outranks a
constraint-derived snap — otherwise two misaligned neighbours can snap to each other
and strand the level in a state that looks right and isn't.

`equalSpacingX/Y` treats the first and last ids as anchors and distributes everything
between them, exactly like "distribute horizontally" in the software this is imitating.

A canvas can also declare the `grid` its surface draws, in which case shape edges snap
to it. Task 04 is built entirely out of whole spreadsheet cells, so "grid must be exact"
is a literal instruction rather than a vibe.

### Twists

Levels may declare `twists`: follow-up requests that arrive *after* you finish and
reopen the task. Each plays an interlude ("Looks great."), then a notice ("Actually can
we revert to the previous version?"), then mutates the composition via declarative ops —
`reset`, `offset`, `place`, `retarget`, `resize`, `rotate`.

`retarget` is the cruel one. The shape does not move. The correct answer does.

Density escalates on purpose: none in task 01, one apiece through 06, two in 07 and 08,
three in 09, none in the finale. By the board deck, three separate people have reopened
your work.

### Tolerances

```ts
position: 8    rotation: 3      size: 5        // completion thresholds
snap: 8        snapRotation: 4  snapSize: 6    // pull radii
relational: 2.5                                // constraint satisfaction
```

Levels override these. Task 04 tightens `position` to 2px and `snap` to 3px, which is
what makes keyboard nudging the sensible tool there rather than a listed feature nobody
uses.

---

## Debug mode

`?debug=true` adds target ghosts, live coordinates, a level selector, and `solve` /
`reset` buttons. It also runs `validateLevel` on load and complains about any level that
starts already solved, cannot be solved, references a missing shape, or declares a size
or rotation target it already satisfies.

`solve` runs `attemptSolve` — the same routine the test suite uses to prove all ten
levels are completable, and the same one the hint button asks for directions.

## Tests

```bash
npm test
```

Covers the alignment maths directly, then puts every level through structural
validation and a simulated playthrough that aims each shape at its solution and checks
the level actually finishes. Every twist is verified to genuinely reopen the task *and*
to be solvable afterwards, and any level whose surface draws a grid must keep its
targets on it.

87 tests. They have caught, so far: a completion cascade across levels, two misaligned
siblings snapping to each other, a rotation target that sat inside its own tolerance,
and a solver that could only ever resize width.

---

## Known behaviours

Not defects.

- Undo is unavailable due to organisational policy.
- The deadline extends itself indefinitely.
- Alignment failed successfully.
- The revision history contains a file called `_DO_NOT_USE`. It is not clear who made it.
- Ownership only goes down.

## Licence

Do what you like with it. Please don't align anything you'll regret.
