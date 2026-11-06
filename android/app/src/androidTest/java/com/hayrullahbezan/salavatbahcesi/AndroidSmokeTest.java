package com.hayrullahbezan.salavatbahcesi;

import android.graphics.Bitmap;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class AndroidSmokeTest {
    private ActivityScenario<MainActivity> scenario;
    private String js(String code) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> value = new AtomicReference<>();
        scenario.onActivity(activity -> activity.getBridge().getWebView().evaluateJavascript(code, result -> {
            value.set(result); latch.countDown();
        }));
        assertTrue("WebView did not respond", latch.await(10, TimeUnit.SECONDS));
        return value.get();
    }
    private void ready(String expression) throws Exception {
        long deadline = System.currentTimeMillis() + 30000;
        do {
            if ("true".equals(js(expression))) return;
            Thread.sleep(250);
        } while (System.currentTimeMillis() < deadline);
        fail("Screen did not become ready: " + expression);
    }
    private void screenshot(String name) throws Exception {
        InstrumentationRegistry.getInstrumentation().waitForIdleSync();
        Thread.sleep(1500); // Allow web fonts and two animation frames to settle.
        File directory = new File(InstrumentationRegistry.getInstrumentation().getTargetContext().getExternalFilesDir(null), "screenshots");
        assertTrue(directory.isDirectory() || directory.mkdirs());
        Bitmap bitmap = InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
        assertNotNull(bitmap);
        try (FileOutputStream out = new FileOutputStream(new File(directory, name + ".png"))) {
            assertTrue(bitmap.compress(Bitmap.CompressFormat.PNG, 100, out));
        }
        bitmap.recycle();
    }
    @Test public void offlineAssetsAndCoreScreens() throws Exception {
        // The app must contain every Quran recording before it calls them offline-ready.
        for (int n=1; n<=114; n++) {
            try (InputStream in = InstrumentationRegistry.getInstrumentation().getTargetContext().getAssets().open(String.format(java.util.Locale.ROOT,"public/quran-audio/%03d.m4a", n))) {
                assertEquals("Missing audio header for surah " + n, 12, in.read(new byte[12]));
            }
        }
        scenario = ActivityScenario.launch(MainActivity.class);
        try {
            ready("document.readyState === 'complete' && typeof window.openDevotional === 'function'");
            ready("!!window.Capacitor && window.Capacitor.getPlatform() === 'android'");
            screenshot("01-salavat");
            for (String[] screen : new String[][]{{"openDhikr","dhikr","02-zikir"},{"openListening","listening","03-kuran"},{"openMawlid","mawlid","04-mevlid"}}) {
                js("document.getElementById('" + screen[0] + "').click(); true");
                ready("window.getDevotionalMode() === '" + screen[1] + "'");
                screenshot(screen[2]);
            }
        } finally { scenario.close(); }
    }
}
