import React, { Component } from 'react'
import styled from 'styled-components'

class Cheat extends Component {
  async componentDidMount() {
    this.video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })

    this.loop()
  }

  loop = () => {
    if (!this.canvas) return
    const ctx = this.canvas.getContext('2d')
    ctx.drawImage(this.video, 0, 0, 500, 500)
    setTimeout(this.loop, 100)
  }

  render() {
    return (
      <div {...this.props}>
        <video ref={ref => this.video = ref} autoPlay muted playsInline />
        <canvas ref={ref => this.canvas = ref} width={500} height={500} />
      </div>
    )
  }
}

export default styled(Cheat)`
  video {
    position: absolute;
    top: 50px;
    left: 50px;
    width: 1px;
    height: 1px;
  }

  canvas {
    width: 100vw;
    height: 100vh;
  }
`
