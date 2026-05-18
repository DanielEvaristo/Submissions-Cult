export const GENRE_MAP: Record<string, string[]> = {
  "Indie": [
    "Indie Rock", "Indie Pop", "Indie Folk", "Dream Pop", "Shoegaze", 
    "Jangle Pop", "Math Rock", "Post-Punk Revival", "Bedroom Pop", "Other"
  ],
  "Rock": [
    "Alternative Rock", "Post-Punk", "Post-Rock", "Psychedelic Rock", 
    "Garage Rock", "Noise Rock", "Prog Rock", "Hard Rock", "Classic Rock", "Other"
  ],
  "Metal": [
    "Doom Metal", "Black Metal", "Death Metal", "Post-Metal", 
    "Sludge Metal", "Thrash Metal", "Nu Metal", "Metalcore", "Heavy Metal", "Other"
  ],
  "Electronic": [
    "Synthwave", "Darkwave", "Industrial", "Techno", "House", 
    "IDM", "Ambient", "Drum & Bass", "Dubstep", "Other"
  ],
  "Hip-Hop": [
    "Alternative Hip-Hop", "Boom Bap", "Trap", "Lo-Fi Hip-Hop", 
    "Underground Hip-Hop", "Drill", "Other"
  ],
  "R&B / Soul": [
    "Neo-Soul", "Contemporary R&B", "Funk", "Motown", "Other"
  ],
  "Pop": [
    "Art Pop", "Synth-Pop", "Hyperpop", "Dark Pop", "Electro Pop", "Other"
  ],
  "Folk / Acoustic": [
    "Dark Folk", "Neo-Folk", "Singer-Songwriter", "Americana", "Bluegrass", "Other"
  ],
  "Latin": [
    "Reggaeton", "Latin Rock", "Latin Alternative", "Cumbia", "Salsa", "Other"
  ],
  "Jazz": [
    "Dark Jazz", "Free Jazz", "Jazz Fusion", "Nu Jazz", "Bebop", "Other"
  ],
  "Ambient / Experimental": [
    "Drone", "Noise", "Avant-Garde", "Soundscapes", "Musique Concrète", "Other"
  ],
  "Other": [
    "Other"
  ]
};

export const GENRES = Object.keys(GENRE_MAP);
