'use client';

import {
  BoxProps,
  ComponentStyleConfig,
  extendTheme,
  Input,
  NumberInput,
  Select,
  Textarea,
  ThemeConfig,
  withDefaultColorScheme,
} from '@/chakra-ui/react';

import { rgba } from 'polished';

import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

export const backdrop = {
  backdropFilter: 'auto',
  backdropBlur: 'xl',
  backdropSaturate: '180%',
};

export const backdropFactory = (
  opts?: Pick<BoxProps, 'backdropBlur' | 'backdropFilter' | 'backdropSaturate' | 'bgColor'>,
) => {
  return {
    ...backdrop,
    ...opts,
  };
};

const brand = {
  50: '#F9E6EB',
  100: '#F4CCD7',
  200: '#E999B0',
  300: '#DD6688',
  400: '#D23361',
  500: '#C70039',
  600: '#B30033',
  700: '#9F002E',
  800: '#8B0028',
  900: '#770022',
  text: {
    50: '#000000',
    100: '#000000',
    200: '#000000',
    300: '#000000',
    400: '#FFFFFF',
    500: '#FFFFFF',
    600: '#FFFFFF',
    700: '#FFFFFF',
    800: '#FFFFFF',
    900: '#FFFFFF',
  },
} as const;

const offwhite = '#F6F8FA';
const offwhiteAlpha = rgba(offwhite, 0.72);
const offblack = '#131417';
const offblackAlpha = rgba(offblack, 0.82);

const activeLabelStyles = (y = -12, scale = 0.675) => ({
  transform: `scale(${scale}) translateY(${y}px)`,
  fontWeight: 500,
  ms: `${scale / 2}rem`,
});

const TextComponentStyles: ComponentStyleConfig = {
  variants: {
    sedated: (props: StyleFunctionProps) => {
      return {
        color: props.colorMode === 'dark' ? 'whiteAlpha.700' : 'blackAlpha.700',
      };
    },
  },
  defaultProps: { as: 'div' },
};

const FormComponentStyles: ComponentStyleConfig = {
  parts: [],
  variants: {
    floating: {
      container: {
        _focusWithin: { label: { ...activeLabelStyles(-14) } },

        [`input:not(:placeholder-shown) + label:not([data-focus]),
        .chakra-select__wrapper + label:not([data-focus]),
        textarea:not(:placeholder-shown) ~ label:not([data-focus]),
        .chakra-input__group:has(input:not(:placeholder-shown)) + label:not([data-focus])`]: {
          ...activeLabelStyles(-14),
        },

        label: {
          mx: 0,
          my: 0,
          px: 4,
          top: 0,
          left: 0,
          zIndex: 2,
          height: 'full',
          alignItems: 'center',
          display: 'inline-flex',
          justifyContent: 'center',
          position: 'absolute',
          backgroundColor: 'transparent',
          fontWeight: 400,
          pointerEvents: 'none',
          transformOrigin: 'left top',
          fontSize: 'sm',
        },
      },
    },

    'flushed-floating': {
      container: {
        _focusWithin: { label: { ...activeLabelStyles(-14) } },

        [`input:not(:placeholder-shown) + label:not([data-focus]),
        .chakra-select__wrapper + label:not([data-focus]),
        textarea:not(:placeholder-shown) ~ label:not([data-focus]),
        .chakra-input__group:has(input:not(:placeholder-shown)) + label:not([data-focus])`]: {
          ...activeLabelStyles(-14),
        },

        label: {
          mx: 0,
          my: 0,
          top: 0,
          left: 0,
          zIndex: 2,
          height: 'full',
          fontSize: 'sm',
          fontWeight: 400,
          position: 'absolute',
          alignItems: 'center',
          pointerEvents: 'none',
          display: 'inline-flex',
          justifyContent: 'center',
          transformOrigin: 'left top',
          backgroundColor: 'transparent',
        },
      },
    },
  },
};

const TextStyles = {
  hero: {
    fontSize: { base: '5xl', md: '5xl', lg: '6xl', xl: '7xl' },
    fontWeight: { base: 500, md: 600 },
  },
  h1: {
    fontSize: { base: '3xl', md: '5xl', xl: '6xl' },
    fontWeight: 600,
  },
  h2: {
    fontSize: { base: '2xl', md: '4xl', xl: '5xl' },
    fontWeight: 600,
  },
  h3: {
    fontSize: { base: 'xl', md: '3xl', xl: '4xl' },
    fontWeight: 600,
  },
  h4: {
    fontSize: { base: 'md', md: '2xl', xl: '3xl' },
    fontWeight: 600,
  },
  h5: {
    fontSize: { base: 'sm', md: '2xl', xl: '3xl' },
    fontWeight: 600,
  },
  h6: {
    fontSize: { base: 'sm', md: 'xl', xl: '2xl' },
    fontWeight: 600,
  },

  'adaptive-xs-sm': {
    fontSize: { base: 'xs', md: 'sm' },
  },
  'adaptive-xs-sm-md': {
    fontSize: { base: 'xs', md: 'sm', xl: 'md' },
  },

  'adaptive-sm-md': {
    fontSize: { base: 'sm', md: 'md' },
  },
  'adaptive-sm-md-lg': {
    fontSize: { base: 'sm', md: 'md', xl: 'lg' },
  },

  'card-title': { fontSize: { xl: 'lg' }, fontWeight: 500 },
  'card-body': { fontSize: { xl: 'lg' }, fontWeight: 400 },
};

const config: ThemeConfig = { initialColorMode: 'system', useSystemColorMode: true };

export const theme = extendTheme(
  {
    config,
    breakpoints: { xs: '20em' },
    styles: { global: (props: any) => ({ body: { bg: mode('offwhite', 'offblack')(props) } }) },
    fonts: { body: 'Graphik' },
    colors: { offwhite, offwhiteAlpha, offblack, offblackAlpha, brand },
    shadows: { outline: '0 0 0 3px var(--chakra-colors-brand-500)' },
    textStyles: TextStyles,
    components: {
      Form: FormComponentStyles,
      Text: TextComponentStyles,
    },
  },
  withDefaultColorScheme({ colorScheme: 'brand' }),
);

Input.defaultProps = {
  ...Input.defaultProps,
  focusBorderColor: 'brand.500',
};

NumberInput.defaultProps = {
  ...NumberInput.defaultProps,
  focusBorderColor: 'brand.500',
};

Select.defaultProps = {
  ...Select.defaultProps,
  focusBorderColor: 'brand.500',
};

Textarea.defaultProps = {
  ...Textarea.defaultProps,
  focusBorderColor: 'brand.500',
};
