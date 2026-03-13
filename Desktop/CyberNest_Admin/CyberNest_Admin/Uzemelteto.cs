using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
#pragma warning disable CS8618
#pragma warning disable CS8601
#pragma warning disable CS8603

namespace CyberNest_Admin
{

    public class Uzemelteto
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("nev")]
        public string Nev { get; set; }

        [JsonPropertyName("leiras")]
        public string Leiras { get; set; }

        public static List<Uzemelteto> uzemeltetokAll = new List<Uzemelteto>();
        public override string ToString()
        {
            return $"{Nev}";
        }
        public static List<Uzemelteto> FromJson(string json) => JsonSerializer.Deserialize<List<Uzemelteto>>(json, CyberNest_Admin.Converter.Settings);
    }

}
#pragma warning disable CS8618
#pragma warning disable CS8601
#pragma warning disable CS8603

