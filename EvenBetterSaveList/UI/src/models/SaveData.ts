export interface CityInfo {
    id: string;
    cityName: string;
    displayName: string;
    population: number;
    lastModified: string;
    missingPrerequisites?: string[];
}

export interface SaveInfo {
    id: string;
    cityName: string;
    displayName: string;
    population: number;
    lastModified: string;
    autoSave: boolean;
    cloudTarget: string;
    // i don't care
    contentPrerequisites: any;
}
