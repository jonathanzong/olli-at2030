import { OlliDatum } from "../Types";

/**
 * Meta-data information to what kind of node is currently visited
 */
export type NodeType = "chart" | "xAxis" | "yAxis" | "data" | "filteredData" | "legend" | "grid" | "multiView";


export type EncodingFilterValue = string | [number | Date, number | Date];
export type GridFilterValue = [EncodingFilterValue, EncodingFilterValue];
export type FilterValue = EncodingFilterValue | GridFilterValue;

/**
 * A {@link AccessibilityTreeNode} represents an location in an accessible structure.
 * type: The {@link NodeType} of this element
 * parent: The node's parent {@link AccessibilityTreeNode}
 * selected: The filtered data that is selected at this location in the tree
 * description: The text description of this node that is rendered to the user
 * children: The list of child {@link AccessibilityTreeNode}s of this element
 * tableKeys: a list of fields that should be included as columns in any tabular representation of this node
 * gridIndex: if this node represents a cell in a grid view, the row/column coordinates of the cell *
 */
export type AccessibilityTreeNode = {
    type: NodeType,
    parent: AccessibilityTreeNode | null,
    selected: OlliDatum[],
    description: string,
    children: AccessibilityTreeNode[]
    tableKeys?: string[],
    filterValue?: FilterValue,
    gridIndex?: {
      i: number,
      j: number
    },
}

/**
 * A {@link AccessibilityTree} is a tree representation of a visualization.
 * root: The root {@link AccessibilityTreeNode} of the tree
 * fieldsUsed: The data fields that are used by encodings (assists with rendering data tables)
 */
export type AccessibilityTree = {
    root: AccessibilityTreeNode,
    fieldsUsed: string[]
}
