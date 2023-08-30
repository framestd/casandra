import { Box, BoxProps, forwardRef, theme } from '@/chakra-ui/react';
import { css, keyframes } from '@emotion/react';

import { CSSProperties } from 'react';

export interface FlowBallsProps extends BoxProps {
  size?: number;
  count?: number;
}

const makeAnimation = ({ count, size }: Required<Omit<FlowBallsProps, keyof BoxProps>>) => {
  const animation = keyframes`
    0% { opacity: 0.4; transform: scale(1, 1); }
    50% { opacity: 1; transform: scale(1.2, 1.2); }
    100% { opacity: 0.4; transform: scale(1, 1); }
  `;

  const rules: { [x: string]: CSSProperties } = {};
  Array(count)
    .fill(0)
    .forEach((_, i) => {
      if (i < 1) return;
      rules[`&:nth-of-type(${i + 1})`] = { animationDelay: `${0.5 * i}s` };
    });

  const ball = css({
    background: 'currentColor',
    borderRadius: size,
    display: 'inline-block',
    height: size,
    width: size,
    marginRight: size,
    animation: `${animation} ${count * 0.5}s infinite ${theme.transition.easing['ease-in-out']}`,
    ...rules,
  });

  return ball;
};

export const FlowBalls = forwardRef<FlowBallsProps, 'div'>(({ count = 4, size = 5, ...rest }, ref) => {
  const dud = Array(count).fill(0);

  return (
    <Box width="full" display="flex" alignItems="center" justifyContent="center" ref={ref} {...rest}>
      {dud.map((_, i) => (
        <Box key={i} css={makeAnimation({ count, size })} />
      ))}
    </Box>
  );
});
