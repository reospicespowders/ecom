const categorySchema = {
  name: 'category',
  title: 'Category',
  type: 'document',
  groups: [
    {
      name: 'basic',
      title: 'Basic Information',
      default: true
    },
    {
      name: 'media',
      title: 'Media'
    },
    {
      name: 'structure',
      title: 'Category Structure'
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
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'basic',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      group: 'basic',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'basic'
    },

    // Media
    {
      name: 'img',
      title: 'Category Image',
      type: 'image',
      group: 'media',
      options: {
        hotspot: true
      }
    },
    {
      name: 'banner',
      title: 'Category Banner',
      type: 'image',
      group: 'media',
      options: {
        hotspot: true
      }
    },

    // Category Structure
    {
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'structure'
    },
    {
      name: 'children',
      title: 'Child Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      group: 'structure'
    },
    {
      name: 'product_id',
      title: 'Product IDs',
      type: 'array',
      of: [{ type: 'number' }],
      group: 'structure'
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      group: 'structure',
      initialValue: 0
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      group: 'structure',
      initialValue: true
    },

    // SEO & Metadata
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo'
    }
  ],
  preview: {
    select: {
      title: 'name',
      media: 'img',
      parent: 'parent.name'
    },
    prepare({ title, media, parent }: any) {
      return {
        title,
        subtitle: parent ? `Child of ${parent}` : 'Parent Category',
        media
      }
    }
  }
}

export default categorySchema; 