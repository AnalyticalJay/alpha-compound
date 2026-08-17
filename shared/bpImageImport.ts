export type BpImageAssignment = {
  fileName: string;
  productSlug: string;
};

export const BP_IMAGE_ASSIGNMENTS: readonly BpImageAssignment[] = [
  { fileName: "AOD960410BP.jpeg", productSlug: "bp-aod9604-10mg" },
  { fileName: "EPITHALON20BP.jpeg", productSlug: "bp-epithalon-20mg" },
  { fileName: "TB500BPPHARMA.jpeg", productSlug: "bp-tb500-10mg" },
  { fileName: "BPC15710BP.jpeg", productSlug: "bp-bpc-157-10mg" },
  { fileName: "PT14110BP.jpeg", productSlug: "bp-pt141-10mg" },
  { fileName: "MOTS-C10BP.jpeg", productSlug: "bp-mots-c-10mg" },
  { fileName: "SELANKBP.jpeg", productSlug: "bp-selank-10mg" },
  { fileName: "TESAMORELIN10BP.jpeg", productSlug: "bp-tesamorelin-10mg" },
  { fileName: "SEMAX10BPPHARMA.jpeg", productSlug: "bp-semax-10mg" },
];

export function validateBpImageAssignments(assignments: readonly BpImageAssignment[]) {
  const duplicateFiles = assignments.filter((assignment, index) => assignments.findIndex((candidate) => candidate.fileName === assignment.fileName) !== index);
  const duplicateProducts = assignments.filter((assignment, index) => assignments.findIndex((candidate) => candidate.productSlug === assignment.productSlug) !== index);
  return { duplicateFiles, duplicateProducts };
}
