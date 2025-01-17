describe("import/export", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("simple dig", () => {
    it("imports and shows the correct export value", () => {
      const template = "#dig\nd,d,d\nd,d,d";
      cy.getId("import").click();
      cy.getId({ name: "import-text", item: "dig" }).type(template);
      cy.getId("import-all").click();
      cy.getId("export").click();
      cy.getId({ name: "export-text", item: "dig" }).should(
        "have.value",
        template,
      );
    });
  });

  describe("multi-phase", () => {
    it("imports and shows the correct export value", () => {
      const digTemplate = "#dig\nd,d,d\nd,d,d\nd,d,d";
      const buildTemplate = "#build\n~,b,~";
      cy.getId("import").click();
      cy.getId({ name: "import-text", item: "dig" }).type(digTemplate);
      cy.getId({ name: "import-text", item: "build" }).type(buildTemplate);
      cy.getId("import-all").click();
      cy.getId("export").click();
      cy.getId({ name: "export-text", item: "dig" }).should(
        "have.value",
        digTemplate,
      );
      cy.getId({ name: "export-text", item: "build" }).should(
        "have.value",
        "#build\n~,b,~\n~,~,~\n~,~,~",
      );
    });
  });

  describe("adjustments", () => {
    it("imports and shows the correct export value", () => {
      const digTemplate = "#dig\nd,d,d\nd,d,d\nd,d,d";
      const buildTemplate = "#build\n~,b,~";
      const queryTemplate = "#query\n~,r++,~";
      cy.getId("import").click();
      cy.getId({ name: "import-text", item: "dig" }).type(digTemplate, {
        delay: 0,
      });
      cy.getId({ name: "import-text", item: "build" }).type(buildTemplate, {
        delay: 0,
      });
      cy.getId({ name: "import-text", item: "query" }).type(queryTemplate, {
        delay: 0,
      });
      cy.getId("import-all").click();
      cy.getId("export").click();
      cy.getId({ name: "export-text", item: "dig" }).should(
        "have.value",
        digTemplate,
      );
      cy.getId({ name: "export-text", item: "build" }).should(
        "have.value",
        "#build\n~,b,~\n~,~,~\n~,~,~",
      );
      cy.getId({ name: "export-text", item: "query" }).should(
        "have.value",
        "#query\n~,r++,~\n~,~,~\n~,~,~",
      );
    });
  });

  describe("bad imports", () => {
    it("skips invalid tiles", () => {
      const digTemplate = "#dig\nf,d,d,d,~,~";
      const buildTemplate = "#build\n~,b,J,b,~,b";
      const queryTemplate = "#query\n~,f--,~,r++,x--,~";
      cy.getId("import").click();
      cy.getId({ name: "import-text", item: "dig" }).type(digTemplate, {
        delay: 0,
      });
      cy.getId({ name: "import-text", item: "build" }).type(buildTemplate, {
        delay: 0,
      });
      cy.getId({ name: "import-text", item: "query" }).type(queryTemplate, {
        delay: 0,
      });
      cy.getId("import-all").click();
      cy.getId("export").click();
      cy.getId({ name: "export-text", item: "dig" }).should(
        "have.value",
        "#dig\nd,d,d",
      );
      cy.getId({ name: "export-text", item: "build" }).should(
        "have.value",
        "#build\nb,~,b",
      );
      cy.getId({ name: "export-text", item: "query" }).should(
        "have.value",
        "#query\n~,~,r++",
      );
    });
  });
});
