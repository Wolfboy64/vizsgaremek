using Microsoft.VisualBasic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
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

            //modfelh. panel betöltésekor kell majd:
            modFelhasznaloJogosultsag.Items.Add("admin");
            modFelhasznaloJogosultsag.Items.Add("user");

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
                MessageBox.Show($"Sikeres belépés! Üdvözlünk, {date.ToString()}!");
                DateSetup(date, eredmeny.User.Nev, eredmeny.User.Role, eredmeny.User.Elerhetoseg);
            }
            else
            {
                MessageBox.Show("Hiba a bejelentkezés során. Ellenőrizd az adatokat!");
            }

            // Visszaállítjuk a UI-t
            Bejelentkezes.IsEnabled = true;
        }
        private void DateSetup(DateTime d, string nev, string role, string elerhetoseg)
        {
            //8:57-kor jó estét, ez nem jó, de majd finomhangoljuk a határokat
            if (d.Hour < 8)
            {
                WelocmeTextblock.Text = $"Jó Reggelt, {nev}!\nJogolutsági szinted: {role}\nElérhetőséged: {elerhetoseg}";
            }
            else if ((d.Hour > 8 && d.Minute < 59) && d.Hour < 12)
            {
                WelocmeTextblock.Text = $"Jó Napot, {nev}!\nJogolutsági szinted: {role}\nElérhetőséged: {elerhetoseg}";
            }
            else if ((d.Hour > 12 && d.Minute < 59)  && d.Hour < 16)
            {
                WelocmeTextblock.Text = $"Jó Napot, {nev}!\nJogolutsági szinted: {role} \nElérhetőséged: {elerhetoseg}";
            }
            else
            {
                WelocmeTextblock.Text = $"Jó Estét, {nev}!\nJogolutsági szinted: {role} \nElérhetőséged:  {elerhetoseg}";
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

        


        private async void FelhasznaloTorleseMenu_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(FelhasznaloTorlesPanel);
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
            ShowPanel(FelhasznaloListPanel);

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
        private async void FelhasznaloModositasMenu_Click(object sender, RoutedEventArgs e)
        {
            Felhasznalo.Felhasznalok.Clear();
            ShowPanel(FelhasznaloModositasPanel);
            WelocmePage.Visibility = Visibility.Hidden;
            var api = new ApiService();
            Felhasznalo.Felhasznalok = await api.GetUsersAsync();
            modFelhasznaloComboBox.ItemsSource = Felhasznalo.Felhasznalok;
        }
        private async void FelhasznaloModositasSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            // Ellenőrizzük, van-e kijelölés
            if (modFelhasznaloComboBox.SelectedItem == null) return;

            // A SelectedItem-et User objektummá alakítjuk, hogy elérjük az ID-t
            var kijeloltUser = (User)modFelhasznaloComboBox.SelectedItem;
            int id = (int)kijeloltUser.Id;

            ApiService api = new ApiService();
            var nev = modFelhasznaloNev.Text;
            var elerhetoseg = modFelhasznaloEmail.Text;
            string role = "user";

            Debug.WriteLine($"Kijelölt szerepkör: {role}");
            //Debug.WriteLine($"Kijelölt user ID: {id}, Név: {nev}, E-mail: {elerhetoseg}, Szerepkör: {role}");
            // var role = modFelhasznaloCheckBox.IsChecked == true ? "admin" : "user";

            // Az igazi ID-t küldjük el!
            bool siker = await api.UpdateFelhasznaloAsync(id, nev, elerhetoseg, "jelszo", role, Token);

            if (siker)
            {
                // Lista frissítése
                Felhasznalo.Felhasznalok = await api.GetUsersAsync();
                modFelhasznaloComboBox.ItemsSource = null;
                modFelhasznaloComboBox.ItemsSource = Felhasznalo.Felhasznalok;

                ShowPanel(WelocmePage);
                MessageBox.Show("Sikeres módosítás!");
            }
        }
        private void modFelhasznaloComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            // A SelectedItem a kijelölt User objektumot adja vissza
            var user = modFelhasznaloComboBox.SelectedItem as User;

            if (user != null)
            {
                modFelhasznaloNev.Text = user.Nev ?? "";
                modFelhasznaloEmail.Text = user.Elerhetoseg ?? "";
                modFelhasznaloJogosultsag.SelectedIndex = user.Role == "admin" ? 0 : 1; // Admin: index 0, User: index 1
            }
        }
        //vissza gombok

        private void UjUzemeltetoBackBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
        private void UzemeltetokListBackBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
        private void FelhasznalokTorlesVisszaBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
        private void EszkozTorlesVisszaBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
        private void modEszkozBackBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
        private void FelhasznaloModositasBackBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
        private void UzemeltetoModositasBackBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
        private void FelhasznalokListBackBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra

        }
        private void EszkozokListBackBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
        private void ujEszkozBackBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
        private void UzemeltetoTorlesVisszaBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }

        private void FoglalasListBackBtn_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
        private void UjFelhasznaloSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            
            var api = new ApiService();
            string role = ujFelhasznaloCheckBox.IsChecked == true ? "admin" : "user";
            var lista = api.AddFelhasznaloAsync(UjFelhasznaloNev.Text,
            UjFelhasznaloEmail.Text,
            "jelszo",
            role,
            Token);
            ShowPanel(WelocmePage); //vissza a főoldalra
        }
       

        //eszközökList
        private async void EszkozokListajaMenu_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(EszkozokListPanel);

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
            ShowPanel(ujEszkozPanel);

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
            ShowPanel(WelocmePage);
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

        }
        private async void EszkozTorleseMenu_Click(object sender, RoutedEventArgs e)
        {
            

            EszkozTorlesComboBox.Items.Clear();
            ApiService api = new ApiService();
            var a_ = await api.GetEszkozokAsync();
            Debug.WriteLine($"Letöltött eszközök száma: {a_.Count}");
            foreach (var item in a_)
            {
                EszkozTorlesComboBox.Items.Add(item.Id);
            }

            ShowPanel(EszkozTorlesPanel);
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
            ShowPanel(EszkozModositasPanel);
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
                ShowPanel(WelocmePage);
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
            ShowPanel(WelocmePage);

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
        /*      |--------------|
         *      | Uzemeltetok  |
         *      |--------------| 
         */

        private async void UzemeltetokListajaMenu_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(UzemeltetoListPanel);
            UzemeltetokListView.Items.Clear();
            ApiService api = new ApiService();
            var lista = await api.GetUzemeltetokAsync();
            Uzemelteto.uzemeltetokAll = lista;
            foreach (var item in lista)
            {
                UzemeltetokListView.Items.Add(item);
            }
        }

        private async void UjUzemeltetoSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            ApiService api = new ApiService();
            var nev = UjUzemeltetoNev.Text;
            var leiras = UjUzemeltetoLeiras.Text;
            bool response = await api.AddUzemeltetoAsync(nev, leiras, Token);
            if (response)
            {
                
                ShowPanel(WelocmePage);
            }
            else
            {
                
                Debug.WriteLine($"{nev}; {leiras}");

            }
        }
        private async void UzemeltetoModositasMenu_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(UzemeltetoModositasPanel);
            ApiService api = new ApiService();

            var list = await api.GetUzemeltetokAsync();

            UzemeltetoModComboBox.ItemsSource = list;

            UzemeltetoModComboBox.DisplayMemberPath = "Nev";
        }
        private async void UzemeltetoModositasSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            if (UzemeltetoModComboBox.SelectedItem is Uzemelteto kijelolt)
            {
                int id = kijelolt.Id; // Ez az igazi adatbázis ID!
                string nev = modUzemeltetoNev.Text;
                string leiras = modUzemeltetoLeiras.Text;

                ApiService api = new ApiService();
                bool siker = await api.UpdateUzemeltetoAsync(id, nev, leiras, Token);

                if (siker)
                {
                    ShowPanel(WelocmePage);
                    // Itt frissítheted a listát, ha szükséges
                }
            }
            else
            {
                MessageBox.Show("Kérlek, válassz ki egy üzemeltetőt!");
            }
        }
        private void UzemeltetoModComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            // A SelectedItem most már egy komplett Uzemelteto objektum!
            if (UzemeltetoModComboBox.SelectedItem is Uzemelteto kijelolt)
            {
                modUzemeltetoNev.Text = kijelolt.Nev;
                modUzemeltetoLeiras.Text = kijelolt.Leiras;
            }
        }

        private async void UzemeltetoTorleseMenu_Click(object sender, RoutedEventArgs e)
        {
            UzemeltetoTorlesComboBox.Items.Clear();
            ApiService api = new ApiService();
            var list = await api.GetUzemeltetokAsync();
            if (list != null)
            {
                foreach (var item in list)
                {
                    UzemeltetoTorlesComboBox.Items.Add(item.Nev);
                }
            }
            ShowPanel(UzemeltetoTorlesPanel);
        }

        private async void UzemeltetoTorlesSaveBtn_Click(object sender, RoutedEventArgs e)
        {
            ApiService api = new ApiService();
            var nev = UzemeltetoTorlesComboBox.SelectedItem as string;
            if (nev != null)
            {
                // Először meg kell szerezni az ID-t a név alapján
                int id = await api.GetUzemeltetoIDByNameAsync(nev);
                bool siker = await api.DeleteUzemeltetoAsync(id, Token);
                if (siker)
                {
                    
                    ShowPanel(WelocmePage);
                }
                else
                {
                    MessageBox.Show("Hiba történt a törlés során. Ellenőrizd a szerverkapcsolatot!");
                }

            }
        }
        /*      |-----------------|
         *      |    Foglalas     |
         *      |-----------------| 
         */
        private async void FoglalasListajaMenu_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(FoglalasListPanel);
            FoglalasListView.Items.Clear();
            ApiService api = new ApiService();
            var lista = await api.GetFoglalasokAsync(Token);
            Foglalas.FoglalasAll = lista;
            foreach (var item in lista)
            {
                FoglalasListView.Items.Add(item);
            }
        }


        /*      |-----------------|
         *      |    Ertekeles    |
         *      |-----------------| 
         */






        /*      |-----------------|
         *      |    Naplozas     |
         *      |-----------------| 
         */




        /*      |-----------------|
         *      |    Menu         |
         *      |-----------------| 
         */
        private void UjUzemeltetoMenu_Click(object sender, RoutedEventArgs e)
        {
            ShowPanel(UjUzemeltetoPanel);
        }

        private void ErtekelesekMenu_Click(object sender, RoutedEventArgs e)
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


        //Utils
        private void ShowPanel(StackPanel panelToShow)
        {
            // Az összes panel listája, amit kezelni akarunk
            List<StackPanel> mindenPanel = new List<StackPanel>
            {
                WelocmePage,
                FelhasznaloListPanel,
                UjFelhasznaloPanel,
                FelhasznaloTorlesPanel,
                FelhasznaloModositasPanel,
                EszkozokListPanel,
                ujEszkozPanel,
                EszkozTorlesPanel,
                EszkozModositasPanel,
                UzemeltetoListPanel,
                UjUzemeltetoPanel,
                UzemeltetoModositasPanel,
                UzemeltetoTorlesPanel,
                FoglalasListPanel
            };

            // Első lépés: Minden panelt teljesen eltüntetünk
            foreach (var panel in mindenPanel)
            {
                if (panel != null)
                {
                    panel.Visibility = Visibility.Collapsed;
                }
            }

            // Második lépés: Csak a kért panelt megjelenítjük
            if (panelToShow != null)
            {
                panelToShow.Visibility = Visibility.Visible;
            }
            else
            {
                // Ha null-t kap (vagy nincs megadva semmi), a WelcomePage az alapértelmezett
                WelocmePage.Visibility = Visibility.Visible;
            }
        }


        private void FoglalasTorleseMenu_Click(object sender, RoutedEventArgs e)
        {

        }

    }
}