# `pls fix, the game` — Product & Implementation Specification

## 1. Objective

Build a polished indie-style browser game titled:

# **pls fix, the game**

The player receives badly aligned corporate graphics, diagrams, dashboards, and presentation elements and must manually align them into their "correct" positions.

The core interaction is intentionally simple:

> **move shapes until everything is aligned**

The humor comes from treating trivial visual alignment work as if it were a mission-critical corporate responsibility.

The game should parody:

- PowerPoint
- Excel
- Jira
- Slack / Teams
- management consulting
- corporate dashboards
- performance reviews
- stakeholder feedback
- arbitrary deadlines
- pixel-perfect formatting requests
- meaningless KPIs

The game should remain enjoyable even without the jokes. Dragging, nudging, and snapping objects should feel exceptionally polished.

---

# 2. Tone

The tone should be:

- dry
- deadpan
- understated
- slightly absurd
- recognizably corporate
- increasingly surreal as the game progresses

Avoid loud meme humor.

The comedy should come primarily from **corporate language being applied with extreme seriousness to meaningless alignment tasks**.

Examples:

- "pls fix"
- "Can we tighten this up?"
- "Needs to be more aligned."
- "CEO is looking at this."
- "Quick one before EOD."
- "Just a tiny formatting change."
- "Can you make it pop?"
- "Alignment is currently below expectations."
- "Let's circle back on the rectangle."
- "We're 3px off plan."
- "This was raised by senior management."
- "Please prioritize."
- "Should only take 5 mins."
- "Thanks."

Do not explain the jokes.

---

# 3. Core Game Loop

Each level contains:

1. A corporate request.
2. A composition containing geometric objects.
3. Some objects begin incorrectly positioned.
4. The player drags objects into alignment.
5. Objects subtly snap into place when sufficiently close.
6. Once all objectives are satisfied, the level completes.
7. The player receives corporate feedback.
8. The next request arrives.

```text
receive request
      ↓
inspect badly aligned composition
      ↓
move shapes
      ↓
alignment improves
      ↓
everything snaps into place
      ↓
corporate approval
      ↓
next increasingly ridiculous task
```

The gameplay should be immediately understandable without a tutorial screen.

---

# 4. Controls

Primary interaction:

- click/touch and drag an object
- release to place it
- objects snap when sufficiently close to their intended position
- hover/select states provide subtle feedback

Support:

- mouse
- trackpad
- touch

Keyboard controls:

```text
Arrow key          nudge selected object 1px
Shift + Arrow      nudge selected object 10px
```

Keyboard nudging should become useful in later pixel-perfect levels.

---

# 5. Alignment Mechanics

The game engine should support multiple types of alignment.

## Position

Match:

```text
targetX
targetY
```

## Rotation

Later puzzles may require:

```text
targetRotation
```

## Size

Support:

```text
targetWidth
targetHeight
```

## Equal spacing

Example:

```text
[□]     [□]     [□]
```

Objects may individually appear correct while their spacing remains inconsistent.

## Edge alignment

Support objectives such as:

- left aligned
- right aligned
- top aligned
- bottom aligned
- vertically centered
- horizontally centered

## Relative constraints

Later levels should allow rules such as:

```text
A.centerY === B.centerY
A.width === B.width
gap(A, B) === gap(B, C)
```

This allows puzzles to be defined relationally rather than purely through fixed coordinates.

---

# 6. Snapping

Snapping is central to the game feel.

Example thresholds:

```ts
positionTolerance = 8;
rotationTolerance = 3;
sizeTolerance = 5;
```

When an object enters its snap region:

- provide a subtle magnetic pull
- snap cleanly into place
- play a soft sound
- briefly highlight the object

Do not make snapping excessively generous.

The player should feel that **they completed the alignment**.

---

# 7. Visual Direction

The visual concept is:

> **an internal corporate productivity application accidentally turned into an indie game**

Use the visual vocabulary of enterprise software:

- off-white backgrounds
- thin gray borders
- spreadsheet grids
- presentation canvases
- tiny status indicators
- dropdowns
- progress bars
- task badges
- generic corporate avatars
- comment bubbles
- revision history
- muted notifications

Suggested palette:

```text
white
off-white
light gray
charcoal
corporate blue
muted green
warning amber
error red
```

The interface should not actually be ugly.

It should be **carefully designed while pretending to be mundane corporate software**.

---

# 8. Shape Language

Objects should resemble presentation-software elements:

- rectangles
- circles
- rounded rectangles
- arrows
- lines
- text boxes
- tables
- fake charts
- process diagrams
- org charts
- consulting-style frameworks
- generic company logos

Example:

```text
┌─────────────┐
│   STRATEGY  │
└─────────────┘
       ↓
┌─────────────┐
│  EXECUTION  │
└─────────────┘
```

Except the diagram starts subtly wrong.

---

# 9. Primary UI

The application should resemble a corporate desktop tool.

Example:

```text
┌──────────────────────────────────────────────────────────────┐
│ pls fix                                      Q3 Alignment     │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│ TASKS        │                 WORKSPACE                     │
│              │                                               │
│ ● urgent     │                                               │
│ ● overdue    │                                               │
│ ● urgent     │                                               │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│ Status: Alignment pending                 4:57 until EOD      │
└──────────────────────────────────────────────────────────────┘
```

The gameplay workspace must remain dominant.

Do not clutter the game with unnecessary menus.

---

# 10. Task Presentation

Each level begins with a message from a fictional coworker.

Example:

```text
Sarah — VP Strategy
9:47 AM

Hey — quick one.

Can we align these boxes?

Should only take 5 mins.

Thanks
```

Or:

```text
Marcus — Managing Director
11:53 PM

pls fix
```

As levels become more complex, requests should often become shorter rather than longer.

---

# 11. Ten-Level Campaign

The first release should contain exactly **10 handcrafted levels**.

Each level should introduce either:

- a new mechanic
- a new presentation format
- or a new layer of corporate absurdity

Difficulty should rise gradually.

---

## Level 1 — `pls fix`

### Purpose

Teach dragging without an explicit tutorial.

### Puzzle

Two rectangles.

One is visibly but slightly vertically misaligned.

### Request

```text
Marcus — Managing Director

pls fix
```

### Completion message

```text
Thanks.
```

Very minimal.

---

## Level 2 — `Looks slightly off`

### Puzzle

Three cards should share the same baseline.

One is around 15px too low.

Introduce multiple movable objects.

### Request

```text
Sarah — VP Strategy

Looks slightly off.

Can we tighten this up?
```

### Completion

All cards share the same baseline.

---

## Level 3 — `Can we center this?`

### Puzzle

A circle must be centered inside a large rectangular container.

Introduce center alignment.

### Request

```text
Sarah — VP Strategy

Can we center this?
```

When the circle reaches the center, snapping should feel especially satisfying.

---

## Level 4 — `Pixel perfect`

### Puzzle

Four presentation objects are only 2–6 pixels away from correct alignment.

Introduce keyboard nudging.

### Request

```text
Alex — Design

Very close.

Needs to be pixel perfect though.
```

### Optional UI hint

When an object is selected:

```text
↑ ↓ ← →  Nudge
SHIFT     10px
```

### Completion response

```text
Better.
```

Then, after a short pause:

```text
Something still feels off though.
```

Then mark the level complete anyway.

---

## Level 5 — `Consistency`

### Puzzle

Four KPI cards have inconsistent horizontal spacing.

Player must create equal gaps.

Example:

```text
┌─────┐  ┌─────┐      ┌─────┐ ┌─────┐
│ KPI │  │ KPI │      │ KPI │ │ KPI │
└─────┘  └─────┘      └─────┘ └─────┘
```

Introduce relational constraints.

### Request

```text
Priya — PMO

Can we make the spacing consistent?

Need this before the steering committee.
```

### Completion response

```text
Alignment KPI restored.
```

---

## Level 6 — `Senior management`

### Puzzle

Mechanically simple:

- three objects
- basic alignment

But introduce an unnecessary countdown timer.

Example:

```text
CEO REVIEW IN
04:59
```

### Request

```text
Sarah — VP Strategy

CEO is looking at this in 5 mins.

Quick one.
```

The countdown should create atmosphere but **must not cause a conventional failure state**.

If the timer reaches zero:

```text
MEETING DELAYED
```

Then:

```text
CEO running 15 mins late.
```

The player can continue normally.

---

## Level 7 — `Final_v2`

The workspace now resembles a PowerPoint slide.

Filename:

```text
Strategy_Final_v2.pptx
```

### Puzzle

A fake strategy slide containing:

- title
- three boxes
- arrows
- one bar chart
- footer

Several elements need:

- positional alignment
- equal widths
- equal spacing

### Request

```text
Sarah — VP Strategy

Few formatting tweaks.

Should only take 5 mins.
```

### Completion

Change filename automatically to:

```text
Strategy_Final_v2_FINAL.pptx
```

Display:

```text
Saved.
```

---

## Level 8 — `Stakeholder feedback`

Filename:

```text
Strategy_Final_v2_FINAL_USE_THIS.pptx
```

### Puzzle

A more complex diagram.

The player correctly aligns everything.

Display:

```text
Looks great.
```

Pause.

Then a new notification:

```text
Sarah
Actually can we revert to the previous version?
```

The objects return to their original misaligned positions.

The player must restore the prior layout.

This should be the game's first intentionally absurd mechanic.

### Completion response

```text
Perfect.

Let's use this version.
```

Filename changes to:

```text
Strategy_Final_v2_FINAL_USE_THIS_2.pptx
```

---

## Level 9 — `Board deck`

This should be the largest puzzle in the game.

### Layout

Create a consulting-style transformation diagram containing:

```text
VISION

STRATEGIC PRIORITIES

TRANSFORMATION PILLARS

WORKSTREAMS

INITIATIVES

DELIVERABLES

KPIs
```

Include meaningless labels such as:

```text
AI Enabled
Customer Centricity
Digital First
Strategic Enablement
Future Ready
Operational Excellence
Synergy
Transformation
```

### Mechanics

Require:

- center alignment
- edge alignment
- equal spacing
- width matching
- some slight rotation correction
- many objects

### Notifications

While the player works:

```text
Sarah: any update?
```

```text
Sarah: ?
```

```text
Marcus: Need asap
```

```text
Priya: Steering committee moved forward
```

```text
Sarah: CEO joined early
```

Notifications must not interrupt dragging.

### Final message

```text
Great.

Sending to the board.
```

---

## Level 10 — `Performance Review`

This acts as the ending.

Begin with one final trivial task.

### Puzzle

One rectangle is approximately 4 pixels off-center.

Request:

```text
Marcus — Managing Director

pls fix
```

Once aligned, fade the workspace away.

Display:

# FY26 PERFORMANCE REVIEW

Use a generic fictional employee identity, e.g.:

```text
EMPLOYEE: A. PERSON
```

or simply omit the employee name entirely.

Ratings:

```text
Execution                  Meets Expectations
Stakeholder Management     Meets Expectations
Alignment                  Meets Expectations
Leadership                 Developing
```

Manager feedback:

```text
Consistently delivered against alignment objectives.

Demonstrated strong attention to positioning and formatting.

Going forward, we would like to see greater strategic ownership
of shape alignment and cross-functional spacing.
```

Button:

```text
ACKNOWLEDGE
```

When clicked:

```text
Your session has ended.
```

Pause.

Then:

```text
New task assigned.
```

Show:

```text
Marcus — Managing Director

pls fix
```

Return to Level 1.

Optionally award:

```text
EMPLOYEE OF THE MONTH

Exceptional commitment to alignment.
```

---

# 12. Corporate Characters

Use a small recurring fictional cast.

No real people or player names should be inserted.

## Sarah

```text
VP, Strategy
```

Characteristics:

- "quick one"
- constant revisions
- deadline escalation
- late-night messages

---

## Marcus

```text
Managing Director
```

Characteristics:

Messages are usually extremely short:

```text
pls fix
```

```text
?
```

```text
Need asap
```

---

## Priya

```text
PMO
```

Characteristics:

- tracks meaningless KPIs
- talks about governance
- mentions steering committees
- treats formatting as measurable performance

---

## Alex

```text
Design
```

Characteristics:

- cares about visual consistency
- occasionally provides the only sensible feedback

---

## David

```text
Transformation Lead
```

Characteristics:

Uses terms such as:

```text
synergy
transformation
enablement
future ready
operating model
value creation
```

---

# 13. Corporate Feedback Pool

Create reusable feedback messages.

## Positive

```text
Looks good.
Perfect.
Much better.
Thanks.
Approved.
LGTM.
Nice.
This works.
Exactly what I had in mind.
```

## Ambiguous

```text
Something still feels off.
Can we tighten this?
Almost there.
Maybe slightly cleaner?
Can we make this feel more premium?
Can we simplify?
Can we make it pop?
```

## Urgent

```text
Need this asap.
CEO is waiting.
Can we prioritize this?
Need before EOD.
Quick turnaround please.
Can we close this today?
```

## Contradictory

```text
Can we make it bigger but take up less space?
Can we simplify while keeping all the information?
Can we make it more premium but less designed?
Can we keep it exactly the same but different?
```

Use these sparingly.

---

# 14. Corporate KPI System

Scoring should parody internal performance metrics rather than resemble an arcade score.

Possible metrics:

```text
ALIGNMENT
EFFICIENCY
STAKEHOLDER SATISFACTION
DELIVERY
OWNERSHIP
SYNERGY
```

Example:

```text
ALIGNMENT                  98%
STAKEHOLDER SATISFACTION   64%
DELIVERY                   105%
SYNERGY                    12%
```

The numbers do not all need rigorous mathematical meaning.

However, the primary `ALIGNMENT` score should correspond reasonably to actual puzzle progress.

---

# 15. Performance Ratings

Optionally show a rating after some levels:

```text
PERFORMANCE
```

Possible results:

```text
Exceeds Expectations
Meets Expectations
Partially Meets Expectations
Needs Improvement
```

The rating does not need to perfectly correlate with player skill.

Do not use ratings to block progression.

---

# 16. Fake Notifications

Occasionally show non-blocking notifications:

```text
Reminder: Complete mandatory cybersecurity training
```

```text
Your password expires in 2 days.
```

```text
Town Hall starts in 10 minutes.
```

```text
You have 17 unread messages.
```

```text
Expense report rejected.
Reason: Missing receipt.
```

```text
Mandatory Engagement Survey

Tell us how empowered you feel.
```

Notifications should add atmosphere without obstructing gameplay.

---

# 17. Easter Eggs

Use subtle Easter eggs.

## Saving

```text
Saving...
```

Then:

```text
Saved locally.
```

## File naming

```text
deck.pptx
deck_v2.pptx
deck_final.pptx
deck_final_v2.pptx
deck_final_v2_FINAL.pptx
deck_final_v2_FINAL_USE_THIS.pptx
deck_final_v2_FINAL_USE_THIS_2.pptx
```

## Loading copy

```text
Aligning stakeholders...
```

```text
Building consensus...
```

```text
Creating synergies...
```

```text
Checking with management...
```

## Errors

```text
Alignment failed successfully.
```

## Undo

Occasionally:

```text
Undo unavailable due to organizational policy.
```

Use these jokes selectively.

---

# 18. Audio

Keep audio understated.

Potential sounds:

- soft object snap
- subtle click
- keyboard nudge
- corporate notification ping
- muted completion chime
- quiet error sound

Avoid energetic arcade music.

Optional ambient soundtrack:

- bland corporate lobby music
- elevator music
- subtle office ambience

Include a mute control.

---

# 19. Animation

Use restrained animation:

- 100–250ms UI transitions
- subtle snap animation
- tiny scale pulse when an object locks
- fading notifications
- understated progress transitions

Avoid:

- screen shake
- explosions
- excessive particles
- flashy arcade effects

---

# 20. Failure

Avoid conventional:

```text
GAME OVER
```

If a deadline expires, use corporate outcomes such as:

```text
DEADLINE MISSED
```

followed by:

```text
Deadline extended.
```

or:

```text
Meeting moved to tomorrow.
```

or:

```text
Stakeholder has not reviewed the deck.
```

Gameplay continues.

---

# 21. Game Feel Requirements

Prioritize this heavily.

Dragging should have:

- no noticeable input lag
- preserved pointer offset
- pointer capture
- no accidental text selection
- correct touch handling
- no unwanted mobile scrolling
- smooth hover states
- crisp visual rendering
- predictable snapping
- satisfying snap feedback

The absurd premise works best when the alignment mechanic itself feels extremely good.

---

# 22. Responsive Design

Primary experience:

```text
desktop / laptop
```

Desktop should use the full fake enterprise-app shell.

Mobile should remain playable:

- collapse task sidebar
- simplify status information
- maintain large touch targets
- preserve draggable workspace
- avoid tiny controls

---

# 23. Accessibility

Implement:

- keyboard selection
- keyboard nudging
- visible focus states
- sufficient contrast
- reduced-motion support
- mute option
- semantic labels
- no gameplay mechanic relying exclusively on color

---

# 24. Technical Stack

Preferred:

```text
React
TypeScript
Vite
CSS
```

The game should run entirely client-side.

Use:

```text
localStorage
```

for:

- current level
- completed levels
- settings
- mute state

No backend.

No authentication.

Avoid unnecessary dependencies.

Prefer DOM/SVG rendering over Canvas unless Canvas clearly improves implementation.

---

# 25. Suggested Architecture

```text
src/
├── components/
│   ├── AppShell.tsx
│   ├── Workspace.tsx
│   ├── Shape.tsx
│   ├── TaskMessage.tsx
│   ├── Notification.tsx
│   ├── StatusBar.tsx
│   ├── KPIWidget.tsx
│   └── PerformanceReview.tsx
│
├── game/
│   ├── engine.ts
│   ├── alignment.ts
│   ├── snapping.ts
│   ├── scoring.ts
│   └── types.ts
│
├── levels/
│   ├── level01.ts
│   ├── level02.ts
│   ├── level03.ts
│   ├── level04.ts
│   ├── level05.ts
│   ├── level06.ts
│   ├── level07.ts
│   ├── level08.ts
│   ├── level09.ts
│   └── level10.ts
│
├── content/
│   ├── messages.ts
│   ├── notifications.ts
│   └── feedback.ts
│
├── hooks/
│   ├── useDrag.ts
│   ├── useGameState.ts
│   └── useSound.ts
│
└── styles/
```

Keep levels data-driven.

---

# 26. Suggested Shape Model

```ts
type GameShape = {
  id: string;

  type:
    | "rectangle"
    | "roundedRectangle"
    | "circle"
    | "text"
    | "arrow"
    | "line";

  x: number;
  y: number;

  width: number;
  height: number;

  rotation?: number;

  target: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
  };

  constraints?: {
    movable?: boolean;
    resizable?: boolean;
    rotatable?: boolean;
  };

  style?: {
    fill?: string;
    border?: string;
    fontSize?: number;
  };

  content?: string;
};
```

Extend where necessary.

---

# 27. Level Definition

Levels should be declarative.

Example:

```ts
const level1: Level = {
  id: "pls-fix",

  title: "pls fix",

  sender: {
    name: "Marcus",
    role: "Managing Director",
  },

  message: ["pls fix"],

  shapes: [...],

  completion: {
    type: "all-targets",
    tolerance: 8,
  },

  completionMessage: "Thanks.",
};
```

New levels should be possible without modifying the core engine.

---

# 28. Alignment Evaluation

Implement reusable utilities:

```ts
distanceFromTarget(shape)
isPositionAligned(shape)
isSizeAligned(shape)
isRotationAligned(shape)
isShapeComplete(shape)
isLevelComplete(level)
```

For position:

```ts
Math.hypot(
  shape.x - shape.target.x,
  shape.y - shape.target.y
)
```

Also support relational constraints:

```text
equal horizontal spacing
same center Y
same width
same left edge
same top edge
```

---

# 29. Debug Mode

Provide:

```text
?debug=true
```

Debug mode may display:

- target positions
- snap areas
- bounding boxes
- coordinates
- alignment error
- constraint state
- level selector
- instantly complete level control

Never expose debug visualization during normal gameplay.

---

# 30. Main Menu

Keep the title screen minimal.

```text
pls fix

A corporate alignment simulator.

[ START WORK ]
```

If progress exists:

```text
[ CONTINUE WORK ]
```

Secondary:

```text
SETTINGS
START NEW ROLE
```

---

# 31. Pause Menu

Instead of `PAUSED`:

```text
STATUS: AWAY
```

Options:

```text
RETURN TO WORK

SETTINGS

RESIGN
```

If the player chooses resign:

```text
Are you sure?

Your contributions to the organization are valued.
```

Options:

```text
CONTINUE CONTRIBUTING

RESIGN ANYWAY
```

Return to title screen if confirmed.

---

# 32. Visual Polish

The implementation must feel intentionally designed rather than like a generic React exercise.

Pay attention to:

- spacing
- typography
- grid structure
- thin borders
- restrained shadows
- cursor states
- icon consistency
- believable fake-enterprise UI
- crisp rendering
- micro-interactions

The UI surrounding a game about bad alignment should itself be **extremely well aligned**.

---

# 33. Avoid

Do not make the game:

- look like a SaaS marketing website
- look like a mobile freemium game
- overly colorful
- emoji-heavy
- dependent on internet memes
- unnecessarily 3D
- mechanically complicated
- backend-dependent
- account-dependent
- filled with blocking modal dialogs
- overly explanatory

The satire should be recognizable but relatively restrained.

---

# 34. Implementation Priority

Prioritize in this order:

1. **Excellent dragging**
2. **Excellent snapping**
3. **Strong visual polish**
4. **Clear puzzle design**
5. **Corporate satire**
6. **Ten distinct levels**
7. Audio
8. Easter eggs

Do not add extra mechanics until the core interaction feels polished.

---

# 35. Initial Release Deliverable

Build a complete version containing:

- title screen
- fake corporate application shell
- exactly 10 handcrafted levels
- smooth mouse dragging
- touch dragging
- keyboard nudging
- snap-to-target behavior
- relative alignment constraints
- corporate messages
- fake notifications
- KPI UI
- countdown gag
- PowerPoint-style levels
- stakeholder-revert level
- board-deck finale
- performance-review ending
- local save
- settings
- audio toggle
- responsive layout
- debug mode

The game must be playable from beginning to end.

Do **not** spend time implementing additional levels until these ten feel polished.

---

# 36. Acceptance Criteria

The project is complete when:

- `npm install` succeeds.
- `npm run dev` launches the game.
- The full 10-level campaign can be completed.
- Shapes drag smoothly.
- Touch controls work.
- Keyboard nudging works.
- Snapping is reliable.
- Relative alignment constraints work.
- Each level has deterministic completion conditions.
- Player progress persists after refresh.
- Restarting is possible.
- There are no dead-end screens.
- Notifications never prevent gameplay.
- Desktop layout feels polished.
- Mobile is usable.
- The game requires no backend.
- No personal or real-world player name is embedded anywhere.
- Corporate satire is obvious without explanation.
- The result feels like a small indie game rather than a frontend prototype.

---

# 37. Creative Direction Summary

The central joke is:

> **The smallest possible visual imperfection is treated as a major organizational problem.**

The player spends increasingly large amounts of effort aligning meaningless rectangles while senior stakeholders, arbitrary deadlines, dashboards, KPIs, revisions, and bureaucracy accumulate around them.

Yet the actual act of alignment should be strangely satisfying.

The target combination is:

```text
PowerPoint
+
corporate bureaucracy
+
precision puzzle
+
deadpan indie game
```

When uncertain about a design choice, favor whichever option makes the game:

> **more satisfying to interact with and more quietly absurd.**