export default () => {
    import("~/utils/load.min").then(module => {
      module.default();
    });
  };
