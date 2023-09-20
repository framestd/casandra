import { ChangeEvent, useState } from 'react';

import {
  forwardRef,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputLeftElementProps,
  InputProps,
  InputRightElement,
  useColorModeValue,
} from '@/chakra-ui/react';

import { IconType } from 'react-icons';
import { IoArrowUndoOutline } from 'react-icons/io5';
import { MdOutlineFileDownloadDone } from 'react-icons/md';
import { useThemeConstants } from '@/core/composition/hooks';

export interface EmbeddableProps extends InputProps {
  _ps?: InputProps['ps'];
  _height: string;
  _value: string;
  _LeftIcon?: IconType;
  _LeftIconProps?: InputLeftElementProps;
  onRestore?: () => void;
  onRevise?: (changes: string) => void;
}

export const EmbeddableRevisionInput = forwardRef<EmbeddableProps, 'input'>((props: EmbeddableProps, ref) => {
  const { _ps, _height, _value, _LeftIconProps, _LeftIcon, onRestore, onRevise, ...rest } = props;

  const colorScheme = useColorModeValue('blackAlpha', 'whiteAlpha');

  const { blended_c, blended_active_bg, blended_hover_bg } = useThemeConstants();

  const [changes, setChanges] = useState(() => _value);

  const isDisabled = changes === _value || changes.trim() === '';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setChanges(e.target.value);
  const restore = () => {
    setChanges(_value);
    onRestore?.();
  };

  const handleRevision = () => onRevise?.(changes.trim());

  return (
    <InputGroup size="sm" height={_height} sx={{ '--input-height': _height }}>
      <InputLeftElement {..._LeftIconProps} width={_ps}>
        <Icon as={_LeftIcon} fontSize="lg" />
      </InputLeftElement>

      <Input
        autoFocus={true}
        borderColor="transparent"
        focusBorderColor="transparent"
        fontWeight="600"
        value={changes}
        onChange={handleChange}
        sx={{ ps: _ps, pe: 16, '--input-height': _height }}
        ref={ref}
        {...rest}
      />

      <InputRightElement width={16}>
        <IconButton
          size="sm"
          aria-label="Edit conversation title"
          variant="ghost"
          borderRadius="full"
          colorScheme={colorScheme}
          color={blended_c}
          bgColor="transparent"
          icon={<Icon as={IoArrowUndoOutline} fontSize="md" />}
          _hover={{ bgColor: blended_hover_bg }}
          _active={{ bgColor: blended_active_bg }}
          onClick={restore}
        />

        <IconButton
          size="sm"
          aria-label="Save"
          variant="ghost"
          borderRadius="full"
          colorScheme={colorScheme}
          color={blended_c}
          bgColor="transparent"
          icon={<Icon as={MdOutlineFileDownloadDone} fontSize="lg" />}
          _hover={{ bgColor: blended_hover_bg }}
          _active={{ bgColor: blended_active_bg }}
          isDisabled={isDisabled}
          onClick={handleRevision}
        />
      </InputRightElement>
    </InputGroup>
  );
});
