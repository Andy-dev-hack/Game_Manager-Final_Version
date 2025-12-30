/**
 * split-context.js
 * Codemod to split unified Context into Context.tsx and Provider.tsx
 *
 * Usage: npx jscodeshift -t codemod/split-context.js src/features/auth/AuthContext.tsx
 *
 * IMPORTANT: This is an advanced automation tool using jscodeshift.
 * It does NOT execute any git commands.
 *
 * Note: This is an optional alternative to the manual scripts.
 * The manual scripts (split-context.js) are simpler and recommended.
 */

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find Provider component export
  const providerExport = root.find(j.ExportNamedDeclaration, {
    declaration: {
      type: "VariableDeclaration",
      declarations: [
        {
          id: { name: /Provider$/ },
        },
      ],
    },
  });

  if (providerExport.length === 0) {
    console.log("No Provider found in file");
    return fileInfo.source;
  }

  // Extract Provider component
  const providerNode = providerExport.get().value;
  const providerName = providerNode.declaration.declarations[0].id.name;

  console.log(`Found Provider: ${providerName}`);

  // Remove Provider from original file
  providerExport.remove();

  // Return modified Context file (without Provider)
  const contextContent = root.toSource();

  console.log("Provider removed from Context file");
  console.log("Note: You need to manually create the Provider.tsx file");
  console.log(`with the ${providerName} component`);

  return contextContent;
};
