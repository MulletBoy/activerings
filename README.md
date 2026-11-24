# ActiveRings

<p align="center">
  <img src="docs/hero.jpg" alt="ActiveRings: steps, exercise and workout rings for Home Assistant. The card shows two sets of three rings, one for today and one for the last 7 days, with a row for each ring, today's distance and energy, a steps chart, an exercise chart and the recent workouts." width="100%">
</p>

<p align="center">
  <a href="https://github.com/MulletBoy/activerings/releases/latest"><img src="https://img.shields.io/github/v/release/MulletBoy/activerings?style=flat-square&color=ff2fd6&label=release" alt="Latest release"></a>
  <a href="https://github.com/MulletBoy/activerings/actions/workflows/test.yml"><img src="https://img.shields.io/github/actions/workflow/status/MulletBoy/activerings/test.yml?branch=main&style=flat-square&label=tests" alt="Tests"></a>
  <a href="https://github.com/MulletBoy/activerings/actions/workflows/validate.yml"><img src="https://img.shields.io/github/actions/workflow/status/MulletBoy/activerings/validate.yml?branch=main&style=flat-square&label=hassfest%20%2B%20HACS" alt="Hassfest and HACS validation"></a>
  <img src="https://img.shields.io/badge/Home%20Assistant-2026.11%2B-a46bff?style=flat-square" alt="Home Assistant 2026.11 or newer">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/MulletBoy/activerings?style=flat-square&color=4df3ff" alt="MIT licence"></a>
  <a href="https://ko-fi.com/mulletboy"><img src="https://img.shields.io/badge/Ko--fi-buy%20me%20a%20coffee-ffb224?style=flat-square&logo=kofi&logoColor=white" alt="Buy me a coffee on Ko-fi"></a>
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#setup-guide">Setup guide</a> ·
  <a href="#the-rings-family">The Rings family</a> ·
  <a href="#the-card">The card</a> ·
  <a href="#how-the-rings-fill">The rings</a> ·
  <a href="#entities">Entities</a> ·
  <a href="#privacy">Privacy</a>
</p>

Steps, exercise and workouts for Home Assistant, as rings you want to close. ActiveRings takes
the activity data your watch and phone already send to Home Assistant and fills six rings
against your own goals: three for today, three for the last seven days. A full ring is always
good news. It is part of the [Rings family](#the-rings-family), alongside
[SleepRings](https://github.com/MulletBoy/sleeprings) and
[VitalRings](https://github.com/MulletBoy/vitalrings).

ActiveRings is one install: a custom integration that works out the figures, and a card that the
integration loads into your dashboards by itself.

ActiveRings is free and stays free. If it earns a place on your dashboard, you can
[buy me a coffee on Ko-fi](https://ko-fi.com/mulletboy). ☕

<p align="center">
  <img src="docs/rings.jpg" alt="Left: hovering the Active days row opens a box that explains the ring, what fills it and your own figure. Right: the focus activity set to swimming on a day with every goal reached, so all six rings are closed." width="100%">
</p>

Three looks, and every colour can be changed:

<p align="center">
  <img src="docs/themes.jpg" alt="The card in the Synthwave preset, in the Theme preset on a light Home Assistant theme, and in the Vivid preset on a dark theme" width="100%">
</p>

<sub>The screenshots show invented sample data, not anyone's activity.</sub>

## The Rings family

ActiveRings is one of a family of Home Assistant apps that turn the health data from your watch
into rings you want to close. They share one look, install the same way and sit side by side on
a dashboard. Each works on its own; together they cover your night and your day.

| | App | What it scores |
|---|---|---|
| <img src="https://raw.githubusercontent.com/MulletBoy/sleeprings/main/custom_components/sleep_rings/brand/icon.png" alt="" width="44"> | **[SleepRings](https://github.com/MulletBoy/sleeprings)** | Your night: an Apple-Watch-style sleep score from duration, bedtime and interruptions, with sleep stages, sleeping heart rate and a 30-night history. |
| <img src="https://raw.githubusercontent.com/MulletBoy/vitalrings/main/custom_components/vital_rings/brand/icon.png" alt="" width="44"> | **[VitalRings](https://github.com/MulletBoy/vitalrings)** | Your body: heart, recovery and breathing, sleeping heart rate, blood oxygen and VO2 max, with heart rate, VO2 max and weight charts. |
| <img src="custom_components/active_rings/brand/icon.png" alt="" width="44"> | **ActiveRings** (you are here) | Your movement: steps, exercise and active energy today, and active minutes, active days and your focus activity over the last seven days, with steps and exercise charts and your workouts. |

More may follow.

## What it shows

- **Two sets of rings**, each ring filled against a goal you set, so a full
  ring is always good news:
  - **Today** (since midnight): Steps, Exercise and Energy.
  - **Last 7 days** (a rolling week, today included): Active minutes, Active
    days and your **focus activity**. Each of these rows shows the seven days
    as seven small columns, today last, so you can see which days counted.
- **A focus activity you choose**: the kind of workout you want to keep up.
  Strength training unless you pick another (running, walking, hiking,
  cycling, swimming, rowing, yoga, pilates, high-intensity training, dancing),
  or type the name of any other kind.
- **Today's figures**: distance, active energy, resting energy and total burn,
  each beside its 7-day average.
- **Steps chart**: every day of the last 30 days, or the average a day in each
  week or month back to your first step, with your goal as a line. With it:
  your 7-day average, your run of days on goal, and your best day of the last
  year.
- **Exercise chart**: minutes in each week, with your weekly goal as a line.
- **Workouts**: your recent workouts with length, distance, pace, energy and
  heart rate.

## What you need

- Home Assistant 2026.11 or newer, with the recorder (it is on by default).
- [Life Dashboard](https://github.com/owen282000/life-dashboard-ha) 1.4.0 or
  newer with its iOS companion app, which sends Apple Health data to Home
  Assistant. **1.5.0 or newer is recommended:** it keeps your past workouts,
  so they are there from before you installed ActiveRings. It is the only
  supported source so far; others can be added through a small adapter, see
  [Adding a source](#adding-a-source).
- The stock Home Assistant companion app is not enough: it reports a step
  count when it happens to sync, with no daily history and no workouts.

## Install

[![Open this repository in Home Assistant.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=MulletBoy&repository=activerings&category=integration)

1. Open **Settings > Marketplace** and search for **ActiveRings**. On Home Assistant versions before
   2026.11 with HACS: search for it in **HACS**.
2. Download **ActiveRings** and restart Home Assistant.
3. Go to **Settings > Devices & services > Add integration > ActiveRings**.
4. Choose whose activity data to use (your Life Dashboard entry).
5. Add the **Active Rings** card to a dashboard and pick any ActiveRings entity.
6. Optional: set your goals and your focus activity under **Configure** on the integration.

If the search does not find ActiveRings, add it as a custom repository: in Marketplace choose
**Add from link** and paste `https://github.com/MulletBoy/activerings` (type: Integration); in HACS
use **Custom repositories**. Then carry on with step 2.

Manual install: copy `custom_components/active_rings` into your `config/custom_components`
folder and restart.

The [setup guide](#setup-guide) below goes through every setting.

## Setup guide

ActiveRings has two places with settings, and neither needs YAML:

| What you want to change | Where |
|---|---|
| What is counted: your six goals and your focus activity | The integration: **Settings > Devices & services > ActiveRings**, then the cog (**Configure**) on your entry |
| How it looks: which parts are shown, units, chart periods, preset and colours | The card: edit your dashboard, then the pencil on the card |

The goals belong to the person, so every card and every sensor of that person uses the same
ones. The look belongs to the card, so two cards of the same person can look different.

### Set up the integration

**Settings > Devices & services > Add integration > ActiveRings** asks two things:

| Field | What to enter |
|---|---|
| **Name** | A name for the device and its entities, 1 to 60 characters, for example a person's name. The name `Sam` gives `sensor.sam_today_score` and so on; the suggested name `Activity` gives `sensor.activity_today_score`. |
| **Activity data from** | The Life Dashboard entry that receives this person's health data. |

If the form will not go on, it says why:

| Message | What to do |
|---|---|
| No supported health integration is set up yet | Install and set up [Life Dashboard](https://github.com/owen282000/life-dashboard-ha) first. |
| This entry has no steps sensor | Send health data from the phone app first, or enable the steps sensor of Life Dashboard if you disabled it. |
| This activity data is already set up | There is one ActiveRings entry for each Life Dashboard entry. Change the existing one under **Configure**. |

ActiveRings starts with the default goals and strength training as the focus activity, so the
card works straight away.

### Goals and focus activity

**Settings > Devices & services > ActiveRings**, then the cog (**Configure**) on your entry,
opens the form **ActiveRings goals**:

| Setting | Default | You can set | What it changes |
|---|---|---|---|
| **Steps a day** | 10,000 | 1,000 to 60,000 | The Steps ring, the goal line of the steps chart and the goal streak |
| **Exercise minutes a day** | 30 | 5 to 600 | The Exercise ring, and how many minutes make a day an active day |
| **Active energy a day (kcal)** | 500 | 50 to 5,000 | The Energy ring. Always entered in kilocalories, also when the card shows kilojoules (1 kcal is 4.184 kJ) |
| **Exercise minutes in 7 days** | 150 | 30 to 3,000 | The Active minutes ring and the goal line of the exercise chart |
| **Active days in 7 days** | 5 | 1 to 7 | The Active days ring |
| **Focus activity** | Strength training | A name from the list, or one you type | Which workouts fill the third ring of the week and stand out in the workouts list |
| **Days with the focus activity in 7 days** | 2 | 1 to 7 | The focus activity ring |

Good to know:

- Goals are whole numbers. A change applies as soon as you submit the form; no restart.
- A goal is not stored with each day. When you change one, the past is counted again against
  the new goal: a lower steps goal can make your goal streak longer, and a higher daily
  exercise goal can take active days away.
- The sensors change with the goals too (their `goal` attributes and the two scores), so
  automations that use them follow.

**Choosing the focus activity.** A name from the list stands for every kind of workout that
belongs to it:

| In the list | Counts workouts whose kind contains |
|---|---|
| Strength training | `strength`, `weightlifting`, `calisthenics`, `core_training` |
| Running | `running` |
| Walking | `walking` |
| Hiking | `hiking` |
| Cycling | `biking`, `cycling` (outdoors and on a stationary bike) |
| Swimming | `swim` (pool and open water) |
| Rowing | `rowing` |
| Yoga | `yoga` |
| Pilates | `pilates` |
| High-intensity interval training | `hiit`, `high_intensity` |
| Dancing | `danc` (every kind of dance) |

Any other sport: type its name into the field instead of choosing one, as your health app
names it, for example `tennis`, `rock_climbing` or `pickleball`. Capitals and spaces do not
matter (`Rock climbing` is kept as `rock_climbing`). Every workout whose kind contains what you
typed is counted, so `tennis` also counts table tennis. Not sure how a workout is named? Record
one, then look at the `sessions` attribute of Life Dashboard's **Exercise today** sensor under
**Developer tools > States**: its `type` is the name to type.

Very short workouts can be kept out of the list and the focus ring with Life Dashboard's own
option **Shortest workout (minutes)**; ActiveRings follows it.

### The card

Edit your dashboard, choose **Add card** and search for **Active Rings**. The card is added to
every dashboard automatically (there is no resource to register) and picks the first ActiveRings
entity it finds. In YAML it is `custom:active-rings-card`; point it at any entity of the
ActiveRings device:

```yaml
type: custom:active-rings-card
entity: sensor.activity_today_score
```

Every option is in the card's visual editor. The first column is its name there, the second
its name in YAML:

| In the editor | Option | Default | |
|---|---|---|---|
| ActiveRings entity | `entity` | | Any entity of an ActiveRings device (required). It only tells the card whose figures to show |
| Title | `name` | `Activity` | The title at the top of the card |
| Colour preset | `preset` | `synthwave` | `synthwave`, `theme` (follows your light or dark theme) or `vivid` |
| A row for each ring | `show_rows` | `true` | A row beside the rings for each ring: share of the goal, the figure and what is left. Off leaves the rings alone |
| Today's distance and energy | `show_today` | `true` | Today's distance, active energy, resting energy and total burn, each beside its 7-day average |
| Steps chart, average, streak and best day | `show_steps` | `true` | The steps chart with your 7-day average, goal streak and best day |
| Exercise chart | `show_exercise` | `true` | Exercise minutes in each week |
| Recent workouts | `show_workouts` | `true` | The list of your latest workouts |
| Workouts in the list | `workouts_shown` | `5` | How many workouts the list shows: `1` to `12` |
| Steps chart opens on | `steps_range` | `30d` | `30d`, `6m`, `1y` or `all`. You can still switch the period in the card; this is the one it opens on |
| Exercise chart opens on | `exercise_range` | `6m` | `3m`, `6m` or `1y` |
| Distance unit | `distance_unit` | unit system | `km` or `mi`. Empty follows Home Assistant's unit system |
| Energy unit | `energy_unit` | `kcal` | `kcal` or `kJ` |
| Tinted boxes | `tiles` | preset | A tinted box around each part of the card |
| Use the theme's card background | `theme_background` | `false` | The Synthwave preset paints its own dark card; on keeps your theme's card background instead |
| Colours | `colors` | | Change single colours of the preset, see [Colours](#colours) |

### Colours

Start from a preset: **Synthwave** (neon on a dark card, whatever your theme is), **Theme**
(quiet colours that follow your light or dark Home Assistant theme) or **Vivid** (bright colours
on your theme's card).

Then change any single colour under **Colours** in the editor, or with `colors` in YAML. A
field left empty keeps the preset's colour.

| Name | What it colours |
|---|---|
| `steps`, `exercise`, `energy` | Today's three rings and their rows; `steps` and `exercise` also colour their charts |
| `minutes`, `days`, `focus` | The week's three rings and their rows; `focus` also marks the workouts of your focus activity in the list |
| `steps_end`, `exercise_end`, `energy_end`, `minutes_end`, `days_end`, `focus_end` | The second colour each ring fades to. Give it the same colour as the ring for a ring in one flat colour |
| `distance`, `resting`, `total` | Today's distance, resting energy and total burn |
| `streak` | The goal streak |
| `cardio` | Workouts in the list that are not your focus activity |
| `goal` | The goal line on the charts |
| `fresh`, `recent`, `stale` | The "synced ... ago" marker and the dot of a set: good, fair, poor |

A colour is a hex value (`"#ff2fd6"`), a colour name (`teal`), `rgb(...)` or `hsl(...)`, or a
variable of your theme (`var(--accent-color)`). Anything else is ignored. In YAML, put hex
values in quotes.

```yaml
type: custom:active-rings-card
entity: sensor.activity_today_score
preset: vivid
colors:
  steps: "#00c2ff"
  steps_end: "#0066ff"
  focus: var(--accent-color)
```

**From a Home Assistant theme.** With the Theme preset, a theme can set the colours for every
ActiveRings card at once with variables named `active-rings-<name>-color`, where the name is
one from the table above (the `_end` colours are not among them):

```yaml
# in your theme
my-theme:
  active-rings-steps-color: "#e11d48"
  active-rings-focus-color: "#0d9488"
```

A colour set on the card wins over the preset, and the preset wins over the theme's variables.

### Layout

The card arranges itself by the width it is given:

| Card width | Arrangement |
|---|---|
| Under 420 px (a phone, a narrow column) | One column, each set's rings above its rows |
| 420 to 639 px | One column, rings beside their rows |
| 640 to 959 px | The two sets side by side and level (rings above their rows), today's four figures in one line, the two charts side by side, the workouts below them |
| 960 px and wider | The two sets side by side with their rings beside the rows; steps chart, exercise chart and workouts side by side |

In a sections dashboard the card takes the full width of its section and is as tall as its
content. To give it one of the wider arrangements, make the section wider (the section's
`column_span`) rather than the card.

To make a small card, switch parts off. Rings only:

```yaml
type: custom:active-rings-card
entity: sensor.activity_today_score
show_rows: false
show_today: false
show_steps: false
show_exercise: false
show_workouts: false
```

Rings and workouts, in miles and kilojoules, in your theme's colours:

```yaml
type: custom:active-rings-card
entity: sensor.activity_today_score
name: Training
preset: theme
show_today: false
show_steps: false
show_exercise: false
workouts_shown: 8
distance_unit: mi
energy_unit: kJ
```

### More than one person

Each person needs their own Life Dashboard entry (their own phone). Add the ActiveRings
integration once more for each of them, choose their entry and give it their name. Every
person then has their own device, sensors, goals, focus activity and workout log. Add one card
for each person and point it at one of that person's entities.

### Changing things later

- **Rename:** rename the device under **Settings > Devices & services > ActiveRings**; Home
  Assistant offers to rename its entities with it. The card's title is the card's own `name`.
- **Another source entry:** delete the ActiveRings entry and add the integration again. Your
  goals go back to the defaults, and the workout log is filled again from Life Dashboard's
  list (Life Dashboard 1.5.0 and newer).
- **Remove:** delete the ActiveRings entry (this deletes its workout log), remove the card from
  your dashboards, then remove ActiveRings in Marketplace or HACS and restart.

### If something is not right

| What you see | What to do |
|---|---|
| "Choose an ActiveRings entity in the card settings." | The card has no `entity`. Edit the card and pick one. |
| "Entity not found" | The entity was renamed or removed. Edit the card and pick it again. |
| The card is not in the card picker, or "Custom element doesn't exist" | Reload the page (on the phone app: pull down to refresh, or clear the frontend cache in the app's debugging settings) after installing or updating. |
| Every ring of today is at zero just after midnight | That is right: the new day starts at zero and fills at the phone's next sync. |
| The focus activity ring stays empty | Check under **Configure** which activity is chosen, and how your workouts are named (see [Goals and focus activity](#goals-and-focus-activity)). |
| Old workouts are missing | With Life Dashboard 1.5.0 or newer, use "Send history" in its phone app. The card says since when it is counting. |

## What's new

| Version | In short |
|---|---|
| **1.1.0** | Past workouts now come from Life Dashboard itself where it keeps them (Life Dashboard 1.5.0 and newer): after a "Send history" from the phone app, the workouts from before you installed ActiveRings are there too, and a workout deleted or corrected later is followed. ActiveRings' own log stays as the fallback for older Life Dashboard versions. |
| **1.0.0** | First release: six rings filled against your own goals in two sets (Today and Last 7 days) with an explanation on every ring, a focus activity you choose, today's distance and energy, the steps and exercise charts, a workout log, nine sensors, and the card in three presets. |

Full notes for every version are on the [releases page](https://github.com/MulletBoy/activerings/releases).

## How the rings fill

A ring shows how far you are towards its goal and is full at 100 %. The row beside it shows the
real share, which can pass 100 %. The number in the middle of a set is the mean of its three
rings, each counted to 100 at most.

| Set | Ring | Counts | Default goal |
|---|---|---|---|
| Today | Steps | Steps since midnight | 10,000 |
| Today | Exercise | Exercise minutes since midnight | 30 minutes |
| Today | Energy | Active energy since midnight | 500 kcal |
| Last 7 days | Active minutes | Exercise minutes over the last seven days, today included | 150 minutes |
| Last 7 days | Active days | Days of the last seven that reached your daily exercise goal | 5 days |
| Last 7 days | Focus activity | Days of the last seven with a workout of your focus activity | 2 days |

All six goals and the focus activity are set under **Settings > Devices & services >
ActiveRings > Configure** (see [Goals and focus activity](#goals-and-focus-activity)). The
defaults lean on the World Health Organization's guidelines for
adults: at least 150 minutes of moderate activity a week, and muscle strengthening on two or
more days a week (which is why the focus activity starts as strength training with a goal of
two days).

"Last 7 days" is a rolling week: today and the six days before it. It does not start again on
Monday, so the rings never empty overnight at the start of a week.

Hover a ring's row in the card (or tap it, or move to it with the keyboard) for what it counts,
what fills it, and your own figure.

### The focus activity

The focus activity is the kind of workout you want to keep up. Each name in the list stands for
every kind of workout that belongs to it: Cycling counts a ride outdoors and one on a
stationary bike, Swimming counts the pool and open water, Strength training counts weights,
functional strength, core and bodyweight training. If your sport is not in the list, type its
name as your health app names it (for example `tennis` or `rock_climbing`) and workouts of that
kind are counted. The setup guide lists what each name counts and how to find the name of a
sport: [Goals and focus activity](#goals-and-focus-activity).

## Entities

One device per person, with:

| Sensor | What it is |
|---|---|
| Today score | Mean of the Steps, Exercise and Energy rings (0 to 100). Attribute: how many rings it is made of |
| Week score | Mean of the Active minutes, Active days and focus activity rings (0 to 100). Attribute: how many rings it is made of |
| Steps 7-day average | Average steps a day over the last seven complete days. Attributes: 30-day average, the days it is made of, goal |
| Exercise last 7 days | Exercise minutes over the last seven days, today included. Attributes: goal, share of the goal |
| Active days last 7 days | Days that reached the daily exercise goal. Attributes: goal, share of the goal, the minutes that make a day active |
| Focus activity days last 7 days | Days with a workout of the focus activity. Attributes: the activity, goal, share of the goal |
| Workouts last 7 days | How many workouts were recorded. Attribute: their minutes |
| Steps goal streak | Days in a row on the steps goal. Attributes: the longest run of the last year, goal |
| Resting energy today | Total energy less active energy |

Today's steps, distance, energy and exercise minutes are already sensors of your health
integration, so ActiveRings does not repeat them.

## How the figures are worked out

- **Today's totals** come from your health integration's "today" sensors. Right
  after midnight those still hold yesterday's totals until the next sync, so
  ActiveRings checks which day a total is for and starts the new day at zero.
- **Averages** use complete days only, and only days that have a total: a day
  your phone was off is left out, not counted as zero.
- **Active days** are the days whose exercise minutes reached your daily
  exercise goal. Today counts once it gets there.
- **The goal streak** counts the days in a row that reached your steps goal.
  Today joins the run once it reaches the goal, and does not break it before
  then.
- **Workouts** come from Life Dashboard's own list of past workouts where it
  keeps one (1.5.0 and newer): ActiveRings asks for it and its log follows it,
  so a workout you delete or correct on your phone is deleted or corrected
  here, and after a "Send history" from the phone app your older workouts are
  there too. With an older Life Dashboard, which keeps workouts for two days
  only, ActiveRings' log is what remembers them: it then starts on the day
  you install ActiveRings, so in its first week the focus activity ring counts
  fewer than seven days, and the card says since when it is counting.
- Values that cannot be right (a day of 900,000 steps, a workout that lasts a
  week) are ignored.

## Privacy

- ActiveRings makes no network requests. It only reads data another integration
  already holds in your Home Assistant.
- It keeps one thing of its own: the log of your workouts (kind, times, length,
  distance, pace, energy, heart rate, steps), for up to 400 days, in a private
  file in Home Assistant's storage folder. Deleting the ActiveRings entry
  deletes the log. Like the rest of that folder, it is part of your Home
  Assistant backups. Every other figure is worked out again from the source's
  entities and long-term statistics.
- The sensors it creates are ordinary Home Assistant entities, so their history
  and statistics are recorded like any other sensor's (and stay in the
  recorder after the entry is deleted, until you purge them), and anyone who
  can log in to your Home Assistant can read them and the card. No sensor
  carries the list of your workouts: the sensors hold counts and totals only,
  and the name of your focus activity.
- Its diagnostics download contains no totals, goals, workouts, times or entity
  ids.
- The card is one JavaScript file served by Home Assistant itself; it loads
  nothing from elsewhere.

## Adding a source

Sources live in `custom_components/active_rings/sources/`. A source is a small class that says
where another integration keeps its activity data: which entities carry today's totals, which
long-term statistics hold the daily history, and how to read its workouts. See
`life_dashboard.py` and the `ActivitySource` protocol in `sources/__init__.py`. Everything after
that (rings, averages, the streak, the workout log, sensors, the card) is shared.

## Development

```bash
pip install -r requirements-test.txt   # Python 3.14.2 or newer
ruff check . && ruff format --check . && pytest

cd card
npm ci --ignore-scripts
npm run build                          # also copies the bundle into the integration
node demo/build-demo.mjs               # dist/demo.html: the card with invented sample data
```

The images in this README are taken from `dist/demo.html?showcase`. The goals and their limits
are in `custom_components/active_rings/const.py`, the focus activities in `workouts.py`.

## Support

ActiveRings is a hobby project and free to use. Bug reports and pull requests are the most useful
support. If you would like to say thanks another way, there is
[Ko-fi](https://ko-fi.com/mulletboy).

## Credits

- [Life Dashboard](https://github.com/owen282000/life-dashboard-ha) by Owen Vogelaar provides the
  activity data.
- The default goals follow the World Health Organization's *Guidelines on physical activity and
  sedentary behaviour* (2020).
- [ChromaFlow](https://github.com/Aresitoo/chromaflow) by AresLab inspired the look of the rings
  and rows.

## Licence

[MIT](LICENSE)
