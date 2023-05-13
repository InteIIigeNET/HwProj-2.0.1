using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace HwProj.Utils.Auth
{
    public static class AuthorizationKey
    {
        private const string _key = "U8_.wpvk93fPWG<f2$Op[vwegmQGF25_fNG2V0ijnm2e0igv24g";
        public static SecurityKey SecurityKey => new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_key));
    }
}
