export default {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'ID',
      type: 'number',
    },
    {
      name: 'img',
      title: 'Category Image',
      type: 'image',
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    },
    {
      name: 'parent',
      title: 'Parent Category',
      type: 'string',
    },
    {
      name: 'children',
      title: 'Child Categories',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'product_id',
      title: 'Product IDs',
      type: 'array',
      of: [{ type: 'number' }],
    },
  ],
} 