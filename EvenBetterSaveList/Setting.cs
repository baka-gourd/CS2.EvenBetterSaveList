using System.Collections.Generic;
using Colossal;
using Colossal.IO.AssetDatabase;
using Game.Modding;
using Game.Settings;
using Game.UI;
using Game.UI.Widgets;

namespace EvenBetterSaveList
{
    [FileLocation(nameof(EvenBetterSaveList))]
    public class Setting : ModSetting
    {
        public Setting(IMod mod) : base(mod)
        {
            SetDefaults();
        }
        public override void SetDefaults()
        {
            Enabled = true;
            SelectedCityName = "";
            CityListOrdering = 0;
            IsCityListOrderingDesc = false;
            SaveListOrdering = 0;
            IsSaveListOrderingDesc = false;
        }

        public bool Enabled { get; set; }

        [SettingsUIHidden]
        public string SelectedCityName { get; set; }

        [SettingsUIHidden]
        public int CityListOrdering { get; set; }
        [SettingsUIHidden]
        public bool IsCityListOrderingDesc { get; set; }

        [SettingsUIHidden]
        public int SaveListOrdering { get; set; }
        [SettingsUIHidden]
        public bool IsSaveListOrderingDesc { get; set; }
    }

    public class LocaleEN : IDictionarySource
    {
        private readonly Setting m_Setting;
        public LocaleEN(Setting setting)
        {
            m_Setting = setting;
        }
        public IEnumerable<KeyValuePair<string, string>> ReadEntries(IList<IDictionaryEntryError> errors, Dictionary<string, int> indexCounts)
        {
            return new Dictionary<string, string>
            {
                { m_Setting.GetSettingsLocaleID(), "EvenBetterSaveList" },
            };
        }

        public void Unload()
        {

        }
    }
}
