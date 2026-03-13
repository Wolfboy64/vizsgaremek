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
            Uzemelteto.uzemeltetokAll.Clear();

            foreach (var item in lista)
            {
                Uzemelteto.uzemeltetokAll.Add(
                    new Uzemelteto(
                        (int)item.UzemeltetoId,
                        item.UzemeltetoNev,
                        item.UzemeltetoLeiras
                    )
                );
            }

            System.Diagnostics.Debug.WriteLine($"Letöltött eszközök száma: {lista.Count}");

            if (lista.Count > 0)
            {
                EszkozokListView.ItemsSource = lista;
            }
            else
            {
                MessageBox.Show("A lista üres, vagy hiba történt a letöltéskor.");
            }

            var lista2 = Uzemelteto.uzemeltetokAll
                .Select(x => x.UzemeltetoNev)
                .Where(nev => !string.IsNullOrEmpty(nev))
                .Distinct()
                .ToList();

            ujEszkozUzemelteto.ItemsSource = lista2;
        }

        private void UjEszkozMenu_Click(object sender, RoutedEventArgs e)
        {
            ujEszkozPanel.Visibility = Visibility.Visible;
            WelocmePage.Visibility = Visibility.Hidden;
        }

        private void EszkozTorleseMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void EszkozModositasMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private async void ujEszkozSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            ApiService api = new ApiService();
            var leiras = ujEszkozLeiras.Text;
            var cpu = ujEszkozCpu.Text;
            var ram = ujEszkozRam.Text;
            var hdd = ujEszkozHdd.Text;

            var uzemeltetoneve = ujEszkozUzemelteto.SelectedValue.ToString();

            var eredmeny = api.InsertEszkozAsync(leiras, cpu, ram, hdd, uzemeltetoneve, Token);
            if (eredmeny.Result)
            {
                MessageBox.Show("Sikeres eszköz hozzáadás!");
                ujEszkozPanel.Visibility = Visibility.Hidden;
            }
            else
            {
                MessageBox.Show("Hiba történt az eszköz hozzáadásakor. Ellenőrizd az adatokat!");
            }

        }

        private void ErtekelesekMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void UzemeltetokListajaMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void UjUzemeltetoMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void UzemeltetoTorleseMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void UzemeltetoModositasMenu_Click(object sender, RoutedEventArgs e)
        {

        }
        private void NaplozasListajaMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void NaplozasTorleseMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void ErtekelesTorleseMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void ErtekelesModositasMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void UjErtekelesMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void NaplozasListajaMenu_Click_1(object sender, RoutedEventArgs e)
        {

        }

        private void NaplozasTorleseMenu_Click_1(object sender, RoutedEventArgs e)
        {

        }

        private void NaplozasModositasMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void UjNaplozasMenu_Click(object sender, RoutedEventArgs e)
        {

        }
    }
}