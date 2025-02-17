import React, { useState } from 'react';

import Lottie from './lottie';

import { IAnimationProps } from './animations.interface';

const Animation = ({
  children,
  renderProps,
  width = 24,
  speed = 1,
  direction = 1,
  frames,
  animationData,
  autoplay = false,
  loop = false,
  prerender = false,
}: IAnimationProps) => {
  const [startFrame, setStartFrame] = useState(frames.start);
  const [endFrame, setEndFrame] = useState(frames.end);

  const clickHandler = () => {
    setStartFrame(frames.clickStart);
    setEndFrame(frames.clickEnd);
  };

  const handleMouseHover = () => {
    setStartFrame(frames.hoverStart);
    setEndFrame(frames.hoverEnd);
  };

  const handleMouseLeave = () => {
    setStartFrame(frames.blurStart);
    setEndFrame(frames.blurEnd);
  };

  const defaultOptions: any = {
    renderer: 'svg',
    loop: loop,
    autoplay: autoplay,
    prerender: prerender,
    animationData: animationData?.default || animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet',
    },
  };

  // create lottie component with neccessary props
  const LottieAnimation = (
    <Lottie
      defaultOptions={defaultOptions}
      width={width}
      isStopped={false}
      isPaused={false}
      speed={speed}
      segments={[startFrame, endFrame]}
      direction={direction}
    />
  );

  if (renderProps) {
    return (
      <>{children && typeof children === 'function' ? children({
        Lottie: LottieAnimation,
        clickHandler,
        handleMouseHover,
        handleMouseLeave,
      }) : children}</>
    );
  }

  return (
    <div
      onClick={clickHandler}
      onMouseEnter={handleMouseHover}
      onMouseLeave={handleMouseLeave}
    >
      {LottieAnimation}
      {children}
    </div>
  );
};

export default Animation;
