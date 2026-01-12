using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Netcest_Desktop
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private string AName;
        private string APassword;
        public MainWindow()
        {
            InitializeComponent();
            loginPage.Visibility = Visibility.Visible;
            homePage.Visibility = Visibility.Hidden;
        }
        private void connectDatabase()
        {
            MessageBox.Show("Adatbázis ellenőrizve, létezik és csatlakozva van.!");
        }
        private bool LoginCheck()
        {
            AName = usernameTextBox.Text;
            APassword = passwordBox.Password;
            if (AName == "admin" && APassword == "admin123")
            {
                return true;
            }
            else
            {
                MessageBox.Show("Hibás felhasználónév vagy jelszó!");
                return false;
            }
        }
        private void loginButton_Click(object sender, RoutedEventArgs e)
        {
            if (LoginCheck() == true)
            {
                connectDatabase();
                loginPage.Visibility = Visibility.Hidden;
                homePage.Visibility = Visibility.Visible;
                MainText.Text = $"Üdvözöllek, {AName}!";
            }
            else 
            {
                MessageBox.Show("Bejelentkezés sikertelen.");
            }
                
        }

        private void manageUsersButton_Click(object sender, RoutedEventArgs e)
        {

        }

        private void viewReportsButton_Click(object sender, RoutedEventArgs e)
        {

        }

        private void settingsButton_Click(object sender, RoutedEventArgs e)
        {

        }

        private void logoutButton_Click(object sender, RoutedEventArgs e)
        {

        }
    }
}
