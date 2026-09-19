# 📱 TimeFlow — Сборка APK

Денежный дашборд как в Android-приложении TimeFlow.

## 🚀 Быстрая сборка APK

### Требования

Перед сборкой убедитесь, что установлены:

1. **Node.js** (v18+) — [скачать](https://nodejs.org/)
2. **Android Studio** — [скачать](https://developer.android.com/studio)
3. **Java JDK 17** (входит в Android Studio)

### Установка Android SDK

После установки Android Studio:
1. Откройте **Android Studio → Settings → Languages & Frameworks → Android SDK**
2. Установите **Android SDK Platform 34** (или последнюю)
3. Установите **Android SDK Build-Tools**
4. Примите лицензии:
```bash
yes | sdkmanager --licenses
```

### Переменные окружения

Добавьте в `~/.bashrc` или `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### Пошаговая сборка

```bash
# 1. Установить зависимости
npm install

# 2. Собрать веб-приложение
npm run build

# 3. Инициализировать Capacitor (если android/ папки нет)
npx cap add android

# 4. Синхронизировать веб-файлы с Android-проектом
npx cap sync android

# 5. Открыть в Android Studio
npx cap open android
```

В Android Studio:
1. Подождите, пока Gradle синхронизируется
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. APK будет в `android/app/build/outputs/apk/debug/app-debug.apk`

### Или через командную строку (без Android Studio):

```bash
cd android
./gradlew assembleDebug
```

APK будет в `android/app/build/outputs/apk/debug/app-debug.apk`

### Для релизной (подписанной) версии:

```bash
cd android
./gradlew assembleRelease
```

Для подписи релизного APK нужно создать keystore:

```bash
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias timeflow
```

Затем в `android/app/build.gradle` добавить:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('release-key.jks')
            storePassword '***'
            keyAlias 'timeflow'
            keyPassword '***'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## 🔄 Быстрый скрипт

Используйте `build-apk.sh` для автоматизации:

```bash
chmod +x build-apk.sh
./build-apk.sh
```

## 📦 Структура проекта

```
├── android/              # Нативный Android-проект (создаётся npx cap add android)
├── dist/                 # Собранный веб-проект
├── src/                  # Исходный код React
├── capacitor.config.ts   # Конфигурация Capacitor
├── package.json
└── README.md
```

## 🎨 Кастомизация

### Изменить название приложения
В `capacitor.config.ts`:
```ts
appName: 'Ваше название',
```

### Изменить package ID
В `capacitor.config.ts`:
```ts
appId: 'com.yourcompany.appname',
```

### Изменить иконку
Замените иконки в `android/app/src/main/res/mipmap-*/ic_launcher.png`

Или используйте плагин `@capacitor/assets`:
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --android
```

## 🐛 Отладка

```bash
# Просмотр логов устройства
npx cap run android --livereload

# Или через adb
adb logcat | grep Capacitor
```

## 📝 Примечания

- Минимальная версия Android: **API 22 (Android 5.1)**
- Целевая версия: **API 34 (Android 14)**
- Размер APK: ~5-8 MB
