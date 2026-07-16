import { defineField } from 'sanity'

export const creditFields = [
  defineField({
    title: 'Credits',
    name: 'credits',
    type: 'object',
    fields: [
      {
        title: 'Description',
        name: 'description',
        type: 'array',
        of: [{ type: 'block' }],
      },
      {
        title: 'Locations',
        name: 'locations',
        type: 'array',
        of: [
          {
            title: 'Location',
            name: 'creditLocation',
            type: 'object',
            fields: [
              {
                title: 'Location Name',
                name: 'name',
                type: 'string',
              },
              {
                title: 'Description',
                name: 'description',
                type: 'array',
                of: [{ type: 'block' }],
              },
              {
                title: 'Credit Groups',
                name: 'groups',
                type: 'array',
                of: [
                  {
                    title: 'Credit Group',
                    name: 'creditGroup',
                    type: 'object',
                    fields: [
                      {
                        title: 'Group Name',
                        name: 'name',
                        type: 'string',
                      },
                      {
                        title: 'Description',
                        name: 'description',
                        type: 'array',
                        of: [{ type: 'block' }],
                      },
                      {
                        title: 'Credits',
                        name: 'items',
                        type: 'array',
                        of: [
                          {
                            title: 'Credit',
                            name: 'creditItem',
                            type: 'object',
                            fields: [
                              {
                                title: 'Role',
                                name: 'role',
                                type: 'string',
                              },
                              {
                                title: 'People',
                                name: 'people',
                                type: 'text',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
]
