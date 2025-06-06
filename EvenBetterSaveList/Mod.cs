using Colossal.IO.AssetDatabase;
using Colossal.Logging;
using Game;
using Game.Modding;
using Game.SceneFlow;

namespace EvenBetterSaveList
{
    public class Mod : IMod
    {
        public static ILog Logger { get; set; } = LogManager.GetLogger("EvenBetterSaveList").SetShowsErrorsInUI(false);
        public static Setting Setting { get; set; }
        public static string Id { get; set; } = "EvenBetterSaveList";

        public void OnLoad(UpdateSystem updateSystem)
        {
            Logger.Info(nameof(OnLoad));

            if (GameManager.instance.modManager.TryGetExecutableAsset(this, out var asset))
                Logger.Info($"Current mod asset at {asset.path}");

            Setting = new Setting(this);
            Setting.RegisterInOptionsUI();
            GameManager.instance.localizationManager.AddSource("en-US", new LocaleEN(Setting));


            AssetDatabase.global.LoadSettings(nameof(EvenBetterSaveList), Setting, new Setting(this));
            updateSystem.UpdateAt<EvenBetterSaveListUISystem>(SystemUpdatePhase.UIUpdate);
        }

        public void OnDispose()
        {
            Logger.Info(nameof(OnDispose));
            if (Setting != null)
            {
                Setting.UnregisterInOptionsUI();
                Setting = null;
            }
        }
    }
}
