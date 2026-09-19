@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════╗
echo ║   📱 TimeFlow APK Builder (Windows) ║
echo ╚══════════════════════════════════════╝
echo.

:: Проверка Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js не установлен! Установите с https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js найден

:: Проверка Java
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Java не установлена! Установите JDK 17+
    pause
    exit /b 1
)
echo ✅ Java найдена

:: Проверка ANDROID_HOME
if "%ANDROID_HOME%"=="" (
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    ) else (
        echo ❌ ANDROID_HOME не установлен!
        echo Установите Android Studio и укажите ANDROID_HOME
        pause
        exit /b 1
    )
)
echo ✅ ANDROID_HOME: %ANDROID_HOME%

echo.
echo 📦 Шаг 1/5: Установка зависимостей...
call npm install

echo.
echo 🔨 Шаг 2/5: Сборка веб-приложения...
call npm run build

echo.
echo 📱 Шаг 3/5: Инициализация Capacitor...
if not exist "android" (
    echo    Добавляю Android-платформу...
    call npx cap add android
) else (
    echo    Android-платформа уже существует
)

echo.
echo 🔄 Шаг 4/5: Синхронизация файлов...
call npx cap sync android

echo.
echo 🏗️  Шаг 5/5: Сборка APK...
cd android
call gradlew.bat assembleDebug
cd ..

echo.
echo ╔══════════════════════════════════════╗
echo ║   ✅ APK успешно собран!             ║
echo ╚══════════════════════════════════════╝
echo.
echo 📍 Путь: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 💡 Установить на устройство:
echo    adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
