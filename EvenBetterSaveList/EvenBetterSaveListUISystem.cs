using Colossal.UI.Binding;

using Game.UI;

namespace EvenBetterSaveList
{
    public partial class EvenBetterSaveListUISystem : UISystemBase
    {
        protected override void OnCreate()
        {
            base.OnCreate();

            AddUpdateBinding(new GetterValueBinding<bool>(Mod.Id, "enabled", () => Mod.Setting.Enabled));

            AddUpdateBinding(new GetterValueBinding<int>(Mod.Id, "saveListOrdering", () => Mod.Setting.SaveListOrdering));
            AddUpdateBinding(new GetterValueBinding<string>(Mod.Id, "selectedCityName", () => Mod.Setting.SelectedCityName));
            AddBinding(new TriggerBinding<string>(Mod.Id, "setSelectedCityName", name =>
            {
                Mod.Setting.SelectedCityName = name;
                Mod.Setting.ApplyAndSave();
            }));


            AddUpdateBinding(new GetterValueBinding<int>(Mod.Id, "cityListOrdering", () => Mod.Setting.CityListOrdering));
            AddBinding(new TriggerBinding<int>(Mod.Id, "setCityListOrdering", i =>
            {
                Mod.Setting.CityListOrdering = i;
                Mod.Setting.ApplyAndSave();
            }));
            AddUpdateBinding(new GetterValueBinding<bool>(Mod.Id, "isCityListOrderingDesc", () => Mod.Setting.IsCityListOrderingDesc));
            AddBinding(new TriggerBinding<bool>(Mod.Id, "setCityListOrderingDesc", desc =>
            {
                Mod.Setting.IsCityListOrderingDesc = desc;
                Mod.Setting.ApplyAndSave();
            }));


            AddUpdateBinding(new GetterValueBinding<int>(Mod.Id, "saveListOrdering", () => Mod.Setting.SaveListOrdering));
            AddBinding(new TriggerBinding<int>(Mod.Id, "setSaveListOrdering", i =>
            {
                Mod.Setting.SaveListOrdering = i;
                Mod.Setting.ApplyAndSave();
            }));
            AddUpdateBinding(new GetterValueBinding<bool>(Mod.Id, "isSaveListOrderingDesc", () => Mod.Setting.IsSaveListOrderingDesc));
            AddBinding(new TriggerBinding<bool>(Mod.Id, "setSaveListOrderingDesc", desc =>
            {
                Mod.Setting.IsSaveListOrderingDesc = desc;
                Mod.Setting.ApplyAndSave();
            }));
        }
    }
}