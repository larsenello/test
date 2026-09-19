#!/bin/bash

# ============================================================
# 🎨 Генерация иконок для Android из SVG
# ============================================================
# Требует: npm install -g sharp-cli (или используйте онлайн-конвертер)
# ============================================================

set -e

echo "🎨 Генерация иконок Android..."

# Проверка наличия SVG
if [ ! -f "public/icon.svg" ]; then
    echo "❌ public/icon.svg не найден!"
    exit 1
fi

# Проверка наличия Android-проекта
if [ ! -d "android" ]; then
    echo "❌ Android-проект не инициализирован. Запустите: npx cap add android"
    exit 1
fi

# Размеры иконок для Android
declare -A SIZES=(
    ["mipmap-mdpi"]=48
    ["mipmap-hdpi"]=72
    ["mipmap-xhdpi"]=96
    ["mipmap-xxhdpi"]=144
    ["mipmap-xxxhdpi"]=192
)

# Адаптивная иконка (foreground)
declare -A ADAPTIVE=(
    ["mipmap-mdpi"]=108
    ["mipmap-hdpi"]=162
    ["mipmap-xhdpi"]=216
    ["mipmap-xxhdpi"]=324
    ["mipmap-xxxhdpi"]=432
)

# Проверка наличия rsvg-convert или imagemagick
if command -v rsvg-convert &> /dev/null; then
    CONVERTER="rsvg"
    echo "✅ Используем rsvg-convert"
elif command -v convert &> /dev/null; then
    CONVERTER="magick"
    echo "✅ Используем ImageMagick"
else
    echo "⚠️  Не найден rsvg-convert или ImageMagick."
    echo "   Установите: sudo apt install librsvg2-bin"
    echo "   Или: sudo apt install imagemagick"
    echo ""
    echo "🌐 Альтернатива: используйте онлайн-конвертер"
    echo "   https://icon.kitchen/ — загрузите SVG и скачайте Android-иконки"
    echo "   https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html"
    exit 1
fi

# Генерация иконок
for folder in "${!SIZES[@]}"; do
    size=${SIZES[$folder]}
    output_dir="android/app/src/main/res/$folder"
    mkdir -p "$output_dir"
    
    if [ "$CONVERTER" = "rsvg" ]; then
        rsvg-convert -w $size -h $size public/icon.svg -o "$output_dir/ic_launcher.png"
        rsvg-convert -w $size -h $size public/icon.svg -o "$output_dir/ic_launcher_round.png"
    else
        convert -background none public/icon.svg -resize ${size}x${size} "$output_dir/ic_launcher.png"
        convert -background none public/icon.svg -resize ${size}x${size} "$output_dir/ic_launcher_round.png"
    fi
    
    echo "  ✅ $folder (${size}x${size})"
done

# Генерация адаптивных иконок (foreground)
for folder in "${!ADAPTIVE[@]}"; do
    size=${ADAPTIVE[$folder]}
    output_dir="android/app/src/main/res/$folder"
    mkdir -p "$output_dir"
    
    if [ "$CONVERTER" = "rsvg" ]; then
        rsvg-convert -w $size -h $size public/icon.svg -o "$output_dir/ic_launcher_foreground.png"
    else
        convert -background none public/icon.svg -resize ${size}x${size} "$output_dir/ic_launcher_foreground.png"
    fi
done

echo ""
echo "✅ Иконки сгенерированы!"
echo ""
echo "💡 Также создайте фоновый цвет в:"
echo "   android/app/src/main/res/values/ic_launcher_background.xml"
echo ""
echo "   <resources>"
echo "     <color name=\"ic_launcher_background\">#0a0a0f</color>"
echo "   </resources>"
