/**
 * Shared motion/react mock factory for component tests.
 *
 * Strips Framer Motion-specific props so they don't leak into the DOM.
 */

const MOTION_PROPS = new Set([
  'initial', 'animate', 'exit', 'transition', 'variants',
  'whileHover', 'whileTap', 'whileInView', 'viewport',
  'onAnimationComplete', 'layout', 'layoutId',
]);

function stripMotionProps(props: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!MOTION_PROPS.has(key)) {
      clean[key] = value;
    }
  }
  return clean;
}

function makeMotionProxy(Tag: string) {
  return ({ children, ...props }: any) => {
    const El = Tag as any;
    return <El {...stripMotionProps(props)}>{children}</El>;
  };
}

export const motionMock = {
  motion: {
    div: makeMotionProxy('div'),
    p: makeMotionProxy('p'),
    h1: makeMotionProxy('h1'),
    a: makeMotionProxy('a'),
    button: makeMotionProxy('button'),
    span: makeMotionProxy('span'),
    section: makeMotionProxy('section'),
    nav: makeMotionProxy('nav'),
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => <>{children}</>,
};
