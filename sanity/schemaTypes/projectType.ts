import {defineField, defineType, Rule} from 'sanity'

import { imageField } from "@/util/image"

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
    defineField({
      title: 'Program',
      name: 'program',
      type: 'string',
      validation: (rule) => rule.required(),
      options: {
        list: [
          { title: 'Re-Fest', value: 'Re-Fest' },
          { title: 'Residency', value: 'Residency' },
          { title: 'Experiments in Digital Storytelling', value: 'Experiments in Digital Storytelling' },
        ],
      },
    }),
    defineField({
      title: 'Press Links',
      name: 'pressLinks',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Link',
          fields: [
            {
              name: 'label',
              type: 'string',
              title: 'Label',
              validation: (rule) => rule.required(),
            },
            {
              name: 'url',
              type: 'url',
              title: 'URL',
              validation: (rule) => rule.required(),
            }
          ],
        }
      ],
    }),
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
    defineField({
      title: 'Credits',
      name: "credits",
      type: "object",
      fields: [
        {
          title: 'Description',
          name: 'description',
          type: 'array',
          of: [{type: 'block'}],
        },
        {
          title: 'Locations',
          name: 'locations',
          type: 'array',
          of: [
            {
              title: 'Location',
              name: "location",
              type: "object",
              fields: [
                {
                  title: 'Name',
                  name: 'name',
                  type: 'string',
                },
                {
                  title: 'Description',
                  name: 'description',
                  type: 'array',
                  of: [{type: 'block'}],
                },
                {
                  title: 'Organizations',
                  name: "organizations",
                  type: "array",
                  of: [
                    {
                      title: 'Organization',
                      name: "organization",
                      type: "object",
                      fields: [
                        {
                          title: 'Name',
                          name: 'name',
                          type: 'string',
                        },
                        {
                          title: 'Description',
                          name: 'description',
                          type: 'array',
                          of: [{type: 'block'}],
                        },
                        {
                          title: 'Teams',
                          name: 'teams',
                          type: 'array',
                          of: [
                            {
                              title: "Team",
                              name: "team",
                              type: "object",
                              fields: [
                                {
                                  title: "Role",
                                  name: "role",
                                  type: "string",
                                },
                                {
                                  title: "People",
                                  name: "people",
                                  type: "string",
                                },
                              ],
                            }
                          ],
                        },
                      ]
                    },
                  ],
                },
              ],
            }
          ],
        },
      ],
    }),
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
