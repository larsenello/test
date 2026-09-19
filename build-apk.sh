#!/bin/bash

# ============================================================
# 📱 TimeFlow — Скрипт сборки APK
# ============================================================
# Использование: ./build-apk.sh [--release] [--livereload]
# ============================================================

set -e

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Флаги
RELEASE=false
LIVERELOAD=false

for arg in "$@"; do
  case $arg in
    --release) RELEASE=true ;;
    --livereload) LIVERELOAD=true ;;
    *) echo "Неизвестный аргумент: $arg"; exit 1 ;;
  esac
done

echo -e "${BLUE}"
echo "╔══════════════════════════════════════╗"
echo "║   📱 TimeFlow APK Builder           ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js не установлен! Установите с https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm не установлен!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm: $(npm -v)${NC}"

# Проверка Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java не установлена! Установите JDK 17+${NC}"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
echo -e "${GREEN}✅ Java: $JAVA_VERSION${NC}"

# Проверка ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    elif [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    else
        echo -e "${YELLOW}⚠️  ANDROID_HOME не установлен. Установите Android Studio.${NC}"
        echo -e "${YELLOW}   Затем добавьте в ~/.bashrc:${NC}"
        echo -e "${YELLOW}   export ANDROID_HOME=\$HOME/Android/Sdk${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ ANDROID_HOME: $ANDROID_HOME${NC}"

# Проверка adb
if [ ! -f "$ANDROID_HOME/platform-tools/adb" ]; then
    echo -e "${YELLOW}⚠️  Android SDK Platform Tools не найдены${NC}"
    echo -e "${YELLOW}   Установите через Android Studio → SDK Manager${NC}"
fi

echo ""
echo -e "${BLUE}📦 Шаг 1/5: Установка зависимостей...${NC}"
npm install

echo ""
echo -e "${BLUE}🔨 Шаг 2/5: Сборка веб-приложения...${NC}"
npm run build

echo ""
echo -e "${BLUE}📱 Шаг 3/5: Инициализация Capacitor...${NC}"
if [ ! -d "android" ]; then
    echo "   Добавляю Android-платформу..."
    npx cap add android
else
    echo "   Android-платформа уже существует"
fi

echo ""
echo -e "${BLUE}🔄 Шаг 4/5: Синхронизация файлов...${NC}"
npx cap sync android

if [ "$LIVERELOAD" = true ]; then
    echo ""
    echo -e "${BLUE}🔴 Запуск в режиме Live Reload...${NC}"
    npx cap run android --livereload
    exit 0
fi

echo ""
echo -e "${BLUE}🏗️  Шаг 5/5: Сборка APK...${NC}"

cd android

if [ "$RELEASE" = true ]; then
    echo -e "${YELLOW}   Сборка RELEASE APK...${NC}"
    chmod +x gradlew
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
else
    echo -e "${GREEN}   Сборка DEBUG APK...${NC}"
    chmod +x gradlew
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════╗"
echo "║   ✅ APK успешно собран!             ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

if [ -f "android/$APK_PATH" ]; then
    APK_SIZE=$(du -h "android/$APK_PATH" | cut -f1)
    echo -e "${GREEN}📍 Путь: android/$APK_PATH${NC}"
    echo -e "${GREEN}📏 Размер: $APK_SIZE${NC}"
    echo ""
    echo -e "${BLUE}📲 Установить на устройство?${NC}"
    echo "   adb install android/$APK_PATH"
    echo ""
    echo -e "${YELLOW}💡 Для релизной подписи создайте keystore:${NC}"
    echo "   keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias timeflow"
else
    echo -e "${RED}❌ APK не найден по пути: android/$APK_PATH${NC}"
fi
