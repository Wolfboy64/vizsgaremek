using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using MySqlX.XDevAPI;
using Newtonsoft.Json;
using System.Windows.Media.Animation;
using System.Windows;

namespace Netcest_Desktop
{
    internal class ApiService
    {
        HttpClient client = new HttpClient();
        string baseUrl = "http://localhost:5050";
        
        public ApiService()
        {
            client.BaseAddress = new Uri(baseUrl);
        }

        public async Task<List<Felhasznalok>> GetUsers()
        {
            var response = await client.GetAsync("api/debug/users");

            var content = await response.Content.ReadAsStringAsync();

            MessageBox.Show($"Status: {response.StatusCode}\n\n{content}");

            if (response.IsSuccessStatusCode)
            {
                return JsonConvert.DeserializeObject<List<Felhasznalok>>(content);
            }
            else
            {
                throw new Exception($"Failed: {response.StatusCode}");
            }
        }
        public async Task<List<Felhasznalok>> PostFelhasznalo(string username, string password)
        {
            //check if username and password are correct
            var respose = await client.GetAsync($"/debug/login?username={username}&password={password}");
            List<Felhasznalok> ret = new List<Felhasznalok>();
            if (respose.IsSuccessStatusCode)
            {
                var users = new List<Felhasznalok>();
                var json = await respose.Content.ReadAsStringAsync();
                users = JsonConvert.DeserializeObject<List<Felhasznalok>>(json);
                ret = users;

            }
            else
            {
                //MessageBox.Show("Hibás felhasználónév vagy jelszó!", "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
                return ret;
            }
            return ret;
        }
        public async Task<Felhasznalok> LoginAsync(string nev, string elerhetoseg)
        {
            var loginData = new
            {
                nev = nev,
                elerhetoseg = elerhetoseg
            };

            HttpContent content = new StringContent(
                JsonConvert.SerializeObject(loginData),
                Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync("/auth/login", content);

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Felhasznalok>(json);
        }
    }
}