import React, { useRef, useEffect } from "react";

import lottie, {
  AnimationEventName,
  AnimationItem,
} from "lottie-web";

import { ILottieProps } from "./animations.interface";

const Lottie = ({
  eventListeners = [],
  height,
  width,
  isStopped = false,
  isPaused = false,
  speed = 1,
  segments,
  direction = 1,
  ariaRole = "img",
  ariaLabel = "animation",
  isClickToPauseDisabled = false,
  title = "",
  style = {},
  defaultOptions = {
    loop: true,
    autoplay: true,
    renderer: "svg",
    rendererSettings: {},
  },
}: ILottieProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const animationInstance = useRef<AnimationItem | null>(null);

  useEffect(() => {
    const setupAnimation = () => {
      if (elementRef.current && !animationInstance.current) {
        const options = {
          container: elementRef.current,
          renderer: defaultOptions.renderer,
          loop: defaultOptions.loop,
          autoplay: defaultOptions.autoplay,
          animationData: defaultOptions.animationData,
          rendererSettings: defaultOptions.rendererSettings,
        };
        animationInstance.current = lottie.loadAnimation(options);
        eventListeners.forEach(({ eventName, callback }) => {
          animationInstance.current?.addEventListener(
            eventName as AnimationEventName,
            callback
          );
        });
      }
    };

    const destroyAnimation = () => {
      if (animationInstance.current) {
        eventListeners.forEach(({ eventName, callback }) => {
          animationInstance.current?.removeEventListener(
            eventName as AnimationEventName,
            callback
          );
        });
        animationInstance.current.destroy();
        animationInstance.current = null;
      }
    };

    setupAnimation();

    return destroyAnimation;
  }, [defaultOptions, eventListeners]);

  useEffect(() => {
    const updateAnimationState = () => {
      if (animationInstance.current) {
        if (isStopped) {
          animationInstance.current.stop();
        } else if (isPaused) {
          animationInstance.current.pause();
        } else {
          animationInstance.current.play();
        }
      }
    };

    if (animationInstance.current && segments) {
      animationInstance.current.playSegments(segments, true);
    }

    updateAnimationState();

    if (animationInstance.current) {
      animationInstance.current.setSpeed(speed);
      animationInstance.current.setDirection(direction);
    }
  }, [isStopped, isPaused, speed, direction, segments]);

  // generate container size
  const getSize = (initial: string | number | undefined): string => {
    return typeof initial === "number" ? `${initial}px` : initial || "100%";
  };

  // animation container styles
  const lottieStyles: React.CSSProperties = {
    width: getSize(width),
    height: getSize(height),
    overflow: "hidden",
    margin: "0 auto",
    outline: "none",
    ...style,
  };

  // handle click events to pause or play animation.
  const handleClick = () => {
    if (!isClickToPauseDisabled && animationInstance.current) {
      animationInstance.current.isPaused
        ? animationInstance.current.play()
        : animationInstance.current.pause();
    }
  };

  return (
    <div
      ref={elementRef}
      style={lottieStyles}
      onClick={handleClick}
      title={title}
      role={ariaRole}
      aria-label={ariaLabel}
      tabIndex={0}
    />
  );
};

export default Lottie;
