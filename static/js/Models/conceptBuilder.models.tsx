export interface Tag {
    childOrder: number;
    children: Tag[];
    id: number;
    parentId: number | null;
    title: string;
    TAG?: number;
}

export interface GetTagsResponse {
    TAG: number;
    childOrder: number;
    parent: number;
    tagName: string;
}
