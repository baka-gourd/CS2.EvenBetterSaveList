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
    isReadonly: boolean;
    // i don't care
    contentPrerequisites: any;
}
