using System.Diagnostics;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CyberNest_Admin
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public static string Token = "";
        public MainWindow()
        {
            InitializeComponent();
            LoginPage.Visibility = Visibility.Visible;
            SideBrand_loginPage.Visibility = Visibility.Visible;
            MainContentPage.Visibility = Visibility.Hidden;

            //Height="450" Width="800"
            this.MinHeight = 450;
            this.MinWidth = 800;

            this.MaxHeight = 450;
            this.MaxWidth = 800;
        }


        private async void Bejelentkezes_Click(object sender, RoutedEventArgs e)
        {
            // Vizuális visszajelzés (opcionális, de ajánlott)
            Bejelentkezes.IsEnabled = false;
       

            var api = new ApiService();

            // Itt a program nem áll meg, a UI szál szabad marad!
            var eredmeny = await api.LoginAsync(txtUser.Text, txtPass.Password);

            if (eredmeny != null)
            {
                Token = eredmeny.Token;
                this.Title = $"CyberNest Admin felület - Üdvözlünk, {eredmeny.User.Nev}";
                //MessageBox.Show($"Sikeres belépés! Token: {Token} További infók: {eredmeny.User.Role}" );
                // Itt átválthatsz egy másik ablakra vagy betöltheted az adatokat
                Clipboard.SetText(Token); // Token másolása a vágólapra, ha szükséges   
                LoginPage.Visibility = Visibility.Hidden;
                SideBrand_loginPage.Visibility = Visibility.Hidden;

                MainContentPage.Visibility = Visibility.Visible;
                WelocmePage.Visibility = Visibility.Visible;
                DateTime date = DateTime.Now;
                DateSetup(date.Hour, eredmeny.User.Nev, eredmeny.User.Role, eredmeny.User.Elerhetoseg);
            }
            else
            {
                MessageBox.Show("Hiba a bejelentkezés során. Ellenőrizd az adatokat!");
            }

            // Visszaállítjuk a UI-t
            Bejelentkezes.IsEnabled = true;
        }
        private void DateSetup(int hour, string nev, string role, string elerhetoseg)
        {
            if (hour < 8)
            {
                WelocmeTextblock.Text = $"Jó Reggelt, {nev}!\nJogolutsági szinted: {role}\nElérhetőséged: {elerhetoseg}";
            }
            else if (hour > 8 && hour < 12)
            {
                WelocmeTextblock.Text = $"Jó Napot, {nev}!\nJogolutsági szinted: {role}\nElérhetőséged: {elerhetoseg}";
            }
            else if (hour > 12 && hour < 16)
            {
                WelocmeTextblock.Text = $"Jó Napot, {nev} !\nJogolutsági szinted:  {role} \nElérhetőséged:  {elerhetoseg}";
            }
            else
            {
                WelocmeTextblock.Text = $"Jó Estét, {nev} !\nJogolutsági szinted:  {role} \nElérhetőséged:  {elerhetoseg}";
            }
        }
       /*
        *  |-----------------------------|
        *  |  Felhasználók kezelése      |
        *  |-----------------------------|
        */


        private void UjFelhasznaloMenu_Click(object sender, RoutedEventArgs e)
        {
            UjFelhasznaloPanel.Visibility = Visibility.Visible;
            
        }

        private void FelhasznaloModositasMenu_Click(object sender, RoutedEventArgs e)
        {

        }


        private async void FelhasznaloTorleseMenu_Click(object sender, RoutedEventArgs e)
        {
            FelhasznaloTorlesPanel.Visibility = Visibility.Visible;
            var api = new ApiService();

            // .Result helyett await, hogy ne fagyjon ki a UI
            var lista = await api.GetUsersAsync();

            FelhasznaloTorlesComboBox.ItemsSource = lista;
            // Figyelem: A User osztályodban 'Elerhetoseg' van, nem 'Email'!
            FelhasznaloTorlesComboBox.DisplayMemberPath = "Elerhetoseg";
            FelhasznaloTorlesComboBox.SelectedValuePath = "Id";
        }

        private async void FelhasznaloTorlesSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            // A SelectedValue közvetlenül az Id-t adja vissza a SelectedValuePath miatt
            if (FelhasznaloTorlesComboBox.SelectedValue != null)
            {
                int id = Convert.ToInt32(FelhasznaloTorlesComboBox.SelectedValue);
                try
                {
                    ApiService api = new ApiService();
                    bool siker = await api.DeleteUserAsync(id, Token); // await kell ide is!
                }
                catch (Exception ex)
                {

                    Debug.WriteLine($"Hiba, Störung! {ex.Message}");
                }
               

               
            }
        }
        private async void FelhasznalokListajaMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
            FelhasznaloListPanel.Visibility = Visibility.Visible;


            var api = new ApiService();
            var lista = await api.GetUsersAsync();

            // Nézzük meg a Visual Studio "Output" ablakában, hány elem jött le
            System.Diagnostics.Debug.WriteLine($"Letöltött felhasználók száma: {lista.Count}");

            if (lista.Count > 0)
            {
                FelhasznalokListView.ItemsSource = null; // Kényszerített frissítés
                FelhasznalokListView.ItemsSource = lista;
            }
            else
            {
                MessageBox.Show("A lista üres, vagy hiba történt a letöltéskor.");
            }
        }


        //vissza gombok
        private void FelhasznalokTorlesVisszaBtn_Click(object sender, RoutedEventArgs e)
        {
            FelhasznaloTorlesPanel.Visibility = Visibility.Hidden; 
            WelocmePage.Visibility = Visibility.Visible;
        }
        private void EszkozTorlesVisszaBtn_Click(object sender, RoutedEventArgs e)
        {
            EszkozTorlesPanel.Visibility = Visibility.Hidden;
            WelocmePage.Visibility = Visibility.Visible;
        }
        private void modEszkozBackBtn_Click(object sender, RoutedEventArgs e)
        {
            EszkozModositasPanel.Visibility = Visibility.Hidden;
            WelocmePage.Visibility = Visibility.Visible;
        }
        private void UjFelhasznaloSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            UjFelhasznaloPanel.Visibility = Visibility.Hidden;
            WelocmePage.Visibility = Visibility.Visible;
            var api = new ApiService();
            string role = ujFelhasznaloCheckBox.IsChecked == true ? "admin" : "user";
            var lista = api.AddFelhasznaloAsync(UjFelhasznaloNev.Text,
            UjFelhasznaloEmail.Text,
            "jelszo",
            role,
            Token);
        }
        private void FelhasznalokListBackBtn_Click(object sender, RoutedEventArgs e)
        {
            FelhasznaloListPanel.Visibility = Visibility.Hidden;
            WelocmePage.Visibility = Visibility.Visible;

        }

        private void EszkozokListBackBtn_Click(object sender, RoutedEventArgs e)
        {
            EszkozokListPanel.Visibility = Visibility.Hidden;
            WelocmePage.Visibility = Visibility.Visible;
        }
        private void ujEszkozBackBtn_Click(object sender, RoutedEventArgs e)
        {
            ujEszkozPanel.Visibility = Visibility.Hidden;
            WelocmePage.Visibility = Visibility.Visible;
        }

        //eszközökList
        private async void EszkozokListajaMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
            EszkozokListPanel.Visibility = Visibility.Visible;

            ApiService api = new ApiService();

            var lista = await api.GetEszkozokAsync();
            Eszkoz.Eszkozok = lista;
            
            System.Diagnostics.Debug.WriteLine($"Letöltött eszközök száma: {lista.Count}");

            if (lista.Count > 0)
            {
                EszkozokListView.ItemsSource = lista;
            }
            else
            {
                MessageBox.Show("A lista üres, vagy hiba történt a letöltéskor.");
            }
        }

        private async void UjEszkozMenu_Click(object sender, RoutedEventArgs e)
        {
            ujEszkozPanel.Visibility = Visibility.Visible;
            
            ApiService api = new ApiService();
            Uzemelteto.uzemeltetokAll.Clear();
            Uzemelteto.uzemeltetokAll = await api.GetUzemeltetokAsync();

            ujEszkozUzemelteto.Items.Clear();
            foreach (var item in Uzemelteto.uzemeltetokAll)
            {
                ujEszkozUzemelteto.Items.Add(item.ToString());
            }
            WelocmePage.Visibility = Visibility.Hidden;
        }
        private async void EszkozTorlesSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Visible;
            ApiService api = new ApiService();
            //kiválasztott eszköz törlése majd vissza a főoldalra
            // A SelectedValue közvetlenül az Id-t adja vissza a SelectedValuePath miatt
            if (EszkozTorlesComboBox.SelectedValue != null)
            {
                int id = Convert.ToInt32(EszkozTorlesComboBox.SelectedValue);
                try
                {
                    await api.DeleteEszkozAsync(id, Token); // await kell ide is!
                }
                catch (Exception ex)
                {

                    Debug.WriteLine($"Hiba, Störung! {ex.Message}");
                }



            }

            EszkozTorlesPanel.Visibility = Visibility.Hidden;
        }
        private async void EszkozTorleseMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;

            EszkozTorlesComboBox.Items.Clear();
            ApiService api = new ApiService();
            var a_ = await api.GetEszkozokAsync();
            Debug.WriteLine($"Letöltött eszközök száma: {a_.Count}");
            foreach (var item in a_)
            {
                EszkozTorlesComboBox.Items.Add(item.Id);
            }


            EszkozTorlesPanel.Visibility = Visibility.Visible;
        }

        private async void EszkozModositasMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
            ApiService api = new ApiService();
            var a_ = await api.GetUzemeltetokAsync();
            foreach (var item in a_)
            {
                modEszkozUzemelteto.Items.Add(item.Nev); //combo
            }
            var b_ = await api.GetEszkozokAsync();
            foreach (var item in b_)
            {
                modEszkozEszkComboBox.Items.Add(item.Id);
            }
            if (modEszkozEszkComboBox.SelectedValue != null)
            {
                int id = Convert.ToInt32(modEszkozEszkComboBox.SelectedValue);

                modEszkozLeiras.Text = Eszkoz.Eszkozok[id].Leiras.ToString();
                modEszkozCpu.Text = Eszkoz.Eszkozok[id].Cpu.ToString();
                modEszkozRam.Text = Eszkoz.Eszkozok[id].Ram.ToString();
                modEszkozHdd.Text = Eszkoz.Eszkozok[id].Hdd.ToString();
            }
                EszkozModositasPanel.Visibility = Visibility.Visible;
        }
        private async void ujEszkozSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            ApiService api = new ApiService();
            var leiras = ujEszkozLeiras.Text;
            var cpu = ujEszkozCpu.Text;
            var ram = ujEszkozRam.Text;
            var hdd = ujEszkozHdd.Text;

            var uzemelteto = ujEszkozUzemelteto.SelectedItem as string;
            

            if (string.IsNullOrEmpty(uzemelteto))
            {
                MessageBox.Show("Válassz üzemeltetőt!");
                return;
            }

            // .Result HELYETT await!
            bool siker = await api.InsertEszkozAsync(leiras, cpu, ram, hdd, uzemelteto, Token);

            if (siker)
            {
                MessageBox.Show("Sikeres eszköz hozzáadás!");
                ujEszkozPanel.Visibility = Visibility.Hidden;
                // Itt érdemes lehet frissíteni a fő listát is
            }
            else
            {
                MessageBox.Show("Hiba történt. Ellenőrizd a szerverkapcsolatot!");
            }
        }
        private async void modEszkozSaveBtn_Click(object sender, RoutedEventArgs e)
        {


            ApiService api = new ApiService();
            

            if (modEszkozEszkComboBox.SelectedValue != null)
            {
                int id = Convert.ToInt32(modEszkozEszkComboBox.SelectedIndex);

               

                var leiras = modEszkozLeiras.Text;
                var cpu = modEszkozCpu.Text;
                var ram = modEszkozRam.Text;
                var hdd = modEszkozHdd.Text;
                if (modEszkozUzemelteto.SelectedItem != null)
                {
                    int uzemID = await api.GetUzemeltetoIDByNameAsync(modEszkozUzemelteto.SelectedItem.ToString()); 
                    await api.UpdateEszkozAsync(id, leiras, cpu, ram, hdd, uzemID, Token);
                }
               

            }
            EszkozModositasPanel.Visibility = Visibility.Hidden;

        }

        private  async void modEszkozEszkComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            int id = Convert.ToInt32(modEszkozEszkComboBox.SelectedIndex);
            Eszkoz.Eszkozok.Clear();
            Eszkoz.Eszkozok = await new ApiService().GetEszkozokAsync();

            modEszkozLeiras.Text = Eszkoz.Eszkozok[id].Leiras.ToString();
            modEszkozCpu.Text = Eszkoz.Eszkozok[id].Cpu.ToString();
            modEszkozRam.Text = Eszkoz.Eszkozok[id].Ram.ToString();
            modEszkozHdd.Text = Eszkoz.Eszkozok[id].Hdd.ToString();
        }

        private void ErtekelesekMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }

        private void UzemeltetokListajaMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }

        private void UjUzemeltetoMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }

        private void UzemeltetoTorleseMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }

        private void UzemeltetoModositasMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }
        private void NaplozasListajaMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }

        private void NaplozasTorleseMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }

        private void ErtekelesTorleseMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }

        private void ErtekelesModositasMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }

        private void UjErtekelesMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }
        private void NaplozasModositasMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }

        private void UjNaplozasMenu_Click(object sender, RoutedEventArgs e)
        {
            WelocmePage.Visibility = Visibility.Hidden;
        }

    }
}