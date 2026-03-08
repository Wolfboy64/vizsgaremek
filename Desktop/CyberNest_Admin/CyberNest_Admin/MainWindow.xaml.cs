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
                MessageBox.Show($"Sikeres belépés! Token: {eredmeny.Token} További infók: {eredmeny.User.Role}" );
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
           |-----------------------------|
           |  Felhasználók kezelése      |
           |-----------------------------|*/


        private void UjFelhasznaloMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void FelhasznaloModositasMenu_Click(object sender, RoutedEventArgs e)
        {

        }
        private void FelhasznaloTorleseMenu_Click(object sender, RoutedEventArgs e)
        {

        }

        private void FelhasznalokListajaMenu_Click(object sender, RoutedEventArgs e)
        {

        }
    }
}