import { SaveInfo } from "models/SaveData";
import { getModuleClasses, getModuleComponent } from "util";

interface SaveItemProp {
    save: SaveInfo;
    selected?: boolean;
    locked?: boolean;
    tooltipsInactive?: boolean;
    inputAction?: Function;
    checkPrerequesites?: boolean;
    onClick?: Function;
    onDoubleClick?: Function;
    onSelect?: Function;
}

export const SaveItem = getModuleComponent<SaveItemProp>(
    "game-ui/menu/components/shared/save-item/save-item.tsx",
    "SaveItem"
);

export const saveItemClasses = getModuleClasses(
    "game-ui/menu/components/shared/save-item/save-item.module.scss"
);
