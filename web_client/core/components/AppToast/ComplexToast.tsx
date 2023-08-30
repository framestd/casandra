'use client';

import {
  Button,
  Circle,
  Divider,
  HStack,
  Icon,
  IconButton,
  SystemStyleObject,
  useColorModeValue,
  VStack,
} from '@/chakra-ui/react';

import { ThemeTypings } from '@chakra-ui/styled-system';
import { Variants } from 'framer-motion';
import { rgba } from 'polished';
import { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

import { MotionText } from '../Common';
import { Typography } from '../Typography';
import { type AppToastProps, type AppToastType } from './AppToast';
import { useToastIcons } from './hooks';
import { getThemeColor } from '@/core/utils';

export interface ComplexToastAction {
  name: string;
  action?: () => void;
  type?: AppToastType;
}

export interface ComplexToastProps extends Omit<AppToastProps, 'variant'> {
  actions?: Array<ComplexToastAction>;
}

export const ComplexToast = ({ actions, icon, message, title, type = 'default', closeToast }: ComplexToastProps) => {
  const modalBgColor = useColorModeValue('offwhiteAlpha', 'offblackAlpha');
  const zerothStackBgColor = useColorModeValue('offwhite', 'offblack');

  const [messageView, setMessageView] = useState<'expanded' | 'collapsed'>('collapsed');
  const [noOfLines, setNoOfLines] = useState(2);

  const icons = useToastIcons();

  const buttonColorSchemes: Record<AppToastType, [ThemeTypings['colors'], ThemeTypings['colors']]> = {
    default: [useColorModeValue('gray.100', 'whiteAlpha.200'), 'inherit'],
    success: ['green.500', 'white'],
    error: ['red.500', 'white'],
    info: ['blue.500', 'white'],
    warn: ['yellow.500', 'black'],
  };

  const faded: SystemStyleObject = {
    content: "''",
    px: 4,
    textAlign: 'right',
    bottom: 0,
    right: 0,
    position: 'absolute',
    width: 52,
    height: '50%',
    bgGradient: `linear(to-l, ${modalBgColor} 60%, transparent)`,
    filter: 'blur(7px)',
  };

  const messageVariant: Variants = {
    collapsed: (custom: number) => {
      const lnHeight = parseFloat(getComputedStyle(document.body).getPropertyValue('--chakra-lineHeights-base'));

      return {
        maxHeight: lnHeight * 16 * custom,
        transition: { type: 'keyframes', duration: 1 },
      };
    },
    expanded: (custom: number) => {
      const lnHeight = parseFloat(getComputedStyle(document.body).getPropertyValue('--chakra-lineHeights-base'));

      return {
        maxHeight: lnHeight * 16 * custom,
        transition: { type: 'keyframes', duration: 1 },
      };
    },
  };

  return (
    <VStack
      alignItems="flex-start"
      boxShadow="lg"
      bgColor={modalBgColor}
      backdropSaturate="180%"
      backdropFilter="auto"
      backdropBlur="xl"
      borderRadius="2xl"
      _hover={{ bgColor: rgba(getThemeColor(zerothStackBgColor), 0.8) }}
    >
      <HStack width="full" px={3} pt={3}>
        {icon ? icon : <Icon as={icons[type].icon} color={icons[type].color} fontSize="xl" />}

        <Typography flexGrow={1} fontWeight={500}>
          {title}
        </Typography>

        <Circle
          as={IconButton}
          aria-label="close"
          colorScheme="gray"
          icon={<Icon as={IoCloseOutline} />}
          variant="ghost"
          height={6}
          minWidth={6}
          onClick={() => closeToast?.()}
        />
      </HStack>

      <Divider />

      <MotionText
        variant="sedated"
        width="full"
        position="relative"
        overflow="hidden"
        fontSize="sm"
        px={3}
        noOfLines={noOfLines}
        custom={messageView === 'collapsed' ? 2 : 5}
        variants={messageVariant}
        initial="collapsed"
        animate={messageView}
        _after={noOfLines < 5 ? faded : undefined}
        onMouseOver={() => setMessageView('expanded')}
        onMouseLeave={() => setMessageView('collapsed')}
        onAnimationComplete={(def) => def === 'collapsed' && setNoOfLines(2)}
        onAnimationStart={(def) => def === 'expanded' && setNoOfLines(5)}
      >
        {message}
      </MotionText>

      <HStack width="full" justifyContent="flex-end" px={3} pb={3} flexWrap="wrap" rowGap={2}>
        {actions?.map(({ name, type = 'default' }) => {
          const [bgColor, color] = buttonColorSchemes[type];

          return (
            <Button
              key={name}
              borderRadius="lg"
              colorScheme={(bgColor as string).split('.').at(0)}
              bgColor={bgColor}
              color={color}
              fontWeight={400}
              size="sm"
            >
              {name}
            </Button>
          );
        })}
      </HStack>
    </VStack>
  );
};
