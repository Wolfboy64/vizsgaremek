using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

#pragma warning disable CS8618
#pragma warning disable CS8601
#pragma warning disable CS8603

namespace CyberNest_Admin
{
    public partial class Eszkoz
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("leiras")]
        public string Leiras { get; set; }

        [JsonPropertyName("cpu")]
        public string Cpu { get; set; }

        [JsonPropertyName("ram")]
        public string Ram { get; set; }

        [JsonPropertyName("hdd")]
        public string Hdd { get; set; }

        [JsonPropertyName("uzemelteto_id")]
        public long UzemeltetoId { get; set; }

        [JsonPropertyName("uzemelteto_nev")]
        public string UzemeltetoNev { get; set; }

        [JsonPropertyName("uzemelteto_leiras")]
        public string UzemeltetoLeiras { get; set; }


        public static List<Eszkoz> Eszkozok = new List<Eszkoz>();
    }

    public partial class Eszkoz
    {
        // Használjuk a már meglévő Converter.Settings-et a másik fájlból!
        public static List<Eszkoz> FromJson(string json) =>
            JsonSerializer.Deserialize<List<Eszkoz>>(json, CyberNest_Admin.Converter.Settings);
    }
}
#pragma warning disable CS8618
#pragma warning disable CS8601
#pragma warning disable CS8603