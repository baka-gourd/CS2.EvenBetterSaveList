import { getModule } from "cs2/modding";
import { Icon, Button } from "cs2/ui";
export { Icon, Button };

type Component<Props = any> = (props: Props) => JSX.Element;
export const getModuleComponent = <Props = any>(
    modulePath: string,
    exportName: string
) => getModule(modulePath, exportName) as Component<Props>;

type Classes<T = any> = T;
export const getModuleClasses = <T = any>(modulePath: string) =>
    getModule(modulePath, "classes") as Classes<T>;

// finded

export const VirtualList = getModuleComponent(
    "game-ui/common/scrolling/virtual-list/virtual-list.tsx",
    "VirtualList"
);

export const saveListClasses = getModuleClasses(
    "game-ui/menu/components/load-game-screen/save-list/save-list.module.scss"
);

export const useUniformSizeProvider = getModule(
    "game-ui/common/scrolling/virtual-list/virtual-list-size-provider.ts",
    "useUniformSizeProvider"
);

export const FullWidthDigits = getModuleComponent(
    "game-ui/common/text/full-width-digits/full-width-digits.tsx",
    "FullWidthDigits"
);
