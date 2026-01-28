export const SubPage = {
  FORM: "form",
  ENTITIES: "entities",
  DATA_PAGE: "data_page",
} as const;

export type SubPage = typeof SubPage[keyof typeof SubPage];