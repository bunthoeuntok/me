import { describe, expect, it } from "vitest";
import { profile } from "../content";
import { createCity, districtAt, layout, relayout, step, type City } from "./city-model";

const VIEWPORTS = {
  "phone portrait": { width: 412, height: 839 },
  "phone landscape": { width: 839, height: 412 },
  desktop: { width: 1280, height: 720 },
};

describe.each(Object.entries(VIEWPORTS))("City layout on %s", (_, viewport) => {
  const city = layout(viewport, profile);

  it("lays the Districts out left to right in story order", () => {
    expect(city.districts.map((d) => d.id)).toEqual([
      "intro",
      "about",
      "experience",
      "projects",
      "contact",
    ]);
  });

  it("makes one continuous street with no gaps between Districts", () => {
    expect(city.districts[0].start).toBe(0);
    city.districts.slice(1).forEach((district, i) => {
      expect(district.start).toBe(city.districts[i].end);
    });
    expect(city.districts.at(-1)!.end).toBe(city.streetLength);
  });

  it("gives each District at least a screen's width", () => {
    for (const district of city.districts) {
      expect(district.end - district.start).toBeGreaterThanOrEqual(viewport.width);
    }
  });

  it("puts the street inside the screen", () => {
    expect(city.groundY).toBeGreaterThan(viewport.height / 2);
    expect(city.groundY).toBeLessThan(viewport.height);
  });
});

describe("City layout with on-screen controls", () => {
  it("keeps the street surface above the band reserved for touch controls", () => {
    const viewport = { ...VIEWPORTS["phone portrait"], controlsHeight: 100 };
    const city = layout(viewport, profile);
    expect(city.groundY).toBeLessThanOrEqual(viewport.height - viewport.controlsHeight);
  });
});

describe("City layout and content", () => {
  it("widens the Experience District when there are more jobs to show", () => {
    const viewport = VIEWPORTS.desktop;
    const manyJobs = { ...profile, jobs: Array(8).fill(profile.jobs[0]) };
    const width = (city: ReturnType<typeof layout>) => {
      const experience = city.districts.find((d) => d.id === "experience")!;
      return experience.end - experience.start;
    };

    expect(width(layout(viewport, manyJobs))).toBeGreaterThan(width(layout(viewport, profile)));
  });
});

describe("walking the Hero", () => {
  const SECOND = 1000;
  // The Hero walks at 500 px/s (the speed the original game was tuned to).
  const WALK_SPEED = 500;

  function cityWithHeroAt(x: number): City {
    const city = createCity(layout(VIEWPORTS.desktop, profile));
    return { ...city, hero: { ...city.hero, x } };
  }

  it("starts the Hero in the Intro District", () => {
    const city = createCity(layout(VIEWPORTS.desktop, profile));
    const intro = city.layout.districts[0];
    expect(city.hero.x).toBeGreaterThanOrEqual(intro.start);
    expect(city.hero.x).toBeLessThan(intro.end);
  });

  it("walks right while right is held", () => {
    const city = step(cityWithHeroAt(1000), { right: true }, SECOND);
    expect(city.hero.x).toBeCloseTo(1000 + WALK_SPEED);
    expect(city.hero.facing).toBe("right");
  });

  it("walks left while left is held", () => {
    const city = step(cityWithHeroAt(1000), { left: true }, SECOND);
    expect(city.hero.x).toBeCloseTo(1000 - WALK_SPEED);
    expect(city.hero.facing).toBe("left");
  });

  it("stands still with no input, still facing the way it last walked", () => {
    const walkedLeft = step(cityWithHeroAt(1000), { left: true }, 100);
    const city = step(walkedLeft, {}, SECOND);
    expect(city.hero.x).toBe(walkedLeft.hero.x);
    expect(city.hero.facing).toBe("left");
    expect(city.hero.walking).toBe(false);
  });

  it("stops at the start and the end of the street", () => {
    const start = step(cityWithHeroAt(100), { left: true }, SECOND);
    const streetLength = start.layout.streetLength;
    const end = step(cityWithHeroAt(streetLength - 100), { right: true }, SECOND);

    expect(start.hero.x).toBeGreaterThanOrEqual(0);
    expect(start.hero.x).toBeLessThan(100);
    expect(end.hero.x).toBeLessThanOrEqual(streetLength);
    expect(end.hero.x).toBeGreaterThan(streetLength - 100);
  });
});

describe("resizing the City", () => {
  it("keeps the Hero at the same spot in the same District", () => {
    const desktop = createCity(layout(VIEWPORTS.desktop, profile));
    const experience = desktop.layout.districts.find((d) => d.id === "experience")!;
    const quarterIn = experience.start + (experience.end - experience.start) / 4;
    const before: City = { ...desktop, hero: { ...desktop.hero, x: quarterIn, facing: "left" } };

    const after = relayout(before, layout(VIEWPORTS["phone portrait"], profile));

    const resized = after.layout.districts.find((d) => d.id === "experience")!;
    expect(after.hero.x).toBeCloseTo(resized.start + (resized.end - resized.start) / 4);
    expect(after.hero.facing).toBe("left");
  });
});

describe("which District the Hero is in", () => {
  const city = createCity(layout(VIEWPORTS.desktop, profile));
  const at = (x: number) => districtAt({ ...city, hero: { ...city.hero, x } }).id;

  it("is the District whose stretch of street the Hero stands on", () => {
    const about = city.layout.districts[1];
    expect(at(about.start - 1)).toBe("intro");
    expect(at(about.start)).toBe("about");
  });

  it("is the last District at the very end of the street", () => {
    expect(at(city.layout.streetLength)).toBe("contact");
  });
});

describe("resizing at the ends of the street", () => {
  it("keeps the Hero fully on the street when the street gets shorter", () => {
    const wide = createCity(layout({ width: 1920, height: 1080 }, profile));
    const atTheEnd = step(wide, { right: true }, 60_000);

    const narrow = relayout(atTheEnd, layout(VIEWPORTS["phone portrait"], profile));

    expect(districtAt(narrow).id).toBe("contact");
    const stillThere = step(narrow, {}, 0);
    expect(narrow.hero.x).toBe(stillThere.hero.x);
  });
});
