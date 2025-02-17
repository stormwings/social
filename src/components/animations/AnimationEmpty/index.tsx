import React from 'react'
import Animation from './../animation'
import animationData from "./animation-empty.json";

const AnimationEmpty = () => (
  <Animation
    animationData={animationData}
    width={300}
    autoplay={true}
    loop={true}
    prerender={true}
    frames={{
      start: 0,
      end: 0,
      clickStart: 0,
      clickEnd: 0,
      hoverStart: 0,
      hoverEnd: 0,
      blurStart: 0,
      blurEnd: 0,
    }}
    // frames={{
    //   start: 0,
    //   end: 480,
    //   clickStart: 0,
    //   clickEnd: 480,
    //   hoverStart: 0,
    //   hoverEnd: 480,
    //   blurStart: 0,
    //   blurEnd: 480,
    // }}
  />
)

export default AnimationEmpty
