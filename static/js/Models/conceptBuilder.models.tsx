export interface FolderViewState {
  tags: Tag[];
  tagAddInput: string;
  tagDeleteInput: string;
  tagsFromServer: GetTagsResponse[];
}
export interface Tag {
  childOrder: number;
  children: Tag[];
  id: number;
  parentId: number;
  title: string;
  TAG?: number;
}
export interface GetTagsResponse {
  TAG: number;
  childOrder: number;
  parent: number;
  tagName: string;
}
