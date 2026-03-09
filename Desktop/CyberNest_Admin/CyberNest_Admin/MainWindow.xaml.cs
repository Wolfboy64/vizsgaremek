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
                MessageBox.Show($"Sikeres belépés! Token: {Token} További infók: {eredmeny.User.Role}" );
                // Itt átválthatsz egy másik ablakra vagy betöltheted az adatokat
                LoginPage.Visibility = Visibility.Hidden;
                SideBrand_loginPage.Visibility = Visibility.Hidden;

                MainContentPage.Visibility = Visibility.Visible;


            }
            else
            {
                MessageBox.Show("Hiba a bejelentkezés során. Ellenőrizd az adatokat!");
            }

            // Visszaállítjuk a UI-t
            Bejelentkezes.IsEnabled = true;
        }

       /*
        *  |-----------------------------|
        *  |  Felhasználók kezelése      |
        *  |-----------------------------|
        */


        private void UjFelhasznaloMenu_Click(object sender, RoutedEventArgs e)
        {
            UjFelhasznaloPanel.Visibility = Visibility.Visible;
            var api = new ApiService();

            var lista = api.RegisterAsync(UjFelhasznaloNev.Text,
                UjFelhasznaloEmail.Text,
                "jelszo",
                UjFelhasznaloRole.SelectedValue.ToString());
        }

        private void FelhasznaloModositasMenu_Click(object sender, RoutedEventArgs e)
        {

        }
        private void FelhasznaloTorleseMenu_Click(object sender, RoutedEventArgs e)
        {

        }
        private async void FelhasznalokListajaMenu_Click(object sender, RoutedEventArgs e)
        {
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

        private void UjFelhasznaloSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            UjFelhasznaloPanel.Visibility = Visibility.Hidden; 
        }
        private void FelhasznalokListBackBtn_Click(object sender, RoutedEventArgs e)
        {
            FelhasznaloListPanel.Visibility = Visibility.Hidden;
        }
        private void EszkozokListBackBtn_Click(object sender, RoutedEventArgs e)
        {
            EszkozokListPanel.Visibility = Visibility.Hidden;
        }


        //eszközökList
        private async void EszkozokListajaMenu_Click(object sender, RoutedEventArgs e)
        {
            EszkozokListPanel.Visibility = Visibility.Visible;
            ApiService api = new ApiService();
            var lista = await api.GetEszkozokAsync();
            Uzemelteto.uzemeltetokAll.Clear(); 
            foreach (var item in lista) {
                Uzemelteto.uzemeltetokAll.Add(new Uzemelteto((int)item.UzemeltetoId,item.UzemeltetoNev,item.UzemeltetoLeiras));
            }
            
            System.Diagnostics.Debug.WriteLine($"Letöltött eszközök száma: {lista.Count}");
            if (lista.Count > 0)
            {
                EszkozokListView.ItemsSource = null; // Kényszerített frissítés
                EszkozokListView.ItemsSource = lista;
            }
            else
            {
                MessageBox.Show("A lista üres, vagy hiba történt a letöltéskor.");
            }

        }

        private void UjEszkozMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void EszkozTorleseMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void EszkozModositasMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        
    }
}