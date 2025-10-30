import {
    useUniformSizeProvider,
    FullWidthDigits,
    Icon,
    useMissingPrerequisites,
} from "../vanilla/util";
import mod from "mod.json";
import { bindValue, call, trigger, useValue } from "cs2/api";
import { useCssLength } from "cs2/utils";
import { memo, useEffect, useMemo, useState, useCallback } from "react";
import { CityInfo, SaveInfo } from "models/SaveData";
import { SaveItem, saveItemClasses } from "components/vanilla/SaveItem";
import { LocalizedTimestamp } from "components/vanilla/LocalizedTimestamp";
import { SaveListHeader } from "components/vanilla/SaveListHeader";
import * as styles from "./even-better-save-list.module.scss";
import { Tooltip } from "cs2/ui";
import { useLocalization } from "cs2/l10n";
import { VirtualList } from "components/vanilla/VirtualList";
import {
    prerequisitesClasses,
    saveListClasses,
} from "components/vanilla/cssCollection";

// #region MISC
type CityInfoDict = { [key: string]: CityInfo };
type RowType =
    | { type: "city"; city: CityInfo }
    | { type: "save"; save: SaveInfo; parentCity: string };

const ORDERING_OPTIONS = [0, 2, 1] as const;
const SORT_TYPES = {
    NAME: 0,
    LAST_MODIFIED: 1,
    POPULATION: 2,
} as const;
// #endregion

// #region Interop
const saveList$ = bindValue<SaveInfo[]>("menu", "saves");
const enabled$ = bindValue<boolean>(mod.id, "enabled");

const cityListOrdering$ = bindValue<number>(mod.id, "cityListOrdering");
const setCityListOrdering = (i: number) =>
    trigger(mod.id, "setCityListOrdering", i);
const isCityListOrderingDesc$ = bindValue<boolean>(
    mod.id,
    "isCityListOrderingDesc"
);
const setCityListOrderingDesc = (desc: boolean) =>
    trigger(mod.id, "setCityListOrderingDesc", desc);

const saveListOrdering$ = bindValue<number>(mod.id, "saveListOrdering");
const setSaveListOrdering = (i: number) =>
    trigger(mod.id, "setSaveListOrdering", i);
const isSaveListOrderingDesc$ = bindValue<boolean>(
    mod.id,
    "isSaveListOrderingDesc"
);
const setSaveListOrderingDesc = (desc: boolean) =>
    trigger(mod.id, "setSaveListOrderingDesc", desc);

// #endregion

// #region util
const getTime = (date: string) => new Date(date).getTime();

const createComparator = (ordering: number, isDesc: boolean) => {
    return <
        T extends {
            displayName: string;
            lastModified: string;
            population: number;
        }
    >(
        a: T,
        b: T
    ): number => {
        let value: number;
        switch (ordering) {
            case SORT_TYPES.NAME:
                value = a.displayName.localeCompare(b.displayName);
                break;
            case SORT_TYPES.LAST_MODIFIED:
                value = getTime(a.lastModified) - getTime(b.lastModified);
                break;
            case SORT_TYPES.POPULATION:
                value = a.population - b.population;
                break;
            default:
                value = 0;
        }
        return isDesc ? -value : value;
    };
};
// #endregion

// #region Hooks
const useCityInfo = (saveList: SaveInfo[]): CityInfoDict => {
    return useMemo(() => {
        const info: CityInfoDict = {};

        for (const save of saveList) {
            const cityName = save.cityName;
            if (!info[cityName]) {
                info[cityName] = {
                    ...save,
                    displayName: cityName,
                };
            } else {
                const city = info[cityName];
                if (save.population > city.population) {
                    city.population = save.population;
                }
                if (getTime(save.lastModified) > getTime(city.lastModified)) {
                    city.lastModified = save.lastModified;
                }
            }
        }

        return info;
    }, [saveList]);
};

const useSortedCityList = (
    saveList: SaveInfo[],
    cityInfo: CityInfoDict,
    ordering: number,
    isDesc: boolean
): CityInfo[] => {
    return useMemo(() => {
        const cityNames = [...new Set(saveList.map((s) => s.cityName))];
        const cities = cityNames.map((name) => cityInfo[name]);
        const comparator = createComparator(ordering, isDesc);

        return cities.sort(comparator);
    }, [saveList, cityInfo, ordering, isDesc]);
};

const useGroupedSaves = (
    saveList: SaveInfo[],
    ordering: number,
    isDesc: boolean
): { [cityName: string]: SaveInfo[] } => {
    return useMemo(() => {
        const groups: { [key: string]: SaveInfo[] } = {};
        for (const save of saveList) {
            const cityName = save.cityName;
            if (!groups[cityName]) {
                groups[cityName] = [];
            }
            groups[cityName].push(save);
        }

        const comparator = createComparator(ordering, isDesc);
        for (const cityName in groups) {
            groups[cityName].sort(comparator);
        }

        return groups;
    }, [saveList, ordering, isDesc]);
};

const useFlatList = (
    cityList: CityInfo[],
    citySaveLists: { [cityName: string]: SaveInfo[] },
    expandedCities: Set<string>
): RowType[] => {
    return useMemo(() => {
        const rows: RowType[] = [];

        for (const city of cityList) {
            rows.push({ type: "city", city });

            if (expandedCities.has(city.cityName)) {
                const saves = citySaveLists[city.cityName] || [];
                for (const save of saves) {
                    rows.push({
                        type: "save",
                        save,
                        parentCity: city.cityName,
                    });
                }
            }
        }

        return rows;
    }, [cityList, citySaveLists, expandedCities]);
};

const useAllSavesMissingPrerequisites = (saveList: SaveInfo[]) => {
    const missingPrerequisitesList = saveList.map((save) =>
        useMissingPrerequisites(save)
    );

    return useMemo(() => {
        const result = new Map<string, any[]>();
        saveList.forEach((save, index) => {
            result.set(save.id, missingPrerequisitesList[index]);
        });
        return result;
    }, [saveList, missingPrerequisitesList]);
};

const useCityInfoWithMissingMap = (
    saveList: SaveInfo[],
    missingPrerequisitesMap: Map<string, any[]>
): CityInfoDict => {
    return useMemo(() => {
        const info: CityInfoDict = {};

        for (const save of saveList) {
            const cityName = save.cityName;
            const missings = missingPrerequisitesMap.get(save.id) || [];
            if (!info[cityName]) {
                info[cityName] = {
                    ...save,
                    displayName: cityName,
                    missingPrerequisites: [...missings],
                };
            } else {
                const city = info[cityName];
                for (const p of missings) {
                    if (!city.missingPrerequisites?.includes(p))
                        city.missingPrerequisites?.push(p);
                }
                if (save.population > city.population) {
                    city.population = save.population;
                }
                if (getTime(save.lastModified) > getTime(city.lastModified)) {
                    city.lastModified = save.lastModified;
                }
            }
        }

        return info;
    }, [saveList, missingPrerequisitesMap]);
};

// #endregion

const CityWarning = memo<{ city: CityInfo }>(({ city }) => {
    const { translate } = useLocalization();
    return (
        <>
            <div>
                {translate("GameListScreen.TOOLTIP_MISSING_REQUIRED_CONTENT")}
            </div>
            <div className={prerequisitesClasses.prerequesites}>
                {city.missingPrerequisites!.map((p, i) => {
                    return (
                        <div
                            className={prerequisitesClasses.prerequesite}
                            key={i}>
                            <div className={prerequisitesClasses.bullet}>•</div>
                            <div
                                className={prerequisitesClasses.name}
                                cohinline="cohinline">
                                {translate(`Content.NAME[${p}]`)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
});

const CityRow = memo<{
    city: CityInfo;
    isExpanded: boolean;
    onToggle: (cityName: string) => void;
}>(({ city, isExpanded, onToggle }) => {
    const handleClick = useCallback(() => {
        onToggle(city.cityName);
    }, [city.cityName, onToggle]);

    return (
        <button
            className={`${saveItemClasses.item} city-header ${styles.cityRow}`}
            onClick={handleClick}>
            <div className={styles.leftSection}>
                <svg
                    className={`${styles.cityArrow} ${
                        saveItemClasses.titleInner
                    } ${isExpanded ? styles.expanded : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    viewBox="0 0 32 32">
                    <path d="m4 11 12 12 12-12" />
                </svg>

                {city.missingPrerequisites &&
                    city.missingPrerequisites.length > 0 && (
                        <Tooltip tooltip={<CityWarning city={city} />}>
                            <img
                                src="Media/Misc/Warning.svg"
                                alt="warn"
                                className={`${styles.warningIcon} ${saveItemClasses.warningIcon}`}
                            />
                        </Tooltip>
                    )}

                <span className={saveItemClasses.titleInner}>
                    {city.cityName}
                </span>
            </div>

            <div className={styles.rightSection}>
                <div className={`${saveItemClasses.populationValue}`}>
                    {city.population}
                </div>
                <Icon
                    tinted
                    src="Media/Game/Icons/Citizen.svg"
                    className={`${saveItemClasses.populationIcon}`}
                />
                <FullWidthDigits className={saveItemClasses.date}>
                    <LocalizedTimestamp value={city.lastModified} />
                </FullWidthDigits>
            </div>
        </button>
    );
});

CityRow.displayName = "CityRow";

const SaveRow = memo<{
    save: SaveInfo;
    isSelected: boolean;
    onSelect: (saveId: string) => void;
}>(({ save, isSelected, onSelect }) => {
    const handleClick = useCallback(() => {
        onSelect(save.id);
    }, [save.id, onSelect]);

    return (
        <SaveItem
            checkPrerequesites={true}
            save={save}
            selected={isSelected}
            onClick={handleClick}
        />
    );
});

SaveRow.displayName = "SaveRow";

const SortingControls = memo<{
    cityOrdering: number;
    saveOrdering: number;
    isCityListOrderingDesc: boolean;
    isSaveListOrderingDesc: boolean;
    onCityOrderingChange: (ordering: number) => void;
    onSaveOrderingChange: (ordering: number) => void;
}>(
    ({
        cityOrdering,
        saveOrdering,
        isCityListOrderingDesc,
        isSaveListOrderingDesc,
        onCityOrderingChange,
        onSaveOrderingChange,
    }) => {
        const { translate } = useLocalization();
        return (
            <div className={styles.sortingControls}>
                <div className={styles.betterHeader}>
                    <div className={styles.headerLabel}>
                        {translate(
                            "EvenBetterSaveList.Sort.CityName",
                            "CityName"
                        )}
                    </div>
                    <SaveListHeader
                        className={styles.vanillaHeader}
                        onSelectOrdering={onCityOrderingChange}
                        options={ORDERING_OPTIONS}
                        selectedOrdering={cityOrdering}
                    />
                    <div
                        className={styles.sortButton}
                        onClick={() => onCityOrderingChange(cityOrdering)}>
                        {isCityListOrderingDesc ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 16 16">
                                <path
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    d="M2.22 13.28a.75.75 0 0 0 1.06 0l2-2a.75.75 0 1 0-1.06-1.06l-.72.72V3.25a.75.75 0 0 0-1.5 0v7.69l-.72-.72a.75.75 0 1 0-1.06 1.06zM7 3.25a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7 3.25m.75 4a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5zm0 4.75a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 16 16">
                                <path
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    d="M2.22 13.28a.75.75 0 0 0 1.06 0l2-2a.75.75 0 1 0-1.06-1.06l-.72.72V3.25a.75.75 0 0 0-1.5 0v7.69l-.72-.72a.75.75 0 1 0-1.06 1.06zM7.75 12a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5zm0-3.25a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 0 1.5zm0-4.75a.75.75 0 0 1 0-1.5h2.5a.75.75 0 0 1 0 1.5z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        )}
                    </div>
                </div>
                <div className={styles.betterHeader}>
                    <div className={styles.headerLabel}>
                        {translate("EvenBetterSaveList.Sort.Save", "Save")}
                    </div>
                    <SaveListHeader
                        className={styles.vanillaHeader}
                        onSelectOrdering={onSaveOrderingChange}
                        options={ORDERING_OPTIONS}
                        selectedOrdering={saveOrdering}
                    />
                    <div
                        className={styles.sortButton}
                        onClick={() => onSaveOrderingChange(saveOrdering)}>
                        {isSaveListOrderingDesc ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 16 16">
                                <path
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    d="M2.22 13.28a.75.75 0 0 0 1.06 0l2-2a.75.75 0 1 0-1.06-1.06l-.72.72V3.25a.75.75 0 0 0-1.5 0v7.69l-.72-.72a.75.75 0 1 0-1.06 1.06zM7 3.25a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7 3.25m.75 4a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5zm0 4.75a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 16 16">
                                <path
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    d="M2.22 13.28a.75.75 0 0 0 1.06 0l2-2a.75.75 0 1 0-1.06-1.06l-.72.72V3.25a.75.75 0 0 0-1.5 0v7.69l-.72-.72a.75.75 0 1 0-1.06 1.06zM7.75 12a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5zm0-3.25a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 0 1.5zm0-4.75a.75.75 0 0 1 0-1.5h2.5a.75.75 0 0 1 0 1.5z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

SortingControls.displayName = "SortingControls";

export const EvenBetterSaveList = (Component: any) => (props: any) => {
    const enabled = useValue(enabled$);

    if (!enabled) {
        const { children, ...otherProps } = props || {};
        return <Component {...otherProps}>{children}</Component>;
    }

    const { onSelectSave, selectedSave } = props;
    const saveList = useValue(saveList$);

    const missingPrerequisitesMap = useAllSavesMissingPrerequisites(saveList);

    // city
    const cityListOrdering = useValue(cityListOrdering$);
    const isCityListOrderingDesc = useValue(isCityListOrderingDesc$);

    // save
    const saveListOrdering = useValue(saveListOrdering$);
    const isSaveListOrderingDesc = useValue(isSaveListOrderingDesc$);

    // compute
    const cityInfo = useCityInfoWithMissingMap(
        saveList,
        missingPrerequisitesMap
    );

    const cityList = useSortedCityList(
        saveList,
        cityInfo,
        cityListOrdering,
        isCityListOrderingDesc
    );
    const citySaveLists = useGroupedSaves(
        saveList,
        saveListOrdering,
        isSaveListOrderingDesc
    );

    // expanded
    const [expandedCities, setExpandedCities] = useState<Set<string>>(
        new Set()
    );

    // expand selected at first
    useEffect(() => {
        if (selectedSave && saveList.length > 0) {
            const currentSave = saveList.find((s) => s.id === selectedSave);
            if (currentSave && !expandedCities.has(currentSave.cityName)) {
                setExpandedCities((prev) =>
                    new Set(prev).add(currentSave.cityName)
                );
            }
        }
    }, [selectedSave, saveList]);

    const toggleCity = useCallback((cityName: string) => {
        setExpandedCities((prev) => {
            const next = new Set(prev);
            if (next.has(cityName)) {
                next.delete(cityName);
            } else {
                next.add(cityName);
            }
            return next;
        });
    }, []);

    const handleCityOrderingChange = useCallback(
        (ordering: number) => {
            if (ordering === cityListOrdering) {
                setCityListOrderingDesc(!isCityListOrderingDesc);
            } else {
                setCityListOrdering(ordering);
            }
        },
        [cityListOrdering, isCityListOrderingDesc]
    );

    const handleSaveOrderingChange = useCallback(
        (ordering: number) => {
            if (ordering === saveListOrdering) {
                setSaveListOrderingDesc(!isSaveListOrderingDesc);
            } else {
                setSaveListOrdering(ordering);
            }
        },
        [saveListOrdering, isSaveListOrderingDesc]
    );

    const flatList = useFlatList(cityList, citySaveLists, expandedCities);

    const sizeProvider = useUniformSizeProvider(
        useCssLength(saveListClasses.itemHeight),
        flatList.length,
        3
    );

    const renderItem = useCallback(
        (index: number) => {
            const row = flatList[index];

            if (row.type === "city") {
                return (
                    <CityRow
                        key={`city-${row.city.cityName}`}
                        city={row.city}
                        isExpanded={expandedCities.has(row.city.cityName)}
                        onToggle={toggleCity}
                    />
                );
            } else {
                return (
                    <SaveRow
                        key={`save-${row.save.id}`}
                        save={row.save}
                        isSelected={selectedSave === row.save.id}
                        onSelect={onSelectSave}
                    />
                );
            }
        },
        [flatList, expandedCities, toggleCity, selectedSave, onSelectSave]
    );

    return (
        <div className={`${saveListClasses.saveList} ${styles.evenBetter}`}>
            <SortingControls
                cityOrdering={cityListOrdering}
                saveOrdering={saveListOrdering}
                isCityListOrderingDesc={isCityListOrderingDesc}
                isSaveListOrderingDesc={isSaveListOrderingDesc}
                onCityOrderingChange={handleCityOrderingChange}
                onSaveOrderingChange={handleSaveOrderingChange}
            />

            <div>
                <VirtualList
                    direction="vertical"
                    className={saveListClasses.scrollable}
                    sizeProvider={sizeProvider}
                    renderItem={renderItem}
                />
            </div>
        </div>
    );
};
