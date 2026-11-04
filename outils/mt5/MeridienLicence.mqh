//+------------------------------------------------------------------+
//| MeridienLicence.mqh                                              |
//| Vérification de licence des robots Méridien pour MetaTrader 5.   |
//|                                                                  |
//| Ce que le robot envoie : clé de licence, numéro de compte (login),|
//| nom du serveur, version, nonce aléatoire. Jamais de mot de passe. |
//| Ce qu'il reçoit : autorisé ou non, avec une signature            |
//| HMAC-SHA256 qu'il recalcule pour s'assurer que la réponse vient  |
//| bien du serveur de Méridien et qu'elle répond à SA demande.      |
//|                                                                  |
//| La licence contrôle l'usage du logiciel ; elle ne donne aucun    |
//| accès au compte, aux ordres ni aux fonds.                        |
//|                                                                  |
//| ÉTAT : écrit d'après la documentation MQL5 (WebRequest,          |
//| CryptEncode), NON COMPILÉ NI TESTÉ dans MetaTrader 5 à ce jour.  |
//| À compiler et éprouver sur un compte de démonstration avant toute|
//| distribution (voir docs/outils-licences.md).                     |
//+------------------------------------------------------------------+
#property strict

// Adresse du point d'accès, valable une fois les fonctions déployées. À autoriser dans
// MetaTrader 5 : Outils > Options > Expert Advisors > « Autoriser WebRequest pour les URL listées ».
#ifndef MERIDIEN_URL
#define MERIDIEN_URL "https://europe-west1-meridien-academie.cloudfunctions.net/verifierLicence"
#endif

// Secret de signature : la même valeur que le secret LICENCE_SIGNATURE des fonctions. Il se définit
// au moment de compiler (fichier non versionné, voir la documentation) et n'est jamais publié.
#ifndef MERIDIEN_SECRET
#error "Définis MERIDIEN_SECRET avant d'inclure MeridienLicence.mqh (voir docs/outils-licences.md)."
#endif

// Tolérance si le serveur est momentanément injoignable, après une vérification réussie.
#ifndef MERIDIEN_GRACE_SECONDES
#define MERIDIEN_GRACE_SECONDES (72 * 3600)
#endif

enum MER_RESULTAT
  {
   MER_VALIDE,       // licence valide pour ce compte
   MER_REFUSE,       // licence refusée (inconnue, suspendue, expirée, compte non autorisé, réponse falsifiée)
   MER_INJOIGNABLE   // pas de réponse exploitable (réseau, adresse non autorisée)
  };

//--- Octets UTF-8 d'une chaîne, sans le zéro final.
void MerOctets(const string texte, uchar &octets[])
  {
   int n = StringToCharArray(texte, octets, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(octets, MathMax(0, n - 1));
  }

bool MerSha256(const uchar &donnees[], uchar &empreinte[])
  {
   uchar sansCle[];
   return CryptEncode(CRYPT_HASH_SHA256, donnees, sansCle, empreinte) == 32;
  }

//--- HMAC-SHA256 (RFC 2104), rendu en hexadécimal minuscule comme côté serveur.
string MerHmacSha256(const string secret, const string message)
  {
   uchar cle[], m[];
   MerOctets(secret, cle);
   MerOctets(message, m);
   if(ArraySize(cle) > 64)
     {
      uchar courte[];
      MerSha256(cle, courte);
      ArrayFree(cle);
      ArrayCopy(cle, courte);
     }
   uchar k0[64];
   ArrayInitialize(k0, 0);
   ArrayCopy(k0, cle, 0, 0, ArraySize(cle));

   uchar interne[], externe[], hInterne[], hFinal[];
   ArrayResize(interne, 64 + ArraySize(m));
   ArrayResize(externe, 64 + 32);
   for(int i = 0; i < 64; i++)
     {
      interne[i] = (uchar)(k0[i] ^ 0x36);
      externe[i] = (uchar)(k0[i] ^ 0x5c);
     }
   ArrayCopy(interne, m, 64);
   if(!MerSha256(interne, hInterne))
      return "";
   ArrayCopy(externe, hInterne, 64);
   if(!MerSha256(externe, hFinal))
      return "";
   string hex = "";
   for(int i = 0; i < ArraySize(hFinal); i++)
      hex += StringFormat("%02x", hFinal[i]);
   return hex;
  }

//--- Valeur d'un champ de la réponse JSON (chaîne, booléen ou null), sans bibliothèque externe.
string MerChamp(const string json, const string nom)
  {
   string motif = "\"" + nom + "\":";
   int p = StringFind(json, motif);
   if(p < 0)
      return "";
   p += StringLen(motif);
   if(StringGetCharacter(json, p) == '"')
     {
      int fin = StringFind(json, "\"", p + 1);
      return fin < 0 ? "" : StringSubstr(json, p + 1, fin - p - 1);
     }
   int f = p;
   while(f < StringLen(json) && StringGetCharacter(json, f) != ',' && StringGetCharacter(json, f) != '}')
      f++;
   return StringSubstr(json, p, f - p);
  }

//--- « 2026-11-02T10:00:00.000Z » -> datetime (UTC).
datetime MerDateIso(const string iso)
  {
   if(StringLen(iso) < 19)
      return 0;
   string t = StringSubstr(iso, 0, 19);
   StringReplace(t, "-", ".");
   StringReplace(t, "T", " ");
   return StringToTime(t);
  }

string MerNonce()
  {
   const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
   MathSrand((uint)(GetTickCount() ^ (uint)TimeLocal() ^ (uint)AccountInfoInteger(ACCOUNT_LOGIN)));
   string n = "";
   for(int i = 0; i < 24; i++)
      n += StringSubstr(alphabet, MathRand() % StringLen(alphabet), 1);
   return n;
  }

//--- Une vérification auprès du serveur.
MER_RESULTAT MerVerifier(const string cle, const string version, string &message)
  {
   string compte = IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   string serveur = AccountInfoString(ACCOUNT_SERVER);
   string nonce = MerNonce();
   string corps = "{\"cle\":\"" + cle + "\",\"compte\":\"" + compte + "\",\"serveur\":\"" + serveur + "\",\"version\":\"" + version + "\",\"nonce\":\"" + nonce + "\"}";

   uchar donnees[], reponse[];
   string entetes;
   MerOctets(corps, donnees);
   ResetLastError();
   int code = WebRequest("POST", MERIDIEN_URL, "Content-Type: application/json\r\n", 8000, donnees, reponse, entetes);
   if(code == -1)
     {
      message = GetLastError() == 4014
                ? "Adresse de licence non autorisée : ajoute " + MERIDIEN_URL + " dans Outils > Options > Expert Advisors."
                : "Serveur de licence injoignable (erreur " + IntegerToString(GetLastError()) + ").";
      return MER_INJOIGNABLE;
     }
   if(code != 200)
     {
      message = "Réponse inattendue du serveur de licence (" + IntegerToString(code) + ").";
      return MER_INJOIGNABLE;
     }

   string json = CharArrayToString(reponse, 0, WHOLE_ARRAY, CP_UTF8);
   string valide = MerChamp(json, "valide");
   string raison = MerChamp(json, "raison");
   string expire = MerChamp(json, "expireLe");
   string horodatage = MerChamp(json, "horodatage");
   if(expire == "null")
      expire = "";
   string chaine = (valide == "true" ? "1" : "0") + "|" + raison + "|" + MerChamp(json, "cle") + "|" + MerChamp(json, "compte") + "|" + MerChamp(json, "nonce") + "|" + horodatage + "|" + expire;

   // Authenticité : signature recalculée, nonce identique au nôtre, réponse du moment.
   if(MerHmacSha256(MERIDIEN_SECRET, chaine) != MerChamp(json, "signature") || MerChamp(json, "nonce") != nonce || MerChamp(json, "compte") != compte)
     {
      message = "Réponse de licence non authentique : robot arrêté par précaution.";
      return MER_REFUSE;
     }
   datetime t = MerDateIso(horodatage);
   if(t == 0 || MathAbs((double)(TimeGMT() - t)) > 24 * 3600)
     {
      message = "Horloge de l'ordinateur ou réponse décalée de plus de 24 h.";
      return MER_REFUSE;
     }
   message = MerChamp(json, "message");
   return valide == "true" ? MER_VALIDE : MER_REFUSE;
  }

//--- À appeler dans OnInit puis régulièrement (OnTimer) : vrai si le robot peut fonctionner.
bool MeridienLicenceAutorisee(const string cle, const string version, string &message)
  {
   string memo = "MER_LIC_" + IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   MER_RESULTAT r = MerVerifier(cle, version, message);
   if(r == MER_VALIDE)
     {
      GlobalVariableSet(memo, (double)TimeGMT());
      return true;
     }
   if(r == MER_INJOIGNABLE && GlobalVariableCheck(memo) && TimeGMT() - (datetime)GlobalVariableGet(memo) < MERIDIEN_GRACE_SECONDES)
     {
      message += " Fonctionnement maintenu (dernière vérification réussie il y a moins de 72 h).";
      return true;
     }
   if(r == MER_REFUSE)
      GlobalVariableDel(memo);
   return false;
  }
//+------------------------------------------------------------------+
