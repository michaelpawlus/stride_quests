import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "stride_quests.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

type QuestSeed = {
  name: string;
  description: string;
  flavorText: string;
  type: "point_to_point" | "collector" | "scavenger";
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  restCreditReward: number;
  checkpoints: {
    name: string;
    description: string;
    hint?: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    sortOrder: number;
    isRevealed: boolean;
  }[];
};

const questSeeds: QuestSeed[] = [
  // === POINT-TO-POINT (Easy) ===
  {
    name: "The Oval Sprint",
    description:
      "Race across the heart of Ohio State's campus, from the iconic Oval to the legendary Ohio Stadium.",
    flavorText:
      "Every Buckeye knows the path. Now prove you can run it.",
    type: "point_to_point",
    difficulty: "easy",
    xpReward: 100,
    restCreditReward: 1,
    checkpoints: [
      {
        name: "The Oval",
        description: "Start at the center of OSU's historic Oval",
        latitude: 39.9995,
        longitude: -83.0108,
        radiusMeters: 100,
        sortOrder: 0,
        isRevealed: true,
      },
      {
        name: "Ohio Stadium",
        description: "Finish at The Horseshoe",
        latitude: 40.0017,
        longitude: -83.0197,
        radiusMeters: 150,
        sortOrder: 1,
        isRevealed: true,
      },
    ],
  },
  {
    name: "Scioto Mile Passage",
    description:
      "Trace the Scioto Mile from the riverfront park to COSI, one of Columbus's most scenic stretches.",
    flavorText:
      "The river remembers every footfall. Add yours to its memory.",
    type: "point_to_point",
    difficulty: "easy",
    xpReward: 100,
    restCreditReward: 1,
    checkpoints: [
      {
        name: "Scioto Mile Fountain",
        description: "Start at the iconic riverfront fountains",
        latitude: 39.9575,
        longitude: -83.0037,
        radiusMeters: 100,
        sortOrder: 0,
        isRevealed: true,
      },
      {
        name: "COSI",
        description: "Finish at the Center of Science and Industry",
        latitude: 39.9588,
        longitude: -83.0072,
        radiusMeters: 100,
        sortOrder: 1,
        isRevealed: true,
      },
    ],
  },
  {
    name: "German Village Wanderer",
    description:
      "Wind through the charming brick streets of German Village, from Schiller Park to the Book Loft.",
    flavorText:
      "Cobblestones and history beneath every stride.",
    type: "point_to_point",
    difficulty: "easy",
    xpReward: 100,
    restCreditReward: 1,
    checkpoints: [
      {
        name: "Schiller Park",
        description: "Start at the heart of German Village's park",
        latitude: 39.9439,
        longitude: -82.9927,
        radiusMeters: 100,
        sortOrder: 0,
        isRevealed: true,
      },
      {
        name: "The Book Loft",
        description: "Finish at the famous 32-room bookstore",
        latitude: 39.9449,
        longitude: -82.9948,
        radiusMeters: 80,
        sortOrder: 1,
        isRevealed: true,
      },
    ],
  },
  {
    name: "Arena to Arch",
    description:
      "Run from Nationwide Arena through the Short North Arts District to the iconic Short North arches.",
    flavorText:
      "From puck drops to painted walls — the city pulses under your feet.",
    type: "point_to_point",
    difficulty: "easy",
    xpReward: 100,
    restCreditReward: 1,
    checkpoints: [
      {
        name: "Nationwide Arena",
        description: "Start at the home of the Blue Jackets",
        latitude: 39.9693,
        longitude: -83.006,
        radiusMeters: 120,
        sortOrder: 0,
        isRevealed: true,
      },
      {
        name: "Short North Arches",
        description: "Finish under the illuminated arches on High Street",
        latitude: 39.9773,
        longitude: -83.0041,
        radiusMeters: 80,
        sortOrder: 1,
        isRevealed: true,
      },
    ],
  },

  // === COLLECTOR (Medium) ===
  {
    name: "Parks of the Capital",
    description:
      "Visit three of Columbus's beloved parks in a single run. Order doesn't matter — just get to all three!",
    flavorText:
      "The city's green lungs await. Breathe deep and run free.",
    type: "collector",
    difficulty: "medium",
    xpReward: 250,
    restCreditReward: 2,
    checkpoints: [
      {
        name: "Goodale Park",
        description: "The oldest park in Columbus, in the heart of Victorian Village",
        latitude: 39.9746,
        longitude: -83.0096,
        radiusMeters: 120,
        sortOrder: 0,
        isRevealed: true,
      },
      {
        name: "Topiary Park",
        description: "A living recreation of Seurat's painting in topiary form",
        latitude: 39.9611,
        longitude: -82.987,
        radiusMeters: 100,
        sortOrder: 1,
        isRevealed: true,
      },
      {
        name: "Bicentennial Park",
        description: "Riverfront park with fountains and performance space",
        latitude: 39.9569,
        longitude: -83.0025,
        radiusMeters: 100,
        sortOrder: 2,
        isRevealed: true,
      },
    ],
  },
  {
    name: "Campus Landmarks",
    description:
      "Hit three iconic Ohio State landmarks. Show your campus knowledge by visiting them all.",
    flavorText:
      "O-H! ...now go find I-O across campus.",
    type: "collector",
    difficulty: "medium",
    xpReward: 250,
    restCreditReward: 2,
    checkpoints: [
      {
        name: "Thompson Library",
        description: "The main library and architectural gem of campus",
        latitude: 39.9991,
        longitude: -83.015,
        radiusMeters: 80,
        sortOrder: 0,
        isRevealed: true,
      },
      {
        name: "Mirror Lake",
        description: "The serene campus pond surrounded by trees",
        latitude: 39.9967,
        longitude: -83.0118,
        radiusMeters: 80,
        sortOrder: 1,
        isRevealed: true,
      },
      {
        name: "Wexner Center",
        description: "The avant-garde arts center with its distinctive scaffolding design",
        latitude: 40.0001,
        longitude: -83.0089,
        radiusMeters: 80,
        sortOrder: 2,
        isRevealed: true,
      },
    ],
  },

  // === COLLECTOR (Hard) ===
  {
    name: "Brewery Trail",
    description:
      "Columbus is a craft beer capital. Run past three legendary breweries in one epic outing.",
    flavorText:
      "Earn your post-run pint the hard way.",
    type: "collector",
    difficulty: "hard",
    xpReward: 400,
    restCreditReward: 3,
    checkpoints: [
      {
        name: "North High Brewing",
        description: "A Short North staple for craft beer lovers",
        latitude: 39.9792,
        longitude: -83.0043,
        radiusMeters: 80,
        sortOrder: 0,
        isRevealed: true,
      },
      {
        name: "Land-Grant Brewing",
        description: "A Franklinton favorite in the up-and-coming west side",
        latitude: 39.9596,
        longitude: -83.026,
        radiusMeters: 80,
        sortOrder: 1,
        isRevealed: true,
      },
      {
        name: "Seventh Son Brewing",
        description: "Italian Village's beloved neighborhood brewery",
        latitude: 39.9832,
        longitude: -83.0001,
        radiusMeters: 80,
        sortOrder: 2,
        isRevealed: true,
      },
    ],
  },
  {
    name: "Olentangy Trail Explorer",
    description:
      "Follow the Olentangy Trail through three key waypoints. A true Columbus distance challenge.",
    flavorText:
      "The trail stretches north like an arrow. How far will you follow?",
    type: "collector",
    difficulty: "hard",
    xpReward: 400,
    restCreditReward: 3,
    checkpoints: [
      {
        name: "Confluence Park",
        description: "Where the Olentangy meets the Scioto",
        latitude: 39.9553,
        longitude: -83.0134,
        radiusMeters: 120,
        sortOrder: 0,
        isRevealed: true,
      },
      {
        name: "Tuttle Park",
        description: "Green space along the trail near campus",
        latitude: 40.0057,
        longitude: -83.0227,
        radiusMeters: 100,
        sortOrder: 1,
        isRevealed: true,
      },
      {
        name: "Whetstone Park of Roses",
        description: "The famous rose garden in Clintonville",
        latitude: 40.0391,
        longitude: -83.0269,
        radiusMeters: 120,
        sortOrder: 2,
        isRevealed: true,
      },
    ],
  },

  // === SCAVENGER (Medium) ===
  {
    name: "The Hidden Deer",
    description:
      "Somewhere in Columbus, a metallic deer watches over the city. Find it using only your hint.",
    flavorText:
      "Not all who wander are lost... but you might be.",
    type: "scavenger",
    difficulty: "medium",
    xpReward: 200,
    restCreditReward: 2,
    checkpoints: [
      {
        name: "The Deer",
        description: "A public art deer sculpture",
        hint: "Look where the Short North meets Victorian Village, near a park that predates the Civil War.",
        latitude: 39.9752,
        longitude: -83.0078,
        radiusMeters: 80,
        sortOrder: 0,
        isRevealed: false,
      },
    ],
  },
  {
    name: "The Cornfield Sentinel",
    description:
      "A strange field of concrete stands sentinel on the north side. Can you find Sam Browne's eerie creation?",
    flavorText:
      "109 ears, but none of them listen.",
    type: "scavenger",
    difficulty: "medium",
    xpReward: 200,
    restCreditReward: 2,
    checkpoints: [
      {
        name: "Field of Corn",
        description: "Sam Browne's concrete corn sculpture installation",
        hint: "Dublin, OH — where concrete grows in neat rows near a road named for something franked.",
        latitude: 40.0988,
        longitude: -83.1158,
        radiusMeters: 100,
        sortOrder: 0,
        isRevealed: false,
      },
    ],
  },

  // === SCAVENGER (Hard) ===
  {
    name: "The Leatherlips Legend",
    description:
      "A giant stone face gazes over the reservoir. Track down the tribute to the Wyandot chief.",
    flavorText:
      "He faced death with dignity. His stone likeness faces the water with patience.",
    type: "scavenger",
    difficulty: "hard",
    xpReward: 300,
    restCreditReward: 2,
    checkpoints: [
      {
        name: "Chief Leatherlips Monument",
        description: "The massive stone bust overlooking Scioto River",
        hint: "Look near the reservoir in Dublin, where a chief's stone face watches the water from a wooded bluff.",
        latitude: 40.1263,
        longitude: -83.0957,
        radiusMeters: 100,
        sortOrder: 0,
        isRevealed: false,
      },
    ],
  },
  {
    name: "The Statehouse Secret",
    description:
      "Three hidden gems surround the Ohio Statehouse. Decode the hints to find each one in sequence.",
    flavorText:
      "Power, art, and memory converge on Capitol Square. The secrets hide in plain sight.",
    type: "scavenger",
    difficulty: "hard",
    xpReward: 500,
    restCreditReward: 3,
    checkpoints: [
      {
        name: "First Secret",
        description: "A civil war memorial",
        hint: "On the statehouse grounds, soldiers stand frozen in bronze. Find where they remember those who didn't come home.",
        latitude: 39.9612,
        longitude: -82.999,
        radiusMeters: 60,
        sortOrder: 0,
        isRevealed: false,
      },
      {
        name: "Second Secret",
        description: "The veterans memorial",
        hint: "Descend below ground level, where names are carved in stone and light filters through water.",
        latitude: 39.9619,
        longitude: -83.0003,
        radiusMeters: 60,
        sortOrder: 1,
        isRevealed: false,
      },
      {
        name: "Third Secret",
        description: "The west plaza sculpture",
        hint: "On the western face of power, modern art dances near the street. What does the abstract form whisper?",
        latitude: 39.9614,
        longitude: -83.0019,
        radiusMeters: 60,
        sortOrder: 2,
        isRevealed: false,
      },
    ],
  },
];

async function seed() {
  console.log("Seeding Stride Quests database...");

  for (const quest of questSeeds) {
    const rows = db
      .insert(schema.quests)
      .values({
        name: quest.name,
        description: quest.description,
        flavorText: quest.flavorText,
        type: quest.type,
        difficulty: quest.difficulty,
        xpReward: quest.xpReward,
        restCreditReward: quest.restCreditReward,
      })
      .returning()
      .all();
    const insertedQuest = rows[0];

    for (const cp of quest.checkpoints) {
      db.insert(schema.questCheckpoints)
        .values({
          questId: insertedQuest.id,
          name: cp.name,
          description: cp.description,
          hint: cp.hint ?? null,
          latitude: cp.latitude,
          longitude: cp.longitude,
          radiusMeters: cp.radiusMeters,
          sortOrder: cp.sortOrder,
          isRevealed: cp.isRevealed,
        })
        .run();
    }

    console.log(`  Seeded quest: ${quest.name} (${quest.checkpoints.length} checkpoints)`);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
