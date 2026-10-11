// The City's rules, independent of Phaser: where things are and how the Hero moves.
// The City scene only draws this state and feeds it the Visitor's input.
import type { Profile } from "../content";

export type DistrictId = "intro" | "about" | "experience" | "projects" | "contact";

export interface Viewport {
  width: number;
  height: number;
  /** Height reserved at the bottom of the screen for on-screen controls (touch devices). */
  controlsHeight?: number;
}

export interface District {
  id: DistrictId;
  /** World x where the District begins (inclusive). */
  start: number;
  /** World x where the District ends (exclusive); the next one starts here. */
  end: number;
}

export interface CityLayout {
  districts: District[];
  streetLength: number;
  /** Screen y of the street surface the Hero stands on. */
  groundY: number;
}

const DISTRICT_ORDER: DistrictId[] = ["intro", "about", "experience", "projects", "contact"];

/** Narrow screens still get a street worth walking: a District is never narrower than this. */
const MIN_DISTRICT_WIDTH = 900;
/** Room per job building in the Experience District. */
const WIDTH_PER_JOB = 420;
/** The street surface sits this far above the bottom of the screen (road + info strip). */
const GROUND_OFFSET = 70;

export function layout(viewport: Viewport, content: Profile): CityLayout {
  const baseWidth = Math.max(viewport.width, MIN_DISTRICT_WIDTH);
  const widthOf = (id: DistrictId) =>
    id === "experience" ? Math.max(baseWidth, content.jobs.length * WIDTH_PER_JOB) : baseWidth;

  let x = 0;
  const districts = DISTRICT_ORDER.map((id) => {
    const district = { id, start: x, end: x + widthOf(id) };
    x = district.end;
    return district;
  });

  const bottomBand = Math.max(GROUND_OFFSET, viewport.controlsHeight ?? 0);
  return { districts, streetLength: x, groundY: viewport.height - bottomBand };
}

export interface CityInput {
  left?: boolean;
  right?: boolean;
}

export interface Hero {
  /** World x of the Hero's centre. */
  x: number;
  facing: "left" | "right";
  walking: boolean;
}

export interface City {
  layout: CityLayout;
  hero: Hero;
}

const WALK_SPEED = 500; // px per second
/** Half the Hero's body width: how close its centre can get to either end of the street. */
const HERO_HALF_WIDTH = 30;
/** Where the Hero first appears, from the start of the street. */
const HERO_START_X = 160;

export function createCity(cityLayout: CityLayout): City {
  return {
    layout: cityLayout,
    hero: { x: HERO_START_X, facing: "right", walking: false },
  };
}

/** Advances the City by `elapsedMs` of the Visitor holding `input`. */
export function step(city: City, input: CityInput, elapsedMs: number): City {
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const { hero, layout: cityLayout } = city;

  const x = clampToStreet(hero.x + direction * WALK_SPEED * (elapsedMs / 1000), cityLayout);
  const facing = direction > 0 ? "right" : direction < 0 ? "left" : hero.facing;

  return { ...city, hero: { x, facing, walking: direction !== 0 } };
}


/** The District the Hero is standing in (the last one at the very end of the street). */
export function districtAt(city: City): District {
  return districtIndexAt(city.layout, city.hero.x).district;
}

/** Swaps in a layout for a new screen size, keeping the Hero at the same spot in its District. */
export function relayout(city: City, newLayout: CityLayout): City {
  const { district: from, index } = districtIndexAt(city.layout, city.hero.x);
  const to = newLayout.districts[index];
  const progress = (city.hero.x - from.start) / (from.end - from.start);

  return {
    layout: newLayout,
    hero: { ...city.hero, x: clampToStreet(to.start + progress * (to.end - to.start), newLayout) },
  };
}

function districtIndexAt(cityLayout: CityLayout, x: number) {
  const { districts } = cityLayout;
  const found = districts.findIndex((d) => x < d.end);
  const index = found === -1 ? districts.length - 1 : found;
  return { district: districts[index], index };
}

/** Keeps the Hero's whole body on the street. */
function clampToStreet(x: number, cityLayout: CityLayout) {
  return clamp(x, HERO_HALF_WIDTH, cityLayout.streetLength - HERO_HALF_WIDTH);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
