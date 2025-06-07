import { ScrollController } from "cs2/ui";
import { getModuleComponent } from "./util";
import { ReactElement } from "react";

type SizeProvider = {
    getRenderedRange: () => {
        offset: number;
        size: number;
        startIndex: number;
        endIndex: number;
    };
    getTotalSize: () => number;
};

type RenderItemFn = (
    itemIndex: number,
    indexInRange: number
) => ReactElement | null;
type RenderedRangeChangedCallback = (
    startIndex: number,
    endIndex: number
) => void;

interface VirtualListProps {
    className?: string;
    controller?: ScrollController;
    direction?: "vertical" | "horizontal";
    onRenderedRangeChange?: RenderedRangeChangedCallback;
    renderItem: RenderItemFn;
    sizeProvider: SizeProvider;
    smooth?: boolean;
    style?: Partial<CSSStyleDeclaration>;
}

export const VirtualList = getModuleComponent<VirtualListProps>(
    "game-ui/common/scrolling/virtual-list/virtual-list.tsx",
    "VirtualList"
);
