export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'ID',
      type: 'number',
    },
    {
      name: 'sku',
      title: 'SKU',
      type: 'string',
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
    },
    {
      name: 'sale_price',
      title: 'Sale Price',
      type: 'number',
    },
    {
      name: 'image',
      title: 'Main Image',
      type: 'object',
      fields: [
        {
          name: 'id',
          title: 'Image ID',
          type: 'number',
        },
        {
          name: 'original',
          title: 'Original Image',
          type: 'image',
        },
        {
          name: 'thumbnail',
          title: 'Thumbnail Image',
          type: 'image',
        },
      ],
    },
    {
      name: 'category',
      title: 'Category',
      type: 'object',
      fields: [
        {
          name: 'parent',
          title: 'Parent Category',
          type: 'string',
        },
        {
          name: 'child',
          title: 'Child Category',
          type: 'string',
        },
      ],
    },
    {
      name: 'quantity',
      title: 'Quantity',
      type: 'number',
    },
    {
      name: 'unit',
      title: 'Unit',
      type: 'string',
    },
    {
      name: 'gallery',
      title: 'Gallery Images',
      type: 'array',
      of: [{ type: 'image' }],
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'videoId',
      title: 'Video ID',
      type: 'string',
    },
    {
      name: 'orderQuantity',
      title: 'Order Quantity',
      type: 'number',
    },
    {
      name: 'productInfoList',
      title: 'Product Info List',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'additionalInfo',
      title: 'Additional Info',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'key', type: 'string' },
            { name: 'value', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'reviews',
      title: 'Reviews',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'number' },
            { name: 'name', type: 'string' },
            { name: 'comment', type: 'text' },
            { name: 'rating', type: 'number' },
            { name: 'user', type: 'image' },
            { name: 'date', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
    },
    {
      name: 'sold',
      title: 'Sold',
      type: 'number',
    },
    {
      name: 'created_at',
      title: 'Created At',
      type: 'datetime',
    },
    {
      name: 'updated_at',
      title: 'Updated At',
      type: 'datetime',
    },
    {
      name: 'color',
      title: 'Colors',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'offerDate',
      title: 'Offer Date',
      type: 'object',
      fields: [
        {
          name: 'startDate',
          title: 'Start Date',
          type: 'datetime',
        },
        {
          name: 'endDate',
          title: 'End Date',
          type: 'datetime',
        },
      ],
    },
  ],
} 