export default {
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    { name: 'name', title: 'Reviewer Name', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'email', title: 'Reviewer Email', type: 'string' },
    { name: 'comment', title: 'Comment', type: 'text', validation: (Rule: any) => Rule.required() },
    { name: 'rating', title: 'Rating', type: 'number', validation: (Rule: any) => Rule.required().min(1).max(5) },
    { name: 'product', title: 'Product', type: 'reference', to: [{ type: 'product' }], validation: (Rule: any) => Rule.required() },
    { name: 'approved', title: 'Approved', type: 'boolean', initialValue: false },
    { name: 'createdAt', title: 'Created At', type: 'datetime', initialValue: () => new Date().toISOString() },
  ],
}; 