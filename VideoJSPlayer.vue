<template>
  <div>
    <video-player :options="videoOptions" />
  </div>
</template>

<script>
import VideoPlayer from '~/components/VideoPlayer.vue';

export default {
  name: 'VideoExample',
  components: {
    VideoPlayer
  },
  data() {
    return {
      videoOptions: {
        autoplay: true,
        controls: true,
        sources: [
          {
            src: 'https://worker-daili.xun335610.workers.dev/bcdn_token=7jb1TZ8M7sktVOfFUWZRZ4UAJMFw-a3qZO0ypQj31dQ&expires=1698597965&token_path=%2F775d2bed-d30e-46c7-83d5-1b3964c98fb7%2F/775d2bed-d30e-46c7-83d5-1b3964c98fb7/1280x720/video.m3u8',
            type: 'application/x-mpegURL'
          }
        ]
      }
    };
  }
};
</script>
