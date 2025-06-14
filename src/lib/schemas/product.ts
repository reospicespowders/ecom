const productSchema = {
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    {
      name: 'basic',
      title: 'Basic Information',
      default: true
    },
    {
      name: 'media',
      title: 'Media & Gallery'
    },
    {
      name: 'pricing',
      title: 'Pricing & Inventory'
    },
    {
      name: 'details',
      title: 'Product Details'
    },
    {
      name: 'seo',
      title: 'SEO & Metadata'
    }
  ],
  fields: [
    // Basic Information
    {
      name: 'id',
      title: 'ID',
      type: 'number',
      group: 'basic',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'sku',
      title: 'SKU',
      type: 'string',
      group: 'basic',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'basic',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      group: 'basic',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
      group: 'basic'
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Draft', value: 'draft' },
          { title: 'Archived', value: 'archived' }
        ]
      },
      group: 'basic',
      initialValue: 'draft'
    },

    // Media & Gallery
    {
      name: 'image',
      title: 'Main Image',
      type: 'image',
      group: 'media',
      options: {
        hotspot: true
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      group: 'media'
    },
    {
      name: 'videoId',
      title: 'YouTube Video ID',
      type: 'string',
      group: 'media'
    },

    // Pricing & Inventory
    {
      name: 'price',
      title: 'Regular Price',
      type: 'number',
      group: 'pricing',
      validation: (Rule: any) => Rule.required().min(0)
    },
    {
      name: 'sale_price',
      title: 'Sale Price',
      type: 'number',
      group: 'pricing',
      validation: (Rule: any) => Rule.min(0)
    },
    {
      name: 'quantity',
      title: 'Quantity',
      type: 'number',
      group: 'pricing',
      validation: (Rule: any) => Rule.required().min(0)
    },
    {
      name: 'unit',
      title: 'Unit',
      type: 'string',
      group: 'pricing',
      options: {
        list: [
          { title: 'Piece', value: 'piece' },
          { title: 'Kilogram', value: 'kg' },
          { title: 'Gram', value: 'g' },
          { title: 'Liter', value: 'l' },
          { title: 'Milliliter', value: 'ml' }
        ]
      }
    },
    {
      name: 'sold',
      title: 'Units Sold',
      type: 'number',
      group: 'pricing',
      initialValue: 0
    },
    {
      name: 'orderQuantity',
      title: 'Minimum Order Quantity',
      type: 'number',
      group: 'pricing',
      initialValue: 1
    },

    // Product Details
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block'
        },
        {
          type: 'image',
          options: { hotspot: true }
        }
      ],
      group: 'details'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'details'
    },
    {
      name: 'reviews',
      title: 'Reviews',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'review' }] }],
      group: 'details',
      readOnly: true,
    },
    {
      name: 'productInfoList',
      title: 'Product Information',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string'
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string'
            }
          ]
        }
      ],
      group: 'details'
    },
    {
      name: 'additionalInfo',
      title: 'Additional Information',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string'
            },
            {
              name: 'content',
              title: 'Content',
              type: 'array',
              of: [{ type: 'block' }]
            }
          ]
        }
      ],
      group: 'details'
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'details'
    },
    {
      name: 'color',
      title: 'Color',
      type: 'string',
      group: 'details'
    },
    {
      name: 'offerDate',
      title: 'Offer Date',
      type: 'object',
      fields: [
        {
          name: 'start',
          title: 'Start Date',
          type: 'datetime'
        },
        {
          name: 'end',
          title: 'End Date',
          type: 'datetime'
        }
      ],
      group: 'details'
    },

    // SEO & Metadata
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo'
    },

    // Timestamps
    {
      name: 'created_at',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'updated_at',
      title: 'Updated At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      price: 'price',
      status: 'status'
    },
    prepare({ title, media, price, status }: any) {
      return {
        title,
        subtitle: `${status} - $${price}`,
        media
      }
    }
  }
}

export default productSchema; 