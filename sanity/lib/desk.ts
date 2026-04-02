import type { StructureBuilder } from "sanity/structure";

export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title("The Spidaverse")
    .items([
      S.listItem()
        .title("Currently Consuming")
        .schemaType("currentlyConsuming")
        .child(
          S.document()
            .schemaType("currentlyConsuming")
            .documentId("currentlyConsuming")
            .title("Currently Consuming")
        ),
      S.divider(),
      S.listItem()
        .title("Articles")
        .schemaType("article")
        .child(S.documentTypeList("article").title("Articles")),
      S.divider(),
      S.listItem()
        .title("Collections")
        .schemaType("collection")
        .child(S.documentTypeList("collection").title("Collections")),
      S.listItem()
        .title("Journal")
        .schemaType("mediaDiary")
        .child(S.documentTypeList("mediaDiary").title("Journal")),
      S.divider(),
      S.listItem()
        .title("Media Library")
        .schemaType("media")
        .child(S.documentTypeList("media").title("Media")),
      S.listItem()
        .title("Gallery")
        .schemaType("galleryPiece")
        .child(S.documentTypeList("galleryPiece").title("Gallery")),
      S.divider(),
      S.listItem()
        .title("Categories")
        .schemaType("category")
        .child(S.documentTypeList("category").title("Categories")),
      S.listItem()
        .title("Tags")
        .schemaType("tag")
        .child(S.documentTypeList("tag").title("Tags")),
    ]);
