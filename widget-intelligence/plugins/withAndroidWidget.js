/**
 * withAndroidWidget.js — Expo Config Plugin to register the Android widget.
 *
 * This plugin modifies the Android project during `npx expo prebuild` to:
 * 1. Add <receiver> declaration in AndroidManifest.xml
 * 2. Create res/xml/widget_provider_info.xml
 * 3. Create res/layout/widget_initial.xml
 * 4. Copy Kotlin widget source files into the Android project
 *
 * Without this plugin, the widget Kotlin code exists but Android
 * has no idea it's there — it never shows in the widget picker.
 */

const {
  withAndroidManifest,
  withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Add the <receiver> block to AndroidManifest.xml
 */
function withWidgetReceiver(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];

    if (!application) return config;

    // Initialize receiver array if it doesn't exist
    if (!application.receiver) {
      application.receiver = [];
    }

    // Check if our receiver is already registered
    const exists = application.receiver.some(
      (r) => r.$?.['android:name'] === '.widget.WidgetReceiver'
    );

    if (!exists) {
      application.receiver.push({
        $: {
          'android:name': '.widget.WidgetReceiver',
          'android:exported': 'true',
          'android:label': 'Widget Intelligence',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.appwidget.action.APPWIDGET_UPDATE',
                },
              },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/widget_provider_info',
            },
          },
        ],
      });
    }

    return config;
  });
}

/**
 * Create XML resources and copy Kotlin source files
 */
function withWidgetResources(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidDir = path.join(projectRoot, 'android', 'app', 'src', 'main');
      const packageName = config.android?.package || 'com.widget.intelligence';
      const packagePath = packageName.replace(/\./g, '/');

      // ─── 1. Create res/xml/widget_provider_info.xml ─────────────────

      const xmlDir = path.join(androidDir, 'res', 'xml');
      fs.mkdirSync(xmlDir, { recursive: true });

      const widgetProviderXml = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="110dp"
    android:minHeight="40dp"
    android:minResizeWidth="110dp"
    android:minResizeHeight="40dp"
    android:targetCellWidth="2"
    android:targetCellHeight="1"
    android:maxResizeWidth="530dp"
    android:maxResizeHeight="450dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_initial"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:previewLayout="@layout/widget_initial"
    android:description="@string/widget_description" />
`;
      fs.writeFileSync(path.join(xmlDir, 'widget_provider_info.xml'), widgetProviderXml);

      // ─── 2. Create res/layout/widget_initial.xml ────────────────────

      const layoutDir = path.join(androidDir, 'res', 'layout');
      fs.mkdirSync(layoutDir, { recursive: true });

      const widgetInitialXml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="#FFF5F0E8"
    android:gravity="center">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="widget intelligence"
        android:textSize="14sp"
        android:textColor="#FF1A1A1A"
        android:fontFamily="sans-serif-light" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="loading..."
        android:textSize="12sp"
        android:textColor="#FF6B6560"
        android:layout_marginTop="4dp" />

</LinearLayout>
`;
      fs.writeFileSync(path.join(layoutDir, 'widget_initial.xml'), widgetInitialXml);

      // ─── 3. Add widget_description string ───────────────────────────

      const valuesDir = path.join(androidDir, 'res', 'values');
      fs.mkdirSync(valuesDir, { recursive: true });

      const widgetStringsPath = path.join(valuesDir, 'widget_strings.xml');
      const widgetStringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="widget_description">quiet, contextual awareness — shows unread messages, upcoming events, and smart suggestions</string>
</resources>
`;
      fs.writeFileSync(widgetStringsPath, widgetStringsXml);

      // ─── 4. Copy Kotlin widget source files ─────────────────────────

      const widgetSourceDir = path.join(projectRoot, 'android-widget');
      const targetWidgetDir = path.join(androidDir, 'java', packagePath, 'widget');
      fs.mkdirSync(targetWidgetDir, { recursive: true });

      const kotlinFiles = [
        'GlanceWidget.kt',
        'SmallWidget.kt',
        'MediumWidget.kt',
        'LargeWidget.kt',
        'WidgetReceiver.kt',
        'PeriodicRefreshWorker.kt',
      ];

      for (const file of kotlinFiles) {
        const sourcePath = path.join(widgetSourceDir, file);
        const targetPath = path.join(targetWidgetDir, file);
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, targetPath);
        }
      }

      // ─── 5. Copy bridge module source files ─────────────────────────

      const bridgeSourceDir = path.join(projectRoot, 'modules', 'widget-bridge', 'android');
      const targetBridgeDir = path.join(androidDir, 'java', packagePath, 'bridge');
      fs.mkdirSync(targetBridgeDir, { recursive: true });

      const bridgeFile = 'WidgetBridgeModule.kt';
      const bridgeSource = path.join(bridgeSourceDir, bridgeFile);
      const bridgeTarget = path.join(targetBridgeDir, bridgeFile);
      if (fs.existsSync(bridgeSource)) {
        fs.copyFileSync(bridgeSource, bridgeTarget);
      }

      return config;
    },
  ]);
}

/**
 * Main plugin entrypoint
 */
function withAndroidWidget(config) {
  config = withWidgetReceiver(config);
  config = withWidgetResources(config);
  return config;
}

module.exports = withAndroidWidget;
