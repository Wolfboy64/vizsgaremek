using System.Diagnostics;
using System.Windows.Forms;

namespace CyberNestLauncher;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();

        var launcherDirectory = AppContext.BaseDirectory;
        var websiteDirectory = Path.Combine(launcherDirectory, "website");
        var batchFilePath = Path.Combine(websiteDirectory, "cybernest.bat");

        if (!Directory.Exists(websiteDirectory))
        {
            MessageBox.Show(
                "A 'website' mappa nem talalhato a CyberNest.exe mellett.\n\n" +
                "A futtatashoz a CyberNest.exe es a website mappa legyen egy helyen.",
                "CyberNest inditasi hiba",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            return;
        }

        if (!File.Exists(batchFilePath))
        {
            MessageBox.Show(
                "A website mappaban nem talalhato a cybernest.bat fajl.",
                "CyberNest inditasi hiba",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            return;
        }

        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = $"/c \"\"{batchFilePath}\"\"",
                WorkingDirectory = websiteDirectory,
                UseShellExecute = false
            };

            Process.Start(startInfo);
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                "A CyberNest inditasa nem sikerult.\n\n" + ex.Message,
                "CyberNest inditasi hiba",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
    }
}
