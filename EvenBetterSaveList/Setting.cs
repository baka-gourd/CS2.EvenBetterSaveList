using Colossal;
using Colossal.IO.AssetDatabase;
using Game.Modding;
using Game.Settings;
using System.Collections.Generic;

namespace EvenBetterSaveList
{
    [FileLocation(@"ModsSettings\Nullpinter\EvenBetterSaveList")]
    public class Setting : ModSetting
    {
        public Setting(IMod mod) : base(mod)
        {
            SetDefaults();
        }

        public sealed override void SetDefaults()
        {
            Enabled = true;
            SelectedCityName = "";
            CityListOrdering = 0;
            IsCityListOrderingDesc = false;
            SaveListOrdering = 0;
            IsSaveListOrderingDesc = false;
        }

        public bool Enabled { get; set; }

        [SettingsUIHidden] public string SelectedCityName { get; set; }

        [SettingsUIHidden] public int CityListOrdering { get; set; }
        [SettingsUIHidden] public bool IsCityListOrderingDesc { get; set; }

        [SettingsUIHidden] public int SaveListOrdering { get; set; }
        [SettingsUIHidden] public bool IsSaveListOrderingDesc { get; set; }
    }

    public class LocaleEn : IDictionarySource
    {
        private readonly Setting _mSetting;

        public LocaleEn(Setting setting)
        {
            _mSetting = setting;
        }

        public IEnumerable<KeyValuePair<string, string>> ReadEntries(IList<IDictionaryEntryError> errors,
            Dictionary<string, int> indexCounts)
        {
            return new Dictionary<string, string>
            {
                {_mSetting.GetSettingsLocaleID(), "Even Better Save List"},
                {_mSetting.GetOptionDescLocaleID(nameof(_mSetting.Enabled)), "Enable"},
                {_mSetting.GetOptionLabelLocaleID(nameof(_mSetting.Enabled)), "Enable"},
                {"EvenBetterSaveList.Sort.CityName", "City Name "},
                {"EvenBetterSaveList.Sort.Save", "Save "},
            };
        }

        public void Unload()
        {
        }
    }
}