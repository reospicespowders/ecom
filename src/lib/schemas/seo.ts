const seoSchema = {
  name: 'seo',
  title: 'SEO Metadata',
  type: 'object',
  fields: [
    {
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Title used for search engines and browsers. Should be between 50-60 characters.',
      validation: (Rule: any) => Rule.max(60).warning('Meta title should be under 60 characters')
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      description: 'Description for search engines. Should be between 120-160 characters.',
      validation: (Rule: any) => Rule.max(160).warning('Meta description should be under 160 characters')
    },
    {
      name: 'ogTitle',
      title: 'Social Media Title',
      type: 'string',
      description: 'Title used when sharing on social media'
    },
    {
      name: 'ogDescription',
      title: 'Social Media Description',
      type: 'text',
      description: 'Description used when sharing on social media'
    },
    {
      name: 'ogImage',
      title: 'Social Media Image',
      type: 'image',
      description: 'Image used when sharing on social media (1200x630px recommended)'
    },
    {
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description: 'The canonical URL for this page'
    },
    {
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords for search engines'
    },
    {
      name: 'robots',
      title: 'Robots Meta',
      type: 'object',
      fields: [
        {
          name: 'index',
          title: 'Allow Indexing',
          type: 'boolean',
          initialValue: true
        },
        {
          name: 'follow',
          title: 'Allow Following',
          type: 'boolean',
          initialValue: true
        }
      ]
    }
  ]
}

export default seoSchema; 