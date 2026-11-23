# Security

ActiveRings runs inside Home Assistant and handles activity data (steps, energy, exercise and
workouts), so reports of security or privacy problems are taken seriously.

## Reporting a problem

Please do not open a public issue for a vulnerability. Use GitHub's private
reporting instead: on this repository, go to **Security > Report a
vulnerability**. You should get a first reply within a week.

Useful to include: the ActiveRings and Home Assistant versions, what an attacker
needs (a login, a crafted entity, a pasted card configuration), and what they
gain.

## What ActiveRings does and does not do

- It makes no network requests. It only reads data that another integration
  already holds in your Home Assistant.
- Its dashboard card is one JavaScript file served by Home Assistant itself;
  it loads nothing from elsewhere.
- It keeps one store of its own: the log of your workouts, for up to 400 days,
  in a private file in Home Assistant's storage folder (readable only by the
  account Home Assistant runs as). Deleting the ActiveRings entry deletes it.
  Every other figure is worked out from the source integration's entities and
  statistics each time.
- Its sensors are ordinary Home Assistant entities, so the recorder keeps their
  history like any other sensor's, and anyone who can log in to your Home
  Assistant can read them. No sensor carries the list of your workouts (the
  sensors hold counts and totals); the card reads the list over Home
  Assistant's own authenticated connection, which answers only users who may
  read the entity the card is pointed at.
- Its diagnostics download holds no totals, goals, workouts, times or entity
  ids; it only says which figures exist and how many workouts are kept.

See "Privacy" in the README for where your data is stored and who can read it.
