using System;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Windows; // Az async-hez szükséges

namespace CyberNest_Admin
{


    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "http://localhost:5050/api/";

        public ApiService()
        {
            _httpClient = new HttpClient { BaseAddress = new Uri(BaseUrl) };
            // Érdemes beállítani egy értelmes időtúllépést
            //_httpClient.Timeout = TimeSpan.FromSeconds(10);
        }
        public static List<Felhasznalo> Felhasznalok { get; set; } = new List<Felhasznalo>();
        public async Task<Felhasznalo?> LoginAsync(string email, string password)
        {
            Debug.WriteLine($"Próbálkozás bejelentkezéssel: {email}");
            Debug.WriteLine($"API URL: {_httpClient.BaseAddress}auth/login");

            try
            {
                // Fontos: Pontosan olyan neveket használj az anonim objektumban, 
                // amilyeneket a Backend (PHP/NodeJS/C#) elvár!
                var loginData = new
                {
                    elerhetoseg = email,  // Itt volt a hiba: 'nev' helyett 'elerhetoseg' kell
                    jelszo = password
                };

                var response = await _httpClient.PostAsJsonAsync("auth/login", loginData);

                // Debugoláshoz: Ha nem sikerült, nézzük meg miért
                if (!response.IsSuccessStatusCode)
                {
                    // Kiolvassuk a szerver válaszát (hátha ott van a hiba oka)
                    string errorContent = await response.Content.ReadAsStringAsync();
                    System.Diagnostics.Debug.WriteLine($"Szerver hiba ({response.StatusCode}): {errorContent}");
                    return null;
                }

                string jsonString = await response.Content.ReadAsStringAsync();
                return Felhasznalo.FromJson(jsonString);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Hálózati hiba: {ex.Message}");
                return null;
            }
        }
        public async Task<List<User>> GetUsersAsync()
        {
            var response = await _httpClient.GetAsync("debug/users");
            if (!response.IsSuccessStatusCode) return new List<User>();

            string jsonString = await response.Content.ReadAsStringAsync();

            // Debugoláshoz: Írasd ki, mit kapunk ténylegesen
            System.Diagnostics.Debug.WriteLine($"JSON válasz: {jsonString}");

            // Használd a PropertyNameCaseInsensitive opciót, ha nem a QuickType beállításait használod
            var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            return System.Text.Json.JsonSerializer.Deserialize<List<User>>(jsonString, options) ?? new List<User>();
        }
        public async Task<List<Eszkoz>> GetEszkozokAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("eszkozok"); // Ellenőrizd a végpontot!

                if (response.IsSuccessStatusCode)
                {
                    string jsonString = await response.Content.ReadAsStringAsync();
                    return Eszkoz.FromJson(jsonString);
                }
                return new List<Eszkoz>();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Eszközök lekérési hiba: {ex.Message}");
                return new List<Eszkoz>();
            }
        }
        //insert new felhasznalo to /api/auth/register with post method. with this datas: nev, elerhetoseg, jelszo, role = "user"
        public async Task<bool> RegisterAsync(string nev, string elerhetoseg, string jelszo, string szerepkor)
        {
            var registerData = new
            {
                nev,
                elerhetoseg,
                jelszo,
                szerepkor
            };
            var response = await _httpClient.PostAsJsonAsync("auth/register", registerData);
            return response.IsSuccessStatusCode;

        }



        /*public async Task<List<Eszkoz>> GetEszkozokAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("eszkoz");

                if (!response.IsSuccessStatusCode) return new List<Eszkoz>();

                

                string jsonString = await response.Content.ReadAsStringAsync();
                //uzemelteto létrehozása a jsonból
                //Adatok: UzemeltetoId, UzemeltetoNev, UzemeltetoLeiras
                


                return Eszkoz.FromJson(jsonString);
            }
            catch (Exception ex)
            {

                Debug.WriteLine(ex.Message);
                return new List<Eszkoz>();
            }
            
        }*/
        public async Task<bool> InsertEszkozAsync(string leiras, string cpu, string ram, string hdd, string uzemeltetoneve, string JWT)
        {
            try
            {
                Uzemelteto u = new Uzemelteto(0, "", "");
                foreach (var item in Uzemelteto.uzemeltetokAll)
                {
                    if (item.UzemeltetoNev == uzemeltetoneve)
                    {
                        u = item;
                        break;
                    }
                }

                var insertData = new
                {
                    leiras,
                    cpu,
                    ram,
                    hdd,
                    u.UzemeltetoId,
                    uzemeltetoneve,
                    u.UzemeltetoLeiras

                };
                //JWT token hozzáadása a kérés headeréhez
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);
                var response = await _httpClient.PostAsJsonAsync("eszkoz", insertData);
                Debug.WriteLine($"Response: {response}");
                return (response.IsSuccessStatusCode);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                return false;
            }
            


        }
    }
}
