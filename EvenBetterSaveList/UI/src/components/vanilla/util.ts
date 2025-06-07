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

export const useUniformSizeProvider = getModule(
    "game-ui/common/scrolling/virtual-list/virtual-list-size-provider.ts",
    "useUniformSizeProvider"
);

export const useMissingPrerequisites = getModule(
    "game-ui/menu/components/shared/prerequisites/use-missing-prerequisites.ts",
    "useMissingPrerequisites"
);

export const FullWidthDigits = getModuleComponent(
    "game-ui/common/text/full-width-digits/full-width-digits.tsx",
    "FullWidthDigits"
);
