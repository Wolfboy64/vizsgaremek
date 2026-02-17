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
        string baseUrl = "https://localhost:5050/api";

        public ApiService()
        {
            client.BaseAddress = new Uri(baseUrl);
        }

        public async Task<List<Felhasznalok>> GetUsers()
        {
            var response = await client.GetAsync("/debug/users");

            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                var users = JsonConvert.DeserializeObject<List<Felhasznalok>>(json);
                return users;
            }
            else
            {
                throw new Exception("Failed to get users");
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
                MessageBox.Show("Hibás felhasználónév vagy jelszó!", "Hiba", MessageBoxButton.OK, MessageBoxImage.Error);
                return ret;
            }
            return ret;
        }
        public async Task<bool> LoginMethod(string username, string password)
        {
            bool ret = false;
            //check if username and password are correct
            var response = await client.GetAsync($"/debug/login?username={username}&password={password}");
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                ret = JsonConvert.DeserializeObject<bool>(json);
            }


            return ret;
        }
    }
}