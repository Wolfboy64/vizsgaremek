using System;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
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
                var loginData = new
                {
                    elerhetoseg = email, 
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
        // Általános állapotfrissítő (Bejelentkezéskor "aktív", kijelentkezéskor "inaktív")
        public async Task UpdateStatusAsync(User user, string JWT, string ujAllapot)
        {
            if (user == null || user.Id == 0) return;

            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);

            var updateData = new
            {
                nev = user.Nev,
                elerhetoseg = user.Elerhetoseg,
                allapot = ujAllapot, // Itt megy át az "aktív" vagy "inaktív"
                role = user.Role
            };

            try
            {
                var response = await _httpClient.PutAsJsonAsync($"felhasznalo/{user.Id}", updateData);
                Debug.WriteLine($"Állapot frissítve: {ujAllapot} (ID: {user.Id})");
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Hiba az állapotfrissítésnél: {ex.Message}");
            }
        }

        // A Logout most már csak meghívja az állapotfrissítőt

        public async Task Logout(User bejelentkezettfelhasznalo, string JWT)
        {

            await UpdateStatusAsync(bejelentkezettfelhasznalo, JWT, "inaktív");
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
        /* 
         *   {
                "nev": "név",
                "elerhetoseg": "fff@local",
                "allapot": "aktiv",
                "role": "user"
              }
         */
        public async Task<bool> UpdateFelhasznaloAsync(int id, string nev, string elerhetoseg, string jelszo, string szerepkor, string JWT)
        {
            try
            {
                // Használjuk pontosan azokat a neveket, amiket az API vár!
                var updateData = new
                {
                    nev = nev,
                    elerhetoseg = elerhetoseg,
                    allapot = "aktiv",
                    role = szerepkor
                };

                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);

                // A PutAsJsonAsync alapból PascalCase-t használhat, ha nem vigyázunk. 
                // Biztosabb megoldás:
                var response = await _httpClient.PutAsJsonAsync($"felhasznalo/{id}", updateData);
                Debug.WriteLine($"Hívott URL: {_httpClient.BaseAddress}felhasznalo/{id}");

                if (!response.IsSuccessStatusCode)
                {
                    // Debugoláshoz nézzük meg, mi a hibaüzenet a szervertől
                    var errorBody = await response.Content.ReadAsStringAsync();
                    Debug.WriteLine($"API Hiba ({response.StatusCode}): {errorBody}");
                }

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Frissítési hiba: {ex.Message}");
                return false;
            }
        }

        /* |------------------|
         * | Eszközök szakasz |
         * |------------------|
         */


        public async Task<List<Eszkoz>> GetEszkozokAsync()
        {
            try
            {
                // 1. Kérés elküldése
                var response = await _httpClient.GetAsync("eszkoz");

                // 3. JSON beolvasása
                string jsonString = await response.Content.ReadAsStringAsync();
                Debug.WriteLine($"Kapott JSON: {jsonString}");

                // 4. Üres válasz kezelése
                if (string.IsNullOrWhiteSpace(jsonString) || jsonString == "[]")
                {
                    return new List<Eszkoz>();
                }

                // 5. Deszerializáció a javított Eszkoz osztályba (ami már kezeli a null-t)
                // Fontos: a Converter.Settings használata biztosítja a kompatibilitást
                var lista = Eszkoz.FromJson(jsonString);
                Debug.WriteLine(lista);
                if (lista == null)
                {
                    Debug.WriteLine("A deszerializáció null eredményt adott.");
                    return new List<Eszkoz>();
                }

                Debug.WriteLine($"Sikeresen betöltve: {lista.Count} eszköz.");
                return lista;
            }
            catch (Exception ex)
            {
                // Minden más hiba (hálózat, timeout, stb.)
                Debug.WriteLine($"Általános hiba az eszközök lekérésekor: {ex.Message}");
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
        private int kijeloltEszkozId;
        public async Task<bool> UpdateEszkozAsync(int eszkozId, string leiras, string cpu, string ram, string hdd, int uzemeltetoId, string JWT)
        {
            try
            {
                var updateData = new
                {
                    id = eszkozId,
                    leiras = leiras,
                    cpu = cpu,
                    ram = ram,
                    hdd = hdd,
                    uzemelteto_id = uzemeltetoId // Közvetlenül az ID-t küldjük
                };

                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);

                // A visszatérési értéket javítsuk bool-ra, hogy tudjuk, sikerült-e
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
                return Uzemelteto.FromJsonUzemelteto(jsonString);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                return new List<Uzemelteto>();
            }
        }
        public async Task<int> GetUzemeltetoIDByNameAsync(string nev)
        {
            try
            {
                var response = await _httpClient.GetAsync($"uzemelteto?nev={Uri.EscapeDataString(nev)}");
                if (!response.IsSuccessStatusCode) return 0;
                string jsonString = await response.Content.ReadAsStringAsync();
                return Uzemelteto.FromJsonUzemelteto(jsonString).FirstOrDefault().Id;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                return -1;
            }


        }
        //uzemeltetok hozzáadása
        public async Task<bool> AddUzemeltetoAsync(string nev, string leiras, string JWT)
        {
            try
            {
                var insertData = new
                {
                    nev = nev,
                    leiras = leiras
                };
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);
                var response = await _httpClient.PostAsJsonAsync("uzemelteto", insertData);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Belső hiba: {ex.Message}");
                return false;
            }
        }
        //uzemeltető update
        public async Task<bool> UpdateUzemeltetoAsync(int id, string nev, string leiras, string JWT)
        {
            try
            {
                var updateData = new
                {
                    id = id,
                    nev = nev,
                    leiras = leiras
                };
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);
                var response = await _httpClient.PutAsJsonAsync($"uzemelteto/{id}", updateData);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Frissítési hiba: {ex.Message}");
                return false;
            }
        }
        //üzemeltető törlése
        public async Task<bool> DeleteUzemeltetoAsync(int id, string JWT)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);
                var response = await _httpClient.DeleteAsync($"uzemelteto/{id}");
                Debug.WriteLine($"Törlési kísérlet ID: {id}, StatusCode: {response.StatusCode}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Törlési hiba: {ex.Message}");
                return false;
            }
        }
        //foglalások lekérése
        public async Task<List<Foglalas>> GetFoglalasokAsync(string JWT)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);
                var response = await _httpClient.GetAsync("foglalas");
                if (!response.IsSuccessStatusCode) return new List<Foglalas>();
                string jsonString = await response.Content.ReadAsStringAsync();
                return Foglalas.FromJson(jsonString);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                return new List<Foglalas>();
            }
        }
        //foglalas lekérése név alapján
        public async Task<int> GetFoglalasIdByName(string name, string JWT)
        {
            return 0;
        }

        //foglalás törlése
        public async Task<bool> DeleteFoglalasAsync(string JWT, int id)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", JWT);
                var response = await _httpClient.DeleteAsync($"foglalas/{id}");
                Debug.WriteLine($"Törlési kísérlet ID: {id}, StatusCode: {response.StatusCode}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Törlési hiba: {ex.Message}");
                return false;
            }
        }
    }

}
