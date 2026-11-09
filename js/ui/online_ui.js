/* =========================================================================
   OBRAZOVKA ONLINE – vytvoření místnosti, připojení kódem a lobby
   ========================================================================= */
(function () {
  Object.assign(I18N.D, {
    onl_title: ['Online s přáteli', 'Online with friends'],
    onl_sub: ['Hraj proti kamarádům nebo s nimi – stačí si poslat kód místnosti.', 'Play against or together with friends – just share the room code.'],
    onl_1v1: ['Souboj 1 v 1', 'Duel 1 v 1'],
    onl_1v1_d: ['Ty proti kamarádovi. Každý ovládá svůj hrad a armádu.', 'You against a friend. Each controls their own castle and army.'],
    onl_2v2: ['Bitva 2 v 2', 'Battle 2 v 2'],
    onl_2v2_d: ['Dva týmy po dvou. Spoluhráči sdílejí hrad, každý má vlastní mince a vojáky.', 'Two teams of two. Teammates share a castle, each has their own coins and troops.'],
    onl_coop: ['Příběh ve dvou', 'Story co-op'],
    onl_coop_d: ['Spolu proti armádě z příběhu. Nepřítel je silnější, odměna platí pro oba.', 'Together against a story army. The enemy is stronger, both get the reward.'],
    onl_create: ['Vytvořit místnost', 'Create room'],
    onl_join: ['Připojit se ke kamarádovi', 'Join a friend'],
    onl_code_ph: ['KÓD', 'CODE'],
    onl_join_btn: ['Připojit', 'Join'],
    onl_joining: ['Připojuji se k místnosti {c}…', 'Joining room {c}…'],
    onl_room: ['Místnost', 'Room'],
    onl_share: ['Pošli tento kód kamarádovi. Zadá ho v Souboj → Online s přáteli → Připojit.', 'Send this code to your friend. They enter it in Duel → Online with friends → Join.'],
    onl_copy: ['Kopírovat kód', 'Copy code'],
    onl_copied: ['Kód zkopírován', 'Code copied'],
    onl_team_a: ['Tým modrý', 'Blue team'],
    onl_team_b: ['Tým červený', 'Red team'],
    onl_together: ['Spolu proti příběhové armádě', 'Together against the story army'],
    onl_empty: ['Volné místo…', 'Free slot…'],
    onl_host: ['hostitel', 'host'],
    onl_you: ['ty', 'you'],
    onl_army: ['Tvoje armáda', 'Your army'],
    onl_switch: ['Přejít do druhého týmu', 'Switch team'],
    onl_level: ['Úroveň příběhu', 'Story level'],
    onl_start: ['Spustit bitvu', 'Start battle'],
    onl_wait_players: ['Čeká se na hráče ({n}/{m})', 'Waiting for players ({n}/{m})'],
    onl_wait_teams: ['Týmy musí mít stejně hráčů', 'Teams must be equal'],
    onl_wait_host: ['Bitvu spustí hostitel', 'The host starts the battle'],
    onl_leave: ['Opustit místnost', 'Leave room'],
    onl_mode: ['Režim', 'Mode'],
    onl_not_found: ['Místnost nenalezena. Zkontroluj kód a jestli má kamarád hru otevřenou.', 'Room not found. Check the code and that your friend has the game open.'],
    onl_full: ['Místnost je plná.', 'The room is full.'],
    onl_host_left: ['Hostitel místnost opustil.', 'The host left the room.'],
    onl_kicked: ['Už nejsi v místnosti.', 'You are no longer in the room.'],
    onl_no_conn: ['Nepodařilo se připojit k serveru. Zkontroluj internet.', 'Could not connect to the server. Check your internet.'],
    onl_conn_lost: ['Spojení s hostitelem se přerušilo. Trofeje se nemění.', 'Connection to the host was lost. Trophies unchanged.'],
    onl_foe_left: ['Soupeř odešel z bitvy – vítězství!', 'Your opponent left the battle – victory!'],
    onl_you_quit: ['Vzdal ses.', 'You surrendered.'],
    onl_coop_locked: ['Tuhle úroveň ještě nemáš ve svém příběhu odemčenou – dostáváš zlato, postup se ti započítá, až se k ní dostaneš.', 'You have not unlocked this level in your own story yet – you get gold, progress counts once you reach it.'],
    onl_waiting: ['Čekám na hostitele…', 'Waiting for the host…'],
    onl_rules: ['Online: vítězství 1 v 1 = +30 trofejí, 2 v 2 = +20. Prohra ubere 15 / 10. Každý bojuje se svým hradem – vylepšeními, obránci na hradbách, vroucím olejem i výbavou.', 'Online: a 1 v 1 win = +30 trophies, 2 v 2 = +20. A loss costs 15 / 10. Everyone fights with their own castle – upgrades, wall defenders, boiling oil and gear.'],
    credits_cries: ['Válečné pokřiky:', 'War cries:'],
    retreat_hint: ['Ústup: vojáci se schovají za hradby, léčí se a nedosáhnou na ně speciální útoky ani nepřátelé.', 'Retreat: troops hide behind the walls, heal up, and special attacks and enemies cannot reach them.'],
    onl_btn: ['Online s přáteli', 'Online with friends'],
    onl_btn_d: ['1 v 1, 2 v 2 nebo příběh ve dvou', '1 v 1, 2 v 2 or story co-op'],
    onl_quick: ['Najít soupeře', 'Find opponent'],
    onl_qm_title: ['Hledám soupeře…', 'Looking for an opponent…'],
    onl_qm_left: ['Když do {n} s nikdo nepřijde, zahraješ si proti počítači.', 'If nobody shows up within {n} s, you will play against the computer.'],
    onl_qm_found: ['Soupeř nalezen ({n}/{m}) – bitva brzy začne…', 'Opponent found ({n}/{m}) – the battle starts soon…'],
    onl_qm_duo: ['Když do {n} s nepřijdou další hráči, utkáte se 1 v 1.', 'If no more players join within {n} s, you play 1 v 1.'],
    onl_qm_joining: ['Připojuji se k soupeři…', 'Joining the opponent…'],
    onl_ai_fallback: ['Soupeř nenalezen – bojuješ proti počítači', 'No opponent found – you\'re fighting the computer'],
    onl_ai_note: ['Bitva proti počítači: trofeje ani žebříček se nemění, dostáváš zlato.', 'Battle against the computer: trophies and the leaderboard do not change, you get gold.'],
    onl_ai_name: ['Počítač', 'Computer'],
    onl_qm_rules: ['Najít soupeře: hra hledá náhodného hráče online. Když do 10 s nikoho nenajde, hraješ proti počítači – bez trofejí, za zlato.', 'Find opponent: the game looks for a random online player. If nobody is found within 10 s, you play against the computer – no trophies, gold only.']
  });
  // [cs, en, zh, hi, es, fr, ar, bn, pt, ru, ur, id, de, ja, tr, ko] – rychlý souboj a AI soupeř (v141)
  Object.assign(I18N.D, {
    onl_1v1: ["Souboj 1 v 1", "Duel 1 v 1", "1 对 1 对决", "1 बनाम 1 द्वंद्व", "Duelo 1 contra 1", "Duel 1 contre 1", "مبارزة 1 ضد 1", "১ বনাম ১ দ্বন্দ্ব", "Duelo 1 contra 1", "Дуэль 1 на 1", "1 بمقابلہ 1 مقابلہ", "Duel 1 lawan 1", "Duell 1 gegen 1", "1対1の対戦", "1'e 1 düello", "1대1 대결"],
    onl_2v2: ["Bitva 2 v 2", "Battle 2 v 2", "2 对 2 战斗", "2 बनाम 2 युद्ध", "Batalla 2 contra 2", "Bataille 2 contre 2", "معركة 2 ضد 2", "২ বনাম ২ যুদ্ধ", "Batalha 2 contra 2", "Битва 2 на 2", "2 بمقابلہ 2 جنگ", "Pertempuran 2 lawan 2", "Schlacht 2 gegen 2", "2対2の戦い", "2'ye 2 savaş", "2대2 전투"],
    onl_quick: ["Najít soupeře", "Find opponent", "寻找对手", "प्रतिद्वंद्वी खोजें", "Buscar rival", "Trouver un adversaire", "ابحث عن خصم", "প্রতিপক্ষ খোঁজো", "Encontrar adversário", "Найти соперника", "مخالف تلاش کریں", "Cari lawan", "Gegner finden", "対戦相手を探す", "Rakip bul", "상대 찾기"],
    onl_qm_title: ["Hledám soupeře…", "Looking for an opponent…", "正在寻找对手…", "प्रतिद्वंद्वी खोज रहे हैं…", "Buscando rival…", "Recherche d’un adversaire…", "جارٍ البحث عن خصم…", "প্রতিপক্ষ খোঁজা হচ্ছে…", "Procurando adversário…", "Ищем соперника…", "مخالف تلاش کیا جا رہا ہے…", "Mencari lawan…", "Suche Gegner…", "対戦相手を探しています…", "Rakip aranıyor…", "상대를 찾는 중…"],
    onl_qm_hint: ["Když se do konce odpočtu nikdo nepřipojí, nabídneme ti AI soupeře.", "If nobody joins before the countdown ends, we will offer you an AI opponent.", "倒计时结束前若无人加入，我们将为你提供 AI 对手。", "अगर उलटी गिनती खत्म होने तक कोई नहीं जुड़ता, तो हम आपको AI प्रतिद्वंद्वी देंगे।", "Si nadie se une antes de que acabe la cuenta atrás, te ofreceremos un rival de IA.", "Si personne ne rejoint avant la fin du compte à rebours, on te proposera un adversaire IA.", "إذا لم ينضم أحد قبل انتهاء العد التنازلي، سنقترح عليك خصمًا بالذكاء الاصطناعي.", "কাউন্টডাউন শেষ হওয়ার আগে কেউ যোগ না দিলে তোমাকে একটি AI প্রতিপক্ষ দেওয়া হবে।", "Se ninguém entrar antes do fim da contagem, vamos oferecer um adversário de IA.", "Если до конца отсчёта никто не подключится, мы предложим соперника-ИИ.", "اگر الٹی گنتی ختم ہونے تک کوئی شامل نہ ہوا تو ہم آپ کو AI مخالف دیں گے۔", "Jika tidak ada yang bergabung sebelum hitung mundur selesai, kami akan menawarkan lawan AI.", "Wenn bis zum Ende des Countdowns niemand beitritt, bieten wir dir einen KI-Gegner an.", "カウントダウン終了までに誰も来なければ、AI対戦相手を用意します。", "Geri sayım bitmeden kimse katılmazsa sana bir yapay zekâ rakibi önereceğiz.", "카운트다운이 끝날 때까지 아무도 오지 않으면 AI 상대를 제안해 드려요."],
    onl_qm_sec: ["s", "s", "秒", "से.", "s", "s", "ث", "সে.", "s", "с", "سیکنڈ", "dtk", "s", "秒", "sn", "초"],
    onl_qm_found: ["Soupeř nalezen ({n}/{m}) – bitva brzy začne…", "Opponent found ({n}/{m}) – the battle starts soon…", "已找到对手（{n}/{m}）——战斗即将开始…", "प्रतिद्वंद्वी मिल गया ({n}/{m}) – युद्ध जल्द शुरू होगा…", "Rival encontrado ({n}/{m}): la batalla empieza pronto…", "Adversaire trouvé ({n}/{m}) – la bataille commence bientôt…", "تم العثور على خصم ({n}/{m}) – تبدأ المعركة قريبًا…", "প্রতিপক্ষ পাওয়া গেছে ({n}/{m}) – যুদ্ধ শিগগির শুরু…", "Adversário encontrado ({n}/{m}) – a batalha começa em breve…", "Соперник найден ({n}/{m}) – бой скоро начнётся…", "مخالف مل گیا ({n}/{m}) – جنگ جلد شروع ہوگی…", "Lawan ditemukan ({n}/{m}) – pertempuran segera dimulai…", "Gegner gefunden ({n}/{m}) – der Kampf beginnt gleich…", "対戦相手が見つかりました（{n}/{m}）まもなく開始…", "Rakip bulundu ({n}/{m}) – savaş birazdan başlıyor…", "상대를 찾았어요 ({n}/{m}) – 곧 전투가 시작돼요…"],
    onl_qm_duo: ["Když do {n} s nepřijdou další hráči, utkáte se 1 v 1.", "If no more players join within {n} s, you play 1 v 1.", "若 {n} 秒内没有更多玩家加入，你们将进行 1 对 1。", "{n} सेकंड में और खिलाड़ी न जुड़े तो आप 1 बनाम 1 खेलेंगे।", "Si no se unen más jugadores en {n} s, jugaréis 1 contra 1.", "Si personne d’autre ne rejoint en {n} s, vous jouerez en 1 contre 1.", "إذا لم ينضم لاعبون آخرون خلال {n} ث، فستلعبان 1 ضد 1.", "{n} সেকেন্ডে আর কেউ যোগ না দিলে তোমরা ১ বনাম ১ খেলবে।", "Se mais ninguém entrar em {n} s, vocês jogam 1 contra 1.", "Если за {n} с больше никто не подключится, сыграете 1 на 1.", "{n} سیکنڈ میں مزید کھلاڑی نہ آئے تو آپ 1 بمقابلہ 1 کھیلیں گے۔", "Jika tidak ada pemain lain dalam {n} dtk, kalian main 1 lawan 1.", "Wenn in {n} s keine weiteren Spieler beitreten, spielt ihr 1 gegen 1.", "{n}秒以内に他のプレイヤーが来なければ1対1で対戦します。", "{n} sn içinde başka oyuncu katılmazsa 1'e 1 oynarsınız.", "{n}초 안에 더 들어오지 않으면 1대1로 대결해요."],
    onl_qm_joining: ["Připojuji se k soupeři…", "Joining the opponent…", "正在连接对手…", "प्रतिद्वंद्वी से जुड़ रहे हैं…", "Uniéndote al rival…", "Connexion à l’adversaire…", "جارٍ الانضمام إلى الخصم…", "প্রতিপক্ষের সঙ্গে যুক্ত হচ্ছে…", "Entrando na partida do adversário…", "Подключаемся к сопернику…", "مخالف سے جڑ رہے ہیں…", "Bergabung dengan lawan…", "Verbinde mit dem Gegner…", "対戦相手に接続中…", "Rakibe bağlanılıyor…", "상대에게 연결 중…"],
    onl_qm_none: ["Zatím se nepřipojil žádný živý hráč", "No live player has joined yet", "暂时没有真人玩家加入", "अभी तक कोई असली खिलाड़ी नहीं जुड़ा", "Aún no se ha unido ningún jugador real", "Aucun joueur réel n’a encore rejoint", "لم ينضم أي لاعب حقيقي بعد", "এখনও কোনো আসল খেলোয়াড় যোগ দেয়নি", "Nenhum jogador real entrou ainda", "Пока не подключился ни один живой игрок", "ابھی تک کوئی اصلی کھلاڑی شامل نہیں ہوا", "Belum ada pemain sungguhan yang bergabung", "Noch kein echter Spieler beigetreten", "まだ実際のプレイヤーが参加していません", "Henüz gerçek bir oyuncu katılmadı", "아직 실제 플레이어가 참가하지 않았어요"],
    onl_ai_opp: ["AI soupeř", "AI opponent", "AI 对手", "AI प्रतिद्वंद्वी", "Rival IA", "Adversaire IA", "خصم ذكاء اصطناعي", "AI প্রতিপক্ষ", "Adversário IA", "Соперник-ИИ", "AI مخالف", "Lawan AI", "KI-Gegner", "AI対戦相手", "Yapay zekâ rakibi", "AI 상대"],
    onl_ai_offer: ["Můžeš si zatím zahrát proti AI soupeři:", "Meanwhile you can play against an AI opponent:", "你可以先和 AI 对手打一局：", "तब तक आप AI प्रतिद्वंद्वी से खेल सकते हैं:", "Mientras tanto, puedes jugar contra un rival de IA:", "En attendant, tu peux jouer contre un adversaire IA :", "في الأثناء يمكنك اللعب ضد خصم ذكاء اصطناعي:", "এর মধ্যে তুমি একটি AI প্রতিপক্ষের সঙ্গে খেলতে পারো:", "Enquanto isso, você pode jogar contra um adversário de IA:", "А пока можно сыграть против соперника-ИИ:", "تب تک آپ AI مخالف سے کھیل سکتے ہیں:", "Sementara itu kamu bisa melawan lawan AI:", "Solange kannst du gegen einen KI-Gegner spielen:", "その間、AI対戦相手と対戦できます：", "Bu arada bir yapay zekâ rakibine karşı oynayabilirsin:", "그동안 AI 상대와 대결할 수 있어요:"],
    onl_ai_start_in: ["Bitva proti AI začne za {n} s", "The battle against the AI starts in {n} s", "与 AI 的战斗将在 {n} 秒后开始", "AI से युद्ध {n} सेकंड में शुरू होगा", "La batalla contra la IA empieza en {n} s", "La bataille contre l’IA commence dans {n} s", "تبدأ المعركة ضد الذكاء الاصطناعي خلال {n} ث", "AI-এর সঙ্গে যুদ্ধ {n} সেকেন্ডে শুরু হবে", "A batalha contra a IA começa em {n} s", "Бой с ИИ начнётся через {n} с", "AI سے جنگ {n} سیکنڈ میں شروع ہوگی", "Pertempuran melawan AI dimulai dalam {n} dtk", "Der Kampf gegen die KI beginnt in {n} s", "AIとの対戦は{n}秒後に始まります", "Yapay zekâya karşı savaş {n} sn içinde başlıyor", "AI와의 전투가 {n}초 후 시작돼요"],
    onl_ai_still: ["Hledání živého hráče běží dál – když se někdo připojí, dostane přednost.", "We keep looking for a live player – if someone joins, they take priority.", "我们仍在寻找真人玩家——一旦有人加入，将优先匹配。", "हम असली खिलाड़ी खोजते रहेंगे – कोई जुड़ा तो उसे प्राथमिकता मिलेगी।", "Seguimos buscando un jugador real: si alguien se une, tiene prioridad.", "On continue de chercher un vrai joueur : si quelqu’un rejoint, il passe en priorité.", "نواصل البحث عن لاعب حقيقي – إذا انضم أحد فستكون له الأولوية.", "আমরা আসল খেলোয়াড় খুঁজতে থাকব – কেউ যোগ দিলে সে অগ্রাধিকার পাবে।", "Continuamos procurando um jogador real – se alguém entrar, tem prioridade.", "Поиск живого игрока продолжается – если кто-то подключится, он в приоритете.", "ہم اصلی کھلاڑی تلاش کرتے رہیں گے – کوئی شامل ہوا تو اسے ترجیح ملے گی۔", "Kami terus mencari pemain sungguhan – jika ada yang bergabung, dia diutamakan.", "Wir suchen weiter nach einem echten Spieler – wer beitritt, hat Vorrang.", "実際のプレイヤーの検索は続行中です。誰かが参加したらそちらを優先します。", "Gerçek oyuncu aramaya devam ediyoruz – biri katılırsa öncelik onun.", "실제 플레이어 찾기는 계속돼요. 누군가 들어오면 그 플레이어가 우선이에요."],
    onl_ai_now: ["Hrát hned", "Play now", "立即开战", "अभी खेलें", "Jugar ya", "Jouer maintenant", "العب الآن", "এখনই খেলো", "Jogar agora", "Играть сейчас", "ابھی کھیلیں", "Main sekarang", "Jetzt spielen", "今すぐ対戦", "Hemen oyna", "지금 플레이"],
    onl_ai_more: ["Hledat dál", "Keep searching", "继续寻找", "खोज जारी रखें", "Seguir buscando", "Continuer à chercher", "واصل البحث", "খোঁজা চালিয়ে যাও", "Continuar procurando", "Искать дальше", "تلاش جاری رکھیں", "Terus cari", "Weiter suchen", "検索を続ける", "Aramaya devam et", "계속 찾기"],
    onl_cancel: ["Zrušit", "Cancel", "取消", "रद्द करें", "Cancelar", "Annuler", "إلغاء", "বাতিল", "Cancelar", "Отмена", "منسوخ کریں", "Batal", "Abbrechen", "キャンセル", "İptal", "취소"],
    onl_ai_note: ["Bitva proti AI soupeři: trofeje ani žebříček se nemění, dostáváš zlato.", "Battle against an AI opponent: trophies and the leaderboard do not change, you get gold.", "与 AI 对手的战斗：奖杯和排行榜不变，你将获得金币。", "AI प्रतिद्वंद्वी से युद्ध: ट्रॉफ़ी और रैंकिंग नहीं बदलती, आपको सोना मिलता है।", "Batalla contra un rival de IA: los trofeos y el ranking no cambian, recibes oro.", "Bataille contre un adversaire IA : trophées et classement inchangés, tu gagnes de l’or.", "معركة ضد خصم ذكاء اصطناعي: لا تتغير الكؤوس ولا الترتيب، وتحصل على ذهب.", "AI প্রতিপক্ষের সঙ্গে যুদ্ধ: ট্রফি ও র‍্যাঙ্কিং বদলায় না, তুমি সোনা পাও।", "Batalha contra adversário de IA: troféus e ranking não mudam, você ganha ouro.", "Бой с соперником-ИИ: трофеи и рейтинг не меняются, ты получаешь золото.", "AI مخالف سے جنگ: ٹرافیاں اور درجہ بندی نہیں بدلتیں، آپ کو سونا ملتا ہے۔", "Pertempuran melawan lawan AI: trofi dan peringkat tidak berubah, kamu dapat emas.", "Kampf gegen einen KI-Gegner: Trophäen und Rangliste bleiben gleich, du bekommst Gold.", "AI対戦相手との戦い：トロフィーとランキングは変わらず、ゴールドがもらえます。", "Yapay zekâ rakibine karşı savaş: kupalar ve sıralama değişmez, altın kazanırsın.", "AI 상대와의 전투: 트로피와 랭킹은 그대로이고 골드를 받아요."],
    onl_qm_rules: ["Najít soupeře: hra hledá náhodného hráče online. Když do {n} s nikoho nenajde, nabídne ti AI soupeře – bez trofejí, za zlato.", "Find opponent: the game looks for a random online player. If nobody is found within {n} s, it offers you an AI opponent – no trophies, gold only.", "寻找对手：游戏会匹配随机在线玩家。若 {n} 秒内无人，将为你提供 AI 对手——不计奖杯，只得金币。", "प्रतिद्वंद्वी खोजें: गेम कोई ऑनलाइन खिलाड़ी खोजता है। {n} सेकंड में कोई न मिले तो AI प्रतिद्वंद्वी मिलेगा – ट्रॉफ़ी नहीं, केवल सोना।", "Buscar rival: el juego busca un jugador en línea al azar. Si no encuentra a nadie en {n} s, te ofrece un rival de IA: sin trofeos, solo oro.", "Trouver un adversaire : le jeu cherche un joueur en ligne au hasard. Si personne n’est trouvé en {n} s, il te propose un adversaire IA – sans trophées, seulement de l’or.", "ابحث عن خصم: تبحث اللعبة عن لاعب عشوائي متصل. إن لم تجد أحدًا خلال {n} ث، تقترح عليك خصمًا بالذكاء الاصطناعي – بلا كؤوس، ذهب فقط.", "প্রতিপক্ষ খোঁজো: গেম এলোমেলো অনলাইন খেলোয়াড় খোঁজে। {n} সেকেন্ডে কাউকে না পেলে AI প্রতিপক্ষ দেয় – ট্রফি নেই, শুধু সোনা।", "Encontrar adversário: o jogo procura um jogador online aleatório. Se ninguém for encontrado em {n} s, oferece um adversário de IA – sem troféus, só ouro.", "Найти соперника: игра ищет случайного игрока онлайн. Если за {n} с никого нет, предложит соперника-ИИ – без трофеев, только золото.", "مخالف تلاش کریں: گیم کوئی بے ترتیب آن لائن کھلاڑی ڈھونڈتا ہے۔ {n} سیکنڈ میں کوئی نہ ملے تو AI مخالف دیتا ہے – ٹرافی نہیں، صرف سونا۔", "Cari lawan: game mencari pemain online acak. Jika tidak ada dalam {n} dtk, kamu ditawari lawan AI – tanpa trofi, hanya emas.", "Gegner finden: Das Spiel sucht einen zufälligen Online-Spieler. Wird in {n} s niemand gefunden, bekommst du einen KI-Gegner angeboten – ohne Trophäen, nur Gold.", "対戦相手を探す：ランダムなオンラインプレイヤーを探します。{n}秒以内に見つからなければAI対戦相手を提案します（トロフィーなし、ゴールドのみ）。", "Rakip bul: oyun rastgele bir çevrimiçi oyuncu arar. {n} sn içinde kimse bulunmazsa sana yapay zekâ rakibi önerir – kupa yok, sadece altın.", "상대 찾기: 무작위 온라인 플레이어를 찾아요. {n}초 안에 아무도 없으면 AI 상대를 제안해요 – 트로피 없이 골드만."]
  });
  let qmTick = null;   // odpočet na obrazovce hledání

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CAP = { '1v1': 2, '2v2': 4, coop: 2 };

  function screenOnline(App) {
    const el = App.screenEl, O = window.Online, r = O.room, save = App.save, G = GameData;
    const modeCard = (m, icon) => `
      <article class="panel onl-card">
        <div class="onl-ic">${ico(icon)}</div>
        <div><h3>${t('onl_' + m)}</h3><p class="muted">${t('onl_' + m + '_d')}</p></div>
        <div class="onl-card-btns">${m !== 'coop' ? `<button class="btn btn-green" data-quick="${m}">${t('onl_quick')}</button>` : ''}<button class="btn btn-gold" data-create="${m}">${t('onl_create')}</button></div>
      </article>`;
    clearInterval(qmTick);

    if (!r) {
      el.innerHTML = `
        <div class="scr">
          <div class="sec-head"><h1>${t('onl_title')}</h1><button class="btn btn-sm" data-go="pvp">${t('back')}</button></div>
          <p class="muted">${t('onl_sub')}</p>
          <div class="onl-modes">${modeCard('1v1', 'swords')}${modeCard('2v2', 'shield')}${modeCard('coop', 'crown')}</div>
          <article class="panel onl-join">
            <h3>${t('onl_join')}</h3>
            <div class="onl-join-row"><input id="onlCode" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${t('onl_code_ph')}"><button class="btn btn-green" id="onlJoin">${t('onl_join_btn')}</button></div>
          </article>
          <p class="muted onl-rules">${t('onl_rules')}</p>
          <p class="muted onl-rules">${t('onl_qm_rules', { n: Math.round((O.qmWait || 35000) / 1000) })}</p>
        </div>`;
      el.querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click', () => O.quick(b.dataset.quick)));
      el.querySelectorAll('[data-create]').forEach(b => b.addEventListener('click', () => {
        const m = b.dataset.create;
        if (m === 'coop' && !O.coopLevels().length) return App.toast(t('t_prev_first'));
        O.create(m);
      }));
      const inp = el.querySelector('#onlCode');
      inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
      const doJoin = () => { if (!O.join(inp.value)) App.toast(t('onl_not_found')); };
      el.querySelector('#onlJoin').addEventListener('click', doJoin);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') doJoin(); });
      return;
    }

    // rychlý souboj: hledání soupeře s živým odpočtem → nabídka AI soupeře (hledání člověka běží dál)
    if (r.quick && r.aiOffer && r.host && !r.joining) {
      const o = r.aiOffer, F = G.factions[o.fac] || G.factions.kralovstvi, total = O.qmOffer || 8000;
      const left = () => Math.max(0, Math.ceil((o.until - Date.now()) / 1000));
      el.innerHTML = `<div class="scr"><div class="panel onl-qm onl-ai-offer" role="dialog" aria-live="polite">
        <div class="eyebrow">${t('onl_' + r.quick)}</div>
        <h3>${t('onl_qm_none')}</h3>
        <p class="muted qm-offer-lead">${t('onl_ai_offer')}</p>
        <div class="qm-opp" style="--c:${F.color}"><canvas data-qmpf="${o.fac}"></canvas>
          <div><b>${esc(o.name)}</b> <span class="tag tag-ai">${t('onl_ai_opp')}</span>
          <small>${esc(F.name)} · ${ico('trophy')} ${o.tro | 0}</small></div></div>
        <div class="qm-auto"><p id="onlAiLeft">${t('onl_ai_start_in', { n: left() })}</p><div class="qm-bar"><i id="onlAiBar"></i></div></div>
        <p class="muted qm-small"><span class="spin sm"></span>${t('onl_ai_still')}</p>
        <p class="muted qm-small qm-note">${t('onl_ai_note')}</p>
        <div class="qm-actions">
          <button class="btn btn-green btn-big" id="onlAiNow">${t('onl_ai_now')}</button>
          <button class="btn" id="onlAiMore">${t('onl_ai_more')}</button>
          <button class="btn" id="onlLeave">${t('onl_cancel')}</button>
        </div></div></div>`;
      el.querySelectorAll('canvas[data-qmpf]').forEach(cv => Art.renderUnitIcon(cv, F.roles.tezka, 'enemy', 'zakladni', { headshot: true, noShadow: true }));
      el.querySelector('#onlAiNow').addEventListener('click', () => O.aiNow());
      el.querySelector('#onlAiMore').addEventListener('click', () => O.searchMore());
      el.querySelector('#onlLeave').addEventListener('click', () => O.leave());
      const tick = () => {
        const x = el.querySelector('#onlAiLeft'), bar = el.querySelector('#onlAiBar');
        if (!x || O.room !== r || r.aiOffer !== o) return clearInterval(qmTick);
        x.textContent = t('onl_ai_start_in', { n: left() });
        bar.style.width = (Math.max(0, Math.min(1, (o.until - Date.now()) / total)) * 100).toFixed(1) + '%';
      };
      tick(); qmTick = setInterval(tick, 100);
      return;
    }
    if (r.quick) {
      const total = O.qmWait || 35000;
      const left = () => Math.max(0, Math.ceil((r.qmUntil - Date.now()) / 1000));
      // odpočet ukazuje jen hostitel (rozhoduje on); když už má soupeře ve 2 v 2, čeká se na další dva
      const solo = r.host && !r.joining && r.players.length < 2;
      const cdKey = !r.host || r.joining || solo ? '' : 'onl_qm_duo';
      const sub = r.joining ? t('onl_qm_joining') : r.players.length > 1 ? t('onl_qm_found', { n: r.players.length, m: CAP[r.quick] }) : '';
      const C = 2 * Math.PI * 44;
      el.innerHTML = `<div class="scr"><div class="panel onl-wait onl-qm">
        ${solo ? `<div class="qm-ring" aria-hidden="true"><svg viewBox="0 0 100 100"><circle class="qm-ring-bg" cx="50" cy="50" r="44"/><circle class="qm-ring-fg" id="onlQmRing" cx="50" cy="50" r="44" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="0"/></svg><b id="onlQmN">${left()}</b><small>${t('onl_qm_sec')}</small></div>` : '<div class="spin"></div>'}
        <h3>${t('onl_qm_title')}</h3><div class="eyebrow">${t('onl_' + r.quick)}</div>
        ${sub ? `<p>${sub}</p>` : ''}${cdKey ? `<p class="muted" id="onlQmLeft">${t(cdKey, { n: left() })}</p>` : ''}
        ${solo ? `<p class="muted qm-small">${t('onl_qm_hint')}</p>` : ''}
        <button class="btn" id="onlLeave">${t('onl_cancel')}</button></div></div>`;
      el.querySelector('#onlLeave').addEventListener('click', () => O.leave());
      const tick = () => {
        if (O.room !== r) return clearInterval(qmTick);
        const x = el.querySelector('#onlQmLeft'); if (x) x.textContent = t(cdKey, { n: left() });
        const n = el.querySelector('#onlQmN'), ring = el.querySelector('#onlQmRing');
        if (n) n.textContent = left();
        if (ring) ring.setAttribute('stroke-dashoffset', (C * (1 - Math.max(0, Math.min(1, (r.qmUntil - Date.now()) / total)))).toFixed(1));
      };
      tick(); qmTick = setInterval(tick, 200);
      return;
    }

    if (r.joining) {
      el.innerHTML = `<div class="scr"><div class="panel onl-wait"><div class="spin"></div><h3>${t('onl_joining', { c: esc(r.code) })}</h3><button class="btn" id="onlLeave">${t('back')}</button></div></div>`;
      el.querySelector('#onlLeave').addEventListener('click', () => O.leave());
      return;
    }

    const me = r.players.find(p => p.pid === O.pid) || {};
    const myFac = me.fac || save.faction;
    const H = G.campaignHelpers;
    const pcard = p => {
      const F = G.factions[p.fac] || G.factions.kralovstvi;
      return `<div class="onl-p ${p.pid === O.pid ? 'me' : ''}" style="--c:${F.color}">
        <canvas data-pf="${p.fac}"></canvas>
        <div><b>${esc(p.name)}</b>${p.host ? ` <small class="tag">${t('onl_host')}</small>` : ''}${p.pid === O.pid ? ` <small class="tag tag-you">${t('onl_you')}</small>` : ''}
        <small>${esc(F.name)} · ${ico('trophy')} ${p.tro | 0}</small></div></div>`;
    };
    const per = r.mode === '2v2' ? 2 : r.mode === '1v1' ? 1 : 2;
    const col = (team, label) => {
      const ps = r.players.filter(p => p.team === team);
      const empty = Math.max(0, per - ps.length);
      return `<div class="onl-team team-${team}"><div class="eyebrow">${label}</div>${ps.map(pcard).join('')}${Array.from({ length: empty }, () => `<div class="onl-p empty">${t('onl_empty')}</div>`).join('')}</div>`;
    };
    const lv = r.level ? H.find(r.level) : null;
    const ready = r.host && O.ready();
    let why = '';
    if (!O.full()) why = t('onl_wait_players', { n: r.players.length, m: CAP[r.mode] });
    else if (!O.ready()) why = t('onl_wait_teams');
    el.innerHTML = `
      <div class="scr onl-lobby">
        <div class="onl-code-box">
          <div><div class="eyebrow">${t('onl_room')} · ${t('onl_' + r.mode)}</div><div class="onl-code">${esc(r.code)}</div></div>
          <p class="muted">${t('onl_share')}</p>
          <button class="btn btn-sm" id="onlCopy">${t('onl_copy')}</button>
        </div>
        ${r.host ? `<div class="onl-mode-row"><span class="eyebrow">${t('onl_mode')}</span>${['1v1', '2v2', 'coop'].map(m => `<button class="chip ${r.mode === m ? 'on' : ''}" data-mode="${m}" ${r.players.length > CAP[m] ? 'disabled' : ''}>${t('onl_' + m)}</button>`).join('')}</div>` : ''}
        <div class="onl-teams ${r.mode === 'coop' ? 'coop' : ''}">
          ${r.mode === 'coop' ? col('A', t('onl_together')) : col('A', t('onl_team_a')) + '<div class="onl-vs">VS</div>' + col('B', t('onl_team_b'))}
        </div>
        ${r.mode === 'coop' ? `<div class="panel onl-level"><div class="eyebrow">${t('onl_level')}</div>
          ${r.host ? `<select id="onlLevel">${O.coopLevels().map(l => `<option value="${l.id}" ${l.id === r.level ? 'selected' : ''}>${esc(l.label)} ${esc(l.name)}${save.campaign.cleared[l.id] ? ' ✓' : ''}</option>`).join('')}</select>` : `<b>${lv ? esc(lv.label + ' ' + lv.name) : '—'}</b>`}
          ${lv ? `<small class="muted">${t('difficulty')}: ×${lv.diff.toFixed(2).replace('.', ',')} · ${esc(G.factions[lv.enemy].name)}</small>` : ''}</div>` : ''}
        <div class="panel onl-army"><div class="eyebrow">${t('onl_army')}</div>
          <div class="onl-facs">${G.factionOrder.map(f => { const un = H.factionUnlocked(save, f); return `<button class="chip ${f === myFac ? 'on' : ''}" data-fac="${f}" ${un ? '' : 'disabled'} style="--c:${G.factions[f].color}">${esc(G.factions[f].name)}${un ? '' : ' 🔒'}</button>`; }).join('')}</div>
          ${r.mode !== 'coop' ? `<button class="btn btn-sm" id="onlSwitch">${t('onl_switch')}</button>` : ''}
        </div>
        <div class="onl-actions">
          ${r.host ? `<button class="btn btn-green btn-big" id="onlStart" ${ready ? '' : 'disabled'}>${t('onl_start')}</button>${why ? `<small class="muted">${why}</small>` : ''}` : `<div class="muted onl-wait-host"><div class="spin sm"></div>${why || t('onl_wait_host')}</div>`}
          <button class="btn" id="onlLeave">${t('onl_leave')}</button>
        </div>
      </div>`;
    el.querySelectorAll('canvas[data-pf]').forEach(cv => { const F = G.factions[cv.dataset.pf] || G.factions.kralovstvi; Art.renderUnitIcon(cv, F.roles.tezka, 'player', 'zakladni', { headshot: true, noShadow: true }); });
    el.querySelector('#onlCopy').addEventListener('click', () => {
      const txt = r.code;
      const ok = () => App.toast(t('onl_copied'));
      try { if (navigator.share && matchMedia('(pointer: coarse)').matches) { navigator.share({ title: 'Castle WARS', text: `Castle WARS – ${t('onl_room')} ${txt}`, url: location.origin + location.pathname }).catch(() => {}); return; } } catch (_) { /* nic */ }
      try { navigator.clipboard.writeText(txt).then(ok, ok); } catch (_) { ok(); }
    });
    el.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => O.setMode(b.dataset.mode)));
    el.querySelectorAll('[data-fac]').forEach(b => b.addEventListener('click', () => { if (!b.disabled) O.setFac(b.dataset.fac); }));
    const sw = el.querySelector('#onlSwitch'); if (sw) sw.addEventListener('click', () => O.switchTeam());
    const ls = el.querySelector('#onlLevel'); if (ls) ls.addEventListener('change', () => O.setLevel(ls.value));
    const st = el.querySelector('#onlStart'); if (st) st.addEventListener('click', () => { if (!O.start()) App.toast(why || t('onl_wait_teams')); });
    el.querySelector('#onlLeave').addEventListener('click', () => { O.leave(); });
  }

  Screens.online = screenOnline;
})();
