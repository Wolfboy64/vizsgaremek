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

namespace CyberNest_Desktop
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
            public int Id;
            public string Name;
            public string Jelszo;
            public string Allapot;
            public string Role;
            public Felhasznalo(int id, string name, string jelszo, string allapot, string role)
            {
                Id = id;
                Name = name;
                Jelszo = jelszo;
                Allapot = allapot;
                Role = role;
            }
            public static List<Felhasznalo> FelhasznalokOsszes = new List<Felhasznalo>();
            public static Felhasznalo Bejlentkezett = new Felhasznalo();
            public override string ToString()
            {
                return $"{Id} | {Name} | {Allapot}";
            }
        }
        struct Eszkozok
        {
            public string Leiras;
            public string Cpu;
            public string Ram;
            public string Hdd;
            public Eszkozok( string leiras, string cpu, string ram, string hdd)
            {
                Leiras = leiras;
                Cpu = cpu;
                Ram = ram;
                Hdd = hdd;
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
           "Database=test3;" +
           "Uid=root;" +
           "Pwd=;" +      
           "Port=3306;";
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
                string query = "SELECT * FROM `felhasznalo` WHERE `nev` = @username AND `jelszo` = @password AND `role` = @role";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                //azt ellenörzőm, hogy a role = e "admin"-al




                cmd.Parameters.AddWithValue("@username", username);
                cmd.Parameters.AddWithValue("@password", password);
                cmd.Parameters.AddWithValue("@role", "admin");

                MySqlDataReader reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    
                    AName = reader["nev"].ToString();
                    //APassword = reader["elerhetoseg"].ToString();
                    Felhasznalo a_ = new Felhasznalo(
                        Convert.ToInt32(reader["id"]),
                        reader["nev"].ToString(),
                        reader["jelszo"].ToString(),
                        reader["elerhetoseg"].ToString(),
                        reader["role"].ToString()
                        );
                    Felhasznalo.Bejlentkezett =a_;
                    Felhasznalo.FelhasznalokOsszes.Add(a_);
                    connection.Close();
                    return true;
                }
                else
                {
                    connection.Close();
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
                Felhasznalo.Bejlentkezett.Allapot = "aktiv";
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "UPDATE `felhasznalo` SET `allapot` = @allapot WHERE `id` = @id";
                    MySqlCommand cmd = new MySqlCommand(query, connection);
                    cmd.Parameters.AddWithValue("@allapot", Felhasznalo.Bejlentkezett.Allapot);
                    cmd.Parameters.AddWithValue("@id", Felhasznalo.Bejlentkezett.Id);
                    cmd.ExecuteNonQuery();
                }


                //AdminInfos.Text = FelhasznaloFejlec();
                //MainText.Text = $"Üdvözöllek, {AName}!";
                for (int i = 0; i < Felhasznalo.FelhasznalokOsszes.Count; i++)
                {
                    
                    Userlist.Items.Add( Felhasznalo.FelhasznalokOsszes[i].ToString());
                }
            }
            else 
            {
                MessageBox.Show( "Hibás felhasználónév vagy jelszó", "Bejelentkezés sikertelen.", MessageBoxButton.OK, MessageBoxImage.Error);
                
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
                    felhasznalok.Add($"{reader["id"]} | {reader["nev"]} | {reader["role"]}");
                }
                return felhasznalok;
            }
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
            loginPage.Height = this.Height;
            loginPage.Width = this.Width;
            //állapot átváltása inaktivvá
            Felhasznalo.Bejlentkezett.Allapot = "inaktiv";
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "UPDATE `felhasznalo` SET `allapot` = @allapot WHERE `id` = @id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@allapot", Felhasznalo.Bejlentkezett.Allapot);
                cmd.Parameters.AddWithValue("@id", Felhasznalo.Bejlentkezett.Id);
                cmd.ExecuteNonQuery();
            }

            MessageBox.Show($"{Felhasznalo.Bejlentkezett.Name} {Felhasznalo.Bejlentkezett.Allapot}");
            Felhasznalo.Bejlentkezett = new Felhasznalo();
            usernameTextBox.Clear();
            passwordBox.Clear();
        }

        private void backFromManageUsersButton_Click(object sender, RoutedEventArgs e)
        {
            
        }

        private void manageUsersButton_Click(object sender, RoutedEventArgs e)
        {
            MainHomePage.Visibility = Visibility.Hidden;
            // Add this line if you have a ManageUsersPage element defined in your XAML
            ManageUsersPage.Visibility = Visibility.Visible;
            Userlist.Items.Clear();
            Userlist.Items.Add(FelhasznalokListing().FirstOrDefault());
        }

        //eszközök kezelése
        private void EszkozokButton_Click(object sender, RoutedEventArgs e)
        {
            eszkozokoldal.Visibility = Visibility.Visible;
        }
        private void eszkozHozzaadas_Click(object sender, RoutedEventArgs e)
        {
            eszkozHozzadasPanel.Visibility = Visibility.Visible;
            eszkozModositasPanel.Visibility = Visibility.Hidden;
            eszkozListazasPanel.Visibility = Visibility.Hidden;
            eszkozTorlespanel.Visibility = Visibility.Hidden;
        }
      

        private void eszkozHozzaadasGomb_Click(object sender, RoutedEventArgs e)
        {
            Eszkozok e_ = new Eszkozok(
                eszkozLeiras.Text,
                eszkozCpu.Text,
                eszkozRam.Text,
                eszkozHdd.Text
                );
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "INSERT INTO `eszkoz` (`leiras`, `cpu`, `ram`, `hdd`) VALUES (@leiras, @cpu, @ram, @hdd)";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@leiras", e_.Leiras);
                cmd.Parameters.AddWithValue("@cpu", e_.Cpu);
                cmd.Parameters.AddWithValue("@ram", e_.Ram);
                cmd.Parameters.AddWithValue("@hdd", e_.Hdd);
                cmd.ExecuteNonQuery();

            }
            eszkozHozzadasPanel.Visibility = Visibility.Hidden;
        }

        private void eszkozTorles_Click(object sender, RoutedEventArgs e)
        {
            eszkozModositasPanel.Visibility = Visibility.Hidden;
            eszkozHozzadasPanel.Visibility = Visibility.Hidden;
            eszkozListazasPanel.Visibility = Visibility.Hidden;
            eszkozTorlespanel.Visibility = Visibility.Visible;


            
            // Clear existing items before populating
            IDs.Items.Clear();
            
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT `id` FROM `eszkoz`";  // Only select what you need
                MySqlCommand cmd = new MySqlCommand(query, connection);
                MySqlDataReader reader = cmd.ExecuteReader();
                
                while (reader.Read())
                {
                    IDs.Items.Add(Convert.ToInt32(reader["id"]));
                }
                reader.Close();
            }
        }

        private void eszkozTorlesGomb_Click(object sender, RoutedEventArgs e)
        {
            eszkozHozzadasPanel.Visibility = Visibility.Hidden;
            eszkozModositasPanel.Visibility = Visibility.Hidden;
            eszkozListazasPanel.Visibility = Visibility.Hidden;
            eszkozTorlespanel.Visibility = Visibility.Visible;
            if (IDs.SelectedItem != null)
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "DELETE FROM `eszkoz` WHERE `id` = @id";
                    MySqlCommand cmd = new MySqlCommand(query, connection);
                    cmd.Parameters.AddWithValue("@id", IDs.SelectedItem);
                    cmd.ExecuteNonQuery();
                    eszkozTorlespanel.Visibility = Visibility.Hidden;
                    connection.Close();
                }
            }
        }

        private void eszkozModositas_Click(object sender, RoutedEventArgs e)
        {
            eszkozHozzadasPanel.Visibility = Visibility.Hidden;
            eszkozListazasPanel.Visibility = Visibility.Hidden;
            eszkozTorlespanel.Visibility = Visibility.Hidden;
            eszkozModositasPanel.Visibility = Visibility.Visible;
            List<int> eszkozids = new List<int>();
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT `id` FROM `eszkoz`";  // Only select what you need
                MySqlCommand cmd = new MySqlCommand(query, connection);
                MySqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    eszkozids.Add(Convert.ToInt32(reader["id"]));
                }
                reader.Close();
            }
            for (int i = 0; i < eszkozids.Count; i++)
            {
                EszkModIDs.Items.Add(eszkozids[i]);
            }
        }

        private void EszkModIDs_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (EszkModIDs.SelectedItem != null)
            {
                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT * FROM `eszkoz` WHERE `id` = @id";
                    MySqlCommand cmd = new MySqlCommand(query, connection);
                    cmd.Parameters.AddWithValue("@id", EszkModIDs.SelectedItem);
                    MySqlDataReader reader = cmd.ExecuteReader();
                    
                    if (reader.Read())
                    {
                        eszkozModLeiras.Text = reader["leiras"].ToString();
                        eszkozModCpu.Text = reader["cpu"].ToString();
                        eszkozModRam.Text = reader["ram"].ToString();
                        eszkozModHdd.Text = reader["hdd"].ToString();
                    }
                    reader.Close();
                }
            }
        }

        private void eszkozModositasGomb_Click(object sender, RoutedEventArgs e)
        {
            if (EszkModIDs.SelectedItem != null && (eszkozModLeiras.Text != null && eszkozModCpu.Text != null && eszkozModHdd.Text != null && eszkozModRam.Text != null))
            {
                


                using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "UPDATE `eszkoz` SET `leiras` = @leiras, `cpu` = @cpu, `ram` = @ram, `hdd` = @hdd WHERE `id` = @id";
                    MySqlCommand cmd = new MySqlCommand(query, connection);
                    cmd.Parameters.AddWithValue("@leiras", eszkozModLeiras.Text);
                    cmd.Parameters.AddWithValue("@cpu", eszkozModCpu.Text);
                    cmd.Parameters.AddWithValue("@ram", eszkozModRam.Text);
                    cmd.Parameters.AddWithValue("@hdd", eszkozModHdd.Text);
                    cmd.Parameters.AddWithValue("@id", EszkModIDs.SelectedItem);
                    
                    cmd.ExecuteNonQuery();
                    eszkozModositasPanel.Visibility = Visibility.Hidden;
                    connection.Close();
                }
            }
        }

        private void eszkozListazas_Click(object sender, RoutedEventArgs e)
        {
            // Clear existing items before populating
            eszkozHozzadasPanel.Visibility = Visibility.Hidden;
            eszkozModositasPanel.Visibility = Visibility.Hidden;
            eszkozTorlespanel.Visibility = Visibility.Hidden;
            eszkozListazasPanel.Visibility = Visibility.Visible;
            EszkozListView.Items.Clear();
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT * FROM `eszkoz`";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                MySqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    EszkozListView.Items.Add($"ID: {reader["id"]} | Leírás: {reader["leiras"]} | CPU: {reader["cpu"]} | RAM: {reader["ram"]} | HDD: {reader["hdd"]} ");
                }
                reader.Close();


            }
        }

        private void eszkozListaVissza_Click(object sender, RoutedEventArgs e)
        {
            eszkozListazasPanel.Visibility = Visibility.Hidden;
        }
    }
}
