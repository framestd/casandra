module.exports = {
  // multipass: true,
  plugins: [
    {
      name: 'preset-default',
    },
    {
      name: 'removeAttributesBySelector',
      params: {
        selector: 'svg',
        attributes: ['xml:space', 'id'],
      },
    },
    {
      name: 'removeAttributesBySelector',
      params: {
        selector: 'path',
        attributes: ['stroke'],
      },
    },
    {
      name: 'sortAttrs',
    },
    {
      name: 'removeAttrs',
      params: {
        attrs: ['data-*', 'data.*'],
      },
    },
    {
      name: 'removeDimensions',
    },
    {
      name: 'convertStyleToAttrs',
      params: {
        keepImportant: true,
      },
    },
  ],
};
