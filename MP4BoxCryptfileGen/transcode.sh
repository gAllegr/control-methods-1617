# Override paths to FFMPEG tools here
ffmpeg=ffmpeg
ffprobe=ffprobe

function usage {
  echo ""
  echo "Transcode/Transrate Script"
  echo "usage:"
  echo "   video_scaled_demux_5bitrates  "
}

if [ -z $1 ]; then
  echo "Must provide input media file"
  usage
  exit 1
fi
if [ -z $2 ]; then
  echo "Must provide output directory for transcoded/transrated files"
  usage
  exit 1
fi

mkdir -p $2

framerate=$((`./ffprobe $1 -select_streams v -show_entries stream=avg_frame_rate -v quiet -of csv="p=0"`))

function transcode_video {
  vbitrate=$1
  res=$2
  profile=$3
  level=$4
  outdir=$5
  infile=$6
  outfile=video_${infile}_`echo $res | sed 's/:/x/'`_h264-${vbitrate}.mp4

  $ffmpeg -i $infile -s $res -map_chapters -1 -maxrate $vbitrate -minrate $vbitrate -bufsize $vbitrate -an -codec:v libx264 -profile:v $profile -level $level -b:v $vbitrate -x264opts "keyint=$framerate:min-keyint=$framerate:no-scenecut" $outdir/$outfile
}

function transcode_audio {
  abitrate=$1
  outdir=$2
  infile=$3
  outfile=audio_${infile}_aac-lc_${abitrate}.mp4

  $ffmpeg -i $infile -map_chapters -1 -vn -codec:a libfdk_aac -profile:a aac_low -b:a $abitrate $outdir/$outfile
}

transcode_video "360k" "512:288" "main" 30 $2 $1
transcode_video "620k" "704:396" "main" 30 $2 $1
transcode_video "1340k" "896:504" "high" 31 $2 $1
transcode_video "2500k" "1280:720" "high" 32 $2 $1
transcode_video "4500k" "1920:1080" "high" 40 $2 $1

transcode_audio "128k" $2 $1
transcode_audio "192k" $2 $1
