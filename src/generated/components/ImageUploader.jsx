import { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Image,
  FileUpload,
  Icon,
  Card,
  IconButton,
  AspectRatio
} from '@chakra-ui/react';
import { Upload, X, ImageIcon } from 'lucide-react';

const ImageUploader = ({ label, value, onChange, aspectRatio = '16/9' }) => {
  const [preview, setPreview] = useState(value);

  const handleFileChange = (details) => {
    const file = details.acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPreview(base64);
      onChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <VStack gap="2" align="stretch">
      <Text fontSize="sm" fontWeight="medium">
        {label}
      </Text>

      {preview ? (
        <Card.Root position="relative">
          <AspectRatio ratio={aspectRatio}>
            <Image src={preview} alt={label} objectFit="contain" borderRadius="md" />
          </AspectRatio>
          <IconButton position="absolute" top="2" right="2" size="sm" colorPalette="red" onClick={handleRemove}>
            <X size={16} />
          </IconButton>
        </Card.Root>
      ) : (
        <FileUpload.Root accept="image/*" maxFiles={1} onFileChange={handleFileChange}>
          <FileUpload.HiddenInput />
          <FileUpload.Dropzone
            p="4"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="border.muted"
            borderRadius="md"
            textAlign="center"
            minH="32"
            bg="bg.subtle"
            cursor="pointer"
            _hover={{ bg: 'bg.muted' }}
          >
            <AspectRatio ratio={aspectRatio}>
              <VStack gap="2">
                <Icon fontSize="2xl" color="fg.muted">
                  <Upload />
                </Icon>
                <VStack gap="1">
                  <Text fontSize="sm" fontWeight="medium">
                    {label}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    PNG, JPG, SVG
                  </Text>
                </VStack>
              </VStack>
            </AspectRatio>
          </FileUpload.Dropzone>
        </FileUpload.Root>
      )}
    </VStack>
  );
};

export default ImageUploader;

