/**
 * withAndroidWidget.js — Expo Config Plugin to register the Android widget.
 *
 * This plugin modifies the Android project during `npx expo prebuild` to:
 * 1. Add <receiver> declaration in AndroidManifest.xml
 * 2. Create res/xml/widget_provider_info.xml
 * 3. Create ALL widget layout XMLs (initial, small, medium, large)
 * 4. Copy Kotlin widget source files into the Android project
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

      // ─── 1.5. Create drawables for translucent backgrounds ───────
      const drawableDir = path.join(androidDir, 'res', 'drawable');
      fs.mkdirSync(drawableDir, { recursive: true });

      // Translucent cream background (75% opacity) with rounded corners
      fs.writeFileSync(path.join(drawableDir, 'widget_bg.xml'), `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#FFF5F0E8" />
    <corners android:radius="24dp" />
</shape>
`);

      // Dark button pill, slightly translucent (90% opacity)
      fs.writeFileSync(path.join(drawableDir, 'widget_pill_bg.xml'), `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#FF1A1A1A" />
    <corners android:radius="16dp" />
</shape>
`);

      // ─── 2. Create ALL layout XML files ─────────────────────────────

      const layoutDir = path.join(androidDir, 'res', 'layout');
      fs.mkdirSync(layoutDir, { recursive: true });

      // --- widget_initial.xml (loading / fallback) ---
      fs.writeFileSync(path.join(layoutDir, 'widget_initial.xml'), `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="@drawable/widget_bg"
    android:gravity="center">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Widget Intelligence"
        android:textSize="14sp"
        android:textColor="#FF1A1A1A"
        android:fontFamily="sans-serif-medium" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Loading..."
        android:textSize="12sp"
        android:textColor="#FF6B6560"
        android:layout_marginTop="4dp" />

</LinearLayout>
`);

      // --- widget_small.xml (2×1 or 2×2) ---
      fs.writeFileSync(path.join(layoutDir, 'widget_small.xml'), `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="@drawable/widget_bg"
    android:gravity="center_vertical">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical">

        <TextView
            android:id="@+id/widget_unread_count"
            android:layout_width="36dp"
            android:layout_height="36dp"
            android:gravity="center"
            android:text="0"
            android:textSize="16sp"
            android:textColor="#FFF5F0E8"
            android:background="@drawable/widget_pill_bg"
            android:fontFamily="sans-serif-medium" />

        <TextView
            android:id="@+id/widget_unread_label"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginStart="12dp"
            android:text="Unread messages"
            android:textSize="14sp"
            android:textColor="#FF1A1A1A"
            android:fontFamily="sans-serif" />
    </LinearLayout>

    <TextView
        android:id="@+id/widget_action_open"
        android:layout_width="match_parent"
        android:layout_height="36dp"
        android:layout_marginTop="12dp"
        android:gravity="center"
        android:text="Open Chat"
        android:textSize="13sp"
        android:textColor="#FFF5F0E8"
        android:background="@drawable/widget_pill_bg"
        android:fontFamily="sans-serif-medium"
        android:clickable="true" />

</LinearLayout>
`);

      // --- widget_medium.xml (4×2) ---
      fs.writeFileSync(path.join(layoutDir, 'widget_medium.xml'), `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="@drawable/widget_bg">

    <!-- Header row: unread count + timestamp -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical">

        <TextView
            android:id="@+id/widget_unread_count"
            android:layout_width="32dp"
            android:layout_height="32dp"
            android:gravity="center"
            android:text="0"
            android:textSize="15sp"
            android:textColor="#FFF5F0E8"
            android:background="@drawable/widget_pill_bg"
            android:fontFamily="sans-serif-medium" />

        <TextView
            android:id="@+id/widget_unread_label"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="10dp"
            android:text="Unread messages"
            android:textSize="14sp"
            android:textColor="#FF1A1A1A" />

        <TextView
            android:id="@+id/widget_timestamp"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text=""
            android:textSize="11sp"
            android:textColor="#FF6B6560" />
    </LinearLayout>

    <!-- Message preview section -->
    <LinearLayout
        android:id="@+id/widget_preview_section"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:layout_marginTop="12dp"
        android:visibility="gone">

        <TextView
            android:id="@+id/widget_sender"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textSize="13sp"
            android:textColor="#FF1A1A1A"
            android:fontFamily="sans-serif-medium" />

        <TextView
            android:id="@+id/widget_snippet"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="2dp"
            android:textSize="13sp"
            android:textColor="#FF6B6560"
            android:maxLines="2"
            android:ellipsize="end" />
    </LinearLayout>

    <!-- Action buttons -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginTop="12dp"
        android:gravity="center_vertical">

        <TextView
            android:id="@+id/widget_action_reply"
            android:layout_width="wrap_content"
            android:layout_height="34dp"
            android:paddingStart="20dp"
            android:paddingEnd="20dp"
            android:gravity="center"
            android:text="Reply"
            android:textSize="13sp"
            android:textColor="#FFF5F0E8"
            android:background="@drawable/widget_pill_bg"
            android:fontFamily="sans-serif-medium"
            android:clickable="true" />

        <TextView
            android:id="@+id/widget_action_open"
            android:layout_width="wrap_content"
            android:layout_height="34dp"
            android:layout_marginStart="8dp"
            android:paddingStart="20dp"
            android:paddingEnd="20dp"
            android:gravity="center"
            android:text="Open"
            android:textSize="13sp"
            android:textColor="#FF1A1A1A"
            android:fontFamily="sans-serif-medium"
            android:clickable="true" />
    </LinearLayout>

</LinearLayout>
`);

      // --- widget_large.xml (4×4) ---
      fs.writeFileSync(path.join(layoutDir, 'widget_large.xml'), `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="@drawable/widget_bg">

    <!-- Header: unread + timestamp -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical">

        <TextView
            android:id="@+id/widget_unread_count"
            android:layout_width="32dp"
            android:layout_height="32dp"
            android:gravity="center"
            android:text="0"
            android:textSize="15sp"
            android:textColor="#FFF5F0E8"
            android:background="@drawable/widget_pill_bg"
            android:fontFamily="sans-serif-medium" />

        <TextView
            android:id="@+id/widget_unread_label"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="10dp"
            android:text="Unread messages"
            android:textSize="14sp"
            android:textColor="#FF1A1A1A" />

        <TextView
            android:id="@+id/widget_timestamp"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textSize="11sp"
            android:textColor="#FF6B6560" />
    </LinearLayout>

    <!-- Message preview -->
    <LinearLayout
        android:id="@+id/widget_preview_section"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:layout_marginTop="12dp"
        android:visibility="gone">

        <TextView
            android:id="@+id/widget_sender"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textSize="13sp"
            android:textColor="#FF1A1A1A"
            android:fontFamily="sans-serif-medium" />

        <TextView
            android:id="@+id/widget_snippet"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="2dp"
            android:textSize="13sp"
            android:textColor="#FF6B6560"
            android:maxLines="2"
            android:ellipsize="end" />

        <!-- Action buttons -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="8dp">

            <TextView
                android:id="@+id/widget_action_reply"
                android:layout_width="wrap_content"
                android:layout_height="34dp"
                android:paddingStart="20dp"
                android:paddingEnd="20dp"
                android:gravity="center"
                android:text="Reply"
                android:textSize="13sp"
                android:textColor="#FFF5F0E8"
                android:background="@drawable/widget_pill_bg"
                android:fontFamily="sans-serif-medium"
                android:clickable="true" />

            <TextView
                android:id="@+id/widget_action_open"
                android:layout_width="wrap_content"
                android:layout_height="34dp"
                android:layout_marginStart="8dp"
                android:paddingStart="20dp"
                android:paddingEnd="20dp"
                android:gravity="center"
                android:text="Open"
                android:textSize="13sp"
                android:textColor="#FF1A1A1A"
                android:fontFamily="sans-serif-medium"
                android:clickable="true" />
        </LinearLayout>
    </LinearLayout>

    <!-- Divider -->
    <View
        android:layout_width="match_parent"
        android:layout_height="1dp"
        android:layout_marginTop="12dp"
        android:layout_marginBottom="12dp"
        android:background="#FFE0DAD0" />

    <!-- Event section -->
    <LinearLayout
        android:id="@+id/widget_event_section"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:visibility="gone">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="📅"
            android:textSize="18sp" />

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:orientation="vertical"
            android:layout_marginStart="10dp">

            <TextView
                android:id="@+id/widget_event_title"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textSize="13sp"
                android:textColor="#FF1A1A1A"
                android:fontFamily="sans-serif-medium" />

            <TextView
                android:id="@+id/widget_event_time"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textSize="11sp"
                android:textColor="#FF6B6560" />
        </LinearLayout>
    </LinearLayout>

    <!-- Health section -->
    <LinearLayout
        android:id="@+id/widget_health_section"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:layout_marginTop="8dp"
        android:visibility="gone">

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="😴"
            android:textSize="18sp" />

        <TextView
            android:id="@+id/widget_health_message"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginStart="10dp"
            android:textSize="13sp"
            android:textColor="#FF6B6560" />
    </LinearLayout>

    <!-- Divider -->
    <View
        android:layout_width="match_parent"
        android:layout_height="1dp"
        android:layout_marginTop="12dp"
        android:layout_marginBottom="12dp"
        android:background="#FFE0DAD0" />

    <!-- Suggestion section -->
    <LinearLayout
        android:id="@+id/widget_suggestion_section"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="12dp"
        android:background="#FFFFFFFF"
        android:visibility="gone">

        <TextView
            android:id="@+id/widget_suggestion_source"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textSize="10sp"
            android:textColor="#FF6B6560"
            android:fontFamily="sans-serif-medium"
            android:textAllCaps="true"
            android:letterSpacing="0.08" />

        <TextView
            android:id="@+id/widget_suggestion_message"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="4dp"
            android:textSize="13sp"
            android:textColor="#FF1A1A1A"
            android:fontFamily="sans-serif"
            android:textStyle="italic" />
    </LinearLayout>

</LinearLayout>
`);

      // ─── 3. Add widget_description string ───────────────────────────

      const valuesDir = path.join(androidDir, 'res', 'values');
      fs.mkdirSync(valuesDir, { recursive: true });

      const widgetStringsPath = path.join(valuesDir, 'widget_strings.xml');
      fs.writeFileSync(widgetStringsPath, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="widget_description">quiet, contextual awareness — shows unread messages, upcoming events, and smart suggestions</string>
</resources>
`);

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
          console.log(`[withAndroidWidget] Copied ${file}`);
        } else {
          console.warn(`[withAndroidWidget] WARNING: ${file} not found at ${sourcePath}`);
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
        console.log(`[withAndroidWidget] Copied ${bridgeFile}`);
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
