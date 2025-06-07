import { getModuleComponent } from "components/vanilla/util";

interface SaveListHeaderProp {
    className?: string;
    selectedOrdering: number;
    // [0:Name, 1:LastModified, 2: Population]
    options: readonly number[];
    onSelectOrdering: Function;
}

export const SaveListHeader = getModuleComponent<SaveListHeaderProp>(
    "game-ui/menu/components/shared/save-list-header/save-list-header.tsx",
    "OrderingSaveListHeader"
);
