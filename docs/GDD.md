# Stellar Reach — Game Design Document

> A sci-fi UI-based trading and management simulator for mobile,
> playable one-handed in portrait, paced by the player.

---

## 1. High Concept

**Stellar Reach** is a turn-based, low-intensity trading and management
simulator wrapped in the aesthetic of a sleek futuristic datapad. The player
is a starship captain working their way up from a battered hauler to a
fleet of stations and crews. The galaxy is procedurally generated on every
new campaign: the systems, stations, races, names, markets, and news are all
fresh, but the rules are consistent and learnable.

The fantasy is being a *trader*, not a fighter. Combat exists (pirates,
customs cutters, anomalies) but it is resolved through skill checks against
your crew rather than action minigames. Players make 2-3 meaningful choices
per turn — buy, sell, plot, choose — never a constant stream of micro-inputs.

---

## 2. Pillars

1.  **Calm density.** Lots of decisions, no time pressure. Numbers update
    when you act, not on a clock.
2.  **Emergent narrative.** A trade is never just a trade. It happens because
    of news in another system, the Empath in your crew, the legality you can
    afford to ignore, and the route you took to get there.
3.  **Portrait, one-handed.** The entire UX assumes a thumb on a 6-inch
    phone. Tap targets are large. Scroll is vertical. Modals slide up from
    the bottom.
4.  **Authored systems, generated content.** The good list, the trait list,
    and the event list are hand-written. The galaxy is randomly assembled
    from those parts each game so it always feels like a real place.

---

## 3. Core Loop

Each "turn" consists of:

1.  **Dock & Assess.** The HUD shows the current station, its kind, the race
    that runs it, your credits, your day. The Market screen lists every good
    the station carries with current price, supply, and demand. The News
    screen shows what is happening across the galaxy.
2.  **Trade & Upgrade.** Buy low and sell high. Spend profits at the Ship
    screen on hull, cargo, drive, shield, sensor, and utility modules. Visit
    the Crew screen to hire from the local roster, dismiss tired crew, or
    rest stressed crew in the Sensory Deprivation Pod.
3.  **Dispatch or Depart.** From the Missions screen you can hire a courier
    crew to ferry cargo while you stay docked. From the Helm screen you tap
    a destination on the star map and choose a Safe or Fast route. The Safe
    route burns more fuel but provokes fewer events; the Fast route is
    cheaper but rolls 1-2 transit events.
4.  **Transit Events.** Each event is a card with 2-3 choices. Choices test a
    crew role (Pilot, Engineer, Negotiator, Gunner, Medic, Diplomat,
    Scientist, Quartermaster) by rolling a d20 plus the best qualified
    crew member's effective skill against a difficulty class. Outcomes
    change credits, cargo, hull, fuel, or stress.
5.  **Arrival.** When all events are resolved, the day advances by the
    route's cost in days. Wages are paid, crew stress drifts, news ages,
    markets drift toward baseline and react to active news, and any
    couriers whose end day has arrived resolve.

There is no "Game Over" unless your hull is destroyed in transit and you
cannot afford to recover; bankruptcy is recoverable through small jobs and
courier work.

---

## 4. World

### 4.1 Galaxy Structure

A galaxy contains 14 star systems by default, distributed across four
concentric regions:

-   **Core** — the wealthy, lawful inner systems.
-   **Inner** — the bulk of trade traffic.
-   **Frontier** — sparse, opportunity-rich, dangerous.
-   **Lawless** — black markets, contraband, voidkin ports.

Each system has 1-3 stations. Each station has a `kind` (Trade Hub,
Industrial, Agricultural, Research, Mining, Military, Frontier Outpost,
Pleasure Resort, Refinery, Black Market) and a controlling race.

### 4.2 Sentient Races

Six playable cultures shape station markets. Every station inherits
cultural import/export biases from its race in addition to the kind biases.

| Race | Flavour | Surplus | Demand |
|---|---|---|---|
| Terran Concord | Pragmatic merchant federations | Refined, Tech, Foodstuffs | Raw, Energy, Luxury |
| Vendari Houses | Aesthete merchant clans | Luxury, Cultural, Refined | Raw, Foodstuffs, Tech |
| Kresh Hegemony | Militant chitin-armoured warriors | Weapons, Refined | Foodstuffs, Medical, Energy |
| Silicari Synod | Crystalline collective minds | Tech, Data, Raw | Energy, Biological, Luxury |
| Aelyn Bloomkin | Plant-symbiont biologists | Biological, Medical, Foodstuffs | Raw, Refined, Tech |
| Voidkin Drift | Lawless nomadic shadow-cult | Contraband, Cultural, Data | Weapons, Medical, Luxury |

### 4.3 Goods

The catalogue contains 36 goods spanning twelve categories: Foodstuffs,
Raw Materials, Refined Goods, Technology, Medical, Luxury, Weapons, Energy,
Biological, Contraband, Data, Cultural. Each good has a base price, a
cargo bulk cost, and a legality (`legal`, `restricted`, `illegal`).
Restricted and illegal goods are not stocked everywhere, may be confiscated
during customs inspections, and fetch large premiums where they are wanted.

### 4.4 Dynamic Economy

Prices are not a static lookup. Every day each station drifts each price
30% of the way back toward its baseline (good base price × race bias ×
station kind bias × race tradeBias) and applies all currently active news
items. A typical news effect is a +30% to +60% spike or a -25% to -40%
crash on either a single good or a whole category in a specified system,
decaying over 3-7 days. Player buying nudges price up; selling nudges it
down, simulating local supply pressure.

### 4.5 News Feed

Each in-game day, 0-2 news items are generated. Headlines mention concrete
in-game systems: "Solar flare devastates Cygnus Reach ag-domes" or
"Pirate gangs choke Lyra Drift shipping lanes." Reading the feed is a
strategic act: news is the most reliable predictor of future profit.

---

## 5. Crew

### 5.1 Roles

Pilot, Engineer, Negotiator, Gunner, Medic, Diplomat, Scientist,
Quartermaster. Each role is tested by specific events and provides passive
benefits while present and not resting. Negotiators bend buy and sell prices.

### 5.2 Energy States

Crew do not have hit points. They have an *energy frequency* derived from
their stress level:

-   **Radiant** (stress < 16) — +2 effective skill.
-   **Focused** (stress < 36) — +1 effective skill.
-   **Grounded** (stress < 61) — neutral.
-   **Chaotic** (stress < 81) — -1 effective skill.
-   **Depleted** (stress >= 81) — -3 effective skill.

### 5.3 Traits

Each crew member has 1-2 traits drawn from a fixed pool (Empath, Anxious
Attachment, Stoic, Jaded, Optimist, Stim Addict, Analyst, Silver Tongue,
Green, Old Hand, Combat Trauma, Lucky). Traits modify role-specific skill
checks, trade margins, stress gain, and stress recovery.

### 5.4 Management

The **Sensory Deprivation Pod** is a Utility module that accelerates stress
recovery for any crew member toggled to "rest." Stress also drifts down on
its own each day. When stressed crew are required for events, the captain
must choose between underperforming with what they have or paying the wages
of a deeper bench.

### 5.5 Hiring

Each station refreshes a roster of up to four candidates whenever you
arrive. Each candidate has a daily wage and a signing fee equal to five
days' wages. Crew capacity is capped at 8.

---

## 6. Ship

The ship has six hardpoints: Hull, Cargo, Drive, Shield, Sensor, Utility.
Each is a single-slot upgrade tree of three or more modules. Replacing a
module subtracts the slot's previous bonuses and adds the new module's
effects. Modules cost between free (starter) and 18,000 credits (top-tier
antimatter drive). Cargo currently held when downsizing is preserved up to
the new cap.

Travel cost in fuel is `max(2, distance / 12)` for fast routes and 40%
more for safe routes. Travel time in days is `max(1, distance / (12 ×
speed))`. Effective evasion adds to all transit event rolls.

---

## 7. Couriers

Players do not have to fly every shipment themselves. From the Missions
screen the player can hire an independent crew to deliver a chosen amount
of cargo to any other station at a fixed up-front fee plus per-unit cost.
The pay rate is computed against the current market price at the
destination (~92% of that price per unit) so the courier captures a small
spread for the risk. Couriers resolve in days roughly equal to the safe
route time + 1. About 85% of courier missions complete successfully; the
rest fail and the cargo is lost.

This is the "hire a crew to send materials" track and the "do it yourself
with your crew" track. They share the same world, the same prices, and the
same news feed.

---

## 8. UI

The whole game looks like a futuristic datapad. Dark navy background,
neon cyan / violet / amber accents, monospace digits where numbers matter,
and uppercased lapidary tabs. Layout:

-   **Top Bar.** Station name, system, region, kind, race; day counter;
    credits; LOG button.
-   **Bottom Tab Bar.** Market, Ship, Crew, Helm, News, Jobs.
-   **Trip Modal.** Slides up from below during transit, showing the
    current event and the choices available, then a "Dock" button.
-   **Captain's Log.** Reachable from the LOG button; chronological list of
    every event, trade, hire, and arrival, plus an Abandon Campaign button.

---

## 9. Progression Arcs

-   **Early game (days 1-30).** Find a profitable lane. Keep two crew
    members happy. Top off fuel. Survive your first pirate roll.
-   **Mid game (days 30-100).** Upgrade to a Hyper Drive Mk II and an
    Expanded Hold. Hire a Negotiator and a Gunner. Run two couriers a
    day while flying your own milk run.
-   **Late game (days 100+).** Antimatter drive, Industrial hold,
    Resonant Field. A crew of seven or eight, no member more stressed
    than Focused. Five couriers in flight. Watch the news feed for
    region-wide spikes and arbitrage them.

---

## 10. Save / Load

The entire game state is JSON-serialisable. It is written to
`localStorage` after every action and reloaded on launch. Abandoning a
campaign clears the save. There is no cloud sync.

---

## 11. Accessibility & Platform

-   Portrait, mobile-first; max width 600px on larger screens.
-   All tap targets are >= 44px tall.
-   Colour is never the only signal: legality, success/failure, and
    energy states all carry a label as well as a colour.
-   The game ships as a Progressive Web App. Once loaded, the service
    worker caches the shell and the game runs offline. Players can
    install it to their home screen on iOS and Android.
-   No emojis appear in the game UI or its written content.

---

## 12. Out of Scope (for v1)

-   Real-time space combat.
-   Multiplayer.
-   Narrative-arc questlines beyond emergent transit events.
-   Owning stations and capital fleets (sketched as a late-game stretch
    in §9 but reserved for a post-v1 update).
