// export type Iri = string;
export type Iri = string & { readonly __brand: unique symbol };
export type Label = string;
export type Triple = {
  subject: string;
  predicate: string;
  object: string;
};
