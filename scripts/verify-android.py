"""Validate the install-time audio pack and small base module in the Play bundle."""
import sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as bundle:
    names = set(bundle.namelist())
    assert 'base/manifest/AndroidManifest.xml' in names
    assert 'quran_audio/manifest/AndroidManifest.xml' in names
    for n in range(1, 115):
        name = f'quran_audio/assets/public/quran-audio/{n:03}.m4a'
        assert name in names, name
        with bundle.open(name) as audio:
            assert audio.read(12)[4:8] == b'ftyp', name
        assert f'base/assets/public/quran-audio/{n:03}.m4a' not in names
    assert 'base/assets/public/mevlid/recitation.mp3' in names
    base_bytes = sum(info.file_size for info in bundle.infolist() if info.filename.startswith('base/'))
    assert base_bytes < 200 * 1024 * 1024, base_bytes
    print(f'114 sure install-time ses paketinde. Ana modul: {base_bytes / 1024**2:.1f} MiB')
