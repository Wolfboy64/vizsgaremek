using MySqlConnector;
using Netcest_Desktop;
using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;


namespace CyberNest_Desktop
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private string AName;
        private string APassword;
        Felhasznalok Bejelentkezett;

        struct Eszkozok
        {
            public string Leiras;
            public string Cpu;
            public string Ram;
            public string Hdd;
            public Eszkozok(string leiras, string cpu, string ram, string hdd)
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
        //ADATBÁZIS KAPCSOLAT kezedete
        private string connectionString =
           "Server=localhost;" +
           "Database=test3;" +
           "Uid=root;" +
           "Pwd=;" +
           "Port=3307;";
        private void connectDatabase()
        {


            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();

                string query = "SELECT * FROM `felhasznalo`";
                MySqlCommand cmd = new MySqlCommand(query, connection);

                MySqlDataReader reader = cmd.ExecuteReader();

            }

        }
        //ADATBÁZIS KAPCSOLAT vége
        private string FelhasznaloFejlec()
        {
            return "ID | Név | Elérhetőség | Állapot";
        }
        //private bool LoginCheck(string username, string password)
        //{
            /*using (MySqlConnection connection = new MySqlConnection(connectionString))
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
                    Felhasznalok a_ = new Felhasznalok(
                        Convert.ToInt32(reader["id"]),
                        reader["nev"].ToString(),
                        reader["jelszo"].ToString(),
                        reader["elerhetoseg"].ToString(),
                        reader["role"].ToString()
                        );
                    //Felhasznalok.Bejlentkezett = a_;
                    Felhasznalok.FelhasznalokOsszes.Add(a_);
                    connection.Close();
                    return true;
                }
                else
                {
                    connection.Close();
                    return false;

                }

            }*/
        //}
        ApiService apiService = new ApiService();
        private void loginButton_Click(object sender, RoutedEventArgs e)
        {
            
                //connectDatabase();
                loginPage.Visibility = Visibility.Hidden;
                homePage.Visibility = Visibility.Visible;
                //Bejelentkezett.Allapot = "aktiv";
                /*using (MySqlConnection connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "UPDATE `felhasznalo` SET `allapot` = @allapot WHERE `id` = @id";
                    MySqlCommand cmd = new MySqlCommand(query, connection);
                    cmd.Parameters.AddWithValue("@allapot", Felhasznalok.Bejlentkezett.Allapot);
                    cmd.Parameters.AddWithValue("@id", Felhasznalok.Bejlentkezett.Id);
                    cmd.ExecuteNonQuery();
                }*/


                //AdminInfos.Text = FelhasznaloFejlec();
                //MainText.Text = $"Üdvözöllek, {AName}!";

            
            

        }
        private void logoutButton_Click(object sender, RoutedEventArgs e)
        {
            homePage.Visibility = Visibility.Hidden;
            loginPage.Visibility = Visibility.Visible;
            //állapot átváltása inaktivvá
            //Bejelentkezett.Allapot = "inaktiv";
            /*using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "UPDATE `felhasznalo` SET `allapot` = @allapot WHERE `id` = @id";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@allapot", Bejelentkezett.Allapot);
                cmd.Parameters.AddWithValue("@id", Bejelentkezett.Id);
                cmd.ExecuteNonQuery();
            }*/

            /*MessageBox.Show($"{Felhasznalok.Bejlentkezett.Name} {Felhasznalok.Bejlentkezett.Allapot}");
            Felhasznalok.Bejlentkezett = new Felhasznalok(null, null, null, null, null);*/
            usernameTextBox.Clear();
            passwordBox.Clear();
        }
        //eszközök kezelése
        private void EszkozokButton_Click(object sender, RoutedEventArgs e)
        {
            eszkozokoldal.Visibility = Visibility.Visible;
            FelhasznalokOldal.Visibility = Visibility.Hidden;
        }
        private void eszkozHozzaadas_Click(object sender, RoutedEventArgs e)
        {
            FelhasznalokOldal.Visibility = Visibility.Hidden;
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
            List<int> ids = new List<int>();

            using (MySqlConnection conn = new MySqlConnection(connectionString))
            {
                conn.Open();

                string query = "SELECT `uzemelteto_id` FROM `eszkoz` ";

                using (MySqlCommand cmd = new MySqlCommand(query, conn))
                {
                    MySqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        UzemeltetoID.Items.Add(Convert.ToInt32(reader["uzemelteto_id"]));
                    }
                    reader.Close();
                }

                conn.Close();
            }
        }


            /*using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();

                string query = @"INSERT INTO `eszkoz`(`leiras`, `cpu`, `ram`, `hdd`, `uzemelteto_id`) VALUES (@leiras, @cpu, @ram, @hdd, @uzemelteto_id)";

                using (MySqlCommand cmd = new MySqlCommand(query, connection))
                {
                    cmd.Parameters.AddWithValue("@leiras", e_.Leiras);
                    cmd.Parameters.AddWithValue("@cpu", e_.Cpu);
                    cmd.Parameters.AddWithValue("@ram", e_.Ram);
                    cmd.Parameters.AddWithValue("@hdd", e_.Hdd);

                    cmd.Parameters.AddWithValue(
                        "@uzemelteto_id",
                        Felhasznalok.Bejlentkezett.Id
                    );

                    cmd.ExecuteNonQuery();
                }
                connection.Close();
            }

            eszkozHozzadasPanel.Visibility = Visibility.Hidden;
        }*/

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
            EszkModIDs.Items.Clear();
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
                    string query = "UPDATE `eszkoz` SET `leiras` = @leiras, `cpu` = @cpu, `ram` = @ram, `hdd` = @hdd, `uzemelteto_id` = @uzemeltetoid WHERE `id` = @id";
                    MySqlCommand cmd = new MySqlCommand(query, connection);
                    cmd.Parameters.AddWithValue("@leiras", eszkozModLeiras.Text);
                    cmd.Parameters.AddWithValue("@cpu", eszkozModCpu.Text);
                    cmd.Parameters.AddWithValue("@ram", eszkozModRam.Text);
                    cmd.Parameters.AddWithValue("@hdd", eszkozModHdd.Text);
                    cmd.Parameters.AddWithValue("@id", EszkModIDs.SelectedItem);
                    cmd.Parameters.AddWithValue("@uzemeltetoid", 1);

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
            Back(eszkozListazasPanel);
        }
        //felhasználók kezelése
        private void felhasznaloKezeles_Click(object sender, RoutedEventArgs e)
        {
            Back(eszkozokoldal);
            FelhasznalokOldal.Visibility = Visibility.Visible;
            FelhasznalokTopMenu.Visibility = Visibility.Visible;
            /*//felhasználók listázása

            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT * FROM `felhasznalo`";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                MySqlDataReader reader = cmd.ExecuteReader();
                Felhasznalo.FelhasznalokOsszes.Clear();
                while (reader.Read())
                {
                    Felhasznalo a_ = new Felhasznalo(
                        Convert.ToInt32(reader["id"]),
                        reader["nev"].ToString(),
                        reader["jelszo"].ToString(),
                        reader["elerhetoseg"].ToString(),
                        reader["role"].ToString()
                        );
                    Felhasznalo.FelhasznalokOsszes.Add(a_);
                }
                reader.Close();
            }*/
        }



        private void felhasznaloListaVissza_Click(object sender, RoutedEventArgs e)
        {
            Back(FelhasznalokListazasPanel);
        }

        private void felhasznalokListazas_Click(object sender, RoutedEventArgs e)
        {
            FelhasznalokListazasPanel.Visibility = Visibility.Visible;
            FelhasznaloListView.Items.Clear();
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT * FROM `felhasznalo`";
                MySqlCommand cmd = new MySqlCommand(query, connection);
                MySqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    FelhasznaloListView.Items.Add($"ID: {reader["id"]} | Név: {reader["nev"]} | Elérhetőség: {reader["elerhetoseg"]} | Role: {reader["role"]} ");
                }
                reader.Close();
            }
        }
        private void felhasznalokModositas_Click(object sender, RoutedEventArgs e)
        {

        }

        private void felhasznalokTorles_Click(object sender, RoutedEventArgs e)
        {

        }

        private void felhasznalokHozzaadas_Click(object sender, RoutedEventArgs e)
        {
            FelhasznalokHozzaadasPanel.Visibility = Visibility.Visible;
            Back(FelhasznalokListazasPanel);
        }

        //easy tools
        private void Back (StackPanel panel)
        {
            if (panel.Visibility == Visibility.Visible)
            {
                panel.Visibility = Visibility.Hidden;
            }
            
        }

        private void FelhasznaloHozzaadasGomb_Click(object sender, RoutedEventArgs e)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                connection.Open();

                string query = "INSERT INTO `felhasznalo` (`nev`, `jelszo`, `allapot`, `role`) VALUES (@nev, @jelszo, @allapot, @role)";
                MySqlCommand cmd = new MySqlCommand(query, connection);

                cmd.Parameters.AddWithValue("@nev", FelhasznaloNev.Text);
                cmd.Parameters.AddWithValue("@jelszo", FelhasznaloJelszo.Password);

                cmd.Parameters.AddWithValue(
                    "@allapot",
                    (FelhasznaloAllapot.SelectedItem as ComboBoxItem)?.Content.ToString()
                );

                cmd.Parameters.AddWithValue(
                    "@role",
                    (FelhasznaloJogosultsag.SelectedItem as ComboBoxItem)?.Content.ToString()
                );

                cmd.ExecuteNonQuery();
                MessageBox.Show("Sikeres hozzáadás!");

                FelhasznaloNev.Clear();
                FelhasznaloJelszo.Clear();
                FelhasznaloAllapot.SelectedIndex = -1;
                FelhasznaloJogosultsag.SelectedIndex = -1;
                FelhasznalokHozzaadasPanel.Visibility = Visibility.Hidden;
            }
        }

        private void FelhasznaloJelszo_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {

        }

        private void FelhasznaloNev_MouseDoubleClick(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            FelhasznaloNev.Clear();
        }
    }
}
