import { Box, BoxProps, Flex, FlexProps, HStack, StackProps, VStack } from '@/chakra-ui/react';

import { Merge } from '@/core/utils';

import { HTMLMotionProps, motion } from 'framer-motion';
import { RefAttributes } from 'react';

import { Typography, TypographyProps } from '../Typography';

export type MotionBoxProps = Merge<BoxProps, HTMLMotionProps<'div'>> & RefAttributes<any>;
export type MotionFlexProps = Merge<FlexProps, HTMLMotionProps<'div'>> & RefAttributes<any>;
export type MotionTextProps = Merge<TypographyProps, HTMLMotionProps<'div'>> & RefAttributes<any>;
export type MotionStackProps = Merge<StackProps, HTMLMotionProps<'div'>> & RefAttributes<any>;

export const MotionBox = motion(Box);
export const MotionFlex = motion(Flex);
export const MotionText = motion(Typography);
export const MotionHStack = motion(HStack);
export const MotionVStack = motion(VStack);
