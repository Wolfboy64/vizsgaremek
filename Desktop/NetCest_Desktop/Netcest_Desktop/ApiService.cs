using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http;
using MySqlX.XDevAPI;
using Newtonsoft.Json;
using System.Windows.Media.Animation;

namespace Netcest_Desktop
{
    internal class ApiService
    {
        HttpClient client = new HttpClient();
        string baseUrl = "https://localhost:5000/api";

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
        public async Task<List<Felhasznalok>> PostFelhasznalo()
        {
            var response = await client.PostAsync("/debug/users", null);
            if (response.IsSuccessStatusCode)
            {
                var json = await response.Content.ReadAsStringAsync();
                var users = JsonConvert.DeserializeObject<List<Felhasznalok>>(json);
                return users;
            }
            else
            {
                throw new Exception("Failed to post user");
            }
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