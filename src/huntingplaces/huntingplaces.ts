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
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const BuriedCathedral = {
    location: "Buried-cathedral",
    choices: [
        {
            name: "Floor -6",
            link: "https://tibia.fandom.com/wiki/The_Dream_Courts_Quest",
        },
        {
            name: "Floor -7",
            link: "https://tibia.fandom.com/wiki/Buried_Cathedral",
        },
        {
            name: "Floor -8",
            link: "https://tibia.fandom.com/wiki/The_Dream_Courts_Quest#Buried_Cathedral",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};
const Bulltaurs = {
    location: "bulltaurs",
    choices: [
        {
            name: "Upper Bulltaur",
            link: "https://tibia.fandom.com/wiki/The_Dream_Courts_Quest",
        },
        {
            name: "Lower Bulltaur",
            link: "https://tibia.fandom.com/wiki/Buried_Cathedral",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const Cobras = {
    location: "Cobras",
    choices: [
        {
            name: "Bastion",
            link: "https://tibia.fandom.com/wiki/Cobra_Bastion",
        },
        {
            name: "Basement",
            link: "https://tibia.fandom.com/wiki/Gaffir",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};
const Dragolisks = {
    location: "Dragolisks",
    choices: [
        {
            name: "Upper Dragolisk",
            link: "https://tibia.fandom.com/wiki/Cobra_Bastion",
        },
        {
            name: "Lower Dragolisk",
            link: "https://tibia.fandom.com/wiki/Gaffir",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const Feru = {
    location: "Feru",
    choices: [
        {
            name: "Plagirath Seal",
            link: "https://tibia.fandom.com/wiki/Grounds_of_Plague",
        },
        {
            name: "Bazir Seal",
            link: "https://tibia.fandom.com/wiki/Grounds_of_Deceit",
        },
        {
            name: "Mazoran Seal",
            link: "https://tibia.fandom.com/wiki/Grounds_of_Fire",
        },
        {
            name: "Juggernaut Seal",
            link: "https://tibia.fandom.com/wiki/Grounds_of_Destruction",
        },
        {
            name: "Undead Seal",
            link: "https://tibia.fandom.com/wiki/Grounds_of_Undeath",
        },
        {
            name: "Pumin Seal",
            link: "https://tibia.fandom.com/wiki/Grounds_of_Despair",
        },
        {
            name: "DT Seal -1",
            link: "https://tibia.fandom.com/wiki/Grounds_of_Damnation",
        },
        {
            name: "DT Seal -2",
            link: "https://tibia.fandom.com/wiki/Grounds_of_Damnation#DarkTorturer",
        },
        {
            name: "Feru Way",
            link: "https://tibia.fandom.com/wiki/Ferumbras%27_Ascension_Quest",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const Flimsy = {
    location: "flimsy",
    choices: [
        {
            name: "Flimsy Jakundaf Desert",
            link: "https://tibia.fandom.com/wiki/Brain_Grounds",
        },
        {
            name: "Flimsy Banuta",
            link: "https://tibia.fandom.com/wiki/Netherworld",
        },
        {
            name: "Flimsy Vengoth",
            link: "https://tibia.fandom.com/wiki/Zarganash",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
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
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
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
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
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
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const Issavi = {
    location: "Issavi",
    choices: [
        {name: "Exotic Cave", link: "https://tibia.fandom.com/wiki/Exotic_Cave"},
        {
            name: "Surface",
            link: "https://tibia.fandom.com/wiki/Kilmaresh_Central_Steppe",
        },
        {
            name: "Issavi Sewers",
            link: "https://tibia.fandom.com/wiki/Issavi_Sewers",
        },
        {name: "Green Belt", link: "https://tibia.fandom.com/wiki/Green_Belt"},
        {
            name: "Kilmaresh Catacombs -1",
            link: "https://tibia.fandom.com/wiki/Crypt_Warden",
        },
        {
            name: "Kilmaresh Catacombs -2",
            link: "https://tibia.fandom.com/wiki/Kilmaresh_Catacombs",
        },

        {
            name: "The Wreckoning",
            link: "https://tibia.fandom.com/wiki/The_Wreckoning",
        },
        {
            name: "Ruins of Nuur Girtablilu",
            link: "https://tibia.fandom.com/wiki/Ruins_of_Nuur",
        },
        {
            name: "Salt Caves Bashmu",
            link: "https://tibia.fandom.com/wiki/Bashmu",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const SecretLibrary = {
    location: "Secret-Library",
    choices: [
        {
            name: "Fire Section",
            link: "https://tibia.fandom.com/wiki/Secret_Library#Fire_Section",
        },
        {
            name: "Energy Section",
            link: "https://tibia.fandom.com/wiki/Secret_Library#Energy_Section",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const Marapur = {
    location: "Marapur",
    choices: [
        {
            name: "Temple of the Moon Goddess",
            link: "https://tibia.fandom.com/wiki/Temple_of_the_Moon_Goddess",
        },
        {
            name: "Great Pearl Fan Reef",
            link: "https://tibia.fandom.com/wiki/Great_Pearl_Fan_Reef",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};
const Oramond = {
    location: "oramond",
    choices: [
        {
            name: "Catacombs East",
            link: "https://tibia.fandom.com/wiki/Temple_of_the_Moon_Goddess",
        },
        {
            name: "Catacombs West",
            link: "https://tibia.fandom.com/wiki/Great_Pearl_Fan_Reef",
        },
        {
            name: "Oramond Sewers",
            link: "https://tibia.fandom.com/wiki/Great_Pearl_Fan_Reef",
        },
        {
            name: "Raid East",
            link: "https://tibia.fandom.com/wiki/Great_Pearl_Fan_Reef",
        },
        {
            name: "Raid West",
            link: "https://tibia.fandom.com/wiki/Great_Pearl_Fan_Reef",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
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
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
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
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const IceLibrary = {
    location: "ice-library",
    choices: [
        {
            name: "Ice Section",
            link: "https://tibia.fandom.com/wiki/Secret_Library#Ice_Section",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const Soulwar = {
    location: "Soul-war",
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
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const Spectres = {
    location: "Spectres",
    choices: [
        {
            name: "Haunted Temple",
            link: "https://tibia.fandom.com/wiki/Haunted_Temple",
        },
        {
            name: "Haunted Tomb",
            link: "https://tibia.fandom.com/wiki/Haunted_Tomb",
        },
        {
            name: "Haunted Cellar",
            link: "https://tibia.fandom.com/wiki/Haunted_Cellar",
        },
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
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
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
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
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

const Warzone7 = {
    location: "Warzones-7-9",
    choices: [
        {
            name: "Warzone 7",
            link: "https://tibia.fandom.com/",
        },
        {
            name: "Warzone 8",
            link: "https://tibia.fandom.com/wiki/Secret_Library#Fire_Section",
        },
        {
            name: "Warzone 9",
            link: "https://tibia.fandom.com/wiki/Secret_Library#Fire_Section",
        }
    ].sort((a, b) => a.name.localeCompare(b.name, "en", {sensitivity: "base"})),
};

export const getHuntingPlaceByChannelName = (locationName: string) => {
    const locations = [
        Asuras,
        Bulltaurs,
        BuriedCathedral,
        Cobras,
        Dragolisks,
        Feru,
        Flimsy,
        Gnomprona,
        Ingol,
        Inquisition,
        Issavi,
        Marapur,
        Oramond,
        SecretLibrary,
        Roshamuul,
        RottenBlood,
        IceLibrary,
        Soulwar,
        Spectres,
        TheDreamCourts,
        Weremonster,
        Warzone7
    ];
    const matchingLocation = locations.find(
        (obj) => obj.location.toLowerCase() === locationName.toLowerCase()
    );
    return matchingLocation || null;
};

export const getHuntingSpotsByHuntingPlace = (choiceName: string | undefined) => {
    const locations = [
        Asuras,
        Bulltaurs,
        BuriedCathedral,
        Cobras,
        Dragolisks,
        Feru,
        Flimsy,
        Gnomprona,
        Ingol,
        Inquisition,
        Issavi,
        Marapur,
        Oramond,
        SecretLibrary,
        Roshamuul,
        RottenBlood,
        IceLibrary,
        Soulwar,
        Spectres,
        TheDreamCourts,
        Weremonster,
        Warzone7
    ];
    for (const location of locations) {
        const matchingChoice = location.choices.find(
            (choice) => choice.name.toLowerCase() === choiceName?.toLowerCase()
        );

        if (matchingChoice) {
            return matchingChoice.name;
        }
    }
};

export const getChoicesForSpot = (locationName: string | undefined): { name: string, value: string }[] => {
    const locations = [
        Asuras,
        Bulltaurs,
        BuriedCathedral,
        Cobras,
        Dragolisks,
        Feru,
        Flimsy,
        Gnomprona,
        Ingol,
        Inquisition,
        Issavi,
        Marapur,
        Oramond,
        SecretLibrary,
        Roshamuul,
        RottenBlood,
        IceLibrary,
        Soulwar,
        Spectres,
        TheDreamCourts,
        Weremonster,
        Warzone7
    ];

    const matchedLocation = locations.find((location) => location.location.toLowerCase() === locationName);

    if (!matchedLocation) {
        return [];
    }
    //console.log(matchedLocation)
    //console.log(matchedLocation.choices.map((choice) => ({name: choice.name, value: choice.name})))

    return matchedLocation.choices.map((choice) => ({name: choice.name, value: choice.name}));
};
