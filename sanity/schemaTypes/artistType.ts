import {defineField, defineType} from 'sanity'

import { imageField } from '@/util/image';
import { linksField } from "@/util/link"
import { programField } from "@/util/program"

export const artistType = defineType({
  name: 'artist',
  title: 'Artist',
  type: 'document',
  fields: [
    defineField({
      title: 'Name',
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: "Slug",
      name: 'slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField(imageField({
      title: 'Image',
      name: 'image',
    })),
    defineField({
      title: "Bio",
      name: 'bio',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      title: "Project Statement",
      name: 'projectStatement',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField(linksField({
      title: "Links",
      name: 'links',
    })),
    defineField(programField({
      title: 'Program',
      name: 'program',
    })),
    defineField({
      title: "Location",
      name: 'location',
      type: 'string',
    }),
    defineField({
      name: 'projects',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'project' }],
      }],
    }),
    // TODO add other media type references
  ],
})
