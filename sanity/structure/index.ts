import type { StructureResolver } from 'sanity/structure'

const SINGLETONS = ['artAndTechnologyPage']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Art & Technology Page')
        .child(
          S.document()
            .schemaType('artAndTechnologyPage')
            .documentId('artAndTechnologyPage'),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !SINGLETONS.includes(listItem.getId() as string),
      ),
    ])
