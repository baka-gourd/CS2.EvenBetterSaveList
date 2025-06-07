import { ModRegistrar } from "cs2/modding";
import { EvenBetterSaveList } from "components/even-better-save-list/even-better-save-list";

const register: ModRegistrar = (moduleRegistry) => {
    moduleRegistry.extend(
        "game-ui/menu/components/load-game-screen/save-list/save-list.tsx",
        "SaveList",
        EvenBetterSaveList
    );
};

export default register;
