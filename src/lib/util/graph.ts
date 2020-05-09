import graph from "dependency-graph";

import { File } from "../File";

export const dependencyGraphFromFiles = (
  files: File[],
  circular: boolean = false // circular needs to be false in order to receive exceptions about it
) => {
  const fileGraph = new graph.DepGraph({ circular });

  // add all files and their respective imports as a node to the graph:
  files.forEach((file) => {
    fileGraph.addNode(file.getPath());
    // add imports
    file.getImports().forEach((i) => fileGraph.addNode(i));
  });

  // add dependencies to the graph
  files.forEach((file) => {
    file
      .getImports()
      .forEach((i) => fileGraph.addDependency(file.getPath(), i));
  });

  return fileGraph;
};
