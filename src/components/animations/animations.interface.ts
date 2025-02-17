import {
  AnimationDirection,
  AnimationSegment
} from 'lottie-web';

export interface IFrameSet {
  start: number;
  end: number;
  clickStart: number;
  clickEnd: number;
  hoverStart: number;
  hoverEnd: number;
  blurStart: number;
  blurEnd: number;
}

export interface IAnimationProps {
  children?: any;
  renderProps?: boolean;
  width?: number;
  speed?: number;
  direction?: AnimationDirection;
  frames: IFrameSet;
  animationData: any;
  autoplay?: boolean;
  loop?: boolean;
  prerender?: boolean;
}

export interface IEventListener {
  eventName: string;
  callback: () => void;
}

export interface IDefaultOptions {
  loop?: boolean;
  autoplay?: boolean;
  renderer?: "svg" | "canvas" | "html";
  rendererSettings?: object;
  animationData?: any;
}

export interface ILottieProps {
  eventListeners?: IEventListener[];
  height?: string | number;
  width?: string | number;
  isStopped?: boolean;
  isPaused?: boolean;
  speed?: number;
  segments?: AnimationSegment | AnimationSegment[];
  direction?: AnimationDirection;
  ariaRole?: string;
  ariaLabel?: string;
  isClickToPauseDisabled?: boolean;
  title?: string;
  style?: React.CSSProperties;
  defaultOptions?: IDefaultOptions;
}