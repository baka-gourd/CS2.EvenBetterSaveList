import {
    saveListClasses,
    useUniformSizeProvider,
    VirtualList,
    FullWidthDigits,
    Icon,
} from "../../util";
import mod from "mod.json";
import { bindValue, call, trigger, useValue } from "cs2/api";
import { useCssLength } from "cs2/utils";
import { memo, useEffect, useMemo, useState, useCallback } from "react";
import { CityInfo, SaveInfo } from "models/SaveData";
import { SaveItem, saveItemClasses } from "components/vanilla/SaveItem";
import { LocalizedTimestamp } from "components/vanilla/LocalizedTimestamp";
import { SaveListHeader } from "components/vanilla/SaveListHeader";
import styles from "./even-better-save-list.module.scss";

// 类型定义
type CityInfoDict = { [key: string]: CityInfo };
type RowType =
    | { type: "city"; city: CityInfo }
    | { type: "save"; save: SaveInfo; parentCity: string };

// 常量定义
const ORDERING_OPTIONS = [0, 2, 1] as const;
const SORT_TYPES = {
    NAME: 0,
    LAST_MODIFIED: 1,
    POPULATION: 2,
} as const;

// 全局绑定
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
const arePrerequisitesMet = (contentPrerequisites: string) =>
    call<boolean>("app", "arePrerequisitesMet", contentPrerequisites);
const setSaveListOrderingDesc = (desc: boolean) =>
    trigger(mod.id, "setSaveListOrderingDesc", desc);

// 工具函数
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

// 自定义hooks
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
                // 保持最大人口和最新修改时间
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
        // 分组
        const groups: { [key: string]: SaveInfo[] } = {};
        for (const save of saveList) {
            const cityName = save.cityName;
            if (!groups[cityName]) {
                groups[cityName] = [];
            }
            groups[cityName].push(save);
        }

        // 排序每个组
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

// 城市行组件
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

// 存档行组件
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

// 排序控制组件
const SortingControls = memo<{
    cityOrdering: number;
    saveOrdering: number;
    onCityOrderingChange: (ordering: number) => void;
    onSaveOrderingChange: (ordering: number) => void;
}>(
    ({
        cityOrdering,
        saveOrdering,
        onCityOrderingChange,
        onSaveOrderingChange,
    }) => (
        <div className={styles.sortingControls}>
            <SaveListHeader
                onSelectOrdering={onCityOrderingChange}
                options={ORDERING_OPTIONS}
                selectedOrdering={cityOrdering}
            />
            <SaveListHeader
                onSelectOrdering={onSaveOrderingChange}
                options={ORDERING_OPTIONS}
                selectedOrdering={saveOrdering}
            />
        </div>
    )
);

SortingControls.displayName = "SortingControls";

// 主组件
export const EvenBetterSaveList = (Component: any) => (props: any) => {
    const enabled = useValue(enabled$);

    if (!enabled) {
        const { children, ...otherProps } = props || {};
        return <Component {...otherProps}>{children}</Component>;
    }

    const { onSelectSave, selectedSave } = props;
    const saveList = useValue(saveList$);

    // 城市排序设置
    const cityListOrdering = useValue(cityListOrdering$);
    const isCityListOrderingDesc = useValue(isCityListOrderingDesc$);

    // 存档排序设置
    const saveListOrdering = useValue(saveListOrdering$);
    const isSaveListOrderingDesc = useValue(isSaveListOrderingDesc$);

    // 计算数据
    const cityInfo = useCityInfo(saveList);
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

    // 展开状态
    const [expandedCities, setExpandedCities] = useState<Set<string>>(
        new Set()
    );

    // 自动展开包含选中存档的城市
    useEffect(() => {
        if (selectedSave && saveList.length > 0) {
            const currentSave = saveList.find((s) => s.id === selectedSave);
            if (currentSave && !expandedCities.has(currentSave.cityName)) {
                setExpandedCities((prev) =>
                    new Set(prev).add(currentSave.cityName)
                );
            }
        }
    }, [selectedSave, saveList]); // 移除 expandedCities 依赖，避免阻止折叠

    // 事件处理
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

    // 扁平化列表
    const flatList = useFlatList(cityList, citySaveLists, expandedCities);

    // 虚拟化设置
    const sizeProvider = useUniformSizeProvider(
        useCssLength(saveListClasses.itemHeight),
        flatList.length,
        3
    );

    // 渲染函数
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
