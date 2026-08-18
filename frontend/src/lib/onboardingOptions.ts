export interface Club {
  name: string;
  code: string;
  color: string;
  /** Wikipedia Special:FilePath URL - stable, resolves to the current crest file. */
  crestUrl: string;
}

const wiki = (filename: string) => `https://en.wikipedia.org/wiki/Special:FilePath/${filename}`;

export const CLUBS: Club[] = [
  { name: "Arsenal", code: "ARS", color: "#EF0107", crestUrl: wiki("Arsenal_FC.svg") },
  { name: "Aston Villa", code: "AVL", color: "#670E36", crestUrl: wiki("Aston_Villa_F.C._logo.svg") },
  { name: "Bournemouth", code: "BOU", color: "#DA291C", crestUrl: wiki("AFC_Bournemouth_(2013).svg") },
  { name: "Brentford", code: "BRE", color: "#E30613", crestUrl: wiki("Brentford_FC_crest.svg") },
  { name: "Brighton & Hove Albion", code: "BHA", color: "#0057B8", crestUrl: wiki("Brighton_and_Hove_Albion_FC_crest.svg") },
  { name: "Burnley", code: "BUR", color: "#6C1D45", crestUrl: wiki("Burnley_FC_Logo.svg") },
  { name: "Chelsea", code: "CHE", color: "#034694", crestUrl: wiki("Chelsea_FC.svg") },
  { name: "Crystal Palace", code: "CRY", color: "#1B458F", crestUrl: wiki("Crystal_Palace_FC_logo_(2022).svg") },
  { name: "Everton", code: "EVE", color: "#003399", crestUrl: wiki("Everton_FC_logo.svg") },
  { name: "Fulham", code: "FUL", color: "#000000", crestUrl: wiki("Fulham_FC_(shield).svg") },
  { name: "Leeds United", code: "LEE", color: "#1D428A", crestUrl: wiki("Leeds_United_F.C._logo.svg") },
  { name: "Liverpool", code: "LIV", color: "#C8102E", crestUrl: wiki("Liverpool_FC.svg") },
  { name: "Manchester City", code: "MCI", color: "#6CABDD", crestUrl: wiki("Manchester_City_FC_badge.svg") },
  { name: "Manchester United", code: "MUN", color: "#DA291C", crestUrl: wiki("Manchester_United_FC_crest.svg") },
  { name: "Newcastle United", code: "NEW", color: "#241F20", crestUrl: wiki("Newcastle_United_Logo.svg") },
  { name: "Nottingham Forest", code: "NFO", color: "#DD0000", crestUrl: wiki("Nottingham_Forest_F.C._logo.svg") },
  { name: "Sunderland", code: "SUN", color: "#EB172B", crestUrl: wiki("Logo_Sunderland.svg") },
  { name: "Tottenham Hotspur", code: "TOT", color: "#132257", crestUrl: wiki("Spurs_2017_badge.svg") },
  { name: "West Ham United", code: "WHU", color: "#7A263A", crestUrl: wiki("West_Ham_United_FC_logo.svg") },
  { name: "Wolverhampton Wanderers", code: "WOL", color: "#FDB913", crestUrl: wiki("Wolverhampton_Wanderers_FC_crest.svg") },
];

const CLUBS_BY_NAME = new Map(CLUBS.map((c) => [c.name, c]));

export function getClub(name: string): Club | undefined {
  return CLUBS_BY_NAME.get(name);
}

/** Ordered low -> high; each level's color is also the color of its quarter of the ExpertiseGauge arc. */
export const EXPERTISE_LEVELS = [
  { value: "beginner", label: "Beginner", rating: 15, color: "#DC2626" },
  { value: "intermediate", label: "Intermediate", rating: 40, color: "#F97316" },
  { value: "advanced", label: "Advanced", rating: 65, color: "#EAB308" },
  { value: "nerd", label: "Nerd", rating: 90, color: "#16A34A" },
];

export function getExpertiseRating(value: string | null | undefined): number | null {
  return EXPERTISE_LEVELS.find((l) => l.value === value)?.rating ?? null;
}

export function getExpertiseLabel(value: string | null | undefined): string | null {
  return EXPERTISE_LEVELS.find((l) => l.value === value)?.label ?? null;
}

export const INTEREST_OPTIONS = ["Transfer news & rumours", "Match reports & results", "Tactical analysis", "Fantasy football"];
