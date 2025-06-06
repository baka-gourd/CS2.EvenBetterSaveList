import { getModuleComponent } from "util";

interface LocalizedTimestampProp {
    value: string;
}

export const LocalizedTimestamp = getModuleComponent<LocalizedTimestampProp>(
    "game-ui/common/localization/localized-date.tsx",
    "LocalizedTimestamp"
);
