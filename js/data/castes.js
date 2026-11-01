/* ============================================================ GUJARATI CASTES DIRECTORY ============================================================ */
const ALL_CASTES = [

    // Patidar / Patel
    { name: "Patidar / Patel", guj: "પાટીદાર / પટેલ", group: "Patidar / Patel", keywords: "patidar patel kanbi કડવા લેવા પાટીદાર પટેલ પાટીદાર કણબી" },
    { name: "Kadva Patidar", guj: "કડવા પાટીદાર", group: "Patidar / Patel", keywords: "kadva patel kadwa patidar kadvapatel kanbi કડવા પટેલ પાટીદાર કડવા કણબી" },
    { name: "Leva Patidar", guj: "લેવા પાટીદાર", group: "Patidar / Patel", keywords: "leva patel leuva patidar leuvad lewapatel kanbi લેવા પટેલ લેઉવા પાટીદાર લેવા કણબી" },
    { name: "Anjana (Chaudhary) Patidar", guj: "આંજણા ચૌધરી પાટીદાર", group: "Patidar / Patel", keywords: "anjana chaudhary chaudhari patel anjana patel choudhary આંજણા ચૌધરી પટેલ પાટીદાર" },
    { name: "Matiya Patidar", guj: "મતિયા પાટીદાર", group: "Patidar / Patel", keywords: "matiya patel matia patidar kanbi મતિયા પટેલ પાટીદાર" },

    // Brahmin
    { name: "Brahmin", guj: "બ્રાહ્મણ", group: "Brahmin", keywords: "brahmin bhusur pandit shastri vyas trivedi dave joshi બ્રાહ્મણ પંડિત" },
    { name: "Audichya Sahastra Brahmin", guj: "ઔદીચ્ય સહસ્ર બ્રાહ્મણ", group: "Brahmin", keywords: "audichya sahastra sahasra brahmin audichya ઔદીચ્ય સહસ્ર બ્રાહ્મણ સહસ્ત્ર" },
    { name: "Audichya Zalawadi Brahmin", guj: "ઔદીચ્ય ઝાલાવાડી બ્રાહ્મણ", group: "Brahmin", keywords: "audichya zalawadi jhalawadi brahmin ઔદીચ્ય ઝાલાવાડી બ્રાહ્મણ" },
    { name: "Audichya Tolkiya Brahmin", guj: "ઔદીચ્ય ટોળકીયા બ્રાહ્મણ", group: "Brahmin", keywords: "audichya tolkiya tolkia brahmin ઔદીચ્ય ટોળકીયા બ્રાહ્મણ" },
    { name: "Nagar Brahmin", guj: "નાગર બ્રાહ્મણ", group: "Brahmin", keywords: "nagar brahmin vadnagara visnagara prashnora નાગર બ્રાહ્મણ" },
    { name: "Vadnagara Nagar Brahmin", guj: "વડનગરા નાગર બ્રાહ્મણ", group: "Brahmin", keywords: "vadnagara vadnagari nagar brahmin વડનગરા નાગર બ્રાહ્મણ" },
    { name: "Visnagara Nagar Brahmin", guj: "વિસનગરા નાગર બ્રાહ્મણ", group: "Brahmin", keywords: "visnagara visnagari nagar brahmin વિસનગરા નાગર બ્રાહ્મણ" },
    { name: "Prashnora Nagar Brahmin", guj: "પ્રશ્નોરા નાગર બ્રાહ્મણ", group: "Brahmin", keywords: "prashnora nagar brahmin પ્રશ્નોરા નાગર બ્રાહ્મણ" },
    { name: "Modh Brahmin", guj: "મોઢ બ્રાહ્મણ", group: "Brahmin", keywords: "modh brahmin modhbrahmin મોઢ બ્રાહ્મણ" },
    { name: "Shrimali Brahmin", guj: "શ્રીમાળી બ્રાહ્મણ", group: "Brahmin", keywords: "shrimali srimali brahmin શ્રીમાળી બ્રાહ્મણ" },
    { name: "Khedaval Brahmin", guj: "ખેડાવાલ બ્રાહ્મણ", group: "Brahmin", keywords: "khedaval khedawal brahmin ખેડાવાલ બ્રાહ્મણ" },
    { name: "Rajgor Brahmin", guj: "રાજગોર બ્રાહ્મણ", group: "Brahmin", keywords: "rajgor rajgar brahmin gor રાજગોર બ્રાહ્મણ રાજગુરુ" },
    { name: "Bardai Brahmin", guj: "બારડાઈ બ્રાહ્મણ", group: "Brahmin", keywords: "bardai brahmin બારડાઈ બ્રાહ્મણ" },
    { name: "Sompura Brahmin", guj: "સોમપુરા બ્રાહ્મણ", group: "Brahmin", keywords: "sompura brahmin sompura salat સોમપુરા બ્રાહ્મણ" },
    { name: "Trivedi Mewada Brahmin", guj: "ત્રિવેદી મેવાડા બ્રાહ્મણ", group: "Brahmin", keywords: "trivedi mewada mevada brahmin ત્રિવેદી મેવાડા બ્રાહ્મણ" },
    { name: "Bhatt Mewada Brahmin", guj: "ભટ્ટ મેવાડા બ્રાહ્મણ", group: "Brahmin", keywords: "bhatt mewada mevada brahmin ભટ્ટ મેવાડા બ્રાહ્મણ" },
    { name: "Tapodhan Brahmin", guj: "તપોધન બ્રાહ્મણ", group: "Brahmin", keywords: "tapodhan tapodhan brahmin તપોધન બ્રાહ્મણ" },
    { name: "Saraswat Brahmin", guj: "સારસ્વત બ્રાહ્મણ", group: "Brahmin", keywords: "saraswat saraswata brahmin સારસ્વત બ્રાહ્મણ" },
    { name: "Pushkarna Brahmin", guj: "પુષ્કર્ણા બ્રાહ્મણ", group: "Brahmin", keywords: "pushkarna pokharna brahmin પુષ્કર્ણા બ્રાહ્મણ" },
    { name: "Gurjar Brahmin", guj: "ગુર્જર બ્રાહ્મણ", group: "Brahmin", keywords: "gurjar gujjar brahmin ગુર્જર બ્રાહ્મણ" },
    { name: "Sorthiya Brahmin", guj: "સોરઠીયા બ્રાહ્મણ", group: "Brahmin", keywords: "sorthiya sorathiya brahmin સોરઠીયા બ્રાહ્મણ" },
    { name: "Kandolia Brahmin", guj: "કંદોળીયા બ્રાહ્મણ", group: "Brahmin", keywords: "kandolia kandoliya brahmin કંદોળીયા બ્રાહ્મણ" },
    { name: "Jambu Brahmin", guj: "જંબુ બ્રાહ્મણ", group: "Brahmin", keywords: "jambu brahmin જંબુ બ્રાહ્મણ" },
    { name: "Sachora Brahmin", guj: "સાચોરા બ્રાહ્મણ", group: "Brahmin", keywords: "sachora sanchora brahmin સાચોરા બ્રાહ્મણ" },
    { name: "Gomtiwal Brahmin", guj: "ગોમતીવાલ બ્રાહ્મણ", group: "Brahmin", keywords: "gomtiwal gomtival brahmin ગોમતીવાલ બ્રાહ્મણ" },
    { name: "Paliwal Brahmin", guj: "પાલીવાલ બ્રાહ્મણ", group: "Brahmin", keywords: "paliwal paliwal brahmin પાલીવાલ બ્રાહ્મણ" },
    { name: "Parashar Brahmin", guj: "પારાશર બ્રાહ્મણ", group: "Brahmin", keywords: "parashar parashari brahmin પારાશર બ્રાહ્મણ" },
    { name: "Sanadhya Brahmin", guj: "સનાઢ્ય બ્રાહ્મણ", group: "Brahmin", keywords: "sanadhya sanadhya brahmin સનાઢ્ય બ્રાહ્મણ" },
    { name: "Dayama Brahmin", guj: "દાયમા બ્રાહ્મણ", group: "Brahmin", keywords: "dayama dahiya brahmin દાયમા બ્રાહ્મણ" },
    { name: "Disawal Brahmin", guj: "દિશાવળ બ્રાહ્મણ", group: "Brahmin", keywords: "disawal deesawal brahmin દિશાવળ બ્રાહ્મણ" },
    { name: "Shrigod Brahmin", guj: "શ્રીગોડ બ્રાહ્મણ", group: "Brahmin", keywords: "shrigod srigod gauda brahmin શ્રીગોડ બ્રાહ્મણ" },

    // Kshatriya / Rajput
    { name: "Kshatriya Rajput / Darbar", guj: "ક્ષત્રિય રાજપૂત / દરબાર", group: "Kshatriya / Rajput", keywords: "kshatriya rajput darbar bapu thakor ક્ષત્રિય રાજપૂત દરબાર બાપુ" },
    { name: "Karadia Rajput", guj: "કારડીયા રાજપૂત", group: "Kshatriya / Rajput", keywords: "karadia karadiya rajput kshatriya કારડીયા રાજપૂત ક્ષત્રિય" },
    { name: "Nadoda Rajput", guj: "નાદોડા રાજપૂત", group: "Kshatriya / Rajput", keywords: "nadoda nadoda rajput નાદોડા રાજપૂત" },
    { name: "Garasiya Rajput", guj: "ગરાસિયા રાજપૂત", group: "Kshatriya / Rajput", keywords: "garasiya girasiya rajput kshatriya ગરાસિયા રાજપૂત" },
    { name: "Gurjar Kshatriya", guj: "ગુર્જર ક્ષત્રિય", group: "Kshatriya / Rajput", keywords: "gurjar gujjar kshatriya ગુર્જર ક્ષત્રિય" },
    { name: "Kshatriya Rajput", guj: "ક્ષત્રિય રાજપૂત", group: "Kshatriya / Rajput", keywords: "rajput rathod vaghela chauhan parmar gohil jadeja jhala solanki ક્ષત્રિય રાજપૂત" },
    { name: "Kshatriya Thakor", guj: "ક્ષત્રિય ઠાકોર", group: "Kshatriya / Rajput", keywords: "thakor thakore kshatriya thakor ઠાકોર ક્ષત્રિય" },
    { name: "Kasbati Rajput", guj: "કસબાતી રાજપૂત", group: "Kshatriya / Rajput", keywords: "kasbati kasbati rajput કસબાતી રાજપૂત" },
    { name: "Maru Rajput", guj: "મારુ રાજપૂત", group: "Kshatriya / Rajput", keywords: "maru maroo rajput મારુ રાજપૂત" },
    { name: "Jadeja Rajput", guj: "જાડેજા રાજપૂત", group: "Kshatriya / Rajput", keywords: "jadeja rajput darbar જાડેજા રાજપૂત દરબાર" },
    { name: "Vaghela Rajput", guj: "વાઘેલા રાજપૂત", group: "Kshatriya / Rajput", keywords: "vaghela rajput darbar વાઘેલા રાજપૂત દરબાર" },
    { name: "Solanki Rajput", guj: "સોલંકી રાજપૂત", group: "Kshatriya / Rajput", keywords: "solanki rajput darbar સોલંકી રાજપૂત દરબાર" },
    { name: "Chauhan Rajput", guj: "ચૌહાણ રાજપૂત", group: "Kshatriya / Rajput", keywords: "chauhan rajput darbar ચૌહાણ રાજપૂત દરબાર" },
    { name: "Parmar Rajput", guj: "પરમાર રાજપૂત", group: "Kshatriya / Rajput", keywords: "parmar rajput darbar પરમાર રાજપૂત દરબાર" },
    { name: "Rathod Rajput", guj: "રાઠોડ રાજપૂત", group: "Kshatriya / Rajput", keywords: "rathod rajput darbar રાઠોડ રાજપૂત દરબાર" },
    { name: "Jhala Rajput", guj: "ઝાલા રાજપૂત", group: "Kshatriya / Rajput", keywords: "jhala rajput darbar ઝાલા રાજપૂત દરબાર" },
    { name: "Gohil Rajput", guj: "ગોહિલ રાજપૂત", group: "Kshatriya / Rajput", keywords: "gohil rajput darbar ગોહિલ રાજપૂત દરબાર" },

    // Vanik / Vaishnav
    { name: "Vaniya / Baniya", guj: "વાણિયા / બનિયા", group: "Vanik / Vaishnav", keywords: "vaniya vania baniya vanik mahajan shah sheth વાણિયા વણિક શેઠ મહાજન" },
    { name: "Vaishnav Vaniya", guj: "વૈષ્ણવ વાણિયા", group: "Vanik / Vaishnav", keywords: "vaishnav vaniya vanik baniya pustimarg વૈષ્ણવ વાણિયા વણિક" },
    { name: "Modh Vanik", guj: "મોઢ વણિક", group: "Vanik / Vaishnav", keywords: "modh vanik vaniya baniya gandhi shah sheth મોઢ વણિક વાણિયા" },
    { name: "Dasha Shrimali Vanik", guj: "દશા શ્રીમાળી વણિક", group: "Vanik / Vaishnav", keywords: "dasha shrimali vanik baniya vaniya દશા શ્રીમાળી વણિક વાણિયા" },
    { name: "Visa Shrimali Vanik", guj: "વિસા શ્રીમાળી વણિક", group: "Vanik / Vaishnav", keywords: "visa shrimali vanik baniya vaniya વિસા શ્રીમાળી વણિક વાણિયા" },
    { name: "Porwad Vanik", guj: "પોરવાડ વણિક", group: "Vanik / Vaishnav", keywords: "porwad porwal vanik vaniya પોરવાડ વણિક વાણિયા" },
    { name: "Dasha Porwad", guj: "દશા પોરવાડ", group: "Vanik / Vaishnav", keywords: "dasha porwad porwal vanik દશા પોરવાડ" },
    { name: "Visa Porwad", guj: "વિસા પોરવાડ", group: "Vanik / Vaishnav", keywords: "visa porwad porwal vanik વિસા પોરવાડ" },
    { name: "Khadayata Vanik", guj: "ખડાયતા વણિક", group: "Vanik / Vaishnav", keywords: "khadayata khadayta vanik vaniya baniya કોટક ખડાયતા વણિક" },
    { name: "Kapol Vanik", guj: "કપોળ વણિક", group: "Vanik / Vaishnav", keywords: "kapol vanik kapol baniya vaniya કપોળ વણિક વાણિયા" },
    { name: "Harsola Vanik", guj: "હરસોલા વણિક", group: "Vanik / Vaishnav", keywords: "harsola vanik vaniya હરસોલા વણિક" },
    { name: "Lad Vanik", guj: "લાડ વણિક", group: "Vanik / Vaishnav", keywords: "lad vanik laad vanik vaniya લાડ વણિક" },
    { name: "Jharola Vanik", guj: "ઝરોળા વણિક", group: "Vanik / Vaishnav", keywords: "jharola zarola vanik vaniya ઝરોળા વણિક" },
    { name: "Mewada Vanik", guj: "મેવાડા વણિક", group: "Vanik / Vaishnav", keywords: "mewada mevada vanik vaniya મેવાડા વણિક" },
    { name: "Nema Vanik", guj: "નેમા વણિક", group: "Vanik / Vaishnav", keywords: "nema vanik vaniya નેમા વણિક" },
    { name: "Deshaval Vanik", guj: "દેશાવાળ વણિક", group: "Vanik / Vaishnav", keywords: "deshaval deshavad vanik vaniya દેશાવાળ વણિક" },
    { name: "Disawal Vanik", guj: "દિશાવળ વણિક", group: "Vanik / Vaishnav", keywords: "disawal deesawal vanik vaniya દિશાવળ વણિક" },
    { name: "Sorathiya Vanik", guj: "સોરઠીયા વણિક", group: "Vanik / Vaishnav", keywords: "sorathiya sorthiya vanik vaniya સોરઠીયા વણિક" },
    { name: "Ghoghari Vanik", guj: "ઘોઘારી વણિક", group: "Vanik / Vaishnav", keywords: "ghoghari goghari vanik vaniya ઘોઘારી વણિક" },
    { name: "Halai Vanik", guj: "હાલાઈ વણિક", group: "Vanik / Vaishnav", keywords: "halai vanik vaniya હાલાઈ વણિક" },
    { name: "Navnat Vanik", guj: "નવનાત વણિક", group: "Vanik / Vaishnav", keywords: "navnat vanik vaniya નવનાત વણિક" },
    { name: "Vaishnav Vanik", guj: "વૈષ્ણવ વણિક", group: "Vanik / Vaishnav", keywords: "vaishnav vanik vaishnav baniya વૈષ્ણવ વણિક" },

    // Jain
    { name: "Jain", guj: "જૈન", group: "Jain", keywords: "jain shravak deravasi sthanakvasi shwetambar digambar જૈન શ્રાવક દેરાવાસી સ્થાનકવાસી શ્વેતાંબર દિગંબર" },
    { name: "Jain Vaniya", guj: "જૈન વાણિયા", group: "Jain", keywords: "jain vaniya jain vanik jain baniya જૈન વાણિયા જૈન વણિક" },
    { name: "Jain Deravasi (Murti Pujak)", guj: "જૈન દેરાવાસી (મૂર્તિપૂજક)", group: "Jain", keywords: "jain deravasi derawasi murti pujak murtipujak જૈન દેરાવાસી મૂર્તિપૂજક" },
    { name: "Jain Sthanakvasi", guj: "જૈન સ્થાનકવાસી", group: "Jain", keywords: "jain sthanakvasi sthanakwasi જૈન સ્થાનકવાસી" },
    { name: "Jain Shwetambar", guj: "જૈન શ્વેતાંબર", group: "Jain", keywords: "jain shwetambar svetambar shwetambara જૈન શ્વેતાંબર" },
    { name: "Jain Digambar", guj: "જૈન દિગંબર", group: "Jain", keywords: "jain digambar digambara જૈન દિગંબર" },
    { name: "Jain Terapanthi", guj: "જૈન તેરાપંથી", group: "Jain", keywords: "jain terapanthi terapanth જૈન તેરાપંથી" },
    { name: "Visa Oshwal Jain", guj: "વિસા ઓશવાળ જૈન", group: "Jain", keywords: "visa oshwal oswal jain halari kutchi વિસા ઓશવાળ જૈન ઓસવાલ" },
    { name: "Dasha Oshwal Jain", guj: "દશા ઓશવાળ જૈન", group: "Jain", keywords: "dasha oshwal oswal jain દશા ઓશવાળ જૈન ઓસવાલ" },
    { name: "Kutchi Oshwal Jain", guj: "કચ્છી ઓશવાળ જૈન", group: "Jain", keywords: "kutchi kutchhi oshwal oswal jain કચ્છી ઓશવાળ જૈન" },
    { name: "Halai Oshwal Jain", guj: "હાલાઈ ઓશવાળ જૈન", group: "Jain", keywords: "halai oshwal oswal jain હાલાઈ ઓશવાળ જૈન" },
    { name: "Shrimali Jain", guj: "શ્રીમાળી જૈન", group: "Jain", keywords: "shrimali srimali jain vanik શ્રીમાળી જૈન" },
    { name: "Porwad Jain", guj: "પોરવાડ જૈન", group: "Jain", keywords: "porwad porwal jain vanik પોરવાડ જૈન" },
    { name: "Modh Jain", guj: "મોઢ જૈન", group: "Jain", keywords: "modh jain vanik મોઢ જૈન" },
    { name: "Navnat Jain", guj: "નવનાત જૈન", group: "Jain", keywords: "navnat jain vanik નવનાત જૈન" },
    { name: "Bhavsar Jain", guj: "ભાવસાર જૈન", group: "Jain", keywords: "bhavsar jain ભાવસાર જૈન" },

    // Lohana
    { name: "Lohana", guj: "લોહાણા", group: "Lohana", keywords: "lohana luwana thakkar raghuvanshi લોહાણા ઠક્કર રઘુવંશી" },
    { name: "Raghuvanshi", guj: "રઘુવંશી", group: "Lohana", keywords: "raghuvanshi lohana thakkar રઘુવંશી લોહાણા" },
    { name: "Halai Lohana", guj: "હાલાઈ લોહાણા", group: "Lohana", keywords: "halai lohana thakkar luwana હાલાઈ લોહાણા ઠક્કર" },
    { name: "Ghoghari Lohana", guj: "ઘોઘારી લોહાણા", group: "Lohana", keywords: "ghoghari goghari lohana thakkar ઘોઘારી લોહાણા" },
    { name: "Kutchi Lohana", guj: "કચ્છી લોહાણા", group: "Lohana", keywords: "kutchi kutchhi lohana thakkar કચ્છી લોહાણા" },
    { name: "Vaishnav Lohana", guj: "વૈષ્ણવ લોહાણા", group: "Lohana", keywords: "vaishnav lohana thakkar વૈષ્ણવ લોહાણા" },

    // Bhatia
    { name: "Bhatia", guj: "ભાટિયા", group: "Bhatia", keywords: "bhatia bhatiya kutchi halai ભાટિયા કચ્છી હાલાઈ ભાટિયા" },
    { name: "Halai Bhatia", guj: "હાલાઈ ભાટિયા", group: "Bhatia", keywords: "halai bhatia bhatiya હાલાઈ ભાટિયા" },
    { name: "Kutchi Bhatia", guj: "કચ્છી ભાટિયા", group: "Bhatia", keywords: "kutchi kutchhi bhatia bhatiya કચ્છી ભાટિયા" },

    // Vishwakarma / Suthar
    { name: "Vishwakarma", guj: "વિશ્વકર્મા", group: "Vishwakarma / Suthar", keywords: "vishwakarma suthar luhar panchal sharma વિશ્વકર્મા સુથાર લુહાર પંચાલ" },
    { name: "Luhar Suthar", guj: "લુહાર સુથાર", group: "Vishwakarma / Suthar", keywords: "luhar suthar lohar suthar vishwakarma લુહાર સુથાર વિશ્વકર્મા" },
    { name: "Gujjar Suthar", guj: "ગુર્જર સુથાર", group: "Vishwakarma / Suthar", keywords: "gujjar suthar gurjar suthar vishwakarma ગુર્જર સુથાર" },
    { name: "Mistry Suthar", guj: "મિસ્ત્રી સુથાર", group: "Vishwakarma / Suthar", keywords: "mistry suthar mistri suthar મિસ્ત્રી સુથાર" },
    { name: "Mewada Suthar", guj: "મેવાડા સુથાર", group: "Vishwakarma / Suthar", keywords: "mewada mevada suthar મેવાડા સુથાર" },
    { name: "Vansh Suthar", guj: "વંશ સુથાર", group: "Vishwakarma / Suthar", keywords: "vansh suthar vanshsuthar વંશ સુથાર" },
    { name: "Pithva Suthar", guj: "પીઠવા સુથાર", group: "Vishwakarma / Suthar", keywords: "pithva pithwa suthar પીઠવા સુથાર" },
    { name: "Kadiwal Suthar", guj: "કડીવાલ સુથાર", group: "Vishwakarma / Suthar", keywords: "kadiwal suthar કડીવાલ સુથાર" },
    { name: "Bhavnagari Suthar", guj: "ભાવનગરી સુથાર", group: "Vishwakarma / Suthar", keywords: "bhavnagari suthar ભાવનગરી સુથાર" },
    { name: "Panchal", guj: "પંચાલ", group: "Vishwakarma / Suthar", keywords: "panchal panchal suthar luhar પંચાલ" },
    { name: "Luhar", guj: "લુહાર", group: "Vishwakarma / Suthar", keywords: "luhar lohar black smith લુહાર" },
    { name: "Gujjar Luhar", guj: "ગુર્જર લુહાર", group: "Vishwakarma / Suthar", keywords: "gujjar luhar gurjar luhar ગુર્જર લુહાર" },
    { name: "Bhavnagari Luhar", guj: "ભાવનગરી લુહાર", group: "Vishwakarma / Suthar", keywords: "bhavnagari luhar ભાવનગરી લુહાર" },
    { name: "Sihori Luhar", guj: "શિહોરી લુહાર", group: "Vishwakarma / Suthar", keywords: "sihori luhar શિહોરી લુહાર" },
    { name: "Kadiwal Luhar", guj: "કડીવાલ લુહાર", group: "Vishwakarma / Suthar", keywords: "kadiwal luhar કડીવાલ લુહાર" },
    { name: "Kansara", guj: "કંસારા", group: "Vishwakarma / Suthar", keywords: "kansara coppersmith કંસારા તાંબા પીતળ" },

    // Prajapati / Kumbhar
    { name: "Prajapati", guj: "પ્રજાપતિ", group: "Prajapati / Kumbhar", keywords: "prajapati kumbhar potter ગુર્જર વરિયા સોરઠીયા પ્રજાપતિ કુંભાર" },
    { name: "Gujjar Prajapati", guj: "ગુર્જર પ્રજાપતિ", group: "Prajapati / Kumbhar", keywords: "gujjar prajapati gurjar prajapati ગુર્જર પ્રજાપતિ" },
    { name: "Varia Prajapati", guj: "વરિયા પ્રજાપતિ", group: "Prajapati / Kumbhar", keywords: "varia wariya prajapati વરિયા પ્રજાપતિ" },
    { name: "Sorathiya Prajapati", guj: "સોરઠીયા પ્રજાપતિ", group: "Prajapati / Kumbhar", keywords: "sorathiya sorthiya prajapati સોરઠીયા પ્રજાપતિ" },
    { name: "Lad Prajapati", guj: "લાડ પ્રજાપતિ", group: "Prajapati / Kumbhar", keywords: "lad prajapati laad prajapati લાડ પ્રજાપતિ" },
    { name: "Ajwaliya Prajapati", guj: "અજવાળિયા પ્રજાપતિ", group: "Prajapati / Kumbhar", keywords: "ajwaliya ajvaliya prajapati અજવાળિયા પ્રજાપતિ" },
    { name: "Maru Prajapati", guj: "મારુ પ્રજાપતિ", group: "Prajapati / Kumbhar", keywords: "maru prajapati મારુ પ્રજાપતિ" },
    { name: "Kumbhar", guj: "કુંભાર", group: "Prajapati / Kumbhar", keywords: "kumbhar prajapati કુંભાર" },

    // Ahir / Maldhari
    { name: "Ahir", guj: "આહીર", group: "Ahir / Maldhari", keywords: "ahir aahir yadav maldhari આહીર યાદવ માલધારી" },
    { name: "Machhoya Ahir", guj: "મચ્છોયા આહીર", group: "Ahir / Maldhari", keywords: "machhoya ahir aahir મચ્છોયા આહીર" },
    { name: "Sorathiya Ahir", guj: "સોરઠીયા આહીર", group: "Ahir / Maldhari", keywords: "sorathiya sorthiya ahir aahir સોરઠીયા આહીર" },
    { name: "Boricha Ahir", guj: "બોરીચા આહીર", group: "Ahir / Maldhari", keywords: "boricha ahir aahir બોરીચા આહીર" },
    { name: "Pancholi Ahir", guj: "પાંચોળી આહીર", group: "Ahir / Maldhari", keywords: "pancholi ahir aahir પાંચોળી આહીર" },
    { name: "Paratharia Ahir", guj: "પરાથરિયા આહીર", group: "Ahir / Maldhari", keywords: "paratharia parathariya ahir aahir પરાથરિયા આહીર" },
    { name: "Rabari", guj: "રબારી", group: "Ahir / Maldhari", keywords: "rabari rayka desai maldhari રબારી રાયકા દેસાઈ માલધારી" },
    { name: "Vadhiyar Rabari", guj: "વઢિયાર રબારી", group: "Ahir / Maldhari", keywords: "vadhiyar vadhiyari rabari વઢિયાર રબારી" },
    { name: "Patanwadia Rabari", guj: "પાટણવાડિયા રબારી", group: "Ahir / Maldhari", keywords: "patanwadia patanwadiya rabari પાટણવાડિયા રબારી" },
    { name: "Kutchi Rabari", guj: "કચ્છી રબારી", group: "Ahir / Maldhari", keywords: "kutchi kutchhi rabari કચ્છી રબારી" },
    { name: "Sorathiya Rabari", guj: "સોરઠીયા રબારી", group: "Ahir / Maldhari", keywords: "sorathiya sorthiya rabari સોરઠીયા રબારી" },
    { name: "Bharwad", guj: "ભરવાડ", group: "Ahir / Maldhari", keywords: "bharwad bharvad mota nana maldhari ભરવાડ માલધારી" },
    { name: "Mota Bharwad", guj: "મોટા ભરવાડ", group: "Ahir / Maldhari", keywords: "mota bharwad motabhai મોટા ભરવાડ" },
    { name: "Nana Bharwad", guj: "નાના ભરવાડ", group: "Ahir / Maldhari", keywords: "nana bharwad nanabhai નાના ભરવાડ" },

    // Koli
    { name: "Koli", guj: "કોળી", group: "Koli", keywords: "koli koli samaj thakor તળપદા ચુંવાળિયા ઘેડિયા કોળી" },
    { name: "Talpada Koli", guj: "તળપદા કોળી", group: "Koli", keywords: "talpada koli thakor તળપદા કોળી" },
    { name: "Chunvalia Koli", guj: "ચુંવાળિયા કોળી", group: "Koli", keywords: "chunvalia chunvaliya koli thakor ચુંવાળિયા કોળી" },
    { name: "Ghedia Koli", guj: "ઘેડિયા કોળી", group: "Koli", keywords: "ghedia ghediya koli ઘેડિયા કોળી" },
    { name: "Thakor Koli", guj: "ઠાકોર કોળી", group: "Koli", keywords: "thakor koli thakore ઠાકોર કોળી" },
    { name: "Baria Koli", guj: "બારિયા કોળી", group: "Koli", keywords: "baria bariya koli બારિયા કોળી" },
    { name: "Dharala Koli", guj: "ધરાળા કોળી", group: "Koli", keywords: "dharala koli ધરાળા કોળી" },
    { name: "Koli Patel", guj: "કોળી પટેલ", group: "Koli", keywords: "koli patel kolipatel કોળી પટેલ" },
    { name: "Matia Koli", guj: "મતિયા કોળી", group: "Koli", keywords: "matia koli matiya koli મતિયા કોળી" },
    { name: "Paghi", guj: "પગી", group: "Koli", keywords: "paghi chunvalia paghi પગી ચુંવાળિયા પગી" },
    { name: "Patanwadia Koli", guj: "પાટણવાડિયા કોળી", group: "Koli", keywords: "patanwadia koli પાટણવાડિયા કોળી" },

    // Mochi
    { name: "Mochi", guj: "મોચી", group: "Mochi", keywords: "mochi footwear artisan gujjar maru dhalgar મોચી ગુર્જર મારુ મોચી" },
    { name: "Gujjar Mochi", guj: "ગુર્જર મોચી", group: "Mochi", keywords: "gujjar mochi gurjar mochi ગુર્જર મોચી" },
    { name: "Maru Mochi", guj: "મારુ મોચી", group: "Mochi", keywords: "maru mochi મારુ મોચી" },
    { name: "Dhalgar Mochi", guj: "ઢાલગર મોચી", group: "Mochi", keywords: "dhalgar mochi ઢાલગર મોચી" },
    { name: "Chauhan Mochi", guj: "ચૌહાણ મોચી", group: "Mochi", keywords: "chauhan mochi ચૌહાણ મોચી" },

    // Artisan & Trade
    { name: "Soni", guj: "સોની", group: "Artisan & Trade", keywords: "soni swarnakar goldsmith સોની સ્વર્ણકાર શ્રીમાળી ગુર્જર મારુ" },
    { name: "Shrimali Soni", guj: "શ્રીમાળી સોની", group: "Artisan & Trade", keywords: "shrimali srimali soni શ્રીમાળી સોની" },
    { name: "Gujjar Soni", guj: "ગુર્જર સોની", group: "Artisan & Trade", keywords: "gujjar soni gurjar soni ગુર્જર સોની" },
    { name: "Maru Soni", guj: "મારુ સોની", group: "Artisan & Trade", keywords: "maru soni મારુ સોની" },
    { name: "Darji", guj: "દરજી", group: "Artisan & Trade", keywords: "darji tailor દરજી રામદેવ ચારણીયા ગુર્જર દરજી" },
    { name: "Ramdev Darji", guj: "રામદેવ દરજી", group: "Artisan & Trade", keywords: "ramdev darji રામદેવ દરજી" },
    { name: "Charaniya Darji", guj: "ચારણીયા દરજી", group: "Artisan & Trade", keywords: "charaniya darji ચારણીયા દરજી" },
    { name: "Gujjar Darji", guj: "ગુર્જર દરજી", group: "Artisan & Trade", keywords: "gujjar darji gurjar darji ગુર્જર દરજી" },
    { name: "Bhavsar", guj: "ભાવસાર", group: "Artisan & Trade", keywords: "bhavsar bhavasar textile print ભાવસાર" },
    { name: "Khatri", guj: "ખત્રી", group: "Artisan & Trade", keywords: "khatri kshatriya weaver silk tie dye ખત્રી" },
    { name: "Brahma Kshatriya", guj: "બ્રહ્મક્ષત્રિય", group: "Artisan & Trade", keywords: "brahma kshatriya brahmakshatriya બ્રહ્મક્ષત્રિય" },
    { name: "Ghanchi", guj: "ઘાંચી", group: "Artisan & Trade", keywords: "ghanchi modh ghanchi surti ghanchi teli તેલી ઘાંચી" },
    { name: "Modh Ghanchi", guj: "મોઢ ઘાંચી", group: "Artisan & Trade", keywords: "modh ghanchi મોઢ ઘાંચી" },
    { name: "Surti Ghanchi", guj: "સુરતી ઘાંચી", group: "Artisan & Trade", keywords: "surti ghanchi સુરતી ઘાંચી" },
    { name: "Teli / Sahu", guj: "તેલી / સાહુ", group: "Artisan & Trade", keywords: "teli sahu rathore telee તેલી સાહુ" },
    { name: "Salvi", guj: "સાળવી", group: "Artisan & Trade", keywords: "salvi patola weaver patan સાળવી પટોળા" },
    { name: "Chhipa", guj: "છીપા", group: "Artisan & Trade", keywords: "chhipa printer textile block print છીપા" },
    { name: "Rangrez", guj: "રંગરેઝ", group: "Artisan & Trade", keywords: "rangrez ranger dyer રંગરેઝ રંગારા" },
    { name: "Tamboli", guj: "તંબોળી", group: "Artisan & Trade", keywords: "tamboli panwala betel તંબોળી પાનવાળા" },
    { name: "Mali / Phoolmali", guj: "માળી / ફૂલમાળી", group: "Artisan & Trade", keywords: "mali phoolmali phulmali saini માળી ફૂલમાળી સૈની" },
    { name: "Chunara", guj: "ચુનારા", group: "Artisan & Trade", keywords: "chunara chunaro limestone artisan ચુનારા ચૂનાવાળા" },
    { name: "Kadia", guj: "કડિયા", group: "Artisan & Trade", keywords: "kadia mason builder કડિયા ગુર્જર મારુ કડિયા" },
    { name: "Gujjar Kadia", guj: "ગુર્જર કડિયા", group: "Artisan & Trade", keywords: "gujjar kadia gurjar kadia ગુર્જર કડિયા" },
    { name: "Maru Kadia", guj: "મારુ કડિયા", group: "Artisan & Trade", keywords: "maru kadia મારુ કડિયા" },
    { name: "Dalwadi / Kadia Dalwadi", guj: "દલવાડી / કડિયા દલવાડી", group: "Artisan & Trade", keywords: "dalwadi kadia dalwadi sathwara દલવાડી કડિયા દલવાડી" },
    { name: "Sathwara", guj: "સાથવારા", group: "Artisan & Trade", keywords: "sathwara sagar શાકભાજી સાથવારા શાકભાજીવાળા" },
    { name: "Salat", guj: "સલાટ", group: "Artisan & Trade", keywords: "salat stone artist sculptor શિલ્પકાર સલાટ સોમપુરા" },
    { name: "Ode / Oad", guj: "ઓડ", group: "Artisan & Trade", keywords: "ode oad utpanna earthwork ઓડ" },
    { name: "Dabgar", guj: "ડબગર", group: "Artisan & Trade", keywords: "dabgar dholak tabla artisan ડબગર" },
    { name: "Dhobi", guj: "ધોબી", group: "Artisan & Trade", keywords: "dhobi kanaujiya rajaka ધોબી કનોજીયા રજક" },

    // Valand / Limbachiya
    { name: "Limbachiya", guj: "લિંબાચીયા", group: "Valand / Limbachiya", keywords: "limbachiya limbachia nai valand લિંબાચીયા" },
    { name: "Valand / Nai", guj: "વાણંદ / નાઈ", group: "Valand / Limbachiya", keywords: "valand vanand nai barber hair stylist વાણંદ નાઈ" },
    { name: "Gujjar Valand", guj: "ગુર્જર વાણંદ", group: "Valand / Limbachiya", keywords: "gujjar valand gurjar vanand ગુર્જર વાણંદ" },
    { name: "Sen Samaj", guj: "સેન સમાજ", group: "Valand / Limbachiya", keywords: "sen samaj nai barber સેન સમાજ નાઈ" },

    // Charan / Gadhvi
    { name: "Charan / Gadhvi", guj: "ચારણ / ગઢવી", group: "Charan / Gadhvi", keywords: "charan gadhvi kavi sahityakar ચારણ ગઢવી કવિ" },
    { name: "Maru Charan", guj: "મારુ ચારણ", group: "Charan / Gadhvi", keywords: "maru charan gadhvi મારુ ચારણ ગઢવી" },
    { name: "Kachela Charan", guj: "કછેલા ચારણ", group: "Charan / Gadhvi", keywords: "kachela charan gadhvi કછેલા ચારણ ગઢવી" },
    { name: "Tumbel Charan", guj: "તુંબેલ ચારણ", group: "Charan / Gadhvi", keywords: "tumbel charan gadhvi તુંબેલ ચારણ ગઢવી" },

    // Barot / Brahmbhatt
    { name: "Barot / Brahmbhatt", guj: "બારોટ / બ્રહ્મભટ્ટ", group: "Barot / Brahmbhatt", keywords: "barot brahmbhatt bhat genealogist બારોટ બ્રહ્મભટ્ટ ભાટ" },
    { name: "Bhat / Vahivancha Barot", guj: "ભાટ / વહીવંચા બારોટ", group: "Barot / Brahmbhatt", keywords: "bhat vahivancha barot ભાટ વહીવંચા બારોટ" },
    { name: "Charan Barot", guj: "ચારણ બારોટ", group: "Barot / Brahmbhatt", keywords: "charan barot ચારણ બારોટ" },

    // Seafaring & Marine
    { name: "Kharwa", guj: "ખારવા", group: "Seafaring & Marine", keywords: "kharwa sagarkhedu sailor seaman ખારવા સાગરખેડુ નાવિક" },
    { name: "Sagar", guj: "સાગર", group: "Seafaring & Marine", keywords: "sagar sagarkhedu sailor સાગર સાગરખેડુ" },
    { name: "Machhi", guj: "માછી", group: "Seafaring & Marine", keywords: "machhi koli machhi fisherman માછી માછીમાર" },
    { name: "Mangela", guj: "માંગેલા", group: "Seafaring & Marine", keywords: "mangela fisherman marine માંગેલા" },
    { name: "Tandel", guj: "તાંડેલ", group: "Seafaring & Marine", keywords: "tandel captain navigator તાંડેલ" },
    { name: "Bhoi", guj: "ભોઈ", group: "Seafaring & Marine", keywords: "bhoi kahar dhimar dhiwar boatman ભોઈ કહાર ધીવર" },
    { name: "Bhoi / Kahar", guj: "ભોઈ / કહાર", group: "Seafaring & Marine", keywords: "bhoi kahar dhimar dhiwar boatman ભોઈ કહાર ધીવર" },
    { name: "Rajbhoi", guj: "રાજભોઈ", group: "Seafaring & Marine", keywords: "rajbhoi bhoi રાજભોઈ ભોઈ" },

    // Traditional & Devotional
    { name: "Goswami / Bava / Sadhu", guj: "ગોસ્વામી / બાવા / સાધુ", group: "Traditional & Devotional", keywords: "goswami bava sadhu mahant puri giri bharathi ગોસ્વામી બાવા સાધુ મહંત" },
    { name: "Dashnam Goswami", guj: "દશનામ ગોસ્વામી", group: "Traditional & Devotional", keywords: "dashnam dashnami goswami giri puri bharti van parvat aranya tirtha ashram દશનામ ગોસ્વામી ગિરી પુરી ભારતી" },
    { name: "Atit Goswami", guj: "અતીત ગોસ્વામી", group: "Traditional & Devotional", keywords: "atit goswami bava અતીત ગોસ્વામી" },
    { name: "Margi Sadhu", guj: "માર્ગી સાધુ", group: "Traditional & Devotional", keywords: "margi sadhu kabir panthi માર્ગી સાધુ" },
    { name: "Bairagi / Ramanandi Sadhu", guj: "બૈરાગી / રામાનંદી સાધુ", group: "Traditional & Devotional", keywords: "bairagi ramanandi vaishnav sadhu બૈરાગી રામાનંદી સાધુ" },
    { name: "Nath Bava / Jogi", guj: "નાથ બાવા / જોગી", group: "Traditional & Devotional", keywords: "nath bava jogi kanphata gorakhnath નાથ બાવા જોગી" },
    { name: "Raval / Ravaldev", guj: "રાવળ / રાવળદેવ", group: "Traditional & Devotional", keywords: "raval ravaldev rawaldev yogi રાવળ રાવળદેવ" },
    { name: "Devipujak / Vaghri", guj: "દેવીપૂજક / વાઘરી", group: "Traditional & Devotional", keywords: "devipujak vaghri વાઘરી દેવીપૂજક માતાજી પૂજક" },
    { name: "Chunvalia Devipujak", guj: "ચુંવાળિયા દેવીપૂજક", group: "Traditional & Devotional", keywords: "chunvalia devipujak ચુંવાળિયા દેવીપૂજક" },
    { name: "Datania Devipujak", guj: "દતાણીયા દેવીપૂજક", group: "Traditional & Devotional", keywords: "datania devipujak દતાણીયા દેવીપૂજક" },
    { name: "Vanjara / Banjara", guj: "વણજારા / બંજારા", group: "Traditional & Devotional", keywords: "vanjara banjara lambadi laman વણજારા બંજારા" },
    { name: "Bajania", guj: "બાજણિયા", group: "Traditional & Devotional", keywords: "bajania bajaniya dholak musician બાજણિયા" },
    { name: "Nat", guj: "નટ", group: "Traditional & Devotional", keywords: "nat acrobatics gymnast artist નટ બજાણિયા" },
    { name: "Madari / Vadi", guj: "મદારી / વાદી", group: "Traditional & Devotional", keywords: "madari vadi juggler snake charmer મદારી વાદી" },
    { name: "Saraniya", guj: "શરાણીયા", group: "Traditional & Devotional", keywords: "saraniya sharaniya sharpener શરાણીયા" },

    // Scheduled Castes
    { name: "Vankar", guj: "વણકર", group: "Scheduled Castes", keywords: "vankar weaver mahyavanshi dhed વણકર માહ્યાવંશી" },
    { name: "Maru Vankar", guj: "મારુ વણકર", group: "Scheduled Castes", keywords: "maru vankar મારુ વણકર" },
    { name: "Gurjar Vankar", guj: "ગુર્જર વણકર", group: "Scheduled Castes", keywords: "gurjar gujjar vankar ગુર્જર વણકર" },
    { name: "Rohit", guj: "રોહિત", group: "Scheduled Castes", keywords: "rohit chamar chakor bhambi રોહિત ચમાર ભાંભી" },
    { name: "Rohit / Chamar", guj: "રોહિત / ચમાર", group: "Scheduled Castes", keywords: "rohit chamar chakor bhambi રોહિત ચમાર ભાંભી" },
    { name: "Meghwal", guj: "મેઘવાલ", group: "Scheduled Castes", keywords: "meghwal menghwar maheshwari મેઘવાલ" },
    { name: "Maheshwari Meghwal", guj: "માહેશ્વરી મેઘવાલ", group: "Scheduled Castes", keywords: "maheshwari meghwal માહેશ્વરી મેઘવાલ" },
    { name: "Garoda", guj: "ગરોડા", group: "Scheduled Castes", keywords: "garoda garo guru pandit genealogist ગરોડા ગુરુ" },
    { name: "Garoda / Guru", guj: "ગરોડા / ગુરુ", group: "Scheduled Castes", keywords: "garoda garo guru pandit genealogist ગરોડા ગુરુ" },
    { name: "Senva", guj: "સેણવા", group: "Scheduled Castes", keywords: "senva senwa shenva chenva સેણવા" },
    { name: "Valmiki", guj: "વાલ્મીકિ", group: "Scheduled Castes", keywords: "valmiki bhangi mehtar rukhi balmiki વાલ્મીકિ મહેતર ભંગી" },
    { name: "Valmiki / Bhangi", guj: "વાલ્મીકિ / મહેતર", group: "Scheduled Castes", keywords: "valmiki bhangi mehtar rukhi balmiki વાલ્મીકિ મહેતર ભંગી" },
    { name: "Turi / Turi Barot", guj: "તુરી / તુરી બારોટ", group: "Scheduled Castes", keywords: "turi turi barot musician તુરી તુરી બારોટ" },
    { name: "Tirgar", guj: "તિરગર", group: "Scheduled Castes", keywords: "tirgar teergar arrow maker તિરગર તીરગર" },
    { name: "Thori", guj: "થોરી", group: "Scheduled Castes", keywords: "thori thorhi થોરી" },
    { name: "Nadia / Hadi", guj: "નાડિયા / હાદી", group: "Scheduled Castes", keywords: "nadia hadi નાડિયા હાદી" },

    // Scheduled Tribes
    { name: "Adivasi Samaj", guj: "આદિવાસી સમાજ", group: "Scheduled Tribes", keywords: "adivasi tribal indigenous samaj આદિવાસી સમાજ ભીલ ચૌધરી ગામિત ધોડિયા" },
    { name: "Bhil", guj: "ભીલ", group: "Scheduled Tribes", keywords: "bhil bheel adivasi ભીલ આદિવાસી" },
    { name: "Gamit", guj: "ગામિત", group: "Scheduled Tribes", keywords: "gamit gavit gamta adivasi ગામિત આદિવાસી" },
    { name: "Dhodia", guj: "ધોડિયા", group: "Scheduled Tribes", keywords: "dhodia dhodi adivasi ધોડિયા આદિવાસી" },
    { name: "Rathwa", guj: "રાઠવા", group: "Scheduled Tribes", keywords: "rathwa rathva pithora adivasi રાઠવા આદિવાસી" },
    { name: "Halpati / Dubla", guj: "હળપતિ / દૂબળા", group: "Scheduled Tribes", keywords: "halpati dubla adivasi હળપતિ દૂબળા આદિવાસી" },
    { name: "Vasava", guj: "વસાવા", group: "Scheduled Tribes", keywords: "vasava adivasi વસાવા આદિવાસી" },
    { name: "Tadvi", guj: "તડવી", group: "Scheduled Tribes", keywords: "tadvi bhil adivasi તડવી ભીલ આદિવાસી" },
    { name: "Nayak / Nayaka", guj: "નાયક / નાયકા", group: "Scheduled Tribes", keywords: "nayak nayaka naika adivasi નાયક નાયકા આદિવાસી" },
    { name: "Chaudhari (Adivasi)", guj: "ચૌધરી (આદિવાસી)", group: "Scheduled Tribes", keywords: "chaudhari chaudhary adivasi south gujarat ચૌધરી આદિવાસી" },
    { name: "Warli", guj: "વારલી", group: "Scheduled Tribes", keywords: "warli varli painting adivasi વારલી આદિવાસી" },
    { name: "Konkana / Kukna", guj: "કુંકણા / કોંકણા", group: "Scheduled Tribes", keywords: "konkana kukna kokna adivasi કુંકણા કોંકણા આદિવાસી" },
    { name: "Patelia", guj: "પટેલિયા", group: "Scheduled Tribes", keywords: "patelia pateliya adivasi પટેલિયા આદિવાસી" },
    { name: "Padhar", guj: "પઢાર", group: "Scheduled Tribes", keywords: "padhar nalsarovar dance adivasi પઢાર આદિવાસી" },

    // Allied Hindu
    { name: "Maheshwari", guj: "માહેશ્વરી", group: "Allied Hindu", keywords: "maheshwari marwari baniya vaishnav માહેશ્વરી મારવાડી" },
    { name: "Agarwal / Agrawal", guj: "અગ્રવાલ", group: "Allied Hindu", keywords: "agarwal agrawal marwari baniya vaishnav અગ્રવાલ અગ્રવાલ" },
    { name: "Khandelwal", guj: "ખંડેલવાલ", group: "Allied Hindu", keywords: "khandelwal vaishnav baniya ખંડેલવાલ" },
    { name: "Kayastha", guj: "કાયસ્થ", group: "Allied Hindu", keywords: "kayastha mathur valmik bhatnagar કાયસ્થ" },
    { name: "Sindhi Hindu", guj: "સિંધી હિન્દુ", group: "Allied Hindu", keywords: "sindhi hindu jhulelal bhatia lohana સિંધી હિન્દુ ઝુલેલાલ" },
    { name: "Sindhi Lohana", guj: "સિંધી લોહાણા", group: "Allied Hindu", keywords: "sindhi lohana thakkar સિંધી લોહાણા" },
    { name: "Maratha", guj: "મરાઠા", group: "Allied Hindu", keywords: "maratha marathi kshatriya vadodara મરાઠા ક્ષત્રિય" },
    { name: "Padmashali", guj: "પદ્મશાળી", group: "Allied Hindu", keywords: "padmashali padmashali weaver textile પદ્મશાળી" }
];

let REMOTE_CASTES = null;

function getActiveCastes() {
    if (Array.isArray(REMOTE_CASTES) && REMOTE_CASTES.length > 0) {
        return REMOTE_CASTES;
    }
    if (Array.isArray(window.REMOTE_CASTES) && window.REMOTE_CASTES.length > 0) {
        return window.REMOTE_CASTES;
    }
    return ALL_CASTES;
}

/**
 * Fetch Castes directory directly from Supabase app_settings table
 */
async function syncCastesFromSupabase() {
    if (typeof supabaseGetAppSetting !== 'function') return;
    try {
        const castes = await supabaseGetAppSetting('castes');
        if (Array.isArray(castes) && castes.length > 0) {
            REMOTE_CASTES = castes;
            window.REMOTE_CASTES = castes;
            if (typeof renderFilterCasteOptions === 'function') {
                renderFilterCasteOptions();
            }
        }
    } catch(e) {
        console.warn('[Castes] syncCastesFromSupabase notice:', e);
    }
}

window.ALL_CASTES = ALL_CASTES;
window.getActiveCastes = getActiveCastes;
window.syncCastesFromSupabase = syncCastesFromSupabase;
