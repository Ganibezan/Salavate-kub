# Salavat Bahçesi — Android hazırlığı

Paket: `com.hayrullahbezan.salavatbahcesi` · Android 7.0+ · hedef API 36.

## Derleme

Node 22+, JDK 21 ve Android SDK 36 gereklidir.

```sh
npm ci
npm run android:prepare
cd android
./gradlew assembleDebug
./gradlew bundleRelease -PplayAssetDelivery
```

APK tüm sesleri içerir ve cihazda deneme içindir. Google Play AAB'si 114 sûreyi
kurulum sırasında yüklenen `quran_audio` paketine ayırır; uygulama ilk açılıştan
itibaren çevrimdışı kullanabilir. Sesler ana modülde tekrarlanmaz. Mevlid ve
salavat sesi ana modüldedir. iOS derlemesi ve içeriği değiştirilmedi.

AAB varsayılan olarak imzasızdır. Google Play'e yüklemeden önce geliştiriciye
ait, kalıcı ve güvenli yedeklenmiş yükleme anahtarıyla imzalanmalıdır. Derleme
şu ortam değişkenlerini destekler: ANDROID_KEYSTORE_PATH,
ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD.
Anahtarı veya şifrelerini Git deposuna koymayın.

## Kontroller

- Web hazırlığı 114 sûre dosyasının boyutunu ve MP4 başlığını doğrular.
- `scripts/verify-android.py` AAB'de 114 sûreyi, ana modül sınırını ve Mevlid'i kontrol eder.
- AndroidSmokeTest gerçek Android WebView'unda uygulamanın açılmasını,
  paketlenmiş 114 sese erişimi ve Zikir/Kur'an/Mevlid ekranlarının açılmasını sınar.
- CI emülatörde dört adet 1080×1920 ekran görüntüsü üretir.
- Üretilen AAB/APK ve test ekranları GitHub Actions çıktısında tutulur.

## Yayına kadar kalanlar

- Android derleme ve emülatör kontrolünün başarıyla tamamlanması.
- Güvenli yükleme anahtarı ile AAB imzası, Play Console'a yükleme.
- Test ekranlarının görsel kontrolü ve mağaza girişine eklenmesi.
- En az 12 kişinin e-posta adresi, teste katılımı ve kesintisiz 14 gün test.
- Gerçek kullanım geri bildirimlerine göre düzeltmeler ve üretim erişimi başvurusu.
