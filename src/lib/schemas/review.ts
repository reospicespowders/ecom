import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({
      name: 'reviewerName',
      title: 'Reviewer Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reviewerEmail',
      title: 'Reviewer Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'comment',
      title: 'Comment',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    {
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{ type: 'product' }],
      validation: (Rule: any) => Rule.required(),
    },
    defineField({
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      initialValue: false,
      description: 'Reviews must be approved before appearing on the website.',
    }),
  ],
  preview: {
    select: {
      reviewer: 'reviewerName',
      product: 'product.title',
      rating: 'rating',
      approved: 'approved',
    },
    prepare(selection) {
      const { reviewer, product, rating, approved } = selection;
      return {
        title: `${reviewer} - ${rating} stars`,
        subtitle: `${product ? `Product: ${product}` : 'No Product'} ${approved ? '(Approved)' : '(Pending)'}`,
      };
    },
  },
}); 