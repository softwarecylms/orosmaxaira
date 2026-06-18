#!/usr/bin/env bash
# Build the adopt-a-hive banner loop from real honeybee macro footage.
# Produces public/videos/adopt-hive.{webm,mp4} + adopt-hive-poster.jpg.
#
# Footage: Pexels #7174859 ("Close-up view of bees in a honeycomb"), Pexels
# License — free for commercial use, no attribution required.
# https://www.pexels.com/video/close-up-view-of-bees-in-a-honeycomb-7174859/
#
# We grade it slightly brighter/warmer to match the brand photo (adopt-bee.webp),
# crop 16:9 -> 3:2, scale down, and boomerang a short segment into a seamless
# loop. Requires ffmpeg (brew install ffmpeg).
#
#   bash scripts/render-adopt-video.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/videos

SRC=/tmp/bees-7174859.mp4
FWD=/tmp/bees-fwd.mp4
URL="https://videos.pexels.com/video-files/7174859/7174859-uhd_2560_1440_30fps.mp4"

[ -f "$SRC" ] || curl -sL "$URL" -o "$SRC"

# Forward segment: 7s. Wide 3:1 band using the FULL source width (pulled back —
# matches the short/wide banner region so object-cover crops minimally), with a
# punchy contrast grade.
ffmpeg -hide_banner -loglevel error -y -ss 3 -t 7 -i "$SRC" \
  -vf "fps=24,crop=2560:853:0:293,scale=1440:480,setsar=1,eq=brightness=0.02:contrast=1.32:saturation=1.07:gamma=1.0,format=yuv420p" \
  -an -c:v libx264 -crf 18 -preset medium "$FWD"

# Boomerang (forward + reverse) for a seamless loop, encode WebM + MP4 + poster.
REV="[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1,format=yuv420p[v]"
ffmpeg -hide_banner -loglevel error -y -i "$FWD" -filter_complex "$REV" \
  -map "[v]" -an -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -pix_fmt yuv420p public/videos/adopt-hive.webm
ffmpeg -hide_banner -loglevel error -y -i "$FWD" -filter_complex "$REV" \
  -map "[v]" -an -c:v libx264 -crf 28 -preset slow -movflags +faststart -pix_fmt yuv420p public/videos/adopt-hive.mp4
ffmpeg -hide_banner -loglevel error -y -i "$FWD" -frames:v 1 -q:v 4 public/videos/adopt-hive-poster.jpg

echo "done -> public/videos/adopt-hive.{webm,mp4} + poster"
