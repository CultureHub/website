import {defineField, defineType, Rule} from 'sanity'

import { imageField } from "@/util/image"
import { linksField } from "@/util/link"
import { programField } from "@/util/program"
import { creditFields } from "@/schemaTypes/shared/creditFields"

export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      title: 'Title',
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'People',
      name: 'people',
      type: 'string',
      description: 'Optional display value for the People column. Falls back to associated artists if empty.',
    }),
    defineField({
      title: 'Date',
      name: 'date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'End Date',
      name: 'endDate',
      type: 'date',
      // TODO clarify if this should be more flexible
      description: 'Add this date if the project took place over multiple days',
    }),
    defineField(imageField({
      title: 'Hero Image',
      name: 'heroImage',
    })),
    defineField({
      title: 'Description',
      name: 'description',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      title: 'Locations',
      name: 'locations',
      type: 'array',
      of: [{type: 'string'}],
      validation: (rule) => rule.required(),
    }),
    defineField({...programField({
        title: 'Program',
        name: 'program',
      }),
      validation: (rule: Rule) => rule.required(),
    }),
    defineField(linksField({
      title: 'Press Links',
      name: 'pressLinks',
    })),
    defineField({
      title: 'Content',
      name: "content",
      type: "array",
      of: [
        {
          type: 'object',
          title: "Single Image",
          name: "singleImage",
          preview: {
            select: {
              title: "image.alt",
              media: "image",
            }
          },
          fields: [
            imageField({
              name: "image",
              title: "Image",
            }),
          ],
        },
        {
          type: 'object',
          title: "Two Images",
          name: "twoImages",
          preview: {
            select: {
              title: "image1.alt",
              media: "image1",
            }
          },
          fields: [
            imageField({
              name: "image1",
              title: "First Image",
            }),
            imageField({
              name: "image2",
              title: "Second Image",
            }),
          ],
        },
        {
          type: 'object',
          title: "Image and Text",
          name: "imageAndText",
          fields: [
            imageField({
              name: "image",
              title: "Image",
            }),
            {
              title: 'Text',
              name: 'text',
              type: 'array',
              of: [{type: 'block'}],
            },
          ],
        },
        {
          type: 'object',
          title: "Text and Image",
          name: "textAndImage",
          fields: [
            {
              title: 'Text',
              name: 'text',
              type: 'array',
              of: [{type: 'block'}],
            },
            imageField({
              name: "image",
              title: "Image",
            }),
          ],
        },
      ],
    }),
    ...creditFields,
    defineField({
      title: 'Related',
      name: "related",
      type: "array",
      of: [
        {
          type: "reference",
          to: [
            { type: "artist" },
            { type: "project" },
          ],
        },
      ],
    }),
  ],
});
