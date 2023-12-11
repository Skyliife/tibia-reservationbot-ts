const prepare: string[] = [
    "Preparing for a Tibia hunt... Our potions are brewing, weapons are sharpening, and the GPS for finding those elusive monsters is getting an update.",
    "Gearing up for Tibia adventures... because even heroes need a bathroom break before facing dragons and demons.",
    "Assembling your party for Tibia mischief... Remember, the key to success is having a healer who can cure both wounds and embarrassing moments.",
    "Strategizing for a Tibia quest... It's not procrastination; it's tactical nap planning.",
    "Equipping your character for Tibia glory... May your armor be sturdy, your snacks plentiful, and your lag nonexistent.",
    "Counting your potions for a Tibia expedition... because a well-prepared adventurer is just one potion away from becoming legendary.",
    "Loading up on snacks before a Tibia hunt... After all, defeating monsters is hungry work. Beware the hangry knight!",
    "Training your mount for a Tibia safari... Because nothing says 'fierce warrior' like a well-trained battle ostrich.",
    "Polishing your weapons for a Tibia rampage... Shiny swords do 50% more damage; it's in the unofficial adventurer's handbook.",
    "Crafting the perfect playlist for a Tibia hunt... Because slaying monsters is more epic with a killer soundtrack. Cue the battle drums!"]

const collect: string[] = [
    "Facing monsters in Tibia... Just remember, even the mightiest dragon started as a cute little lizard. Go get 'em, dragon-tamer!",
    "Embarking on a Tibia quest... May your crits be high, your potions plentiful, and your map reading skills impeccable.",
    "Swinging swords and slinging spells in Tibia... Because real heroes know the importance of stylish combat moves. Bonus XP for dramatic twirls!",
    "Tackling monsters in Tibia... Who needs a gym membership when you have a legion of orcs to keep you in shape?",
    "Executing critical hits in Tibia... If only life's problems could be solved with a well-timed headshot. Keep swinging, adventurer!",
    "Dodging fireballs and defeating demons in Tibia... It's like a dance, but with more screaming and fewer ball gowns.",
    "Vanquishing monsters in Tibia... Remember, the key to successful monster hunting is a well-maintained inventory and a dash of luck.",
    "Completing quests in Tibia... Your to-do list may be long, but at least it doesn't involve battling giant spiders... hopefully.",
    "Unleashing powerful spells in Tibia... Our magical advice for facing tough enemies: duck, dodge, dip, dive, and dodge some more.",
    "Navigating dungeons in Tibia... If only Siri could give directions in the language of trolls and goblins. Keep your map handy!"]

const validate: string[] = ["Summoning the Discord gods...",
    "Brace yourselves, Discord is coming.",
    "Warming up the hamsters...",
    "Loading... faster than a speeding potato.",
    "Putting on its party hat...",
    "Reticulating splines...",
    "Squashing bugs (the non-cute kind).",
    "Training our snails for faster deliveries.",
    "Consulting the Elders for ancient server wisdom...",
    "Polishing pixels...",
    "Hunting for missing socks in the server room.",
    "Assembling the Avengers of error messages.",
    "Commencing the intergalactic dance-off.",
    "Preparing for liftoff, Houston we don't have a problem.",
    "Finding Nemo...",
    "Waking up the kraken...",
    "Counting to infinity... twice.",
    "Unleashing the unicorns...",
    "Brewing a fresh pot of Java...",
    "Searching for the meaning of life, and cat gifs."]

const hunt: string[] = [
    "Facing monsters in Tibia... Just remember, even the mightiest dragon started as a cute little lizard. Go get 'em, dragon-tamer!",
    "Embarking on a Tibia quest... May your crits be high, your potions plentiful, and your map reading skills impeccable.",
    "Swinging swords and slinging spells in Tibia... Because real heroes know the importance of stylish combat moves. Bonus XP for dramatic twirls!",
    "Tackling monsters in Tibia... Who needs a gym membership when you have a legion of orcs to keep you in shape?",
    "Executing critical hits in Tibia... If only life's problems could be solved with a well-timed headshot. Keep swinging, adventurer!",
    "Dodging fireballs and defeating demons in Tibia... It's like a dance, but with more screaming and fewer ball gowns.",
    "Vanquishing monsters in Tibia... Remember, the key to successful monster hunting is a well-maintained inventory and a dash of luck.",
    "Completing quests in Tibia... Your to-do list may be long, but at least it doesn't involve battling giant spiders... hopefully.",
    "Unleashing powerful spells in Tibia... Our magical advice for facing tough enemies: duck, dodge, dip, dive, and dodge some more.",
    "Navigating dungeons in Tibia... If only Siri could give directions in the language of trolls and goblins. Keep your map handy!"]

export function getRandomSentence(arrayName: string): string {
    const arrays: Record<string, string[]> = {
        prepare,
        collect,
        validate,
        hunt,
    };

    const selectedArray = arrays[arrayName];

    if (!selectedArray) {
        return "Array not found!";
    }

    if (selectedArray.length === 0) {
        return "Selected array is empty!";
    }

    const randomIndex = Math.floor(Math.random() * selectedArray.length);
    return selectedArray[randomIndex];
}
