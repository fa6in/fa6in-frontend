



export type MatiereLevel = number | { id: number; code?: string; name?: string };

export function getMatiereLevelId(level: MatiereLevel | undefined): number | undefined {
    return typeof level === "number" ? level : level?.id;
}

export function getMatiereLevelName(
    level: MatiereLevel | undefined,
    levelName?: string
): string {
    if (levelName) return levelName;
    if (typeof level === "object" && level?.name) return level.name;
    return getMatiereLevelId(level)?.toString() ?? "—";
}

export type typeMatiere = {
    id?:number,
    name : string,
    code : string,
    level : MatiereLevel,
    level_name?: string,
    description : string,
    icon : string,
    color : string,
    is_active : boolean,
    created_at? : string,
    updated_at? : string,
    unit_count?: number
}