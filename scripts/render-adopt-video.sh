#!/usr/bin/env bash
# Render the adopt-a-hive banner photo into a seamless looping video.
# Turns public/images/home/adopt-bee.webp into public/videos/adopt-hive.{webm,mp4}
# with a slow Ken Burns drift, a sunlight glint sweep, and gentle light breathing.
# Requires: ffmpeg (brew install ffmpeg) + node/sharp (already a project dep).
#
#   bash scripts/render-adopt-video.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/videos

SRC=public/images/home/adopt-bee.webp
GOLD=/tmp/adopt-gold.png
GLINT=/tmp/glint.png
FWD=/tmp/adopt-fwd.mp4

# 1) Flatten the transparent source onto the banner gold (#f1ac10) so edges fade
#    into the band instead of going black in the (alpha-less) video.
node -e "require('sharp')('$SRC').flatten({background:{r:241,g:172,b:16}}).resize(1400,933,{fit:'cover'}).png().toFile('$GOLD').then(()=>console.log('source ready'))"

# 2) Soft diagonal white glint strip (alpha) for the moving light sweep.
node -e "const sharp=require('sharp');const svg='<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"420\" height=\"1000\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"white\" stop-opacity=\"0\"/><stop offset=\"0.5\" stop-color=\"white\" stop-opacity=\"0.55\"/><stop offset=\"1\" stop-color=\"white\" stop-opacity=\"0\"/></linearGradient></defs><g transform=\"skewX(-10)\"><rect x=\"-60\" y=\"-50\" width=\"480\" height=\"1100\" fill=\"url(#g)\"/></g></svg>';sharp(Buffer.from(svg)).png().toFile('$GLINT').then(()=>console.log('glint ready'))"

# 3) Forward pass: Ken Burns zoom/pan + moving glint + light breathing.
ffmpeg -hide_banner -loglevel error -y \
  -loop 1 -t 14 -i "$GOLD" \
  -loop 1 -t 14 -i "$GLINT" \
  -filter_complex "
    [0:v]fps=24,scale=1400:933,setsar=1,
      crop='1400-200*min(t/14,1)':'(1400-200*min(t/14,1))*2/3':'(1400-(1400-200*min(t/14,1)))/2+22*sin(t*0.55)':'(933-((1400-200*min(t/14,1))*2/3))/2+15*sin(t*0.48)',
      scale=1200:800[kb];
    [1:v]fps=24,format=rgba[gl];
    [kb][gl]overlay=x='-420 + mod(t*150,1700)':y=0:format=auto,
      hue=b='0.10*sin(2*PI*t/9)',
      format=yuv420p[v]
  " -map "[v]" -an -c:v libx264 -crf 16 -preset medium "$FWD"

# 4) Boomerang (forward + reverse) for a seamless loop, encode WebM + MP4.
REV="[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1,format=yuv420p[v]"
ffmpeg -hide_banner -loglevel error -y -i "$FWD" -filter_complex "$REV" \
  -map "[v]" -an -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -pix_fmt yuv420p public/videos/adopt-hive.webm
ffmpeg -hide_banner -loglevel error -y -i "$FWD" -filter_complex "$REV" \
  -map "[v]" -an -c:v libx264 -crf 25 -preset slow -movflags +faststart -pix_fmt yuv420p public/videos/adopt-hive.mp4

echo "done -> public/videos/adopt-hive.{webm,mp4}"
