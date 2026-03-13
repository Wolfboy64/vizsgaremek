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
        /* |----------------------|
         * | Felhasználók szakasz |
         * |----------------------|
         */
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
        public async Task<bool> DeleteUserAsync(int userId, string JWT)
        {
            try
            {
                // Ellenőrizd a végpontot: users/{userId} vagy felhasznalo/{userId}?
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);
                var response = await _httpClient.DeleteAsync($"felhasznalo/{userId}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Törlési hiba: {ex.Message}");
                return false;
            }
        }
        //insert new felhasznalo to /api/auth/register with post method. with this datas: nev, elerhetoseg, jelszo, role = "user"
        // CREATE: Új felhasználó hozzáadása
        public async Task<bool> AddFelhasznaloAsync(string nev, string elerhetoseg, string jelszo, string szerepkor, string JWT)
        {
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);
            var registerData = new
            {
                nev = nev,
                elerhetoseg = elerhetoseg,
                jelszo = jelszo,
                role = szerepkor // A backend 'role' néven várja a modelltől függően
            };
            // Figyelem: A backend create útvonala általában /felhasznalo vagy /auth/register
            var response = await _httpClient.PostAsJsonAsync("felhasznalo", registerData);
            return response.IsSuccessStatusCode;
        }


        /* |------------------|
         * | Eszközök szakasz |
         * |------------------|
         */


        public async Task<List<Eszkoz>> GetEszkozokAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("eszkoz");

                System.Diagnostics.Debug.WriteLine($"StatusCode: {response.StatusCode}");

                string jsonString = await response.Content.ReadAsStringAsync();

                System.Diagnostics.Debug.WriteLine($"Kapott JSON: {jsonString}");

                if (!response.IsSuccessStatusCode)
                {
                    System.Diagnostics.Debug.WriteLine("A kérés nem volt sikeres.");
                    return new List<Eszkoz>();
                }

                var lista = Eszkoz.FromJson(jsonString);

                System.Diagnostics.Debug.WriteLine($"Deszerializált lista elemszám: {lista.Count}");

                return lista;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Eszköz lekérési hiba: {ex.Message}");
                return new List<Eszkoz>();
            }
        }

        public async Task<bool> InsertEszkozAsync(string leiras, string cpu, string ram, string hdd, string uzemeltetoneve, string JWT)
        {
            try
            {
                // Megkeressük az üzemeltetőt a listában
                Uzemelteto? u = Uzemelteto.uzemeltetokAll.FirstOrDefault(x => x.Nev == uzemeltetoneve);

                if (u == null) return false;

                // Az anonim objektum kulcsait PONTOSAN úgy add meg, ahogy a backend várja
                var insertData = new
                {
                    leiras = leiras,
                    cpu = cpu,
                    ram = ram,
                    hdd = hdd,
                    uzemelteto_id = u.Id // Itt fixen megadjuk a nevet, így nincs ütközés
                };

                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);

                var response = await _httpClient.PostAsJsonAsync("eszkoz", insertData);

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Belső hiba: {ex.Message}");
                return false;
            }
        }
        public async Task<Eszkoz> DeleteEszkozAsync(int eszkozId, string JWT)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);
                var response = await _httpClient.DeleteAsync($"eszkoz/{eszkozId}");
                if (!response.IsSuccessStatusCode) return null;
                string jsonString = await response.Content.ReadAsStringAsync();
                return Eszkoz.FromJson(jsonString).FirstOrDefault(); // Visszaadjuk a törölt eszközt
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Törlési hiba: {ex.Message}");
                return null;
            }
        }
        public async Task<bool> UpdateEszkozAsync(int eszkozId, string leiras, string cpu, string ram, string hdd, string uzemeltetoneve, string JWT)
        {
            try
            {
                Uzemelteto? u = Uzemelteto.uzemeltetokAll.FirstOrDefault(x => x.Nev == uzemeltetoneve);
                if (u == null) return false;
                var updateData = new
                {
                    id = eszkozId,
                    leiras = leiras,
                    cpu = cpu,
                    ram = ram,
                    hdd = hdd,
                    uzemelteto_id = u.Id
                };
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);
                var response = await _httpClient.PutAsJsonAsync($"eszkoz/{eszkozId}", updateData);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Frissítési hiba: {ex.Message}");
                return false;
            }
        }
        /* |---------------------|
         * | Üzemeltetők szakasz |
         * |---------------------|
         */



        //üzemeltető lekérés végpontból
        public async Task<List<Uzemelteto>> GetUzemeltetokAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("uzemelteto");
                if (!response.IsSuccessStatusCode) return new List<Uzemelteto>();
                string jsonString = await response.Content.ReadAsStringAsync();
                return Uzemelteto.FromJson(jsonString);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                return new List<Uzemelteto>();
            }
        }

        
    }
}
