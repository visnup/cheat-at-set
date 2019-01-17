export default {
  size(video) {
    const track = video.srcObject.getVideoTracks()[0]
    return track.getSettings()
  },

  canvas({ width, height }) {
    const c = document.createElement('canvas')
    c.width = width
    c.height = height
    return c
  }
}
