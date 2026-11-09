/* =========================================================================
   POZVI KAMARÁDA (jedna úroveň, odměny jen herní věci – nikdy peníze)
   - každý hráč má odkaz hry s ?pozvanka=<kód> (sdílení / kopírování)
   - pozvaný dostane dárek na začátek hned po prvním spuštění přes odkaz
   - zvoucí dostane odměnu, až pozvaný opravdu hraje (3 dohrané bitvy), max 10 kamarádů
   - žádné pozvání sebe sama (stejný účet / zařízení) – hlídá server
   Pravda je na serveru (RPC hra_pozvanka_*, migrace supabase/migrations/…_hra_pozvi_kamarada.sql).
   Dokud server neodpoví, je funkce skrytá. Na herních portálech se nezobrazuje.
   + KÓD TVŮRCE (BrosWars Partner) v nastavení profilu – viz js/core/partner.js
   ========================================================================= */
(function () {
  // [cs, en, zh, hi, es, fr, ar, bn, pt, ru, ur, id, de, ja, tr, ko]
  Object.assign(I18N.D, {
    inv_title: ['Pozvi kamaráda', 'Invite a friend', '邀请好友', 'दोस्त को बुलाएँ', 'Invita a un amigo', 'Invite un ami', 'ادعُ صديقًا', 'বন্ধুকে আমন্ত্রণ জানাও', 'Convide um amigo', 'Пригласи друга', 'دوست کو مدعو کریں', 'Ajak teman', 'Lade einen Freund ein', '友達を招待', 'Arkadaşını davet et', '친구 초대'],
    inv_btn: ['Pozvi', 'Invite', '邀请', 'बुलाएँ', 'Invitar', 'Inviter', 'ادعُ', 'আমন্ত্রণ', 'Convidar', 'Позвать', 'مدعو کریں', 'Ajak', 'Einladen', '招待', 'Davet', '초대'],
    inv_lead: ['Hrajte spolu! Kamarád dostane dárek na začátek a ty odměnu, až odehraje {n} bitvy.', 'Play together! Your friend gets a starter gift, and you get a reward once they finish {n} battles.', '一起玩吧！好友获得新手礼物，好友完成 {n} 场战斗后你也能获得奖励。', 'साथ खेलें! दोस्त को शुरुआती उपहार मिलेगा, और जब वह {n} लड़ाइयाँ पूरी करेगा तो आपको इनाम मिलेगा।', '¡Jugad juntos! Tu amigo recibe un regalo de inicio y tú una recompensa cuando termine {n} batallas.', 'Jouez ensemble ! Ton ami reçoit un cadeau de départ, et toi une récompense quand il a fini {n} batailles.', 'العبوا معًا! يحصل صديقك على هدية بداية، وتحصل أنت على مكافأة عندما يُنهي {n} معارك.', 'একসাথে খেলো! বন্ধু শুরুর উপহার পাবে, আর সে {n}টি যুদ্ধ শেষ করলে তুমি পুরস্কার পাবে।', 'Joguem juntos! Seu amigo ganha um presente inicial e você ganha uma recompensa quando ele terminar {n} batalhas.', 'Играйте вместе! Друг получит стартовый подарок, а ты — награду, когда он проведёт {n} битвы.', 'مل کر کھیلیں! دوست کو آغاز کا تحفہ ملے گا، اور جب وہ {n} لڑائیاں مکمل کرے گا تو آپ کو انعام ملے گا۔', 'Main bersama! Temanmu dapat hadiah awal, dan kamu dapat hadiah setelah dia menyelesaikan {n} pertempuran.', 'Spielt zusammen! Dein Freund bekommt ein Startgeschenk und du eine Belohnung, sobald er {n} Schlachten gespielt hat.', '一緒に遊ぼう！友達はスターターギフトを受け取り、友達が{n}回バトルを終えるとあなたにも報酬。', 'Birlikte oynayın! Arkadaşın başlangıç hediyesi alır, o {n} savaş bitirince sen de ödül alırsın.', '함께 플레이하세요! 친구는 시작 선물을 받고, 친구가 전투 {n}회를 마치면 당신도 보상을 받습니다.'],
    inv_friend_gets: ['Kamarád dostane', 'Your friend gets', '好友获得', 'दोस्त को मिलेगा', 'Tu amigo recibe', 'Ton ami reçoit', 'يحصل صديقك على', 'বন্ধু পাবে', 'Seu amigo ganha', 'Друг получит', 'دوست کو ملے گا', 'Temanmu dapat', 'Dein Freund bekommt', '友達がもらえる', 'Arkadaşın alır', '친구가 받는 것'],
    inv_you_get: ['Ty za každého', 'You, per friend', '你（每位好友）', 'आप, हर दोस्त पर', 'Tú, por amigo', 'Toi, par ami', 'أنت، عن كل صديق', 'তুমি, প্রতি বন্ধুর জন্য', 'Você, por amigo', 'Ты, за каждого', 'آپ، ہر دوست پر', 'Kamu, per teman', 'Du, pro Freund', 'あなた（1人ごと）', 'Sen, arkadaş başına', '나, 친구 1명당'],
    inv_share: ['Sdílet odkaz', 'Share link', '分享链接', 'लिंक साझा करें', 'Compartir enlace', 'Partager le lien', 'شارك الرابط', 'লিংক শেয়ার করো', 'Compartilhar link', 'Поделиться ссылкой', 'لنک شیئر کریں', 'Bagikan tautan', 'Link teilen', 'リンクを共有', 'Bağlantıyı paylaş', '링크 공유'],
    inv_copy: ['Kopírovat', 'Copy', '复制', 'कॉपी करें', 'Copiar', 'Copier', 'نسخ', 'কপি করো', 'Copiar', 'Копировать', 'کاپی کریں', 'Salin', 'Kopieren', 'コピー', 'Kopyala', '복사'],
    inv_copied: ['Odkaz zkopírován', 'Link copied', '链接已复制', 'लिंक कॉपी हो गया', 'Enlace copiado', 'Lien copié', 'تم نسخ الرابط', 'লিংক কপি হয়েছে', 'Link copiado', 'Ссылка скопирована', 'لنک کاپی ہو گیا', 'Tautan disalin', 'Link kopiert', 'リンクをコピーしました', 'Bağlantı kopyalandı', '링크가 복사되었습니다'],
    inv_progress: ['Odměněno {a} z {b} kamarádů', '{a} of {b} friends rewarded', '已奖励 {a}/{b} 位好友', '{b} में से {a} दोस्तों का इनाम मिला', '{a} de {b} amigos recompensados', '{a} amis sur {b} récompensés', 'تمت مكافأة {a} من {b} أصدقاء', '{b} জনের মধ্যে {a} জন বন্ধুর পুরস্কার পেয়েছ', '{a} de {b} amigos recompensados', 'Награды за друзей: {a} из {b}', '{b} میں سے {a} دوستوں کا انعام ملا', '{a} dari {b} teman sudah dihadiahi', '{a} von {b} Freunden belohnt', '報酬獲得 {a}/{b} 人', '{b} arkadaştan {a} ödüllendirildi', '친구 {b}명 중 {a}명 보상 완료'],
    inv_joined: ['Přišlo přes tvůj odkaz: {n}', 'Joined via your link: {n}', '通过你的链接加入：{n}', 'आपके लिंक से जुड़े: {n}', 'Se unieron con tu enlace: {n}', 'Venus via ton lien : {n}', 'انضموا عبر رابطك: {n}', 'তোমার লিংকে যোগ দিয়েছে: {n}', 'Entraram pelo seu link: {n}', 'Пришли по твоей ссылке: {n}', 'آپ کے لنک سے شامل: {n}', 'Bergabung lewat tautanmu: {n}', 'Über deinen Link gekommen: {n}', 'あなたのリンクから参加：{n}', 'Bağlantınla katılan: {n}', '내 링크로 참여: {n}'],
    inv_claim: ['Vyzvednout odměnu', 'Claim reward', '领取奖励', 'इनाम लें', 'Reclamar recompensa', 'Récupérer la récompense', 'استلم المكافأة', 'পুরস্কার নাও', 'Resgatar recompensa', 'Забрать награду', 'انعام لیں', 'Ambil hadiah', 'Belohnung abholen', '報酬を受け取る', 'Ödülü al', '보상 받기'],
    inv_ready: ['Kamarád opravdu hraje – odměna čeká!', 'Your friend is really playing – a reward is waiting!', '好友正在认真游玩——奖励等你领取！', 'आपका दोस्त सच में खेल रहा है – इनाम इंतज़ार कर रहा है!', '¡Tu amigo está jugando de verdad: te espera una recompensa!', 'Ton ami joue vraiment – une récompense t’attend !', 'صديقك يلعب فعلًا – مكافأة بانتظارك!', 'তোমার বন্ধু সত্যিই খেলছে – পুরস্কার অপেক্ষা করছে!', 'Seu amigo está jogando de verdade – uma recompensa espera!', 'Друг правда играет — награда ждёт!', 'آپ کا دوست واقعی کھیل رہا ہے – انعام منتظر ہے!', 'Temanmu benar-benar bermain – hadiah menunggu!', 'Dein Freund spielt wirklich – eine Belohnung wartet!', '友達が本当に遊んでいます――報酬が待っています！', 'Arkadaşın gerçekten oynuyor – ödül seni bekliyor!', '친구가 실제로 플레이 중 – 보상이 기다려요!'],
    inv_max: ['Máš všech {n} odměn. Díky, že šíříš Castle WARS!', 'You have all {n} rewards. Thanks for spreading Castle WARS!', '你已获得全部 {n} 份奖励。感谢你推广 Castle WARS！', 'आपको सभी {n} इनाम मिल गए। Castle WARS फैलाने के लिए धन्यवाद!', 'Tienes las {n} recompensas. ¡Gracias por difundir Castle WARS!', 'Tu as les {n} récompenses. Merci de faire connaître Castle WARS !', 'حصلت على كل المكافآت الـ{n}. شكرًا لنشرك Castle WARS!', 'তুমি সব {n}টি পুরস্কার পেয়েছ। Castle WARS ছড়ানোর জন্য ধন্যবাদ!', 'Você tem todas as {n} recompensas. Obrigado por divulgar Castle WARS!', 'У тебя все {n} наград. Спасибо, что рассказываешь о Castle WARS!', 'آپ کو تمام {n} انعامات مل گئے۔ Castle WARS پھیلانے کا شکریہ!', 'Kamu sudah dapat semua {n} hadiah. Terima kasih sudah menyebarkan Castle WARS!', 'Du hast alle {n} Belohnungen. Danke, dass du Castle WARS teilst!', '{n}個の報酬をすべて獲得。Castle WARS を広めてくれてありがとう！', "{n} ödülün hepsini aldın. Castle WARS'ı yaydığın için teşekkürler!", '보상 {n}개를 모두 받았어요. Castle WARS를 알려줘서 고마워요!'],
    inv_rules: ['Jen herní odměny, žádné peníze. Odměna až když kamarád odehraje {n} bitvy, nejvýš {m} kamarádů. Platí jen pro nové hráče na jiném zařízení.', 'In-game rewards only, never money. You are rewarded once your friend finishes {n} battles, up to {m} friends. Only for new players on another device.', '仅限游戏内奖励，绝无现金。好友完成 {n} 场战斗后发放，最多 {m} 位好友。仅适用于在其他设备上的新玩家。', 'केवल गेम के इनाम, पैसे कभी नहीं। दोस्त के {n} लड़ाइयाँ पूरी करने पर इनाम, अधिकतम {m} दोस्त। केवल दूसरे डिवाइस पर नए खिलाड़ियों के लिए।', 'Solo recompensas del juego, nunca dinero. Recibes la recompensa cuando tu amigo termina {n} batallas, hasta {m} amigos. Solo para jugadores nuevos en otro dispositivo.', 'Récompenses en jeu uniquement, jamais d’argent. Récompense quand ton ami a fini {n} batailles, jusqu’à {m} amis. Uniquement pour de nouveaux joueurs sur un autre appareil.', 'مكافآت داخل اللعبة فقط، وليست أموالًا أبدًا. تُمنح المكافأة عندما يُنهي صديقك {n} معارك، حتى {m} أصدقاء. فقط للاعبين الجدد على جهاز آخر.', 'শুধু গেমের পুরস্কার, কখনো টাকা নয়। বন্ধু {n}টি যুদ্ধ শেষ করলে পুরস্কার, সর্বোচ্চ {m} জন বন্ধু। শুধু অন্য ডিভাইসে নতুন খেলোয়াড়দের জন্য।', 'Só recompensas no jogo, nunca dinheiro. A recompensa vem quando seu amigo termina {n} batalhas, até {m} amigos. Só para novos jogadores em outro dispositivo.', 'Только игровые награды, никаких денег. Награда — когда друг проведёт {n} битвы, максимум {m} друзей. Только для новых игроков на другом устройстве.', 'صرف گیم کے انعامات، کبھی پیسے نہیں۔ دوست کے {n} لڑائیاں مکمل کرنے پر انعام، زیادہ سے زیادہ {m} دوست۔ صرف دوسرے آلے پر نئے کھلاڑیوں کے لیے۔', 'Hanya hadiah dalam game, tidak pernah uang. Hadiah diberikan setelah temanmu menyelesaikan {n} pertempuran, maksimal {m} teman. Hanya untuk pemain baru di perangkat lain.', 'Nur Belohnungen im Spiel, niemals Geld. Belohnung, sobald dein Freund {n} Schlachten gespielt hat, bis zu {m} Freunde. Nur für neue Spieler auf einem anderen Gerät.', 'ゲーム内報酬のみで、お金は一切ありません。友達が{n}回バトルを終えると報酬、最大{m}人まで。別の端末の新規プレイヤーのみ対象。', 'Yalnızca oyun içi ödüller, asla para değil. Arkadaşın {n} savaş bitirince ödül, en fazla {m} arkadaş. Yalnızca başka cihazdaki yeni oyuncular için.', '게임 내 보상만 제공되며 현금은 절대 없습니다. 친구가 전투 {n}회를 마치면 보상, 최대 {m}명. 다른 기기의 신규 플레이어만 해당됩니다.'],
    inv_share_text: ['Zahraj si se mnou Castle WARS – hrad proti hradu! Přes můj odkaz dostaneš dárek na začátek.', 'Play Castle WARS with me – castle vs castle! Use my link to get a starter gift.', '和我一起玩 Castle WARS——城堡对城堡！通过我的链接可获得新手礼物。', 'मेरे साथ Castle WARS खेलें – किले बनाम किला! मेरे लिंक से शुरुआती उपहार पाएँ।', '¡Juega conmigo a Castle WARS, castillo contra castillo! Con mi enlace recibes un regalo de inicio.', 'Joue avec moi à Castle WARS – château contre château ! Avec mon lien, tu reçois un cadeau de départ.', 'العب معي Castle WARS – قلعة ضد قلعة! استخدم رابطي لتحصل على هدية بداية.', 'আমার সাথে Castle WARS খেলো – দুর্গ বনাম দুর্গ! আমার লিংকে শুরুর উপহার পাবে।', 'Jogue Castle WARS comigo – castelo contra castelo! Pelo meu link você ganha um presente inicial.', 'Сыграй со мной в Castle WARS — замок против замка! По моей ссылке получишь стартовый подарок.', 'میرے ساتھ Castle WARS کھیلیں – قلعہ بمقابلہ قلعہ! میرے لنک سے آغاز کا تحفہ پائیں۔', 'Main Castle WARS bersamaku – kastil lawan kastil! Pakai tautanku untuk dapat hadiah awal.', 'Spiel mit mir Castle WARS – Burg gegen Burg! Über meinen Link bekommst du ein Startgeschenk.', '一緒に Castle WARS で遊ぼう――城 vs 城！私のリンクからスターターギフトがもらえるよ。', 'Benimle Castle WARS oyna – kaleye karşı kale! Bağlantımla başlangıç hediyesi al.', '나랑 Castle WARS 하자 – 성 대 성! 내 링크로 시작 선물을 받아.'],
    inv_gift_title: ['Dárek od kamaráda', 'A gift from your friend', '好友赠礼', 'दोस्त का उपहार', 'Un regalo de tu amigo', 'Un cadeau de ton ami', 'هدية من صديقك', 'বন্ধুর উপহার', 'Um presente do seu amigo', 'Подарок от друга', 'دوست کا تحفہ', 'Hadiah dari temanmu', 'Ein Geschenk von deinem Freund', '友達からのギフト', 'Arkadaşından hediye', '친구의 선물'],
    inv_gift_note: ['Odehraj {n} bitvy a kamarád, který tě pozval, dostane odměnu taky.', 'Finish {n} battles and the friend who invited you gets a reward too.', '完成 {n} 场战斗，邀请你的好友也会获得奖励。', '{n} लड़ाइयाँ पूरी करें और आपको बुलाने वाले दोस्त को भी इनाम मिलेगा।', 'Termina {n} batallas y el amigo que te invitó también recibirá una recompensa.', 'Termine {n} batailles et l’ami qui t’a invité sera aussi récompensé.', 'أنهِ {n} معارك وسيحصل صديقك الذي دعاك على مكافأة أيضًا.', '{n}টি যুদ্ধ শেষ করো, যে বন্ধু তোমাকে ডেকেছে সে-ও পুরস্কার পাবে।', 'Termine {n} batalhas e o amigo que te convidou também ganha uma recompensa.', 'Проведи {n} битвы — и друг, который тебя пригласил, тоже получит награду.', '{n} لڑائیاں مکمل کریں اور آپ کو بلانے والے دوست کو بھی انعام ملے گا۔', 'Selesaikan {n} pertempuran dan teman yang mengajakmu juga dapat hadiah.', 'Spiele {n} Schlachten und der Freund, der dich eingeladen hat, bekommt auch eine Belohnung.', '{n}回バトルを終えると、招待してくれた友達にも報酬が届きます。', '{n} savaş bitir, seni davet eden arkadaşın da ödül alsın.', '전투 {n}회를 마치면 초대한 친구도 보상을 받아요.'],
    inv_e_invalid: ['Pozvánka neplatí.', 'This invite link is not valid.', '邀请链接无效。', 'यह आमंत्रण लिंक मान्य नहीं है।', 'Esta invitación no es válida.', 'Cette invitation n’est pas valide.', 'رابط الدعوة غير صالح.', 'এই আমন্ত্রণ লিংক বৈধ নয়।', 'Este convite não é válido.', 'Приглашение недействительно.', 'یہ دعوتی لنک درست نہیں۔', 'Undangan ini tidak berlaku.', 'Diese Einladung ist ungültig.', 'この招待リンクは無効です。', 'Bu davet geçerli değil.', '유효하지 않은 초대 링크입니다.'],
    inv_e_self: ['Vlastní pozvánku použít nejde – pošli ji kamarádovi.', "You can't use your own invite – send it to a friend.", '不能使用自己的邀请——发给好友吧。', 'अपना आमंत्रण खुद इस्तेमाल नहीं कर सकते – दोस्त को भेजें।', 'No puedes usar tu propia invitación: envíasela a un amigo.', 'Tu ne peux pas utiliser ta propre invitation – envoie-la à un ami.', 'لا يمكنك استخدام دعوتك – أرسلها إلى صديق.', 'নিজের আমন্ত্রণ নিজে ব্যবহার করা যায় না – বন্ধুকে পাঠাও।', 'Você não pode usar seu próprio convite – envie a um amigo.', 'Своё приглашение использовать нельзя — отправь его другу.', 'اپنی دعوت خود استعمال نہیں کر سکتے – دوست کو بھیجیں۔', 'Kamu tidak bisa memakai undanganmu sendiri – kirim ke teman.', 'Deine eigene Einladung kannst du nicht nutzen – schick sie einem Freund.', '自分の招待は使えません――友達に送ってね。', 'Kendi davetini kullanamazsın – bir arkadaşına gönder.', '내 초대는 직접 쓸 수 없어요 – 친구에게 보내세요.'],
    inv_e_old: ['Dárek z pozvánky je jen pro nové hráče.', 'The invite gift is only for new players.', '邀请礼物仅限新玩家。', 'आमंत्रण उपहार केवल नए खिलाड़ियों के लिए है।', 'El regalo de invitación es solo para jugadores nuevos.', 'Le cadeau d’invitation est réservé aux nouveaux joueurs.', 'هدية الدعوة للاعبين الجدد فقط.', 'আমন্ত্রণের উপহার শুধু নতুন খেলোয়াড়দের জন্য।', 'O presente de convite é só para novos jogadores.', 'Подарок по приглашению — только для новых игроков.', 'دعوت کا تحفہ صرف نئے کھلاڑیوں کے لیے ہے۔', 'Hadiah undangan hanya untuk pemain baru.', 'Das Einladungsgeschenk gibt es nur für neue Spieler.', '招待ギフトは新規プレイヤー限定です。', 'Davet hediyesi yalnızca yeni oyuncular için.', '초대 선물은 신규 플레이어 전용입니다.'],
    inv_pet: ['Za {n} odměněných kamarádů získáš exkluzivního mazlíčka, kterého jinak mít nejde.', 'Get {n} friends rewarded to unlock an exclusive pet you can’t get any other way.', '成功奖励 {n} 位好友即可解锁专属宠物，别无他法获得。', '{n} दोस्तों का इनाम मिलने पर एक खास पालतू मिलेगा, जो और किसी तरह नहीं मिलता।', 'Consigue la recompensa de {n} amigos y desbloquea una mascota exclusiva que no se obtiene de otra forma.', 'Fais récompenser {n} amis pour débloquer un familier exclusif, impossible à obtenir autrement.', 'احصل على مكافأة {n} أصدقاء لتفتح حيوانًا أليفًا حصريًا لا يمكن الحصول عليه بطريقة أخرى.', '{n} জন বন্ধুর পুরস্কার পেলে একটি এক্সক্লুসিভ পোষা প্রাণী পাবে, যা অন্য কোনোভাবে পাওয়া যায় না।', 'Receba a recompensa de {n} amigos e desbloqueie um mascote exclusivo que não dá para conseguir de outro jeito.', 'Получи награды за {n} друзей — и откроешь эксклюзивного питомца, которого больше никак не достать.', '{n} دوستوں کا انعام ملنے پر ایک خاص پالتو کھلے گا جو کسی اور طرح نہیں ملتا۔', 'Dapatkan hadiah dari {n} teman untuk membuka peliharaan eksklusif yang tidak bisa didapat dengan cara lain.', 'Lass {n} Freunde belohnen und schalte ein exklusives Haustier frei, das es sonst nirgends gibt.', '{n}人分の報酬を受け取ると、ほかでは手に入らない限定ペットが解放されます。', '{n} arkadaşın ödülünü alarak başka yolla elde edilemeyen özel bir evcil hayvanın kilidini aç.', '친구 {n}명 보상을 받으면 다른 방법으로는 얻을 수 없는 전용 펫이 열립니다.'],
    inv_pet_have: ['Exkluzivní mazlíček je tvůj!', 'The exclusive pet is yours!', '专属宠物已归你所有！', 'खास पालतू अब आपका है!', '¡La mascota exclusiva es tuya!', 'Le familier exclusif est à toi !', 'الحيوان الأليف الحصري أصبح لك!', 'এক্সক্লুসিভ পোষা প্রাণী এখন তোমার!', 'O mascote exclusivo é seu!', 'Эксклюзивный питомец твой!', 'خاص پالتو اب آپ کا ہے!', 'Peliharaan eksklusif jadi milikmu!', 'Das exklusive Haustier gehört dir!', '限定ペットを手に入れました！', 'Özel evcil hayvan artık senin!', '전용 펫을 얻었어요!'],
    inv_pet_got: ['Odemkl jsi exkluzivního mazlíčka: {pet}!', 'You unlocked the exclusive pet: {pet}!', '你解锁了专属宠物：{pet}！', 'आपने खास पालतू खोला: {pet}!', '¡Has desbloqueado la mascota exclusiva: {pet}!', 'Tu as débloqué le familier exclusif : {pet} !', 'لقد فتحت الحيوان الأليف الحصري: {pet}!', 'তুমি এক্সক্লুসিভ পোষা প্রাণী আনলক করেছ: {pet}!', 'Você desbloqueou o mascote exclusivo: {pet}!', 'Ты открыл эксклюзивного питомца: {pet}!', 'آپ نے خاص پالتو کھول لیا: {pet}!', 'Kamu membuka peliharaan eksklusif: {pet}!', 'Du hast das exklusive Haustier freigeschaltet: {pet}!', '限定ペットを解放しました：{pet}！', 'Özel evcil hayvanın kilidini açtın: {pet}!', '전용 펫을 잠금 해제했어요: {pet}!'],
    cc_title: ['Kód tvůrce', 'Creator code', '创作者代码', 'क्रिएटर कोड', 'Código de creador', 'Code créateur', 'رمز صانع المحتوى', 'ক্রিয়েটর কোড', 'Código de criador', 'Код автора', 'کریئیٹر کوڈ', 'Kode kreator', 'Creator-Code', 'クリエイターコード', 'İçerik üretici kodu', '크리에이터 코드'],
    cc_hint: ['Hraješ díky youtuberovi nebo streamerovi? Zadej jeho kód a podpoříš ho. Tebe to nic nestojí.', 'Found the game through a YouTuber or streamer? Enter their code to support them. It costs you nothing.', '通过主播或视频作者发现了这款游戏？输入他们的代码来支持他们，你无需花费任何费用。', 'किसी यूट्यूबर या स्ट्रीमर से गेम मिला? उनका कोड डालकर उन्हें सपोर्ट करें। आपको कुछ खर्च नहीं होगा।', '¿Conociste el juego por un youtuber o streamer? Introduce su código para apoyarle. No te cuesta nada.', 'Tu as découvert le jeu grâce à un youtubeur ou streamer ? Entre son code pour le soutenir. Ça ne te coûte rien.', 'هل عرفت اللعبة من يوتيوبر أو صانع بث؟ أدخل رمزه لتدعمه. لن يكلّفك ذلك شيئًا.', 'কোনো ইউটিউবার বা স্ট্রিমারের মাধ্যমে গেমটি পেয়েছ? তাদের কোড দিয়ে সমর্থন করো। তোমার কোনো খরচ নেই।', 'Conheceu o jogo por um youtuber ou streamer? Digite o código dele para apoiá-lo. Não custa nada para você.', 'Узнал об игре от ютубера или стримера? Введи его код, чтобы поддержать его. Тебе это ничего не стоит.', 'کسی یوٹیوبر یا اسٹریمر سے گیم ملا؟ ان کا کوڈ درج کر کے ان کی مدد کریں۔ آپ کا کوئی خرچ نہیں۔', 'Tahu game ini dari YouTuber atau streamer? Masukkan kodenya untuk mendukung mereka. Gratis untukmu.', 'Spiel über einen YouTuber oder Streamer entdeckt? Gib seinen Code ein und unterstütze ihn. Dich kostet das nichts.', 'YouTuber や配信者からこのゲームを知った？コードを入力して応援しよう。あなたの負担はありません。', 'Oyunu bir YouTuber veya yayıncı sayesinde mi buldun? Kodunu girerek onu destekle. Sana hiçbir maliyeti yok.', '유튜버나 스트리머를 통해 게임을 알게 됐나요? 코드를 입력해 응원하세요. 비용은 들지 않아요.'],
    cc_btn: ['Potvrdit', 'Apply', '确认', 'लागू करें', 'Aplicar', 'Valider', 'تطبيق', 'প্রয়োগ করো', 'Aplicar', 'Применить', 'لاگو کریں', 'Terapkan', 'Übernehmen', '適用', 'Uygula', '적용'],
    cc_ok: ['Díky! Podporuješ tvůrce {code}.', 'Thanks! You are supporting creator {code}.', '谢谢！你正在支持创作者 {code}。', 'धन्यवाद! आप क्रिएटर {code} को सपोर्ट कर रहे हैं।', '¡Gracias! Apoyas al creador {code}.', 'Merci ! Tu soutiens le créateur {code}.', 'شكرًا! أنت تدعم صانع المحتوى {code}.', 'ধন্যবাদ! তুমি ক্রিয়েটর {code}-কে সমর্থন করছ।', 'Obrigado! Você apoia o criador {code}.', 'Спасибо! Ты поддерживаешь автора {code}.', 'شکریہ! آپ کریئیٹر {code} کی مدد کر رہے ہیں۔', 'Terima kasih! Kamu mendukung kreator {code}.', 'Danke! Du unterstützt Creator {code}.', 'ありがとう！クリエイター {code} を応援中です。', 'Teşekkürler! {code} adlı üreticiyi destekliyorsun.', '고마워요! 크리에이터 {code}를 응원 중입니다.'],
    cc_on: ['Podporuješ tvůrce', 'Supporting a creator', '正在支持创作者', 'आप एक क्रिएटर को सपोर्ट कर रहे हैं', 'Apoyas a un creador', 'Tu soutiens un créateur', 'أنت تدعم صانع محتوى', 'তুমি একজন ক্রিয়েটরকে সমর্থন করছ', 'Você apoia um criador', 'Ты поддерживаешь автора', 'آپ ایک کریئیٹر کی مدد کر رہے ہیں', 'Kamu mendukung kreator', 'Du unterstützt einen Creator', 'クリエイターを応援中', 'Bir üreticiyi destekliyorsun', '크리에이터 응원 중'],
    cc_bad: ['Takový kód tvůrce neznáme. Zkontroluj ho prosím.', "We don't know this creator code. Please check it.", '未找到该创作者代码，请检查。', 'यह क्रिएटर कोड नहीं मिला। कृपया जाँचें।', 'No conocemos este código de creador. Revísalo.', 'Ce code créateur est inconnu. Vérifie-le.', 'لا نعرف رمز صانع المحتوى هذا. يرجى التحقق منه.', 'এই ক্রিয়েটর কোড খুঁজে পাইনি। একবার দেখে নাও।', 'Não conhecemos este código de criador. Verifique-o.', 'Такой код автора не найден. Проверь его.', 'یہ کریئیٹر کوڈ نہیں ملا۔ براہ کرم چیک کریں۔', 'Kode kreator ini tidak dikenal. Periksa lagi.', 'Diesen Creator-Code kennen wir nicht. Bitte prüfen.', 'このクリエイターコードは見つかりません。確認してください。', 'Bu üretici kodunu tanımıyoruz. Lütfen kontrol et.', '알 수 없는 크리에이터 코드입니다. 확인해 주세요.']
  });

  const SITE = 'https://pracovnitipy.github.io/hrad-proti-hradu/';
  const ART = 'icons/pozvi-art.jpg';   // zasněžená dřevěná pevnost (klíčový obrázek hry)
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n || 0).toLocaleString('cs-CZ');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const PET_N = 5;   // stejně jako REF_PET v js/ui/sireni.js (mazlíček Posel)
  const GIFT_SVG = '<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M18 44h84v46a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z" fill="#c0392b" stroke="#1a0e06" stroke-width="4"/><path d="M12 30h96v16H12z" fill="#e74c3c" stroke="#1a0e06" stroke-width="4" stroke-linejoin="round"/><path d="M52 30h16v66H52z" fill="#ffd24a" stroke="#1a0e06" stroke-width="4"/><path d="M60 30c-6-14-26-22-30-10s20 10 30 10c10 0 34 2 30-10S66 16 60 30z" fill="#ffd24a" stroke="#1a0e06" stroke-width="4" stroke-linejoin="round"/><path d="M26 58l6 6M94 58l-6 6" stroke="#fff3cf" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>';

  /* počkat na účet (host se zakládá ~1,5 s po spuštění) */
  async function token(maxMs) {
    const end = Date.now() + (maxMs || 15000);
    while (Date.now() < end) {
      if (window.Ucet) { if (Ucet.logged()) return true; Ucet.ensure(); }
      await sleep(700);
    }
    return !!(window.Ucet && Ucet.logged());
  }
  const rwHtml = r => `${r && r.gold ? `<span>${ico('coin')} +${fmt(r.gold)}</span>` : ''}${r && r.gems ? `<span>${ico('gem')} +${fmt(r.gems)}</span>` : ''}`;

  const Pozvi = {
    info: null,
    _at: 0,
    _loading: null,
    /* Jediná pozvánka ve hře (stará ?ref= ze sireni.js v138 jen dobíhá, nové se nezapisují). */
    available() { return !window.CW_PORTAL && !!window.Partner; },
    link() { return this.info ? SITE + '?pozvanka=' + encodeURIComponent(this.info.code) : SITE; },

    /* stav ze serveru; při chybě (RPC ještě neexistuje / bez internetu) zůstane funkce skrytá */
    load(force) {
      if (!this.available()) return Promise.resolve(null);
      if (!force && this.info && Date.now() - this._at < 60000) return Promise.resolve(this.info);
      if (this._loading) return this._loading;
      this._loading = (async () => {
        try {
          if (!(await token())) return this.info;
          const r = await Ucet.inviteInfo(Partner.device());
          if (r && r.code) { this.info = r; this._at = Date.now(); this.syncPet(); }
        } catch (e) { /* skryto, dokud server neodpoví */ }
        return this.info;
      })().finally(() => { this._loading = null; });
      return this._loading;
    },

    /* exkluzivní mazlíček Posel za PET_N odměněných kamarádů (počet drží server, odemčení se uloží do save) */
    syncPet() {
      const App = window.App, I = this.info;
      if (!App || !App.save || !I) return;
      const n = Math.max(App.save.pozviRewarded || 0, I.rewarded || 0);
      if (n !== App.save.pozviRewarded) { App.save.pozviRewarded = n; App.persist(); }
      if (window.Sireni && Sireni.checkPet) Sireni.checkPet(App);
    },
    petHtml() {
      const P = window.GameData && GameData.pets && GameData.pets.find(p => p.id === 'posel');
      if (!P) return '';
      const save = window.App && App.save, own = !!(save && (save.petsOwned || []).includes('posel'));
      const have = own ? PET_N : Math.min(PET_N, ((save && save.refCount) || 0) + (this.info.rewarded || 0));
      return `<div class="pozvi-pet${own ? ' on' : ''}"><canvas width="96" height="96" data-pozvi-pet></canvas><div>
        <b>${esc(P.name)}</b><small>${own ? '✓ ' + t('inv_pet_have') : t('inv_pet', { n: PET_N }) + ` (${have} / ${PET_N})`}</small></div></div>`;
    },
    drawPet(root) {
      const G = window.GameData;
      root.querySelectorAll('[data-pozvi-pet]').forEach(cv => {
        if (!G || !G.drawPet) return;
        const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); x.save(); x.translate(48, 54); x.scale(1.2, 1.2);
        try { G.drawPet(x, 'posel', 0.6, false); } catch (e) { /* nic */ }
        x.restore();
      });
    },

    /* hezká karta (modal i profil) */
    cardHtml() {
      const I = this.info; if (!I) return '';
      const done = I.rewarded >= I.limit;
      return `<section class="pozvi-card">
        <div class="pozvi-art"><img src="${ART}" alt="" loading="lazy" decoding="async"><span class="pozvi-gift">${GIFT_SVG}</span></div>
        <div class="pozvi-body">
          <h2>${t('inv_title')}</h2>
          <p class="pozvi-lead">${t('inv_lead', { n: I.need })}</p>
          <div class="pozvi-rw">
            <div><small>${t('inv_friend_gets')}</small><b>${rwHtml(I.gift)}</b></div>
            <div><small>${t('inv_you_get')}</small><b>${rwHtml(I.reward)}</b></div>
          </div>
          ${I.ready > 0 ? `<div class="pozvi-ready"><b>${t('inv_ready')}</b><button class="btn btn-green" data-pozvi-claim>${t('inv_claim')}</button></div>` : ''}
          ${done ? `<p class="pozvi-done">${t('inv_max', { n: I.limit })}</p>` : `
          <div class="code-row pozvi-link"><input readonly value="${esc(this.link())}" aria-label="${t('inv_title')}" data-pozvi-url><button class="btn" data-pozvi-copy>${t('inv_copy')}</button></div>
          <button class="btn btn-gold btn-big pozvi-share" data-pozvi-share>${t('inv_share')}</button>`}
          <div class="pozvi-prog"><div class="lvbar"><i style="width:${Math.min(100, (I.rewarded / I.limit) * 100)}%"></i></div>
            <small>${t('inv_progress', { a: I.rewarded, b: I.limit })} · ${t('inv_joined', { n: I.joined })}</small></div>
          ${this.petHtml()}
          <p class="pozvi-rules">${t('inv_rules', { n: I.need, m: I.limit })}</p>
        </div>
      </section>`;
    },
    bindCard(App, root, after) {
      const url = this.link();
      this.drawPet(root);
      const copy = async () => {
        let ok = false;
        try { await navigator.clipboard.writeText(url); ok = true; } catch (e) {
          const i = root.querySelector('[data-pozvi-url]');
          if (i) { i.select(); try { ok = document.execCommand('copy'); } catch (e2) { ok = false; } }
        }
        App.toast(ok ? t('inv_copied') : url);
        if (window.Stat) try { Stat.ev('invite_copy', {}); } catch (e) { /* nic */ }
      };
      root.querySelectorAll('[data-pozvi-copy]').forEach(b => b.addEventListener('click', copy));
      root.querySelectorAll('[data-pozvi-url]').forEach(i => i.addEventListener('focus', () => i.select()));
      root.querySelectorAll('[data-pozvi-share]').forEach(b => b.addEventListener('click', async () => {
        if (navigator.share) {
          try { await navigator.share({ title: 'Castle WARS', text: t('inv_share_text'), url }); if (window.Stat) try { Stat.ev('invite_share', {}); } catch (e) { /* nic */ } return; }
          catch (e) { if (e && e.name === 'AbortError') return; }
        }
        copy();
      }));
      root.querySelectorAll('[data-pozvi-claim]').forEach(b => b.addEventListener('click', async () => {
        if (b.disabled) return;
        b.disabled = true;
        try {
          const r = await Ucet.inviteClaim();
          await this.load(true);
          if (r && r.n > 0 && r.reward) {
            const got = Shop.grant(App, r.reward);
            App.persist();
            if (after) after();
            Shop.rewardsModal(App, '🎁 ' + t('inv_title'), got, 'tydenni');
          } else { if (after) after(); }
        } catch (e) { b.disabled = false; App.toast(Ucet.errText(e)); }
      }));
    },
    open(App) {
      this.load().then(I => {
        if (!I) return;
        App.modal(`${this.cardHtml()}<div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`, (c, close) => {
          this.bindCard(App, c, () => { close(); this.refreshHome(App); });
        });
      });
    },

    /* tlačítko na domovské obrazovce (vpravo pod Síní slávy), jen když server odpověděl */
    homeButton(App, el) {
      if (!this.available()) return;
      const put = () => {
        const host = el.querySelector('.hero-live');
        if (!this.info || !host || !host.isConnected || host.querySelector('.invite-btn')) return;
        const b = document.createElement('button');
        b.className = 'daily-btn invite-btn';
        b.setAttribute('aria-label', t('inv_title'));
        b.innerHTML = `<span class="daily-chest">${GIFT_SVG}</span><span class="daily-lbl">${t('inv_btn')}</span>${this.info.ready > 0 ? '<i class="daily-dot">!</i>' : ''}`;
        b.addEventListener('click', () => this.open(App));
        host.appendChild(b);
      };
      if (this.info) put();
      this.load().then(() => { const old = el.querySelector('.invite-btn'); if (old && this.info && !old.querySelector('.daily-dot') === this.info.ready > 0) old.remove(); put(); });
    },
    refreshHome(App) {
      const b = document.querySelector('#screen .invite-btn');
      if (b) b.remove();
      if (App.current === 'hrad' && !App.battle) this.homeButton(App, App.screenEl);
    },

    /* sekce v profilu: karta pozvánek (doplní se po odpovědi serveru) + kód tvůrce */
    profileHtml() {
      if (!this.available()) return '';
      return `<div id="pozviSlot">${this.info ? this.cardHtml() : ''}</div>`;
    },
    creatorHtml() {
      if (!window.Partner || !Partner.available()) return '';
      const c = Partner.code(), on = !!Partner.click();
      return `<div class="cc-row"><button class="btn" id="ccBtn">${t('cc_title')}</button>${on ? `<small class="cc-on">✓ ${t('cc_on')}${c ? ' · <b>' + esc(c) + '</b>' : ''}</small>` : ''}</div>`;
    },
    bindProfile(App, el) {
      const slot = el.querySelector('#pozviSlot');
      const fill = () => { if (!slot.isConnected || !this.info) return; slot.innerHTML = this.cardHtml(); this.bindCard(App, slot, fill); };
      if (slot) { if (this.info) this.bindCard(App, slot, fill); this.load().then(fill); }
      const cc = el.querySelector('#ccBtn');
      if (cc) cc.addEventListener('click', () => this.creatorModal(App));
    },
    creatorModal(App) {
      App.modal(`<div class="eyebrow">BrosWars Partner</div><h2>${t('cc_title')}</h2>
        <p class="muted">${t('cc_hint')}</p>
        <div class="code-row"><input id="ccIn" maxlength="40" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${t('cc_title')}"><button class="btn btn-gold" id="ccGo">${t('cc_btn')}</button></div>
        <p class="muted" id="ccMsg"></p>
        <div class="modal-actions"><button class="btn" data-close>${t('back')}</button></div>`, (c, close) => {
        const inp = c.querySelector('#ccIn'), go = c.querySelector('#ccGo'), msg = c.querySelector('#ccMsg');
        const run = async () => {
          if (go.disabled || inp.value.trim().length < 2) return;
          go.disabled = true; msg.textContent = '…'; msg.classList.remove('err');
          const r = await Partner.enterCode(inp.value);
          if (r.ok) { close(); App.toast(t('cc_ok', { code: r.code })); if (App.current === 'profil') App.go('profil', { keepScroll: true }); }
          else { msg.textContent = t(r.err); msg.classList.add('err'); go.disabled = false; }
        };
        go.addEventListener('click', run);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
      });
    },

    /* pozvaný: dárek na začátek (po výběru jazyka a mimo tutoriál/bitvu) */
    async boot(App) {
      if (!this.available() || this._booted) return;
      this._booted = true;
      const inv = Partner.invite();
      if (!inv) return;
      if (App.save.pozvana) { Partner.clearInvite(); return; }
      const end = Date.now() + 10 * 60000;
      while (Date.now() < end && (!App.save.lang || !App.save.langAsked2 || (window.Tutorial && Tutorial.active) || App.battle || !document.getElementById('modal').hidden)) await sleep(1000);
      if (!(await token(30000))) { this._booted = false; return; }   // bez internetu – zkusí se příště
      try {
        const r = await Ucet.inviteAccept(inv.code, Partner.device());
        Partner.clearInvite();
        App.save.pozvana = { at: Date.now(), battles: 0, need: (r && r.need) || 3 };
        const got = Shop.grant(App, (r && r.gift) || {});
        App.persist();
        if (window.Stat) try { Stat.ev('invite_accept', {}); } catch (e) { /* nic */ }
        if (App.current === 'hrad' && !App.battle) App.go('hrad', { keepScroll: true });
        Shop.rewardsModal(App, '🎁 ' + t('inv_gift_title'), got, 'tydenni');
        setTimeout(() => App.toast(t('inv_gift_note', { n: App.save.pozvana.need })), 1200);
      } catch (e) {
        if (e && e.code && e.code !== 'network' && e.code !== 'session_invalid') { Partner.clearInvite(); App.toast(Ucet.errText(e)); }
        else this._booted = false;
      }
    },
    /* pozvaný dohrál bitvu → server počítá (odměna zvoucímu po 3 bitvách) */
    battle(App) {
      const p = App.save && App.save.pozvana;
      if (!p || p.done || !window.Ucet) return;
      Ucet.inviteBattle().then(r => {
        if (!r || r.invited === false) { p.done = true; App.persist(); return; }
        p.battles = r.battles || p.battles; if (r.done) p.done = true;
        App.persist();
      }).catch(() => { /* bez internetu – další bitva se započítá příště */ });
    }
  };
  window.Pozvi = Pozvi;
})();
