import { arrowFunctionExpression } from "@babel/types";

const Asuras = {
  location: "Asuras",
  choices: [
    {
      name: "Palace",
      link: "https://tibia.fandom.com/wiki/Asura_Palace",
    },
    {
      name: "Mirror",
      link: "https://tibia.fandom.com/wiki/The_Secret_Library_Quest#The_Lament",
    },
    {
      name: "True Asuras",
      link: "https://tibia.fandom.com/wiki/Asura_Vaults",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const BuriedCathedral = {
  location: "Buried Cathedral",
  choices: [
    {
      name: "Floor-6",
      link: "https://tibia.fandom.com/wiki/The_Dream_Courts_Quest",
    },
    {
      name: "Floor-7",
      link: "https://tibia.fandom.com/wiki/Buried_Cathedral",
    },
    {
      name: "Floor-8",
      link: "https://tibia.fandom.com/wiki/The_Dream_Courts_Quest#Buried_Cathedral",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Cobras = {
  location: "Cobras",
  choices: [
    {
      name: "Bastion",
      link: "https://tibia.fandom.com/wiki/Cobra_Bastion",
    },
    {
      name: "Gaffir",
      link: "https://tibia.fandom.com/wiki/Gaffir",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Feru = {
  location: "Feru",
  choices: [
    {
      name: "Grounds of Plague",
      link: "https://tibia.fandom.com/wiki/Grounds_of_Plague",
    },
    {
      name: "Grounds of Deceit",
      link: "https://tibia.fandom.com/wiki/Grounds_of_Deceit",
    },
    {
      name: "Grounds of Fire",
      link: "https://tibia.fandom.com/wiki/Grounds_of_Fire",
    },
    {
      name: "Grounds of Destruction",
      link: "https://tibia.fandom.com/wiki/Grounds_of_Destruction",
    },
    {
      name: "Grounds of Undeath",
      link: "https://tibia.fandom.com/wiki/Grounds_of_Undeath",
    },
    {
      name: "Grounds of Despair",
      link: "https://tibia.fandom.com/wiki/Grounds_of_Despair",
    },
    {
      name: "Grounds of Damnation",
      link: "https://tibia.fandom.com/wiki/Grounds_of_Damnation",
    },
    {
      name: "Feru Way",
      link: "https://tibia.fandom.com/wiki/Ferumbras%27_Ascension_Quest",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const FlimsyVenore = {
  location: "flimsy-venore",
  choices: [
    {
      name: "Flimsy -1",
      link: "https://tibia.fandom.com/wiki/Monster_Graveyard",
    },
    {
      name: "Flimsy -2",
      link: "https://tibia.fandom.com/wiki/Crystal_Enigma",
    },
    {
      name: "Flimsy -3",
      link: "https://tibia.fandom.com/wiki/Sparkling_Pools",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Gnomprona = {
  location: "Gnomprona",
  choices: [
    {
      name: "Spiders",
      link: "https://tibia.fandom.com/wiki/Monster_Graveyard",
    },
    {
      name: "Headpeckers",
      link: "https://tibia.fandom.com/wiki/Crystal_Enigma",
    },
    {
      name: "Prehemoths",
      link: "https://tibia.fandom.com/wiki/Sparkling_Pools",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Ingol = {
  location: "Ingol",
  choices: [
    {
      name: "Ingol Surface",
      link: "https://tibia.fandom.com/wiki/Ingol?so=search",
    },
    {
      name: "Ingol -1",
      link: "https://tibia.fandom.com/wiki/Ingol#Harpy",
    },
    {
      name: "Ingol -2",
      link: "https://tibia.fandom.com/wiki/Ingol#Carnivostrich",
    },
    {
      name: "Ingol -3",
      link: "https://tibia.fandom.com/wiki/Ingol#Liodile",
    },
    {
      name: "Ingol -4",
      link: "https://tibia.fandom.com/wiki/Ingol#Crape_Man",
    },
    {
      name: "Ingol -5",
      link: "https://tibia.fandom.com/wiki/Ingol#Boar_Man",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Inquisition = {
  location: "Inquisition",
  choices: [
    {
      name: "The Dark Path",
      link: "https://tibia.fandom.com/wiki/The_Dark_Path",
    },
    {
      name: "The Crystal Caves",
      link: "https://tibia.fandom.com/wiki/The_Crystal_Caves",
    },
    {
      name: "The Blood Halls",
      link: "https://tibia.fandom.com/wiki/The_Blood_Halls",
    },
    {
      name: "The Vats",
      link: "https://tibia.fandom.com/wiki/The_Vats",
    },
    {
      name: "The Arcanum",
      link: "https://tibia.fandom.com/wiki/The_Arcanum",
    },
    {
      name: "The Hive",
      link: "https://tibia.fandom.com/wiki/The_Inquisition_Quest#The_Hive:_Hellgorak",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Issavi = {
  location: "Issavi",
  choices: [
    { name: "Exotic Cave", link: "https://tibia.fandom.com/wiki/Exotic_Cave" },
    {
      name: "Surface",
      link: "https://tibia.fandom.com/wiki/Kilmaresh_Central_Steppe",
    },
    {
      name: "Issavi Sewers",
      link: "https://tibia.fandom.com/wiki/Issavi_Sewers",
    },
    { name: "Green Belt", link: "https://tibia.fandom.com/wiki/Green_Belt" },
    {
      name: "Kilmaresh Catacombs -1",
      link: "https://tibia.fandom.com/wiki/Crypt_Warden",
    },
    {
      name: "Kilmaresh Catacombs -2",
      link: "https://tibia.fandom.com/wiki/Kilmaresh_Catacombs",
    },
    { name: "Salt Caves", link: "https://tibia.fandom.com/wiki/Salt_Caves" },
    { name: "Pirat Mine", link: "https://tibia.fandom.com/wiki/Pirat_Mine" },
    {
      name: "The Wreckoning",
      link: "https://tibia.fandom.com/wiki/The_Wreckoning",
    },
    {
      name: "Ruins of Nuur",
      link: "https://tibia.fandom.com/wiki/Ruins_of_Nuur",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const SecretLibrary = {
  location: "Secret Library",
  choices: [
    {
      name: "Fire Section",
      link: "https://tibia.fandom.com/wiki/Secret_Library#Fire_Section",
    },
    {
      name: "Energy Section",
      link: "https://tibia.fandom.com/wiki/Secret_Library#Energy_Section",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Nagas = {
  location: "Nagas",
  choices: [
    {
      name: "Temple of the Moon Goddess -1",
      link: "https://tibia.fandom.com/wiki/Temple_of_the_Moon_Goddess",
    },
    {
      name: "Temple of the Moon Goddess -2",
      link: "https://tibia.fandom.com/wiki/Marapur",
    },
    {
      name: "Great Pearl Fan Reef",
      link: "https://tibia.fandom.com/wiki/Great_Pearl_Fan_Reef",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Roshamuul = {
  location: "Roshamuul",
  choices: [
    {
      name: "Lower Roshamuul",
      link: "https://tibia.fandom.com/wiki/Lower_Roshamuul",
    },
    {
      name: "Roshamuul West",
      link: "https://tibia.fandom.com/wiki/Guzzlemaw_Valley",
    },
    {
      name: "Roshamuul Bones",
      link: "https://tibia.fandom.com/wiki/Upper_Roshamuul",
    },
    {
      name: "Prison -1",
      link: "https://tibia.fandom.com/wiki/Roshamuul_Prison#First_Floor_(-1)",
    },
    {
      name: "Prison -2",
      link: "https://tibia.fandom.com/wiki/Roshamuul_Prison#Second_Floor_(-2)",
    },
    {
      name: "Prison -3",
      link: "https://tibia.fandom.com/wiki/Roshamuul_Prison#Third_Floor_(-3)",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const RottenBlood = {
  location: "Rotten-Blood",
  choices: [
    {
      name: "Jaded Roots",
      link: "https://tibia.fandom.com/wiki/Jaded_Roots",
    },
    {
      name: "Putrefactory",
      link: "https://tibia.fandom.com/wiki/Putrefactory",
    },
    {
      name: "Gloom Pillars",
      link: "https://tibia.fandom.com/wiki/Gloom_Pillars",
    },
    {
      name: "Darklight Core",
      link: "https://tibia.fandom.com/wiki/Darklight_Core",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const IceLibrary = {
  location: "ice-library",
  choices: [
    {
      name: "Ice Section",
      link: "https://tibia.fandom.com/wiki/Secret_Library#Ice_Section",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Soulwar = {
  location: "Soulwar",
  choices: [
    {
      name: "Brachiodemons",
      link: "https://tibia.fandom.com/wiki/Claustrophobic_Inferno",
    },
    {
      name: "Rottens",
      link: "https://tibia.fandom.com/wiki/Rotten_Wasteland",
    },
    {
      name: "Fishes",
      link: "https://tibia.fandom.com/wiki/Ebb_and_Flow",
    },
    {
      name: "Crater",
      link: "https://tibia.fandom.com/wiki/Furious_Crater",
    },
    {
      name: "Dark Thais",
      link: "https://tibia.fandom.com/wiki/Mirrored_Nightmare",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Spectre = {
  location: "Spectre",
  choices: [
    {
      name: "Gazer Spectre",
      link: "https://tibia.fandom.com/wiki/Haunted_Temple",
    },
    {
      name: "Burster Spectre",
      link: "https://tibia.fandom.com/wiki/Haunted_Tomb",
    },
    {
      name: "Ripper Spectre",
      link: "https://tibia.fandom.com/wiki/Haunted_Cellar",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const TheDreamCourts = {
  location: "the-dream-courts",
  choices: [
    {
      name: "Court of Summer",
      link: "https://tibia.fandom.com/wiki/Court_of_Summer",
    },
    {
      name: "Court of Winter",
      link: "https://tibia.fandom.com/wiki/Court_of_Winter",
    },
    {
      name: "Dream Labyrinth",
      link: "https://tibia.fandom.com/wiki/Dream_Labyrinth",
    },
    {
      name: "Feyrist Meadows",
      link: "https://tibia.fandom.com/wiki/Feyrist_Meadows",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

const Weremonster = {
  location: "Weremonster",
  choices: [
    {
      name: "Werehyaena -1",
      link: "https://tibia.fandom.com/wiki/Werehyaena",
    },
    {
      name: "Werehyaena -2 North",
      link: "https://tibia.fandom.com/wiki/Werehyaena_Shaman",
    },
    {
      name: "Werehyaena -2 South",
      link: "https://tibia.fandom.com/wiki/Hyaena_Lairs",
    },
    {
      name: "Werelion -1",
      link: "https://tibia.fandom.com/wiki/Werelion",
    },
    {
      name: "Werelion -2",
      link: "https://tibia.fandom.com/wiki/Lion_Sanctum",
    },
    {
      name: "Werecrocodile -1",
      link: "https://tibia.fandom.com/wiki/Werecrocodile",
    },
    {
      name: "Werecrocodile -2",
      link: "https://tibia.fandom.com/wiki/Murky_Caverns",
    },
    {
      name: "Weretiger -1",
      link: "https://tibia.fandom.com/wiki/Weretiger",
    },
    {
      name: "Weretiger -2",
      link: "https://tibia.fandom.com/wiki/Oskayaat_Undercity",
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
};

export const getHuntingPlaceByName = (locationName: string) => {
  const locations = [
    Asuras,
    BuriedCathedral,
    Cobras,
    Feru,
    FlimsyVenore,
    Gnomprona,
    Ingol,
    Inquisition,
    Issavi,
    SecretLibrary,
    Nagas,
    Roshamuul,
    RottenBlood,
    IceLibrary,
    Soulwar,
    Spectre,
    TheDreamCourts,
    Weremonster,
  ];
  const matchingLocation = locations.find(
    (obj) => obj.location.toLowerCase() === locationName.toLowerCase()
  );
  return matchingLocation || null;
};

export const getHuntingPlaces = (choiceName: string) => {
  const locations = [
    Asuras,
    BuriedCathedral,
    Cobras,
    Feru,
    FlimsyVenore,
    Gnomprona,
    Ingol,
    Inquisition,
    Issavi,
    SecretLibrary,
    Nagas,
    Roshamuul,
    RottenBlood,
    IceLibrary,
    Soulwar,
    Spectre,
    TheDreamCourts,
    Weremonster,
  ];
  for (const location of locations) {
    const matchingChoice = location.choices.find(
      (choice) => choice.name.toLowerCase() === choiceName.toLowerCase()
    );

    if (matchingChoice) {
      return matchingChoice.name;
    }
  }
};
