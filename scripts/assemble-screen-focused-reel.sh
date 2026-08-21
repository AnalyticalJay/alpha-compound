#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/ubuntu/alpha-compound"
ASSETS="/home/ubuntu/webdev-static-assets"
HOME="$ROOT/e2e/visual-baselines.spec.ts-snapshots/public-home-linux.png"
DETAIL="$ROOT/e2e/visual-baselines.spec.ts-snapshots/mobile-quote-detail-linux.png"
CHECKOUT="$ROOT/e2e/visual-baselines.spec.ts-snapshots/mobile-checkout-linux.png"
MUSIC="$ASSETS/anabolics-africa-launch-bed.mp3"
OUTPUT="$ASSETS/anabolics-africa-mobile-platform-launch-reel.mp4"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

ffmpeg -y \
  -loop 1 -t 4 -i "$HOME" \
  -loop 1 -t 4 -i "$DETAIL" \
  -loop 1 -t 4 -i "$DETAIL" \
  -loop 1 -t 5 -i "$DETAIL" \
  -loop 1 -t 3 -i "$HOME" \
  -stream_loop -1 -i "$MUSIC" \
  -filter_complex "
    [0:v]crop=506:900:934:0,scale=720:1280,setsar=1,trim=duration=4,setpts=PTS-STARTPTS[v0];
    [1:v]crop=390:693:0:0,scale=720:1280,setsar=1,trim=duration=4,setpts=PTS-STARTPTS[v1];
    [2:v]crop=390:693:0:810,scale=720:1280,setsar=1,trim=duration=4,setpts=PTS-STARTPTS[v2];
    [3:v]crop=390:693:0:2500,scale=720:1280,setsar=1,trim=duration=5,setpts=PTS-STARTPTS[v3];
    [4:v]crop=506:900:934:0,scale=720:1280,setsar=1,trim=duration=3,setpts=PTS-STARTPTS[v4];
    [v0][v1][v2][v3][v4]concat=n=5:v=1:a=0,
    drawbox=x=0:y=0:w=iw:h=5:color=0xE11D48@0.95:t=fill,
    drawbox=x=0:y=5:w=iw:h=3:color=0x0EA5E9@0.95:t=fill,
    drawtext=fontfile=$FONT:text='MEMBERS ONLY':fontcolor=white:fontsize=34:borderw=2:bordercolor=0x000000@0.75:x=(w-text_w)/2:y=90:enable='between(t,0,3.8)',
    drawtext=fontfile=$FONT:text='YOUR DASHBOARD':fontcolor=0x38BDF8:fontsize=32:borderw=2:bordercolor=0x000000@0.75:x=(w-text_w)/2:y=90:enable='between(t,4,7.8)',
    drawtext=fontfile=$FONT:text='TRACK EVERY STEP':fontcolor=white:fontsize=30:borderw=2:bordercolor=0x000000@0.75:x=(w-text_w)/2:y=90:enable='between(t,8,11.8)',
    drawtext=fontfile=$FONT:text='PAY SECURELY IN APP':fontcolor=0x38BDF8:fontsize=30:borderw=2:bordercolor=0x000000@0.75:x=(w-text_w)/2:y=90:enable='between(t,12,16.8)',
    drawtext=fontfile=$FONT:text='ANABOLICS AFRICA':fontcolor=white:fontsize=34:borderw=2:bordercolor=0x000000@0.75:x=(w-text_w)/2:y=1060:enable='between(t,17,19.8)',
    format=yuv420p[v];
    [5:a]atrim=duration=20,volume=0.36,afade=t=out:st=19:d=1[a]
  " \
  -map "[v]" -map "[a]" -t 20 -r 30 \
  -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k -movflags +faststart \
  "$OUTPUT"

ffprobe -v error -show_entries format=duration:stream=codec_type,width,height -of default=noprint_wrappers=1 "$OUTPUT"
