
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
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
using MySql.Data.MySqlClient;

namespace Netcest_Desktop
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private string AName;
        private string APassword;
        struct Felhasznalo
        {
            int Id;
            string Name;
            string Elerhetoseg;
            string Allapot;
            public Felhasznalo(int id, string name, string elerhetoseg, string allapot )
            {
                Id = id;
                Name = name;
                Elerhetoseg = elerhetoseg;
                Allapot = allapot;
            }
            public static List<Felhasznalo> FelhasznalokOsszes = new List<Felhasznalo>();
            
            public override string ToString()
            {
                return $"{Id} | {Name} | {Elerhetoseg} | {Allapot}";
            }
        }
        public MainWindow()
        {
            InitializeComponent();
            loginPage.Visibility = Visibility.Visible;
            homePage.Visibility = Visibility.Hidden;
        }
        private string connectionString =
           "Server=localhost;" +
           "Database=test2;" +
           "Uid=root;" +
           "Pwd=;" +      
           "Port=3307;";
        private void connectDatabase()
        {
            

            using ( MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();

                string query = "SELECT * FROM `felhasznalo`";
                MySqlCommand cmd = new MySqlCommand(query, connection);

                MySqlDataReader reader = cmd.ExecuteReader();
           
            }

        }
        private string FelhasznaloFejlec()
        {
            return "ID | Név | Elérhetőség | Állapot";
        }
        private bool LoginCheck( string username, string password)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT * FROM `felhasznalo` WHERE `nev` = @username AND `elerhetoseg` = @password";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@username", username);
                cmd.Parameters.AddWithValue("@password", password);
                MySqlDataReader reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    AName = reader["nev"].ToString();
                    APassword = reader["elerhetoseg"].ToString();
                    Felhasznalo a_ = new Felhasznalo(
                        Convert.ToInt32(reader["id"]),
                        reader["nev"].ToString(),
                        reader["elerhetoseg"].ToString(),
                        reader["allapot"].ToString()
                        );
                    Felhasznalo.FelhasznalokOsszes.Add(a_);
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        private void loginButton_Click(object sender, RoutedEventArgs e)
        {
            if (LoginCheck(usernameTextBox.Text, passwordBox.Password) == true)
            {
                connectDatabase();
                loginPage.Visibility = Visibility.Hidden;
                homePage.Visibility = Visibility.Visible;
                AdminInfos.Text = FelhasznaloFejlec();
                MainText.Text = $"Üdvözöllek, {AName}!";
                for (int i = 0; i < Felhasznalo.FelhasznalokOsszes.Count; i++)
                {
                    
                    Userlist.Items.Add( Felhasznalo.FelhasznalokOsszes[i].ToString());
                }
            }
            else 
            {
                MessageBox.Show("Bejelentkezés sikertelen.");
            }
                
        }
        private List<string> FelhasznalokListing()
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT * FROM `felhasznalo`";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                MySqlDataReader reader = cmd.ExecuteReader();
                List<string> felhasznalok = new List<string>();
                while (reader.Read())
                {
                    felhasznalok.Add($"{reader["id"]} | {reader["nev"]} | {reader["elerhetoseg"]} | {reader["allapot"]}");
                }
                return felhasznalok;
            }
        }
        private void manageUsersButton_Click(object sender, RoutedEventArgs e)
        {
            //homePage.Visibility = Visibility.Hidden;
            //manageUsersPage.Visibility = Visibility.Visible;
        }

        private void viewReportsButton_Click(object sender, RoutedEventArgs e)
        {

        }

        private void settingsButton_Click(object sender, RoutedEventArgs e)
        {

        }

        private void logoutButton_Click(object sender, RoutedEventArgs e)
        {
            homePage.Visibility = Visibility.Hidden;
            loginPage.Visibility = Visibility.Visible;
            usernameTextBox.Clear();
            passwordBox.Clear();
        }

        private void backFromManageUsersButton_Click(object sender, RoutedEventArgs e)
        {
            //manageUsersButton.Visibility = Visibility.Visible;
            //homePage.Visibility = Visibility.Visible;
        }
    }
}
