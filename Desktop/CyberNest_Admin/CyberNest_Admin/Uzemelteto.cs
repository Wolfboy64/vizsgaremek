using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CyberNest_Admin
{
    class Uzemelteto
    {
        public int UzemeltetoId { get; set; }
        public string UzemeltetoNev { get; set; }
        public string UzemeltetoLeiras { get; set; }

        public Uzemelteto(int uzemeltetoId, string uzemeltetoNev, string uzemeltetoLeiras)
        {
            UzemeltetoId = uzemeltetoId;
            UzemeltetoNev = uzemeltetoNev;
            UzemeltetoLeiras = uzemeltetoLeiras;
        }
        public static List<Uzemelteto> uzemeltetokAll = new List<Uzemelteto>();
        public override string ToString()
        {
            return $"{UzemeltetoNev}";
        }
    }
}
