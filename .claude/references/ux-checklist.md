# UX Reviewer Checklist

ux-reviewer agent'ının ihtiyaç duyduğunda okuduğu tam kontrol listesi.
Workflow ve çıktı formatı için `agents/ux-reviewer.md`'ye bak.

---

## Bölüm 1 — Heuristic Ağırlıklandırması (Brief'e Göre)

Tüm heuristic'leri her ürün tipinde eşit ağırlıkla uygulamak yanıltıcı sonuç verir.
Brief'teki ürün tipini belirle, aşağıdaki tablodan birincil ve ikincil heuristic'leri seç.

| Ürün Tipi | Birincil (mutlaka kontrol) | İkincil (mümkünse kontrol) |
|---|---|---|
| SaaS / Dashboard | H1, H4, H6, H9 | H3, H5, H8 |
| E-ticaret | H5, H9, H3 | H1, H4, H2 |
| Portfolio / Marketing | H8, H2 | H4, H1 |
| Onboarding / Kayıt akışı | H1, H5, H10 | H3, H9 |
| Mobil uygulama | H1, H3, H4 | H5, H6, H8 |
| Form ağırlıklı | H5, H9, H8 | H1, H6, H10 |

Ürün tipi spec.md'deki "Amaç ve Kapsam" bölümünden çıkarılır.
Belirsizse tüm heuristic'leri uygula, birincil olanları `[KRİTİK]` olarak işaretle.

---

## Bölüm 2 — Nielsen'in 10 Heuristic'i

Her heuristic için: önce HTML/Figma çıktısında somut kanıt ara, sonra değerlendir.
Kanıt olmadan "geçti" veya "kaldı" yazma.

### H1 — Sistem Durumunun Görünürlüğü
Kullanıcı sistemin ne yaptığını her an biliyor mu?

- [ ] Yükleniyor durumu var mı? (skeleton loader veya spinner — generic spinner değil, layout'a uygun)
- [ ] Aktif / seçili durum görsel olarak belirgin mi?
- [ ] Çok adımlı akışlarda progress indicator mevcut mu?
- [ ] Form gönderimi veya işlem sonrası kullanıcıya geri bildirim var mı?
- [ ] Async işlemler sırasında arayüz kilitlenmeden geri bildirim veriyor mu?

### H2 — Gerçek Dünya ile Eşleşme
Sistem kullanıcının diline ve zihinsel modeline konuşuyor mu?

- [ ] Label ve başlıklar teknik jargon içermiyor mu? (kullanıcının değil, geliştiricinin dili)
- [ ] İkonlar yaygın / evrensel anlamlarıyla kullanılmış mı?
- [ ] Tarih, saat, para birimi formatları hedef kitleye uygun mu?
- [ ] Metaforlar gerçek dünya davranışıyla örtüşüyor mu? (örn. "çöp kutusu" silmek için)

### H3 — Kullanıcı Kontrolü ve Özgürlüğü
Kullanıcı yanlış bir şeye bastığında geri dönebiliyor mu?

- [ ] Yıkıcı işlemler (silme, iptal etme) için onay adımı var mı?
- [ ] Geri alma (undo) seçeneği mevcut mu — en azından kritik işlemlerde?
- [ ] Akıştan çıkış net mi? (modal veya wizard'dan çıkış yolu açık)
- [ ] Kaydetme olmadan çıkışta uyarı gösteriliyor mu?

### H4 — Tutarlılık ve Standartlar
Aynı işlev her yerde aynı görünüyor ve davranıyor mu?

- [ ] Aynı anlamdaki elementler (buton, link, badge) tutarlı stillenmiş mi?
- [ ] Platform konvansiyonları takip ediliyor mu? (link = mavi/altı çizili veya belirgin renk, buton = tıklanabilir görünüm)
- [ ] İkon ailesi tek bir kütüphaneden mi?
- [ ] Terminoloji tutarlı mı? ("kaydet" mi, "onayla" mı — bir yerde değil mi iki yerde?)
- [ ] Renk semantiği tutarlı mı? (kırmızı = hata, yeşil = başarı her yerde)

### H5 — Hata Önleme
Sistem kullanıcının hata yapmasını baştan engelliyor mu?

- [ ] Form alanları için tip kısıtı var mı? (tarih için datepicker, seçenekler için dropdown)
- [ ] Zorunlu alanlar açıkça belirtilmiş mi?
- [ ] Geri döndürülemeyen işlemler önceden uyarıyor mu?
- [ ] Placeholder veya örnek değer kullanıcıyı yönlendiriyor mu?
- [ ] Aynı anda iki kritik buton yan yana değil mi? (örn. "Kaydet" ve "Sil" bitişik)

### H6 — Tanıma, Hatırlama Değil
Kullanıcı bir şeyi yapmak için hafızasına güvenmek zorunda kalıyor mu?

- [ ] Seçenekler görünür mü — gizli menü arkasında değil?
- [ ] Bağlam korunuyor mu? (başka sayfaya gidip döndüğünde veri / konum sıfırlanmıyor)
- [ ] Önceki işlemler / son görüntülenenler erişilebilir mi?
- [ ] İkonlar label olmadan anlamlı mı? (icon-only butonlarda tooltip var mı?)

### H7 — Esneklik ve Verimlilik
Deneyimli kullanıcı için kısayol var mı?

- [ ] Klavye navigasyonu tam çalışıyor mu? (tab sırası mantıklı)
- [ ] Tekrarlayan görevler için varsayılan değerler akıllıca seçilmiş mi?
- [ ] Desktop'ta kısayol tuşu veya bulk işlem var mı?
- [ ] Arama / filter hızlı erişilebilir mi?

### H8 — Estetik ve Minimalist Tasarım
Dikkat dağıtan, alakasız bilgi var mı?

- [ ] Her ekranda bir birincil CTA var mı? (birden fazla "ana eylem" çatışıyor mu)
- [ ] Görsel hiyerarşi net mi? (en önemli şey gözü önce çekiyor mu)
- [ ] Gereksiz dekorasyon, anlamsız bilgi yok mu?
- [ ] Bir sayfada kaç farklı font büyüklüğü, renk ve ağırlık var? (> 5 ise hiyerarşi bozuk)
- [ ] Whitespace yeterli mi — elementler birbirine sıkışmış mı?

### H9 — Hata Tanıma, Teşhis ve Kurtarma
Kullanıcı bir hatayla karşılaştığında ne yapacağını biliyor mu?

- [ ] Hata mesajları düz dilde mi? ("Error 422" değil, "E-posta adresi geçersiz")
- [ ] Hata mesajları çözüm öneriyor mu? ("Geçerli bir e-posta girin: ornek@domain.com")
- [ ] Hata, sorunun yaşandığı yerin hemen yanında mı gösteriliyor?
- [ ] Genel hata mesajları (toast) spesifik mi, jenerik değil mi?

### H10 — Yardım ve Dokümantasyon
Kullanıcı takılırsa nereye bakacak?

- [ ] Karmaşık alanlarda tooltip veya helper text var mı?
- [ ] Boş durumlar (empty state) kullanıcıya ne yapması gerektiğini anlatıyor mu?
- [ ] İlk kullanımda onboarding ipucu veya rehber var mı? (gerekiyorsa)

---

## Bölüm 3 — Component Binding Kontrolü

Token sistemiyle bağlantının doğrulanması. `design-reviewer` token değer eşleşmesini
kontrol eder; burada binding mekanizması kontrol edilir.

### HTML Modu

```bash
# Hardcode renk değeri var mı?
grep -rn "color: #\|background: #\|background-color: #\|border-color: #" components/ screens/

# Hardcode font büyüklüğü var mı?
grep -rn "font-size: [0-9]\|line-height: [0-9]\." components/ screens/

# Inline style kullanımı var mı?
grep -rn 'style="' components/ screens/
```

Çıktı değerlendirmesi:
- [ ] Renk değerleri `var(--color-*)` formatında mı, hardcode değil mi?
- [ ] Tipografi değerleri `var(--font-*)` veya `var(--text-*)` formatında mı?
- [ ] Spacing değerleri token tabanlı mı (`var(--space-*)` veya Tailwind token class'ları)?
- [ ] Inline style kullanımı yok mu? (varsa her biri için gerekçe istenir)
- [ ] Kullanılan CSS custom property'ler token JSON'daki key'lerle eşleşiyor mu?

### Figma Modu

`get_design_context` çıktısında kontrol et:

- [ ] Fill değerleri Figma variable'a bağlı mı? (detach edilmiş renk yok mu)
- [ ] Text stilleri tanımlı Typography style'lardan mı geliyor?
- [ ] Spacing / padding değerleri layout variable'lardan mı?
- [ ] Component instance'lar master component'tan mı türüyor, kopya mı?
- [ ] Variable collection token JSON'daki koleksiyonlarla eşleşiyor mu?
  (Primitives / Color / Typography / Layout / Component)

---

## Bölüm 4 — WCAG 2.2 POUR — axe-core'un Yakalamadıkları

axe-core WCAG AA'nın yaklaşık %40'ını otomatik yakalar. Aşağıdakiler manuel kontroldür.

### Perceivable (Algılanabilir)

- [ ] Renk tek başına anlam taşıyor mu? (kırmızı = hata ama ikon veya metin de var mı?)
- [ ] Dekoratif görseller `alt=""` ile işaretlenmiş mi, anlamlı görsellerin alt text'i var mı?
- [ ] Metin içeren görseller varsa metin ayrıca sağlanıyor mu?

### Operable (İşletilebilir)

- [ ] Tab sırası mantıklı mı? (görsel sırayla DOM sırası örtüşüyor mu)
- [ ] Focus her zaman görünür mü? (sadece `outline: none` kaldırılmamış mı)
- [ ] Touch target boyutları ≥ 44×44px mi? (mobile brief'lerde zorunlu)
- [ ] Sadece hover ile erişilebilen içerik var mı? (varsa klavye alternatifi gerekli)
- [ ] Zaman kısıtlaması olan işlem varsa kullanıcı uzatabilmeli

### Understandable (Anlaşılır)

- [ ] Anlamlı link metni var mı? ("Buraya tıkla", "Daha fazla" yerine ne olduğu belirtilmeli)
- [ ] Başlık hiyerarşisi doğru mu? (h1 → h2 → h3, atlanmamış)
- [ ] Form label'ları input'larla programatik ilişkili mi? (`for`/`id` veya `aria-labelledby`)
- [ ] Hata mesajları hangi alanda hata olduğunu belirtiyor mu?

### Robust (Sağlam)

- [ ] Semantic HTML kullanılmış mı? (button için `<button>`, navigasyon için `<nav>`)
- [ ] ARIA kullanımı doğru mu? (varsa `aria-label`, `aria-describedby`, `role` değerleri)
- [ ] `aria-*` attribute'ları gereksiz yere kullanılmamış mı? (native HTML yeterince semantikse ARIA gereksiz)

---

## Bölüm 5 — Mobil Kontroller (Mobile Brief'lerde)

Spec'te platform "mobile" veya "her ikisi" ise bu bölümü uygula.

- [ ] Touch target minimum boyutu: her interaktif element ≥ 44×44px
- [ ] iOS safe area inset'leri (`env(safe-area-inset-*)`) uygulanmış mı?
- [ ] Alt navigasyon ≤ 5 öğe mi?
- [ ] Yalnızca hover'a bağımlı etkileşim yok mu?
- [ ] Swipe gesture varsa görsel affordance mevcut mu?
- [ ] Klavye açıldığında kritik alanlar (form CTA'sı) görünür kalıyor mu?
- [ ] Landscape modunda layout bozulmuyor mu?

---

## Önem Derecesi Tanımları

| Önem | Ne zaman kullanılır |
|---|---|
| `engelleyici` | Kullanıcı görevi tamamlayamaz, erişilebilirlik ihlali, token binding tamamen kopuk |
| `major` | Kullanıcı deneyimini ciddi ölçüde kötüleştirir ama tamamlamayı engellemez |
| `minor` | İyileştirme önerisi, kullanım kalitesini etkiler ama kritik değil |
