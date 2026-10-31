import json
import pathlib
import plistlib
import sys

bundle = pathlib.Path(sys.argv[1])
info = plistlib.loads((bundle / 'Info.plist').read_bytes())
assert info['CFBundleIdentifier'] == 'com.hayrullahbezan.salavatbahcesi'
assert info['NSMicrophoneUsageDescription']
assert (bundle / 'PrivacyInfo.xcprivacy').is_file()
sizes = json.loads((bundle / 'public/quran-audio-manifest.js').read_text().split('=', 1)[1].strip().rstrip(';'))
assert len(sizes) == 114
for number, size in enumerate(sizes, 1):
    data = (bundle / f'public/quran-audio/{number:03d}.m4a').read_bytes()
    assert len(data) == size and data[4:8] == b'ftyp', number
assert (bundle / 'public/mevlid/recitation.mp3').stat().st_size > 1000
print('iPhone uygulaması derlendi. 114 sûre ve Mevlid sesi pakette; kimlik, mikrofon açıklaması ve gizlilik bildirimi doğrulandı.')
